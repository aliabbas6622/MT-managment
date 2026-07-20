type EntityType = "employee" | "attendance" | "leave" | "department" | "expense" | "audit_log";
type SyncAction = "create" | "update" | "delete";
type SyncStatus = "pending" | "synced" | "failed";

interface SyncQueueItem {
  id: string;
  entityType: EntityType;
  entityId: number;
  action: SyncAction;
  payload: Record<string, unknown>;
  status: SyncStatus;
  retryCount: number;
  lastAttempt: string | null;
  createdAt: string;
}

interface SyncStatusInfo {
  pending: number;
  synced: number;
  failed: number;
  lastSync: string | null;
}

let syncInterval: ReturnType<typeof setInterval> | null = null;
const SYNC_INTERVAL_MS = 30000;
const MAX_RETRY_DELAY = 30000;
const BASE_RETRY_DELAY = 1000;
const MAX_RETRY_COUNT = 5;
const STORAGE_KEY = "malirTonight_syncQueue";
const LAST_SYNC_KEY = "malirTonight_lastSync";

function detectOnlineStatus(): boolean {
  return navigator.onLine;
}

function getSyncQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSyncQueue(queue: SyncQueueItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function addToSyncQueue(
  entityType: EntityType,
  entityId: number,
  action: SyncAction,
  payload: Record<string, unknown>
): void {
  const queue = getSyncQueue();
  const item: SyncQueueItem = {
    id: generateId(),
    entityType,
    entityId,
    action,
    payload,
    status: "pending",
    retryCount: 0,
    lastAttempt: null,
    createdAt: new Date().toISOString(),
  };
  queue.push(item);
  saveSyncQueue(queue);
}

function getRetryDelay(retryCount: number): number {
  const delay = Math.min(BASE_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
  return delay + Math.random() * 1000;
}

async function processSyncQueue(): Promise<void> {
  if (!detectOnlineStatus()) return;

  const queue = getSyncQueue();
  const pendingItems = queue.filter((item) => item.status === "pending");

  if (pendingItems.length === 0) return;

  const grouped = pendingItems.reduce<Record<EntityType, SyncQueueItem[]>>(
    (acc, item) => {
      if (!acc[item.entityType]) acc[item.entityType] = [];
      acc[item.entityType].push(item);
      return acc;
    },
    {} as Record<EntityType, SyncQueueItem[]>
  );

  for (const [entityType, items] of Object.entries(grouped)) {
    for (const item of items) {
      try {
        await sendToCloud(entityType as EntityType, item);

        const idx = queue.findIndex((q) => q.id === item.id);
        if (idx !== -1) {
          queue[idx].status = "synced";
          queue[idx].lastAttempt = new Date().toISOString();
        }
      } catch (error) {
        const idx = queue.findIndex((q) => q.id === item.id);
        if (idx !== -1) {
          queue[idx].retryCount += 1;
          queue[idx].lastAttempt = new Date().toISOString();

          if (queue[idx].retryCount >= MAX_RETRY_COUNT) {
            queue[idx].status = "failed";
          }
        }
      }
    }
  }

  const cleanedQueue = queue.filter(
    (item) => item.status === "pending" || item.status === "failed"
  );
  saveSyncQueue(cleanedQueue);

  if (pendingItems.length > 0) {
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  }
}

async function sendToCloud(entityType: EntityType, item: SyncQueueItem): Promise<void> {
  const delay = getRetryDelay(item.retryCount);
  await new Promise((resolve) => setTimeout(resolve, delay));

  const cloudEndpoint = `https://api.malir-tonight.com/sync/${entityType}`;

  const response = await fetch(cloudEndpoint, {
    method: item.action === "delete" ? "DELETE" : item.action === "create" ? "POST" : "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entityId: item.entityId,
      action: item.action,
      payload: item.payload,
      timestamp: item.createdAt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }
}

async function syncFromCloud(): Promise<void> {
  if (!detectOnlineStatus()) return;

  const entityTypes: EntityType[] = [
    "employee",
    "attendance",
    "leave",
    "department",
    "expense",
  ];

  for (const entityType of entityTypes) {
    try {
      const cloudEndpoint = `https://api.malir-tonight.com/sync/${entityType}/pull`;
      const response = await fetch(cloudEndpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        await mergeCloudData(entityType, data);
      }
    } catch {
      // Silently fail for pull operations
    }
  }

  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
}

async function mergeCloudData(entityType: EntityType, cloudData: Record<string, unknown>[]): Promise<void> {
  const localData = JSON.parse(localStorage.getItem(`malirTonight_${entityType}s`) || "[]");

  const merged = cloudData.reduce<Record<number, Record<string, unknown>>>((acc, item) => {
    const id = (item as { id: number }).id;
    acc[id] = item;
    return acc;
  }, {});

  for (const localItem of localData) {
    const cloudItem = merged[localItem.id as number];
    if (cloudItem) {
      const localTime = new Date(localItem.updatedAt || 0).getTime();
      const cloudTime = new Date((cloudItem as { updatedAt?: string }).updatedAt || 0).getTime();

      if (cloudTime > localTime) {
        merged[localItem.id as number] = cloudItem;
      } else {
        merged[localItem.id as number] = localItem;
      }
    } else {
      merged[localItem.id as number] = localItem;
    }
  }

  const finalData = Object.values(merged);
  localStorage.setItem(`malirTonight_${entityType}s`, JSON.stringify(finalData));
}

function getSyncStatus(): SyncStatusInfo {
  const queue = getSyncQueue();
  const pending = queue.filter((item) => item.status === "pending").length;
  const synced = queue.filter((item) => item.status === "synced").length;
  const failed = queue.filter((item) => item.status === "failed").length;
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);

  return { pending, synced, failed, lastSync };
}

function startSyncWorker(): void {
  if (syncInterval) return;

  syncInterval = setInterval(async () => {
    if (detectOnlineStatus()) {
      await processSyncQueue();
      await syncFromCloud();
    }
  }, SYNC_INTERVAL_MS);

  processSyncQueue();
  syncFromCloud();
}

function stopSyncWorker(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

export {
  detectOnlineStatus,
  addToSyncQueue,
  processSyncQueue,
  syncFromCloud,
  getSyncStatus,
  startSyncWorker,
  stopSyncWorker,
};

export type { EntityType, SyncAction, SyncStatus, SyncQueueItem, SyncStatusInfo };

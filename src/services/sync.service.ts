type EntityType = "employee" | "attendance" | "leave" | "department" | "expense" | "audit_log";
type SyncAction = "create" | "update" | "delete";
type SyncStatus = "pending" | "synced" | "failed";

interface SyncQueueItem {
  id: string;
  entityType: EntityType;
  entityId: string;
  action: SyncAction;
  payload: Record<string, unknown>;
  status: SyncStatus;
  retryCount: number;
  lastAttempt: string | null;
  createdAt: string;
  version: number;
}

interface SyncStatusInfo {
  pending: number;
  synced: number;
  failed: number;
  lastSync: string | null;
  isOnline: boolean;
}

type SyncCallback = (status: SyncStatusInfo) => void;

let syncInterval: ReturnType<typeof setInterval> | null = null;
let retryTimeouts: ReturnType<typeof setTimeout>[] = [];
const SAFETY_NET_INTERVAL_MS = 60000;
const API_BASE = "https://api.malir-tonight.com";
const MAX_RETRY_DELAY = 30000;
const BASE_RETRY_DELAY = 1000;
const MAX_RETRY_COUNT = 5;
const STORAGE_KEY = "malirTonight_syncQueue";
const LAST_SYNC_KEY = "malirTonight_lastSync";
const VERSION_KEY = "malirTonight_versions";
const listeners: Set<SyncCallback> = new Set();

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
  notifyListeners();
}

function getEntityVersion(entityType: EntityType, entityId: string): number {
  try {
    const raw = localStorage.getItem(VERSION_KEY);
    const versions: Record<string, number> = raw ? JSON.parse(raw) : {};
    return versions[`${entityType}:${entityId}`] || 0;
  } catch {
    return 0;
  }
}

function incrementEntityVersion(entityType: EntityType, entityId: string): number {
  const current = getEntityVersion(entityType, entityId);
  const newVersion = current + 1;
  try {
    const raw = localStorage.getItem(VERSION_KEY);
    const versions: Record<string, number> = raw ? JSON.parse(raw) : {};
    versions[`${entityType}:${entityId}`] = newVersion;
    localStorage.setItem(VERSION_KEY, JSON.stringify(versions));
  } catch {
    // Ignore
  }
  return newVersion;
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function notifyListeners(): void {
  const status = getSyncStatus();
  listeners.forEach((cb) => cb(status));
}

function addToSyncQueue(
  entityType: EntityType,
  entityId: string,
  action: SyncAction,
  payload: Record<string, unknown>
): void {
  const version = incrementEntityVersion(entityType, entityId);
  const queue = getSyncQueue();
  const existingIndex = queue.findIndex(
    (item) => item.entityType === entityType && item.entityId === entityId && item.status === "pending"
  );

  const item: SyncQueueItem = {
    id: generateId(),
    entityType,
    entityId,
    action,
    payload: { ...payload, version },
    status: "pending",
    retryCount: 0,
    lastAttempt: null,
    createdAt: new Date().toISOString(),
    version,
  };

  if (existingIndex !== -1) {
    queue[existingIndex] = item;
  } else {
    queue.push(item);
  }

  saveSyncQueue(queue);
  processSyncQueue();
}

function getRetryDelay(retryCount: number): number {
  return Math.min(BASE_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
}

async function processSyncQueue(): Promise<void> {
  if (!detectOnlineStatus()) return;

  const queue = getSyncQueue();
  const pendingItems = queue.filter((item) => item.status === "pending");

  if (pendingItems.length === 0) return;

  for (const item of pendingItems) {
    try {
      await sendToCloud(item);

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
        } else {
          const delay = getRetryDelay(queue[idx].retryCount);
          const timeout = setTimeout(() => processSyncQueue(), delay);
          retryTimeouts.push(timeout);
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

async function sendToCloud(item: SyncQueueItem): Promise<void> {
  const cloudEndpoint = `${API_BASE}/sync/${item.entityType}`;

  const response = await fetch(cloudEndpoint, {
    method: item.action === "delete" ? "DELETE" : item.action === "create" ? "POST" : "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entityId: item.entityId,
      action: item.action,
      payload: item.payload,
      timestamp: item.createdAt,
      version: item.version,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 409 && (body as { conflict?: boolean }).conflict) {
      await handleConflictResolution(item, body as { serverVersion?: number; serverData?: Record<string, unknown> });
      return;
    }
    throw new Error(`Sync failed: ${response.status}`);
  }
}

async function handleConflictResolution(
  item: SyncQueueItem,
  serverResponse: { serverVersion?: number; serverData?: Record<string, unknown> }
): Promise<void> {
  const serverVersion = serverResponse.serverVersion || 0;
  const localVersion = item.version;

  if (serverVersion > localVersion) {
    const localData = JSON.parse(localStorage.getItem(`malirTonight_${item.entityType}s`) || "[]");
    const updated = localData.map((record: Record<string, unknown>) =>
      record.id === item.entityId ? { ...record, ...serverResponse.serverData } : record
    );
    localStorage.setItem(`malirTonight_${item.entityType}s`, JSON.stringify(updated));
  } else if (localVersion >= serverVersion) {
    await sendToCloud({ ...item, retryCount: 0 });
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
      const cloudEndpoint = `${API_BASE}/sync/${entityType}/pull`;
      const response = await fetch(cloudEndpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        await mergeCloudData(entityType, data as Record<string, unknown>[]);
      }
    } catch {
      // Silently fail for pull operations
    }
  }

  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  notifyListeners();
}

async function mergeCloudData(entityType: EntityType, cloudData: Record<string, unknown>[]): Promise<void> {
  const localData = JSON.parse(localStorage.getItem(`malirTonight_${entityType}s`) || "[]");

  const merged = new Map<string, Record<string, unknown>>();

  for (const item of localData) {
    merged.set(String(item.id), item);
  }

  for (const cloudItem of cloudData) {
    const id = String(cloudItem.id);
    const localItem = merged.get(id);

    if (localItem) {
      const localVersion = getEntityVersion(entityType, id);
      const cloudVersion = (cloudItem as { version?: number }).version || 0;

      if (cloudVersion > localVersion) {
        merged.set(id, cloudItem);
      }
    } else {
      merged.set(id, cloudItem);
    }
  }

  const finalData = Array.from(merged.values());
  localStorage.setItem(`malirTonight_${entityType}s`, JSON.stringify(finalData));
}

function getSyncStatus(): SyncStatusInfo {
  const queue = getSyncQueue();
  const pending = queue.filter((item) => item.status === "pending").length;
  const synced = queue.filter((item) => item.status === "synced").length;
  const failed = queue.filter((item) => item.status === "failed").length;
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);

  return { pending, synced, failed, lastSync, isOnline: detectOnlineStatus() };
}

function onSyncStatusChange(callback: SyncCallback): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function startSyncWorker(): void {
  if (syncInterval) return;

  window.addEventListener("online", () => {
    notifyListeners();
    processSyncQueue();
  });
  window.addEventListener("offline", () => {
    notifyListeners();
  });

  syncInterval = setInterval(async () => {
    if (detectOnlineStatus()) {
      await processSyncQueue();
      await syncFromCloud();
    }
  }, SAFETY_NET_INTERVAL_MS);

  processSyncQueue();
  syncFromCloud();
}

function stopSyncWorker(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  retryTimeouts.forEach(clearTimeout);
  retryTimeouts = [];
}

export {
  detectOnlineStatus,
  addToSyncQueue,
  processSyncQueue,
  syncFromCloud,
  getSyncStatus,
  onSyncStatusChange,
  startSyncWorker,
  stopSyncWorker,
};

export type { EntityType, SyncAction, SyncStatus, SyncQueueItem, SyncStatusInfo };

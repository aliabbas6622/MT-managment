import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Cloud, CloudOff, Check, AlertCircle } from "lucide-react";
import {
  detectOnlineStatus,
  getSyncStatus,
  processSyncQueue,
  type SyncStatusInfo,
} from "../services/sync.service";

type SyncState = "syncing" | "synced" | "failed" | "offline";

export default function SyncIndicator() {
  const [isOnline, setIsOnline] = useState(detectOnlineStatus());
  const [syncInfo, setSyncInfo] = useState<SyncStatusInfo>(getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshStatus = useCallback(() => {
    setIsOnline(detectOnlineStatus());
    setSyncInfo(getSyncStatus());
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(refreshStatus, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [refreshStatus]);

  const getSyncState = (): SyncState => {
    if (!isOnline) return "offline";
    if (isSyncing) return "syncing";
    if (syncInfo.failed > 0) return "failed";
    if (syncInfo.pending > 0) return "syncing";
    return "synced";
  };

  const handleForceSync = async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    try {
      await processSyncQueue();
      refreshStatus();
    } catch {
      // silent
    } finally {
      setIsSyncing(false);
    }
  };

  const state = getSyncState();

  const stateConfig: Record<SyncState, { color: string; icon: typeof Cloud; label: string }> = {
    syncing: {
      color: "text-amber-600 bg-amber-50 border-amber-200",
      icon: RefreshCw,
      label: "Syncing...",
    },
    synced: {
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      icon: Check,
      label: "Synced",
    },
    failed: {
      color: "text-rose-600 bg-rose-50 border-rose-200",
      icon: AlertCircle,
      label: "Sync Failed",
    },
    offline: {
      color: "text-slate-500 bg-slate-50 border-slate-200",
      icon: CloudOff,
      label: "Offline",
    },
  };

  const config = stateConfig[state];
  const Icon = config.icon;

  const formatLastSync = (lastSync: string | null): string => {
    if (!lastSync) return "Never";
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleForceSync}
        disabled={isSyncing || !isOnline}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium
          transition-all duration-200 hover:shadow-sm
          ${config.color}
          ${isSyncing || !isOnline ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
        `}
        title="Click to force sync"
      >
        <div className="relative">
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {!isOnline && (
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </div>
        <Icon className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
        <span>{config.label}</span>
      </button>

      <span className="text-[10px] text-slate-400" title={`Last synced: ${formatLastSync(syncInfo.lastSync)}`}>
        {formatLastSync(syncInfo.lastSync)}
      </span>

      {syncInfo.pending > 0 && (
        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
          {syncInfo.pending} pending
        </span>
      )}

      {syncInfo.failed > 0 && (
        <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-medium">
          {syncInfo.failed} failed
        </span>
      )}
    </div>
  );
}

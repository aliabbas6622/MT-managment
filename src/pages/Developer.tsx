import { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "../lib/store";
import { useAuth, type Role } from "../lib/auth";
import { useLicense } from "../lib/license";
import { getSyncStatus, type SyncStatusInfo } from "../services/sync.service";
import {
  Terminal, Database, Users, Clock, CalendarOff, DollarSign,
  Trash2, Download, RefreshCw, UserPlus, Shield, Mail, Lock,
  Eye, EyeOff, X, CheckCircle, Upload, Zap, Wifi, WifiOff,
  Activity, HardDrive, FileText, CheckSquare, Circle, ArrowUp,
  ArrowDown, Cpu, Globe, Layers, Save, RotateCcw, Bug, ChevronRight,
} from "lucide-react";

const DEV_SESSION_KEY = "mt-dev-session";
const DEV_PASSWORD = "ali6622";
const STORAGE_KEY = "malir-tonight-data";
const SYNC_QUEUE_KEY = "malirTonight_syncQueue";
const ERROR_LOG_KEY = "mt_dev_error_log";
const MAX_ERROR_LOG = 100;

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-red-50 text-red-700 border-red-200",
  manager: "bg-blue-50 text-blue-700 border-blue-200",
  hr: "bg-purple-50 text-purple-700 border-purple-200",
  viewer: "bg-slate-50 text-slate-700 border-slate-200",
};

const ALL_PERMISSIONS = [
  "employees:read", "employees:write", "employees:delete",
  "attendance:read", "attendance:write",
  "salaries:read", "salaries:write",
  "leaves:read", "leaves:write", "leaves:approve",
  "departments:read", "departments:write",
  "expenses:read", "expenses:write",
  "reports:read",
  "audit_logs:read",
  "settings:read", "settings:write",
  "users:read", "users:write",
  "roles:manage",
] as const;

type Permission = typeof ALL_PERMISSIONS[number];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "employees:read", "employees:write", "employees:delete",
    "attendance:read", "attendance:write",
    "salaries:read", "salaries:write",
    "leaves:read", "leaves:write", "leaves:approve",
    "departments:read", "departments:write",
    "expenses:read", "expenses:write",
    "reports:read",
    "audit_logs:read",
    "settings:read", "settings:write",
    "users:read", "users:write",
    "roles:manage",
  ],
  manager: [
    "employees:read", "employees:write",
    "attendance:read", "attendance:write",
    "salaries:read",
    "leaves:read", "leaves:approve",
    "departments:read",
    "expenses:read", "expenses:write",
    "reports:read",
    "audit_logs:read",
    "settings:read",
  ],
  hr: [
    "employees:read", "employees:write",
    "attendance:read", "attendance:write",
    "salaries:read", "salaries:write",
    "leaves:read", "leaves:write", "leaves:approve",
    "departments:read",
    "expenses:read",
    "reports:read",
    "audit_logs:read",
  ],
  viewer: [
    "employees:read",
    "attendance:read",
    "salaries:read",
    "leaves:read",
    "departments:read",
    "expenses:read",
    "reports:read",
    "audit_logs:read",
  ],
};

function loadErrorLog(): Array<{ timestamp: string; level: string; message: string; source: string }> {
  try {
    const raw = localStorage.getItem(ERROR_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveErrorLog(log: Array<{ timestamp: string; level: string; message: string; source: string }>): void {
  localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(log.slice(-MAX_ERROR_LOG)));
}

function addErrorLogEntry(level: string, message: string, source: string): void {
  const log = loadErrorLog();
  log.push({ timestamp: new Date().toISOString(), level, message, source });
  saveErrorLog(log);
}

if (typeof window !== "undefined") {
  const origError = window.onerror;
  window.onerror = (msg, source, lineno, colno, error) => {
    addErrorLogEntry("error", String(msg), source ? `${source}:${lineno}:${colno}` : "unknown");
    if (typeof origError === "function") return origError(msg, source, lineno, colno, error);
    return false;
  };

  window.addEventListener("error", (e) => {
    if (e.message) addErrorLogEntry("error", e.message, e.filename ? `${e.filename}:${e.lineno}` : "global");
  });

  window.addEventListener("unhandledrejection", (e) => {
    addErrorLogEntry("error", String(e.reason), "unhandled-rejection");
  });

  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    addErrorLogEntry("error", args.map(String).join(" "), "console");
    origConsoleError.apply(console, args);
  };
  const origConsoleWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    addErrorLogEntry("warn", args.map(String).join(" "), "console");
    origConsoleWarn.apply(console, args);
  };
}

function syntaxHighlightJson(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"([^"\\]*(\\.[^"\\]*)*)"\s*:/g, '<span style="color:#6366f1">"$1"</span>:')
    .replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span style="color:#10b981">"$1"</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:#f59e0b">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span style="color:#ef4444">$1</span>');
}

export default function Developer() {
  const { employees, attendance, leaves, departments, expenses, auditLogs } = useApp();
  const { user, getUsers, addUser, deleteUser, changePassword } = useAuth();
  const { license, isPremium, deactivateLicense } = useLicense();
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(DEV_SESSION_KEY) === "true");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [dbSize, setDbSize] = useState("—");
  const [dbSizeBytes, setDbSizeBytes] = useState(0);
  const [syncInfo, setSyncInfo] = useState<SyncStatusInfo | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ timestamp: string; level: string; message: string; source: string }>>([]);
  const [logFilter, setLogFilter] = useState<"all" | "error" | "warn">("all");
  const [actionFeedback, setActionFeedback] = useState("");
  const [tabAnimating, setTabAnimating] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("admin");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [resetUserId, setResetUserId] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  const [allUsers, setAllUsers] = useState<ReturnType<typeof getUsers>>([]);

  const refreshSyncInfo = useCallback(() => {
    const info = getSyncStatus();
    setSyncInfo(info);
    setIsOnline(simulateOffline ? false : info.isOnline);
    setLastSyncTime(info.lastSync);
  }, [simulateOffline]);

  const refreshDbSize = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const bytes = new Blob([raw]).size;
      setDbSizeBytes(bytes);
      setDbSize(`${(bytes / 1024).toFixed(1)} KB`);
    } else {
      setDbSizeBytes(0);
      setDbSize("0 KB");
    }
  }, []);

  useEffect(() => {
    refreshDbSize();
    refreshSyncInfo();
    const interval = setInterval(refreshSyncInfo, 10000);
    return () => clearInterval(interval);
  }, [refreshSyncInfo, refreshDbSize]);

  useEffect(() => {
    if (!authenticated) sessionStorage.removeItem(DEV_SESSION_KEY);
  }, [authenticated]);

  useEffect(() => {
    if (authenticated) setAllUsers(getUsers());
  }, [authenticated, getUsers]);

  useEffect(() => {
    setConsoleLogs(loadErrorLog());
  }, [activeTab]);

  useEffect(() => {
    if (simulateOffline) {
      setIsOnline(false);
    } else {
      setIsOnline(navigator.onLine);
    }
  }, [simulateOffline]);

  const handleTabChange = (tab: string) => {
    setTabAnimating(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTabAnimating(false);
    }, 150);
  };

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(""), 3000);
  };

  const handleLogin = () => {
    if (password === DEV_PASSWORD) {
      sessionStorage.setItem(DEV_SESSION_KEY, "true");
      setAuthenticated(true);
    } else {
      alert("Invalid developer credentials");
    }
  };

  const handleCreateUser = () => {
    setFormError("");
    setFormSuccess("");
    if (!newName.trim()) { setFormError("Name is required."); return; }
    if (!newEmail.trim()) { setFormError("Email is required."); return; }
    if (newPassword.length < 4) { setFormError("Password must be at least 4 characters."); return; }

    const result = addUser({ name: newName, email: newEmail, role: newRole, password: newPassword });
    if (result.success) {
      setFormSuccess("User created successfully.");
      setNewName("");
      setNewEmail("");
      setNewRole("admin");
      setNewPassword("");
      setAllUsers(getUsers());
    } else {
      setFormError(result.error || "Failed to create user.");
    }
  };

  const handleDeleteUser = (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const result = deleteUser(id);
    if (result.success) {
      setAllUsers(getUsers());
    } else {
      alert(result.error);
    }
  };

  const handleResetPassword = () => {
    if (resetPassword.length < 4) {
      alert("Password must be at least 4 characters.");
      return;
    }
    const result = changePassword(resetUserId, resetPassword);
    if (result.success) {
      setShowResetModal(false);
      setResetUserId("");
      setResetPassword("");
    } else {
      alert(result.error);
    }
  };

  const handleClearAll = () => {
    if (confirm("WARNING: This will delete ALL data. Are you sure?")) {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(DEV_SESSION_KEY);
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `malir-tonight-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateBackup = () => {
    const keys = Object.keys(localStorage);
    const backup: Record<string, string> = {};
    keys.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v !== null) backup[k] = v;
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `malir-tonight-full-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback("Backup created and downloaded!");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        Object.entries(data).forEach(([k, v]) => {
          if (typeof v === "string") localStorage.setItem(k, v);
        });
        showFeedback("Backup imported successfully! Reload to apply.");
      } catch {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClearSyncQueue = () => {
    localStorage.removeItem(SYNC_QUEUE_KEY);
    refreshSyncInfo();
    showFeedback("Sync queue cleared!");
  };

  const handleResetLicense = () => {
    if (confirm("Reset premium license to basic?")) {
      deactivateLicense();
      showFeedback("License reset to basic.");
    }
  };

  const handleSimulateOffline = () => {
    setSimulateOffline((prev) => !prev);
    showFeedback(simulateOffline ? "Back online (simulated)" : "Simulating offline mode...");
  };

  const handleSeedDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const storagePercent = Math.min((dbSizeBytes / (5 * 1024 * 1024)) * 100, 100);

  const tabs = ["overview", "users", "data", "logs", "debug", "actions"];

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm w-full max-w-sm space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <Terminal className="h-8 w-8 text-slate-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Developer Access</h1>
          <p className="text-sm text-slate-500">Enter developer credentials to continue.</p>
          <input
            type="email"
            placeholder="Email"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            Authenticate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
          <Terminal className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Developer Console</h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
              Dev Mode
            </span>
          </div>
          <p className="text-xs text-slate-500">System diagnostics and data management</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {simulateOffline ? "Simulated Offline" : isOnline ? "Online" : "Offline"}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === t ? "bg-slate-800 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
          >
            {t === "logs" && <FileText className="h-3 w-3 inline mr-1" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {actionFeedback && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-[fadeIn_0.2s_ease-out]">
          {actionFeedback}
        </div>
      )}

      <div className={`transition-opacity duration-150 ${tabAnimating ? "opacity-0" : "opacity-100"}`}>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: "Employees", value: employees.length, icon: Users, trend: "+2 this month", trendUp: true, gradient: "from-emerald-50 to-teal-50" },
                { label: "Attendance", value: attendance.length, icon: Clock, trend: "Today", trendUp: true, gradient: "from-blue-50 to-cyan-50" },
                { label: "Leaves", value: leaves.length, icon: CalendarOff, trend: "2 pending", trendUp: false, gradient: "from-amber-50 to-orange-50" },
                { label: "Departments", value: departments.length, icon: Database, trend: "Active", trendUp: true, gradient: "from-purple-50 to-violet-50" },
                { label: "Expenses", value: expenses.length, icon: DollarSign, trend: "PKR 348K", trendUp: false, gradient: "from-rose-50 to-pink-50" },
                { label: "Audit Logs", value: auditLogs.length, icon: Terminal, trend: "Last 7d", trendUp: true, gradient: "from-slate-50 to-gray-50" },
                { label: "Users", value: allUsers.length, icon: Shield, trend: `${allUsers.filter(u => u.role === "admin").length} admins`, trendUp: true, gradient: "from-indigo-50 to-blue-50" },
                { label: "License", value: isPremium ? "Premium" : "Basic", icon: CheckSquare, trend: license.status, trendUp: license.status === "active", gradient: "from-yellow-50 to-amber-50" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border border-slate-200 bg-gradient-to-br ${s.gradient} p-4 shadow-sm hover:shadow-md transition-all duration-200`}>
                  <s.icon className="h-5 w-5 mb-2 text-slate-400" />
                  <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px]">
                    {s.trendUp ? <ArrowUp className="h-3 w-3 text-emerald-500" /> : <ArrowDown className="h-3 w-3 text-amber-500" />}
                    <span className={s.trendUp ? "text-emerald-600" : "text-amber-600"}>{s.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-emerald-500" /> System Health
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-slate-400" /> Storage Usage
                    </span>
                    <span className="text-xs text-slate-500">{dbSize} / 5 MB</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${storagePercent > 80 ? "bg-red-500" : storagePercent > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.max(storagePercent, 1)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{storagePercent.toFixed(1)}% used</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-slate-400" /> Last Sync
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOnline ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {isOnline ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : "Never synced"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {syncInfo ? `${syncInfo.pending} pending, ${syncInfo.failed} failed` : "No sync data"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-slate-400" /> App Info
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Version</span><span className="font-mono text-slate-700">2.0.0</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Build</span><span className="font-mono text-slate-700">2026.07.21</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Engine</span><span className="font-mono text-slate-700">Vite + React 19</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-400" /> Environment
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Platform</span><span className="font-mono text-slate-700 text-xs">{navigator.platform}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Language</span><span className="font-mono text-slate-700">{navigator.language}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Screen</span><span className="font-mono text-slate-700">{window.screen.width}x{window.screen.height}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <UserPlus className="h-4 w-4 text-emerald-500" /> Create New User
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter full name" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter email" className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 4 characters" className="w-full border border-slate-200 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <X className="h-4 w-4" /> {formError}
                </div>
              )}
              {formSuccess && (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <CheckCircle className="h-4 w-4" /> {formSuccess}
                </div>
              )}

              <button onClick={handleCreateUser} disabled={!newName.trim() || !newEmail.trim() || newPassword.length < 4} className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Create User
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-slate-400" /> All Users ({allUsers.length})
              </h3>
              <div className="space-y-3">
                {allUsers.map((u) => {
                  const lastLoginKey = `mt_lastLogin_${u.id}`;
                  const lastLogin = localStorage.getItem(lastLoginKey);
                  const loginCountKey = `mt_loginCount_${u.id}`;
                  const loginCount = localStorage.getItem(loginCountKey);
                  return (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                          {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lastLogin ? `Last login: ${new Date(lastLogin).toLocaleDateString()}` : "Never logged in"}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Layers className="h-3 w-3" />
                              {loginCount || "0"} logins
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.role]}`}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                        <button onClick={() => { setResetUserId(u.id); setResetPassword(""); setShowResetModal(true); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Reset password">
                          <Lock className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete user">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-indigo-500" /> Role Permissions Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-2 text-slate-500 font-medium">Permission</th>
                      {(["admin", "manager", "hr", "viewer"] as Role[]).map((r) => (
                        <th key={r} className="text-center p-2 text-slate-500 font-medium capitalize">{r}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_PERMISSIONS.map((perm) => (
                      <tr key={perm} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="p-2 font-mono text-slate-700">{perm}</td>
                        {(["admin", "manager", "hr", "viewer"] as Role[]).map((r) => (
                          <td key={r} className="text-center p-2">
                            {ROLE_PERMISSIONS[r].includes(perm) ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-200 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Database className="h-4 w-4 text-slate-400" /> Local Storage Data</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs">Storage Size</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{dbSize}</p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                    <div className={`h-1.5 rounded-full ${storagePercent > 80 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${Math.max(storagePercent, 1)}%` }} />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-500 text-xs">Storage Key</p>
                  <p className="text-sm font-bold font-mono text-slate-800 mt-1">malir-tonight-data</p>
                  <p className="text-xs text-slate-400 mt-1">{storagePercent.toFixed(1)}% of 5 MB</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-800 mb-3">Raw JSON Data</h3>
              <pre
                className="bg-slate-50 rounded-xl p-4 text-xs overflow-auto max-h-96 font-mono"
                dangerouslySetInnerHTML={{
                  __html: syntaxHighlightJson(
                    JSON.stringify({ employees, attendance, leaves, departments, expenses, auditLogs }, null, 2)
                  ),
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-500" /> Audit Logs
                </h3>
                <span className="text-xs text-slate-400">{auditLogs.length} entries</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No audit logs yet.</p>
                ) : (
                  auditLogs.slice(0, 50).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.action === "CREATE" ? "bg-emerald-100 text-emerald-700" :
                        log.action === "UPDATE" ? "bg-blue-100 text-blue-700" :
                        log.action === "DELETE" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {log.action}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">{log.details}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400">{log.entity}</span>
                          <span className="text-[10px] text-slate-400">by {log.user}</span>
                          <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <RefreshCw className="h-4 w-4 text-blue-500" /> Sync Queue Status
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                  <p className="text-2xl font-bold text-amber-700">{syncInfo?.pending ?? 0}</p>
                  <p className="text-xs text-amber-600">Pending</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-700">{syncInfo?.synced ?? 0}</p>
                  <p className="text-xs text-emerald-600">Synced</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                  <p className="text-2xl font-bold text-red-700">{syncInfo?.failed ?? 0}</p>
                  <p className="text-xs text-red-600">Failed</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                Last sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : "Never"}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Bug className="h-4 w-4 text-red-500" /> Error & Console Logs
                </h3>
                <div className="flex gap-1">
                  {(["all", "error", "warn"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setLogFilter(f)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${logFilter === f ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1 max-h-64 overflow-auto">
                {consoleLogs.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No errors or warnings captured.</p>
                ) : (
                  consoleLogs
                    .filter((l) => logFilter === "all" || l.level === logFilter)
                    .slice(-50)
                    .reverse()
                    .map((log, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 text-xs font-mono rounded hover:bg-slate-50">
                        <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                          log.level === "error" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-slate-400 flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className="text-slate-700 truncate">{log.message}</span>
                        <span className="text-slate-400 ml-auto flex-shrink-0">{log.source}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "debug" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <h3 className="font-semibold text-slate-800">Environment Info</h3>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["Platform", navigator.platform],
                    ["Language", navigator.language],
                    ["Online", navigator.onLine ? "Yes" : "No"],
                    ["Screen", `${window.screen.width}x${window.screen.height}`],
                    ["Logged In As", `${user?.name || "Unknown"} (${user?.role || "none"})`],
                    ["License", `${license.type} (${license.status})`],
                  ].map(([k, v]) => (
                    <tr key={String(k)} className="border-b border-slate-100 last:border-0">
                      <td className="p-2 text-slate-500">{k}</td>
                      <td className="p-2 font-mono text-slate-700">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <h3 className="font-semibold text-slate-800">React State</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {[
                  ["employees", employees.length],
                  ["attendance", attendance.length],
                  ["leaves", leaves.length],
                  ["departments", departments.length],
                  ["expenses", expenses.length],
                  ["auditLogs", auditLogs.length],
                ].map(([k, v]) => (
                  <div key={String(k)} className="bg-slate-50 rounded-lg p-2.5">
                    <span className="text-slate-500">{k}: </span>
                    <span className="font-mono text-slate-700">{v} items</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <h3 className="font-semibold text-slate-800">Storage Keys</h3>
              <div className="space-y-1 max-h-48 overflow-auto">
                {Object.keys(localStorage).filter(k => k.startsWith("malir") || k.startsWith("mt_")).map((k) => (
                  <div key={k} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                    <span className="font-mono text-slate-600 truncate">{k}</span>
                    <span className="text-slate-400 flex-shrink-0 ml-2">
                      {(() => { try { return `${(new Blob([localStorage.getItem(k) || ""]).size / 1024).toFixed(1)} KB`; } catch { return "—"; } })()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "actions" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-amber-500" /> Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="group">
                  <button onClick={handleCreateBackup} className="w-full flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left">
                    <Save className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-slate-800">Create Backup</p>
                      <p className="text-[10px] text-slate-400 font-normal">Export all localStorage data</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-emerald-500" />
                  </button>
                </div>

                <div className="group">
                  <button onClick={() => importFileRef.current?.click()} className="w-full flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium hover:bg-blue-50 hover:border-blue-200 transition-all text-left">
                    <Upload className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-slate-800">Import Backup</p>
                      <p className="text-[10px] text-slate-400 font-normal">Restore from JSON file</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-blue-500" />
                  </button>
                  <input ref={importFileRef} type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
                </div>

                <div className="group">
                  <button onClick={handleClearSyncQueue} className="w-full flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium hover:bg-amber-50 hover:border-amber-200 transition-all text-left">
                    <RefreshCw className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-slate-800">Clear Sync Queue</p>
                      <p className="text-[10px] text-slate-400 font-normal">Remove all pending sync items</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-amber-500" />
                  </button>
                </div>

                <div className="group">
                  <button onClick={handleResetLicense} className="w-full flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium hover:bg-purple-50 hover:border-purple-200 transition-all text-left">
                    <RotateCcw className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-slate-800">Reset License</p>
                      <p className="text-[10px] text-slate-400 font-normal">Clear premium license data</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-purple-500" />
                  </button>
                </div>

                <div className="group">
                  <button onClick={handleSimulateOffline} className={`w-full flex items-center gap-3 border rounded-xl px-4 py-3 text-sm font-medium transition-all text-left ${simulateOffline ? "border-orange-300 bg-orange-50 hover:bg-orange-100" : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"}`}>
                    <WifiOff className={`h-5 w-5 ${simulateOffline ? "text-orange-500" : "text-slate-400"}`} />
                    <div>
                      <p className="text-slate-800">{simulateOffline ? "Go Online" : "Simulate Offline"}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{simulateOffline ? "Disable offline simulation" : "Toggle navigator.onLine for testing"}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 ml-auto ${simulateOffline ? "text-orange-400" : "text-slate-300"}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-800">Data Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <button onClick={handleExportData} className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors text-slate-700">
                  <Download className="h-4 w-4" /> Export Backup
                </button>
                <button onClick={handleSeedDemo} className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors text-slate-700">
                  <RefreshCw className="h-4 w-4" /> Reset to Demo Data
                </button>
                <button onClick={handleClearAll} className="flex items-center justify-center gap-2 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm font-medium hover:bg-rose-50 transition-colors">
                  <Trash2 className="h-4 w-4" /> Clear All Data
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-800 mb-3">App Info</h3>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["App Name", "Malir Tonight"],
                    ["Version", "2.0.0"],
                    ["Stack", "Electron + React + TypeScript + Vite + Tailwind + Prisma + PostgreSQL"],
                    ["License", isPremium ? "Premium (Active)" : "Basic"],
                    ["Auth", "RBAC (Admin, Manager, HR, Viewer)"],
                    ["Sync", "Offline-first + AES-256-GCM"],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-b border-slate-100 last:border-0">
                      <td className="p-2 text-slate-500">{k}</td>
                      <td className="p-2 text-slate-800">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-500" /> Reset Password
              </h3>
              <button onClick={() => setShowResetModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Min. 4 characters" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowResetModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleResetPassword} disabled={resetPassword.length < 4} className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

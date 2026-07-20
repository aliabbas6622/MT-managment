import { useState, useEffect } from "react";
import { useApp } from "../lib/store";
import { useAuth, type Role } from "../lib/auth";
import { Terminal, Database, Users, Clock, CalendarOff, DollarSign, Trash2, Download, RefreshCw, UserPlus, Shield, Mail, Lock, Eye, EyeOff, X, CheckCircle } from "lucide-react";

const DEV_SESSION_KEY = "mt-dev-session";
const DEV_PASSWORD = "malir-dev-2026";

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-red-50 text-red-700 border-red-200",
  manager: "bg-blue-50 text-blue-700 border-blue-200",
  hr: "bg-purple-50 text-purple-700 border-purple-200",
  viewer: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function Developer() {
  const { employees, attendance, leaves, departments, expenses, auditLogs } = useApp();
  const { user, getUsers, addUser, deleteUser, changePassword } = useAuth();
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(DEV_SESSION_KEY) === "true");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [dbSize, setDbSize] = useState("—");

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

  useEffect(() => {
    const raw = localStorage.getItem("malir-tonight-data");
    if (raw) setDbSize(`${(new Blob([raw]).size / 1024).toFixed(1)} KB`);
  }, []);

  useEffect(() => {
    if (!authenticated) sessionStorage.removeItem(DEV_SESSION_KEY);
  }, [authenticated]);

  useEffect(() => {
    if (authenticated) setAllUsers(getUsers());
  }, [authenticated, getUsers]);

  const handleLogin = () => {
    if (password === DEV_PASSWORD) {
      sessionStorage.setItem(DEV_SESSION_KEY, "true");
      setAuthenticated(true);
    } else {
      alert("Invalid developer password");
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
      localStorage.removeItem("malir-tonight-data");
      sessionStorage.removeItem(DEV_SESSION_KEY);
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = localStorage.getItem("malir-tonight-data");
    if (!data) return;
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `malir-tonight-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSeedDemo = () => {
    localStorage.removeItem("malir-tonight-data");
    window.location.reload();
  };

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm w-full max-w-sm space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <Terminal className="h-8 w-8 text-slate-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Developer Access</h1>
          <p className="text-sm text-slate-500">Enter the developer password to continue.</p>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
          <button onClick={handleLogin} className="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">Authenticate</button>
        </div>
      </div>
    );
  }

  const tabs = ["overview", "users", "data", "debug", "actions"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
          <Terminal className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Developer Console</h1>
          <p className="text-xs text-slate-500">System diagnostics and data management</p>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === t ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {[
            { label: "Employees", value: employees.length, icon: Users },
            { label: "Attendance", value: attendance.length, icon: Clock },
            { label: "Leaves", value: leaves.length, icon: CalendarOff },
            { label: "Departments", value: departments.length, icon: Database },
            { label: "Expenses", value: expenses.length, icon: DollarSign },
            { label: "Audit Logs", value: auditLogs.length, icon: Terminal },
            { label: "Users", value: allUsers.length, icon: Shield },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center hover:shadow-md transition-shadow">
              <s.icon className="h-5 w-5 mx-auto mb-2 text-slate-400" />
              <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
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
              <Users className="h-4 w-4 text-slate-400" /> All Users
            </h3>
            <div className="space-y-3">
              {allUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                      {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
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
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "data" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Database className="h-4 w-4 text-slate-400" /> Local Storage Data</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-slate-500 text-xs">Storage Size</p><p className="text-xl font-bold text-slate-900 mt-1">{dbSize}</p></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-slate-500 text-xs">Storage Key</p><p className="text-sm font-bold font-mono text-slate-800 mt-1">malir-tonight-data</p></div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-800 mb-3">Raw JSON Data</h3>
            <pre className="bg-slate-50 rounded-xl p-4 text-xs overflow-auto max-h-96 font-mono text-slate-700">
              {JSON.stringify({ employees, attendance, leaves, departments, expenses, auditLogs }, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {activeTab === "debug" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="font-semibold text-slate-800">Environment Info</h3>
            <table className="w-full text-sm">
              <tbody>
                {[["Platform", navigator.platform], ["Language", navigator.language], ["Online", navigator.onLine ? "Yes" : "No"], ["Screen", `${window.screen.width}x${window.screen.height}`], ["Logged In As", `${user?.name || "Unknown"} (${user?.role || "none"})`]].map(([k, v]) => (
                  <tr key={String(k)} className="border-b border-slate-100 last:border-0"><td className="p-2 text-slate-500">{k}</td><td className="p-2 font-mono text-slate-700">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="font-semibold text-slate-800">React State</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {[["employees", employees.length], ["attendance", attendance.length], ["leaves", leaves.length], ["departments", departments.length], ["expenses", expenses.length], ["auditLogs", auditLogs.length]].map(([k, v]) => (
                <div key={String(k)} className="bg-slate-50 rounded-lg p-2.5"><span className="text-slate-500">{k}: </span><span className="font-mono text-slate-700">{v} items</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "actions" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="font-semibold text-slate-800">Data Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                {[["App Name", "Malir Tonight"], ["Version", "2.0.0"], ["Stack", "Electron + React + TypeScript + Vite + Tailwind + Prisma + PostgreSQL"], ["License", "Basic / Premium"], ["Auth", "RBAC (Admin, Manager, HR, Viewer)"], ["Sync", "Offline-first + AES-256-GCM"]].map(([k, v]) => (
                  <tr key={k} className="border-b border-slate-100 last:border-0"><td className="p-2 text-slate-500">{k}</td><td className="p-2 text-slate-800">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

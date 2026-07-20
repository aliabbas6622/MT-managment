import { useState, useEffect } from "react";
import { useApp } from "../lib/store";
import { useAuth } from "../lib/auth";
import { Terminal, Database, Users, Clock, CalendarOff, DollarSign, Trash2, Download, RefreshCw } from "lucide-react";

const DEV_SESSION_KEY = "mt-dev-session";

export default function Developer() {
  const { employees, attendance, leaves, departments, expenses, auditLogs } = useApp();
  const { user } = useAuth();
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(DEV_SESSION_KEY) === "true");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [dbSize, setDbSize] = useState("—");

  const DEV_PASSWORD = "malir-dev-2026";

  useEffect(() => {
    const raw = localStorage.getItem("malir-tonight-data");
    if (raw) setDbSize(`${(new Blob([raw]).size / 1024).toFixed(1)} KB`);
  }, []);

  useEffect(() => {
    if (!authenticated) sessionStorage.removeItem(DEV_SESSION_KEY);
  }, [authenticated]);

  const handleLogin = () => {
    if (password === DEV_PASSWORD) {
      sessionStorage.setItem(DEV_SESSION_KEY, "true");
      setAuthenticated(true);
    } else {
      alert("Invalid developer password");
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

  const tabs = ["overview", "data", "debug", "actions"];

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Employees", value: employees.length, icon: Users },
            { label: "Attendance", value: attendance.length, icon: Clock },
            { label: "Leaves", value: leaves.length, icon: CalendarOff },
            { label: "Departments", value: departments.length, icon: Database },
            { label: "Expenses", value: expenses.length, icon: DollarSign },
            { label: "Audit Logs", value: auditLogs.length, icon: Terminal },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center hover:shadow-md transition-shadow">
              <s.icon className="h-5 w-5 mx-auto mb-2 text-slate-400" />
              <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
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
    </div>
  );
}

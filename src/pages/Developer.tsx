import { useState, useEffect } from "react";
import { useApp } from "../lib/store";
import { Terminal, Database, Users, Clock, CalendarOff, DollarSign, Trash2, Download, RefreshCw } from "lucide-react";

const DEV_KEY = "mt-dev-auth";

export function isDevAuthenticated(): boolean {
  return localStorage.getItem(DEV_KEY) === "true";
}

export function setDevAuth(val: boolean) {
  if (val) localStorage.setItem(DEV_KEY, "true");
  else localStorage.removeItem(DEV_KEY);
}

export default function Developer() {
  const { employees, attendance, leaves, departments, expenses, auditLogs } = useApp();
  const [authenticated, setAuthenticated] = useState(isDevAuthenticated());
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [dbSize, setDbSize] = useState("—");

  const DEV_PASSWORD = "malir-dev-2026";

  useEffect(() => {
    const raw = localStorage.getItem("malir-tonight-data");
    if (raw) {
      const bytes = new Blob([raw]).size;
      setDbSize(`${(bytes / 1024).toFixed(1)} KB`);
    }
  }, []);

  const handleLogin = () => {
    if (password === DEV_PASSWORD) {
      setDevAuth(true);
      setAuthenticated(true);
    } else {
      alert("Invalid developer password");
    }
  };

  const handleClearAll = () => {
    if (confirm("WARNING: This will delete ALL data. Are you sure?")) {
      localStorage.removeItem("malir-tonight-data");
      localStorage.removeItem(DEV_KEY);
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
        <div className="rounded-lg border bg-card p-8 shadow-sm w-full max-w-sm space-y-4 text-center">
          <Terminal className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-bold">Developer Access</h1>
          <p className="text-sm text-muted-foreground">Enter the developer password to continue.</p>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full border rounded-md px-3 py-2 text-sm" />
          <button onClick={handleLogin} className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
            Authenticate
          </button>
        </div>
      </div>
    );
  }

  const tabs = ["overview", "data", "debug", "actions"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Terminal className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold">Developer Console</h1>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">DEV</span>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === t ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Employees", value: employees.length, icon: Users, color: "text-blue-600" },
            { label: "Attendance", value: attendance.length, icon: Clock, color: "text-green-600" },
            { label: "Leaves", value: leaves.length, icon: CalendarOff, color: "text-orange-600" },
            { label: "Departments", value: departments.length, icon: Database, color: "text-purple-600" },
            { label: "Expenses", value: expenses.length, icon: DollarSign, color: "text-red-600" },
            { label: "Audit Logs", value: auditLogs.length, icon: Terminal, color: "text-gray-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "data" && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><Database className="h-4 w-4" /> Local Storage Data</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted rounded p-3">
                <p className="text-muted-foreground">Storage Size</p>
                <p className="text-lg font-bold">{dbSize}</p>
              </div>
              <div className="bg-muted rounded p-3">
                <p className="text-muted-foreground">Storage Key</p>
                <p className="text-lg font-bold font-mono text-xs">malir-tonight-data</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">Raw JSON Data</h3>
            <pre className="bg-muted rounded p-4 text-xs overflow-auto max-h-96 font-mono">
              {JSON.stringify({ employees, attendance, leaves, departments, expenses, auditLogs }, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {activeTab === "debug" && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <h3 className="font-semibold">Environment Info</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="p-2 text-muted-foreground">Platform</td><td className="p-2 font-mono">{navigator.platform}</td></tr>
                <tr className="border-b"><td className="p-2 text-muted-foreground">User Agent</td><td className="p-2 font-mono text-xs break-all">{navigator.userAgent}</td></tr>
                <tr className="border-b"><td className="p-2 text-muted-foreground">Language</td><td className="p-2 font-mono">{navigator.language}</td></tr>
                <tr className="border-b"><td className="p-2 text-muted-foreground">Online</td><td className="p-2 font-mono">{navigator.onLine ? "Yes" : "No"}</td></tr>
                <tr><td className="p-2 text-muted-foreground">Screen</td><td className="p-2 font-mono">{window.screen.width}x{window.screen.height}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-3">
            <h3 className="font-semibold">React State</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div className="bg-muted rounded p-2"><span className="text-muted-foreground">employees:</span> <span className="font-mono">{employees.length} items</span></div>
              <div className="bg-muted rounded p-2"><span className="text-muted-foreground">attendance:</span> <span className="font-mono">{attendance.length} items</span></div>
              <div className="bg-muted rounded p-2"><span className="text-muted-foreground">leaves:</span> <span className="font-mono">{leaves.length} items</span></div>
              <div className="bg-muted rounded p-2"><span className="text-muted-foreground">departments:</span> <span className="font-mono">{departments.length} items</span></div>
              <div className="bg-muted rounded p-2"><span className="text-muted-foreground">expenses:</span> <span className="font-mono">{expenses.length} items</span></div>
              <div className="bg-muted rounded p-2"><span className="text-muted-foreground">auditLogs:</span> <span className="font-mono">{auditLogs.length} items</span></div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-3">
            <h3 className="font-semibold">Console Actions</h3>
            <div className="flex gap-2">
              <button onClick={() => console.log("State:", { employees, attendance, leaves, departments, expenses, auditLogs })} className="px-3 py-1.5 bg-muted rounded text-sm hover:bg-muted/80">Log State to Console</button>
              <button onClick={() => console.clear()} className="px-3 py-1.5 bg-muted rounded text-sm hover:bg-muted/80">Clear Console</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "actions" && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Data Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button onClick={handleExportData} className="flex items-center justify-center gap-2 border rounded-md px-4 py-3 text-sm font-medium hover:bg-muted">
                <Download className="h-4 w-4" /> Export Backup
              </button>
              <button onClick={handleSeedDemo} className="flex items-center justify-center gap-2 border rounded-md px-4 py-3 text-sm font-medium hover:bg-muted">
                <RefreshCw className="h-4 w-4" /> Reset to Demo Data
              </button>
              <button onClick={handleClearAll} className="flex items-center justify-center gap-2 border border-red-300 text-red-600 rounded-md px-4 py-3 text-sm font-medium hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Clear All Data
              </button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-3">
            <h3 className="font-semibold">App Info</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="p-2 text-muted-foreground">App Name</td><td className="p-2">Malir Tonight</td></tr>
                <tr className="border-b"><td className="p-2 text-muted-foreground">Version</td><td className="p-2">1.0.0-dev</td></tr>
                <tr className="border-b"><td className="p-2 text-muted-foreground">Stack</td><td className="p-2">Electron + React + TypeScript + Vite + Tailwind + Prisma + SQLite</td></tr>
                <tr><td className="p-2 text-muted-foreground">License</td><td className="p-2">Basic / Premium</td></tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-dashed border-purple-300 bg-purple-50 p-4">
            <p className="text-sm text-purple-700 font-medium">Developer page is hidden from the sidebar. Access it via the URL: <code className="bg-purple-100 px-1 rounded">/developer</code></p>
          </div>
        </div>
      )}
    </div>
  );
}

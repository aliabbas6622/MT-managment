import { useState } from "react";
import { useApp } from "../lib/store";
import { Search } from "lucide-react";

export default function AuditLogs() {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const filtered = auditLogs.filter((log) => {
    const matchSearch = `${log.action} ${log.entity} ${log.details} ${log.user}`.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === "all" || log.action === filterAction;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
        </div>
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all">
          <option value="all">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left p-3 font-medium text-slate-500">Timestamp</th>
              <th className="text-left p-3 font-medium text-slate-500">Action</th>
              <th className="text-left p-3 font-medium text-slate-500">Entity</th>
              <th className="text-left p-3 font-medium text-slate-500">Details</th>
              <th className="text-left p-3 font-medium text-slate-500">User</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400">No audit logs found.</td></tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      log.action === "CREATE" ? "bg-emerald-50 text-emerald-700" :
                      log.action === "UPDATE" ? "bg-sky-50 text-sky-700" :
                      "bg-rose-50 text-rose-700"
                    }`}>{log.action}</span>
                  </td>
                  <td className="p-3 font-medium text-slate-800">{log.entity}</td>
                  <td className="p-3 text-slate-500 text-xs">{log.details}</td>
                  <td className="p-3 text-slate-700">{log.user}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

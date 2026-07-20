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
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border rounded-md pl-9 pr-3 py-2 text-sm bg-background" />
        </div>
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-background">
          <option value="all">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Timestamp</th>
              <th className="text-left p-3 font-medium">Action</th>
              <th className="text-left p-3 font-medium">Entity</th>
              <th className="text-left p-3 font-medium">Details</th>
              <th className="text-left p-3 font-medium">User</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No audit logs found.</td></tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 text-muted-foreground text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      log.action === "CREATE" ? "bg-green-100 text-green-700" :
                      log.action === "UPDATE" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}>{log.action}</span>
                  </td>
                  <td className="p-3 font-medium">{log.entity}</td>
                  <td className="p-3 text-muted-foreground text-xs">{log.details}</td>
                  <td className="p-3">{log.user}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

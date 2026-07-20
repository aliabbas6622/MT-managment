import { useState } from "react";
import { useApp } from "../lib/store";
import type { Leave } from "../lib/types";
import { formatStatus } from "../lib/utils";
import { Plus, Pencil, Trash2, X, Check, Ban } from "lucide-react";

export default function Leaves() {
  const { employees, leaves, addLeave, updateLeave, deleteLeave } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ employeeId: 0, employeeName: "", startDate: "", endDate: "", type: "sick" as Leave["type"], status: "pending" as Leave["status"], reason: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = leaves.filter((l) => filterStatus === "all" || l.status === filterStatus);

  const openAdd = () => {
    setForm({ employeeId: 0, employeeName: "", startDate: "", endDate: "", type: "sick", status: "pending", reason: "" });
    setEditingId(null);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (leave: Leave) => {
    setForm({ ...leave });
    setEditingId(leave.id);
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.employeeId) errs.employee = "Select an employee";
    if (!form.startDate) errs.startDate = "Required";
    if (!form.endDate) errs.endDate = "Required";
    else if (form.startDate && form.endDate < form.startDate) errs.endDate = "End date must be after start";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editingId) {
      updateLeave(editingId, form);
    } else {
      addLeave(form);
    }
    setShowForm(false);
  };

  const handleApprove = (id: number) => updateLeave(id, { status: "approved" });
  const handleReject = (id: number) => updateLeave(id, { status: "rejected" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaves</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Request Leave
        </button>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {formatStatus(s)}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Employee</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Start</th>
              <th className="text-left p-3 font-medium">End</th>
              <th className="text-left p-3 font-medium">Reason</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No leave records found.</td></tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{l.employeeName}</td>
                  <td className="p-3 capitalize">{formatStatus(l.type)}</td>
                  <td className="p-3 text-muted-foreground">{l.startDate}</td>
                  <td className="p-3 text-muted-foreground">{l.endDate}</td>
                  <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{l.reason}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      l.status === "approved" ? "bg-green-100 text-green-700" :
                      l.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{formatStatus(l.status)}</span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    {l.status === "pending" && (
                      <>
                        <button onClick={() => handleApprove(l.id)} className="p-1 hover:bg-muted rounded text-green-600 transition-colors" title="Approve"><Check className="h-4 w-4" /></button>
                        <button onClick={() => handleReject(l.id)} className="p-1 hover:bg-muted rounded text-red-600 transition-colors" title="Reject"><Ban className="h-4 w-4" /></button>
                      </>
                    )}
                    <button onClick={() => openEdit(l)} className="p-1 hover:bg-muted rounded transition-colors"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm("Delete?")) deleteLeave(l.id); }} className="p-1 hover:bg-muted rounded text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onKeyDown={(e) => e.key === "Escape" && setShowForm(false)}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Leave" : "Request Leave"}</h2>
              <button onClick={() => setShowForm(false)} className="hover:bg-muted rounded p-1"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <select value={form.employeeId || ""} onChange={(e) => {
                  const emp = employees.find((em) => em.id === Number(e.target.value));
                  if (emp) setForm({ ...form, employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}` });
                }} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="">Select Employee</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
                {errors.employee && <p className="text-xs text-red-500 mt-1">{errors.employee}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
                  {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
                  {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                </div>
              </div>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Leave["type"] })} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="sick">Sick</option>
                <option value="vacation">Vacation</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
              <textarea placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

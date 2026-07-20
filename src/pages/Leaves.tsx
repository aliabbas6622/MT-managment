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

  const openAdd = () => { setForm({ employeeId: 0, employeeName: "", startDate: "", endDate: "", type: "sick", status: "pending", reason: "" }); setEditingId(null); setErrors({}); setShowForm(true); };
  const openEdit = (leave: Leave) => { setForm({ ...leave }); setEditingId(leave.id); setErrors({}); setShowForm(true); };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.employeeId) errs.employee = "Select an employee";
    if (!form.startDate) errs.startDate = "Required";
    if (!form.endDate) errs.endDate = "Required";
    else if (form.startDate && form.endDate < form.startDate) errs.endDate = "End date must be after start";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => { if (!validate()) return; if (editingId) updateLeave(editingId, form); else addLeave(form); setShowForm(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Leaves</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Request Leave
        </button>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? "bg-emerald-500 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700"}`}>
            {formatStatus(s)}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left p-3 font-medium text-slate-500">Employee</th>
              <th className="text-left p-3 font-medium text-slate-500">Type</th>
              <th className="text-left p-3 font-medium text-slate-500">Start</th>
              <th className="text-left p-3 font-medium text-slate-500">End</th>
              <th className="text-left p-3 font-medium text-slate-500">Reason</th>
              <th className="text-left p-3 font-medium text-slate-500">Status</th>
              <th className="text-right p-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-slate-400">No leave records found.</td></tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-medium text-slate-800">{l.employeeName}</td>
                  <td className="p-3 capitalize text-slate-700">{formatStatus(l.type)}</td>
                  <td className="p-3 text-slate-500">{l.startDate}</td>
                  <td className="p-3 text-slate-500">{l.endDate}</td>
                  <td className="p-3 text-slate-500 text-xs max-w-[200px] truncate">{l.reason}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      l.status === "approved" ? "bg-emerald-50 text-emerald-700" :
                      l.status === "rejected" ? "bg-rose-50 text-rose-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>{formatStatus(l.status)}</span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    {l.status === "pending" && (
                      <>
                        <button onClick={() => updateLeave(l.id, { status: "approved" })} className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600" title="Approve"><Check className="h-4 w-4" /></button>
                        <button onClick={() => updateLeave(l.id, { status: "rejected" })} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-rose-600" title="Reject"><Ban className="h-4 w-4" /></button>
                      </>
                    )}
                    <button onClick={() => openEdit(l)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm("Delete?")) deleteLeave(l.id); }} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onKeyDown={(e) => e.key === "Escape" && setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Leave" : "Request Leave"}</h2>
              <button onClick={() => setShowForm(false)} className="hover:bg-slate-100 rounded-lg p-1.5 transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <select value={form.employeeId || ""} onChange={(e) => { const emp = employees.find((em) => em.id === Number(e.target.value)); if (emp) setForm({ ...form, employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}` }); }} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                  <option value="">Select Employee</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
                {errors.employee && <p className="text-xs text-rose-500 mt-1">{errors.employee}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                  {errors.startDate && <p className="text-xs text-rose-500 mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                  {errors.endDate && <p className="text-xs text-rose-500 mt-1">{errors.endDate}</p>}
                </div>
              </div>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Leave["type"] })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                <option value="sick">Sick</option>
                <option value="vacation">Vacation</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
              <textarea placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

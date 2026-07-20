import { useState } from "react";
import { useApp } from "../lib/store";
import type { AttendanceRecord } from "../lib/types";
import { formatStatus } from "../lib/utils";
import { Plus, Pencil, Trash2, X, CheckCircle } from "lucide-react";

export default function Attendance() {
  const { employees, attendance, addAttendance, updateAttendance, deleteAttendance } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ employeeId: 0, employeeName: "", date: new Date().toISOString().split("T")[0], checkIn: "", checkOut: "", status: "present" as AttendanceRecord["status"], notes: "" });
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);

  const filtered = attendance.filter((a) => a.date === filterDate);

  const openAdd = () => { setForm({ employeeId: 0, employeeName: "", date: new Date().toISOString().split("T")[0], checkIn: "", checkOut: "", status: "present", notes: "" }); setEditingId(null); setShowForm(true); };
  const openEdit = (rec: AttendanceRecord) => { setForm({ ...rec }); setEditingId(rec.id); setShowForm(true); };
  const handleEmployeeSelect = (id: number) => { const emp = employees.find((e) => e.id === id); if (emp) setForm({ ...form, employeeId: id, employeeName: `${emp.firstName} ${emp.lastName}` }); };
  const handleSubmit = () => { if (!form.employeeId || !form.date) return; if (editingId) updateAttendance(editingId, form); else addAttendance(form); setShowForm(false); };
  const handleCheckout = (id: number) => { const now = new Date(); updateAttendance(id, { checkOut: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Mark Attendance
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <label className="text-sm font-medium text-slate-700">Filter by Date:</label>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left p-3 font-medium text-slate-500">Employee</th>
              <th className="text-left p-3 font-medium text-slate-500">Date</th>
              <th className="text-left p-3 font-medium text-slate-500">Check In</th>
              <th className="text-left p-3 font-medium text-slate-500">Check Out</th>
              <th className="text-left p-3 font-medium text-slate-500">Status</th>
              <th className="text-left p-3 font-medium text-slate-500">Notes</th>
              <th className="text-right p-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-slate-400">No records for this date.</td></tr>
            ) : (
              filtered.map((rec) => (
                <tr key={rec.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-medium text-slate-800">{rec.employeeName}</td>
                  <td className="p-3 text-slate-500">{rec.date}</td>
                  <td className="p-3 text-slate-700">{rec.checkIn || "\u2014"}</td>
                  <td className="p-3 text-slate-700">{rec.checkOut || "\u2014"}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      rec.status === "present" ? "bg-emerald-50 text-emerald-700" :
                      rec.status === "late" ? "bg-amber-50 text-amber-700" :
                      rec.status === "absent" ? "bg-rose-50 text-rose-700" :
                      "bg-sky-50 text-sky-700"
                    }`}>{formatStatus(rec.status)}</span>
                  </td>
                  <td className="p-3 text-slate-500 text-xs">{rec.notes}</td>
                  <td className="p-3 text-right space-x-1">
                    {!rec.checkOut && rec.checkIn && (
                      <button onClick={() => handleCheckout(rec.id)} className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600" title="Check Out">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => openEdit(rec)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm("Delete?")) deleteAttendance(rec.id); }} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Attendance" : "Mark Attendance"}</h2>
              <button onClick={() => setShowForm(false)} className="hover:bg-slate-100 rounded-lg p-1.5 transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <select value={form.employeeId || ""} onChange={(e) => handleEmployeeSelect(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                <option value="">Select Employee</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
              <div className="grid grid-cols-2 gap-3">
                <input type="time" placeholder="Check In" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                <input type="time" placeholder="Check Out" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
              </div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AttendanceRecord["status"] })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
              </select>
              <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
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

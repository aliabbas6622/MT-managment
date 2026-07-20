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

  const openAdd = () => {
    setForm({ employeeId: 0, employeeName: "", date: new Date().toISOString().split("T")[0], checkIn: "", checkOut: "", status: "present", notes: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (rec: AttendanceRecord) => {
    setForm({ ...rec });
    setEditingId(rec.id);
    setShowForm(true);
  };

  const handleEmployeeSelect = (id: number) => {
    const emp = employees.find((e) => e.id === id);
    if (emp) setForm({ ...form, employeeId: id, employeeName: `${emp.firstName} ${emp.lastName}` });
  };

  const handleSubmit = () => {
    if (!form.employeeId || !form.date) return;
    if (editingId) {
      updateAttendance(editingId, form);
    } else {
      addAttendance(form);
    }
    setShowForm(false);
  };

  const handleCheckout = (id: number) => {
    const now = new Date();
    updateAttendance(id, { checkOut: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Mark Attendance
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <label className="text-sm font-medium">Filter by Date:</label>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-background" />
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Employee</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Check In</th>
              <th className="text-left p-3 font-medium">Check Out</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Notes</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No records for this date.</td></tr>
            ) : (
              filtered.map((rec) => (
                <tr key={rec.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{rec.employeeName}</td>
                  <td className="p-3 text-muted-foreground">{rec.date}</td>
                  <td className="p-3">{rec.checkIn || "\u2014"}</td>
                  <td className="p-3">{rec.checkOut || "\u2014"}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      rec.status === "present" ? "bg-green-100 text-green-700" :
                      rec.status === "late" ? "bg-yellow-100 text-yellow-700" :
                      rec.status === "absent" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{formatStatus(rec.status)}</span>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{rec.notes}</td>
                  <td className="p-3 text-right space-x-1">
                    {!rec.checkOut && rec.checkIn && (
                      <button onClick={() => handleCheckout(rec.id)} className="p-1 hover:bg-muted rounded text-green-600 transition-colors" title="Check Out">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => openEdit(rec)} className="p-1 hover:bg-muted rounded transition-colors"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm("Delete?")) deleteAttendance(rec.id); }} className="p-1 hover:bg-muted rounded text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="text-lg font-semibold">{editingId ? "Edit Attendance" : "Mark Attendance"}</h2>
              <button onClick={() => setShowForm(false)} className="hover:bg-muted rounded p-1"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <select value={form.employeeId || ""} onChange={(e) => handleEmployeeSelect(Number(e.target.value))} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="">Select Employee</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="time" placeholder="Check In" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
                <input type="time" placeholder="Check Out" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AttendanceRecord["status"] })} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
              </select>
              <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
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

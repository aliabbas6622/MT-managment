import { useState } from "react";
import { useApp } from "../lib/store";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export default function Departments() {
  const { departments, employees, addDepartment, updateDepartment, deleteDepartment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "" });

  const deptWithCount = departments.map((d) => ({ ...d, employeeCount: employees.filter((e) => e.department === d.name).length }));
  const openAdd = () => { setForm({ name: "" }); setEditingId(null); setShowForm(true); };
  const openEdit = (d: { id: number; name: string }) => { setForm({ name: d.name }); setEditingId(d.id); setShowForm(true); };
  const handleSubmit = () => { if (!form.name.trim()) return; if (editingId) updateDepartment(editingId, form); else addDepartment(form); setShowForm(false); };
  const handleDelete = (id: number, name: string) => { if (employees.some((e) => e.department === name)) { alert("Cannot delete: employees are assigned to this department."); return; } if (confirm("Delete this department?")) deleteDepartment(id); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deptWithCount.length === 0 ? (
          <p className="text-slate-400 col-span-full">No departments found.</p>
        ) : (
          deptWithCount.map((d) => (
            <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-800">{d.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(d.id, d.name)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="text-4xl font-extrabold text-slate-900">{d.employeeCount}</p>
              <p className="text-sm text-slate-500">employees</p>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onKeyDown={(e) => e.key === "Escape" && setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Department" : "Add Department"}</h2>
              <button onClick={() => setShowForm(false)} className="hover:bg-slate-100 rounded-lg p-1.5 transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <input placeholder="Department Name" value={form.name} onChange={(e) => setForm({ name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
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

import { useState } from "react";
import { useApp } from "../lib/store";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export default function Departments() {
  const { departments, employees, addDepartment, updateDepartment, deleteDepartment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "" });

  const deptWithCount = departments.map((d) => ({
    ...d,
    employeeCount: employees.filter((e) => e.department === d.name).length,
  }));

  const openAdd = () => { setForm({ name: "" }); setEditingId(null); setShowForm(true); };
  const openEdit = (d: { id: number; name: string }) => { setForm({ name: d.name }); setEditingId(d.id); setShowForm(true); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateDepartment(editingId, form);
    } else {
      addDepartment(form);
    }
    setShowForm(false);
  };

  const handleDelete = (id: number, name: string) => {
    const hasEmployees = employees.some((e) => e.department === name);
    if (hasEmployees) {
      alert("Cannot delete: employees are assigned to this department.");
      return;
    }
    if (confirm("Delete this department?")) deleteDepartment(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Departments</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deptWithCount.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No departments found.</p>
        ) : (
          deptWithCount.map((d) => (
            <div key={d.id} className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{d.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="p-1 hover:bg-muted rounded transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(d.id, d.name)} className="p-1 hover:bg-muted rounded text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="text-4xl font-extrabold">{d.employeeCount}</p>
              <p className="text-sm text-muted-foreground">employees</p>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onKeyDown={(e) => e.key === "Escape" && setShowForm(false)}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Department" : "Add Department"}</h2>
              <button onClick={() => setShowForm(false)} className="hover:bg-muted rounded p-1"><X className="h-5 w-5" /></button>
            </div>
            <input placeholder="Department Name" value={form.name} onChange={(e) => setForm({ name: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
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

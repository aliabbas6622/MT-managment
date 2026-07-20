import { useState } from "react";
import { useApp } from "../lib/store";
import type { Employee } from "../lib/types";
import { formatStatus, formatCurrency } from "../lib/utils";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const emptyEmployee: Omit<Employee, "id"> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  hireDate: new Date().toISOString().split("T")[0],
  salary: 0,
  status: "active",
};

export default function Employees() {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Employee, "id">>(emptyEmployee);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = employees.filter((e) => {
    const matchSearch = `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "all" || e.department === filterDept;
    return matchSearch && matchDept;
  });

  const openAdd = () => {
    setForm(emptyEmployee);
    setEditingId(null);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (emp: Employee) => {
    setForm({ ...emp });
    setEditingId(emp.id);
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (form.salary <= 0) errs.salary = "Must be > 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editingId) {
      updateEmployee(editingId, form);
    } else {
      addEmployee(form);
    }
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this employee? This will also remove their attendance and leave records.")) {
      deleteEmployee(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      <div className="flex gap-3">
        <input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
        />
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Phone</th>
              <th className="text-left p-3 font-medium">Position</th>
              <th className="text-left p-3 font-medium">Department</th>
              <th className="text-left p-3 font-medium">Salary</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No employees found.</td></tr>
            ) : (
              filtered.map((emp) => (
                <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{emp.firstName} {emp.lastName}</td>
                  <td className="p-3 text-muted-foreground">{emp.email}</td>
                  <td className="p-3 text-muted-foreground">{emp.phone}</td>
                  <td className="p-3">{emp.position}</td>
                  <td className="p-3">{emp.department}</td>
                  <td className="p-3">{formatCurrency(emp.salary)}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${emp.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {formatStatus(emp.status)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(emp)} className="p-1 hover:bg-muted rounded transition-colors"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(emp.id)} className="p-1 hover:bg-muted rounded text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="text-lg font-semibold">{editingId ? "Edit Employee" : "Add Employee"}</h2>
              <button onClick={() => setShowForm(false)} className="hover:bg-muted rounded p-1"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
              <div className="col-span-2">
                <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
              <input placeholder="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
              <div>
                <input type="number" placeholder="Salary" value={form.salary || ""} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} className="w-full border rounded-md px-3 py-2 text-sm" />
                {errors.salary && <p className="text-xs text-red-500 mt-1">{errors.salary}</p>}
              </div>
              <input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })} className="border rounded-md px-3 py-2 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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

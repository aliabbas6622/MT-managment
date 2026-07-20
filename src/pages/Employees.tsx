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

  const openAdd = () => { setForm(emptyEmployee); setEditingId(null); setErrors({}); setShowForm(true); };
  const openEdit = (emp: Employee) => { setForm({ ...emp }); setEditingId(emp.id); setErrors({}); setShowForm(true); };

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
    if (editingId) updateEmployee(editingId, form);
    else addEmployee(form);
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this employee? This will also remove their attendance and leave records.")) deleteEmployee(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      <div className="flex gap-3">
        <input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all">
          <option value="all">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left p-3 font-medium text-slate-500">Name</th>
              <th className="text-left p-3 font-medium text-slate-500">Email</th>
              <th className="text-left p-3 font-medium text-slate-500">Phone</th>
              <th className="text-left p-3 font-medium text-slate-500">Position</th>
              <th className="text-left p-3 font-medium text-slate-500">Department</th>
              <th className="text-left p-3 font-medium text-slate-500">Salary</th>
              <th className="text-left p-3 font-medium text-slate-500">Status</th>
              <th className="text-right p-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-6 text-center text-slate-400">No employees found.</td></tr>
            ) : (
              filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-medium text-slate-800">{emp.firstName} {emp.lastName}</td>
                  <td className="p-3 text-slate-500">{emp.email}</td>
                  <td className="p-3 text-slate-500">{emp.phone}</td>
                  <td className="p-3 text-slate-700">{emp.position}</td>
                  <td className="p-3 text-slate-700">{emp.department}</td>
                  <td className="p-3 text-slate-800">{formatCurrency(emp.salary)}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${emp.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {formatStatus(emp.status)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(emp)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(emp.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Employee" : "Add Employee"}</h2>
              <button onClick={() => setShowForm(false)} className="hover:bg-slate-100 rounded-lg p-1.5 transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                {errors.firstName && <p className="text-xs text-rose-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                {errors.lastName && <p className="text-xs text-rose-500 mt-1">{errors.lastName}</p>}
              </div>
              <div className="col-span-2">
                <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
              </div>
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
              <input placeholder="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
              <div>
                <input type="number" placeholder="Salary" value={form.salary || ""} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                {errors.salary && <p className="text-xs text-rose-500 mt-1">{errors.salary}</p>}
              </div>
              <input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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

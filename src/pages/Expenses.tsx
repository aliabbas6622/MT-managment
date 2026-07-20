import { useState } from "react";
import { useApp } from "../lib/store";
import { formatCurrency } from "../lib/utils";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const categories = ["Utilities", "Inventory", "Maintenance", "Salary", "Rent", "Marketing", "Other"];

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ category: "", amount: 0, description: "", date: new Date().toISOString().split("T")[0] });
  const [filterCategory, setFilterCategory] = useState("all");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = expenses.filter((e) => filterCategory === "all" || e.category === filterCategory);
  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);

  const openAdd = () => { setForm({ category: "", amount: 0, description: "", date: new Date().toISOString().split("T")[0] }); setEditingId(null); setErrors({}); setShowForm(true); };
  const openEdit = (exp: typeof expenses[0]) => { setForm({ ...exp }); setEditingId(exp.id); setErrors({}); setShowForm(true); };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.category) errs.category = "Required";
    if (form.amount <= 0) errs.amount = "Must be greater than 0";
    if (!form.date) errs.date = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => { if (!validate()) return; if (editingId) updateExpense(editingId, form); else addExpense(form); setShowForm(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        {["all", ...categories].map((c) => (
          <button key={c} onClick={() => setFilterCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterCategory === c ? "bg-emerald-500 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700"}`}>
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <span className="text-sm text-slate-500">Total ({filterCategory === "all" ? "All" : filterCategory}):</span>
        <span className="text-xl font-extrabold text-slate-900">{formatCurrency(totalFiltered)}</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left p-3 font-medium text-slate-500">Category</th>
              <th className="text-left p-3 font-medium text-slate-500">Amount</th>
              <th className="text-left p-3 font-medium text-slate-500">Description</th>
              <th className="text-left p-3 font-medium text-slate-500">Date</th>
              <th className="text-right p-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400">No expenses found.</td></tr>
            ) : (
              filtered.map((exp) => (
                <tr key={exp.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-3"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">{exp.category}</span></td>
                  <td className="p-3 font-bold text-slate-800">{formatCurrency(exp.amount)}</td>
                  <td className="p-3 text-slate-500">{exp.description}</td>
                  <td className="p-3 text-slate-500">{exp.date}</td>
                  <td className="p-3 text-right space-x-1">
                    <button onClick={() => openEdit(exp)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm("Delete?")) deleteExpense(exp.id); }} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Expense" : "Add Expense"}</h2>
              <button onClick={() => setShowForm(false)} className="hover:bg-slate-100 rounded-lg p-1.5 transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
              </div>
              <div>
                <input type="number" placeholder="Amount" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
              </div>
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
              <div>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
              </div>
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

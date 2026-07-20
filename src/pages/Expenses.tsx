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

  const handleSubmit = () => {
    if (!validate()) return;
    if (editingId) {
      updateExpense(editingId, form);
    } else {
      addExpense(form);
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        {["all", ...categories].map((c) => (
          <button key={c} onClick={() => setFilterCategory(c)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterCategory === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <span className="text-sm text-muted-foreground">Total ({filterCategory === "all" ? "All" : filterCategory}):</span>
        <span className="text-xl font-extrabold">{formatCurrency(totalFiltered)}</span>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-left p-3 font-medium">Amount</th>
              <th className="text-left p-3 font-medium">Description</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No expenses found.</td></tr>
            ) : (
              filtered.map((exp) => (
                <tr key={exp.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <span className="bg-muted px-2 py-1 rounded text-xs font-medium">{exp.category}</span>
                  </td>
                  <td className="p-3 font-bold">{formatCurrency(exp.amount)}</td>
                  <td className="p-3 text-muted-foreground">{exp.description}</td>
                  <td className="p-3 text-muted-foreground">{exp.date}</td>
                  <td className="p-3 text-right space-x-1">
                    <button onClick={() => openEdit(exp)} className="p-1 hover:bg-muted rounded transition-colors"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm("Delete?")) deleteExpense(exp.id); }} className="p-1 hover:bg-muted rounded text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="text-lg font-semibold">{editingId ? "Edit Expense" : "Add Expense"}</h2>
              <button onClick={() => setShowForm(false)} className="hover:bg-muted rounded p-1"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>
              <div>
                <input type="number" placeholder="Amount" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="w-full border rounded-md px-3 py-2 text-sm" />
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
              </div>
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
              <div>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>
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

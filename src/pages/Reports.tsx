import { useState } from "react";
import { useApp } from "../lib/store";
import { formatCurrency, formatStatus } from "../lib/utils";
import { BarChart3, Users, DollarSign, CalendarOff, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CHART_COLORS = ["#10b981", "#38bdf8", "#fbbf24", "#fb7185", "#94a3b8", "#a78bfa"];

export default function Reports() {
  const { employees, attendance, leaves, expenses, departments, settings } = useApp();
  const [activeReport, setActiveReport] = useState("overview");

  const activeEmps = employees.filter((e) => e.status === "active");
  const totalSalary = activeEmps.reduce((s, e) => s + e.salary, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const taxRate = settings.taxRate / 100;

  const expensesByCategory = expenses.reduce<Record<string, number>>((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});
  const deptStats = departments.map((d) => ({ name: d.name, count: employees.filter((e) => e.department === d.name).length, salary: employees.filter((e) => e.department === d.name && e.status === "active").reduce((s, e) => s + e.salary, 0) }));

  const reports = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "attendance", label: "Attendance", icon: Users },
    { id: "payroll", label: "Payroll", icon: DollarSign },
    { id: "expenses", label: "Expenses", icon: TrendingDown },
    { id: "leaves", label: "Leaves", icon: CalendarOff },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Reports</h1>

      <div className="flex gap-2 flex-wrap">
        {reports.map((r) => (
          <button key={r.id} onClick={() => setActiveReport(r.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeReport === r.id ? "bg-emerald-500 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700"}`}>
            <r.icon className="h-4 w-4" /> {r.label}
          </button>
        ))}
      </div>

      {activeReport === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[{ label: "Employees", value: activeEmps.length.toString() }, { label: "Total Salary", value: formatCurrency(totalSalary) }, { label: "Total Expenses", value: formatCurrency(totalExpenses) }, { label: "Net Outflow", value: formatCurrency(totalSalary + totalExpenses) }].map((c) => (
              <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-slate-500">{c.label}</p>
                <p className="text-4xl font-extrabold text-slate-900">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-800 mb-3">Department Breakdown</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100"><th className="text-left p-2 text-slate-500">Department</th><th className="text-left p-2 text-slate-500">Employees</th><th className="text-left p-2 text-slate-500">Salary Cost</th></tr></thead>
              <tbody>
                {deptStats.map((d) => (
                  <tr key={d.name} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"><td className="p-2 font-medium text-slate-800">{d.name}</td><td className="p-2 text-slate-600">{d.count}</td><td className="p-2 text-slate-800">{formatCurrency(d.salary)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === "attendance" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Attendance Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            {["present", "absent", "late", "half-day"].map((s) => (
              <div key={s} className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-4xl font-extrabold text-slate-900">{attendance.filter((a) => a.status === s).length}</p>
                <p className="text-xs text-slate-500 capitalize mt-1">{formatStatus(s)}</p>
              </div>
            ))}
          </div>
          {attendance.length > 0 && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={["present", "absent", "late", "half-day"].map((s) => ({ name: formatStatus(s), count: attendance.filter((a) => a.status === s).length }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: "#64748b" }} />
                <YAxis fontSize={12} tick={{ fill: "#64748b" }} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {[0, 1, 2, 3].map((i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-sm text-slate-500">Total records: {attendance.length}</p>
        </div>
      )}

      {activeReport === "payroll" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Payroll Report (Tax: {settings.taxRate}%)</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100"><th className="text-left p-2 text-slate-500">Employee</th><th className="text-left p-2 text-slate-500">Dept</th><th className="text-left p-2 text-slate-500">Gross</th><th className="text-left p-2 text-slate-500">Tax</th><th className="text-left p-2 text-slate-500">Net</th></tr></thead>
            <tbody>
              {activeEmps.map((e) => (
                <tr key={e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-2 font-medium text-slate-800">{e.firstName} {e.lastName}</td>
                  <td className="p-2 text-slate-600">{e.department}</td>
                  <td className="p-2 text-slate-700">{formatCurrency(e.salary)}</td>
                  <td className="p-2 text-rose-600">{formatCurrency(e.salary * taxRate)}</td>
                  <td className="p-2 text-emerald-600 font-medium">{formatCurrency(e.salary * (1 - taxRate))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReport === "expenses" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Expenses by Category</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={Object.entries(expensesByCategory).map(([name, amount]) => ({ name, amount }))} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {Object.entries(expensesByCategory).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {Object.entries(expensesByCategory).map(([cat, total], i) => (
                <div key={cat} className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="font-medium text-slate-700">{cat}</span>
                  </div>
                  <span className="font-bold text-slate-800">{formatCurrency(total)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-lg text-slate-800">
            <span>Total</span>
            <span>{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      )}

      {activeReport === "leaves" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Leave Summary</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {["pending", "approved", "rejected"].map((s) => (
              <div key={s} className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-4xl font-extrabold text-slate-900">{leaves.filter((l) => l.status === s).length}</p>
                <p className="text-xs text-slate-500 capitalize mt-1">{formatStatus(s)}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500">Total requests: {leaves.length}</p>
        </div>
      )}
    </div>
  );
}

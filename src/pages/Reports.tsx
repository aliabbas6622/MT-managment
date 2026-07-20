import { useState } from "react";
import { useApp } from "../lib/store";
import { formatCurrency, formatStatus } from "../lib/utils";
import { BarChart3, Users, DollarSign, CalendarOff, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#22c55e", "#ef4444", "#eab308", "#3b82f6", "#a855f7", "#ec4899"];

export default function Reports() {
  const { employees, attendance, leaves, expenses, departments, settings } = useApp();
  const [activeReport, setActiveReport] = useState("overview");

  const activeEmps = employees.filter((e) => e.status === "active");
  const totalSalary = activeEmps.reduce((s, e) => s + e.salary, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const taxRate = settings.taxRate / 100;

  const expensesByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const deptStats = departments.map((d) => ({
    name: d.name,
    count: employees.filter((e) => e.department === d.name).length,
    salary: employees.filter((e) => e.department === d.name && e.status === "active").reduce((s, e) => s + e.salary, 0),
  }));

  const reports = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "attendance", label: "Attendance", icon: Users },
    { id: "payroll", label: "Payroll", icon: DollarSign },
    { id: "expenses", label: "Expenses", icon: TrendingDown },
    { id: "leaves", label: "Leaves", icon: CalendarOff },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="flex gap-2 flex-wrap">
        {reports.map((r) => (
          <button key={r.id} onClick={() => setActiveReport(r.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeReport === r.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            <r.icon className="h-4 w-4" /> {r.label}
          </button>
        ))}
      </div>

      {activeReport === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"><p className="text-sm text-muted-foreground">Employees</p><p className="text-4xl font-extrabold">{activeEmps.length}</p></div>
            <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"><p className="text-sm text-muted-foreground">Total Salary</p><p className="text-4xl font-extrabold">{formatCurrency(totalSalary)}</p></div>
            <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-4xl font-extrabold">{formatCurrency(totalExpenses)}</p></div>
            <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"><p className="text-sm text-muted-foreground">Net Outflow</p><p className="text-4xl font-extrabold">{formatCurrency(totalSalary + totalExpenses)}</p></div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">Department Breakdown</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left p-2">Department</th><th className="text-left p-2">Employees</th><th className="text-left p-2">Salary Cost</th></tr></thead>
              <tbody>
                {deptStats.map((d) => (
                  <tr key={d.name} className="border-b last:border-0 hover:bg-muted/30 transition-colors"><td className="p-2 font-medium">{d.name}</td><td className="p-2">{d.count}</td><td className="p-2">{formatCurrency(d.salary)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === "attendance" && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h3 className="font-semibold">Attendance Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            {["present", "absent", "late", "half-day"].map((s) => (
              <div key={s} className="text-center p-3 bg-muted rounded-lg">
                <p className="text-4xl font-extrabold">{attendance.filter((a) => a.status === s).length}</p>
                <p className="text-xs text-muted-foreground capitalize">{formatStatus(s)}</p>
              </div>
            ))}
          </div>
          {attendance.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={["present", "absent", "late", "half-day"].map((s) => ({ name: formatStatus(s), count: attendance.filter((a) => a.status === s).length }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {[0, 1, 2, 3].map((i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-sm text-muted-foreground">Total records: {attendance.length}</p>
        </div>
      )}

      {activeReport === "payroll" && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-3">Payroll Report (Tax: {settings.taxRate}%)</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left p-2">Employee</th><th className="text-left p-2">Dept</th><th className="text-left p-2">Gross</th><th className="text-left p-2">Tax</th><th className="text-left p-2">Net</th></tr></thead>
            <tbody>
              {activeEmps.map((e) => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-2 font-medium">{e.firstName} {e.lastName}</td>
                  <td className="p-2">{e.department}</td>
                  <td className="p-2">{formatCurrency(e.salary)}</td>
                  <td className="p-2 text-red-600">{formatCurrency(e.salary * taxRate)}</td>
                  <td className="p-2 text-green-600">{formatCurrency(e.salary * (1 - taxRate))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReport === "expenses" && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h3 className="font-semibold">Expenses by Category</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={Object.entries(expensesByCategory).map(([name, amount]) => ({ name, amount }))}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {Object.entries(expensesByCategory).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {Object.entries(expensesByCategory).map(([cat, total], i) => (
                <div key={cat} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-medium">{cat}</span>
                  </div>
                  <span className="font-bold">{formatCurrency(total)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      )}

      {activeReport === "leaves" && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-3">Leave Summary</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {["pending", "approved", "rejected"].map((s) => (
              <div key={s} className="text-center p-3 bg-muted rounded-lg">
                <p className="text-4xl font-extrabold">{leaves.filter((l) => l.status === s).length}</p>
                <p className="text-xs text-muted-foreground capitalize">{formatStatus(s)}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Total requests: {leaves.length}</p>
        </div>
      )}
    </div>
  );
}

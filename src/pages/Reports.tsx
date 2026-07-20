import { useState } from "react";
import { useApp } from "../lib/store";
import { BarChart3, Users, DollarSign, CalendarOff, TrendingDown } from "lucide-react";

export default function Reports() {
  const { employees, attendance, leaves, expenses, departments } = useApp();
  const [activeReport, setActiveReport] = useState("overview");

  const activeEmps = employees.filter((e) => e.status === "active");
  const totalSalary = activeEmps.reduce((s, e) => s + e.salary, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

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

      <div className="flex gap-2">
        {reports.map((r) => (
          <button key={r.id} onClick={() => setActiveReport(r.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${activeReport === r.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            <r.icon className="h-4 w-4" /> {r.label}
          </button>
        ))}
      </div>

      {activeReport === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg border bg-card p-6"><p className="text-sm text-muted-foreground">Employees</p><p className="text-2xl font-bold">{activeEmps.length}</p></div>
            <div className="rounded-lg border bg-card p-6"><p className="text-sm text-muted-foreground">Total Salary</p><p className="text-2xl font-bold">Rs. {totalSalary.toLocaleString()}</p></div>
            <div className="rounded-lg border bg-card p-6"><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold">Rs. {totalExpenses.toLocaleString()}</p></div>
            <div className="rounded-lg border bg-card p-6"><p className="text-sm text-muted-foreground">Net Outflow</p><p className="text-2xl font-bold">Rs. {(totalSalary + totalExpenses).toLocaleString()}</p></div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">Department Breakdown</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left p-2">Department</th><th className="text-left p-2">Employees</th><th className="text-left p-2">Salary Cost</th></tr></thead>
              <tbody>
                {deptStats.map((d) => (
                  <tr key={d.name} className="border-b last:border-0"><td className="p-2 font-medium">{d.name}</td><td className="p-2">{d.count}</td><td className="p-2">Rs. {d.salary.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === "attendance" && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-3">Attendance Summary</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {["present", "absent", "late", "half-day"].map((s) => (
              <div key={s} className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{attendance.filter((a) => a.status === s).length}</p>
                <p className="text-xs text-muted-foreground capitalize">{s}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Total records: {attendance.length}</p>
        </div>
      )}

      {activeReport === "payroll" && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-3">Payroll Report</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left p-2">Employee</th><th className="text-left p-2">Dept</th><th className="text-left p-2">Gross</th><th className="text-left p-2">Tax</th><th className="text-left p-2">Net</th></tr></thead>
            <tbody>
              {activeEmps.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="p-2 font-medium">{e.firstName} {e.lastName}</td>
                  <td className="p-2">{e.department}</td>
                  <td className="p-2">Rs. {e.salary.toLocaleString()}</td>
                  <td className="p-2 text-red-600">Rs. {(e.salary * 0.05).toLocaleString()}</td>
                  <td className="p-2 text-green-600">Rs. {(e.salary * 0.95).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReport === "expenses" && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-3">Expenses by Category</h3>
          <div className="space-y-3">
            {Object.entries(expensesByCategory).map(([cat, total]) => (
              <div key={cat} className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">{cat}</span>
                <span className="font-bold">Rs. {total.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t flex justify-between font-bold">
            <span>Total</span>
            <span>Rs. {totalExpenses.toLocaleString()}</span>
          </div>
        </div>
      )}

      {activeReport === "leaves" && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-3">Leave Summary</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {["pending", "approved", "rejected"].map((s) => (
              <div key={s} className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{leaves.filter((l) => l.status === s).length}</p>
                <p className="text-xs text-muted-foreground capitalize">{s}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Total requests: {leaves.length}</p>
        </div>
      )}
    </div>
  );
}

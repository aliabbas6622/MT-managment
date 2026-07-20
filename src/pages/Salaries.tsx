import { useState } from "react";
import { useApp } from "../lib/store";
import { Download } from "lucide-react";

export default function Salaries() {
  const { employees } = useApp();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const activeEmployees = employees.filter((e) => e.status === "active");
  const totalSalary = activeEmployees.reduce((sum, e) => sum + e.salary, 0);

  const payroll = activeEmployees.map((e) => {
    const tax = e.salary * 0.05;
    const gross = e.salary;
    const net = gross - tax;
    return { ...e, tax, gross, net };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Salaries</h1>
        <div className="flex gap-2">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-background" />
          <button className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p className="text-sm text-muted-foreground">Total Employees</p>
          <p className="text-3xl font-bold mt-2">{activeEmployees.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p className="text-sm text-muted-foreground">Total Gross Salary</p>
          <p className="text-3xl font-bold mt-2">Rs. {totalSalary.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p className="text-sm text-muted-foreground">Total Tax (5%)</p>
          <p className="text-3xl font-bold mt-2 text-red-600">Rs. {(totalSalary * 0.05).toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Employee</th>
              <th className="text-left p-3 font-medium">Position</th>
              <th className="text-left p-3 font-medium">Gross</th>
              <th className="text-left p-3 font-medium">Tax (5%)</th>
              <th className="text-left p-3 font-medium">Net Pay</th>
            </tr>
          </thead>
          <tbody>
            {payroll.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium">{p.firstName} {p.lastName}</td>
                <td className="p-3 text-muted-foreground">{p.position}</td>
                <td className="p-3">Rs. {p.gross.toLocaleString()}</td>
                <td className="p-3 text-red-600">Rs. {p.tax.toLocaleString()}</td>
                <td className="p-3 font-bold text-green-600">Rs. {p.net.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/50 font-bold">
              <td className="p-3" colSpan={2}>Total</td>
              <td className="p-3">Rs. {totalSalary.toLocaleString()}</td>
              <td className="p-3 text-red-600">Rs. {(totalSalary * 0.05).toLocaleString()}</td>
              <td className="p-3 text-green-600">Rs. {(totalSalary * 0.95).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

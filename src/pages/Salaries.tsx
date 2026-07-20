import { useState } from "react";
import { useApp } from "../lib/store";
import { formatCurrency } from "../lib/utils";
import { Download } from "lucide-react";

export default function Salaries() {
  const { employees, settings } = useApp();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const activeEmployees = employees.filter((e) => e.status === "active");
  const taxRate = settings.taxRate / 100;
  const totalSalary = activeEmployees.reduce((sum, e) => sum + e.salary, 0);

  const payroll = activeEmployees.map((e) => {
    const tax = e.salary * taxRate;
    const gross = e.salary;
    const net = gross - tax;
    return { ...e, tax, gross, net };
  });

  const handleExport = () => {
    const headers = ["Employee", "Position", "Gross", `Tax (${settings.taxRate}%)`, "Net"];
    const rows = payroll.map((p) => [`${p.firstName} ${p.lastName}`, p.position, p.gross, p.tax, p.net]);
    const totalRow = ["TOTAL", "", totalSalary, totalSalary * taxRate, totalSalary * (1 - taxRate)];
    const csv = [headers, ...rows, totalRow].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Salaries</h1>
        <div className="flex gap-2">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-background" />
          <button onClick={handleExport} className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground">Total Employees</p>
          <p className="text-4xl font-extrabold mt-2">{activeEmployees.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground">Total Gross Salary</p>
          <p className="text-4xl font-extrabold mt-2">{formatCurrency(totalSalary)}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground">Total Tax ({settings.taxRate}%)</p>
          <p className="text-4xl font-extrabold mt-2 text-red-600">{formatCurrency(totalSalary * taxRate)}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Employee</th>
              <th className="text-left p-3 font-medium">Position</th>
              <th className="text-left p-3 font-medium">Gross</th>
              <th className="text-left p-3 font-medium">Tax ({settings.taxRate}%)</th>
              <th className="text-left p-3 font-medium">Net Pay</th>
            </tr>
          </thead>
          <tbody>
            {payroll.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium">{p.firstName} {p.lastName}</td>
                <td className="p-3 text-muted-foreground">{p.position}</td>
                <td className="p-3">{formatCurrency(p.gross)}</td>
                <td className="p-3 text-red-600">{formatCurrency(p.tax)}</td>
                <td className="p-3 font-bold text-green-600">{formatCurrency(p.net)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/50 font-bold">
              <td className="p-3" colSpan={2}>Total</td>
              <td className="p-3">{formatCurrency(totalSalary)}</td>
              <td className="p-3 text-red-600">{formatCurrency(totalSalary * taxRate)}</td>
              <td className="p-3 text-green-600">{formatCurrency(totalSalary * (1 - taxRate))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

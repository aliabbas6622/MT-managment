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
  const payroll = activeEmployees.map((e) => ({ ...e, tax: e.salary * taxRate, gross: e.salary, net: e.salary * (1 - taxRate) }));

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
        <h1 className="text-2xl font-bold text-slate-900">Salaries</h1>
        <div className="flex gap-2">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
          <button onClick={handleExport} className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors text-slate-700">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Employees", value: activeEmployees.length.toString() },
          { label: "Total Gross Salary", value: formatCurrency(totalSalary) },
          { label: `Total Tax (${settings.taxRate}%)`, value: formatCurrency(totalSalary * taxRate), accent: true },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className={`text-4xl font-extrabold mt-2 ${c.accent ? "text-rose-600" : "text-slate-900"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left p-3 font-medium text-slate-500">Employee</th>
              <th className="text-left p-3 font-medium text-slate-500">Position</th>
              <th className="text-left p-3 font-medium text-slate-500">Gross</th>
              <th className="text-left p-3 font-medium text-slate-500">Tax ({settings.taxRate}%)</th>
              <th className="text-left p-3 font-medium text-slate-500">Net Pay</th>
            </tr>
          </thead>
          <tbody>
            {payroll.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                <td className="p-3 font-medium text-slate-800">{p.firstName} {p.lastName}</td>
                <td className="p-3 text-slate-500">{p.position}</td>
                <td className="p-3 text-slate-700">{formatCurrency(p.gross)}</td>
                <td className="p-3 text-rose-600">{formatCurrency(p.tax)}</td>
                <td className="p-3 font-bold text-emerald-600">{formatCurrency(p.net)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50/50 font-bold">
              <td className="p-3 text-slate-700" colSpan={2}>Total</td>
              <td className="p-3 text-slate-800">{formatCurrency(totalSalary)}</td>
              <td className="p-3 text-rose-600">{formatCurrency(totalSalary * taxRate)}</td>
              <td className="p-3 text-emerald-600">{formatCurrency(totalSalary * (1 - taxRate))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

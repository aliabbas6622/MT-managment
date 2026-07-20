import { useNavigate } from "react-router-dom";
import { useApp } from "../lib/store";
import { formatStatus, formatCurrency } from "../lib/utils";
import {
  Users,
  Clock,
  CalendarOff,
  DollarSign,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Play,
  FileDown,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CHART_COLORS = ["#10b981", "#38bdf8", "#fbbf24", "#fb7185", "#94a3b8"];

export default function Dashboard() {
  const { employees, attendance, leaves, expenses } = useApp();
  const navigate = useNavigate();

  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const presentToday = attendance.filter((a) => a.status === "present" || a.status === "late").length;
  const onLeave = leaves.filter((l) => l.status === "approved").length;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalaries = employees.filter((e) => e.status === "active").reduce((sum, e) => sum + e.salary, 0);

  const stats = [
    { label: "Total Employees", value: activeEmployees, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Present Today", value: presentToday, icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "On Leave", value: onLeave, icon: CalendarOff, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Monthly Expenses", value: formatCurrency(totalExpenses), icon: DollarSign, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const quickActions = [
    { label: "Add Employee", icon: UserPlus, action: () => navigate("/employees"), primary: true },
    { label: "Take Attendance", icon: Play, action: () => navigate("/attendance"), primary: false },
    { label: "Generate Payroll", icon: DollarSign, action: () => navigate("/salaries"), primary: false },
    { label: "Export Report", icon: FileDown, action: () => navigate("/reports"), primary: false },
  ];

  const attendanceData = [
    { name: "Present", value: attendance.filter((a) => a.status === "present").length },
    { name: "Late", value: attendance.filter((a) => a.status === "late").length },
    { name: "Absent", value: attendance.filter((a) => a.status === "absent").length },
    { name: "Half Day", value: attendance.filter((a) => a.status === "half-day").length },
  ].filter((d) => d.value > 0);

  const expenseData = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const expenseChartData = Object.entries(expenseData).map(([name, amount]) => ({ name, amount }));

  const recentAttendance = attendance.slice(0, 5);
  const recentLeaves = leaves.filter((l) => l.status === "pending").slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-default group">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{s.label}</p>
              <div className={`${s.bg} ${s.color} rounded-lg p-2.5 group-hover:scale-110 transition-transform`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold mt-3 tracking-tight text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={a.action}
            className={`rounded-xl px-4 py-3 flex items-center gap-2.5 text-sm font-medium transition-all hover:shadow-md active:scale-[0.98] ${
              a.primary
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
            }`}
          >
            <a.icon className="h-4 w-4" />
            {a.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-400" />
            Attendance Overview
          </h2>
          {attendanceData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No attendance data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: "#64748b" }} />
                <YAxis fontSize={12} tick={{ fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {attendanceData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-slate-400" />
            Expenses by Category
          </h2>
          {expenseChartData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No expense data yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={40}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {expenseChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {expenseChartData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-medium text-slate-800">{formatCurrency(d.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Today's Attendance</h2>
          {recentAttendance.length === 0 ? (
            <p className="text-slate-400 text-sm">No attendance records today.</p>
          ) : (
            <div className="space-y-3">
              {recentAttendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-slate-800">{a.employeeName}</p>
                    <p className="text-xs text-slate-500">Check in: {a.checkIn || "\u2014"}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    a.status === "present" ? "bg-emerald-50 text-emerald-700" :
                    a.status === "late" ? "bg-amber-50 text-amber-700" :
                    a.status === "absent" ? "bg-rose-50 text-rose-700" :
                    "bg-sky-50 text-sky-700"
                  }`}>
                    {formatStatus(a.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pending Leave Requests</h2>
          {recentLeaves.length === 0 ? (
            <p className="text-slate-400 text-sm">No pending leave requests.</p>
          ) : (
            <div className="space-y-3">
              {recentLeaves.map((l) => (
                <div key={l.id} className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-slate-800">{l.employeeName}</p>
                    <p className="text-xs text-slate-500">{l.startDate} to {l.endDate}</p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 capitalize">
                    {formatStatus(l.type)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 rounded-xl p-2.5">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Salaries</p>
              <p className="font-bold text-lg text-slate-800">{formatCurrency(totalSalaries)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-rose-50 text-rose-600 rounded-xl p-2.5">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Expenses</p>
              <p className="font-bold text-lg text-slate-800">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 text-slate-600 rounded-xl p-2.5">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Outflow</p>
              <p className="font-bold text-lg text-slate-800">{formatCurrency(totalSalaries + totalExpenses)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

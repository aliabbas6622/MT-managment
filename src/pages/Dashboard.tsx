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

const COLORS = ["#22c55e", "#ef4444", "#eab308", "#3b82f6"];

export default function Dashboard() {
  const { employees, attendance, leaves, expenses } = useApp();
  const navigate = useNavigate();

  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const presentToday = attendance.filter((a) => a.status === "present" || a.status === "late").length;
  const onLeave = leaves.filter((l) => l.status === "approved").length;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalaries = employees.filter((e) => e.status === "active").reduce((sum, e) => sum + e.salary, 0);

  const stats = [
    { label: "Total Employees", value: activeEmployees, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Present Today", value: presentToday, icon: Clock, color: "text-green-600", bg: "bg-green-50" },
    { label: "On Leave", value: onLeave, icon: CalendarOff, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Monthly Expenses", value: formatCurrency(totalExpenses), icon: DollarSign, color: "text-red-600", bg: "bg-red-50" },
  ];

  const quickActions = [
    { label: "Add Employee", icon: UserPlus, action: () => navigate("/employees"), color: "bg-blue-500 hover:bg-blue-600" },
    { label: "Take Attendance", icon: Play, action: () => navigate("/attendance"), color: "bg-green-500 hover:bg-green-600" },
    { label: "Generate Payroll", icon: DollarSign, action: () => navigate("/salaries"), color: "bg-purple-500 hover:bg-purple-600" },
    { label: "Export Report", icon: FileDown, action: () => navigate("/reports"), color: "bg-orange-500 hover:bg-orange-600" },
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
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-default group">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <div className={`${s.bg} ${s.color} rounded-lg p-2.5 group-hover:scale-110 transition-transform`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold mt-3 tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={a.action}
            className={`${a.color} text-white rounded-lg px-4 py-3 flex items-center gap-2 text-sm font-medium transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]`}
          >
            <a.icon className="h-4 w-4" />
            {a.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Attendance Overview
          </h2>
          {attendanceData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No attendance data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {attendanceData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
            Expenses by Category
          </h2>
          {expenseChartData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No expense data yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {expenseChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {expenseChartData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span>{d.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(d.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Today's Attendance</h2>
          {recentAttendance.length === 0 ? (
            <p className="text-muted-foreground text-sm">No attendance records today.</p>
          ) : (
            <div className="space-y-3">
              {recentAttendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{a.employeeName}</p>
                    <p className="text-xs text-muted-foreground">Check in: {a.checkIn || "\u2014"}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    a.status === "present" ? "bg-green-100 text-green-700" :
                    a.status === "late" ? "bg-yellow-100 text-yellow-700" :
                    a.status === "absent" ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {formatStatus(a.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Pending Leave Requests</h2>
          {recentLeaves.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending leave requests.</p>
          ) : (
            <div className="space-y-3">
              {recentLeaves.map((l) => (
                <div key={l.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{l.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{l.startDate} to {l.endDate}</p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 capitalize">
                    {formatStatus(l.type)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 text-green-600 rounded-lg p-2.5">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Salaries</p>
              <p className="font-bold text-lg">{formatCurrency(totalSalaries)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-50 text-red-600 rounded-lg p-2.5">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="font-bold text-lg">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 rounded-lg p-2.5">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Outflow</p>
              <p className="font-bold text-lg">{formatCurrency(totalSalaries + totalExpenses)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

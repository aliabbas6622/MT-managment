import { useApp } from "../lib/store";
import { Users, Clock, CalendarOff, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function Dashboard() {
  const { employees, attendance, leaves, expenses } = useApp();

  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const presentToday = attendance.filter((a) => a.status === "present" || a.status === "late").length;
  const onLeave = leaves.filter((l) => l.status === "approved").length;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalaries = employees.filter((e) => e.status === "active").reduce((sum, e) => sum + e.salary, 0);

  const stats = [
    { label: "Total Employees", value: activeEmployees.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Present Today", value: presentToday.toString(), icon: Clock, color: "text-green-600", bg: "bg-green-50" },
    { label: "On Leave", value: onLeave.toString(), icon: CalendarOff, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Monthly Expenses", value: `Rs. ${totalExpenses.toLocaleString()}`, icon: DollarSign, color: "text-red-600", bg: "bg-red-50" },
  ];

  const recentAttendance = attendance.slice(0, 5);
  const recentLeaves = leaves.filter((l) => l.status === "pending").slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <div className={`${s.bg} ${s.color} rounded-md p-2`}>
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">{s.value}</p>
          </div>
        ))}
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
                    <p className="text-xs text-muted-foreground">Check in: {a.checkIn || "—"}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    a.status === "present" ? "bg-green-100 text-green-700" :
                    a.status === "late" ? "bg-yellow-100 text-yellow-700" :
                    a.status === "absent" ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {a.status}
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
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    {l.type}
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
            <div className="bg-green-50 text-green-600 rounded-md p-2">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Salaries</p>
              <p className="font-bold">Rs. {totalSalaries.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-50 text-red-600 rounded-md p-2">
              <TrendingDown className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="font-bold">Rs. {totalExpenses.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 rounded-md p-2">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net (Salaries + Expenses)</p>
              <p className="font-bold">Rs. {(totalSalaries + totalExpenses).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Clock,
  DollarSign,
  CalendarOff,
  Building2,
  Receipt,
  BarChart3,
  Settings,
  FileText,
  Terminal,
} from "lucide-react";
import { isDevAuthenticated } from "../pages/Developer";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/employees", icon: Users, label: "Employees" },
  { to: "/attendance", icon: Clock, label: "Attendance" },
  { to: "/salaries", icon: DollarSign, label: "Salaries" },
  { to: "/leaves", icon: CalendarOff, label: "Leaves" },
  { to: "/departments", icon: Building2, label: "Departments" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/audit-logs", icon: FileText, label: "Audit Logs" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Layout() {
  const location = useLocation();
  const isDevPage = location.pathname === "/developer";
  const showDevLink = isDevAuthenticated();

  return (
    <div className="flex h-screen">
      {!isDevPage && (
        <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col gap-1 shrink-0">
          <h1 className="text-lg font-bold mb-6 px-3">Malir Tonight</h1>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          {showDevLink && (
            <NavLink
              to="/developer"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors mt-auto ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "text-purple-600 hover:bg-purple-50"
                }`
              }
            >
              <Terminal className="h-4 w-4" />
              Developer
            </NavLink>
          )}
        </aside>
      )}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

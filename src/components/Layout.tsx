import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
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
  Search,
  Star,
  Cloud,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Lock,
} from "lucide-react";
import { useApp } from "../lib/store";
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

const premiumFeatures = [
  { icon: Star, label: "Analytics", desc: "Advanced analytics & insights" },
  { icon: Cloud, label: "Cloud Sync", desc: "Sync data across devices" },
  { icon: Bell, label: "Notifications", desc: "Real-time push notifications" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { employees, settings } = useApp();
  const isDevPage = location.pathname === "/developer";
  const showDevLink = isDevAuthenticated();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const premiumRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const searchResults = searchQuery.length > 0
    ? employees.filter((e) =>
        `${e.firstName} ${e.lastName} ${e.email} ${e.position}`.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowProfile(false);
        setShowPremium(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (premiumRef.current && !premiumRef.current.contains(e.target as Node)) setShowPremium(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (isDevPage) {
    return (
      <div className="flex h-screen">
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r border-border bg-white p-4 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-1 px-3">
          <span className="text-2xl">🍴</span>
          <div>
            <h1 className="text-lg font-bold leading-tight text-emerald-800">Malir Tonight</h1>
            <p className="text-[10px] text-slate-500 leading-tight">Restaurant Office Suite</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 px-3 mb-5">v1.0</p>

        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 border-l-[3px] border-emerald-500 ml-0"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 space-y-2">
          <div className="relative" ref={premiumRef}>
            <button onClick={() => setShowPremium(!showPremium)} className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-800 bg-amber-50 hover:bg-amber-100/80 transition-colors border border-amber-200/50">
              <Star className="h-4 w-4 text-amber-500" />
              Premium Features
              <Lock className="h-3 w-3 ml-auto text-amber-400" />
            </button>
            {showPremium && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-lg p-3 space-y-2 z-50">
                <p className="text-xs font-semibold text-slate-500 mb-2 px-1">Premium Feature</p>
                {premiumFeatures.map((f) => (
                  <div key={f.label} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <f.icon className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800">{f.label}</p>
                      <p className="text-[10px] text-slate-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 px-1">Contact your developer to activate your license.</p>
              </div>
            )}
          </div>

          {showDevLink && (
            <NavLink
              to="/developer"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`
              }
            >
              <Terminal className="h-4 w-4" />
              Developer
            </NavLink>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border bg-white flex items-center justify-between px-6 shrink-0">
          <div className="relative">
            <button
              onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 100); }}
              className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition-all w-72"
            >
              <Search className="h-4 w-4" />
              <span>Search employees...</span>
              <kbd className="ml-auto text-[10px] bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-400">Ctrl+K</kbd>
            </button>
            {showSearch && (
              <div className="absolute top-full left-0 mt-1 w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center border-b border-slate-100 px-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    ref={searchRef}
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-3.5 text-sm outline-none bg-transparent"
                  />
                  <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="text-xs text-slate-400 hover:text-slate-600 px-2">Esc</button>
                </div>
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => { navigate("/employees"); setShowSearch(false); setSearchQuery(""); }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                          {e.firstName[0]}{e.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{e.firstName} {e.lastName}</p>
                          <p className="text-xs text-slate-500">{e.position} &middot; {e.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length > 0 ? (
                  <p className="p-6 text-sm text-slate-400 text-center">No results found.</p>
                ) : (
                  <p className="p-6 text-sm text-slate-400 text-center">Type to search employees...</p>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 hover:bg-slate-50 rounded-xl px-3 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                {settings.ownerName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-800 leading-tight">{settings.ownerName}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            {showProfile && (
              <div className="absolute top-full right-0 mt-1 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-sm font-medium text-slate-800">{settings.ownerName}</p>
                  <p className="text-xs text-slate-500">{settings.ownerEmail}</p>
                </div>
                <button
                  onClick={() => { navigate("/settings"); setShowProfile(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="h-4 w-4 text-slate-400" /> Profile
                </button>
                <button
                  onClick={() => { navigate("/settings"); setShowProfile(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="h-4 w-4 text-slate-400" /> Change Password
                </button>
                <hr className="border-slate-100 my-1" />
                <button
                  onClick={() => { localStorage.clear(); window.location.reload(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

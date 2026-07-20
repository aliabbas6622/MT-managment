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
      <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-1 px-3">
          <span className="text-2xl">🍴</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Malir Tonight</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">Restaurant Office Suite</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground px-3 mb-5">v1.0</p>

        <nav className="flex flex-col gap-1 flex-1">
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
        </nav>

        <div className="mt-4 space-y-2">
          <div className="relative" ref={premiumRef}>
            <button onClick={() => setShowPremium(!showPremium)} className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors">
              <Star className="h-4 w-4" />
              Premium Features
              <Lock className="h-3 w-3 ml-auto" />
            </button>
            {showPremium && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-background border rounded-lg shadow-lg p-3 space-y-2 z-50">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Premium Feature</p>
                {premiumFeatures.map((f) => (
                  <div key={f.label} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                    <f.icon className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-xs font-medium">{f.label}</p>
                      <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground border-t pt-2">Contact your developer to activate your license.</p>
              </div>
            )}
          </div>

          {showDevLink && (
            <NavLink
              to="/developer"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b bg-background flex items-center justify-between px-6 shrink-0">
          <div className="relative">
            <button
              onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 100); }}
              className="flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors w-72"
            >
              <Search className="h-4 w-4" />
              <span>Search employees...</span>
              <kbd className="ml-auto text-[10px] bg-muted border rounded px-1">Ctrl+K</kbd>
            </button>
            {showSearch && (
              <div className="absolute top-full left-0 mt-1 w-96 bg-background border rounded-lg shadow-lg z-50">
                <div className="flex items-center border-b px-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-3 text-sm outline-none bg-transparent"
                  />
                  <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="text-xs text-muted-foreground hover:text-foreground">Esc</button>
                </div>
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => { navigate("/employees"); setShowSearch(false); setSearchQuery(""); }}
                        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                          {e.firstName[0]}{e.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{e.firstName} {e.lastName}</p>
                          <p className="text-xs text-muted-foreground">{e.position} &middot; {e.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length > 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No results found.</p>
                ) : (
                  <p className="p-4 text-sm text-muted-foreground text-center">Type to search employees...</p>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 hover:bg-muted rounded-lg px-3 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                {settings.ownerName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium leading-tight">{settings.ownerName}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {showProfile && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-background border rounded-lg shadow-lg z-50 py-1">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{settings.ownerName}</p>
                  <p className="text-xs text-muted-foreground">{settings.ownerEmail}</p>
                </div>
                <button
                  onClick={() => { navigate("/settings"); setShowProfile(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <User className="h-4 w-4" /> Profile
                </button>
                <button
                  onClick={() => { navigate("/settings"); setShowProfile(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <Settings className="h-4 w-4" /> Change Password
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => { localStorage.clear(); window.location.reload(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

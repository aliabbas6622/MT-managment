import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./lib/store";
import { LicenseProvider } from "./lib/license";
import { AuthProvider, useAuth } from "./lib/auth";
import ToastContainer from "./components/Toast";
import { startSyncWorker, stopSyncWorker } from "./services/sync.service";
import { useEffect } from "react";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Salaries from "./pages/Salaries";
import Leaves from "./pages/Leaves";
import Departments from "./pages/Departments";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AuditLogs from "./pages/AuditLogs";
import Users from "./pages/Users";
import Developer from "./pages/Developer";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppInner() {
  useEffect(() => {
    startSyncWorker();
    return () => stopSyncWorker();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="salaries" element={<Salaries />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="departments" element={<Departments />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="users" element={<Users />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <LicenseProvider>
          <AppInner />
          <ToastContainer />
        </LicenseProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;

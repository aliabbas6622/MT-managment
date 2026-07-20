import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./lib/store";
import Layout from "./components/Layout";
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
import Developer from "./pages/Developer";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
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
            <Route path="developer" element={<Developer />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

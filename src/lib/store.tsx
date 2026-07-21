import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Employee,
  AttendanceRecord,
  Leave,
  Department,
  Expense,
  AuditLog,
} from "./types";
import { api } from "../services/api";

interface AppSettings {
  restaurantName: string;
  currency: string;
  taxRate: number;
  darkMode: boolean;
  ownerName: string;
  ownerEmail: string;
  notifications: {
    email: boolean;
    leaveAlerts: boolean;
    attendanceAlerts: boolean;
    expenseAlerts: boolean;
  };
}

interface AppState {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: Leave[];
  departments: Department[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  settings: AppSettings;
  loading: boolean;
  connected: boolean;
}

interface AppContextType extends AppState {
  addEmployee: (e: Omit<Employee, "id">) => Promise<void>;
  updateEmployee: (id: number, e: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
  addAttendance: (a: Omit<AttendanceRecord, "id">) => Promise<void>;
  updateAttendance: (id: number, a: Partial<AttendanceRecord>) => Promise<void>;
  deleteAttendance: (id: number) => Promise<void>;
  addLeave: (l: Omit<Leave, "id">) => Promise<void>;
  updateLeave: (id: number, l: Partial<Leave>) => Promise<void>;
  deleteLeave: (id: number) => Promise<void>;
  addDepartment: (d: Omit<Department, "id" | "employeeCount">) => Promise<void>;
  updateDepartment: (id: number, d: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: number) => Promise<boolean>;
  addExpense: (e: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: number, e: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  addAuditLog: (log: Omit<AuditLog, "id" | "timestamp">) => Promise<void>;
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const defaultSettings: AppSettings = {
  restaurantName: "Malir Tonight",
  currency: "PKR",
  taxRate: 5,
  darkMode: false,
  ownerName: "Ali Abbas",
  ownerEmail: "admin@malir-tonight.com",
  notifications: {
    email: true,
    leaveAlerts: true,
    attendanceAlerts: true,
    expenseAlerts: true,
  },
};

function loadCachedState(): AppState {
  try {
    const raw = localStorage.getItem("malir-tonight-data");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.settings) return { ...parsed, loading: true, connected: false };
    }
  } catch {}
  return {
    employees: [], attendance: [], leaves: [], departments: [],
    expenses: [], auditLogs: [], settings: defaultSettings,
    loading: true, connected: false,
  };
}

function saveCache(state: AppState) {
  const { loading, connected, ...data } = state;
  localStorage.setItem("malir-tonight-data", JSON.stringify(data));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadCachedState);

  const refreshData = useCallback(async () => {
    try {
      const [employees, attendance, leaves, departments, expenses, auditLogs] = await Promise.all([
        api.employees.list(),
        api.attendance.list(),
        api.leaves.list(),
        api.departments.list(),
        api.expenses.list(),
        api.auditLogs.list(),
      ]);

      const serverSettings = await api.settings.get();

      const mergedSettings: AppSettings = {
        ...defaultSettings,
        ...(serverSettings as Partial<AppSettings>),
        notifications: {
          ...defaultSettings.notifications,
          ...((serverSettings as any)?.notifications || {}),
        },
      };

      const next: AppState = {
        employees, attendance, leaves, departments, expenses, auditLogs,
        settings: mergedSettings, loading: false, connected: true,
      };

      setState(next);
      saveCache(next);
    } catch (err) {
      console.warn("API unavailable, using cached data:", err);
      setState((prev) => ({ ...prev, loading: false, connected: false }));
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  useEffect(() => {
    if (!state.loading) saveCache(state);
  }, [state]);

  const addEmployee = useCallback(async (e: Omit<Employee, "id">) => {
    const created = await api.employees.create(e);
    setState((prev) => ({ ...prev, employees: [...prev.employees, created] }));
  }, []);

  const updateEmployee = useCallback(async (id: number, data: Partial<Employee>) => {
    const updated = await api.employees.update(id, data);
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((e) => (e.id === id ? updated : e)),
    }));
  }, []);

  const deleteEmployee = useCallback(async (id: number) => {
    await api.employees.delete(id);
    setState((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.id !== id),
      attendance: prev.attendance.filter((a) => a.employeeId !== id),
      leaves: prev.leaves.filter((l) => l.employeeId !== id),
    }));
  }, []);

  const addAttendance = useCallback(async (a: Omit<AttendanceRecord, "id">) => {
    const created = await api.attendance.create(a);
    setState((prev) => ({ ...prev, attendance: [...prev.attendance, created] }));
  }, []);

  const updateAttendance = useCallback(async (id: number, data: Partial<AttendanceRecord>) => {
    const updated = await api.attendance.update(id, data);
    setState((prev) => ({
      ...prev,
      attendance: prev.attendance.map((a) => (a.id === id ? updated : a)),
    }));
  }, []);

  const deleteAttendance = useCallback(async (id: number) => {
    await api.attendance.delete(id);
    setState((prev) => ({
      ...prev,
      attendance: prev.attendance.filter((a) => a.id !== id),
    }));
  }, []);

  const addLeave = useCallback(async (l: Omit<Leave, "id">) => {
    const created = await api.leaves.create(l);
    setState((prev) => ({ ...prev, leaves: [...prev.leaves, created] }));
  }, []);

  const updateLeave = useCallback(async (id: number, data: Partial<Leave>) => {
    const updated = await api.leaves.update(id, data);
    setState((prev) => ({
      ...prev,
      leaves: prev.leaves.map((l) => (l.id === id ? updated : l)),
    }));
  }, []);

  const deleteLeave = useCallback(async (id: number) => {
    await api.leaves.delete(id);
    setState((prev) => ({
      ...prev,
      leaves: prev.leaves.filter((l) => l.id !== id),
    }));
  }, []);

  const addDepartment = useCallback(async (d: Omit<Department, "id" | "employeeCount">) => {
    const created = await api.departments.create({ ...d, employeeCount: 0 });
    setState((prev) => ({ ...prev, departments: [...prev.departments, created] }));
  }, []);

  const updateDepartment = useCallback(async (id: number, data: Partial<Department>) => {
    const updated = await api.departments.update(id, data);
    setState((prev) => ({
      ...prev,
      departments: prev.departments.map((d) => (d.id === id ? updated : d)),
    }));
  }, []);

  const deleteDepartment = useCallback(async (id: number): Promise<boolean> => {
    const dept = state.departments.find((d) => d.id === id);
    if (dept && state.employees.some((e) => e.department === dept.name)) {
      return false;
    }
    await api.departments.delete(id);
    setState((prev) => ({
      ...prev,
      departments: prev.departments.filter((d) => d.id !== id),
    }));
    return true;
  }, [state.departments, state.employees]);

  const addExpense = useCallback(async (e: Omit<Expense, "id">) => {
    const created = await api.expenses.create(e);
    setState((prev) => ({ ...prev, expenses: [...prev.expenses, created] }));
  }, []);

  const updateExpense = useCallback(async (id: number, data: Partial<Expense>) => {
    const updated = await api.expenses.update(id, data);
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? updated : e)),
    }));
  }, []);

  const deleteExpense = useCallback(async (id: number) => {
    await api.expenses.delete(id);
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  }, []);

  const addAuditLog = useCallback(async (log: Omit<AuditLog, "id" | "timestamp">) => {
    const created = await api.auditLogs.create({ ...log, timestamp: new Date().toISOString() });
    setState((prev) => ({
      ...prev,
      auditLogs: [created, ...prev.auditLogs],
    }));
  }, []);

  const updateSettings = useCallback(async (s: Partial<AppSettings>) => {
    setState((prev) => {
      const updated = { ...prev.settings, ...s };
      api.settings.update(updated).catch(console.error);
      return { ...prev, settings: updated };
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addEmployee, updateEmployee, deleteEmployee,
        addAttendance, updateAttendance, deleteAttendance,
        addLeave, updateLeave, deleteLeave,
        addDepartment, updateDepartment, deleteDepartment,
        addExpense, updateExpense, deleteExpense,
        addAuditLog, updateSettings, refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

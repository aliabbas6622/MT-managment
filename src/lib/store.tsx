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
}

interface AppContextType extends AppState {
  addEmployee: (e: Omit<Employee, "id">) => void;
  updateEmployee: (id: number, e: Partial<Employee>) => void;
  deleteEmployee: (id: number) => void;
  addAttendance: (a: Omit<AttendanceRecord, "id">) => void;
  updateAttendance: (id: number, a: Partial<AttendanceRecord>) => void;
  deleteAttendance: (id: number) => void;
  addLeave: (l: Omit<Leave, "id">) => void;
  updateLeave: (id: number, l: Partial<Leave>) => void;
  deleteLeave: (id: number) => void;
  addDepartment: (d: Omit<Department, "id" | "employeeCount">) => void;
  updateDepartment: (id: number, d: Partial<Department>) => void;
  deleteDepartment: (id: number) => boolean;
  addExpense: (e: Omit<Expense, "id">) => void;
  updateExpense: (id: number, e: Partial<Expense>) => void;
  deleteExpense: (id: number) => void;
  addAuditLog: (log: Omit<AuditLog, "id" | "timestamp">) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "malir-tonight-data";

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.settings) return parsed;
    }
  } catch {}
  return getInitialState();
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let idCounter = Date.now();
function nextId(): number {
  return ++idCounter;
}

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

function getInitialState(): AppState {
  const employees: Employee[] = [
    { id: 1, firstName: "Ahmed", lastName: "Khan", email: "ahmed@malir.com", phone: "0301-1234567", position: "Manager", department: "Management", hireDate: "2023-01-15", salary: 85000, status: "active" },
    { id: 2, firstName: "Sara", lastName: "Ali", email: "sara@malir.com", phone: "0321-2345678", position: "Chef", department: "Kitchen", hireDate: "2023-03-20", salary: 65000, status: "active" },
    { id: 3, firstName: "Hassan", lastName: "Raza", email: "hassan@malir.com", phone: "0333-3456789", position: "Waiter", department: "Service", hireDate: "2023-06-10", salary: 35000, status: "active" },
    { id: 4, firstName: "Fatima", lastName: "Noor", email: "fatima@malir.com", phone: "0345-4567890", position: "Cashier", department: "Finance", hireDate: "2024-01-05", salary: 40000, status: "active" },
    { id: 5, firstName: "Usman", lastName: "Tariq", email: "usman@malir.com", phone: "0300-5678901", position: "Sous Chef", department: "Kitchen", hireDate: "2023-09-01", salary: 55000, status: "inactive" },
  ];

  const departments: Department[] = [
    { id: 101, name: "Management", employeeCount: 1 },
    { id: 102, name: "Kitchen", employeeCount: 2 },
    { id: 103, name: "Service", employeeCount: 1 },
    { id: 104, name: "Finance", employeeCount: 1 },
  ];

  const today = new Date().toISOString().split("T")[0];

  const attendance: AttendanceRecord[] = [
    { id: 201, employeeId: 1, employeeName: "Ahmed Khan", date: today, checkIn: "09:00", checkOut: "", status: "present", notes: "" },
    { id: 202, employeeId: 2, employeeName: "Sara Ali", date: today, checkIn: "08:45", checkOut: "", status: "present", notes: "" },
    { id: 203, employeeId: 3, employeeName: "Hassan Raza", date: today, checkIn: "09:15", checkOut: "", status: "late", notes: "Traffic" },
    { id: 204, employeeId: 4, employeeName: "Fatima Noor", date: today, checkIn: "", checkOut: "", status: "absent", notes: "On leave" },
  ];

  const leaves: Leave[] = [
    { id: 301, employeeId: 4, employeeName: "Fatima Noor", startDate: today, endDate: today, type: "sick", status: "approved", reason: "Feeling unwell" },
    { id: 302, employeeId: 3, employeeName: "Hassan Raza", startDate: "2026-07-25", endDate: "2026-07-27", type: "vacation", status: "pending", reason: "Family trip" },
  ];

  const expenses: Expense[] = [
    { id: 401, category: "Utilities", amount: 15000, description: "Electricity bill", date: "2026-07-01" },
    { id: 402, category: "Inventory", amount: 45000, description: "Weekly grocery restock", date: "2026-07-05" },
    { id: 403, category: "Maintenance", amount: 8000, description: "AC servicing", date: "2026-07-10" },
    { id: 404, category: "Salary", amount: 280000, description: "Monthly payroll", date: "2026-07-01" },
  ];

  const auditLogs: AuditLog[] = [
    { id: 501, action: "CREATE", entity: "Employee", entityId: 1, details: "Added Ahmed Khan", timestamp: "2023-01-15T10:00:00Z", user: "Admin" },
    { id: 502, action: "UPDATE", entity: "Attendance", entityId: 3, details: "Marked Hassan Raza as late", timestamp: today + "T09:15:00Z", user: "System" },
  ];

  return { employees, attendance, leaves, departments, expenses, auditLogs, settings: defaultSettings };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addEmployee = useCallback((e: Omit<Employee, "id">) => {
    setState((prev) => ({
      ...prev,
      employees: [...prev.employees, { ...e, id: nextId() }],
    }));
  }, []);

  const updateEmployee = useCallback((id: number, data: Partial<Employee>) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
  }, []);

  const deleteEmployee = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.id !== id),
      attendance: prev.attendance.filter((a) => a.employeeId !== id),
      leaves: prev.leaves.filter((l) => l.employeeId !== id),
    }));
  }, []);

  const addAttendance = useCallback((a: Omit<AttendanceRecord, "id">) => {
    setState((prev) => ({
      ...prev,
      attendance: [...prev.attendance, { ...a, id: nextId() }],
    }));
  }, []);

  const updateAttendance = useCallback((id: number, data: Partial<AttendanceRecord>) => {
    setState((prev) => ({
      ...prev,
      attendance: prev.attendance.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  }, []);

  const deleteAttendance = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      attendance: prev.attendance.filter((a) => a.id !== id),
    }));
  }, []);

  const addLeave = useCallback((l: Omit<Leave, "id">) => {
    setState((prev) => ({
      ...prev,
      leaves: [...prev.leaves, { ...l, id: nextId() }],
    }));
  }, []);

  const updateLeave = useCallback((id: number, data: Partial<Leave>) => {
    setState((prev) => ({
      ...prev,
      leaves: prev.leaves.map((l) => (l.id === id ? { ...l, ...data } : l)),
    }));
  }, []);

  const deleteLeave = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      leaves: prev.leaves.filter((l) => l.id !== id),
    }));
  }, []);

  const addDepartment = useCallback((d: Omit<Department, "id" | "employeeCount">) => {
    setState((prev) => ({
      ...prev,
      departments: [...prev.departments, { ...d, id: nextId(), employeeCount: 0 }],
    }));
  }, []);

  const updateDepartment = useCallback((id: number, data: Partial<Department>) => {
    setState((prev) => ({
      ...prev,
      departments: prev.departments.map((d) => (d.id === id ? { ...d, ...data } : d)),
    }));
  }, []);

  const deleteDepartment = useCallback((id: number): boolean => {
    let canDelete = true;
    setState((prev) => {
      const dept = prev.departments.find((d) => d.id === id);
      if (dept && prev.employees.some((e) => e.department === dept.name)) {
        canDelete = false;
        return prev;
      }
      return { ...prev, departments: prev.departments.filter((d) => d.id !== id) };
    });
    return canDelete;
  }, []);

  const addExpense = useCallback((e: Omit<Expense, "id">) => {
    setState((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { ...e, id: nextId() }],
    }));
  }, []);

  const updateExpense = useCallback((id: number, data: Partial<Expense>) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
  }, []);

  const deleteExpense = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  }, []);

  const addAuditLog = useCallback((log: Omit<AuditLog, "id" | "timestamp">) => {
    setState((prev) => ({
      ...prev,
      auditLogs: [{ ...log, id: nextId(), timestamp: new Date().toISOString() }, ...prev.auditLogs],
    }));
  }, []);

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...s },
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addAttendance,
        updateAttendance,
        deleteAttendance,
        addLeave,
        updateLeave,
        deleteLeave,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addExpense,
        updateExpense,
        deleteExpense,
        addAuditLog,
        updateSettings,
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

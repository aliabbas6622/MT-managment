import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

type Role = "admin" | "manager" | "hr" | "viewer";

type Permission =
  | "employees:read"
  | "employees:write"
  | "employees:delete"
  | "attendance:read"
  | "attendance:write"
  | "salaries:read"
  | "salaries:write"
  | "leaves:read"
  | "leaves:write"
  | "leaves:approve"
  | "departments:read"
  | "departments:write"
  | "expenses:read"
  | "expenses:write"
  | "reports:read"
  | "audit_logs:read"
  | "settings:read"
  | "settings:write"
  | "users:read"
  | "users:write"
  | "roles:manage";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
  getUsers: () => User[];
  addUser: (user: Omit<User, "id" | "createdAt"> & { password: string }) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "employees:read", "employees:write", "employees:delete",
    "attendance:read", "attendance:write",
    "salaries:read", "salaries:write",
    "leaves:read", "leaves:write", "leaves:approve",
    "departments:read", "departments:write",
    "expenses:read", "expenses:write",
    "reports:read",
    "audit_logs:read",
    "settings:read", "settings:write",
    "users:read", "users:write",
    "roles:manage",
  ],
  manager: [
    "employees:read", "employees:write",
    "attendance:read", "attendance:write",
    "salaries:read",
    "leaves:read", "leaves:approve",
    "departments:read",
    "expenses:read", "expenses:write",
    "reports:read",
    "audit_logs:read",
    "settings:read",
  ],
  hr: [
    "employees:read", "employees:write",
    "attendance:read", "attendance:write",
    "salaries:read", "salaries:write",
    "leaves:read", "leaves:write", "leaves:approve",
    "departments:read",
    "expenses:read",
    "reports:read",
    "audit_logs:read",
  ],
  viewer: [
    "employees:read",
    "attendance:read",
    "salaries:read",
    "leaves:read",
    "departments:read",
    "expenses:read",
    "reports:read",
    "audit_logs:read",
  ],
};

const USERS_KEY = "malirTonight_users";
const SESSION_KEY = "malirTonight_session";
const HASH_SALT = "malirTonight_2026";

function simpleHash(password: string): string {
  let hash = 0;
  const salted = HASH_SALT + password + HASH_SALT;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `h_${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: "usr_admin",
      name: "Ali Abbas",
      email: "admin@malir-tonight.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
  ];
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveSession(user: User | null): void {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function getPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem("malirTonight_passwords");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { "admin@malir-tonight.com": simpleHash("admin123") };
}

function savePasswords(passwords: Record<string, string>): void {
  localStorage.setItem("malirTonight_passwords", JSON.stringify(passwords));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadSession);

  useEffect(() => {
    if (!localStorage.getItem(USERS_KEY)) {
      saveUsers(loadUsers());
    }
    if (!localStorage.getItem("malirTonight_passwords")) {
      savePasswords(getPasswords());
    }
  }, []);

  const isAuthenticated = user !== null;

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const passwords = getPasswords();
    const hashed = simpleHash(password);

    if (passwords[email] !== hashed) {
      return { success: false, error: "Invalid email or password." };
    }

    const users = loadUsers();
    const found = users.find((u) => u.email === email);
    if (!found) {
      return { success: false, error: "User not found." };
    }

    setUser(found);
    saveSession(found);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveSession(null);
  }, []);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  }, [user]);

  const hasRole = useCallback((role: Role): boolean => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  const getUsers = useCallback((): User[] => {
    return loadUsers();
  }, []);

  const addUser = useCallback((data: Omit<User, "id" | "createdAt"> & { password: string }) => {
    const users = loadUsers();
    const passwords = getPasswords();

    if (users.some((u) => u.email === data.email)) {
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    passwords[data.email] = simpleHash(data.password);

    saveUsers(users);
    savePasswords(passwords);
  }, []);

  const updateUser = useCallback((id: string, data: Partial<User>) => {
    const users = loadUsers();
    const updated = users.map((u) => (u.id === id ? { ...u, ...data } : u));
    saveUsers(updated);

    if (user?.id === id) {
      const updatedUser = updated.find((u) => u.id === id);
      if (updatedUser) {
        setUser(updatedUser);
        saveSession(updatedUser);
      }
    }
  }, [user]);

  const deleteUser = useCallback((id: string) => {
    const users = loadUsers();
    const passwords = getPasswords();
    const target = users.find((u) => u.id === id);

    if (target && target.role === "admin") {
      const adminCount = users.filter((u) => u.role === "admin").length;
      if (adminCount <= 1) return;
    }

    const filtered = users.filter((u) => u.id !== id);
    if (target) delete passwords[target.email];

    saveUsers(filtered);
    savePasswords(passwords);

    if (user?.id === id) {
      logout();
    }
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, login, logout, hasPermission, hasRole,
      getUsers, addUser, updateUser, deleteUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export type { Role, Permission, User };

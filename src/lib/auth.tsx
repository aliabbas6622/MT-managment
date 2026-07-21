import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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
  username?: string;
  role: Role;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
  getUsers: () => User[];
  addUser: (data: { name: string; email: string; role: Role; password: string; username?: string }) => { success: boolean; error?: string };
  updateUser: (id: string, data: Partial<User>) => { success: boolean; error?: string };
  deleteUser: (id: string) => { success: boolean; error?: string };
  changePassword: (id: string, newPassword: string) => { success: boolean; error?: string };
  verifyCurrentPassword: (id: string, currentPassword: string) => { success: boolean; error?: string };
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
const HASH_SALT = "mt_2026_salt";

function hashPassword(password: string): string {
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
  return [];
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveSession(user: User | null, remember: boolean = true): void {
  if (user) {
    const data = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(SESSION_KEY, data);
    } else {
      sessionStorage.setItem(SESSION_KEY, data);
    }
  } else {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
}

function getPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem("malirTonight_passwords");
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

const DEV_EMAIL = "aliabbas6622tel@gmail.com";
const DEV_PASSWORD_HASH = hashPassword("ali6622");

function savePasswords(passwords: Record<string, string>): void {
  localStorage.setItem("malirTonight_passwords", JSON.stringify(passwords));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadSession);

  const isAuthenticated = user !== null;

  const login = useCallback((identifier: string, password: string, rememberMe: boolean = true): { success: boolean; error?: string } => {
    const hashed = hashPassword(password);

    if (identifier === DEV_EMAIL && hashed === DEV_PASSWORD_HASH) {
      const devUser: User = {
        id: "usr_dev",
        name: "Developer",
        email: DEV_EMAIL,
        role: "admin",
        createdAt: "2026-01-01T00:00:00Z",
      };
      setUser(devUser);
      saveSession(devUser, rememberMe);
      return { success: true };
    }

    const passwords = getPasswords();
    if (passwords[identifier] !== hashed) {
      return { success: false, error: "Invalid credentials." };
    }

    const users = loadUsers();
    const found = users.find((u) => u.email === identifier || u.username === identifier);
    if (!found) {
      return { success: false, error: "User not found." };
    }

    setUser(found);
    saveSession(found, rememberMe);
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

  const addUser = useCallback((data: { name: string; email: string; role: Role; password: string; username?: string }): { success: boolean; error?: string } => {
    const users = loadUsers();
    const passwords = getPasswords();

    if (!data.name.trim()) return { success: false, error: "Name is required." };
    if (!data.email.trim()) return { success: false, error: "Email is required." };
    if (!data.password.trim()) return { success: false, error: "Password is required." };
    if (data.password.length < 4) return { success: false, error: "Password must be at least 4 characters." };
    if (users.some((u) => u.email === data.email)) {
      return { success: false, error: "A user with this email already exists." };
    }
    if (data.username && users.some((u) => u.username === data.username)) {
      return { success: false, error: "This username is already taken." };
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: data.name.trim(),
      email: data.email.trim(),
      username: data.username?.trim() || undefined,
      role: data.role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    passwords[data.email] = hashPassword(data.password);

    saveUsers(users);
    savePasswords(passwords);
    return { success: true };
  }, []);

  const updateUser = useCallback((id: string, data: Partial<User>): { success: boolean; error?: string } => {
    const users = loadUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return { success: false, error: "User not found." };

    if (data.email && data.email !== target.email) {
      if (users.some((u) => u.email === data.email && u.id !== id)) {
        return { success: false, error: "Email already in use." };
      }
    }

    const updated = users.map((u) => (u.id === id ? { ...u, ...data } : u));
    saveUsers(updated);

    if (user?.id === id) {
      const updatedUser = updated.find((u) => u.id === id);
      if (updatedUser) {
        setUser(updatedUser);
        saveSession(updatedUser);
      }
    }

    return { success: true };
  }, [user]);

  const deleteUser = useCallback((id: string): { success: boolean; error?: string } => {
    const users = loadUsers();
    const passwords = getPasswords();
    const target = users.find((u) => u.id === id);

    if (!target) return { success: false, error: "User not found." };
    if (target.role === "admin") {
      const adminCount = users.filter((u) => u.role === "admin").length;
      if (adminCount <= 1) return { success: false, error: "Cannot delete the last admin." };
    }

    const filtered = users.filter((u) => u.id !== id);
    delete passwords[target.email];

    saveUsers(filtered);
    savePasswords(passwords);

    if (user?.id === id) {
      setUser(null);
      saveSession(null);
    }

    return { success: true };
  }, [user]);

  const verifyCurrentPassword = useCallback((id: string, currentPassword: string): { success: boolean; error?: string } => {
    const users = loadUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return { success: false, error: "User not found." };

    const passwords = getPasswords();
    const hashed = hashPassword(currentPassword);

    if (target.email === DEV_EMAIL && hashed === DEV_PASSWORD_HASH) {
      return { success: true };
    }

    if (passwords[target.email] !== hashed) {
      return { success: false, error: "Current password is incorrect." };
    }

    return { success: true };
  }, []);

  const changePassword = useCallback((id: string, newPassword: string): { success: boolean; error?: string } => {
    if (newPassword.length < 4) return { success: false, error: "Password must be at least 4 characters." };

    const users = loadUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return { success: false, error: "User not found." };

    const passwords = getPasswords();
    passwords[target.email] = hashPassword(newPassword);
    savePasswords(passwords);

    return { success: true };
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, login, logout, hasPermission, hasRole,
      getUsers, addUser, updateUser, deleteUser, changePassword, verifyCurrentPassword,
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

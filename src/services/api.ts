const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3001/api" : "/api");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Employees ───
export const api = {
  employees: {
    list: () => request<any[]>("/employees"),
    get: (id: number) => request<any>(`/employees/${id}`),
    create: (data: any) => request<any>("/employees", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/employees/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/employees/${id}`, { method: "DELETE" }),
  },

  attendance: {
    list: () => request<any[]>("/attendance"),
    create: (data: any) => request<any>("/attendance", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/attendance/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/attendance/${id}`, { method: "DELETE" }),
  },

  leaves: {
    list: () => request<any[]>("/leaves"),
    create: (data: any) => request<any>("/leaves", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/leaves/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/leaves/${id}`, { method: "DELETE" }),
  },

  departments: {
    list: () => request<any[]>("/departments"),
    create: (data: any) => request<any>("/departments", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/departments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/departments/${id}`, { method: "DELETE" }),
  },

  expenses: {
    list: () => request<any[]>("/expenses"),
    create: (data: any) => request<any>("/expenses", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/expenses/${id}`, { method: "DELETE" }),
  },

  auditLogs: {
    list: () => request<any[]>("/audit-logs"),
    create: (data: any) => request<any>("/audit-logs", { method: "POST", body: JSON.stringify(data) }),
  },

  users: {
    list: () => request<any[]>("/users"),
    create: (data: any) => request<any>("/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/users/${id}`, { method: "DELETE" }),
  },

  settings: {
    get: () => request<Record<string, any>>("/settings"),
    update: (data: Record<string, any>) => request<any>("/settings", { method: "PUT", body: JSON.stringify(data) }),
  },

  sync: {
    push: (data: any) => request<any>("/sync/push", { method: "POST", body: JSON.stringify(data) }),
    pull: () => request<any>("/sync/pull"),
  },

  health: () => request<{ status: string; db: string }>("/health"),
};

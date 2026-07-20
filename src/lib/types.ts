export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  status: "active" | "inactive";
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "absent" | "late" | "half-day";
  notes: string;
}

export interface Leave {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  type: "sick" | "vacation" | "personal" | "other";
  status: "pending" | "approved" | "rejected";
  reason: string;
}

export interface Department {
  id: number;
  name: string;
  employeeCount: number;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entityId: number;
  details: string;
  timestamp: string;
  user: string;
}

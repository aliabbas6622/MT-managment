import { PrismaClient, Employee, Attendance, Leave, Department, Expense, User } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchAllEmployees(): Promise<Employee[]> {
  return prisma.employee.findMany({
    where: { deletedAt: null },
    include: { department: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function fetchAttendance(date?: string): Promise<Attendance[]> {
  const where: Record<string, unknown> = {};
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.date = { gte: start, lte: end };
  }
  return prisma.attendance.findMany({
    where,
    include: { employee: true },
    orderBy: { date: 'desc' },
  });
}

export async function fetchLeaves(): Promise<Leave[]> {
  return prisma.leave.findMany({
    include: { employee: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function fetchDepartments(): Promise<Department[]> {
  return prisma.department.findMany({
    include: { employees: true },
    orderBy: { name: 'asc' },
  });
}

export async function fetchExpenses(): Promise<Expense[]> {
  return prisma.expense.findMany({
    orderBy: { date: 'desc' },
  });
}

export async function fetchUsers(): Promise<User[]> {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

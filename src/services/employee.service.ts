import prisma from "./database";
import type { Prisma, EmployeeStatus } from "@prisma/client";

export async function createEmployee(data: Prisma.EmployeeCreateInput) {
  try {
    return await prisma.employee.create({ data });
  } catch (error) {
    throw new Error(`Failed to create employee: ${(error as Error).message}`);
  }
}

export async function getEmployees(params?: {
  skip?: number;
  take?: number;
  where?: Prisma.EmployeeWhereInput;
  orderBy?: Prisma.EmployeeOrderByWithRelationInput;
}) {
  try {
    const { skip = 0, take = 50, where, orderBy } = params ?? {};
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        skip,
        take,
        where: { ...where, deletedAt: null },
        orderBy: orderBy ?? { createdAt: "desc" },
        include: { department: true },
      }),
      prisma.employee.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { employees, total, skip, take };
  } catch (error) {
    throw new Error(`Failed to fetch employees: ${(error as Error).message}`);
  }
}

export async function getEmployeeById(id: string) {
  try {
    return await prisma.employee.findUnique({
      where: { id },
      include: { department: true, attendances: true, salaries: true, leaves: true },
    });
  } catch (error) {
    throw new Error(`Failed to fetch employee: ${(error as Error).message}`);
  }
}

export async function updateEmployee(id: string, data: Prisma.EmployeeUpdateInput) {
  try {
    return await prisma.employee.update({ where: { id }, data });
  } catch (error) {
    throw new Error(`Failed to update employee: ${(error as Error).message}`);
  }
}

export async function softDeleteEmployee(id: string) {
  try {
    return await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date(), status: "INACTIVE" as EmployeeStatus },
    });
  } catch (error) {
    throw new Error(`Failed to delete employee: ${(error as Error).message}`);
  }
}

export async function restoreEmployee(id: string) {
  try {
    return await prisma.employee.update({
      where: { id },
      data: { deletedAt: null, status: "ACTIVE" as EmployeeStatus },
    });
  } catch (error) {
    throw new Error(`Failed to restore employee: ${(error as Error).message}`);
  }
}

export async function getEmployeeStats() {
  try {
    const [total, active, inactive] = await Promise.all([
      prisma.employee.count({ where: { deletedAt: null } }),
      prisma.employee.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.employee.count({ where: { deletedAt: null, status: "INACTIVE" } }),
    ]);
    return { total, active, inactive };
  } catch (error) {
    throw new Error(`Failed to fetch employee stats: ${(error as Error).message}`);
  }
}

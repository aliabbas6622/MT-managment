import prisma from "./database";
import type { Prisma } from "@prisma/client";

export async function createDepartment(data: Prisma.DepartmentCreateInput) {
  try {
    return await prisma.department.create({ data });
  } catch (error) {
    throw new Error(`Failed to create department: ${(error as Error).message}`);
  }
}

export async function getDepartments(params?: {
  skip?: number;
  take?: number;
  where?: Prisma.DepartmentWhereInput;
  orderBy?: Prisma.DepartmentOrderByWithRelationInput;
}) {
  try {
    const { skip = 0, take = 50, where, orderBy } = params ?? {};
    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        skip,
        take,
        where,
        orderBy: orderBy ?? { name: "asc" },
        include: { _count: { select: { employees: true } } },
      }),
      prisma.department.count({ where }),
    ]);
    return { departments, total, skip, take };
  } catch (error) {
    throw new Error(`Failed to fetch departments: ${(error as Error).message}`);
  }
}

export async function getDepartmentById(id: string) {
  try {
    return await prisma.department.findUnique({
      where: { id },
      include: { employees: true },
    });
  } catch (error) {
    throw new Error(`Failed to fetch department: ${(error as Error).message}`);
  }
}

export async function updateDepartment(id: string, data: Prisma.DepartmentUpdateInput) {
  try {
    return await prisma.department.update({ where: { id }, data });
  } catch (error) {
    throw new Error(`Failed to update department: ${(error as Error).message}`);
  }
}

export async function deleteDepartment(id: string) {
  try {
    const employeeCount = await prisma.employee.count({
      where: { departmentId: id, deletedAt: null },
    });

    if (employeeCount > 0) {
      throw new Error("Cannot delete department with active employees");
    }

    return await prisma.department.delete({ where: { id } });
  } catch (error) {
    throw new Error(`Failed to delete department: ${(error as Error).message}`);
  }
}

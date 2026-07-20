import prisma from "./database";
import type { Prisma, SalaryStatus } from "@prisma/client";

export async function createSalary(data: Prisma.SalaryCreateInput) {
  try {
    return await prisma.salary.create({ data });
  } catch (error) {
    throw new Error(`Failed to create salary: ${(error as Error).message}`);
  }
}

export async function getSalaries(params?: {
  skip?: number;
  take?: number;
  where?: Prisma.SalaryWhereInput;
  orderBy?: Prisma.SalaryOrderByWithRelationInput;
}) {
  try {
    const { skip = 0, take = 50, where, orderBy } = params ?? {};
    const [salaries, total] = await Promise.all([
      prisma.salary.findMany({
        skip,
        take,
        where,
        orderBy: orderBy ?? { createdAt: "desc" },
        include: { employee: true },
      }),
      prisma.salary.count({ where }),
    ]);
    return { salaries, total, skip, take };
  } catch (error) {
    throw new Error(`Failed to fetch salaries: ${(error as Error).message}`);
  }
}

export async function getSalaryById(id: string) {
  try {
    return await prisma.salary.findUnique({
      where: { id },
      include: { employee: true },
    });
  } catch (error) {
    throw new Error(`Failed to fetch salary: ${(error as Error).message}`);
  }
}

export async function updateSalary(id: string, data: Prisma.SalaryUpdateInput) {
  try {
    return await prisma.salary.update({ where: { id }, data });
  } catch (error) {
    throw new Error(`Failed to update salary: ${(error as Error).message}`);
  }
}

export async function deleteSalary(id: string) {
  try {
    return await prisma.salary.delete({ where: { id } });
  } catch (error) {
    throw new Error(`Failed to delete salary: ${(error as Error).message}`);
  }
}

export async function generatePayroll(month: number, year: number, taxRate: number = 0) {
  try {
    const activeEmployees = await prisma.employee.findMany({
      where: { deletedAt: null, status: "ACTIVE" },
    });

    const results = await prisma.$transaction(
      activeEmployees.map((emp) => {
        const taxAmount = emp.salary * (taxRate / 100);
        const net = emp.salary - taxAmount;

        return prisma.salary.create({
          data: {
            employeeId: emp.id,
            month,
            year,
            gross: emp.salary,
            taxRate,
            taxAmount,
            net,
            status: "PENDING" as SalaryStatus,
          },
        });
      })
    );

    return results;
  } catch (error) {
    throw new Error(`Failed to generate payroll: ${(error as Error).message}`);
  }
}

export async function markSalaryPaid(ids: string[]) {
  try {
    return await prisma.salary.updateMany({
      where: { id: { in: ids } },
      data: { status: "PAID" as SalaryStatus },
    });
  } catch (error) {
    throw new Error(`Failed to mark salaries as paid: ${(error as Error).message}`);
  }
}

export async function getSalaryByEmployeeAndPeriod(employeeId: string, month: number, year: number) {
  try {
    return await prisma.salary.findFirst({
      where: { employeeId, month, year },
    });
  } catch (error) {
    throw new Error(`Failed to fetch salary: ${(error as Error).message}`);
  }
}

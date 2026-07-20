import prisma from "./database";
import type { Prisma } from "@prisma/client";

export async function createExpense(data: Prisma.ExpenseCreateInput) {
  try {
    return await prisma.expense.create({ data });
  } catch (error) {
    throw new Error(`Failed to create expense: ${(error as Error).message}`);
  }
}

export async function getExpenses(params?: {
  skip?: number;
  take?: number;
  where?: Prisma.ExpenseWhereInput;
  orderBy?: Prisma.ExpenseOrderByWithRelationInput;
}) {
  try {
    const { skip = 0, take = 50, where, orderBy } = params ?? {};
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        skip,
        take,
        where,
        orderBy: orderBy ?? { date: "desc" },
      }),
      prisma.expense.count({ where }),
    ]);
    return { expenses, total, skip, take };
  } catch (error) {
    throw new Error(`Failed to fetch expenses: ${(error as Error).message}`);
  }
}

export async function getExpenseById(id: string) {
  try {
    return await prisma.expense.findUnique({ where: { id } });
  } catch (error) {
    throw new Error(`Failed to fetch expense: ${(error as Error).message}`);
  }
}

export async function updateExpense(id: string, data: Prisma.ExpenseUpdateInput) {
  try {
    return await prisma.expense.update({ where: { id }, data });
  } catch (error) {
    throw new Error(`Failed to update expense: ${(error as Error).message}`);
  }
}

export async function deleteExpense(id: string) {
  try {
    return await prisma.expense.delete({ where: { id } });
  } catch (error) {
    throw new Error(`Failed to delete expense: ${(error as Error).message}`);
  }
}

export async function getExpensesByCategory(category: string) {
  try {
    return await prisma.expense.findMany({
      where: { category },
      orderBy: { date: "desc" },
    });
  } catch (error) {
    throw new Error(`Failed to fetch expenses: ${(error as Error).message}`);
  }
}

export async function getExpensesByDateRange(startDate: Date, endDate: Date) {
  try {
    return await prisma.expense.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "desc" },
    });
  } catch (error) {
    throw new Error(`Failed to fetch expenses: ${(error as Error).message}`);
  }
}

export async function getExpenseSummary() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [totalThisMonth, totalAll, byCategory] = await Promise.all([
      prisma.expense.aggregate({
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
      }),
      prisma.expense.groupBy({
        by: ["category"],
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      thisMonth: totalThisMonth._sum.amount ?? 0,
      total: totalAll._sum.amount ?? 0,
      byCategory,
    };
  } catch (error) {
    throw new Error(`Failed to fetch expense summary: ${(error as Error).message}`);
  }
}

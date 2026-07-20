import prisma from "./database";
import type { Prisma, LeaveStatus } from "@prisma/client";

export async function createLeave(data: Prisma.LeaveCreateInput) {
  try {
    return await prisma.leave.create({ data });
  } catch (error) {
    throw new Error(`Failed to create leave: ${(error as Error).message}`);
  }
}

export async function getLeaves(params?: {
  skip?: number;
  take?: number;
  where?: Prisma.LeaveWhereInput;
  orderBy?: Prisma.LeaveOrderByWithRelationInput;
}) {
  try {
    const { skip = 0, take = 50, where, orderBy } = params ?? {};
    const [leaves, total] = await Promise.all([
      prisma.leave.findMany({
        skip,
        take,
        where,
        orderBy: orderBy ?? { createdAt: "desc" },
        include: { employee: true },
      }),
      prisma.leave.count({ where }),
    ]);
    return { leaves, total, skip, take };
  } catch (error) {
    throw new Error(`Failed to fetch leaves: ${(error as Error).message}`);
  }
}

export async function getLeaveById(id: string) {
  try {
    return await prisma.leave.findUnique({
      where: { id },
      include: { employee: true },
    });
  } catch (error) {
    throw new Error(`Failed to fetch leave: ${(error as Error).message}`);
  }
}

export async function updateLeave(id: string, data: Prisma.LeaveUpdateInput) {
  try {
    return await prisma.leave.update({ where: { id }, data });
  } catch (error) {
    throw new Error(`Failed to update leave: ${(error as Error).message}`);
  }
}

export async function deleteLeave(id: string) {
  try {
    return await prisma.leave.delete({ where: { id } });
  } catch (error) {
    throw new Error(`Failed to delete leave: ${(error as Error).message}`);
  }
}

export async function approveLeave(id: string, approvedBy: string) {
  try {
    return await prisma.leave.update({
      where: { id },
      data: { status: "APPROVED" as LeaveStatus, approvedBy },
    });
  } catch (error) {
    throw new Error(`Failed to approve leave: ${(error as Error).message}`);
  }
}

export async function rejectLeave(id: string, approvedBy: string) {
  try {
    return await prisma.leave.update({
      where: { id },
      data: { status: "REJECTED" as LeaveStatus, approvedBy },
    });
  } catch (error) {
    throw new Error(`Failed to reject leave: ${(error as Error).message}`);
  }
}

export async function getPendingLeaves() {
  try {
    return await prisma.leave.findMany({
      where: { status: "PENDING" },
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw new Error(`Failed to fetch pending leaves: ${(error as Error).message}`);
  }
}

export async function getLeavesByEmployee(employeeId: string) {
  try {
    return await prisma.leave.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw new Error(`Failed to fetch employee leaves: ${(error as Error).message}`);
  }
}

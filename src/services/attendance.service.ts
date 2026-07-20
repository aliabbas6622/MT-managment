import prisma from "./database";
import type { Prisma, AttendanceStatus } from "@prisma/client";

export async function createAttendance(data: Prisma.AttendanceCreateInput) {
  try {
    return await prisma.attendance.create({ data });
  } catch (error) {
    throw new Error(`Failed to create attendance: ${(error as Error).message}`);
  }
}

export async function getAttendances(params?: {
  skip?: number;
  take?: number;
  where?: Prisma.AttendanceWhereInput;
  orderBy?: Prisma.AttendanceOrderByWithRelationInput;
}) {
  try {
    const { skip = 0, take = 50, where, orderBy } = params ?? {};
    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        skip,
        take,
        where,
        orderBy: orderBy ?? { date: "desc" },
        include: { employee: true },
      }),
      prisma.attendance.count({ where }),
    ]);
    return { attendances, total, skip, take };
  } catch (error) {
    throw new Error(`Failed to fetch attendance: ${(error as Error).message}`);
  }
}

export async function getAttendanceById(id: string) {
  try {
    return await prisma.attendance.findUnique({
      where: { id },
      include: { employee: true },
    });
  } catch (error) {
    throw new Error(`Failed to fetch attendance: ${(error as Error).message}`);
  }
}

export async function updateAttendance(id: string, data: Prisma.AttendanceUpdateInput) {
  try {
    return await prisma.attendance.update({ where: { id }, data });
  } catch (error) {
    throw new Error(`Failed to update attendance: ${(error as Error).message}`);
  }
}

export async function deleteAttendance(id: string) {
  try {
    return await prisma.attendance.delete({ where: { id } });
  } catch (error) {
    throw new Error(`Failed to delete attendance: ${(error as Error).message}`);
  }
}

export async function checkIn(employeeId: string, date: Date) {
  try {
    return await prisma.attendance.create({
      data: {
        employeeId,
        date,
        checkIn: new Date(),
        status: "PRESENT" as AttendanceStatus,
      },
    });
  } catch (error) {
    throw new Error(`Failed to check in: ${(error as Error).message}`);
  }
}

export async function checkOut(id: string) {
  try {
    return await prisma.attendance.update({
      where: { id },
      data: { checkOut: new Date() },
    });
  } catch (error) {
    throw new Error(`Failed to check out: ${(error as Error).message}`);
  }
}

export async function getAttendanceByEmployeeAndDate(employeeId: string, date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });
  } catch (error) {
    throw new Error(`Failed to fetch attendance: ${(error as Error).message}`);
  }
}

import prisma from "./database";
import type { Prisma } from "@prisma/client";

export async function createAuditLog(data: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details ? (data.details as never) : undefined,
        ipAddress: data.ipAddress,
      },
    });
  } catch (error) {
    throw new Error(`Failed to create audit log: ${(error as Error).message}`);
  }
}

export async function getAuditLogs(params?: {
  skip?: number;
  take?: number;
  where?: Prisma.AuditLogWhereInput;
  orderBy?: Prisma.AuditLogOrderByWithRelationInput;
}) {
  try {
    const { skip = 0, take = 50, where, orderBy } = params ?? {};
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take,
        where,
        orderBy: orderBy ?? { createdAt: "desc" },
        include: { user: true },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { logs, total, skip, take };
  } catch (error) {
    throw new Error(`Failed to fetch audit logs: ${(error as Error).message}`);
  }
}

export async function getAuditLogsByEntity(entity: string, entityId: string) {
  try {
    return await prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
  } catch (error) {
    throw new Error(`Failed to fetch audit logs: ${(error as Error).message}`);
  }
}

export async function getAuditLogsByUser(userId: string) {
  try {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw new Error(`Failed to fetch audit logs: ${(error as Error).message}`);
  }
}

export async function getRecentAuditLogs(limit: number = 10) {
  try {
    return await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
  } catch (error) {
    throw new Error(`Failed to fetch recent audit logs: ${(error as Error).message}`);
  }
}

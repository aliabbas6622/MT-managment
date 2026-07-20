import prisma from "./database";
import type { LicenseStatus, LicenseType } from "@prisma/client";
import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createLicense(data: {
  type?: LicenseType;
  expiresInDays?: number;
}) {
  try {
    const token = generateToken();
    const now = new Date();
    const expiresAt = data.expiresInDays
      ? new Date(now.getTime() + data.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    return await prisma.license.create({
      data: {
        token,
        type: data.type ?? "BASIC",
        status: "ACTIVE",
        activatedAt: now,
        expiresAt,
      },
    });
  } catch (error) {
    throw new Error(`Failed to create license: ${(error as Error).message}`);
  }
}

export async function validateLicense(token: string): Promise<{
  valid: boolean;
  license?: {
    id: string;
    token: string;
    type: LicenseType;
    status: LicenseStatus;
    activatedAt: Date | null;
    expiresAt: Date | null;
  };
  reason?: string;
}> {
  try {
    const license = await prisma.license.findUnique({ where: { token } });

    if (!license) {
      return { valid: false, reason: "License not found" };
    }

    if (license.status === "DISABLED") {
      return { valid: false, license, reason: "License is disabled" };
    }

    if (license.status === "EXPIRED") {
      return { valid: false, license, reason: "License is expired" };
    }

    if (license.expiresAt && license.expiresAt < new Date()) {
      await prisma.license.update({
        where: { id: license.id },
        data: { status: "EXPIRED" },
      });
      return { valid: false, license, reason: "License has expired" };
    }

    return { valid: true, license };
  } catch (error) {
    throw new Error(`Failed to validate license: ${(error as Error).message}`);
  }
}

export async function activateLicense(token: string) {
  try {
    return await prisma.license.update({
      where: { token },
      data: {
        status: "ACTIVE" as LicenseStatus,
        activatedAt: new Date(),
      },
    });
  } catch (error) {
    throw new Error(`Failed to activate license: ${(error as Error).message}`);
  }
}

export async function disableLicense(token: string) {
  try {
    return await prisma.license.update({
      where: { token },
      data: { status: "DISABLED" as LicenseStatus },
    });
  } catch (error) {
    throw new Error(`Failed to disable license: ${(error as Error).message}`);
  }
}

export async function extendLicense(token: string, days: number) {
  try {
    const license = await prisma.license.findUnique({ where: { token } });
    if (!license) throw new Error("License not found");

    const currentExpiry = license.expiresAt ?? new Date();
    const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

    return await prisma.license.update({
      where: { token },
      data: {
        expiresAt: newExpiry,
        status: "ACTIVE" as LicenseStatus,
      },
    });
  } catch (error) {
    throw new Error(`Failed to extend license: ${(error as Error).message}`);
  }
}

export async function getLicenses(params?: {
  skip?: number;
  take?: number;
}) {
  try {
    const { skip = 0, take = 50 } = params ?? {};
    const [licenses, total] = await Promise.all([
      prisma.license.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.license.count(),
    ]);
    return { licenses, total, skip, take };
  } catch (error) {
    throw new Error(`Failed to fetch licenses: ${(error as Error).message}`);
  }
}

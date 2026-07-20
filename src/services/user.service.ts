import prisma from "./database";
import type { Prisma, UserRole } from "@prisma/client";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}) {
  try {
    const passwordHash = hashPassword(data.password);
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role ?? "STAFF",
      },
    });
  } catch (error) {
    throw new Error(`Failed to create user: ${(error as Error).message}`);
  }
}

export async function getUsers(params?: {
  skip?: number;
  take?: number;
  where?: Prisma.UserWhereInput;
}) {
  try {
    const { skip = 0, take = 50, where } = params ?? {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);
    return { users: users.map(({ passwordHash, ...rest }) => rest), total, skip, take };
  } catch (error) {
    throw new Error(`Failed to fetch users: ${(error as Error).message}`);
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  } catch (error) {
    throw new Error(`Failed to fetch user: ${(error as Error).message}`);
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) return null;

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const { passwordHash: _, ...rest } = user;
    return rest;
  } catch (error) {
    throw new Error(`Failed to authenticate user: ${(error as Error).message}`);
  }
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; password?: string; role?: UserRole }
) {
  try {
    const updateData: Prisma.UserUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.passwordHash = hashPassword(data.password);
    if (data.role) updateData.role = data.role;

    const user = await prisma.user.update({ where: { id }, data: updateData });
    const { passwordHash, ...rest } = user;
    return rest;
  } catch (error) {
    throw new Error(`Failed to update user: ${(error as Error).message}`);
  }
}

export async function deleteUser(id: string) {
  try {
    return await prisma.user.delete({ where: { id } });
  } catch (error) {
    throw new Error(`Failed to delete user: ${(error as Error).message}`);
  }
}

export async function changePassword(id: string, currentPassword: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");

    const currentHash = hashPassword(currentPassword);
    if (user.passwordHash !== currentHash) throw new Error("Current password is incorrect");

    return await prisma.user.update({
      where: { id },
      data: { passwordHash: hashPassword(newPassword) },
    });
  } catch (error) {
    throw new Error(`Failed to change password: ${(error as Error).message}`);
  }
}

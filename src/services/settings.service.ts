import prisma from "./database";
import type { Prisma } from "@prisma/client";

export async function createSetting(data: Prisma.SettingCreateInput) {
  try {
    return await prisma.setting.upsert({
      where: { key: data.key },
      update: { value: data.value },
      create: data,
    });
  } catch (error) {
    throw new Error(`Failed to create setting: ${(error as Error).message}`);
  }
}

export async function getSetting(key: string) {
  try {
    return await prisma.setting.findUnique({ where: { key } });
  } catch (error) {
    throw new Error(`Failed to fetch setting: ${(error as Error).message}`);
  }
}

export async function getSettings(params?: {
  skip?: number;
  take?: number;
  where?: Prisma.SettingWhereInput;
}) {
  try {
    const { skip = 0, take = 100, where } = params ?? {};
    const [settings, total] = await Promise.all([
      prisma.setting.findMany({ skip, take, where }),
      prisma.setting.count({ where }),
    ]);
    return { settings, total, skip, take };
  } catch (error) {
    throw new Error(`Failed to fetch settings: ${(error as Error).message}`);
  }
}

export async function updateSetting(key: string, value: Prisma.InputJsonValue) {
  try {
    return await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  } catch (error) {
    throw new Error(`Failed to update setting: ${(error as Error).message}`);
  }
}

export async function deleteSetting(key: string) {
  try {
    return await prisma.setting.delete({ where: { key } });
  } catch (error) {
    throw new Error(`Failed to delete setting: ${(error as Error).message}`);
  }
}

export async function getSettingValue<T = unknown>(key: string): Promise<T | null> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key } });
    return (setting?.value as T) ?? null;
  } catch (error) {
    throw new Error(`Failed to fetch setting value: ${(error as Error).message}`);
  }
}

export async function setSettingValue(key: string, value: unknown) {
  try {
    return await prisma.setting.upsert({
      where: { key },
      update: { value: value as Prisma.InputJsonValue },
      create: { key, value: value as Prisma.InputJsonValue },
    });
  } catch (error) {
    throw new Error(`Failed to set setting value: ${(error as Error).message}`);
  }
}

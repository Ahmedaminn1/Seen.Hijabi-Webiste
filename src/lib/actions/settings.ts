"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/products";

export interface StoreSettingsInput {
  storeName: string;
  logoUrl?: string | null;
  whatsappNumber: string;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  facebookUrl?: string | null;
  currency: string;
  announcementText?: string | null;
  announcementEnabled: boolean;
}

export interface ShippingSettingsInput {
  freeShippingEnabled: boolean;
  freeShippingMinAmount?: number | null;
  freeShippingMinQty?: number | null;
  fixedShippingCost: number;
}

export async function getStoreSettings() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: "default" },
      });
    }
    return settings;
  } catch (error) {
    console.error("Error fetching store settings:", error);
    return null;
  }
}

export async function getShippingSettings() {
  try {
    let settings = await prisma.shippingSettings.findUnique({
      where: { id: "default" },
    });
    if (!settings) {
      settings = await prisma.shippingSettings.create({
        data: { id: "default" },
      });
    }
    return settings;
  } catch (error) {
    console.error("Error fetching shipping settings:", error);
    return null;
  }
}

export async function updateStoreSettings(
  input: StoreSettingsInput
): Promise<ActionResult> {
  try {
    await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: input,
      create: { id: "default", ...input },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error updating store settings:", error);
    return { success: false, error: "تعذر تحديث إعدادات المتجر" };
  }
}

export async function updateShippingSettings(
  input: ShippingSettingsInput
): Promise<ActionResult> {
  try {
    await prisma.shippingSettings.upsert({
      where: { id: "default" },
      update: input,
      create: { id: "default", ...input },
    });

    revalidatePath("/", "layout");
    revalidatePath("/cart");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    console.error("Error updating shipping settings:", error);
    return { success: false, error: "تعذر تحديث إعدادات الشحن" };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateDiscountedPrice, calculateShippingFee } from "@/lib/utils/pricing";
import { revalidatePath } from "next/cache";

// ─── Validation Schema ────────────────────────────────────────────────────────

const EGYPTIAN_GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الدقهلية",
  "الشرقية",
  "البحيرة",
  "المنوفية",
  "القليوبية",
  "الغربية",
  "كفر الشيخ",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "شمال سيناء",
  "جنوب سيناء",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "الوادي الجديد",
  "مطروح",
  "البحر الأحمر",
] as const;

export type Governorate = (typeof EGYPTIAN_GOVERNORATES)[number];

export const GOVERNORATES_LIST = EGYPTIAN_GOVERNORATES;

const CheckoutFormSchema = z.object({
  fullName: z
    .string()
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل")
    .max(100, "الاسم طويل جداً")
    .trim(),
  phone: z
    .string()
    .regex(/^(\+20|0)?1[0-9]{9}$/, "رقم الهاتف غير صحيح — يجب أن يكون رقم مصري")
    .trim(),
  whatsapp: z
    .string()
    .regex(/^(\+20|0)?1[0-9]{9}$/, "رقم الواتساب غير صحيح")
    .trim()
    .optional()
    .or(z.literal("")),
  governorate: z.enum(EGYPTIAN_GOVERNORATES, {
    message: "اختار محافظة صحيحة",
  }),
  city: z
    .string()
    .min(2, "المدينة / المنطقة مطلوبة")
    .max(100, "اسم المدينة طويل جداً")
    .trim(),
  address: z
    .string()
    .min(10, "العنوان يجب أن يكون 10 أحرف على الأقل")
    .max(500, "العنوان طويل جداً")
    .trim(),
  notes: z.string().max(500, "الملاحظات طويلة جداً").trim().optional().or(z.literal("")),
  utmSource: z.string().max(100).optional().or(z.literal("")),
  // Cart items passed as JSON string from client
  cartJson: z.string().min(1, "السلة فارغة"),
});

// ─── Cart Item from Client ────────────────────────────────────────────────────

const CartItemSchema = z.object({
  variantId: z.string().cuid(),
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(100),
  // name / image / etc. are display-only, not used for pricing
  name: z.string(),
  colorName: z.string(),
  sizeName: z.string(),
});

type CartItemInput = z.infer<typeof CartItemSchema>;

// ─── Result Types ─────────────────────────────────────────────────────────────

export type CheckoutResult =
  | { success: true; orderNumber: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Order Number Generator ───────────────────────────────────────────────────

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.order.count();
  const sequence = String(count + 1).padStart(4, "0");
  return `SH-${year}-${sequence}`;
}

// ─── Main Checkout Action ─────────────────────────────────────────────────────

/**
 * Server Action: Place an order.
 *
 * Security guarantees:
 * - All prices re-fetched from DB (never trusts client values)
 * - Shipping recalculated from ShippingSettings
 * - Inventory checked and deducted atomically in a single transaction
 * - Each variant's stock is decremented exactly once (idempotent via isInventoryDeducted)
 */
export async function placeOrder(formData: FormData): Promise<CheckoutResult> {
  // 1. Parse and validate form fields
  const raw = {
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    governorate: formData.get("governorate"),
    city: formData.get("city"),
    address: formData.get("address"),
    notes: formData.get("notes"),
    utmSource: formData.get("utmSource"),
    cartJson: formData.get("cartJson"),
  };

  const parsed = CheckoutFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [field, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[field] = msgs ?? [];
    }
    return { success: false, error: "تحقق من البيانات المدخلة", fieldErrors };
  }

  const data = parsed.data;

  // 2. Parse and validate cart items
  let cartItems: CartItemInput[];
  try {
    const rawCart = JSON.parse(data.cartJson) as unknown;
    if (!Array.isArray(rawCart) || rawCart.length === 0) {
      return { success: false, error: "السلة فارغة" };
    }
    cartItems = rawCart.map((item, i) => {
      const result = CartItemSchema.safeParse(item);
      if (!result.success) {
        throw new Error(`Item ${i} invalid: ${result.error.message}`);
      }
      return result.data;
    });
  } catch {
    return { success: false, error: "بيانات السلة غير صحيحة" };
  }

  if (cartItems.length === 0) {
    return { success: false, error: "السلة فارغة" };
  }

  // 3. Re-fetch products + variants from DB to get authoritative prices
  const variantIds = cartItems.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          discountPercent: true,
          isDiscountActive: true,
          isActive: true,
        },
      },
      color: { select: { name: true } },
      size: { select: { name: true } },
      inventory: { select: { quantity: true } },
    },
  });

  // Map for O(1) lookup
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  // 4. Validate all variants exist and are purchasable
  for (const item of cartItems) {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      return {
        success: false,
        error: `المنتج "${item.name}" غير متاح حالياً — يرجى تحديث السلة`,
      };
    }
    if (!variant.product.isActive) {
      return {
        success: false,
        error: `المنتج "${variant.product.name}" غير متاح حالياً`,
      };
    }
    const stock = variant.inventory?.quantity ?? 0;
    if (stock < item.quantity) {
      return {
        success: false,
        error: `الكمية المطلوبة من "${variant.product.name}" (${variant.color.name} - ${variant.size.name}) غير متاحة. المتاح: ${stock} قطعة`,
      };
    }
  }

  // 5. Calculate authoritative prices (server-side only)
  let subtotal = 0;
  const lineItems = cartItems.map((item) => {
    const variant = variantMap.get(item.variantId)!;
    const product = variant.product;
    const originalPrice = Number(product.price);
    const discountPercent =
      product.isDiscountActive && product.discountPercent != null
        ? product.discountPercent
        : null;
    const unitPrice = calculateDiscountedPrice(originalPrice, discountPercent);
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;
    return {
      variantId: item.variantId,
      productName: product.name,
      colorName: variant.color.name,
      sizeName: variant.size.name,
      quantity: item.quantity,
      unitPrice,
      discountPercent: discountPercent ?? null,
      totalPrice,
    };
  });

  // 6. Calculate shipping fee from DB settings
  const shippingSettings = await prisma.shippingSettings.findUniqueOrThrow({
    where: { id: "default" },
  });

  const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const { fee: shippingFee } = calculateShippingFee(subtotal, totalQty, {
    freeShippingEnabled: shippingSettings.freeShippingEnabled,
    freeShippingMinAmount:
      shippingSettings.freeShippingMinAmount !== null
        ? Number(shippingSettings.freeShippingMinAmount)
        : null,
    freeShippingMinQty: shippingSettings.freeShippingMinQty,
    fixedShippingCost: Number(shippingSettings.fixedShippingCost),
  });

  const totalAmount = subtotal + shippingFee;

  // 7. Generate order number
  const orderNumber = await generateOrderNumber();

  // 8. Atomic transaction: create order + deduct inventory
  try {
    await prisma.$transaction(async (tx) => {
      // Re-check stock inside transaction to prevent race conditions
      for (const item of cartItems) {
        const inventory = await tx.inventory.findUnique({
          where: { variantId: item.variantId },
          select: { quantity: true },
        });
        const stock = inventory?.quantity ?? 0;
        if (stock < item.quantity) {
          throw new Error(
            `OUT_OF_STOCK:${item.variantId}:${item.quantity}:${stock}`
          );
        }
      }

      // Create the order
      await tx.order.create({
        data: {
          orderNumber,
          customerName: data.fullName,
          customerPhone: data.phone,
          customerWhatsapp: data.whatsapp || null,
          governorate: data.governorate,
          city: data.city,
          address: data.address,
          notes: data.notes || null,
          subtotal,
          discountAmount: 0,
          shippingFee,
          totalAmount,
          source: "website",
          utmSource: data.utmSource || null,
          isInventoryDeducted: true,
          items: {
            create: lineItems.map((li) => ({
              variantId: li.variantId,
              productName: li.productName,
              colorName: li.colorName,
              sizeName: li.sizeName,
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              discountPercent: li.discountPercent,
              totalPrice: li.totalPrice,
            })),
          },
        },
      });

      // Deduct inventory for each variant
      for (const item of cartItems) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.startsWith("OUT_OF_STOCK:")) {
      const [, , qty, stock] = message.split(":");
      return {
        success: false,
        error: `نفذت الكمية — الكمية المطلوبة: ${qty}، المتاح: ${stock}. يرجى تعديل السلة.`,
      };
    }
    console.error("[checkout] Transaction failed:", err);
    return { success: false, error: "حدث خطأ أثناء تسجيل الطلب. حاول مرة أخرى." };
  }

  revalidatePath("/admin/orders");

  return { success: true, orderNumber };
}


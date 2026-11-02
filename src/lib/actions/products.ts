"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Server Action: Create Product with Colors, Sizes, Variants, and Inventory
 * All operations execute inside an atomic database transaction.
 */
export async function createProduct(
  values: ProductFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = productSchema.parse(values);

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({
      where: { slug: validated.slug },
    });
    if (existing) {
      return { success: false, error: "هذا الرابط الدائم (Slug) مستخدم بالفعل لمنتج آخر" };
    }

    const product = await prisma.$transaction(async (tx) => {
      // 1. Create base product
      const newProduct = await tx.product.create({
        data: {
          name: validated.name,
          slug: validated.slug,
          description: validated.description || null,
          price: validated.price,
          discountPercent: validated.discountPercent ?? null,
          isDiscountActive: validated.isDiscountActive,
          isFeatured: validated.isFeatured,
          isNewArrival: validated.isNewArrival,
          isBestSeller: validated.isBestSeller,
          isActive: validated.isActive,
          categoryId: validated.categoryId || null,
        },
      });

      // 2. Insert product images
      if (validated.images.length > 0) {
        await tx.productImage.createMany({
          data: validated.images.map((img, idx) => ({
            productId: newProduct.id,
            url: img.url,
            altText: img.altText || `${validated.name} - ${idx + 1}`,
            displayOrder: img.displayOrder ?? idx,
            isPrimary: img.isPrimary ?? idx === 0,
          })),
        });
      }

      // 3. Create colors
      const colorRecords = await Promise.all(
        validated.colors.map((c) =>
          tx.productColor.create({
            data: {
              productId: newProduct.id,
              name: c.name,
              hexCode: c.hexCode,
            },
          })
        )
      );
      const colorMap = new Map(colorRecords.map((c) => [c.name, c.id]));

      // 4. Create sizes
      const sizeRecords = await Promise.all(
        validated.sizes.map((s, idx) =>
          tx.productSize.create({
            data: {
              productId: newProduct.id,
              name: s.name,
              displayOrder: s.displayOrder ?? idx,
            },
          })
        )
      );
      const sizeMap = new Map(sizeRecords.map((s) => [s.name, s.id]));

      // 5. Create variants and inventories
      for (const variant of validated.variants) {
        const colorId = colorMap.get(variant.colorName);
        const sizeId = sizeMap.get(variant.sizeName);

        if (!colorId || !sizeId) {
          throw new Error(`Color (${variant.colorName}) or Size (${variant.sizeName}) not found`);
        }

        const newVariant = await tx.productVariant.create({
          data: {
            productId: newProduct.id,
            colorId,
            sizeId,
            sku: variant.sku || null,
          },
        });

        await tx.inventory.create({
          data: {
            variantId: newVariant.id,
            quantity: variant.stock,
            lowStockThreshold: variant.lowStockThreshold ?? 2,
          },
        });
      }

      return newProduct;
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, data: { id: product.id } };
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع أثناء حفظ المنتج";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Delete or Archive a Product
 */
export async function deleteProduct(productId: string): Promise<ActionResult> {
  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting product:", error);
    return { success: false, error: "تعذر حذف المنتج، قد يكون مرتبطاً بطلبات سابقة." };
  }
}

/**
 * Server Action: Toggle Product Active State
 */
export async function toggleProductStatus(
  productId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error toggling product status:", error);
    return { success: false, error: "تعذر تحديث حالة المنتج" };
  }
}

/**
 * Server Action: Update Variant Stock atomically
 */
export async function updateVariantStock(
  variantId: string,
  newQuantity: number
): Promise<ActionResult> {
  try {
    if (newQuantity < 0) {
      return { success: false, error: "الكمية لا يمكن أن تكون سالبة" };
    }

    await prisma.inventory.update({
      where: { variantId },
      data: { quantity: newQuantity },
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating stock:", error);
    return { success: false, error: "تعذر تحديث كمية المخزون" };
  }
}

/**
 * Server Action: Get real-time variant inventory stock for a product.
 * Returns up-to-the-millisecond stock counts from the database without full page reload.
 */
export async function getProductLiveStock(
  productId: string
): Promise<Array<{ id: string; colorId: string; sizeId: string; sku: string | null; stock: number }>> {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      select: {
        id: true,
        colorId: true,
        sizeId: true,
        sku: true,
        inventory: {
          select: { quantity: true },
        },
      },
    });

    return variants.map((v) => ({
      id: v.id,
      colorId: v.colorId,
      sizeId: v.sizeId,
      sku: v.sku,
      stock: v.inventory?.quantity ?? 0,
    }));
  } catch (error) {
    console.error("Error fetching live stock:", error);
    return [];
  }
}


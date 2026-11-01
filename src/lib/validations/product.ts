import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "اسم المنتج مطلوب (حرفين على الأقل) | Product name is required"),
  slug: z.string().min(2, "الرابط الدائم مطلوب | Slug is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("السعر يجب أن يكون أكبر من صفر | Price must be positive"),
  discountPercent: z.coerce.number().min(0).max(100).nullable().optional(),
  isDiscountActive: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isActive: z.boolean().default(true),
  categoryId: z.string().nullable().optional(),
  // Images
  images: z
    .array(
      z.object({
        url: z.string().url("رابط الصورة غير صالح | Invalid image URL"),
        altText: z.string().nullable().optional(),
        displayOrder: z.number().int().default(0),
        isPrimary: z.boolean().default(false),
      })
    )
    .min(1, "يجب إضافة صورة واحدة على الأقل للمنتج | At least one image is required"),
  // Colors
  colors: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, "اسم اللون مطلوب | Color name is required"),
        hexCode: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "رمز اللون غير صالح | Invalid hex code"),
      })
    )
    .min(1, "يجب تحديد لون واحد على الأقل | At least one color is required"),
  // Sizes
  sizes: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, "اسم المقاس مطلوب | Size name is required"),
        displayOrder: z.number().int().default(0),
      })
    )
    .min(1, "يجب تحديد مقاس واحد على الأقل | At least one size is required"),
  // Variants (Combination of Color + Size + Stock)
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        colorName: z.string(),
        sizeName: z.string(),
        sku: z.string().nullable().optional(),
        stock: z.coerce.number().int().min(0, "المخزون لا يمكن أن يكون سالباً | Stock cannot be negative"),
        lowStockThreshold: z.coerce.number().int().min(0).default(2),
      })
    )
    .min(1, "يجب توليد خيارات المنتج والمخزون | Variants are required"),
});

export type ProductFormValues = z.infer<typeof productSchema>;


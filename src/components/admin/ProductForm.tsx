"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createProduct } from "@/lib/actions/products";
import { uploadProductImage } from "@/lib/actions/upload";
import { formatPrice } from "@/lib/utils/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload, AlertCircle, Loader2 } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
}

export function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [categoryId, setCategoryId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Images state
  const [images, setImages] = useState<Array<{ url: string; altText: string; isPrimary: boolean }>>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadProductImage(formData);
      if (res.success && res.url) {
        setImages((prev) => [
          ...prev,
          {
            url: res.url!,
            altText: `${name || "Product"} image`,
            isPrimary: prev.length === 0,
          },
        ]);
      } else {
        setErrorMessage(res.error || "فشل رفع الصورة");
      }
    } catch {
      setErrorMessage("حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Colors state
  const [colors, setColors] = useState<Array<{ name: string; hexCode: string }>>([
    { name: "بيج | Beige", hexCode: "#E8D8C8" },
    { name: "أسود | Black", hexCode: "#1A1A1A" },
  ]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#C9A96E");

  // Sizes state
  const [sizes, setSizes] = useState<Array<{ name: string; displayOrder: number }>>([
    { name: "S", displayOrder: 0 },
    { name: "M", displayOrder: 1 },
    { name: "L", displayOrder: 2 },
  ]);
  const [newSizeName, setNewSizeName] = useState("");

  // Variants matrix (combination of colors x sizes with stock)
  const [variantStocks, setVariantStocks] = useState<Record<string, { stock: number; sku: string }>>({
    "بيج | Beige-S": { stock: 5, sku: "" },
    "بيج | Beige-M": { stock: 5, sku: "" },
    "بيج | Beige-L": { stock: 0, sku: "" },
    "أسود | Black-S": { stock: 3, sku: "" },
    "أسود | Black-M": { stock: 0, sku: "" },
    "أسود | Black-L": { stock: 0, sku: "" },
  });

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, "-")) {
      const generated = val
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
        .replace(/\s+/g, "-");
      setSlug(generated);
    }
  };

  // Add image
  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([
      ...images,
      {
        url: newImageUrl.trim(),
        altText: `${name} image`,
        isPrimary: images.length === 0,
      },
    ]);
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  // Add color
  const addColor = () => {
    if (!newColorName.trim()) return;
    if (colors.some((c) => c.name.toLowerCase() === newColorName.trim().toLowerCase())) return;

    const added = [...colors, { name: newColorName.trim(), hexCode: newColorHex }];
    setColors(added);
    setNewColorName("");

    // Update variant matrix
    const newStocks = { ...variantStocks };
    for (const size of sizes) {
      const key = `${newColorName.trim()}-${size.name}`;
      if (!newStocks[key]) {
        newStocks[key] = { stock: 0, sku: "" };
      }
    }
    setVariantStocks(newStocks);
  };

  const removeColor = (colorName: string) => {
    setColors(colors.filter((c) => c.name !== colorName));
  };

  // Add size
  const addSize = () => {
    if (!newSizeName.trim()) return;
    if (sizes.some((s) => s.name.toUpperCase() === newSizeName.trim().toUpperCase())) return;

    const added = [...sizes, { name: newSizeName.trim().toUpperCase(), displayOrder: sizes.length }];
    setSizes(added);
    setNewSizeName("");

    // Update variant matrix
    const newStocks = { ...variantStocks };
    for (const color of colors) {
      const key = `${color.name}-${newSizeName.trim().toUpperCase()}`;
      if (!newStocks[key]) {
        newStocks[key] = { stock: 0, sku: "" };
      }
    }
    setVariantStocks(newStocks);
  };

  const removeSize = (sizeName: string) => {
    setSizes(sizes.filter((s) => s.name !== sizeName));
  };

  // Update specific variant stock
  const handleStockChange = (colorName: string, sizeName: string, stockVal: number) => {
    const key = `${colorName}-${sizeName}`;
    setVariantStocks({
      ...variantStocks,
      [key]: {
        ...variantStocks[key],
        stock: Math.max(0, stockVal),
      },
    });
  };

  const handleSkuChange = (colorName: string, sizeName: string, skuVal: string) => {
    const key = `${colorName}-${sizeName}`;
    setVariantStocks({
      ...variantStocks,
      [key]: {
        ...variantStocks[key],
        sku: skuVal,
      },
    });
  };

  // Calculate discounted price preview
  const finalPrice = isDiscountActive && discountPercent > 0
    ? price * (1 - discountPercent / 100)
    : price;

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (images.length === 0) {
      setErrorMessage("يجب إضافة صورة واحدة على الأقل للمنتج | Please add at least one image");
      setIsSubmitting(false);
      return;
    }

    if (colors.length === 0 || sizes.length === 0) {
      setErrorMessage("يجب تحديد لون ومقاس واحد على الأقل | At least one color and size are required");
      setIsSubmitting(false);
      return;
    }

    // Build variants array
    const variantsPayload = [];
    for (const color of colors) {
      for (const size of sizes) {
        const key = `${color.name}-${size.name}`;
        const item = variantStocks[key] || { stock: 0, sku: "" };
        variantsPayload.push({
          colorName: color.name,
          sizeName: size.name,
          sku: item.sku || undefined,
          stock: item.stock,
          lowStockThreshold: 2,
        });
      }
    }

    try {
      const result = await createProduct({
        name,
        slug,
        description: description || undefined,
        price,
        isDiscountActive,
        discountPercent: isDiscountActive ? discountPercent : null,
        categoryId: categoryId || null,
        isFeatured,
        isNewArrival,
        isBestSeller,
        isActive,
        images: images.map((img, i) => ({
          url: img.url,
          altText: img.altText || `${name} - ${i + 1}`,
          displayOrder: i,
          isPrimary: img.isPrimary,
        })),
        colors,
        sizes,
        variants: variantsPayload,
      });

      if (!result.success) {
        setErrorMessage(result.error || "حدث خطأ أثناء حفظ المنتج");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("تعذر إرسال البيانات إلى الخادم");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {errorMessage && (
        <div
          role="alert"
          className="p-4 bg-red-50/70 border border-red-200 text-red-900 text-xs rounded-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Basic Product Information */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
          1. المعلومات الأساسية | Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="product-name" className="text-xs font-medium">
              اسم المنتج | Product Name *
            </Label>
            <Input
              id="product-name"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="مثال: فستان حرير ماكسي بيج"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-slug" className="text-xs font-medium">
              الرابط الدائم | Slug *
            </Label>
            <Input
              id="product-slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="silk-maxi-dress-beige"
              className="text-xs h-9 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="product-category" className="text-xs font-medium">
              التصنيف | Category
            </Label>
            <select
              id="product-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-9 text-xs px-3 border border-[var(--border)] bg-transparent rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand-gold)]"
            >
              <option value="">بدون تصنيف | None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-status" className="text-xs font-medium">
              حالة الظهور في المتجر | Status
            </Label>
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded-sm border-[var(--border)] text-[var(--primary)]"
                />
                <span>نشط في المتجر | Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product-desc" className="text-xs font-medium">
            وصف المنتج | Description
          </Label>
          <Textarea
            id="product-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب وصفاً جذاباً ودقيقاً لخامة المنتج، طريقة الغسيل، وتفاصيل التصميم..."
            className="text-xs"
          />
        </div>
      </div>

      {/* 2. Pricing & Discounts */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
          2. السعر والخصومات | Pricing & Discounts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="product-price" className="text-xs font-medium">
              السعر الأساسي (ج.م) | Regular Price (EGP) *
            </Label>
            <Input
              id="product-price"
              type="number"
              min="1"
              step="0.5"
              required
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="1000"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <input
                id="discount-toggle"
                type="checkbox"
                checked={isDiscountActive}
                onChange={(e) => setIsDiscountActive(e.target.checked)}
                className="rounded-sm border-[var(--border)] text-[var(--primary)]"
              />
              <Label htmlFor="discount-toggle" className="text-xs font-medium cursor-pointer">
                تفعيل خصم | Enable Sale
              </Label>
            </div>
            <Input
              id="product-discount"
              type="number"
              min="1"
              max="99"
              disabled={!isDiscountActive}
              value={discountPercent || ""}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              placeholder="نسبة الخصم % (مثلاً 20)"
              className="text-xs h-9"
            />
          </div>

          <div className="p-3 bg-[var(--muted)] rounded-sm">
            <p className="text-[10px] text-[var(--muted-foreground)]">السعر النهائي للعميل:</p>
            <p className="text-base font-semibold text-[var(--foreground)]">
              {formatPrice(finalPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Product Images */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            3. صور المنتج | Product Images
          </h2>
          <span className="text-xs text-[var(--muted-foreground)]">
            ارفع الصور مباشرة أو أضف روابط خارجية
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] text-xs h-9 shrink-0 gap-2"
          >
            {isUploadingImage ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جاري الرفع...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>رفع صورة من الجهاز | Upload Image</span>
              </>
            )}
          </Button>

          <div className="flex-1 flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="أو أدخل رابط صورة مباشر (URL)..."
              className="text-xs h-9"
            />
            <Button
              type="button"
              onClick={addImage}
              variant="outline"
              className="text-xs h-9 shrink-0 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة رابط</span>
            </Button>
          </div>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-[3/4] bg-[var(--muted)] border border-[var(--border)] rounded-sm overflow-hidden group"
              >
                <Image
                  src={img.url}
                  alt={img.altText}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1.5 bg-red-600 text-white rounded-sm hover:bg-red-700"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {img.isPrimary && (
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded-sm">
                    الأساسية
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 border border-dashed border-[var(--border)] text-center text-xs text-[var(--muted-foreground)]">
            <Upload className="w-6 h-6 mx-auto mb-2 text-[var(--muted-foreground)]" />
            <p>أضف رابط صورة أو ارفع صور المنتج مباشرة</p>
          </div>
        )}
      </div>

      {/* 4. Colors & Sizes Setup */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
          4. الألوان والمقاسات | Colors & Sizes
        </h2>

        {/* Colors */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">الألوان المتاحة | Colors</Label>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-2 px-2.5 py-1 text-xs border border-[var(--border)] bg-[var(--background)] rounded-sm"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: c.hexCode }}
                />
                <span>{c.name}</span>
                <button
                  type="button"
                  onClick={() => removeColor(c.name)}
                  className="text-red-500 hover:text-red-700 ml-1 text-xs"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md pt-1">
            <Input
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="اسم اللون (مثلاً: زيتوني)"
              className="text-xs h-8"
            />
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-9 h-8 p-0.5 border border-[var(--border)] rounded-sm cursor-pointer shrink-0"
              title="اختر درجة اللون"
            />
            <Button
              type="button"
              onClick={addColor}
              variant="outline"
              className="text-xs h-8 shrink-0"
            >
              إضافة لون
            </Button>
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-3 pt-3 border-t border-[var(--border)]">
          <Label className="text-xs font-medium">المقاسات المتاحة | Sizes</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-2 px-2.5 py-1 text-xs border border-[var(--border)] bg-[var(--background)] rounded-sm"
              >
                <span className="font-mono font-medium">{s.name}</span>
                <button
                  type="button"
                  onClick={() => removeSize(s.name)}
                  className="text-red-500 hover:text-red-700 ml-1 text-xs"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-sm pt-1">
            <Input
              value={newSizeName}
              onChange={(e) => setNewSizeName(e.target.value)}
              placeholder="المقاس (مثلاً: XL أو Free Size)"
              className="text-xs h-8 font-mono uppercase"
            />
            <Button
              type="button"
              onClick={addSize}
              variant="outline"
              className="text-xs h-8 shrink-0"
            >
              إضافة مقاس
            </Button>
          </div>
        </div>
      </div>

      {/* 5. Variant & Inventory Matrix */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            5. مصفوفة المتغيرات والمخزون | Variant & Inventory Matrix
          </h2>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
            يتم توليد جميع التوافقات تلقائياً (اللون &times; المقاس). حدد كمية المخزون لكل خيار بشكل مستقل لمنع الشراء الزائد.
          </p>
        </div>

        <div className="border border-[var(--border)] overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase text-[10px]">
              <tr>
                <th className="px-4 py-2.5">اللون | Color</th>
                <th className="px-4 py-2.5">المقاس | Size</th>
                <th className="px-4 py-2.5">الكمية بالمخزون | Stock Qty *</th>
                <th className="px-4 py-2.5">رمز الصنف | SKU</th>
                <th className="px-4 py-2.5">الحالة | Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {colors.flatMap((color) =>
                sizes.map((size) => {
                  const key = `${color.name}-${size.name}`;
                  const currentStock = variantStocks[key]?.stock ?? 0;
                  const currentSku = variantStocks[key]?.sku ?? "";

                  return (
                    <tr key={key} className="hover:bg-[var(--muted)]/50">
                      <td className="px-4 py-2.5 font-medium flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span>{color.name}</span>
                      </td>
                      <td className="px-4 py-2.5 font-mono font-medium">
                        {size.name}
                      </td>
                      <td className="px-4 py-2.5">
                        <Input
                          type="number"
                          min="0"
                          value={currentStock}
                          onChange={(e) =>
                            handleStockChange(color.name, size.name, Number(e.target.value))
                          }
                          className="w-24 h-7 text-xs font-mono"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <Input
                          type="text"
                          value={currentSku}
                          onChange={(e) =>
                            handleSkuChange(color.name, size.name, e.target.value)
                          }
                          placeholder={`${slug ? slug.toUpperCase().slice(0, 4) : "SH"}-${size.name}`}
                          className="w-32 h-7 text-xs font-mono"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        {currentStock === 0 ? (
                          <span className="text-[10px] text-red-600 font-medium">
                            غير متوفر (Out of stock)
                          </span>
                        ) : currentStock <= 2 ? (
                          <span className="text-[10px] text-amber-600 font-medium">
                            مخزون منخفض ({currentStock})
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            متوفر ({currentStock})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Badges & Tags */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
          6. وسوم التمييز | Promotional Badges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex items-center gap-2 text-xs cursor-pointer p-3 border border-[var(--border)] rounded-sm">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="rounded-sm border-[var(--border)] text-[var(--primary)]"
            />
            <div>
              <p className="font-medium">وصل حديثاً | New Arrival</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">يظهر في قسم وصل حديثاً</p>
            </div>
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer p-3 border border-[var(--border)] rounded-sm">
            <input
              type="checkbox"
              checked={isBestSeller}
              onChange={(e) => setIsBestSeller(e.target.checked)}
              className="rounded-sm border-[var(--border)] text-[var(--primary)]"
            />
            <div>
              <p className="font-medium">الأكثر مبيعاً | Best Seller</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">يظهر في قسم الأكثر طلباً</p>
            </div>
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer p-3 border border-[var(--border)] rounded-sm">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded-sm border-[var(--border)] text-[var(--primary)]"
            />
            <div>
              <p className="font-medium">منتج مميز | Featured</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">إبراز المنتج في الرئيسية</p>
            </div>
          </label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="text-xs h-9"
        >
          إلغاء | Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="text-xs h-9 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 px-6 font-medium"
        >
          {isSubmitting ? "جاري الحفظ..." : "حفظ ونشر المنتج | Save Product"}
        </Button>
      </div>
    </form>
  );
}


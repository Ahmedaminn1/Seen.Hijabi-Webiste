"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils/pricing";
import { useCartStore } from "@/store/cart";
import { getProductLiveStock } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Truck,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface ProductImageItem {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
}

interface ProductColorItem {
  id: string;
  name: string;
  hexCode: string;
}

interface ProductSizeItem {
  id: string;
  name: string;
  displayOrder: number;
}

interface ProductVariantItem {
  id: string;
  colorId: string;
  sizeId: string;
  sku: string | null;
  stock: number;
}

interface ProductDetailsClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    discountPercent: number | null;
    isDiscountActive: boolean;
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    categoryName: string | null;
    images: ProductImageItem[];
    colors: ProductColorItem[];
    sizes: ProductSizeItem[];
    variants: ProductVariantItem[];
  };
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter();
  const images = product.images.length > 0
    ? product.images
    : [{ id: "placeholder", url: "/placeholder.png", altText: product.name, displayOrder: 0 }];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColorItem>(
    product.colors[0] || { id: "", name: "", hexCode: "" }
  );
  const [selectedSize, setSelectedSize] = useState<ProductSizeItem>(
    product.sizes[0] || { id: "", name: "", displayOrder: 0 }
  );
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [variants, setVariants] = useState<ProductVariantItem[]>(product.variants);

  const addItemToCart = useCartStore((state) => state.addItem);

  // Live stock synchronization function
  const refreshLiveStock = useCallback(async () => {
    try {
      const liveVariants = await getProductLiveStock(product.id);
      if (liveVariants === null) {
        // Product was deleted or archived in dashboard — refresh to 404 / redirect
        router.refresh();
        return;
      }
      if (liveVariants && liveVariants.length > 0) {
        setVariants((prev) =>
          prev.map((v) => {
            const updated = liveVariants.find((lv) => lv.id === v.id);
            return updated ? { ...v, stock: updated.stock } : v;
          })
        );
      }
    } catch {
      router.refresh();
    }
  }, [product.id, router]);

  // Sync if parent props change
  useEffect(() => {
    setVariants(product.variants);
  }, [product.variants]);

  // Auto-refresh stock on window focus, tab switch, and every 4 seconds in the background
  useEffect(() => {
    const handleFocus = () => {
      refreshLiveStock();
      router.refresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshLiveStock();
        router.refresh();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(refreshLiveStock, 4000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [refreshLiveStock, router]);

  // Price calculations
  const hasDiscount =
    product.isDiscountActive &&
    product.discountPercent !== null &&
    product.discountPercent !== undefined &&
    product.discountPercent > 0;

  const discountedPrice =
    hasDiscount && product.discountPercent
      ? product.price * (1 - product.discountPercent / 100)
      : null;
  const currentPrice = discountedPrice ?? product.price;

  // Find the exact variant corresponding to selectedColor + selectedSize using live variants
  const currentVariant = variants.find(
    (v) => v.colorId === selectedColor.id && v.sizeId === selectedSize.id
  );

  const currentStock = currentVariant ? currentVariant.stock : 0;
  const isOutOfStock = currentStock <= 0;

  // Check overall product stock
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const isEntirelySoldOut = totalStock <= 0;

  // Helper to check stock for a specific size under currently selected color
  const getStockForSize = (sizeId: string) => {
    const v = variants.find(
      (v) => v.colorId === selectedColor.id && v.sizeId === sizeId
    );
    return v ? v.stock : 0;
  };

  const handleAddToCart = () => {
    if (!currentVariant || isOutOfStock) return;

    addItemToCart({
      productId: product.id,
      variantId: currentVariant.id,
      name: product.name,
      slug: product.slug,
      image: images[0]?.url || "/placeholder.png",
      colorName: selectedColor.name,
      colorHex: selectedColor.hexCode,
      sizeName: selectedSize.name,
      unitPrice: product.price,
      discountedPrice,
      quantity,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* 1. Image Gallery */}
      <div className="space-y-4">
        {/* Main Display Image */}
        <div className="relative aspect-[3/4] w-full bg-[var(--muted)] border border-[var(--border)] rounded-sm overflow-hidden">
          <Image
            src={images[activeImageIndex]?.url || "/placeholder.png"}
            alt={images[activeImageIndex]?.altText || product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />

          {isEntirelySoldOut ? (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <Badge variant="destructive" className="text-sm uppercase py-1.5 px-4 font-mono">
                نفد المخزون بالكامل | SOLD OUT
              </Badge>
            </div>
          ) : hasDiscount ? (
            <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-sm z-10">
              خصم {product.discountPercent}%
            </span>
          ) : null}
        </div>

        {/* Thumbnails row */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-16 h-20 bg-[var(--muted)] border rounded-sm overflow-hidden shrink-0 transition-all ${
                  activeImageIndex === idx
                    ? "border-[var(--brand-gold)] ring-1 ring-[var(--brand-gold)]"
                    : "border-[var(--border)] opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `${product.name} ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Product Information & Variant Selector */}
      <div className="space-y-6">
        {/* Header / Titles */}
        <div className="space-y-2 border-b border-[var(--border)] pb-4">
          {product.categoryName && (
            <span className="text-[11px] text-[var(--muted-foreground)] tracking-wider uppercase font-medium">
              {product.categoryName}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[var(--foreground)]">
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="flex items-center gap-3 pt-1">
            {hasDiscount ? (
              <>
                <span className="text-xl sm:text-2xl font-semibold text-[var(--foreground)] font-mono">
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-sm text-[var(--muted-foreground)] line-through font-mono">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200 text-[10px]">
                  وفرتي {formatPrice(product.price - currentPrice)}
                </Badge>
              </>
            ) : (
              <span className="text-xl sm:text-2xl font-semibold text-[var(--foreground)] font-mono">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Color Selector */}
        {product.colors.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[var(--foreground)]">
                اللون: <span className="font-normal text-[var(--muted-foreground)]">{selectedColor.name}</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => {
                const isSelected = selectedColor.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c);
                      refreshLiveStock();
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs transition-colors ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: c.hexCode }}
                    />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size Selector (Influenced by Selected Color Stock) */}
        {product.sizes.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[var(--foreground)]">
                المقاس: <span className="font-mono font-normal text-[var(--muted-foreground)]">{selectedSize.name}</span>
              </span>
              {currentVariant?.sku && (
                <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                  SKU: {currentVariant.sku}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const isSelected = selectedSize.id === s.id;
                const sizeStock = getStockForSize(s.id);
                const isSizeOut = sizeStock <= 0;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedSize(s);
                      refreshLiveStock();
                    }}
                    className={`min-w-12 h-9 px-3 font-mono text-xs font-medium rounded-sm border transition-colors relative ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : isSizeOut
                        ? "border-dashed border-[var(--border)] text-[var(--muted-foreground)]/50 bg-[var(--muted)]/40 hover:bg-[var(--muted)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    <span>{s.name}</span>
                    {isSizeOut && (
                      <span className="block text-[8px] font-sans text-red-500">
                        نفد
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Real-time Stock Availability Feedback */}
        <div className="p-3 bg-[var(--muted)]/60 border border-[var(--border)] rounded-sm text-xs">
          {isOutOfStock ? (
            <div className="flex items-center gap-2 text-red-600 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>هذا المقاس غير متوفر حالياً بهذا اللون (Out of stock)</span>
            </div>
          ) : currentStock <= 2 ? (
            <div className="flex items-center gap-2 text-amber-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>متبقي {currentStock} فقط في المخزون! اطلبي الآن قبل النفاد</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-700 font-medium">
              <Check className="w-4 h-4 shrink-0" />
              <span>متوفر في المخزون وجاهز للشحن الفوري</span>
            </div>
          )}
        </div>

        {/* Quantity & Add to Cart */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center border border-[var(--border)] rounded-sm h-11 bg-[var(--card)]">
              <button
                type="button"
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 h-full hover:bg-[var(--muted)] disabled:opacity-30 transition-colors"
                aria-label="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 font-mono text-sm font-semibold min-w-8 text-center">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= currentStock || isOutOfStock}
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                className="px-3 h-full hover:bg-[var(--muted)] disabled:opacity-30 transition-colors"
                aria-label="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button
              type="button"
              disabled={isOutOfStock || isEntirelySoldOut}
              onClick={handleAddToCart}
              className="flex-1 h-11 text-xs sm:text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 rounded-sm gap-2 transition-colors duration-150"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {isEntirelySoldOut
                  ? "نفد المنتج بالكامل | SOLD OUT"
                  : isOutOfStock
                  ? "الخيار غير متوفر | Out of Stock"
                  : "إضافة إلى حقيبة التسوق | Add to Bag"}
              </span>
            </Button>
          </div>

          {/* Toast feedback */}
          {addedToast && (
            <div
              role="status"
              className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تمت إضافة القطعة بنجاح إلى حقيبتك!</span>
              </span>
              <span className="text-[10px] text-emerald-700 underline font-mono">
                {quantity} &times; {selectedColor.name} / {selectedSize.name}
              </span>
            </div>
          )}
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="pt-4 border-t border-[var(--border)] space-y-2">
            <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
              تفاصيل وخامة المنتج | Description
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Delivery & Payment Badges */}
        <div className="pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-3 text-[11px] text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[var(--foreground)] shrink-0" />
            <span>توصيل سريع خلال 2 - 4 أيام عمل</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--foreground)] shrink-0" />
            <span>الدفع عند الاستلام مع معاينة المنتج</span>
          </div>
        </div>
      </div>
    </div>
  );
}

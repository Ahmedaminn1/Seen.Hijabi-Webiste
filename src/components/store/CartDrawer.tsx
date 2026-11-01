"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { formatPrice, getFreeShippingProgress, calculateShippingFee } from "@/lib/utils/pricing";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";

interface CartDrawerProps {
  shippingSettings?: {
    freeShippingEnabled: boolean;
    freeShippingMinAmount: number | null;
    freeShippingMinQty: number | null;
    fixedShippingCost: number;
  };
}

export function CartDrawer({
  shippingSettings = {
    freeShippingEnabled: true,
    freeShippingMinAmount: 1000,
    freeShippingMinQty: 2,
    fixedShippingCost: 65,
  },
}: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalItems = useCartStore((state) => state.totalItems());
  const subtotal = useCartStore((state) => state.subtotal());

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeSubtotal = mounted ? subtotal : 0;
  const safeTotalItems = mounted ? totalItems : 0;
  const safeItems = mounted ? items : [];

  // Shipping progress calculation
  const shippingProgress = getFreeShippingProgress(safeSubtotal, safeTotalItems, shippingSettings);
  const shippingCalculation = calculateShippingFee(safeSubtotal, safeTotalItems, shippingSettings);
  const finalTotal = safeSubtotal + shippingCalculation.fee;

  const progressPercent = shippingSettings.freeShippingMinAmount
    ? Math.min(100, (safeSubtotal / shippingSettings.freeShippingMinAmount) * 100)
    : shippingSettings.freeShippingMinQty
    ? Math.min(100, (safeTotalItems / shippingSettings.freeShippingMinQty) * 100)
    : 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        className="relative p-2 text-[var(--foreground)] hover:opacity-80 transition-opacity"
        aria-label="حقيبة التسوق | Shopping Bag"
      >
        <ShoppingBag className="w-5 h-5" />
        {mounted && safeTotalItems > 0 && (
          <span className="absolute top-1 right-1 bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium font-mono">
            {safeTotalItems}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 bg-[var(--card)]">
        <SheetHeader className="p-4 border-b border-[var(--border)]">
          <SheetTitle className="text-sm font-serif tracking-tight text-[var(--foreground)] flex justify-between items-center">
            <span>حقيبة التسوق | Shopping Bag</span>
            <span className="text-xs font-sans text-[var(--muted-foreground)]">
              ({safeTotalItems} {safeTotalItems === 1 ? "قطعة" : "قطع"})
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Dynamic Free Shipping Progress Bar */}
        {shippingSettings.freeShippingEnabled && items.length > 0 && (
          <div className="p-3 bg-[var(--muted)]/60 border-b border-[var(--border)] text-xs space-y-2">
            <div className="flex justify-between items-center font-medium text-[11px]">
              {shippingProgress.isUnlocked ? (
                <span className="text-emerald-700">لقد حصلت على شحن مجاني!</span>
              ) : (
                <span>
                  أضف{" "}
                  {shippingProgress.amountNeeded !== null
                    ? formatPrice(shippingProgress.amountNeeded)
                    : `${shippingProgress.qtyNeeded} قطع إضافية`}{" "}
                  للحصول على شحن مجاني
                </span>
              )}
              <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                {Math.round(progressPercent)}%
              </span>
            </div>

            <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--brand-gold)] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-[var(--border)]">
          {safeItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--muted-foreground)] space-y-3">
              <ShoppingBag className="w-10 h-10 opacity-30 stroke-[1.5]" />
              <p className="text-sm font-medium">حقيبة التسوق فارغة</p>
              <p className="text-xs">تصفحي تشكيلتنا الراقية من الحجابات والفساتين</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs mt-2"
              >
                تصفح المنتجات
              </Button>
            </div>
          ) : (
            safeItems.map((item) => (
              <div key={item.variantId} className="py-3 flex gap-3 items-center">
                <div className="w-16 h-20 relative bg-[var(--muted)] border border-[var(--border)] rounded-sm overflow-hidden shrink-0">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-medium text-[var(--foreground)] hover:underline truncate block"
                  >
                    {item.name}
                  </Link>

                  <div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      <span>{item.colorName}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="font-mono">المقاس: {item.sizeName}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-[var(--border)] rounded-sm">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="p-1 hover:bg-[var(--muted)] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3 text-[var(--foreground)]" />
                      </button>
                      <span className="px-2 text-xs font-mono font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="p-1 hover:bg-[var(--muted)] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3 text-[var(--foreground)]" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-[var(--foreground)] font-mono">
                        {formatPrice((item.discountedPrice ?? item.unitPrice) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.variantId)}
                  className="p-1 text-[var(--muted-foreground)] hover:text-red-600 transition-colors shrink-0"
                  title="إزالة من السلة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {safeItems.length > 0 && (
          <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[var(--muted-foreground)]">
                <span>المجموع الفرعي:</span>
                <span className="font-mono">{formatPrice(safeSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted-foreground)]">
                <span>الشحن التقديري:</span>
                <span className="font-mono">
                  {shippingCalculation.isFree ? (
                    <span className="text-emerald-700 font-medium">مجاني</span>
                  ) : (
                    formatPrice(shippingCalculation.fee)
                  )}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-sm pt-2 border-t border-[var(--border)] text-[var(--foreground)]">
                <span>الإجمالي:</span>
                <span className="font-mono">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 h-10 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-medium rounded-sm hover:bg-[var(--primary)]/90 transition-colors"
            >
              <span>متابعة إتمام الطلب | Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

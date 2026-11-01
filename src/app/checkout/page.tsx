"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { placeOrder, GOVERNORATES_LIST } from "@/lib/actions/checkout";
import { formatPrice } from "@/lib/utils/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ShoppingBag, Truck, AlertCircle } from "lucide-react";
import type { CartItem } from "@/store/cart";

// ─── Form Schema (mirrors server schema — client copy for UX only) ────────────

const CheckoutClientSchema = z.object({
  fullName: z
    .string()
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل")
    .max(100),
  phone: z
    .string()
    .regex(/^(\+20|0)?1[0-9]{9}$/, "رقم الهاتف غير صحيح"),
  whatsapp: z
    .string()
    .regex(/^(\+20|0)?1[0-9]{9}$/, "رقم الواتساب غير صحيح")
    .optional()
    .or(z.literal("")),
  governorate: z.string().min(1, "اختار المحافظة"),
  city: z.string().min(2, "المدينة مطلوبة"),
  address: z.string().min(10, "العنوان يجب أن يكون 10 أحرف على الأقل"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

type CheckoutFormValues = z.infer<typeof CheckoutClientSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

// Hard-coded shipping estimate for display — server recalculates the real value
const DISPLAY_SHIPPING_FEE = 65;
const FREE_SHIPPING_THRESHOLD = 1000;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, subtotal, totalItems } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [utmSource, setUtmSource] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read UTM source that UtmTracker stored in sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("utm_source");
      if (stored) setUtmSource(stored);
    } catch {
      // sessionStorage not available
    }
  }, []);

  // Redirect to products if cart is empty after hydration
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace("/products");
    }
  }, [mounted, items.length, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(CheckoutClientSchema),
  });

  // Derived totals (display only — server recalculates)
  const sub = subtotal();
  const qty = totalItems();
  const shippingFee = sub >= FREE_SHIPPING_THRESHOLD || qty >= 2 ? 0 : DISPLAY_SHIPPING_FEE;
  const total = sub + shippingFee;

  const onSubmit = (values: CheckoutFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("fullName", values.fullName);
      formData.set("phone", values.phone);
      formData.set("whatsapp", values.whatsapp ?? "");
      formData.set("governorate", values.governorate);
      formData.set("city", values.city);
      formData.set("address", values.address);
      formData.set("notes", values.notes ?? "");
      formData.set("utmSource", utmSource);
      formData.set("cartJson", JSON.stringify(items));

      const result = await placeOrder(formData);

      if (result.success) {
        clearCart();
        router.push(`/order-success?order=${result.orderNumber}`);
      } else {
        setServerError(result.error);
        // Scroll to error banner
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  if (!mounted || items.length === 0) {
    return (
      <div className="min-h-screen bg-[oklch(0.97_0.01_80)] flex items-center justify-center">
        <p className="text-[oklch(0.45_0_0)]">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_80)]">
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[oklch(0.9_0_0)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm text-[oklch(0.45_0_0)] hover:text-[oklch(0.145_0_0)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            متابعة التسوق
          </Link>
          <span
            className="font-serif text-xl text-[oklch(0.145_0_0)] tracking-wide"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Seen Hijabi
          </span>
          <div className="flex items-center gap-1.5 text-sm text-[oklch(0.45_0_0)]">
            <ShoppingBag className="w-4 h-4" />
            <span>{qty} قطعة</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        {/* ── Error Banner ──────────────────────────────────────────── */}
        {serverError && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{serverError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
          {/* ── Left: Form ────────────────────────────────────────────── */}
          <section>
            <h1
              className="font-serif text-2xl sm:text-3xl text-[oklch(0.145_0_0)] mb-8"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              بيانات الشحن
            </h1>

            <form
              id="checkout-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              dir="rtl"
            >
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  الاسم بالكامل <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="مثال: فاطمة محمد"
                  className={errors.fullName ? "border-red-400" : ""}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              {/* Phone + WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    className={errors.phone ? "border-red-400" : ""}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp" className="text-sm font-medium">
                    واتساب{" "}
                    <span className="text-[oklch(0.55_0_0)] font-normal">(اختياري)</span>
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    className={errors.whatsapp ? "border-red-400" : ""}
                    {...register("whatsapp")}
                  />
                  {errors.whatsapp && (
                    <p className="text-xs text-red-600">{errors.whatsapp.message}</p>
                  )}
                </div>
              </div>

              {/* Governorate + City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    المحافظة <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("governorate", String(val ?? ""), { shouldValidate: true })
                    }
                  >
                    <SelectTrigger
                      className={errors.governorate ? "border-red-400" : ""}
                    >
                      <SelectValue placeholder="اختار المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOVERNORATES_LIST.map((gov) => (
                        <SelectItem key={gov} value={gov}>
                          {gov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.governorate && (
                    <p className="text-xs text-red-600">{errors.governorate.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-sm font-medium">
                    المدينة / الحي <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="مثال: مدينة نصر"
                    className={errors.city ? "border-red-400" : ""}
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-600">{errors.city.message}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-sm font-medium">
                  العنوان بالتفصيل <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="الشارع، رقم المبنى، الدور، الشقة..."
                  rows={3}
                  className={errors.address ? "border-red-400" : ""}
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-xs text-red-600">{errors.address.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm font-medium">
                  ملاحظات للطلب{" "}
                  <span className="text-[oklch(0.55_0_0)] font-normal">(اختياري)</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="أي تفاصيل إضافية للطلب..."
                  rows={2}
                  {...register("notes")}
                />
              </div>
            </form>
          </section>

          {/* ── Right: Order Summary ───────────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-xl border border-[oklch(0.9_0_0)] p-6 space-y-4">
              <h2
                className="font-serif text-lg text-[oklch(0.145_0_0)]"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                ملخص الطلب
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item: CartItem) => (
                  <div key={item.variantId} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-md overflow-hidden bg-[oklch(0.95_0_0)] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[oklch(0.145_0_0)] text-white text-[10px] flex items-center justify-center font-medium">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0" dir="rtl">
                      <p className="text-sm font-medium text-[oklch(0.145_0_0)] truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-[oklch(0.55_0_0)]">
                        {item.colorName} / {item.sizeName}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-[oklch(0.145_0_0)] shrink-0">
                      {formatPrice(
                        (item.discountedPrice ?? item.unitPrice) * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 text-sm" dir="rtl">
                <div className="flex justify-between text-[oklch(0.45_0_0)]">
                  <span>المجموع الفرعي</span>
                  <span>{formatPrice(sub)}</span>
                </div>
                <div className="flex justify-between text-[oklch(0.45_0_0)]">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    الشحن
                  </span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-medium">مجاني</span>
                  ) : (
                    <span>{formatPrice(shippingFee)}</span>
                  )}
                </div>
                {shippingFee > 0 && sub < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-[oklch(0.55_0_0)] bg-[oklch(0.97_0.01_80)] rounded-md p-2">
                    أضف{" "}
                    <span className="font-medium text-[oklch(0.72_0.08_70)]">
                      {formatPrice(FREE_SHIPPING_THRESHOLD - sub)}
                    </span>{" "}
                    للحصول على شحن مجاني
                  </p>
                )}
              </div>

              <Separator />

              <div
                className="flex justify-between font-semibold text-base"
                dir="rtl"
              >
                <span>الإجمالي</span>
                <span className="text-[oklch(0.145_0_0)]">{formatPrice(total)}</span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                form="checkout-form"
                disabled={isPending}
                className="w-full bg-[oklch(0.145_0_0)] text-white hover:bg-[oklch(0.25_0_0)] transition-colors h-12 text-base font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? "جاري تسجيل الطلب..." : "تأكيد الطلب"}
              </Button>

              <p className="text-center text-xs text-[oklch(0.55_0_0)]">
                سيتم التواصل معك لتأكيد الطلب قبل الشحن
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}


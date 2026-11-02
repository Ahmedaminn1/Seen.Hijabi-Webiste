"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { placeOrder } from "@/lib/actions/checkout";
import { uploadPaymentReceipt } from "@/lib/actions/upload";
import { getStoreSettings } from "@/lib/actions/settings";
import {
  GOVERNORATES_LIST,
  GOVERNORATE_SHIPPING_RATES,
  GOVERNORATE_DISPLAY_LABELS,
  getShippingFeeForGovernorate,
} from "@/lib/constants/governorates";
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
import {
  ChevronLeft,
  ShoppingBag,
  Truck,
  AlertCircle,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  Info,
} from "lucide-react";
import type { CartItem } from "@/store/cart";

// ─── Form Schema (Client UX Validation) ──────────────────────────────────────

const CheckoutClientSchema = z.object({
  fullName: z
    .string()
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل")
    .max(100),
  phone: z
    .string()
    .regex(/^(\+20|0)?1[0-9]{9}$/, "رقم الهاتف غير صحيح — يجب أن يكون رقم مصري"),
  whatsapp: z
    .string()
    .regex(/^(\+20|0)?1[0-9]{9}$/, "رقم الواتساب غير صحيح")
    .optional()
    .or(z.literal("")),
  governorate: z.string().min(1, "يرجى اختيار المحافظة لحساب الشحن"),
  city: z.string().min(2, "المدينة أو المنطقة مطلوبة"),
  address: z.string().min(10, "العنوان بالتفصيل يجب أن يكون 10 أحرف على الأقل"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

type CheckoutFormValues = z.infer<typeof CheckoutClientSchema>;

// ─── Main Checkout Page Component ────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, subtotal, totalItems } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [utmSource, setUtmSource] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Store payment info & receipt upload
  const [paymentPhone, setPaymentPhone] = useState("01000000000");
  const [copied, setCopied] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    getStoreSettings().then((settings) => {
      if (settings?.whatsappNumber) {
        setPaymentPhone(settings.whatsappNumber);
      }
    });
  }, []);

  // Read UTM source from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("utm_source");
      if (stored) setUtmSource(stored);
    } catch {
      // ignore
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
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(CheckoutClientSchema),
  });

  const selectedGovernorate = watch("governorate");
  const sub = subtotal();
  const qty = totalItems();
  const shippingFee = getShippingFeeForGovernorate(selectedGovernorate);
  const total = sub + shippingFee;

  const handleCopyPhone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(paymentPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingReceipt(true);
    setReceiptError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadPaymentReceipt(formData);
      if (res.success && res.url) {
        setReceiptUrl(res.url);
      } else {
        setReceiptError(res.error || "فشل رفع صورة الإيصال");
      }
    } catch {
      setReceiptError("حدث خطأ أثناء رفع صورة الإيصال");
    } finally {
      setIsUploadingReceipt(false);
    }
  };

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
      formData.set("receiptUrl", receiptUrl);
      formData.set("utmSource", utmSource);
      formData.set("cartJson", JSON.stringify(items));

      const result = await placeOrder(formData);

      if (result.success) {
        clearCart();
        router.push(`/order-success?order=${result.orderNumber}`);
      } else {
        setServerError(result.error);
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
      <header className="bg-white border-b border-[oklch(0.9_0_0)] sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/products"
            className="flex items-center gap-1 text-xs sm:text-sm text-[oklch(0.45_0_0)] hover:text-[oklch(0.145_0_0)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>متابعة التسوق</span>
          </Link>
          <span
            className="font-serif text-lg sm:text-xl text-[oklch(0.145_0_0)] tracking-wide font-medium"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Seen Hijabi
          </span>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[oklch(0.45_0_0)]">
            <ShoppingBag className="w-4 h-4" />
            <span>{qty} قطعة</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ── Error Banner ──────────────────────────────────────────── */}
        {serverError && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{serverError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-10">
          {/* ── Left: Form ────────────────────────────────────────────── */}
          <section className="space-y-6">
            <div>
              <h1
                className="font-serif text-2xl sm:text-3xl text-[oklch(0.145_0_0)] tracking-tight"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                إتمام الطلب وبيانات الشحن
              </h1>
              <p className="text-xs sm:text-sm text-[oklch(0.45_0_0)] mt-1">
                يرجى إدخال عنوانك بدقة ليصلك الطلب في أسرع وقت
              </p>
            </div>

            {/* ── Important Shipping Pre-payment Alert Box ── */}
            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-xl p-4 sm:p-5 text-amber-950 space-y-4 shadow-xs" dir="rtl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-200 text-amber-900 rounded-lg shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm sm:text-base text-amber-950">
                    تنبيه هام لتأكيد وشحن طلبك (تحويل مصاريف الشحن مسبقاً)
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                    نظراً لسياسة شركات الشحن، <strong className="text-amber-950 font-bold">لا يتم تسليم الأوردر للمندوب إلا بعد تحويل مبلغ الشحن مسبقاً ({formatPrice(shippingFee)}) لجدية الاستلام</strong>. باقي ثمن المنتجات ({formatPrice(sub)}) يتم دفعه كاش عند الاستلام.
                  </p>
                </div>
              </div>

              {/* Payment Details Container */}
              <div className="bg-white/95 rounded-lg p-3.5 sm:p-4 border border-amber-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-amber-900">
                      رقم فودافون كاش / إنستاباي (InstaPay):
                    </span>
                    <span className="font-mono font-bold text-sm text-[oklch(0.145_0_0)] bg-amber-100/60 px-2 py-0.5 rounded" dir="ltr">
                      {paymentPhone}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-amber-900 hover:bg-amber-800 text-white px-3 py-1.5 rounded transition-colors self-start sm:self-auto"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>تم النسخ ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرقم</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-amber-800 leading-normal">
                  * مبلغ الشحن المطلوب تحويله لتأكيد الطلب هو: <strong className="font-bold">{formatPrice(shippingFee)}</strong> {selectedGovernorate ? `(لمحافظة ${selectedGovernorate})` : ""}.
                </p>

                {/* Upload Receipt Screenshot */}
                <div className="pt-2 border-t border-amber-100 space-y-2">
                  <Label className="text-xs font-semibold text-amber-950 block">
                    إرفاق سكرين شوت التحويل (اختياري الآن — ويمكنك إرسالها لاحقاً عبر واتساب):
                  </Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                    <input
                      type="file"
                      ref={receiptInputRef}
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => receiptInputRef.current?.click()}
                      disabled={isUploadingReceipt}
                      className="h-9 text-xs gap-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-950 font-medium"
                    >
                      {isUploadingReceipt ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>جاري رفع الإيصال...</span>
                        </>
                      ) : receiptUrl ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>تم إرفاق الإيصال بنجاح ✓ (اضغط للتغيير)</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>رفع سكرين شوت التحويل 📸</span>
                        </>
                      )}
                    </Button>
                    {receiptUrl && (
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        سيتم حفظ الإيصال مع بيانات طلبك تلقائياً
                      </span>
                    )}
                  </div>
                  {receiptError && (
                    <p className="text-xs text-red-600">{receiptError}</p>
                  )}
                </div>
              </div>
            </div>

            <form
              id="checkout-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 bg-white rounded-xl border border-[oklch(0.9_0_0)] p-5 sm:p-7"
              dir="rtl"
            >
              <h2 className="text-base font-semibold text-[oklch(0.145_0_0)] border-b border-[oklch(0.92_0_0)] pb-3">
                بيانات المستلم والتوصيل
              </h2>

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs sm:text-sm font-medium">
                  الاسم بالكامل <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="مثال: سارة أحمد محمود"
                  className={`h-10 text-xs sm:text-sm ${errors.fullName ? "border-red-400" : ""}`}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              {/* Phone + WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs sm:text-sm font-medium">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    className={`h-10 text-xs sm:text-sm ${errors.phone ? "border-red-400" : ""}`}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp" className="text-xs sm:text-sm font-medium">
                    رقم الواتساب{" "}
                    <span className="text-[oklch(0.55_0_0)] font-normal text-xs">(اختياري للتواصل السريع)</span>
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    className={`h-10 text-xs sm:text-sm ${errors.whatsapp ? "border-red-400" : ""}`}
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
                  <Label className="text-xs sm:text-sm font-medium">
                    المحافظة <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("governorate", String(val ?? ""), { shouldValidate: true })
                    }
                  >
                    <SelectTrigger
                      className={`h-10 text-xs sm:text-sm ${errors.governorate ? "border-red-400" : ""}`}
                    >
                      <SelectValue placeholder="اختر محافظتك لحساب الشحن" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOVERNORATES_LIST.map((gov) => {
                        const rate = GOVERNORATE_SHIPPING_RATES[gov];
                        const label = GOVERNORATE_DISPLAY_LABELS[gov] || gov;
                        return (
                          <SelectItem key={gov} value={gov}>
                            <div className="flex items-center justify-between w-full gap-3">
                              <span>{label}</span>
                              <span className="font-mono text-xs font-semibold text-amber-800">
                                ({rate} ج.م)
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.governorate && (
                    <p className="text-xs text-red-600">{errors.governorate.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs sm:text-sm font-medium">
                    المدينة / الحي / المنطقة <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="مثال: مدينة نصر / التجمع / المعادي"
                    className={`h-10 text-xs sm:text-sm ${errors.city ? "border-red-400" : ""}`}
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-600">{errors.city.message}</p>
                  )}
                </div>
              </div>

              {/* Detailed Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs sm:text-sm font-medium">
                  العنوان بالتفصيل <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="اسم الشارع، رقم العمارة، الدور، رقم الشقة أو علامة مميزة بجوارك..."
                  rows={3}
                  className={`text-xs sm:text-sm ${errors.address ? "border-red-400" : ""}`}
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-xs text-red-600">{errors.address.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs sm:text-sm font-medium">
                  ملاحظات إضافية للطلب{" "}
                  <span className="text-[oklch(0.55_0_0)] font-normal text-xs">(اختياري)</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="أي تعليمات إضافية بخصوص موعد الاستلام أو التواصل..."
                  rows={2}
                  className="text-xs sm:text-sm"
                  {...register("notes")}
                />
              </div>
            </form>
          </section>

          {/* ── Right: Order Summary ───────────────────────────────────── */}
          <aside className="lg:sticky lg:top-20 lg:self-start space-y-4">
            <div className="bg-white rounded-xl border border-[oklch(0.9_0_0)] p-5 sm:p-6 space-y-4 shadow-xs">
              <h2
                className="font-serif text-lg text-[oklch(0.145_0_0)] font-medium"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                ملخص الطلب ({qty} قطعة)
              </h2>

              {/* Cart Items List */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item: CartItem) => (
                  <div key={item.variantId} className="flex items-center gap-3">
                    <div className="relative w-13 h-13 rounded-md overflow-hidden bg-[oklch(0.95_0_0)] shrink-0 border border-[oklch(0.9_0_0)]">
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
                      <p className="text-xs sm:text-sm font-medium text-[oklch(0.145_0_0)] truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[oklch(0.55_0_0)]">
                        {item.colorName} • {item.sizeName}
                      </p>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[oklch(0.145_0_0)] shrink-0">
                      {formatPrice(
                        (item.discountedPrice ?? item.unitPrice) * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs sm:text-sm" dir="rtl">
                <div className="flex justify-between text-[oklch(0.45_0_0)]">
                  <span>ثمن المنتجات</span>
                  <span className="font-medium text-[oklch(0.145_0_0)]">{formatPrice(sub)}</span>
                </div>

                <div className="flex justify-between items-center text-[oklch(0.45_0_0)]">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>
                      مصاريف الشحن
                      {selectedGovernorate && (
                        <span className="text-[11px] text-[oklch(0.55_0_0)] mr-1">
                          ({selectedGovernorate})
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="font-semibold text-amber-900">
                    {formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="bg-amber-50/70 border border-amber-200/70 rounded-md p-2.5 text-[11px] text-amber-900 space-y-1">
                  <div className="flex justify-between">
                    <span>مطلوب تحويله مسبقاً (الشحن):</span>
                    <span className="font-bold">{formatPrice(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-[oklch(0.35_0_0)] pt-1 border-t border-amber-200/50">
                    <span>المتبقي عند الاستلام:</span>
                    <span className="font-bold">{formatPrice(sub)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Grand Total */}
              <div
                className="flex justify-between font-bold text-base text-[oklch(0.145_0_0)]"
                dir="rtl"
              >
                <span>إجمالي الطلب الكلي</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                form="checkout-form"
                disabled={isPending}
                className="w-full bg-[oklch(0.145_0_0)] text-white hover:bg-[oklch(0.25_0_0)] transition-colors h-12 text-sm sm:text-base font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? "جاري تسجيل وتأكيد الطلب..." : "تأكيد الطلب الآن"}
              </Button>

              <div className="flex items-center gap-2 text-center justify-center text-[11px] text-[oklch(0.55_0_0)]">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>سيتم مراجعة إيصال التحويل وشحن طلبك فوراً</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

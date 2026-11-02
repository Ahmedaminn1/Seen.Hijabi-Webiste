import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils/pricing";
import { ClearCartOnMount } from "./ClearCartOnMount";
import { CheckCircle2, MessageCircle, ArrowRight, Package, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

interface OrderSuccessProps {
  searchParams: Promise<{
    order?: string;
  }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessProps) {
  const params = await searchParams;
  const orderNumber = params.order;

  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-[oklch(0.97_0.01_80)] flex flex-col items-center justify-center p-4" dir="rtl">
        <h1 className="text-xl font-medium text-[oklch(0.145_0_0)] mb-4">لم يتم العثور على رقم الطلب</h1>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[oklch(0.145_0_0)] text-white px-6 py-2.5 rounded-lg text-sm"
        >
          العودة للتسوق
        </Link>
      </div>
    );
  }

  const [order, storeSettings] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
      },
    }),
    prisma.storeSettings.findUnique({
      where: { id: "default" },
    }),
  ]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[oklch(0.97_0.01_80)] flex flex-col items-center justify-center p-4" dir="rtl">
        <h1 className="text-xl font-medium text-[oklch(0.145_0_0)] mb-2">طلب غير موجود</h1>
        <p className="text-sm text-[oklch(0.45_0_0)] mb-6">
          لم نتمكن من العثور على الطلب رقم: {orderNumber}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[oklch(0.145_0_0)] text-white px-6 py-2.5 rounded-lg text-sm"
        >
          العودة للتسوق
        </Link>
      </div>
    );
  }

  const rawPhone = storeSettings?.whatsappNumber || "201000000000";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    `مرحباً ${storeSettings?.storeName || "Seen Hijabi"}، بخصوص طلبي رقم (${order.orderNumber}) لمحافظة ${order.governorate}، مرفق إيصال تحويل مبلغ الشحن (${Number(order.shippingFee)} ج.م) لتأكيد وشحن الأوردر.`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_80)] py-12 px-4 sm:px-6">
      <ClearCartOnMount />

      <div className="max-w-2xl mx-auto space-y-8" dir="rtl">
        {/* ── Brand Header ────────────────────────────────────────── */}
        <div className="text-center">
          <Link
            href="/"
            className="font-serif text-2xl tracking-wide text-[oklch(0.145_0_0)] inline-block font-medium"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {storeSettings?.storeName || "Seen Hijabi"}
          </Link>
        </div>

        {/* ── Success Card ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[oklch(0.9_0_0)] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1
              className="font-serif text-2xl sm:text-3xl text-[oklch(0.145_0_0)]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              تم استلام طلبك بنجاح!
            </h1>
            <p className="text-sm text-[oklch(0.45_0_0)] max-w-md">
              شكراً لتسوقك معنا، تم تسجيل الطلب وسنقوم بتجهيزه فور استلام إيصال تحويل الشحن.
            </p>
            <div className="inline-block bg-[oklch(0.97_0.01_80)] border border-[oklch(0.9_0_0)] px-4 py-2 rounded-lg text-sm font-mono text-[oklch(0.145_0_0)]">
              رقم الطلب: <span className="font-bold">{order.orderNumber}</span>
            </div>

            {/* ── Upfront Shipping Confirmation Card ── */}
            <div className="w-full bg-amber-50/90 border-2 border-amber-300 rounded-xl p-4 sm:p-5 text-amber-950 text-right space-y-2.5 mt-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>خطوة هامة لتأكيد وشحن طلبك:</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                يرجى تحويل مصاريف الشحن (<strong className="font-bold">{formatPrice(Number(order.shippingFee))}</strong>) عبر فودافون كاش أو إنستاباي على الرقم: <strong className="font-mono text-sm underline px-1" dir="ltr">{storeSettings?.whatsappNumber || "رقم المتجر"}</strong> وإرسال سكرين شوت التحويل عبر زر الواتساب بالأسفل.
              </p>
              <p className="text-[11px] text-amber-800">
                * باقي قيمة المنتجات (<strong className="font-bold">{formatPrice(Number(order.subtotal))}</strong>) تُدفع عند الاستلام.
              </p>
            </div>
          </div>

          <Separator />

          {/* ── Customer Details ──────────────────────────────────── */}
          <div className="space-y-3 text-sm">
            <h2 className="font-medium text-[oklch(0.145_0_0)]">بيانات التوصيل</h2>
            <div className="bg-[oklch(0.98_0_0)] rounded-lg p-4 space-y-2 text-[oklch(0.45_0_0)]">
              <div className="flex justify-between">
                <span>الاسم:</span>
                <span className="font-medium text-[oklch(0.145_0_0)]">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>رقم الهاتف:</span>
                <span className="font-mono text-[oklch(0.145_0_0)]" dir="ltr">{order.customerPhone}</span>
              </div>
              {order.customerWhatsapp && (
                <div className="flex justify-between">
                  <span>الواتساب:</span>
                  <span className="font-mono text-[oklch(0.145_0_0)]" dir="ltr">{order.customerWhatsapp}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>المحافظة والمدينة:</span>
                <span className="text-[oklch(0.145_0_0)]">{order.governorate} - {order.city}</span>
              </div>
              <div className="flex justify-between">
                <span>العنوان:</span>
                <span className="text-[oklch(0.145_0_0)]">{order.address}</span>
              </div>
              {order.notes && (
                <div className="flex justify-between">
                  <span>ملاحظات:</span>
                  <span className="text-[oklch(0.145_0_0)]">{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* ── Order Items ───────────────────────────────────────── */}
          <div className="space-y-3 text-sm">
            <h2 className="font-medium text-[oklch(0.145_0_0)] flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[oklch(0.55_0_0)]" />
              المنتجات المطلوبة ({order.items.length})
            </h2>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-[oklch(0.95_0_0)] last:border-0"
                >
                  <div>
                    <p className="font-medium text-[oklch(0.145_0_0)]">{item.productName}</p>
                    <p className="text-xs text-[oklch(0.55_0_0)]">
                      {item.colorName} • {item.sizeName} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-[oklch(0.145_0_0)]">
                    {formatPrice(Number(item.totalPrice))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* ── Financial Summary ─────────────────────────────────── */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[oklch(0.45_0_0)]">
              <span>ثمن المنتجات (المطلوب عند الاستلام)</span>
              <span className="font-semibold text-[oklch(0.145_0_0)]">{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-[oklch(0.45_0_0)]">
              <span>مصاريف الشحن ({order.governorate}) — محولة مسبقاً</span>
              <span className="font-semibold text-amber-900">{formatPrice(Number(order.shippingFee))}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base text-[oklch(0.145_0_0)] pt-1">
              <span>إجمالي قيمة الطلب</span>
              <span>{formatPrice(Number(order.totalAmount))}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-md mt-2">
              <span>المبلغ المستحق كاش عند الاستلام:</span>
              <span className="font-bold">{formatPrice(Number(order.subtotal))}</span>
            </div>
          </div>

          {/* ── Actions ───────────────────────────────────────────── */}
          <div className="pt-4 space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-4 rounded-lg text-sm font-semibold transition-colors shadow-xs"
            >
              <MessageCircle className="w-5 h-5" />
              إرسال سكرين شوت التحويل وتأكيد الطلب عبر الواتساب
            </a>

            <Link
              href="/products"
              className="w-full inline-flex items-center justify-center gap-2 bg-[oklch(0.95_0_0)] hover:bg-[oklch(0.92_0_0)] text-[oklch(0.145_0_0)] py-3 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              متابعة التسوق
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

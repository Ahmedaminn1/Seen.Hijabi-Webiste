import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  const formatted = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerWhatsapp: o.customerWhatsapp,
    governorate: o.governorate,
    city: o.city,
    address: o.address,
    notes: o.notes,
    subtotal: Number(o.subtotal),
    discountAmount: Number(o.discountAmount),
    shippingFee: Number(o.shippingFee),
    totalAmount: Number(o.totalAmount),
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    source: o.source,
    utmSource: o.utmSource,
    createdAt: o.createdAt,
    items: o.items.map((it) => ({
      id: it.id,
      productName: it.productName,
      colorName: it.colorName,
      sizeName: it.sizeName,
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
      totalPrice: Number(it.totalPrice),
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[var(--border)]">
        <h1 className="text-xl font-serif tracking-tight text-[var(--foreground)]">
          إدارة طلبات المتجر | Orders Management ({orders.length})
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          متابعة الطلبات، تحديث حالات الشحن والتسليم، وتتبع مصادر الزيارات (Instagram, TikTok, WhatsApp)
        </p>
      </div>

      <OrdersTable initialOrders={formatted} />
    </div>
  );
}

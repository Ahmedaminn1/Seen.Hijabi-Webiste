"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils/pricing";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/actions/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DbOrderStatus, DbPaymentStatus } from "@/types";
import { Phone, MapPin, User, FileText, CheckCircle2 } from "lucide-react";

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string | null;
  governorate: string;
  city: string;
  address: string;
  notes: string | null;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  orderStatus: DbOrderStatus;
  paymentStatus: DbPaymentStatus;
  source: string;
  utmSource: string | null;
  createdAt: Date;
  items: Array<{
    id: string;
    productName: string;
    colorName: string;
    sizeName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

const statusOptions: { value: DbOrderStatus; label: string }[] = [
  { value: "PENDING", label: "معلق | Pending" },
  { value: "CONFIRMED", label: "مؤكد | Confirmed" },
  { value: "PROCESSING", label: "قيد التجهيز | Processing" },
  { value: "SHIPPED", label: "تم الشحن | Shipped" },
  { value: "DELIVERED", label: "تم التوصيل | Delivered" },
  { value: "CANCELLED", label: "ملغي | Cancelled" },
];

export function OrdersTable({ initialOrders }: { initialOrders: OrderData[] }) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      o.governorate.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedStatus !== "ALL" && o.orderStatus !== selectedStatus) return false;
    return true;
  });

  const handleStatusChange = async (orderId: string, status: DbOrderStatus) => {
    const res = await updateOrderStatus(orderId, status);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: status } : null));
      }
    }
  };

  const handlePaymentToggle = async (orderId: string, current: DbPaymentStatus) => {
    const next: DbPaymentStatus = current === "PAID" ? "UNPAID" : "PAID";
    const res = await updatePaymentStatus(orderId, next);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: next } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: next } : null));
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <Input
          placeholder="ابحث برقم الطلب، اسم العميل، الهاتف، أو المحافظة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs h-9 sm:max-w-sm"
        />

        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={selectedStatus === "ALL" ? "default" : "outline"}
            onClick={() => setSelectedStatus("ALL")}
            className="text-xs h-8"
          >
            الكل ({orders.length})
          </Button>
          {statusOptions.map((st) => (
            <Button
              key={st.value}
              size="sm"
              variant={selectedStatus === st.value ? "default" : "outline"}
              onClick={() => setSelectedStatus(st.value)}
              className="text-xs h-8"
            >
              {st.label.split("|")[0]} (
              {orders.filter((o) => o.orderStatus === st.value).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">رقم الطلب | Order #</th>
                  <th className="px-4 py-3">العميل | Customer</th>
                  <th className="px-4 py-3">المحافظة | Gov</th>
                  <th className="px-4 py-3">الإجمالي | Total</th>
                  <th className="px-4 py-3">حالة الطلب | Status</th>
                  <th className="px-4 py-3">المصدر | Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                      لا توجد طلبات مطابقة
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[var(--muted)] font-medium"
                            : "hover:bg-[var(--muted)]/50"
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-medium">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--foreground)]">
                            {order.customerName}
                          </p>
                          <p className="text-[10px] text-[var(--muted-foreground)]">
                            {order.customerPhone}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-[var(--muted-foreground)]">
                          {order.governorate}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px]">
                            {order.orderStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-[9px] uppercase font-mono">
                            {order.source}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Details Panel */}
        <div className="bg-[var(--card)] border border-[var(--border)] p-5">
          {selectedOrder ? (
            <div className="space-y-5 text-xs">
              <div className="border-b border-[var(--border)] pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] font-mono">
                    {selectedOrder.orderNumber}
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {new Date(selectedOrder.createdAt).toLocaleString("ar-EG")}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {selectedOrder.source}
                </Badge>
              </div>

              {/* Status Controls */}
              <div className="space-y-3 bg-[var(--muted)]/50 p-3 rounded-sm border border-[var(--border)]">
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted-foreground)] block mb-1">
                    تغيير حالة الطلب | Update Status:
                  </label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder.id, e.target.value as DbOrderStatus)
                    }
                    className="w-full text-xs h-8 px-2 bg-[var(--card)] border border-[var(--border)] rounded-sm"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    الدفع عند الاستلام (COD):
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handlePaymentToggle(selectedOrder.id, selectedOrder.paymentStatus)
                    }
                    className={`text-[10px] px-2 py-0.5 rounded-sm font-medium ${
                      selectedOrder.paymentStatus === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {selectedOrder.paymentStatus === "PAID" ? "تم التحصيل (Paid)" : "غير مدفوع (Unpaid)"}
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <p className="font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>بيانات العميل والتوصيل</span>
                </p>
                <p><span className="text-[var(--muted-foreground)]">الاسم:</span> {selectedOrder.customerName}</p>
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[var(--muted-foreground)]" />
                  <span>{selectedOrder.customerPhone}</span>
                  {selectedOrder.customerWhatsapp && (
                    <span className="text-[var(--muted-foreground)]"> (واتساب: {selectedOrder.customerWhatsapp})</span>
                  )}
                </p>
                <p className="flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-[var(--muted-foreground)] shrink-0 mt-0.5" />
                  <span>
                    {selectedOrder.governorate} - {selectedOrder.city} - {selectedOrder.address}
                  </span>
                </p>
                {selectedOrder.notes && (
                  <p className="flex items-start gap-1 bg-amber-50/50 p-2 border border-amber-200 text-amber-900 rounded-sm">
                    <FileText className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>ملاحظات: {selectedOrder.notes}</span>
                  </p>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <p className="font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-1">
                  المنتجات المطلوبة ({selectedOrder.items.length})
                </p>
                <div className="space-y-2 divide-y divide-[var(--border)]">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="pt-2 flex justify-between items-start">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{item.productName}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">
                          اللون: {item.colorName} &bull; المقاس: {item.sizeName} &bull; الكمية: {item.quantity}
                        </p>
                      </div>
                      <p className="font-mono font-medium text-[var(--foreground)]">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals Summary */}
              <div className="pt-3 border-t border-[var(--border)] space-y-1 text-[11px]">
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>المجموع الفرعي:</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>الخصم:</span>
                    <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>مصاريف الشحن:</span>
                  <span>
                    {selectedOrder.shippingFee === 0 ? "مجاني" : formatPrice(selectedOrder.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-sm pt-2 border-t border-[var(--border)] text-[var(--foreground)]">
                  <span>الإجمالي النهائي:</span>
                  <span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
              اضغط على أي طلب في الجدول لعرض التفاصيل الكاملة وتغيير حالته
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


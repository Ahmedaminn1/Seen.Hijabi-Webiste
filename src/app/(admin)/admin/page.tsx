import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils/pricing";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardOverviewPage() {
  // Fetch key metrics
  let totalSales = 0;
  let totalOrdersCount = 0;
  let pendingOrdersCount = 0;
  let completedOrdersCount = 0;
  let totalProductsCount = 0;
  let lowStockCount = 0;
  let recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    totalAmount: any;
    orderStatus: string;
    source: string;
    createdAt: Date;
  }> = [];

  try {
    const [
      ordersAgg,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalProducts,
      lowStockInventories,
      orders,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { orderStatus: { not: "CANCELLED" } },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: "PENDING" } }),
      prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
      prisma.product.count(),
      prisma.inventory.count({
        where: { quantity: { lte: 2 } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          totalAmount: true,
          orderStatus: true,
          source: true,
          createdAt: true,
        },
      }),
    ]);

    totalSales = Number(ordersAgg._sum.totalAmount ?? 0);
    totalOrdersCount = totalOrders;
    pendingOrdersCount = pendingOrders;
    completedOrdersCount = completedOrders;
    totalProductsCount = totalProducts;
    lowStockCount = lowStockInventories;
    recentOrders = orders as any;
  } catch (error) {
    console.error("Dashboard metrics error:", error);
  }

  const statCards = [
    {
      title: "إجمالي المبيعات | Total Sales",
      value: formatPrice(totalSales),
      icon: DollarSign,
    },
    {
      title: "إجمالي الطلبات | Total Orders",
      value: totalOrdersCount,
      icon: ShoppingBag,
    },
    {
      title: "طلبات معلقة | Pending Orders",
      value: pendingOrdersCount,
      icon: Clock,
      highlight: pendingOrdersCount > 0,
    },
    {
      title: "طلبات مكتملة | Completed Orders",
      value: completedOrdersCount,
      icon: CheckCircle2,
    },
    {
      title: "إجمالي المنتجات | Total Products",
      value: totalProductsCount,
      icon: Package,
    },
    {
      title: "تنبيهات المخزون | Low Stock",
      value: lowStockCount,
      icon: AlertTriangle,
      warn: lowStockCount > 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-xl font-serif tracking-tight text-[var(--foreground)]">
            نظرة عامة على المتجر | Store Overview
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            مؤشرات الأداء الرئيسية والطلبات الحديثة
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-medium px-4 py-2 rounded-sm hover:bg-[var(--primary)]/90 transition-colors duration-150"
        >
          <span>إضافة منتج جديد | New Product</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-[var(--card)] border border-[var(--border)] p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  {stat.title}
                </p>
                <p className="text-xl font-semibold text-[var(--foreground)] mt-1 tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-2 rounded-sm ${
                  stat.warn
                    ? "bg-amber-50 text-amber-600"
                    : stat.highlight
                    ? "bg-blue-50 text-blue-600"
                    : "bg-[var(--muted)] text-[var(--foreground)]"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[var(--card)] border border-[var(--border)]">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
          <div>
            <h2 className="text-sm font-medium text-[var(--foreground)]">
              أحدث الطلبات | Recent Orders
            </h2>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              آخر 5 طلبات تم تسجيلها في المتجر
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-[var(--foreground)] hover:underline inline-flex items-center gap-1"
          >
            <span>عرض كل الطلبات | View all</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">رقم الطلب | Order #</th>
                <th className="px-4 py-3">العميل | Customer</th>
                <th className="px-4 py-3">المصدر | Source</th>
                <th className="px-4 py-3">الإجمالي | Total</th>
                <th className="px-4 py-3">الحالة | Status</th>
                <th className="px-4 py-3">التاريخ | Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                    لا توجد طلبات مسجلة حتى الآن | No orders found
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--foreground)]">{order.customerName}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {order.source}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(Number(order.totalAmount))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

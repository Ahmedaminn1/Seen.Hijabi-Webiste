import { prisma } from "@/lib/prisma";
import { InventoryTable } from "@/components/admin/InventoryTable";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const variants = await prisma.productVariant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: { name: true },
      },
      color: {
        select: { name: true, hexCode: true },
      },
      size: {
        select: { name: true },
      },
      inventory: true,
    },
  });

  const formatted = variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    productName: v.product.name,
    colorName: v.color.name,
    colorHex: v.color.hexCode,
    sizeName: v.size.name,
    currentStock: v.inventory?.quantity ?? 0,
    lowStockThreshold: v.inventory?.lowStockThreshold ?? 2,
  }));

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[var(--border)]">
        <h1 className="text-xl font-serif tracking-tight text-[var(--foreground)]">
          إدارة المخزون الفوري | Real-time Inventory Management
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          تحكم في كميات كل متغير (اللون والمقاس)، وتحديث فوري للمخزون لمنع البيع الزائد (Overselling)
        </p>
      </div>

      <InventoryTable initialVariants={formatted} />
    </div>
  );
}


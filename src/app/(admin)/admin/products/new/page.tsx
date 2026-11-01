import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
        <Link
          href="/admin/products"
          className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-sm hover:bg-[var(--muted)] transition-colors"
          title="العودة للمنتجات"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-serif tracking-tight text-[var(--foreground)]">
            إضافة منتج جديد | Add New Product
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            أدخل تفاصيل المنتج، الألوان، المقاسات، وكميات المخزون المستقلة
          </p>
        </div>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}

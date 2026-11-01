import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils/pricing";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toggleProductStatus, deleteProduct } from "@/lib/actions/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      variants: {
        include: {
          inventory: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-xl font-serif tracking-tight text-[var(--foreground)]">
            المنتجات | Products ({products.length})
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            إدارة كافة المنتجات وتفاصيل الأسعار والألوان والمقاسات والمخزون
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-medium px-4 py-2 rounded-sm hover:bg-[var(--primary)]/90 transition-colors duration-150 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد | Add Product</span>
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">الصورة | Image</th>
                <th className="px-4 py-3">المنتج | Product</th>
                <th className="px-4 py-3">التصنيف | Category</th>
                <th className="px-4 py-3">السعر | Price</th>
                <th className="px-4 py-3">المخزون | Stock</th>
                <th className="px-4 py-3">الوسوم | Badges</th>
                <th className="px-4 py-3">الحالة | Status</th>
                <th className="px-4 py-3 text-right">الإجراءات | Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[var(--muted-foreground)]">
                    <p className="text-sm">لم يتم إضافة أي منتجات بعد</p>
                    <Link
                      href="/admin/products/new"
                      className="inline-block mt-3 text-xs text-[var(--primary)] underline font-medium"
                    >
                      أضف أول منتج الآن
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const totalStock = product.variants.reduce(
                    (sum, v) => sum + (v.inventory?.quantity ?? 0),
                    0
                  );
                  const isSoldOut = totalStock === 0;
                  const primaryImage = product.images[0]?.url || "/placeholder.png";

                  return (
                    <tr key={product.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                      {/* Image */}
                      <td className="px-4 py-3">
                        <div className="w-12 h-16 relative bg-[var(--muted)] rounded-sm overflow-hidden border border-[var(--border)]">
                          <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--foreground)]">{product.name}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)] font-mono">
                          /{product.slug}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-[var(--muted-foreground)]">
                        {product.category?.name || "بدون تصنيف"}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        {product.isDiscountActive && product.discountPercent ? (
                          <div>
                            <span className="font-medium text-[var(--foreground)]">
                              {formatPrice(
                                Number(product.price) * (1 - product.discountPercent / 100)
                              )}
                            </span>
                            <span className="text-[10px] text-[var(--muted-foreground)] line-through block">
                              {formatPrice(Number(product.price))}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium text-[var(--foreground)]">
                            {formatPrice(Number(product.price))}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        {isSoldOut ? (
                          <Badge variant="destructive" className="text-[10px]">
                            نفد المخزون | Sold Out
                          </Badge>
                        ) : (
                          <span className="font-mono text-xs">
                            {totalStock} قطعة ({product.variants.length} خيارات)
                          </span>
                        )}
                      </td>

                      {/* Badges */}
                      <td className="px-4 py-3 space-x-1 space-y-1">
                        {product.isFeatured && (
                          <Badge variant="outline" className="text-[9px]">
                            مميز
                          </Badge>
                        )}
                        {product.isNewArrival && (
                          <Badge variant="secondary" className="text-[9px]">
                            جديد
                          </Badge>
                        )}
                        {product.isBestSeller && (
                          <Badge variant="default" className="text-[9px]">
                            الأكثر مبيعاً
                          </Badge>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-3">
                        <form
                          action={async () => {
                            "use server";
                            await toggleProductStatus(product.id, !product.isActive);
                          }}
                        >
                          <button
                            type="submit"
                            title={product.isActive ? "تعطيل المنتج" : "تفعيل المنتج"}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] rounded-sm font-medium transition-colors ${
                              product.isActive
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                          >
                            {product.isActive ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>نشط</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>معطل</span>
                              </>
                            )}
                          </button>
                        </form>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-sm hover:bg-[var(--muted)] transition-colors"
                            title="تعديل"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <form
                            action={async () => {
                              "use server";
                              await deleteProduct(product.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="p-1.5 text-[var(--muted-foreground)] hover:text-red-600 rounded-sm hover:bg-red-50 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


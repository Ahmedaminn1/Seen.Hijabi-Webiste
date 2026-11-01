import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { Navbar } from "@/components/store/Navbar";
import { ProductCard } from "@/components/store/ProductCard";
import { Footer } from "@/components/store/Footer";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";
import { UtmTracker } from "@/components/store/UtmTracker";
import { SortSelect } from "@/components/store/SortSelect";
import { SlidersHorizontal, X } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    sale?: string;
  }>;
}

export default async function ProductsCatalogPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const searchQuery = params.q?.trim();
  const categorySlug = params.category;
  const sortBy = params.sort || "newest";
  const onlySale = params.sale === "true";

  // 1. Fetch Store and Shipping Settings
  const [storeSettings, shippingSettings, categories] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: "default" } }),
    prisma.shippingSettings.findUnique({ where: { id: "default" } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  // 2. Build Where Filter
  const where: any = {
    isActive: true,
  };

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (onlySale) {
    where.isDiscountActive = true;
  }

  // 3. Build Order By
  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "price_asc") {
    orderBy = { price: "asc" };
  } else if (sortBy === "price_desc") {
    orderBy = { price: "desc" };
  } else if (sortBy === "best_selling") {
    orderBy = { isBestSeller: "desc" };
  } else {
    orderBy = { createdAt: "desc" };
  }

  // 4. Query Products
  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
      colors: true,
      variants: { include: { inventory: true } },
    },
  });

  const shippingData = {
    freeShippingEnabled: shippingSettings?.freeShippingEnabled ?? true,
    freeShippingMinAmount: Number(shippingSettings?.freeShippingMinAmount ?? 1000),
    freeShippingMinQty: shippingSettings?.freeShippingMinQty ?? 2,
    fixedShippingCost: Number(shippingSettings?.fixedShippingCost ?? 65),
  };

  const selectedCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <UtmTracker />

      {/* Top Announcement Bar */}
      <AnnouncementBar
        announcementText={storeSettings?.announcementText}
        announcementEnabled={storeSettings?.announcementEnabled}
        freeShippingEnabled={shippingData.freeShippingEnabled}
        freeShippingMinAmount={shippingData.freeShippingMinAmount}
        freeShippingMinQty={shippingData.freeShippingMinQty}
      />

      {/* Navbar */}
      <Navbar
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        storeName={storeSettings?.storeName || "Seen Hijabi"}
        instagramUrl={storeSettings?.instagramUrl}
        shippingSettings={shippingData}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Page Title & Breadcrumbs */}
        <div className="space-y-2 border-b border-[var(--border)] pb-6">
          <nav className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5 font-mono">
            <Link href="/" className="hover:underline">الرئيسية</Link>
            <span>/</span>
            <span className="text-[var(--foreground)]">المنتجات</span>
            {selectedCategory && (
              <>
                <span>/</span>
                <span className="text-[var(--foreground)]">{selectedCategory.name}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[var(--foreground)]">
                {selectedCategory ? selectedCategory.name : "جميع تشكيلات سين حجابي | All Products"}
              </h1>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                عرض {products.length} {products.length === 1 ? "قطعة متوفرة" : "قطع متوفرة"}
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Sorting Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-sm">
          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <Link
              href="/products"
              className={`px-3 py-1.5 rounded-sm shrink-0 transition-colors ${
                !categorySlug && !onlySale
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              الكل
            </Link>

            <Link
              href="/products?sale=true"
              className={`px-3 py-1.5 rounded-sm shrink-0 transition-colors font-medium ${
                onlySale
                  ? "bg-red-600 text-white"
                  : "border border-red-200 text-red-600 hover:bg-red-50"
              }`}
            >
              العروض والخصومات %
            </Link>

            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className={`px-3 py-1.5 rounded-sm shrink-0 transition-colors ${
                  categorySlug === c.slug
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {c.name.split("|")[0].trim()}
              </Link>
            ))}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <span className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>الترتيب:</span>
            </span>

            <SortSelect defaultValue={sortBy} />
          </div>
        </div>

        {/* Active Filter Badges */}
        {(categorySlug || searchQuery || onlySale) && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] text-[var(--muted-foreground)]">الفلاتر المطبقة:</span>

            {categorySlug && (
              <Link
                href="/products"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--muted)] border border-[var(--border)] text-[11px] rounded-sm hover:bg-[var(--card)]"
              >
                <span>التصنيف: {selectedCategory?.name.split("|")[0]}</span>
                <X className="w-3 h-3" />
              </Link>
            )}

            {searchQuery && (
              <Link
                href="/products"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--muted)] border border-[var(--border)] text-[11px] rounded-sm hover:bg-[var(--card)]"
              >
                <span>بحث: &quot;{searchQuery}&quot;</span>
                <X className="w-3 h-3" />
              </Link>
            )}

            {onlySale && (
              <Link
                href="/products"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-sm hover:bg-red-100"
              >
                <span>العروض فقط</span>
                <X className="w-3 h-3" />
              </Link>
            )}

            <Link
              href="/products"
              className="text-[11px] text-[var(--muted-foreground)] underline hover:text-[var(--foreground)] ml-2"
            >
              مسح كل الفلاتر
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-[var(--border)] rounded-sm space-y-3">
            <p className="text-base font-serif text-[var(--foreground)]">لا توجد منتجات مطابقة لخيارات البحث</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              جربي تغيير خيارات الفلترة أو مسح كلمات البحث لتصفح التشكيلات المتاحة
            </p>
            <Link
              href="/products"
              className="inline-block mt-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs rounded-sm"
            >
              عرض كل المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (acc, v) => acc + (v.inventory?.quantity ?? 0),
                0
              );
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={Number(product.price)}
                  discountPercent={product.discountPercent}
                  isDiscountActive={product.isDiscountActive}
                  isNewArrival={product.isNewArrival}
                  isBestSeller={product.isBestSeller}
                  isFeatured={product.isFeatured}
                  imageUrl={product.images[0]?.url || null}
                  colors={product.colors.map((c) => ({ name: c.name, hexCode: c.hexCode }))}
                  isSoldOut={totalStock === 0}
                />
              );
            })}
          </div>
        )}
      </main>

      <Footer
        storeName={storeSettings?.storeName || "Seen Hijabi"}
        whatsappNumber={storeSettings?.whatsappNumber}
        instagramUrl={storeSettings?.instagramUrl}
        tiktokUrl={storeSettings?.tiktokUrl}
        facebookUrl={storeSettings?.facebookUrl}
      />

      <WhatsAppButton whatsappNumber={storeSettings?.whatsappNumber} />
    </div>
  );
}


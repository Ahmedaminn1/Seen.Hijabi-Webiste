import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { Navbar } from "@/components/store/Navbar";
import { HeroSection } from "@/components/store/HeroSection";
import { ProductCard } from "@/components/store/ProductCard";
import { Footer } from "@/components/store/Footer";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";
import { UtmTracker } from "@/components/store/UtmTracker";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { ArrowLeft, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Fetch Store Settings & Shipping Settings
  const [storeSettings, shippingSettings] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: "default" } }).catch(() => null),
    prisma.shippingSettings.findUnique({ where: { id: "default" } }).catch(() => null),
  ]);

  // 2. Fetch Featured Categories
  const categories = await prisma.category
    .findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    })
    .catch(() => []);

  // 3. Fetch Products for Homepage Sections
  const [newArrivals, bestSellers, specialOffers] = await Promise.all([
    prisma.product
      .findMany({
        where: { isActive: true, isNewArrival: true },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          colors: { take: 4 },
          variants: { include: { inventory: true } },
        },
      })
      .catch(() => []),
    prisma.product
      .findMany({
        where: { isActive: true, isBestSeller: true },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          colors: { take: 4 },
          variants: { include: { inventory: true } },
        },
      })
      .catch(() => []),
    prisma.product
      .findMany({
        where: { isActive: true, isDiscountActive: true },
        take: 4,
        orderBy: { discountPercent: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          colors: { take: 4 },
          variants: { include: { inventory: true } },
        },
      })
      .catch(() => []),
  ]);

  const mapProductToCard = (p: (typeof newArrivals)[number]) => {
    const totalStock = p.variants.reduce((acc, v) => acc + (v.inventory?.quantity ?? 0), 0);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      discountPercent: p.discountPercent,
      isDiscountActive: p.isDiscountActive,
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
      isFeatured: p.isFeatured,
      imageUrl: p.images[0]?.url || null,
      colors: p.colors.map((c) => ({ name: c.name, hexCode: c.hexCode })),
      isSoldOut: totalStock === 0,
    };
  };

  const shippingData = {
    freeShippingEnabled: shippingSettings?.freeShippingEnabled ?? true,
    freeShippingMinAmount: Number(shippingSettings?.freeShippingMinAmount ?? 1000),
    freeShippingMinQty: shippingSettings?.freeShippingMinQty ?? 2,
    fixedShippingCost: Number(shippingSettings?.fixedShippingCost ?? 65),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* UTM Tracking Capture */}
      <UtmTracker />

      {/* 1. Top Announcement Bar (With Free Shipping) */}
      <AnnouncementBar
        announcementText={storeSettings?.announcementText}
        announcementEnabled={storeSettings?.announcementEnabled}
        freeShippingEnabled={shippingData.freeShippingEnabled}
        freeShippingMinAmount={shippingData.freeShippingMinAmount}
        freeShippingMinQty={shippingData.freeShippingMinQty}
      />

      {/* 2. Main Store Navigation */}
      <Navbar
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        storeName={storeSettings?.storeName || "Seen Hijabi"}
        instagramUrl={storeSettings?.instagramUrl}
        shippingSettings={shippingData}
      />

      <main className="flex-1">
        {/* 3. Hero Section */}
        <HeroSection />

        {/* 4. Featured Categories Bar */}
        {categories.length > 0 && (
          <section className="border-b border-[var(--border)] py-8 bg-[var(--card)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)] uppercase">
                  التصنيفات الرئيسية | Categories
                </h2>
                <Link
                  href="/products"
                  className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                >
                  <span>عرض الكل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="p-3 text-center border border-[var(--border)] bg-[var(--background)] rounded-sm hover:border-[var(--brand-gold)] hover:bg-[var(--card)] transition-colors group"
                  >
                    <p className="text-xs font-medium text-[var(--foreground)] group-hover:text-[var(--brand-gold)]">
                      {cat.name.split("|")[0].trim()}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 font-mono">
                      {cat.name.split("|")[1]?.trim() || ""}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5. New Arrivals Section */}
        <section className="py-14 border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                  Fresh In
                </span>
                <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-[var(--foreground)] mt-0.5">
                  وصل حديثاً | New Arrivals
                </h2>
              </div>
              <Link
                href="/products?sort=newest"
                className="text-xs font-medium text-[var(--foreground)] hover:underline flex items-center gap-1"
              >
                <span>مشاهدة الكل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {newArrivals.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-sm text-xs text-[var(--muted-foreground)]">
                سيتم إضافة تشكيلة المنتجات الجديدة قريباً من لوحة الإدارة
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} {...mapProductToCard(product)} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 6. Special Offers Section (Discounts) */}
        {specialOffers.length > 0 && (
          <section className="py-14 bg-[var(--muted)]/50 border-b border-[var(--border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-red-600 font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>Special Deals</span>
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-[var(--foreground)] mt-0.5">
                    عروض وخصومات مميزة | Special Offers
                  </h2>
                </div>
                <Link
                  href="/products?sale=true"
                  className="text-xs font-medium text-red-600 hover:underline flex items-center gap-1"
                >
                  <span>كل العروض</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {specialOffers.map((product) => (
                  <ProductCard key={product.id} {...mapProductToCard(product)} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 7. Best Sellers Section */}
        <section className="py-14 border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[var(--brand-gold)] font-medium">
                  Most Loved
                </span>
                <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-[var(--foreground)] mt-0.5">
                  الأكثر مبيعاً | Best Sellers
                </h2>
              </div>
              <Link
                href="/products?sort=best_selling"
                className="text-xs font-medium text-[var(--foreground)] hover:underline flex items-center gap-1"
              >
                <span>مشاهدة الكل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {bestSellers.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-sm text-xs text-[var(--muted-foreground)]">
                سيتم عرض القطع الأكثر طلباً هنا قريباً
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} {...mapProductToCard(product)} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 8. Instagram Inspiration Banner */}
        {storeSettings?.instagramUrl && (
          <section className="py-14 bg-[var(--card)] text-center border-b border-[var(--border)]">
            <div className="max-w-xl mx-auto px-4 space-y-4">
              <InstagramIcon className="w-6 h-6 mx-auto text-[var(--foreground)]" />
              <h2 className="text-xl font-serif tracking-tight text-[var(--foreground)]">
                تابعي إطلالاتنا على انستجرام
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                شاهدي تنسيقات الحجاب اليومية وريلز أحدث الكولكشنات على حسابنا الرسمي @seen.hijabi
              </p>
              <div className="pt-2">
                <a
                  href={storeSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-9 px-5 border border-[var(--border)] text-xs font-medium rounded-sm hover:border-[var(--brand-gold)] transition-colors"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>متابعة على Instagram &larr;</span>
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 9. Professional Footer */}
      <Footer
        storeName={storeSettings?.storeName || "Seen Hijabi"}
        whatsappNumber={storeSettings?.whatsappNumber}
        instagramUrl={storeSettings?.instagramUrl}
        tiktokUrl={storeSettings?.tiktokUrl}
        facebookUrl={storeSettings?.facebookUrl}
      />

      {/* 10. Floating WhatsApp Button */}
      <WhatsAppButton whatsappNumber={storeSettings?.whatsappNumber} />
    </div>
  );
}

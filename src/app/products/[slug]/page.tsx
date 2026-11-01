import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { Navbar } from "@/components/store/Navbar";
import { ProductDetailsClient } from "@/components/store/ProductDetailsClient";
import { ProductCard } from "@/components/store/ProductCard";
import { Footer } from "@/components/store/Footer";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";
import { UtmTracker } from "@/components/store/UtmTracker";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  if (!product) {
    return {
      title: "المنتج غير موجود | Seen Hijabi",
    };
  }

  return {
    title: `${product.name} | Seen Hijabi`,
    description: product.description || `تسوقي ${product.name} من متجر سين للحجاب والأزياء النسائية الراقية.`,
    openGraph: {
      title: product.name,
      description: product.description || "",
      images: product.images[0] ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // 1. Fetch Product with All Relations
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      colors: true,
      sizes: { orderBy: { displayOrder: "asc" } },
      variants: {
        include: { inventory: true },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // 2. Fetch Store & Shipping Settings
  const [storeSettings, shippingSettings, categories] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: "default" } }),
    prisma.shippingSettings.findUnique({ where: { id: "default" } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } }),
  ]);

  // 3. Fetch Related Products
  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      colors: true,
      variants: { include: { inventory: true } },
    },
  });

  const formattedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    discountPercent: product.discountPercent,
    isDiscountActive: product.isDiscountActive,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    categoryName: product.category?.name || null,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      displayOrder: img.displayOrder,
    })),
    colors: product.colors.map((c) => ({
      id: c.id,
      name: c.name,
      hexCode: c.hexCode,
    })),
    sizes: product.sizes.map((s) => ({
      id: s.id,
      name: s.name,
      displayOrder: s.displayOrder,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      colorId: v.colorId,
      sizeId: v.sizeId,
      sku: v.sku,
      stock: v.inventory?.quantity ?? 0,
    })),
  };

  const shippingData = {
    freeShippingEnabled: shippingSettings?.freeShippingEnabled ?? true,
    freeShippingMinAmount: Number(shippingSettings?.freeShippingMinAmount ?? 1000),
    freeShippingMinQty: shippingSettings?.freeShippingMinQty ?? 2,
    fixedShippingCost: Number(shippingSettings?.fixedShippingCost ?? 65),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <UtmTracker />

      {/* Announcement Bar */}
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-16">
        {/* Product Details Section */}
        <ProductDetailsClient product={formattedProduct} />

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="pt-12 border-t border-[var(--border)] space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                You May Also Like
              </span>
              <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-[var(--foreground)] mt-0.5">
                منتجات قد تعجبكِ | Related Pieces
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => {
                const totalStock = p.variants.reduce((acc, v) => acc + (v.inventory?.quantity ?? 0), 0);
                return (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    price={Number(p.price)}
                    discountPercent={p.discountPercent}
                    isDiscountActive={p.isDiscountActive}
                    isNewArrival={p.isNewArrival}
                    isBestSeller={p.isBestSeller}
                    isFeatured={p.isFeatured}
                    imageUrl={p.images[0]?.url || null}
                    colors={p.colors.map((c) => ({ name: c.name, hexCode: c.hexCode }))}
                    isSoldOut={totalStock === 0}
                  />
                );
              })}
            </div>
          </section>
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


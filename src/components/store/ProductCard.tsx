import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils/pricing";
import { Badge } from "@/components/ui/badge";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPercent?: number | null;
  isDiscountActive?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  imageUrl?: string | null;
  colors?: Array<{ name: string; hexCode: string }>;
  isSoldOut?: boolean;
}

export function ProductCard({
  name,
  slug,
  price,
  discountPercent,
  isDiscountActive,
  isNewArrival,
  isBestSeller,
  imageUrl,
  colors = [],
  isSoldOut = false,
}: ProductCardProps) {
  const hasDiscount = isDiscountActive && discountPercent && discountPercent > 0;
  const discountedPrice = hasDiscount ? price * (1 - discountPercent / 100) : price;
  const imageSrc = imageUrl || "/placeholder.png";

  return (
    <article className="group flex flex-col space-y-2.5">
      {/* Product Image Container */}
      <Link
        href={`/products/${slug}`}
        className="relative aspect-[3/4] w-full bg-[var(--muted)] border border-[var(--border)] overflow-hidden rounded-sm block"
      >
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-opacity duration-200 group-hover:opacity-95"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
          {hasDiscount && (
            <span className="bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-sm">
              -{discountPercent}%
            </span>
          )}
          {isNewArrival && !hasDiscount && (
            <span className="bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-medium px-2 py-0.5 rounded-sm">
              جديد
            </span>
          )}
          {isBestSeller && !isNewArrival && !hasDiscount && (
            <span className="bg-[var(--brand-gold)] text-white text-[10px] font-medium px-2 py-0.5 rounded-sm">
              الأكثر مبيعاً
            </span>
          )}
        </div>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
            <Badge variant="destructive" className="text-xs uppercase tracking-wider py-1 px-3">
              نفد المخزون | Sold Out
            </Badge>
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="space-y-1">
        {/* Colors dots */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5 py-0.5">
            {colors.slice(0, 5).map((c, i) => (
              <span
                key={i}
                title={c.name}
                className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                style={{ backgroundColor: c.hexCode }}
              />
            ))}
            {colors.length > 5 && (
              <span className="text-[10px] text-[var(--muted-foreground)]">
                +{colors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xs font-medium text-[var(--foreground)] truncate group-hover:underline">
          <Link href={`/products/${slug}`}>{name}</Link>
        </h3>

        {/* Pricing */}
        <div className="flex items-center gap-2 text-xs">
          {hasDiscount ? (
            <>
              <span className="font-semibold text-[var(--foreground)] font-mono">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-[11px] text-[var(--muted-foreground)] line-through font-mono">
                {formatPrice(price)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-[var(--foreground)] font-mono">
              {formatPrice(price)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}


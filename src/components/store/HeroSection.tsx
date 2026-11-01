import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative bg-[var(--muted)] border-b border-[var(--border)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Text Column */}
          <div className="space-y-6 max-w-lg">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] font-medium">
                Seen Hijabi &bull; New Season
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-[var(--foreground)] leading-[1.15]">
                أناقة محتشمة، بتفاصيل راقية
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                اكتشفي تشكيلة الفساتين، العبايات، والحجابات المصممة خصيصاً لتمنحك إطلالة راقية ومريحة تناسب يومك ومناسباتك الخاصة.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/products"
                className="inline-flex items-center justify-center h-10 px-6 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-medium rounded-sm hover:bg-[var(--primary)]/90 transition-colors duration-150"
              >
                تسوقي التشكيلة | Shop Collection
              </Link>
              <Link
                href="/products?sort=newest"
                className="inline-flex items-center justify-center h-10 px-6 border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs font-medium rounded-sm hover:bg-[var(--muted)] transition-colors duration-150"
              >
                وصل حديثاً | New Arrivals
              </Link>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full max-w-md mx-auto md:max-w-none rounded-sm overflow-hidden border border-[var(--border)] bg-white flex items-center justify-center p-8">
            <div className="relative w-full h-full">
              <Image
                src="/images/seen-brand.png"
                alt="Seen Hijabi - متجر سين للحجاب والأزياء"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


import Link from "next/link";
import Image from "next/image";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import { Phone, ShieldCheck, Truck, RefreshCw } from "lucide-react";

interface FooterProps {
  storeName?: string;
  whatsappNumber?: string;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  facebookUrl?: string | null;
}

export function Footer({
  storeName = "Seen Hijabi",
  whatsappNumber = "+201000000000",
  instagramUrl,
  tiktokUrl,
  facebookUrl,
}: FooterProps) {
  const activeInstagram = instagramUrl || "https://www.instagram.com/seen.hijabi/";
  const activeTiktok = tiktokUrl || "https://www.tiktok.com/@seen.hijabi";
  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)] mt-20">
      {/* Trust Badges */}
      <div className="border-b border-[var(--border)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center space-y-1.5">
            <Truck className="w-5 h-5 text-[var(--foreground)]" />
            <h4 className="text-xs font-semibold text-[var(--foreground)]">
              شحن لجميع محافظات مصر
            </h4>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              توصيل سريع حتى باب منزلك مع فحص واستلام فوري
            </p>
          </div>

          <div className="flex flex-col items-center space-y-1.5">
            <ShieldCheck className="w-5 h-5 text-[var(--foreground)]" />
            <h4 className="text-xs font-semibold text-[var(--foreground)]">
              الدفع عند الاستلام (COD)
            </h4>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              ادفعي فقط بعد استلام ومعاينة طلبك بكل أمان
            </p>
          </div>

          <div className="flex flex-col items-center space-y-1.5">
            <RefreshCw className="w-5 h-5 text-[var(--foreground)]" />
            <h4 className="text-xs font-semibold text-[var(--foreground)]">
              أقمشة فاخرة وتشطيب راقي
            </h4>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              تصاميم مريحة وأنيقة صُنعت خصيصاً للمرأة المحتشمة
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        {/* Brand info */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white border border-[var(--border)] shrink-0">
              <Image
                src="/images/logo.png"
                alt={storeName}
                fill
                className="object-contain p-0.5"
                sizes="32px"
              />
            </div>
            <h3 className="text-lg font-serif tracking-tight text-[var(--foreground)]">
              {storeName}
            </h3>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            علامة أزياء مصرية متخصصة في تقديم أرقى الفساتين، العبايات، والحجابات العصرية بطابع أنثوي محتشم وراقي.
          </p>
          {(activeInstagram || activeTiktok) && (
            <div className="flex items-center gap-2 pt-2">
              {activeInstagram && (
                <a
                  href={activeInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-sm transition-colors"
                  aria-label="Instagram"
                  title="إنستجرام"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {activeTiktok && (
                <a
                  href={activeTiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-sm transition-colors"
                  aria-label="TikTok"
                  title="تيك توك"
                >
                  <TikTokIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-semibold text-[var(--foreground)] uppercase text-[11px] tracking-wider">
            روابط سريعة | Navigation
          </h4>
          <ul className="space-y-2 text-[11px] text-[var(--muted-foreground)]">
            <li>
              <Link href="/products" className="hover:text-[var(--foreground)] transition-colors">
                جميع المنتجات | All Products
              </Link>
            </li>
            <li>
              <Link href="/products?sort=newest" className="hover:text-[var(--foreground)] transition-colors">
                وصل حديثاً | New Arrivals
              </Link>
            </li>
            <li>
              <Link href="/products?sort=best_selling" className="hover:text-[var(--foreground)] transition-colors">
                الأكثر مبيعاً | Best Sellers
              </Link>
            </li>
            <li>
              <Link href="/products?sale=true" className="hover:text-[var(--foreground)] transition-colors">
                العروض والخصومات | Special Offers
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h4 className="font-semibold text-[var(--foreground)] uppercase text-[11px] tracking-wider">
            خدمة العملاء | Customer Care
          </h4>
          <ul className="space-y-2 text-[11px] text-[var(--muted-foreground)]">
            <li>
              <Link href="/cart" className="hover:text-[var(--foreground)] transition-colors">
                حقيبة التسوق | Cart
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-[var(--foreground)] transition-colors">
                إتمام الطلب | Checkout
              </Link>
            </li>
            <li>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("مرحباً، أود الاستفسار عن منتجات سين حجابي")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3 h-3" />
                <span>تواصل عبر واتساب | WhatsApp</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Admin Gateway */}
        <div className="space-y-3">
          <h4 className="font-semibold text-[var(--foreground)] uppercase text-[11px] tracking-wider">
            بوابة الإدارة | Administration
          </h4>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            إدارة متجر سين حجابي، تحديث المنتجات والأسعار ومتابعة طلبات العملاء.
          </p>
          <Link
            href="/admin"
            className="inline-block text-[11px] text-[var(--foreground)] underline font-medium hover:text-[var(--brand-gold)]"
          >
            الدخول إلى لوحة التحكم &larr;
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[var(--border)] py-4 text-center text-[10px] text-[var(--muted-foreground)]">
        &copy; {new Date().getFullYear()} {storeName}. جميع الحقوق محفوظة. صُمم وصُنع بحرفية عالية.
      </div>
    </footer>
  );
}

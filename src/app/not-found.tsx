import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_80)] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <span
        className="font-serif text-8xl font-bold text-[oklch(0.85_0_0)] select-none mb-2"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        404
      </span>
      <h1
        className="font-serif text-2xl sm:text-3xl text-[oklch(0.145_0_0)] mb-3"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        الصفحة غير موجودة
      </h1>
      <p className="text-sm text-[oklch(0.45_0_0)] max-w-sm mb-8 leading-relaxed">
        عذراً، الصفحة التي تبحث عنها قد تكون تم نقلها أو حذفها، أو أن الرابط غير صحيح.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[oklch(0.145_0_0)] text-white hover:bg-[oklch(0.25_0_0)] transition-colors px-6 py-2.5 rounded-lg text-sm font-medium"
        >
          الصفحة الرئيسية
        </Link>
        <Link
          href="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-[oklch(0.85_0_0)] text-[oklch(0.145_0_0)] hover:bg-[oklch(0.95_0_0)] transition-colors px-6 py-2.5 rounded-lg text-sm font-medium"
        >
          تصفح المنتجات
          <ArrowRight className="w-4 h-4 rotate-180" />
        </Link>
      </div>
    </div>
  );
}


"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface SortSelectProps {
  defaultValue?: string;
}

export function SortSelect({ defaultValue = "newest" }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products");
  };

  return (
    <select
      value={searchParams.get("sort") || defaultValue}
      onChange={(e) => handleSortChange(e.target.value)}
      className="h-8 text-xs px-2.5 bg-[var(--background)] border border-[var(--border)] rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand-gold)] text-[var(--foreground)]"
      aria-label="ترتيب المنتجات"
    >
      <option value="newest">الأحدث وصولاً | Newest</option>
      <option value="best_selling">الأكثر مبيعاً | Best Selling</option>
      <option value="price_asc">السعر: من الأقل للأعلى | Price Low to High</option>
      <option value="price_desc">السعر: من الأعلى للأقل | Price High to Low</option>
    </select>
  );
}


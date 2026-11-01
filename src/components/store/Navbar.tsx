"use client";

import { useState } from "react";
import Link from "next/link";
import { CartDrawer } from "@/components/store/CartDrawer";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { Search, Menu, X } from "lucide-react";

interface CategoryLink {
  name: string;
  slug: string;
}

interface NavbarProps {
  categories?: CategoryLink[];
  storeName?: string;
  instagramUrl?: string | null;
  shippingSettings?: {
    freeShippingEnabled: boolean;
    freeShippingMinAmount: number | null;
    freeShippingMinQty: number | null;
    fixedShippingCost: number;
  };
}

export function Navbar({
  categories = [],
  storeName = "Seen Hijabi",
  instagramUrl = "https://www.instagram.com/seen.hijabi/",
  shippingSettings,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--card)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[var(--foreground)] hover:opacity-80"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1.5 text-[var(--foreground)] hover:opacity-80"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[var(--foreground)]">
          <Link
            href="/"
            className="hover:text-[var(--brand-gold)] transition-colors duration-150"
          >
            الرئيسية | Home
          </Link>
          <Link
            href="/products"
            className="hover:text-[var(--brand-gold)] transition-colors duration-150"
          >
            كل المنتجات | All
          </Link>
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="hover:text-[var(--brand-gold)] transition-colors duration-150"
            >
              {cat.name.split("|")[0].trim()}
            </Link>
          ))}
        </nav>

        {/* Brand Logo (Centered on mobile, styled with Playfair Display) */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-xl sm:text-2xl font-serif tracking-tight text-[var(--foreground)] block">
              {storeName}
            </span>
            <span className="text-[9px] tracking-widest text-[var(--muted-foreground)] uppercase block font-sans">
              Fashion &bull; Hijab
            </span>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Search Toggle */}
          <div className="hidden md:block relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  autoFocus
                  placeholder="ابحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-xs px-3 border border-[var(--border)] rounded-sm bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-gold)] w-48"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-1.5 text-[var(--foreground)] hover:text-[var(--brand-gold)] transition-colors"
                aria-label="Search products"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Instagram link */}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex p-1.5 text-[var(--foreground)] hover:text-[var(--brand-gold)] transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
          )}

          {/* Cart Drawer */}
          <CartDrawer shippingSettings={shippingSettings} />
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {searchOpen && (
        <div className="md:hidden p-3 border-t border-[var(--border)] bg-[var(--card)]">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              autoFocus
              placeholder="ابحث عن فستان، عباية، طرحة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-9 text-xs px-3 border border-[var(--border)] rounded-sm bg-[var(--background)]"
            />
            <button
              type="submit"
              className="px-3 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs rounded-sm"
            >
              بحث
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
          <nav className="flex flex-col space-y-3 text-xs font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[var(--foreground)] hover:text-[var(--brand-gold)]"
            >
              الرئيسية | Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[var(--foreground)] hover:text-[var(--brand-gold)]"
            >
              كل المنتجات | All Products
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-[var(--foreground)] hover:text-[var(--brand-gold)]"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center text-xs">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              لوحة الإدارة | Admin Portal
            </Link>
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

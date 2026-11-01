"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Settings,
  ExternalLink,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { logoutAdmin } from "@/lib/actions/auth";

const navItems = [
  { href: "/admin", label: "نظرة عامة | Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات | Products", icon: Package },
  { href: "/admin/products/new", label: "إضافة منتج | Add Product", icon: PlusCircle },
  { href: "/admin/inventory", label: "المخزون | Inventory", icon: Boxes },
  { href: "/admin/orders", label: "الطلبات | Orders", icon: ShoppingBag },
  { href: "/admin/settings", label: "الإعدادات | Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[var(--card)] border-r border-[var(--border)] min-h-screen flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand header */}
        <div className="px-3 py-2 border-b border-[var(--border)] pb-4">
          <Link href="/admin" className="block">
            <h2 className="text-lg font-serif tracking-tight text-[var(--foreground)]">
              Seen Hijabi
            </h2>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              لوحة الإدارة &bull; Admin Portal
            </p>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-sm transition-colors duration-150 ${
                  isActive
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer actions */}
      <div className="pt-4 border-t border-[var(--border)] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-sm transition-colors duration-150"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>زيارة المتجر | View Store</span>
          </span>
        </Link>

        <form action={logoutAdmin}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50/50 rounded-sm transition-colors duration-150"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج | Log Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}


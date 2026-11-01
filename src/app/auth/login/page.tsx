"use client";

import { useActionState, use } from "react";
import Link from "next/link";
import { loginAdmin, type LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft } from "lucide-react";

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = use(searchParams);
  const redirectTo = resolvedParams.redirectTo || "/admin";

  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAdmin,
    {}
  );

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>العودة إلى المتجر | Back to store</span>
          </Link>
          <h1 className="text-2xl font-serif tracking-tight text-[var(--foreground)] mb-2">
            Seen Hijabi
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            لوحة التحكم الإدارية | Admin portal
          </p>
        </div>

        {/* Form container */}
        <div className="bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8">
          {state?.error && (
            <div
              role="alert"
              className="mb-6 p-3 bg-red-50/50 border border-red-200 text-red-900 text-xs rounded-sm"
            >
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-[var(--foreground)]">
                البريد الإلكتروني | Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@seenhijabi.com"
                className="h-10 text-sm bg-transparent border-[var(--border)] focus-visible:ring-1 focus-visible:ring-[var(--brand-gold)]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-[var(--foreground)]"
                >
                  كلمة المرور | Password
                </Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="h-10 text-sm bg-transparent border-[var(--border)] focus-visible:ring-1 focus-visible:ring-[var(--brand-gold)]"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-10 mt-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 text-sm font-medium rounded-sm transition-colors duration-150"
            >
              <Lock className="w-3.5 h-3.5 mr-2" />
              {isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول | Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[var(--muted-foreground)] mt-6">
          Seen Hijabi Ecommerce &bull; Secure Admin Gateway
        </p>
      </div>
    </main>
  );
}


import { type NextRequest, NextResponse } from "next/server";

/**
 * Store Middleware:
 * Only intercepts /admin routes to redirect to the Admin Dashboard if configured.
 * All store pages (/, /products, /checkout, etc.) run directly with zero overhead.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL;

  if (dashboardUrl && (pathname.startsWith("/admin") || pathname === "/auth/login")) {
    try {
      return NextResponse.redirect(new URL(pathname, dashboardUrl));
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/login"],
};

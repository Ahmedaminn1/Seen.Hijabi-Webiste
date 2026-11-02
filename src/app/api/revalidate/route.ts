import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { emitStoreSync } from "@/lib/sync/bus";

export const dynamic = "force-dynamic";

/**
 * POST /api/revalidate
 * Called by Dashboard Server Actions whenever product/settings/orders change.
 * 1. Revalidates Next.js cache on the server.
 * 2. Emits an instant live event to all active website browser sessions via SSE.
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!process.env.REVALIDATION_SECRET || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { path, paths, layout, action, productId } = body as {
      path?: string;
      paths?: string[];
      layout?: boolean;
      action?: string;
      productId?: string;
    };

    const allPaths: string[] = [];
    if (path) allPaths.push(path);
    if (Array.isArray(paths)) allPaths.push(...paths);

    for (const p of allPaths) {
      revalidatePath(p, layout ? "layout" : "page");
    }

    // Always revalidate the root page and layout as baseline
    if (layout) {
      revalidatePath("/", "layout");
    }

    // Instant SSE broadcast to open browser tabs
    const syncResult = emitStoreSync({
      action: action || "store_updated",
      paths: allPaths,
      productId,
    });

    return NextResponse.json({
      revalidated: true,
      paths: allPaths,
      version: syncResult.version,
      timestamp: syncResult.timestamp,
    });
  } catch (error) {
    console.error("[revalidate] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

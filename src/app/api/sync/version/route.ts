import { NextResponse } from "next/server";
import { getStoreSyncVersion } from "@/lib/sync/bus";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      version: getStoreSyncVersion(),
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}


import { NextRequest } from "next/server";
import { subscribeStoreSync, getStoreSyncVersion } from "@/lib/sync/bus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let heartbeatTimer: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connected state
      try {
        const initialData = JSON.stringify({
          type: "connected",
          version: getStoreSyncVersion(),
          timestamp: Date.now(),
        });
        controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));
      } catch {
        // ignore
      }

      // Subscribe to cross-dashboard broadcast events
      unsubscribe = subscribeStoreSync((event) => {
        try {
          const data = JSON.stringify({ type: "store_update", ...event });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // Stream might be closed
        }
      });

      // Send keep-alive heartbeat every 15 seconds
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          // Stream closed
          if (heartbeatTimer) clearInterval(heartbeatTimer);
        }
      }, 15000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (heartbeatTimer) clearInterval(heartbeatTimer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}


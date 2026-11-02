"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * StoreSyncListener
 * Mounts in RootLayout. Listens for live updates from the Dashboard across 3 channels:
 * 1. SSE (Server-Sent Events) via /api/sync/events — 0ms latency instant refresh
 * 2. Supabase Realtime Broadcast channel "seen-store-sync" — Cross-instance / distributed
 * 3. Polling fallback on window focus / visibility / 4s interval — Guaranteed reliability
 *
 * When any update happens in the Dashboard (product deleted, stock changed, settings updated),
 * it calls `router.refresh()` seamlessly without requiring the user to reload the page.
 */
export function StoreSyncListener() {
  const router = useRouter();
  const pathname = usePathname();
  const lastVersionRef = useRef<number>(0);
  const isRefreshingRef = useRef(false);

  // Safe refresh trigger with throttling
  const triggerRefresh = useCallback(() => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    router.refresh();
    setTimeout(() => {
      isRefreshingRef.current = false;
    }, 800);
  }, [router]);

  // Check version against API
  const checkVersion = useCallback(async () => {
    try {
      const res = await fetch("/api/sync/version", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (lastVersionRef.current === 0) {
          lastVersionRef.current = data.version;
        } else if (data.version > lastVersionRef.current) {
          lastVersionRef.current = data.version;
          triggerRefresh();
        }
      }
    } catch {
      // ignore network errors
    }
  }, [triggerRefresh]);

  // Channel 1: SSE (Server-Sent Events)
  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    function connectSSE() {
      try {
        es = new EventSource("/api/sync/events");

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "connected") {
              if (lastVersionRef.current === 0) {
                lastVersionRef.current = data.version || 1;
              } else if (data.version && data.version > lastVersionRef.current) {
                lastVersionRef.current = data.version;
                triggerRefresh();
              }
            } else if (data.type === "store_update") {
              if (data.version) {
                lastVersionRef.current = data.version;
              }
              triggerRefresh();
            }
          } catch {
            // Ignore non-json (e.g. heartbeat)
          }
        };

        es.onerror = () => {
          if (es) {
            es.close();
            es = null;
          }
          // Reconnect after 3s
          retryTimeout = setTimeout(connectSSE, 3000);
        };
      } catch {
        retryTimeout = setTimeout(connectSSE, 3000);
      }
    }

    connectSSE();

    return () => {
      if (es) es.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [triggerRefresh]);

  // Channel 2: Supabase Realtime Broadcast (distributed)
  useEffect(() => {
    try {
      const supabase = createClient();
      const channel = supabase.channel("seen-store-sync", {
        config: { broadcast: { self: false } },
      });

      channel
        .on("broadcast", { event: "store_update" }, () => {
          triggerRefresh();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Supabase realtime optional
    }
  }, [triggerRefresh]);

  // Channel 3: Window Focus / Visibility & Polling fallback
  useEffect(() => {
    // Check when user switches to the website tab
    const handleFocus = () => checkVersion();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkVersion();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    // Periodic safety check every 4 seconds
    const interval = setInterval(checkVersion, 4000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [checkVersion]);

  return null;
}


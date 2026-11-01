"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client.
 *
 * Uses the PUBLIC anon key — safe to expose in the browser.
 * Do NOT import this in Server Components or Route Handlers.
 * For server-side access, use `src/lib/supabase/server.ts`.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}


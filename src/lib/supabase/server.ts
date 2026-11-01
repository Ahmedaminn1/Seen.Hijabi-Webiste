import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client.
 *
 * Must be called inside a Server Component, Server Action, or Route Handler.
 * Reads/writes cookies via Next.js `cookies()` API to manage the user session.
 *
 * Uses the PUBLIC anon key + cookie-based session so it respects Row Level
 * Security policies with the actual user's JWT.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored: setAll called from a Server Component (read-only context).
            // Middleware handles session refresh for Server Components.
          }
        },
      },
    }
  );
}

/**
 * Server-side Supabase ADMIN client.
 *
 * Uses the SERVICE ROLE key — bypasses Row Level Security.
 * ⚠️ NEVER import this in client components or expose via API without auth check.
 * Use ONLY for trusted server-side operations (e.g., image upload, order processing).
 */
export function createAdminClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}


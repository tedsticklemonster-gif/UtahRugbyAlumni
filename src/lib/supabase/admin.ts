import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY: This client uses the service role key and bypasses RLS.
// NEVER import this file from client components or expose it to the browser.

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        // Always bypass Next.js's Data Cache so queries like "upcoming events"
        // always reflect the current time, not a cached snapshot from earlier.
        fetch: (url, init) =>
          fetch(url, { ...init, cache: "no-store" }),
      },
    }
  );
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // On Vercel, request.url uses the internal host — x-forwarded-host has the
  // real public domain. Always prefer it in production.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const base =
    process.env.NODE_ENV === "production" && forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Best-effort: mark alumni record verified
      if (data.user?.email) {
        try {
          const admin = createAdminClient();
          await admin
            .from("alumni")
            .update({ verified: true })
            .eq("email", data.user.email);
        } catch {
          // non-fatal
        }
      }
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  // Code missing or exchange failed
  return NextResponse.redirect(`${base}/`);
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
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
    // Build the redirect response first so setAll() can write cookies
    // directly onto it. cookieStore.set() does NOT merge into a manually
    // constructed NextResponse — that was the sign-in loop.
    const response = NextResponse.redirect(`${base}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
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
      return response;
    }
  }

  // Code missing or exchange failed
  return NextResponse.redirect(`${base}/`);
}

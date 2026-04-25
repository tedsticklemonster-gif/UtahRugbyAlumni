import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    // Create the redirect response FIRST so we can set cookies directly on it.
    // Using cookieStore.set() + NextResponse.redirect() loses cookies because
    // they live on different response objects.
    const redirectTo = `${origin}${next}`;
    const response = NextResponse.redirect(redirectTo);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Write to both the request (so subsequent server reads see them)
            // and directly onto the redirect response (so the browser gets them).
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
      // Best-effort: mark alumni record verified (don't block on failure)
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

  // Code missing or exchange failed — go home
  return NextResponse.redirect(`${origin}/`);
}

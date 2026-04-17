import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profile";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Mark the alumni record as verified now that they've confirmed their email
      const admin = createAdminClient();
      await admin
        .from("alumni")
        .update({ verified: true })
        .eq("email", data.user.email!);

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — redirect to home with error
  return NextResponse.redirect(`${origin}/?error=auth`);
}

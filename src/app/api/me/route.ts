import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: alumni } = await admin
    .from("alumni")
    .select("id, first_name, last_name, photo_url")
    .eq("email", user.email)
    .maybeSingle();

  if (!alumni) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let photo_signed_url: string | null = null;
  if (alumni.photo_url) {
    const { data } = await admin.storage
      .from("alumni-photos")
      .createSignedUrl(alumni.photo_url, 86400);
    photo_signed_url = data?.signedUrl ?? null;
  }

  const { count: unread_count } = await admin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", alumni.id)
    .is("read_at", null);

  return NextResponse.json({
    id: alumni.id,
    first_name: alumni.first_name,
    last_name: alumni.last_name,
    photo_signed_url,
    unread_count: unread_count ?? 0,
  });
}

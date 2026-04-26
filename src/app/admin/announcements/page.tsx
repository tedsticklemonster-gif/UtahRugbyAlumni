export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";

export const metadata = { title: "Announcements — Admin" };

export default async function AnnouncementsPage() {
  const admin = createAdminClient();
  const { data: announcements } = await admin
    .from("announcements")
    .select("id, title, body, pinned, expires_at, created_at, updated_at")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <AdminPage
      title="Announcements"
      description="Broadcast messages shown to all members on the feed."
    >
      <AnnouncementsManager announcements={announcements ?? []} />
    </AdminPage>
  );
}

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NotificationSettings } from "@/components/notification-settings";

export const metadata = { title: "Notification Settings" };

export default async function NotificationSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/auth/login?next=/notifications/settings");

  const admin = createAdminClient();
  const { data: alumni } = await admin
    .from("alumni")
    .select("id, email_preferences")
    .eq("email", user.email)
    .single();

  if (!alumni) redirect("/join");

  const prefs = (alumni.email_preferences ?? {}) as Record<string, boolean>;

  return (
    <div className="min-h-screen bg-surface-0">
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Notification Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Control what you get notified about</p>
      </div>
      <div className="px-5 py-6 md:px-10 max-w-xl">
        <NotificationSettings alumniId={alumni.id} initialPrefs={prefs} />
      </div>
    </div>
  );
}

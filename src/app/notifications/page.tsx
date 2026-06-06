export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listNotificationsAction } from "@/actions/notifications";
import { NotificationsList } from "./notifications-list";

export const metadata = { title: "Notifications — Utah Rugby Alumni" };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const notifications = await listNotificationsAction();

  return <NotificationsList initialNotifications={notifications} />;
}

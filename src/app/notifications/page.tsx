export const dynamic = "force-dynamic";

import Link from "next/link";
import { Bell, CheckCheck, Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listNotificationsAction, markAllReadAction } from "@/actions/notifications";

const KIND_COPY: Record<string, string> = {
  post_reaction:  "reacted to your post",
  post_comment:   "commented on your post",
  post_mention:   "mentioned you in a post",
  mention:        "mentioned you in a post",
  message:        "sent you a message",
  event_invite:   "invited you to an event",
  new_join:       "joined the network",
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function entityHref(n: { entity_type: string | null; entity_id: string | null; actor_id?: string | null }) {
  if (n.entity_type === "post" && n.entity_id) return `/feed/${n.entity_id}`;
  if (n.entity_type === "event" && n.entity_id) return `/events/${n.entity_id}`;
  if (n.entity_type === "message" && n.actor_id) return `/messages/${n.actor_id}`;
  if (n.entity_type === "message") return `/messages`;
  return null;
}

export const metadata = { title: "Notifications — Utah Rugby Alumni" };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await markAllReadAction();
  const notifications = await listNotificationsAction();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
              <Bell className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Notifications</h1>
              <p className="text-sm text-zinc-500">Activity from the network</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/notifications/settings"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
            >
              <Settings className="size-3.5" />
              Settings
            </Link>
            {notifications.some((n) => !n.read_at) && (
              <form action={markAllReadAction}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  <CheckCheck className="size-3.5" />
                  Mark all read
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 md:px-10 max-w-2xl space-y-1">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-14 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-zinc-800">
              <Bell className="size-6 text-zinc-500" />
            </div>
            <p className="text-sm font-bold text-white">All quiet</p>
            <p className="mt-1 text-xs text-zinc-500">
              Likes, comments, and messages will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const href = entityHref(n);
            const copy = KIND_COPY[n.kind] ?? n.kind;
            const actorName = n.actor_first_name
              ? `${n.actor_first_name} ${n.actor_last_name ?? ""}`.trim()
              : "Someone";

            const inner = (
              <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 hover:border-zinc-700 transition-colors">
                {n.actor_photo_signed_url ? (
                  <img src={n.actor_photo_signed_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-zinc-300">
                    {n.actor_first_name?.[0] ?? "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-200">
                    <span className="font-semibold text-white">{actorName}</span>{" "}
                    {copy}
                  </p>
                  <p className="text-xs text-zinc-500">{relativeTime(n.created_at)}</p>
                </div>
                {!n.read_at && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#CC0000]" />
                )}
              </div>
            );

            return href ? (
              <Link key={n.id} href={href}>{inner}</Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })
        )}
      </div>
    </div>
  );
}

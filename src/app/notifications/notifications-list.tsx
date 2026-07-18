"use client";

import { relativeTime } from "@/lib/time";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Settings } from "lucide-react";
import { markAllReadAction, markReadAction } from "@/actions/notifications";
import type { AppNotification } from "@/actions/notifications";

const KIND_COPY: Record<string, string> = {
  post_reaction:  "reacted to your post",
  post_comment:   "commented on your post",
  post_mention:   "mentioned you in a post",
  mention:        "mentioned you in a post",
  comment_reply:  "also commented on a post",
  message:        "sent you a message",
  event_invite:   "invited you to an event",
  new_join:       "joined the network",
  event_reminder: "Event starting tomorrow",
  new_event:      "created a new event",
  rsvp:           "RSVP'd to your event",
  announcement:   "posted an announcement",
};

const KIND_ICON: Record<string, string> = {
  post_reaction:  "❤️",
  post_comment:   "💬",
  post_mention:   "📣",
  mention:        "📣",
  comment_reply:  "💬",
  message:        "✉️",
  event_invite:   "📩",
  new_join:       "👋",
  event_reminder: "⏰",
  new_event:      "📅",
  rsvp:           "✅",
  announcement:   "📢",
};

function entityHref(n: AppNotification): string | null {
  if (n.entity_type === "post" && n.entity_id) return `/feed/${n.entity_id}`;
  if (n.entity_type === "event" && n.entity_id) return `/events/${n.entity_id}`;
  if (n.entity_type === "message" && n.actor_id) return `/messages/${n.actor_id}`;
  if (n.entity_type === "message") return `/messages`;
  if (n.kind === "new_join" && n.actor_id) return `/directory/${n.actor_id}`;
  if (n.kind === "announcement") return `/`;
  return null;
}

export function NotificationsList({
  initialNotifications,
}: {
  initialNotifications: AppNotification[];
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const hasUnread = notifications.some((n) => !n.read_at);

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllReadAction();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      );
    });
  }

  function handleClick(n: AppNotification) {
    if (!n.read_at) {
      markReadAction(n.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item
        )
      );
    }
    const href = entityHref(n);
    if (href) router.push(href);
  }

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
              <h1 className="text-2xl font-bold tracking-tight text-white">Notifications</h1>
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
            {hasUnread && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-50"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
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
            const copy = KIND_COPY[n.kind] ?? n.kind;
            const icon = KIND_ICON[n.kind] ?? "🔔";
            const actorName = n.actor_first_name
              ? `${n.actor_first_name} ${n.actor_last_name ?? ""}`.trim()
              : null;
            const isUnread = !n.read_at;

            return (
              <button
                key={n.id}
                type="button"
                onClick={() => handleClick(n)}
                className={`w-full text-left flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors cursor-pointer ${
                  isUnread
                    ? "border-zinc-700 bg-zinc-900/80 hover:border-zinc-600"
                    : "border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700"
                }`}
              >
                {/* Avatar or icon */}
                {n.actor_photo_signed_url ? (
                  <img
                    src={n.actor_photo_signed_url}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover mt-0.5"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm mt-0.5">
                    {actorName ? (
                      <span className="font-bold text-zinc-300">{n.actor_first_name?.[0] ?? "?"}</span>
                    ) : (
                      <span>{icon}</span>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-300 leading-snug">
                    {actorName ? (
                      <span className={`font-semibold ${isUnread ? "text-white" : "text-zinc-200"}`}>
                        {actorName}
                      </span>
                    ) : (
                      <span className="text-base">{icon}</span>
                    )}{" "}
                    {copy}
                  </p>
                  {n.body_preview && (
                    <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {n.body_preview}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-600">{relativeTime(n.created_at)}</p>
                </div>

                {/* Unread indicator */}
                {isUnread && (
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-utah-red" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

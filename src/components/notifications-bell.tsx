"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUnreadCountAction } from "@/actions/notifications";
import { useMe } from "@/components/me-provider";

export function NotificationsBell() {
  const { me } = useMe();
  const [count, setCount] = useState(0);

  const meId = me?.id;

  // Initial load
  useEffect(() => {
    if (!meId) return;
    getUnreadCountAction().then(setCount);
  }, [meId]);

  // Realtime subscription — 1 channel per logged-in user (free-tier safe).
  // Unique topic suffix: supabase-js caches channels by topic, so a remount
  // would otherwise return the already-subscribed channel and throw on .on().
  useEffect(() => {
    if (!meId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notif:${meId}:${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${meId}` },
        () => { setCount((c) => c + 1); navigator.vibrate?.(10); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [meId]);

  if (!me) return null;

  return (
    <Link
      href="/notifications"
      aria-label="Notifications"
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:text-white transition-colors"
      onClick={() => setCount(0)}
    >
      <Bell className="size-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#CC0000] text-[9px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

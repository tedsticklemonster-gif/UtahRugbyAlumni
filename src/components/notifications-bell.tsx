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

  // Initial load
  useEffect(() => {
    if (!me) return;
    getUnreadCountAction().then(setCount);
  }, [me]);

  // Realtime subscription — 1 channel per logged-in user (free-tier safe)
  useEffect(() => {
    if (!me) return;

    const supabase = createClient();
    let cleanup: (() => void) | undefined;

    // Get alumni ID via auth session, then subscribe
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.email) return;
      supabase
        .from("alumni")
        .select("id")
        .eq("email", user.email)
        .single()
        .then(({ data }) => {
          if (!data?.id) return;

          const channel = supabase
            .channel(`notif:${data.id}`)
            .on(
              "postgres_changes",
              { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${data.id}` },
              () => { setCount((c) => c + 1); navigator.vibrate?.(10); }
            )
            .subscribe();

          cleanup = () => { supabase.removeChannel(channel); };
        });
    });

    return () => { cleanup?.(); };
  }, [me]);

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

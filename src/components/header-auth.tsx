"use client";

import Link from "next/link";
import { LogIn, MessageCircle } from "lucide-react";
import { useMe } from "@/components/me-provider";
import { InstallAppButton } from "@/components/install-app-button";
import { cn } from "@/lib/utils";

export function HeaderAuth() {
  const { me, loading } = useMe();

  if (loading) {
    return <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800" />;
  }

  if (me) {
    const unread = me.unread_count ?? 0;
    return (
      <div className="flex items-center gap-2">
        <InstallAppButton />

        {/* DM indicator */}
        <Link
          href="/messages"
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label={unread ? `${unread} unread messages` : "Messages"}
        >
          <MessageCircle className="size-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#CC0000] px-1 text-[9px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        {/* Profile photo avatar */}
        <Link
          href="/profile"
          aria-label="My profile"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-colors",
            "border-zinc-700 hover:border-[#CC0000]"
          )}
        >
          {me.photo_signed_url ? (
            <img
              src={me.photo_signed_url}
              alt={`${me.first_name} ${me.last_name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-zinc-300">
              {me.first_name[0]}{me.last_name[0]}
            </span>
          )}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="flex items-center gap-1 px-2 py-1.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white"
      >
        <LogIn className="size-4 shrink-0" />
        <span>Sign In</span>
      </Link>
      <Link
        href="/join"
        className="rounded-lg bg-[#CC0000] px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#AA0000]"
      >
        Join
      </Link>
    </div>
  );
}

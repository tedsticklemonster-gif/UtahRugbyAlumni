"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogIn, User, LogOut } from "lucide-react";
import { useMe } from "@/components/me-provider";
import { InstallAppButton } from "@/components/install-app-button";
import { NotificationsBell } from "@/components/notifications-bell";
import { signOutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

function AvatarMenu() {
  const { me } = useMe();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!me) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-colors",
          open ? "border-[#CC0000]" : "border-zinc-700 hover:border-[#CC0000]"
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
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/50 overflow-hidden z-50">
          {/* User info header */}
          <div className="border-b border-zinc-800 px-3 py-2.5">
            <p className="text-xs font-bold text-white truncate">
              {me.first_name} {me.last_name}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <User className="size-4 text-zinc-500" />
              My Profile
            </Link>

            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <LogOut className="size-4 text-zinc-500" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function HeaderAuth() {
  const { me, loading } = useMe();

  if (loading) {
    return <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800" />;
  }

  if (me) {
    return (
      <div className="flex items-center gap-2">
        <InstallAppButton />
        <NotificationsBell />
        <AvatarMenu />
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

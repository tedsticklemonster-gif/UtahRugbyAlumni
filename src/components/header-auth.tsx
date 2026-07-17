"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogIn, User, LogOut } from "lucide-react";
import { useMe } from "@/components/me-provider";
import { InstallAppButton } from "@/components/install-app-button";
import { NotificationsBell } from "@/components/notifications-bell";
import { signOutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

const TELEGRAM_INVITE = "https://t.me/+ajaqw-YQ1ZsxYjQx";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function TelegramLink() {
  return (
    <a
      href={TELEGRAM_INVITE}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join our Telegram channel"
      className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-[#26A5E4] transition-colors hover:bg-zinc-800"
    >
      <TelegramIcon className="size-5 shrink-0" />
      <span className="hidden text-xs font-extrabold uppercase tracking-wider md:inline">
        Telegram
      </span>
    </a>
  );
}
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
          open ? "border-utah-red" : "border-zinc-700 hover:border-utah-red"
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
      <div className="flex items-center gap-0.5 sm:gap-2">
        <TelegramLink />
        <InstallAppButton />
        <NotificationsBell />
        <AvatarMenu />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 sm:gap-2">
      <TelegramLink />
      <InstallAppButton />
      <Link
        href="/auth/login"
        className="flex h-9 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-white"
      >
        <LogIn className="hidden size-4 shrink-0 sm:block" />
        <span>Sign In</span>
      </Link>
      <Link
        href="/join"
        className="flex h-9 shrink-0 items-center whitespace-nowrap rounded-lg bg-utah-red px-3.5 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
      >
        Join
      </Link>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CalendarDays, MessageCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMe } from "@/components/me-provider";
import { ComposerSheet } from "@/components/composer-sheet";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/directory", label: "Directory", icon: Users },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/messages", label: "Messages", icon: MessageCircle },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const { me } = useMe();
  const unread = me?.unread_count ?? 0;
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <>
      <ComposerSheet open={composerOpen} onClose={() => setComposerOpen(false)} />

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 md:hidden"
      >
        {/* FAB — floats above the center of the nav */}
        <button
          onClick={() => {
            navigator.vibrate?.(10);
            setComposerOpen(true);
          }}
          aria-label="Create post"
          className="absolute left-1/2 -translate-x-1/2 -top-6 z-10
                     flex h-14 w-14 items-center justify-center
                     rounded-full bg-[#CC0000] shadow-lg shadow-[#CC0000]/40
                     text-white transition-transform active:scale-90"
        >
          <Plus className="size-6" strokeWidth={2.5} />
        </button>

        <ul className="mx-auto grid max-w-md grid-cols-5 pb-safe pt-1.5">
          {/* First two tabs */}
          {tabs.slice(0, 2).map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-semibold tracking-wide uppercase transition-colors",
                    active ? "text-[#CC0000]" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <Icon className={cn("size-5", active && "stroke-[2.5]")} aria-hidden />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}

          {/* FAB spacer — center slot */}
          <li aria-hidden className="pointer-events-none" />

          {/* Last two tabs */}
          {tabs.slice(2).map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            const showBadge = href === "/messages" && unread > 0;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-semibold tracking-wide uppercase transition-colors",
                    active ? "text-[#CC0000]" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <span className="relative">
                    <Icon className={cn("size-5", active && "stroke-[2.5]")} aria-hidden />
                    {showBadge && (
                      <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#CC0000] px-1 text-[9px] font-bold text-white">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

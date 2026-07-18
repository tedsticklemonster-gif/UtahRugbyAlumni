"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CalendarDays, MessageCircle, CircleUser } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMe } from "@/components/me-provider";
import { MemberAvatar } from "@/components/member-avatar";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/network", label: "Network", icon: Users },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/messages", label: "Messages", icon: MessageCircle },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const tabClass = (active: boolean) =>
  cn(
    "flex flex-col items-center justify-center gap-0.5 py-1 text-2xs font-medium transition-colors",
    active ? "text-utah-red" : "text-zinc-500 hover:text-zinc-300"
  );

export function BottomNav() {
  const pathname = usePathname();
  const { me } = useMe();
  const unread = me?.unread_count ?? 0;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 md:hidden"
    >
      <ul className={cn("mx-auto grid max-w-md pb-safe pt-1.5", me ? "grid-cols-5" : "grid-cols-4")}>
        {tabs.map(({ href, label, icon: Icon }) => {
          if (href === "/messages" && !me) return null;
          const active = isActive(pathname, href);
          const showBadge = href === "/messages" && unread > 0;
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={tabClass(active)}>
                <span className="relative">
                  <Icon className={cn("size-5", active && "stroke-[2.5]")} aria-hidden />
                  {showBadge && (
                    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-utah-red px-1 text-3xs font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}

        {me ? (
          <li>
            <Link
              href="/me"
              aria-current={isActive(pathname, "/me") ? "page" : undefined}
              className={tabClass(isActive(pathname, "/me"))}
            >
              {me.photo_signed_url ? (
                <MemberAvatar
                  photoUrl={me.photo_signed_url}
                  firstName={me.first_name}
                  lastName={me.last_name}
                  size="xs"
                  className={cn(
                    "size-5 border",
                    isActive(pathname, "/me") ? "border-utah-red" : "border-transparent"
                  )}
                />
              ) : (
                <CircleUser
                  className={cn("size-5", isActive(pathname, "/me") && "stroke-[2.5]")}
                  aria-hidden
                />
              )}
              <span>Me</span>
            </Link>
          </li>
        ) : (
          <li className="flex items-center justify-center">
            <Link
              href="/join"
              className="rounded-full bg-utah-red px-4 py-1.5 text-xs font-semibold text-white"
            >
              Join
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

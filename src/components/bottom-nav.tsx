"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CalendarDays, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMe } from "@/components/me-provider";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/directory", label: "Directory", icon: Users },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profile", label: "Me", icon: User },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const { me } = useMe();
  const unread = me?.unread_count ?? 0;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 bg-zinc-950 border-t border-zinc-800 md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 pb-safe pt-1.5">
        {tabs.map(({ href, label, icon: Icon }) => {
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
                  <Icon
                    className={cn("size-5", active && "stroke-[2.5]")}
                    aria-hidden
                  />
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
  );
}

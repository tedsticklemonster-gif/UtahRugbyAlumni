"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/network", label: "Network" },
  { href: "/events", label: "Events" },
  { href: "/messages", label: "Messages" },
  { href: "/me", label: "Me" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
      {NAV_LINKS.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors",
              active
                ? "bg-surface-2 text-white"
                : "text-zinc-400 hover:bg-surface-2/60 hover:text-white"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/roster", label: "Roster" },
  { href: "/admin/import", label: "Import" },
  { href: "/admin/email", label: "Email" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/fundraising", label: "Fundraising" },
  { href: "/admin/tokens", label: "Tokens" },
  { href: "/admin/access", label: "Access" },
  { href: "/admin/audit", label: "Audit" },
];

export function AdminNav() {
  const pathname = usePathname();

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <nav className="mb-6 flex flex-wrap items-center gap-1 border-b pb-4">
      <span className="mr-2 text-sm font-semibold text-muted-foreground">
        Admin
      </span>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-md px-2.5 py-1 text-sm transition-colors ${
            isActive(item)
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

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
  { href: "/admin/schedule", label: "Schedule" },
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
    <nav className="mb-6 flex items-center gap-1 overflow-x-auto scrollbar-hide rounded-full border border-border-subtle bg-surface-1 p-1 shadow-card">
      <span className="text-eyebrow mx-2 shrink-0">
        Admin
      </span>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors ${
            isActive(item)
              ? "bg-utah-red text-white font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

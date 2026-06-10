import Link from "next/link";
import { Search } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { BrandMark } from "@/components/brand-mark";
import { HeaderAuth } from "@/components/header-auth";
import { MeProvider } from "@/components/me-provider";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/events", label: "Events" },
  { href: "/jobs", label: "Jobs" },
  { href: "/messages", label: "Messages" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MeProvider>
      <div className="flex min-h-full flex-col">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-zinc-900 bg-black">
          {/* 3-px red top rule */}
          <div className="h-[3px] w-full bg-[#CC0000]" />

          <div className="mx-auto flex h-13 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
            {/* Wordmark */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0"
              aria-label="University of Utah Rugby Alumni — Home"
            >
              <BrandMark className="size-8" />
              <span className="hidden text-sm font-[family-name:var(--font-barlow-condensed)] font-black uppercase italic tracking-tight text-white sm:block">
                Utah Rugby <span className="text-[#CC0000]">Alumni Network</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Primary" className="hidden items-center gap-0 md:flex">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="group relative px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:text-white"
                >
                  {label}
                  <span className="absolute inset-x-3 bottom-1 h-[2px] origin-left scale-x-0 bg-[#CC0000] transition-transform duration-200 group-hover:scale-x-100" />
                </Link>
              ))}
            </nav>

            {/* Search */}
            <Link
              href="/search"
              className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
              aria-label="Search"
            >
              <Search className="size-[18px]" />
            </Link>

            <HeaderAuth />
          </div>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        <BottomNav />
      </div>
    </MeProvider>
  );
}

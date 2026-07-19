import Link from "next/link";
import { Search } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { BrandMark } from "@/components/brand-mark";
import { DesktopNav } from "@/components/desktop-nav";
import { HeaderAuth } from "@/components/header-auth";
import { MeProvider } from "@/components/me-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MeProvider>
      <div className="flex min-h-full flex-col">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-surface-0/85 backdrop-blur-xl after:block after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent">
          <div className="h-0.5 w-full bg-utah-red" />

          <div className="mx-auto flex h-13 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
            {/* Wordmark */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0"
              aria-label="University of Utah Rugby Alumni — Home"
            >
              <BrandMark className="size-8" />
              <span className="text-display hidden text-[0.9375rem] text-white sm:block">
                Utah Rugby <span className="text-utah-red">Alumni Network</span>
              </span>
            </Link>

            <DesktopNav />

            {/* Search */}
            <Link
              href="/search"
              className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-surface-2 hover:text-white"
              aria-label="Search"
            >
              <Search className="size-[18px]" />
            </Link>

            <HeaderAuth />
          </div>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        <footer className="border-t border-white/6 pb-20 md:pb-0">
          <div className="text-caption mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} Utah Rugby Alumni Network
            </p>
            <nav aria-label="Legal" className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="transition-colors hover:text-zinc-300"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-zinc-300"
              >
                Terms
              </Link>
            </nav>
          </div>
        </footer>

        <BottomNav />
      </div>
    </MeProvider>
  );
}

import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { BrandMark } from "@/components/brand-mark";
import { HeaderAuth } from "@/components/header-auth";
import { MeProvider } from "@/components/me-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MeProvider>
      <div className="flex min-h-full flex-col">
        {/* Dark header */}
        <header className="sticky top-0 z-30 bg-zinc-950 border-b border-zinc-800">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0"
              aria-label="University of Utah Rugby Alumni — Home"
            >
              <BrandMark className="size-9" />
              <span className="hidden text-sm font-bold tracking-tight text-white sm:block">
                University of Utah Rugby Alumni
              </span>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
              {[
                { href: "/feed", label: "Feed" },
                { href: "/directory", label: "Directory" },
                { href: "/schedule", label: "Schedule" },
                { href: "/messages", label: "Messages" },
                { href: "/give", label: "Give" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <HeaderAuth />
          </div>
        </header>

        <main className="flex-1 pb-16 md:pb-0">{children}</main>

        <BottomNav />
      </div>
    </MeProvider>
  );
}

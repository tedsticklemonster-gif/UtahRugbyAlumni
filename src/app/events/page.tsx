import Link from "next/link";
import { CalendarDays, ExternalLink, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Events — Utah Rugby Alumni Network",
};

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
            <CalendarDays className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Events</h1>
            <p className="text-sm text-zinc-500">Games, reunions &amp; alumni meetups</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-8 md:px-10 space-y-4">
        {/* Coming soon card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CC0000]/15">
            <CalendarDays className="size-7 text-[#CC0000]" />
          </div>
          <h2 className="text-lg font-black text-white">Alumni Events Coming Soon</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400 max-w-xs mx-auto">
            We're building a way for alumni to create and RSVP to events — watch parties,
            reunions, and meetups. Check back soon.
          </p>
          <div className="mt-5 flex flex-col gap-2 items-center">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              View game schedule
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="https://www.utah-rugby.com/new-page-2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              utah-rugby.com
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

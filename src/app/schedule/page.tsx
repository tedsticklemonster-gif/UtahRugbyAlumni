import Link from "next/link";
import { ExternalLink, CalendarDays } from "lucide-react";

export const metadata = { title: "Schedule" };

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
            <CalendarDays className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Schedule</h1>
            <p className="text-sm text-zinc-500">Games, tournaments &amp; alumni events</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-8 md:px-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm font-semibold text-white">Coming soon</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            We pull the schedule from the main Utah Rugby site on a monthly
            basis. Check the live schedule there in the meantime.
          </p>
          <a
            href="https://www.utah-rugby.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            View on utah-rugby.com
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

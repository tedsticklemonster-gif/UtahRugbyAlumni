import { CalendarDays } from "lucide-react";

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
            <CalendarDays className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Events</h1>
            <p className="text-sm text-zinc-500">Reunions, watch parties &amp; meetups</p>
          </div>
        </div>
      </div>
      <div className="px-5 py-6 md:px-10 space-y-3 max-w-2xl animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
            <div className="h-3 w-16 rounded bg-zinc-800" />
            <div className="h-5 w-3/4 rounded bg-zinc-800" />
            <div className="h-3 w-40 rounded bg-zinc-800" />
            <div className="h-3 w-32 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

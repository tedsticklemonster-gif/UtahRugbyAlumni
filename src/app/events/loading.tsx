import { CalendarDays } from "lucide-react";

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-surface-0">
      <div className="border-b border-white/6 px-5 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-2 text-zinc-300">
            <CalendarDays className="size-5" />
          </span>
          <div>
            <h1 className="text-title-1 text-white">Events</h1>
            <p className="text-caption">Reunions, watch parties &amp; meetups</p>
          </div>
        </div>
      </div>
      <div className="px-5 py-6 md:px-10 space-y-3 max-w-2xl animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="surface-card p-4 space-y-3">
            <div className="h-3 w-16 rounded bg-surface-2" />
            <div className="h-5 w-3/4 rounded bg-surface-2" />
            <div className="h-3 w-40 rounded bg-surface-2" />
            <div className="h-3 w-32 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

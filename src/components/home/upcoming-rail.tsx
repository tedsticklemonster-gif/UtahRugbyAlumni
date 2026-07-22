"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Users, ArrowRight } from "lucide-react";
import type { UpcomingItem } from "@/actions/events";


const KIND_LABELS: Record<string, string> = {
  social: "Social",
  reunion: "Reunion",
  watch_party: "Watch Party",
  practice: "Practice",
  other: "Event",
};

function GameCard({ item }: { item: Extract<UpcomingItem, { source: "game" }> }) {
  return (
    <Link
      href="/events?tab=season"
      className="group relative flex-shrink-0 w-64 overflow-hidden rounded-2xl border border-zinc-900 bg-surface-1 p-5 shadow-card transition-colors hover:border-border-strong active:scale-[0.98]"
    >
      {/* Red left accent */}
      <span className="absolute left-0 top-0 h-full w-[3px] bg-utah-red" />
      <div className="pl-1">
        <p className="text-eyebrow text-utah-red">Game</p>
        <p className="text-display mt-1.5 text-[1.375rem] leading-tight text-white">
          vs {item.opponent}
        </p>
        <div className="mt-2.5 space-y-1.5">
          {item.date && (
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <CalendarDays className="size-4 shrink-0" />
              {item.date}
            </p>
          )}
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <MapPin className="size-4 shrink-0" />
            {item.location}
          </p>
        </div>
      </div>
      <ArrowRight className="absolute right-4 top-4 size-4 text-zinc-600 transition-colors group-hover:text-white" />
    </Link>
  );
}

function EventCard({ item }: { item: Extract<UpcomingItem, { source: "event" }> }) {
  return (
    <Link
      href={`/events/${item.id}`}
      className="group relative flex-shrink-0 w-64 overflow-hidden rounded-2xl border border-zinc-900 bg-surface-1 p-5 shadow-card transition-colors hover:border-border-strong active:scale-[0.98]"
    >
      {/* Red left accent */}
      <span className="absolute left-0 top-0 h-full w-[3px] bg-utah-red" />
      <div className="pl-1">
        <p className="text-eyebrow text-utah-red">
          {KIND_LABELS[item.kind] ?? "Event"}
        </p>
        <p className="text-display mt-1.5 text-[1.375rem] leading-tight text-white line-clamp-2">
          {item.title}
        </p>
        <div className="mt-2.5 space-y-1.5">
          {item.date && (
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <CalendarDays className="size-4 shrink-0" />
              {item.date}
            </p>
          )}
          {item.rsvp_going > 0 && (
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <Users className="size-4 shrink-0" />
              {item.rsvp_going} going
              {item.my_rsvp === "going" && (
                <span className="font-semibold text-utah-red">· You&apos;re in</span>
              )}
            </p>
          )}
        </div>
      </div>
      <ArrowRight className="absolute right-4 top-4 size-4 text-zinc-600 transition-colors group-hover:text-white" />
    </Link>
  );
}

function isStillUpcoming(item: UpcomingItem): boolean {
  if (!item.sort_date) return true;
  const d = new Date(item.sort_date);
  if (isNaN(d.getTime())) return true;
  if (item.source === "event") {
    return d.getTime() >= Date.now();
  }
  // For games, keep through the end of the game day (local midnight)
  const endOfDay = new Date(d);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() >= Date.now();
}

export function UpcomingRail({ items }: { items: UpcomingItem[] }) {
  const filtered = items.filter(isStillUpcoming);

  if (filtered.length === 0) {
    return (
      <div className="px-4 pb-4">
        <h2 className="text-title-2 text-white">Coming Up</h2>
        <a
          href="https://www.utah-rugby.com/new-page-2"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-2.5 inline-flex items-center gap-2 text-sm font-semibold text-utah-red hover:text-white transition-colors"
        >
          <CalendarDays className="size-4 shrink-0" />
          View official game schedule
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-4 mb-3.5">
        <h2 className="text-title-2 text-white">Coming Up</h2>
      </div>
      <div
        className="flex gap-3 overflow-x-auto px-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {filtered.map((item, i) =>
          item.source === "game" ? (
            <GameCard key={`game-${i}`} item={item} />
          ) : (
            <EventCard key={item.id} item={item} />
          )
        )}
      </div>
    </div>
  );
}

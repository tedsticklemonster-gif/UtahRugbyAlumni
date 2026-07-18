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
      className="group relative flex-shrink-0 w-56 border border-zinc-900 bg-surface-0 p-4 transition-colors hover:border-zinc-700 active:scale-[0.98]"
    >
      {/* Red left accent */}
      <span className="absolute left-0 top-0 h-full w-[3px] bg-utah-red" />
      <div className="pl-1">
        <p className={`text-eyebrow text-3xs text-utah-red`}>Game</p>
        <p className={`text-display mt-1 text-xl leading-none text-white`}>
          vs {item.opponent}
        </p>
        <div className="mt-2 space-y-1">
          {item.date && (
            <p className="flex items-center gap-1.5 text-2xs text-zinc-500">
              <CalendarDays className="size-3 shrink-0" />
              {item.date}
            </p>
          )}
          <p className="flex items-center gap-1.5 text-2xs text-zinc-500">
            <MapPin className="size-3 shrink-0" />
            {item.location}
          </p>
        </div>
      </div>
      <ArrowRight className="absolute right-3 top-3 size-3 text-zinc-700 transition-colors group-hover:text-white" />
    </Link>
  );
}

function EventCard({ item }: { item: Extract<UpcomingItem, { source: "event" }> }) {
  return (
    <Link
      href={`/events/${item.id}`}
      className="group relative flex-shrink-0 w-56 border border-zinc-900 bg-surface-0 p-4 transition-colors hover:border-zinc-700 active:scale-[0.98]"
    >
      {/* Red left accent */}
      <span className="absolute left-0 top-0 h-full w-[3px] bg-utah-red" />
      <div className="pl-1">
        <p className={`text-eyebrow text-3xs text-utah-red`}>
          {KIND_LABELS[item.kind] ?? "Event"}
        </p>
        <p className={`text-display mt-1 text-xl leading-none text-white line-clamp-2`}>
          {item.title}
        </p>
        <div className="mt-2 space-y-1">
          {item.date && (
            <p className="flex items-center gap-1.5 text-2xs text-zinc-500">
              <CalendarDays className="size-3 shrink-0" />
              {item.date}
            </p>
          )}
          {item.rsvp_going > 0 && (
            <p className="flex items-center gap-1.5 text-2xs text-zinc-500">
              <Users className="size-3 shrink-0" />
              {item.rsvp_going} going
              {item.my_rsvp === "going" && (
                <span className="text-utah-red">· You&apos;re in</span>
              )}
            </p>
          )}
        </div>
      </div>
      <ArrowRight className="absolute right-3 top-3 size-3 text-zinc-700 transition-colors group-hover:text-white" />
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
        <span className="block h-[2px] w-8 bg-utah-red" />
        <p className={`text-eyebrow mt-2 text-2xs text-zinc-500`}>Coming Up</p>
        <a
          href="https://www.utah-rugby.com/new-page-2"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-eyebrow mt-2 inline-flex items-center gap-1.5 text-2xs text-utah-red hover:text-white transition-colors`}
        >
          <CalendarDays className="size-3.5 shrink-0" />
          View official game schedule →
        </a>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-4 mb-3">
        <span className="block h-[2px] w-8 bg-utah-red" />
        <p className={`text-eyebrow mt-2 text-2xs text-zinc-500`}>Coming Up</p>
      </div>
      <div
        className="flex gap-2.5 overflow-x-auto px-4 scrollbar-hide"
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

"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Users, ArrowRight } from "lucide-react";
import type { UpcomingItem } from "@/actions/events";

const display =
  "font-[family-name:var(--font-barlow-condensed)] font-black uppercase italic tracking-tight";
const eyebrow =
  "font-[family-name:var(--font-barlow)] font-extrabold uppercase tracking-[0.25em]";

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
      href="/schedule"
      className="group relative flex-shrink-0 w-56 border border-zinc-900 bg-zinc-950 p-4 transition-colors hover:border-zinc-700 active:scale-[0.98]"
    >
      {/* Red left accent */}
      <span className="absolute left-0 top-0 h-full w-[3px] bg-[#CC0000]" />
      <div className="pl-1">
        <p className={`${eyebrow} text-[9px] text-[#CC0000]`}>Game</p>
        <p className={`${display} mt-1 text-xl leading-none text-white`}>
          vs {item.opponent}
        </p>
        <div className="mt-2 space-y-1">
          {item.date && (
            <p className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <CalendarDays className="size-3 shrink-0" />
              {item.date}
            </p>
          )}
          <p className="flex items-center gap-1.5 text-[10px] text-zinc-500">
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
      className="group relative flex-shrink-0 w-56 border border-zinc-900 bg-zinc-950 p-4 transition-colors hover:border-zinc-700 active:scale-[0.98]"
    >
      {/* Red left accent */}
      <span className="absolute left-0 top-0 h-full w-[3px] bg-[#CC0000]" />
      <div className="pl-1">
        <p className={`${eyebrow} text-[9px] text-[#CC0000]`}>
          {KIND_LABELS[item.kind] ?? "Event"}
        </p>
        <p className={`${display} mt-1 text-xl leading-none text-white line-clamp-2`}>
          {item.title}
        </p>
        <div className="mt-2 space-y-1">
          {item.date && (
            <p className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <CalendarDays className="size-3 shrink-0" />
              {item.date}
            </p>
          )}
          {item.rsvp_going > 0 && (
            <p className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <Users className="size-3 shrink-0" />
              {item.rsvp_going} going
              {item.my_rsvp === "going" && (
                <span className="text-[#CC0000]">· You&apos;re in</span>
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
        <span className="block h-[2px] w-8 bg-[#CC0000]" />
        <p className={`${eyebrow} mt-2 text-[10px] text-zinc-500`}>Coming Up</p>
        <a
          href="https://www.utah-rugby.com/new-page-2"
          target="_blank"
          rel="noopener noreferrer"
          className={`${eyebrow} mt-2 inline-flex items-center gap-1.5 text-[10px] text-[#CC0000] hover:text-white transition-colors`}
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
        <span className="block h-[2px] w-8 bg-[#CC0000]" />
        <p className={`${eyebrow} mt-2 text-[10px] text-zinc-500`}>Coming Up</p>
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

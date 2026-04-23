"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import type { UpcomingItem } from "@/actions/events";

function GameCard({ item }: { item: Extract<UpcomingItem, { source: "game" }> }) {
  return (
    <Link
      href="/schedule"
      className="flex-shrink-0 w-52 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600 transition-colors active:scale-[0.98]"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#CC0000]/15">
          <CalendarDays className="size-3.5 text-[#CC0000]" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">
          Game
        </span>
      </div>
      <p className="text-sm font-bold text-white leading-snug">
        Utah Utes{" "}
        <span className="font-normal text-zinc-400">vs</span>{" "}
        {item.opponent}
      </p>
      {item.date && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-zinc-500">
          <CalendarDays className="size-3 shrink-0" />
          {item.date}
        </p>
      )}
      <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
        <MapPin className="size-3 shrink-0" />
        {item.location} Game
      </p>
    </Link>
  );
}

const KIND_LABELS: Record<string, string> = {
  social: "Social",
  reunion: "Reunion",
  watch_party: "Watch Party",
  practice: "Practice",
  other: "Event",
};

function EventCard({ item }: { item: Extract<UpcomingItem, { source: "event" }> }) {
  return (
    <Link
      href={`/events/${item.id}`}
      className="flex-shrink-0 w-52 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600 transition-colors active:scale-[0.98]"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#CC0000]/15">
          <CalendarDays className="size-3.5 text-[#CC0000]" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">
          {KIND_LABELS[item.kind] ?? "Event"}
        </span>
      </div>
      <p className="text-sm font-bold text-white leading-snug line-clamp-2">{item.title}</p>
      {item.date && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-zinc-500">
          <CalendarDays className="size-3 shrink-0" />
          {item.date}
        </p>
      )}
      {item.rsvp_going > 0 && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
          <Users className="size-3 shrink-0" />
          {item.rsvp_going} going
          {item.my_rsvp === "going" && <span className="text-emerald-500"> · You're in</span>}
        </p>
      )}
    </Link>
  );
}

export function UpcomingRail({ items }: { items: UpcomingItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="px-4 pb-4">
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        Coming Up
      </p>
      <div
        className="flex gap-3 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) =>
          item.source === "game"
            ? <GameCard key={`game-${i}`} item={item} />
            : <EventCard key={item.id} item={item} />
        )}
      </div>
    </div>
  );
}

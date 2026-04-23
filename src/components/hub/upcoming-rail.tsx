"use client";

import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { HubUpcomingItem } from "@/actions/hub";

function GameCard({ item }: { item: HubUpcomingItem }) {
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
          Upcoming
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

export function UpcomingRail({ items }: { items: HubUpcomingItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="px-4 pb-4">
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        On the Pitch
      </p>
      <div
        className="flex gap-3 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <GameCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

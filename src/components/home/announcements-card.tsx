"use client";

import { relativeTime } from "@/lib/time";
import { Megaphone, Pin } from "lucide-react";
import type { HubAnnouncement } from "@/actions/hub";


export function AnnouncementsCard({ items }: { items: HubAnnouncement[] }) {
  if (items.length === 0) return null;

  return (
    <div className="px-4 pb-5 pt-5">
      <span className="block h-[2px] w-8 bg-utah-red" />
      <p className={`text-eyebrow mb-3 mt-2 text-2xs text-zinc-500`}>Announcements</p>
      <div className="space-y-2">
        {items.map((ann) => (
          <div
            key={ann.id}
            className="relative flex gap-3 overflow-hidden border border-utah-red/25 bg-utah-red/5 px-4 py-3"
          >
            {/* Left accent bar */}
            <span className="absolute left-0 top-0 h-full w-[3px] bg-utah-red" />
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center bg-utah-red/20 pl-1">
              {ann.pinned ? (
                <Pin className="size-3.5 text-utah-red" />
              ) : (
                <Megaphone className="size-3.5 text-utah-red" />
              )}
            </div>
            <div className="min-w-0 flex-1 pl-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold leading-snug text-white">{ann.title}</p>
                <span className={`text-eyebrow shrink-0 text-3xs text-zinc-600`} suppressHydrationWarning>
                  {relativeTime(ann.created_at)}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                {ann.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

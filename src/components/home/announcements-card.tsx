"use client";

import { relativeTime } from "@/lib/time";
import { Megaphone, Pin } from "lucide-react";
import type { HubAnnouncement } from "@/actions/hub";


export function AnnouncementsCard({ items }: { items: HubAnnouncement[] }) {
  if (items.length === 0) return null;

  return (
    <div className="px-4 pb-5 pt-6">
      <h2 className="text-title-2 mb-3 text-white">Announcements</h2>
      <div className="space-y-3">
        {items.map((ann) => (
          <div
            key={ann.id}
            className="relative flex gap-3.5 overflow-hidden rounded-2xl border border-utah-red/25 bg-utah-red/5 px-4 py-4"
          >
            {/* Left accent bar */}
            <span className="absolute left-0 top-0 h-full w-[3px] bg-utah-red" />
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-utah-red/20">
              {ann.pinned ? (
                <Pin className="size-5 text-utah-red" />
              ) : (
                <Megaphone className="size-5 text-utah-red" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-card-title leading-snug text-white">{ann.title}</p>
                <span className="text-caption shrink-0" suppressHydrationWarning>
                  {relativeTime(ann.created_at)}
                </span>
              </div>
              <p className="text-body-sm mt-1 line-clamp-3 text-zinc-300">
                {ann.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

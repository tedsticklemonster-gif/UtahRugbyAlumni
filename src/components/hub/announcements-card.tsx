"use client";

import { Megaphone, Pin } from "lucide-react";
import type { HubAnnouncement } from "@/actions/hub";

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d < 1) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AnnouncementsCard({ items }: { items: HubAnnouncement[] }) {
  if (items.length === 0) return null;

  return (
    <div className="px-4 pb-4">
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        Announcements
      </p>
      <div className="space-y-2">
        {items.map((ann) => (
          <div
            key={ann.id}
            className="flex gap-3 rounded-2xl border border-[#CC0000]/30 bg-[#CC0000]/5 px-4 py-3"
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#CC0000]/15">
              {ann.pinned ? (
                <Pin className="size-3.5 text-[#CC0000]" />
              ) : (
                <Megaphone className="size-3.5 text-[#CC0000]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-white leading-snug">{ann.title}</p>
                <span className="shrink-0 text-[10px] text-zinc-600">{relativeTime(ann.created_at)}</span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-400 line-clamp-2">
                {ann.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

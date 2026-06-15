"use client";

import { Megaphone, Pin } from "lucide-react";
import type { HubAnnouncement } from "@/actions/hub";

const eyebrow =
  "font-[family-name:var(--font-barlow)] font-extrabold uppercase tracking-[0.25em]";

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
    <div className="px-4 pb-5 pt-5">
      <span className="block h-[2px] w-8 bg-[#CC0000]" />
      <p className={`${eyebrow} mb-3 mt-2 text-[10px] text-zinc-500`}>Announcements</p>
      <div className="space-y-2">
        {items.map((ann) => (
          <div
            key={ann.id}
            className="relative flex gap-3 overflow-hidden border border-[#CC0000]/25 bg-[#CC0000]/5 px-4 py-3"
          >
            {/* Left accent bar */}
            <span className="absolute left-0 top-0 h-full w-[3px] bg-[#CC0000]" />
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center bg-[#CC0000]/20 pl-1">
              {ann.pinned ? (
                <Pin className="size-3.5 text-[#CC0000]" />
              ) : (
                <Megaphone className="size-3.5 text-[#CC0000]" />
              )}
            </div>
            <div className="min-w-0 flex-1 pl-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold leading-snug text-white">{ann.title}</p>
                <span className={`${eyebrow} shrink-0 text-[9px] text-zinc-600`} suppressHydrationWarning>
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

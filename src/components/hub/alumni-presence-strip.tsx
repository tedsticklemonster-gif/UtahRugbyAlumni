"use client";

import Link from "next/link";
import type { HubPresenceMember } from "@/actions/hub";


function PresenceAvatar({ member }: { member: HubPresenceMember }) {
  const initials = member.first_name[0]?.toUpperCase() ?? "?";

  return (
    <Link
      href={`/u/${member.id}`}
      className="flex flex-col items-center gap-1.5 shrink-0 group"
    >
      <div className="relative h-14 w-14">
        {member.photo_signed_url ? (
          <img
            src={member.photo_signed_url}
            alt={member.first_name}
            className="h-14 w-14 rounded-full object-cover border-2 border-zinc-800 group-hover:border-utah-red transition-colors duration-200"
          />
        ) : (
          <div className="h-14 w-14 rounded-full border-2 border-zinc-800 group-hover:border-utah-red transition-colors duration-200 bg-zinc-900 flex items-center justify-center text-base font-bold text-zinc-400">
            {initials}
          </div>
        )}
        {/* Online indicator */}
        <span className="absolute bottom-0.5 right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-black bg-utah-red" />
      </div>
      <span className={`text-eyebrow w-14 truncate text-center text-[8px] text-zinc-500 group-hover:text-zinc-300 transition-colors`}>
        {member.first_name}
      </span>
    </Link>
  );
}

export function AlumniPresenceStrip({ presence }: { presence: HubPresenceMember[] }) {
  if (presence.length === 0) return null;

  return (
    <div className="border-b border-zinc-900">
      <div className="px-4 pt-4 pb-1">
        <p className={`text-eyebrow text-3xs text-zinc-600`}>Active Now</p>
      </div>
      <div
        className="flex gap-4 overflow-x-auto px-4 py-3 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {presence.map((member) => (
          <PresenceAvatar key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

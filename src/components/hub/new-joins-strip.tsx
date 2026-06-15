"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import type { HubRecentJoin } from "@/actions/hub";

const eyebrow =
  "font-[family-name:var(--font-barlow)] font-extrabold uppercase tracking-[0.25em]";

function JoinChip({ join }: { join: HubRecentJoin }) {
  const initials = `${join.first_name[0]}${join.last_name[0]}`.toUpperCase();
  const year = join.grad_year ? `'${String(join.grad_year).slice(-2)}` : null;

  return (
    <Link
      href={`/u/${join.id}`}
      className="flex items-center gap-2 shrink-0 border border-zinc-800 bg-zinc-950 pl-1 pr-3 py-1.5 transition-colors hover:border-zinc-600 active:scale-[0.97]"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-zinc-800 text-[10px] font-bold text-zinc-300">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold leading-none text-white">
          {join.first_name} {join.last_name}
          {year && <span className="ml-1 font-normal text-zinc-500">{year}</span>}
        </p>
        <p className={`${eyebrow} mt-0.5 text-[8px] text-zinc-600`}>just joined</p>
      </div>
    </Link>
  );
}

export function NewJoinsStrip({ joins }: { joins: HubRecentJoin[] }) {
  if (joins.length === 0) return null;

  return (
    <div className="px-4 pb-5 pt-5">
      <span className="block h-[2px] w-8 bg-[#CC0000]" />
      <p className={`${eyebrow} mb-3 mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500`}>
        <UserPlus className="size-3" />
        New Members
      </p>
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {joins.map((join) => (
          <JoinChip key={join.id} join={join} />
        ))}
      </div>
    </div>
  );
}

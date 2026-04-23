"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import type { HubRecentJoin } from "@/actions/hub";

function JoinChip({ join }: { join: HubRecentJoin }) {
  const initials = `${join.first_name[0]}${join.last_name[0]}`.toUpperCase();
  const year = join.grad_year ? `'${String(join.grad_year).slice(-2)}` : null;

  return (
    <Link
      href={`/u/${join.id}`}
      className="flex items-center gap-2 shrink-0 rounded-full border border-zinc-800 bg-zinc-900 pl-1 pr-3 py-1 hover:border-zinc-600 transition-colors active:scale-[0.97]"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-bold text-zinc-300 shrink-0">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-white leading-none">
          {join.first_name} {join.last_name}
          {year && <span className="ml-1 text-zinc-500">{year}</span>}
        </p>
        <p className="text-[10px] text-zinc-600 mt-0.5">just joined</p>
      </div>
    </Link>
  );
}

export function NewJoinsStrip({ joins }: { joins: HubRecentJoin[] }) {
  if (joins.length === 0) return null;

  return (
    <div className="px-4 pb-4">
      <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        <UserPlus className="size-3" />
        New Members
      </p>
      <div
        className="flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {joins.map((join) => (
          <JoinChip key={join.id} join={join} />
        ))}
      </div>
    </div>
  );
}

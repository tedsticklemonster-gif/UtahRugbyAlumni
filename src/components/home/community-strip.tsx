"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { MemberAvatar } from "@/components/member-avatar";
import type { HubPresenceMember, HubRecentJoin } from "@/actions/hub";

export type EraMember = {
  id: string;
  first_name: string;
  last_name: string;
  grad_year: number | null;
  photo_signed_url: string | null;
};

function AvatarRail({
  members,
  showActiveDot,
}: {
  members: { id: string; first_name: string; last_name?: string; photo_signed_url: string | null }[];
  showActiveDot?: boolean;
}) {
  return (
    <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
      {members.map((m) => (
        <Link
          key={m.id}
          href={`/u/${m.id}`}
          className="group flex w-16 shrink-0 flex-col items-center gap-1.5"
        >
          <div className="relative">
            <MemberAvatar
              photoUrl={m.photo_signed_url}
              firstName={m.first_name}
              lastName={m.last_name ?? ""}
              size="lg"
              className="border-2 border-zinc-800 transition-colors group-hover:border-utah-red"
            />
            {showActiveDot && (
              <span className="absolute bottom-0.5 right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-black bg-utah-red" />
            )}
          </div>
          <p className="w-full truncate text-center text-2xs text-zinc-400 transition-colors group-hover:text-white">
            {m.first_name}
          </p>
        </Link>
      ))}
    </div>
  );
}

/** One Community section: who's active, who just joined, and your era —
 * replaces three separately-headed strips. */
export function CommunityStrip({
  presence,
  joins,
  eraMembers,
  myGradYear,
}: {
  presence: HubPresenceMember[];
  joins: HubRecentJoin[];
  eraMembers: EraMember[];
  myGradYear: number | null;
}) {
  const hasEra = Boolean(myGradYear) && eraMembers.length > 0;
  if (presence.length === 0 && joins.length === 0 && !hasEra) return null;

  const startYear = myGradYear ? myGradYear - 2 : 0;
  const endYear = myGradYear ? myGradYear + 2 : 0;

  return (
    <div className="px-4 pt-5">
      <span className="block h-[2px] w-8 bg-utah-red" />
      <p className="text-eyebrow mb-3 mt-2 text-2xs text-zinc-500">Community</p>

      <div className="space-y-4">
        {presence.length > 0 && (
          <div>
            <p className="text-eyebrow mb-2 text-3xs text-zinc-600">Active Now</p>
            <AvatarRail members={presence} showActiveDot />
          </div>
        )}

        {joins.length > 0 && (
          <div>
            <p className="text-eyebrow mb-2 flex items-center gap-1.5 text-3xs text-zinc-600">
              <UserPlus className="size-3" />
              New Members
            </p>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto">
              {joins.map((join) => {
                const year = join.grad_year ? `'${String(join.grad_year).slice(-2)}` : null;
                return (
                  <Link
                    key={join.id}
                    href={`/u/${join.id}`}
                    className="flex shrink-0 items-center gap-2 border border-zinc-800 bg-zinc-950 py-1.5 pl-1 pr-3 transition-colors hover:border-zinc-600 motion-safe:active:scale-[0.97]"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-zinc-800 text-2xs font-bold text-zinc-300">
                      {`${join.first_name[0]}${join.last_name[0]}`.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-none text-white">
                        {join.first_name} {join.last_name}
                        {year && <span className="ml-1 font-normal text-zinc-500">{year}</span>}
                      </p>
                      <p className="text-eyebrow mt-0.5 text-[8px] text-zinc-600">just joined</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {hasEra && (
          <div>
            <div className="mb-2 flex items-end justify-between">
              <p className="text-eyebrow text-3xs text-zinc-600">
                Your Era · &rsquo;{String(startYear).slice(-2)}&ndash;&rsquo;{String(endYear).slice(-2)}
              </p>
              <Link
                href={`/network?year_start=${startYear}&year_end=${endYear}`}
                className="text-eyebrow text-3xs text-zinc-500 transition-colors hover:text-white"
              >
                View All →
              </Link>
            </div>
            <AvatarRail members={eraMembers} />
          </div>
        )}
      </div>
    </div>
  );
}

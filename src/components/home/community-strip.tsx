"use client";

import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";
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
          className="group flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5"
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
              <span className="absolute bottom-0.5 right-0.5 block h-3 w-3 rounded-full border-2 border-black bg-utah-red" />
            )}
          </div>
          <p className="w-full truncate text-center text-xs font-medium text-zinc-400 transition-colors group-hover:text-white">
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
    <div className="px-4 pt-6">
      <h2 className="text-title-2 mb-4 text-white">Community</h2>

      <div className="space-y-5">
        {presence.length > 0 && (
          <div>
            <p className="text-eyebrow mb-2.5">Active Now</p>
            <AvatarRail members={presence} showActiveDot />
          </div>
        )}

        {joins.length > 0 && (
          <div>
            <p className="text-eyebrow mb-2.5 flex items-center gap-1.5">
              <UserPlus className="size-3.5" />
              New Members
            </p>
            <div className="scrollbar-hide flex gap-2.5 overflow-x-auto">
              {joins.map((join) => {
                const year = join.grad_year ? `'${String(join.grad_year).slice(-2)}` : null;
                return (
                  <Link
                    key={join.id}
                    href={`/u/${join.id}`}
                    className="flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-surface-0 py-1.5 pl-1.5 pr-4 transition-colors hover:border-border-strong motion-safe:active:scale-[0.97]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-zinc-300">
                      {`${join.first_name[0]}${join.last_name[0]}`.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-tight text-white">
                        {join.first_name} {join.last_name}
                        {year && <span className="ml-1 font-normal text-zinc-500">{year}</span>}
                      </p>
                      <p className="text-xs text-zinc-500">just joined</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {hasEra && (
          <div>
            <div className="mb-2.5 flex items-end justify-between">
              <p className="text-eyebrow">
                Your Era · &rsquo;{String(startYear).slice(-2)}&ndash;&rsquo;{String(endYear).slice(-2)}
              </p>
              <Link
                href={`/network?yearFrom=${startYear}&yearTo=${endYear}`}
                className="group inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
              >
                View All
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <AvatarRail members={eraMembers} />
          </div>
        )}
      </div>
    </div>
  );
}

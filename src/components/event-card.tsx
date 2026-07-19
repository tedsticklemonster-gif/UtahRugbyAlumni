"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { RsvpChips } from "@/components/rsvp-chips";
import { ShareButton } from "@/components/share-button";
import type { AlumniEvent } from "@/actions/events";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://utah-rugby-alumni.vercel.app";

/* Event kinds map onto the four semantic accents — brand red for the marquee
   moments, info/success/warning for the rest, neutral for everything else. */
const KIND_CONFIG: Record<string, { label: string; color: string }> = {
  social: { label: "Social", color: "text-zinc-400" },
  reunion: { label: "Reunion", color: "text-utah-red" },
  watch_party: { label: "Watch Party", color: "text-info" },
  practice: { label: "Practice", color: "text-success" },
  fundraiser: { label: "Fundraiser", color: "text-warning" },
  networking: { label: "Networking", color: "text-info" },
  game_day: { label: "Game Day", color: "text-utah-red" },
  other: { label: "Event", color: "text-zinc-400" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventCard({ event, myAlumniId }: { event: AlumniEvent; myAlumniId: string | null }) {
  return (
    <div className="surface-card overflow-hidden transition-[border-color,box-shadow] duration-200 ease-out hover:border-border-strong active:bg-surface-2/60">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <span className={`text-eyebrow ${(KIND_CONFIG[event.kind] ?? KIND_CONFIG.other).color}`}>
              {(KIND_CONFIG[event.kind] ?? KIND_CONFIG.other).label}
            </span>
            <Link href={`/events/${event.id}`} className="block mt-0.5">
              <h3 className="text-card-title text-white hover:text-utah-red transition-colors">
                {event.title}
              </h3>
            </Link>
          </div>
          <ShareButton url={`${APP_URL}/events/${event.id}`} title={event.title} />
        </div>

        <div className="space-y-1.5 mb-3.5">
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <CalendarDays className="size-4 shrink-0 text-zinc-500" />
            {formatDate(event.starts_at)}
          </p>
          {event.location && (
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <MapPin className="size-4 shrink-0 text-zinc-500" />
              <a
                href={event.location_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-zinc-700 underline-offset-2 hover:text-white hover:decoration-white transition-colors"
              >
                {event.location}
              </a>
            </p>
          )}
          {(event as Record<string, unknown>).cost ? (
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="size-4 shrink-0 text-center text-zinc-500 font-bold">$</span>
              {(event as Record<string, unknown>).cost as string}
            </p>
          ) : null}
          {event.rsvp_going > 0 && (
            <p className="flex items-center gap-2 text-sm text-zinc-500">
              <Users className="size-4 shrink-0" />
              {event.rsvp_going} going{event.rsvp_maybe > 0 ? `, ${event.rsvp_maybe} maybe` : ""}
            </p>
          )}
        </div>

        {event.description && (
          <div className="mb-3">
            <p className="text-body-sm text-zinc-400 line-clamp-2">{event.description}</p>
            {event.description.length > 120 && (
              <Link href={`/events/${event.id}`} className="text-sm font-semibold text-zinc-500 hover:text-white transition-colors">
                Read more
              </Link>
            )}
          </div>
        )}

        {myAlumniId && (
          <RsvpChips eventId={event.id} initial={event.my_rsvp} />
        )}
      </div>
    </div>
  );
}

export function EventRailCard({ event }: { event: AlumniEvent; myAlumniId?: string | null }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="surface-card flex-shrink-0 w-60 p-5 hover:border-border-strong transition-[border-color,box-shadow] duration-200 ease-out active:scale-[0.98] block"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-utah-red/15">
          <CalendarDays className="size-4 text-utah-red" />
        </span>
        <span className={`text-eyebrow ${(KIND_CONFIG[event.kind] ?? KIND_CONFIG.other).color}`}>
          {(KIND_CONFIG[event.kind] ?? KIND_CONFIG.other).label}
        </span>
      </div>
      <p className="text-display text-lg text-white leading-snug line-clamp-2">{event.title}</p>
      {event.starts_at && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
          <CalendarDays className="size-3 shrink-0" />
          {new Date(event.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}
      {event.rsvp_going > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
          <Users className="size-3 shrink-0" />
          {event.rsvp_going} going
        </p>
      )}
    </Link>
  );
}

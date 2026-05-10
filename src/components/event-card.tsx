"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { RsvpChips } from "@/components/rsvp-chips";
import { ShareButton } from "@/components/share-button";
import type { AlumniEvent } from "@/actions/events";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alumni.utah-rugby.com";

const KIND_LABELS: Record<string, string> = {
  social: "Social",
  reunion: "Reunion",
  watch_party: "Watch Party",
  practice: "Practice",
  other: "Event",
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden transition-colors active:bg-zinc-800/60">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">
              {KIND_LABELS[event.kind] ?? "Event"}
            </span>
            <Link href={`/events/${event.id}`} className="block mt-0.5">
              <h3 className="text-base font-bold text-white hover:text-[#CC0000] transition-colors leading-snug">
                {event.title}
              </h3>
            </Link>
          </div>
          <ShareButton url={`${APP_URL}/events/${event.id}`} title={event.title} />
        </div>

        <div className="space-y-1 mb-3">
          <p className="flex items-center gap-1.5 text-xs text-zinc-400">
            <CalendarDays className="size-3.5 shrink-0 text-zinc-500" />
            {formatDate(event.starts_at)}
          </p>
          {event.location && (
            <p className="flex items-center gap-1.5 text-xs text-zinc-400">
              <MapPin className="size-3.5 shrink-0 text-zinc-500" />
              {event.location}
            </p>
          )}
          {event.rsvp_going > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Users className="size-3.5 shrink-0" />
              {event.rsvp_going} going{event.rsvp_maybe > 0 ? `, ${event.rsvp_maybe} maybe` : ""}
            </p>
          )}
        </div>

        {event.description && (
          <div className="mb-3">
            <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2">{event.description}</p>
            {event.description.length > 120 && (
              <Link href={`/events/${event.id}`} className="text-[11px] font-semibold text-zinc-500 hover:text-white transition-colors">
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

export function EventRailCard({ event, myAlumniId }: { event: AlumniEvent; myAlumniId: string | null }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="flex-shrink-0 w-52 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600 transition-colors active:scale-[0.98] block"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#CC0000]/15">
          <CalendarDays className="size-3.5 text-[#CC0000]" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">
          {KIND_LABELS[event.kind] ?? "Event"}
        </span>
      </div>
      <p className="text-sm font-bold text-white leading-snug line-clamp-2">{event.title}</p>
      {event.starts_at && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-zinc-500">
          <CalendarDays className="size-3 shrink-0" />
          {new Date(event.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}
      {event.rsvp_going > 0 && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
          <Users className="size-3 shrink-0" />
          {event.rsvp_going} going
        </p>
      )}
    </Link>
  );
}

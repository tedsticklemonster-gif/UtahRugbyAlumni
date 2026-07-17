import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CalendarPlus, MapPin, Users, Repeat } from "lucide-react";
import { getEvent, getEventAttendees } from "@/actions/events";
import { RsvpChips } from "@/components/rsvp-chips";
import { EventAttendees } from "@/components/event-attendees";
import { ShareButton } from "@/components/share-button";
import { EventPhotoGallery } from "@/components/event-photo-gallery";
import { EventPhotoUploader } from "@/components/event-photo-uploader";
import { listEventPhotos } from "@/actions/event-photos";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://utah-rugby-alumni.vercel.app";

const KIND_CONFIG: Record<string, { label: string; color: string }> = {
  social: { label: "Social", color: "text-purple-400" },
  reunion: { label: "Reunion", color: "text-[#CC0000]" },
  watch_party: { label: "Watch Party", color: "text-sky-400" },
  practice: { label: "Practice", color: "text-emerald-400" },
  fundraiser: { label: "Fundraiser", color: "text-amber-400" },
  networking: { label: "Networking", color: "text-blue-400" },
  game_day: { label: "Game Day", color: "text-[#CC0000]" },
  other: { label: "Event", color: "text-zinc-400" },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: "Event" };

  const when = new Date(event.starts_at).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const descBits = [when, event.location, event.description?.slice(0, 120)].filter(Boolean);
  const description = descBits.join(" · ");
  const ogUrl = `${APP_URL}/api/og/event/${id}`;

  return {
    title: `${event.title} — Utah Rugby Alumni`,
    description,
    openGraph: {
      title: `${event.title} — Utah Rugby Alumni`,
      description,
      url: `${APP_URL}/events/${id}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} — Utah Rugby Alumni`,
      description,
      images: [ogUrl],
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let myAlumniId: string | null = null;
  if (user?.email) {
    const admin = createAdminClient();
    const { data } = await admin.from("alumni").select("id").eq("email", user.email).single();
    myAlumniId = data?.id ?? null;
  }

  const [event, attendees, photos] = await Promise.all([
    getEvent(id),
    getEventAttendees(id),
    listEventPhotos(id),
  ]);
  if (!event) notFound();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Back nav */}
      <div className="border-b border-zinc-800 px-5 py-4 md:px-10">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" />
          Events
        </Link>
      </div>

      <div className="px-5 py-6 md:px-10 max-w-2xl space-y-5">
        {/* Kind badge + recurring indicator */}
        <div className="flex items-center gap-2">
          <span className={`inline-block text-[10px] font-bold uppercase tracking-widest ${(KIND_CONFIG[event.kind] ?? KIND_CONFIG.other).color}`}>
            {(KIND_CONFIG[event.kind] ?? KIND_CONFIG.other).label}
          </span>
          {(event.series_id || event.recurrence_rule) && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <Repeat className="size-3" />
              Recurring
            </span>
          )}
        </div>

        {/* Title + Share */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-black leading-tight tracking-tight text-white">
            {event.title}
          </h1>
          <ShareButton url={`${APP_URL}/events/${id}`} title={event.title} />
        </div>

        {/* Details */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <CalendarDays className="size-4 shrink-0 mt-0.5 text-zinc-500" />
            <div>
              <p className="text-sm text-zinc-200">{formatDate(event.starts_at)}</p>
              {event.ends_at && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  until {new Date(event.ends_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-2.5">
              <MapPin className="size-4 shrink-0 text-zinc-500" />
              <a
                href={event.location_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-200 underline decoration-zinc-700 underline-offset-2 hover:text-white hover:decoration-white transition-colors"
              >
                {event.location}
              </a>
            </div>
          )}

          {(event as Record<string, unknown>).cost ? (
            <div className="flex items-center gap-2.5">
              <span className="size-4 shrink-0 text-center text-zinc-500 font-bold text-sm">$</span>
              <p className="text-sm text-zinc-200">{(event as Record<string, unknown>).cost as string}</p>
            </div>
          ) : null}

          <div className="flex items-center gap-2.5">
            <Users className="size-4 shrink-0 text-zinc-500" />
            <p className="text-sm text-zinc-400">
              {event.rsvp_going > 0 ? (
                <><span className="font-semibold text-white">{event.rsvp_going}</span> going</>
              ) : "No RSVPs yet"}
              {event.rsvp_maybe > 0 && <>, <span className="font-semibold text-white">{event.rsvp_maybe}</span> maybe</>}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={`/api/events/${id}/ics`}
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            <CalendarPlus className="size-3.5" />
            Add to Calendar
          </a>
        </div>

        {/* Description */}
        {event.description && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {/* RSVP */}
        {myAlumniId ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Are you going?</p>
            <RsvpChips eventId={event.id} initial={event.my_rsvp} />
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">
              <Link href="/auth/login" className="font-semibold text-white hover:text-[#CC0000] transition-colors">Sign in</Link>
              {" "}to RSVP
            </p>
          </div>
        )}

        {/* Photo album */}
        <EventPhotoGallery photos={photos} myAlumniId={myAlumniId} eventCreatorId={event.creator_id} />
        {myAlumniId && <EventPhotoUploader eventId={id} />}

        {/* Attendee list */}
        <EventAttendees attendees={attendees} />

        {/* Created by */}
        <p className="text-xs text-zinc-600">
          Created by{" "}
          <Link href={`/u/${event.creator_id}`} className="hover:text-zinc-400 transition-colors">
            {event.creator_first_name} {event.creator_last_name}
          </Link>
        </p>
      </div>
    </div>
  );
}

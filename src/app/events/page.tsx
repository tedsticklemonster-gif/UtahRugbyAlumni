export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarDays, ExternalLink } from "lucide-react";
import { listEvents } from "@/actions/events";
import { EventCard } from "@/components/event-card";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Events — Utah Rugby Alumni Network" };

interface EventsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const isPast = params.tab === "past";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let myAlumniId: string | null = null;
  if (user?.email) {
    const admin = createAdminClient();
    const { data } = await admin.from("alumni").select("id").eq("email", user.email).single();
    myAlumniId = data?.id ?? null;
  }

  let events: Awaited<ReturnType<typeof listEvents>> = [];
  try {
    events = await listEvents({ includePast: isPast });
  } catch {
    // events table not yet migrated
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
              <CalendarDays className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Events</h1>
              <p className="text-sm text-zinc-500">Reunions, watch parties &amp; meetups</p>
            </div>
          </div>
          <Link
            href="/schedule"
            className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-white transition-colors"
          >
            Game schedule
            <ExternalLink className="size-3" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 w-fit">
          <Link
            href="/events"
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
              !isPast ? "bg-[#CC0000] text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Upcoming
          </Link>
          <Link
            href="/events?tab=past"
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
              isPast ? "bg-[#CC0000] text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Past
          </Link>
        </div>
      </div>

      <div className="px-5 py-6 md:px-10 space-y-3 max-w-2xl">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CC0000]/15">
              <CalendarDays className="size-7 text-[#CC0000]" />
            </div>
            <h2 className="text-base font-bold text-white">
              {isPast ? "No past events" : "No upcoming events"}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400 max-w-xs mx-auto">
              {isPast
                ? "Past reunions and watch parties will show up here."
                : "Use the + button to create a watch party, reunion, or meetup."}
            </p>
          </div>
        ) : (
          events.map((event) => (
            <EventCard key={event.id} event={event} myAlumniId={myAlumniId} />
          ))
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { listEvents } from "@/actions/events";
import { EventCard } from "@/components/event-card";
import { SeasonSchedule } from "@/components/events/season-schedule";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Events — Utah Rugby Alumni Network" };

interface EventsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

const TABS = [
  { key: "upcoming", href: "/events", label: "Upcoming" },
  { key: "past", href: "/events?tab=past", label: "Past" },
  { key: "season", href: "/events?tab=season", label: "Season" },
] as const;

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const tab =
    params.tab === "past" ? "past" : params.tab === "season" ? "season" : "upcoming";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let myAlumniId: string | null = null;
  if (user?.email) {
    const admin = createAdminClient();
    const { data } = await admin.from("alumni").select("id").eq("email", user.email).single();
    myAlumniId = data?.id ?? null;
  }

  let events: Awaited<ReturnType<typeof listEvents>> = [];
  if (tab !== "season") {
    try {
      events = await listEvents({ includePast: tab === "past" });
    } catch {
      // events table not yet migrated
    }
  }

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <div className="border-b border-white/6 px-5 py-6 md:px-10">
        <span className="block h-[2px] w-10 bg-utah-red" />
        <p className="text-eyebrow mt-2">Games &amp; Gatherings</p>
        <h1 className="text-title-1 mt-1 text-white">Events</h1>
        <p className="mt-1.5 text-body-sm text-zinc-500">
          {tab === "season"
            ? "Games, fixtures & practice schedule"
            : "Reunions, watch parties & meetups"}
        </p>

        {/* Tabs */}
        <div className="mt-5 flex w-fit gap-1 surface-card p-1">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                tab === t.key ? "bg-utah-red text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-2xl space-y-3 px-5 py-6 md:px-10">
        {tab === "season" ? (
          <SeasonSchedule />
        ) : events.length === 0 ? (
          <div className="surface-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-utah-red/15">
              <CalendarDays className="size-7 text-utah-red" />
            </div>
            <h2 className="text-base font-bold text-white">
              {tab === "past" ? "No past events" : "No upcoming events"}
            </h2>
            <p className="mx-auto mt-1.5 max-w-xs text-sm text-zinc-400">
              {tab === "past"
                ? "Past reunions and watch parties will show up here."
                : myAlumniId
                  ? "Use the + button to create a watch party, reunion, or meetup."
                  : "Sign in to see and create watch parties, reunions, and meetups."}
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

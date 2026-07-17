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
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
            <CalendarDays className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Events</h1>
            <p className="text-sm text-zinc-500">
              {tab === "season"
                ? "Games, fixtures & practice schedule"
                : "Reunions, watch parties & meetups"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex w-fit gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
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

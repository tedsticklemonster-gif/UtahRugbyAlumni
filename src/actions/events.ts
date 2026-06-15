"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listUpcomingGames as listUpcomingDbGames } from "@/actions/schedule";
import { notifyNewEvent } from "@/actions/event-emails";
import { postToTelegram } from "@/lib/telegram";
import { sendPushToAlumni, sendPushToMany } from "@/lib/push";
import { generateOccurrences } from "@/lib/recurrence";
import type { RecurrenceRule } from "@/lib/recurrence";

export type AlumniEvent = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  location_url: string | null;
  photo_url: string | null;
  kind: string;
  creator_id: string;
  creator_first_name: string;
  creator_last_name: string;
  rsvp_going: number;
  rsvp_maybe: number;
  my_rsvp: "going" | "maybe" | "no" | null;
  series_id: string | null;
  recurrence_rule: string | null;
};

export type UpcomingItem =
  | { source: "event"; id: string; title: string; date: string; sort_date: string; kind: string; rsvp_going: number; my_rsvp: "going" | "maybe" | "no" | null }
  | { source: "game"; opponent: string; date: string; sort_date: string; location: "Home" | "Away" | "Neutral" };

async function getMyAlumniId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("alumni").select("id").eq("email", user.email).maybeSingle();
  return data?.id ?? null;
}

export async function listEvents(options?: { includePast?: boolean }): Promise<AlumniEvent[]> {
  const admin = createAdminClient();
  const myAlumniId = await getMyAlumniId();
  const includePast = options?.includePast ?? false;

  let query = admin
    .from("events")
    .select("id, title, description, starts_at, ends_at, location, location_url, photo_url, kind, creator_id, series_id, recurrence_rule")
    .is("deleted_at", null);

  if (includePast) {
    query = query.lt("starts_at", new Date().toISOString()).order("starts_at", { ascending: false });
  } else {
    query = query.gte("starts_at", new Date().toISOString()).order("starts_at", { ascending: true });
  }

  const { data: events } = await query.limit(50);

  if (!events?.length) return [];

  const eventIds = events.map((e) => e.id);
  const creatorIds = [...new Set(events.map((e) => e.creator_id))];

  const [creatorsRes, rsvpsRes] = await Promise.all([
    admin.from("alumni").select("id, first_name, last_name").in("id", creatorIds),
    admin.from("event_rsvps").select("event_id, alumni_id, status").in("event_id", eventIds),
  ]);

  const creators = creatorsRes.data ?? [];
  const rsvps = rsvpsRes.data ?? [];

  return events.map((e) => {
    const creator = creators.find((c) => c.id === e.creator_id);
    const eventRsvps = rsvps.filter((r) => r.event_id === e.id);
    const myRsvp = myAlumniId ? (eventRsvps.find((r) => r.alumni_id === myAlumniId)?.status as AlumniEvent["my_rsvp"]) ?? null : null;
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
      location: e.location,
      location_url: e.location_url,
      photo_url: e.photo_url,
      kind: e.kind,
      creator_id: e.creator_id,
      creator_first_name: creator?.first_name ?? "Alumni",
      creator_last_name: creator?.last_name ?? "",
      rsvp_going: eventRsvps.filter((r) => r.status === "going").length,
      rsvp_maybe: eventRsvps.filter((r) => r.status === "maybe").length,
      my_rsvp: myRsvp,
      series_id: e.series_id ?? null,
      recurrence_rule: e.recurrence_rule ?? null,
    };
  });
}

export async function getEvent(id: string): Promise<AlumniEvent | null> {
  const admin = createAdminClient();
  const myAlumniId = await getMyAlumniId();

  const { data: e } = await admin
    .from("events")
    .select("id, title, description, starts_at, ends_at, location, location_url, photo_url, kind, creator_id, series_id, recurrence_rule")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!e) return null;

  const [creatorRes, rsvpsRes] = await Promise.all([
    admin.from("alumni").select("id, first_name, last_name").eq("id", e.creator_id).maybeSingle(),
    admin.from("event_rsvps").select("alumni_id, status").eq("event_id", id),
  ]);

  const creator = creatorRes.data;
  const rsvps = rsvpsRes.data ?? [];
  const myRsvp = myAlumniId ? (rsvps.find((r) => r.alumni_id === myAlumniId)?.status as AlumniEvent["my_rsvp"]) ?? null : null;

  return {
    id: e.id,
    title: e.title,
    description: e.description,
    starts_at: e.starts_at,
    ends_at: e.ends_at,
    location: e.location,
    location_url: e.location_url,
    photo_url: e.photo_url,
    kind: e.kind,
    creator_id: e.creator_id,
    creator_first_name: creator?.first_name ?? "Alumni",
    creator_last_name: creator?.last_name ?? "",
    rsvp_going: rsvps.filter((r) => r.status === "going").length,
    rsvp_maybe: rsvps.filter((r) => r.status === "maybe").length,
    my_rsvp: myRsvp,
    series_id: e.series_id ?? null,
    recurrence_rule: e.recurrence_rule ?? null,
  };
}

export async function createEventAction(formData: FormData): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: alumni } = await admin.from("alumni").select("id, verified").eq("email", user.email).maybeSingle();
  if (!alumni?.verified) return { error: "Account not verified" };

  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required" };

  const starts_at = formData.get("starts_at") as string;
  if (!starts_at) return { error: "Date & time is required" };

  const recurrenceRule = (formData.get("recurrence_rule") as string) || null;
  const recurrenceEnd = (formData.get("recurrence_end") as string) || null;

  const { data, error } = await admin.from("events").insert({
    creator_id: alumni.id,
    title,
    description: (formData.get("description") as string)?.trim() || null,
    starts_at,
    ends_at: (formData.get("ends_at") as string) || null,
    location: (formData.get("location") as string)?.trim() || null,
    kind: (formData.get("kind") as string) || "social",
    recurrence_rule: recurrenceRule,
    recurrence_end: recurrenceEnd,
  }).select("id").single();

  if (error) return { error: error.message };

  // Generate initial recurring instances (up to 3 months out)
  if (recurrenceRule) {
    const endsAt = (formData.get("ends_at") as string) || null;
    const now = new Date();
    const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const until = recurrenceEnd ? new Date(Math.min(new Date(recurrenceEnd).getTime(), threeMonths.getTime())) : threeMonths;

    const occurrences = generateOccurrences(
      new Date(starts_at),
      endsAt ? new Date(endsAt) : null,
      recurrenceRule as RecurrenceRule,
      now,
      until
    );

    for (const occ of occurrences) {
      await admin.from("events").insert({
        creator_id: alumni.id,
        title,
        description: (formData.get("description") as string)?.trim() || null,
        starts_at: occ.starts_at.toISOString(),
        ends_at: occ.ends_at?.toISOString() ?? null,
        location: (formData.get("location") as string)?.trim() || null,
        kind: (formData.get("kind") as string) || "social",
        series_id: data.id,
      });
    }
  }

  revalidatePath("/events");

  // In-app notification for all verified alumni about the new event
  const { data: allAlumni } = await admin
    .from("alumni")
    .select("id")
    .eq("verified", true)
    .neq("id", alumni.id);
  if (allAlumni?.length) {
    const eventPreview = title.length > 80 ? title.slice(0, 80) + "…" : title;
    await admin.from("notifications").insert(
      allAlumni.map((a) => ({
        recipient_id: a.id,
        actor_id: alumni.id,
        kind: "new_event",
        entity_type: "event",
        entity_id: data.id,
        body_preview: eventPreview,
      }))
    ).then(() => {}, () => {});

    const appUrlForPush = process.env.NEXT_PUBLIC_APP_URL ?? "https://alumni.utah-rugby.com";
    sendPushToMany(allAlumni.map((a) => a.id), {
      title: "New event: " + eventPreview,
      body: "Tap to see details and RSVP",
      url: appUrlForPush + "/events/" + data.id,
    }).catch(() => {});
  }

  // Fire-and-forget: notify alumni about the new event (email)
  void notifyNewEvent(data.id);

  // Auto-post event to Alumni Wall
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://alumni.utah-rugby.com";
  const eventUrl = `${appUrl}/events/${data.id}`;
  const location = (formData.get("location") as string)?.trim() || null;
  const dateLabel = new Date(starts_at).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const postBody = `New event: ${title}\n${dateLabel}${location ? ` · ${location}` : ""}\n\nRSVP → ${eventUrl}`;
  await admin.from("posts").insert({ author_id: alumni.id, body: postBody });
  revalidatePath("/");

  // Push to Telegram channel (fire-and-forget)
  const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const telegramLocation = location ? `\n${escHtml(location)}` : "";
  try {
    await postToTelegram(
      `<b>New Event:</b> ${escHtml(title)}\n${escHtml(dateLabel)}${telegramLocation}\n\n${eventUrl}`
    );
  } catch {
    // Telegram post is non-critical; don't block event creation
  }

  return { id: data.id };
}

export async function rsvpAction(eventId: string, status: "going" | "maybe" | "no" | null): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: alumni } = await admin.from("alumni").select("id, first_name, last_name").eq("email", user.email).maybeSingle();
  if (!alumni) return { error: "Not found" };

  if (status === null) {
    await admin.from("event_rsvps").delete().eq("event_id", eventId).eq("alumni_id", alumni.id);
  } else {
    await admin.from("event_rsvps").upsert({ event_id: eventId, alumni_id: alumni.id, status }, { onConflict: "event_id,alumni_id" });

    // Notify event creator about RSVP (going/maybe only, skip self)
    if (status === "going" || status === "maybe") {
      const { data: event } = await admin.from("events").select("creator_id, title").eq("id", eventId).maybeSingle();
      if (event?.creator_id && event.creator_id !== alumni.id) {
        await admin.from("notifications").insert({
          recipient_id: event.creator_id,
          actor_id: alumni.id,
          kind: "rsvp",
          entity_type: "event",
          entity_id: eventId,
          body_preview: event.title,
        }).then(() => {}, () => {});
        const rsvpAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://alumni.utah-rugby.com";
        sendPushToAlumni(event.creator_id, {
          title: `${alumni.first_name} ${alumni.last_name} ${status === "going" ? "is going to" : "might come to"} ${event.title}`,
          body: "Tap to see who else is coming",
          url: rsvpAppUrl + "/events/" + eventId,
        }).catch(() => {});
      }
    }
  }

  revalidatePath(`/events/${eventId}`);
  return {};
}

export async function listUpcoming(): Promise<UpcomingItem[]> {
  const admin = createAdminClient();
  const myAlumniId = await getMyAlumniId();

  const [eventsRes, dbGames] = await Promise.all([
    admin
      .from("events")
      .select("id, title, starts_at, kind, creator_id")
      .is("deleted_at", null)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(5),
    listUpcomingDbGames().catch(() => []),
  ]);

  const events = eventsRes.data ?? [];
  const eventIds = events.map((e) => e.id);

  const rsvps = eventIds.length > 0
    ? (await admin.from("event_rsvps").select("event_id, alumni_id, status").in("event_id", eventIds)).data ?? []
    : [];

  const eventItems: UpcomingItem[] = events.map((e) => {
    const eventRsvps = rsvps.filter((r) => r.event_id === e.id);
    const myRsvp = myAlumniId ? (eventRsvps.find((r) => r.alumni_id === myAlumniId)?.status as "going" | "maybe" | "no") ?? null : null;
    return {
      source: "event" as const,
      id: e.id,
      title: e.title,
      date: new Date(e.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
      sort_date: e.starts_at,
      kind: e.kind,
      rsvp_going: eventRsvps.filter((r) => r.status === "going").length,
      my_rsvp: myRsvp,
    };
  });

  // DB games are already filtered to future + no result by listUpcomingDbGames
  const gameItems: UpcomingItem[] = dbGames
    .slice(0, 2)
    .map((g) => ({
      source: "game" as const,
      opponent: g.opponent,
      date: new Date(g.game_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      sort_date: g.game_date,
      location: g.location,
    }));

  return [...eventItems, ...gameItems]
    .sort((a, b) => {
      const da = new Date(a.sort_date).getTime() || Infinity;
      const db = new Date(b.sort_date).getTime() || Infinity;
      return da - db;
    })
    .slice(0, 6);
}

export type EventAttendee = {
  alumni_id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  status: "going" | "maybe" | "no";
};

export async function getEventAttendees(eventId: string): Promise<EventAttendee[]> {
  const admin = createAdminClient();

  const { data: rsvps } = await admin
    .from("event_rsvps")
    .select("alumni_id, status")
    .eq("event_id", eventId)
    .in("status", ["going", "maybe"]);

  if (!rsvps?.length) return [];

  const alumniIds = rsvps.map((r) => r.alumni_id);
  const { data: alumni } = await admin
    .from("alumni")
    .select("id, first_name, last_name, photo_url")
    .in("id", alumniIds);

  const alumniMap = new Map((alumni ?? []).map((a) => [a.id, a]));

  // Sort: "going" first, then "maybe", alphabetical within each group
  return rsvps
    .map((r) => {
      const a = alumniMap.get(r.alumni_id);
      return {
        alumni_id: r.alumni_id,
        first_name: a?.first_name ?? "Unknown",
        last_name: a?.last_name ?? "",
        photo_url: a?.photo_url ?? null,
        status: r.status as "going" | "maybe" | "no",
      };
    })
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "going" ? -1 : 1;
      return a.first_name.localeCompare(b.first_name);
    });
}

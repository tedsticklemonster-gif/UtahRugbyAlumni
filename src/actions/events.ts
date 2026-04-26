"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSchedule } from "@/lib/schedule";

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
};

export type UpcomingItem =
  | { source: "event"; id: string; title: string; date: string; kind: string; rsvp_going: number; my_rsvp: "going" | "maybe" | "no" | null }
  | { source: "game"; opponent: string; date: string; location: "Home" | "Away" | "Neutral" };

async function getMyAlumniId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("alumni").select("id").eq("email", user.email).single();
  return data?.id ?? null;
}

export async function listEvents(options?: { includePast?: boolean }): Promise<AlumniEvent[]> {
  const admin = createAdminClient();
  const myAlumniId = await getMyAlumniId();
  const includePast = options?.includePast ?? false;

  let query = admin
    .from("events")
    .select("id, title, description, starts_at, ends_at, location, location_url, photo_url, kind, creator_id")
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
    };
  });
}

export async function getEvent(id: string): Promise<AlumniEvent | null> {
  const admin = createAdminClient();
  const myAlumniId = await getMyAlumniId();

  const { data: e } = await admin
    .from("events")
    .select("id, title, description, starts_at, ends_at, location, location_url, photo_url, kind, creator_id")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!e) return null;

  const [creatorRes, rsvpsRes] = await Promise.all([
    admin.from("alumni").select("id, first_name, last_name").eq("id", e.creator_id).single(),
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
  };
}

export async function createEventAction(formData: FormData): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: alumni } = await admin.from("alumni").select("id, verified").eq("email", user.email).single();
  if (!alumni?.verified) return { error: "Account not verified" };

  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required" };

  const starts_at = formData.get("starts_at") as string;
  if (!starts_at) return { error: "Date & time is required" };

  const { data, error } = await admin.from("events").insert({
    creator_id: alumni.id,
    title,
    description: (formData.get("description") as string)?.trim() || null,
    starts_at,
    ends_at: (formData.get("ends_at") as string) || null,
    location: (formData.get("location") as string)?.trim() || null,
    kind: (formData.get("kind") as string) || "social",
  }).select("id").single();

  if (error) return { error: error.message };
  revalidatePath("/events");
  return { id: data.id };
}

export async function rsvpAction(eventId: string, status: "going" | "maybe" | "no" | null): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: alumni } = await admin.from("alumni").select("id").eq("email", user.email).single();
  if (!alumni) return { error: "Not found" };

  if (status === null) {
    await admin.from("event_rsvps").delete().eq("event_id", eventId).eq("alumni_id", alumni.id);
  } else {
    await admin.from("event_rsvps").upsert({ event_id: eventId, alumni_id: alumni.id, status }, { onConflict: "event_id,alumni_id" });
  }

  revalidatePath(`/events/${eventId}`);
  return {};
}

export async function listUpcoming(): Promise<UpcomingItem[]> {
  const admin = createAdminClient();
  const myAlumniId = await getMyAlumniId();

  const [eventsRes, scheduleData] = await Promise.all([
    admin
      .from("events")
      .select("id, title, starts_at, kind, creator_id")
      .is("deleted_at", null)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(5),
    fetchSchedule(),
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
      kind: e.kind,
      rsvp_going: eventRsvps.filter((r) => r.status === "going").length,
      my_rsvp: myRsvp,
    };
  });

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const gameItems: UpcomingItem[] = (scheduleData?.games ?? [])
    .filter((g) => {
      if (g.result) return false;
      if (!g.date) return true;
      const d = new Date(g.date);
      return !isNaN(d.getTime()) && d >= now;
    })
    .slice(0, 2)
    .map((g) => ({ source: "game" as const, opponent: g.opponent, date: g.date, location: g.location }));

  return [...eventItems, ...gameItems]
    .sort((a, b) => {
      const da = a.source === "event" ? new Date(a.date).getTime() : Infinity;
      const db = b.source === "event" ? new Date(b.date).getTime() : Infinity;
      return da - db;
    })
    .slice(0, 6);
}

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://utah-rugby-alumni.vercel.app";

function toICSDate(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: event } = await admin
    .from("events")
    .select("id, title, description, starts_at, ends_at, location, kind")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const dtStart = toICSDate(event.starts_at);
  // Default to 2 hours if no end time
  const dtEnd = event.ends_at
    ? toICSDate(event.ends_at)
    : toICSDate(new Date(new Date(event.starts_at).getTime() + 2 * 60 * 60 * 1000).toISOString());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Utah Rugby Alumni//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@utah-rugby-alumni.vercel.app`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(event.title)}`,
    ...(event.description ? [`DESCRIPTION:${escapeICS(event.description)}`] : []),
    ...(event.location ? [`LOCATION:${escapeICS(event.location)}`] : []),
    `URL:${APP_URL}/events/${event.id}`,
    `STATUS:CONFIRMED`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const ics = lines.join("\r\n");
  const filename = event.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-").toLowerCase();

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.ics"`,
    },
  });
}

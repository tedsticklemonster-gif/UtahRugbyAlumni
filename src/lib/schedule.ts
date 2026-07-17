import { createAdminClient } from "@/lib/supabase/admin";

const SCHEDULE_URL = "https://www.utah-rugby.com/new-page-2";

export type Game = {
  opponent: string;
  date: string;
  location: "Home" | "Away" | "Neutral";
  result?: "Win" | "Loss" | "Draw";
  score?: string;
  manOfMatch?: string;
};

export type ScheduleData = {
  games: Game[];
  practiceLines: string[];
};

export function parseGameDate(d: string): Date | null {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : new Date(t);
}

export function pickNextGame(games: Game[], nowMs: number): Game | null {
  const upcoming = games
    .map((g) => ({ g, t: parseGameDate(g.date)?.getTime() ?? null }))
    .filter((x) => x.t !== null && x.t! >= nowMs && !x.g.result)
    .sort((a, b) => a.t! - b.t!);
  return upcoming.length > 0 ? upcoming[0].g : null;
}

export function formatGameDateParts(d: string) {
  const date = parseGameDate(d);
  if (!date) return { weekday: "—", day: "—", month: d || "TBD" };
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
    day: String(date.getDate()),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
}

export function daysUntil(d: string, nowMs: number): number | null {
  const date = parseGameDate(d);
  if (!date) return null;
  const ms = date.getTime() - nowMs;
  return ms < 0 ? 0 : Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/**
 * Primary source: admin-managed games from the database.
 * Fallback: scrape from utah-rugby.com (kept for backwards compat but unreliable).
 */
export async function fetchSchedule(): Promise<ScheduleData | null> {
  // Try DB first
  const dbGames = await fetchDbGames();
  if (dbGames.length > 0) {
    return { games: dbGames, practiceLines: [] };
  }

  // Fallback to web scraping
  return fetchScheduleFromWeb();
}

async function fetchDbGames(): Promise<Game[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("game_schedule")
      .select("opponent, game_date, location, result, score, man_of_match")
      .order("game_date", { ascending: true });

    if (!data?.length) return [];

    return data.map((g) => ({
      opponent: g.opponent,
      date: new Date(g.game_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      location: g.location as Game["location"],
      result: (g.result as Game["result"]) ?? undefined,
      score: g.score ?? undefined,
      manOfMatch: g.man_of_match ?? undefined,
    }));
  } catch {
    return [];
  }
}

async function fetchScheduleFromWeb(): Promise<ScheduleData | null> {
  try {
    const res = await fetch(SCHEDULE_URL, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/&#\d+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const sections = text.split(/Utah Utes vs /i);
    const games: Game[] = [];
    const MONTHS =
      "January|February|March|April|May|June|July|August|September|October|November|December";

    for (let i = 1; i < sections.length; i++) {
      const sec = sections[i];

      const opponentMatch = sec.match(
        new RegExp(`^([A-Z][A-Za-z &]+?)\\s+(?:${MONTHS}|Home|Away)`)
      );
      if (!opponentMatch) continue;
      const opponent = opponentMatch[1].trim();

      const dateMatch = sec.match(
        new RegExp(`(${MONTHS})\\s+\\d{1,2},?\\s*\\d{4}`)
      );
      const date = dateMatch ? dateMatch[0] : "";

      const locMatch = sec.match(/(Home|Away|Neutral)\s+Game/i);
      const location = (locMatch?.[1] as Game["location"]) ?? "Away";

      const resultMatch = sec.match(/(Win|Loss)\s+(\d+-\d+)/i);
      const result = resultMatch ? (resultMatch[1] as "Win" | "Loss") : undefined;
      const score = resultMatch ? resultMatch[2] : undefined;

      const momMatch = sec.match(/Man of Match[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/);
      const manOfMatch = momMatch ? momMatch[1] : undefined;

      games.push({ opponent, date, location, result, score, manOfMatch });
    }

    const practiceSection = text.match(/Practice Schedule([\s\S]{0,800}?)(?=Points|$)/i);
    const practiceLines: string[] = [];
    if (practiceSection) {
      const lines = practiceSection[1]
        .split(/(?=[A-Z][a-z]+(day))/)
        .map((l) => l.trim())
        .filter((l) => l.length > 8 && /\d/.test(l));
      practiceLines.push(...lines.slice(0, 6));
    }

    return games.length > 0 ? { games, practiceLines } : null;
  } catch {
    return null;
  }
}

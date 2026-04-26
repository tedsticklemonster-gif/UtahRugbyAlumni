import Link from "next/link";
import { ExternalLink, CalendarDays, MapPin, Trophy, Clock } from "lucide-react";
import { fetchSchedule, type Game } from "@/lib/schedule";

export const metadata = { title: "Schedule" };

const SCHEDULE_URL = "https://www.utah-rugby.com/new-page-2";

function isPastDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && d < new Date();
}

function resultBadge(game: Game) {
  if (!game.result) {
    const past = game.date && isPastDate(game.date);
    return past ? (
      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
        Past
      </span>
    ) : (
      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
        Upcoming
      </span>
    );
  }
  const isWin = game.result === "Win";
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        isWin
          ? "bg-emerald-900/40 text-emerald-400"
          : "bg-red-900/40 text-red-400"
      }`}
    >
      {game.result} {game.score}
    </span>
  );
}

export default async function SchedulePage() {
  const data = await fetchSchedule();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
            <CalendarDays className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Schedule
            </h1>
            <p className="text-sm text-zinc-500">
              Games, tournaments &amp; alumni events
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-6 md:px-10">
        {data ? (
          <>
            {/* Fixtures */}
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                2026 Fixtures &amp; Results
              </p>
              <div className="space-y-2">
                {data.games.map((game, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-white">
                          Utah Utes{" "}
                          <span className="font-normal text-zinc-400">vs</span>{" "}
                          {game.opponent}
                        </p>
                        {game.date && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                            <Clock className="size-3 shrink-0" />
                            {game.date}
                          </p>
                        )}
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                          <MapPin className="size-3 shrink-0" />
                          {game.location} Game
                        </p>
                        {game.manOfMatch && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                            <Trophy className="size-3 shrink-0" />
                            MoM: {game.manOfMatch}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">{resultBadge(game)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice schedule */}
            {data.practiceLines.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Practice Schedule
                </p>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-1.5">
                  {data.practiceLines.map((line, i) => (
                    <p key={i} className="text-sm text-zinc-300">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Official site link */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-xs text-zinc-400">
                Schedule data may lag — see the official site for the latest fixtures and results.
              </p>
              <a
                href={SCHEDULE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
              >
                View full schedule on utah-rugby.com
                <ExternalLink className="size-3" />
              </a>
            </div>
          </>
        ) : (
          /* Soft landing fallback */
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm font-semibold text-white">
              Schedule temporarily unavailable
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              We couldn&apos;t load the schedule right now. View it directly on
              the main Utah Rugby site.
            </p>
            <a
              href={SCHEDULE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
            >
              View on utah-rugby.com
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

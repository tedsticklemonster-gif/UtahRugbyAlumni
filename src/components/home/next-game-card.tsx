import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatGameDateParts, daysUntil, type Game } from "@/lib/schedule";

/** Compact next-match card for the member home. */
export function NextGameCard({ game, nowMs }: { game: Game | null; nowMs: number }) {
  if (!game) return null;

  const d = formatGameDateParts(game.date);
  const days = daysUntil(game.date, nowMs);

  return (
    <div className="px-4 pt-5">
      <Link
        href="/events?tab=season"
        className="group flex items-stretch gap-4 border border-zinc-800 bg-surface-0 p-4 transition-colors hover:border-zinc-600"
      >
        <div className="flex shrink-0 flex-col items-center justify-center border-r border-zinc-900 pr-4">
          <p className="text-eyebrow text-3xs text-zinc-500">{d.weekday}</p>
          <p className="text-display text-3xl leading-none text-white">{d.day}</p>
          <p className="text-eyebrow text-3xs text-utah-red">{d.month}</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-eyebrow text-3xs text-utah-red">Next Match</p>
          <p className="text-display mt-0.5 truncate text-xl leading-none text-white">
            vs {game.opponent}
          </p>
          <p className="text-eyebrow mt-1.5 text-3xs text-zinc-500">
            {game.location}
            {days !== null && days <= 30 && (
              <span className="text-utah-red">
                {" · "}
                {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days out`}
              </span>
            )}
          </p>
        </div>
        <ArrowRight className="size-4 self-center text-zinc-700 transition-colors group-hover:text-white" />
      </Link>
    </div>
  );
}

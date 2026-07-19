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
        className="group flex items-stretch gap-4 rounded-2xl border border-border bg-surface-1 p-5 shadow-card transition-colors hover:border-border-strong"
      >
        <div className="flex shrink-0 flex-col items-center justify-center border-r border-white/8 pr-5">
          <p className="text-eyebrow">{d.weekday}</p>
          <p className="text-display text-4xl leading-none text-white">{d.day}</p>
          <p className="text-eyebrow text-utah-red">{d.month}</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-eyebrow text-utah-red">Next Match</p>
          <p className="text-display mt-1 truncate text-2xl leading-none text-white">
            vs {game.opponent}
          </p>
          <p className="mt-1.5 text-sm text-zinc-400">
            {game.location}
            {days !== null && days <= 30 && (
              <span className="font-semibold text-utah-red">
                {" · "}
                {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days out`}
              </span>
            )}
          </p>
        </div>
        <ArrowRight className="size-5 self-center text-zinc-600 transition-colors group-hover:text-white" />
      </Link>
    </div>
  );
}

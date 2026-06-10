"use client";

import { useState, useTransition } from "react";
import {
  createScheduleGame,
  updateScheduleGame,
  deleteScheduleGame,
  type ScheduleGame,
} from "@/actions/schedule";

function formatLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function GameForm({
  game,
  onDone,
}: {
  game?: ScheduleGame;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = game
        ? await updateScheduleGame(game.id, fd)
        : await createScheduleGame(fd);
      if (res.error) {
        setError(res.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">
        {game ? "Edit Game" : "Add Game"}
      </h3>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Opponent *
          </label>
          <input
            name="opponent"
            defaultValue={game?.opponent ?? ""}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="e.g. BYU Cougars"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Game Date & Time *
          </label>
          <input
            name="game_date"
            type="datetime-local"
            defaultValue={game?.game_date ? formatLocalDatetime(game.game_date) : ""}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Location
          </label>
          <select
            name="location"
            defaultValue={game?.location ?? "Home"}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="Home">Home</option>
            <option value="Away">Away</option>
            <option value="Neutral">Neutral</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Result
          </label>
          <select
            name="result"
            defaultValue={game?.result ?? ""}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Not played yet</option>
            <option value="Win">Win</option>
            <option value="Loss">Loss</option>
            <option value="Draw">Draw</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Score
          </label>
          <input
            name="score"
            defaultValue={game?.score ?? ""}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="e.g. 34-12"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Man of Match
          </label>
          <input
            name="man_of_match"
            defaultValue={game?.man_of_match ?? ""}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="e.g. John Smith"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Notes
        </label>
        <input
          name="notes"
          defaultValue={game?.notes ?? ""}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Optional notes (e.g. tournament name)"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {pending ? "Saving..." : game ? "Update" : "Add Game"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function ScheduleAdmin({ games }: { games: ScheduleGame[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const now = new Date();
  const upcoming = games.filter(
    (g) => !g.result && new Date(g.game_date) >= now
  );
  const past = games.filter(
    (g) => g.result || new Date(g.game_date) < now
  );

  function handleDelete(id: string) {
    if (!confirm("Delete this game?")) return;
    startTransition(async () => {
      await deleteScheduleGame(id);
    });
  }

  function renderGame(g: ScheduleGame) {
    if (editingId === g.id) {
      return (
        <div key={g.id} className="mb-2">
          <GameForm game={g} onDone={() => setEditingId(null)} />
        </div>
      );
    }

    const d = new Date(g.game_date);
    const dateStr = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    return (
      <div
        key={g.id}
        className="flex items-center justify-between rounded-lg border px-4 py-3"
      >
        <div className="min-w-0">
          <p className="font-medium text-sm">
            vs {g.opponent}
            {g.result && (
              <span
                className={`ml-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                  g.result === "Win"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : g.result === "Draw"
                      ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {g.result} {g.score}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {dateStr} at {timeStr} &middot; {g.location}
            {g.man_of_match ? ` · MoM: ${g.man_of_match}` : ""}
            {g.notes ? ` · ${g.notes}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-3">
          <button
            onClick={() => setEditingId(g.id)}
            className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(g.id)}
            disabled={pending}
            className="rounded px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add button / form */}
      {showForm ? (
        <GameForm onDone={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          + Add Game
        </button>
      )}

      {/* Upcoming */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Upcoming ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No upcoming games. Add one above.
          </p>
        ) : (
          <div className="space-y-2">
            {upcoming.map(renderGame)}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Past / Completed ({past.length})
          </h3>
          <div className="space-y-2">
            {past.map(renderGame)}
          </div>
        </div>
      )}
    </div>
  );
}

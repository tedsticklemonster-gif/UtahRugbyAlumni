"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createEventAction } from "@/actions/events";

const KIND_OPTIONS = [
  { value: "social", label: "Social" },
  { value: "watch_party", label: "Watch Party" },
  { value: "reunion", label: "Reunion" },
  { value: "practice", label: "Practice" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "networking", label: "Networking" },
  { value: "game_day", label: "Game Day" },
  { value: "other", label: "Other" },
];

const RECURRENCE_OPTIONS = [
  { value: "", label: "Does not repeat" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annually" },
];

export function EventComposer({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const [recurrence, setRecurrence] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createEventAction(fd);
      if (result.error) { setError(result.error); return; }
      setSuccess(true);
      router.refresh();
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 1500);
    });
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
          <Check className="size-6" />
        </div>
        <p className="text-sm font-bold text-white">Event created!</p>
        <p className="mt-1 text-xs text-zinc-500">It&apos;s now live on the events page.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          name="title"
          placeholder="Event title"
          required
          maxLength={120}
          className="w-full rounded-xl border border-border-strong bg-surface-2 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      <div>
        <select
          name="kind"
          defaultValue="social"
          className="w-full rounded-xl border border-border-strong bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <textarea
          name="description"
          placeholder="Details (optional)"
          rows={2}
          maxLength={1000}
          className="w-full resize-none rounded-xl border border-border-strong bg-surface-2 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Start</label>
          <input
            name="starts_at"
            type="datetime-local"
            required
            className="w-full rounded-xl border border-border-strong bg-surface-2 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">End (opt)</label>
          <input
            name="ends_at"
            type="datetime-local"
            className="w-full rounded-xl border border-border-strong bg-surface-2 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          />
        </div>
      </div>
      <p className="text-xs text-zinc-600">Times are in your local timezone</p>

      <div>
        <input
          name="location"
          placeholder="Location (optional)"
          maxLength={200}
          className="w-full rounded-xl border border-border-strong bg-surface-2 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      <div>
        <input
          name="cost"
          placeholder="Cost / ticket info (optional, e.g. $20, Free)"
          maxLength={100}
          className="w-full rounded-xl border border-border-strong bg-surface-2 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Repeats</label>
        <select
          name="recurrence_rule"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          className="w-full rounded-xl border border-border-strong bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
        >
          {RECURRENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {recurrence && (
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Repeat until (opt)</label>
          <input
            name="recurrence_end"
            type="date"
            className="w-full rounded-xl border border-border-strong bg-surface-2 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-utah-red py-2.5 text-sm font-bold text-white transition-colors hover:bg-utah-red/90 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create Event"}
      </button>
    </form>
  );
}

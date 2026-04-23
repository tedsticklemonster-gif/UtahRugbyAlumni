"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "@/actions/events";

const KIND_OPTIONS = [
  { value: "social", label: "Social" },
  { value: "watch_party", label: "Watch Party" },
  { value: "reunion", label: "Reunion" },
  { value: "practice", label: "Practice" },
  { value: "other", label: "Other" },
];

export function EventComposer({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createEventAction(fd);
      if (result.error) { setError(result.error); return; }
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          name="title"
          placeholder="Event title"
          required
          maxLength={120}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      <div>
        <select
          name="kind"
          defaultValue="social"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
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
          className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-zinc-500">Start</label>
          <input
            name="starts_at"
            type="datetime-local"
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-zinc-500">End (opt)</label>
          <input
            name="ends_at"
            type="datetime-local"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <input
          name="location"
          placeholder="Location (optional)"
          maxLength={200}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#CC0000] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#AA0000] disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create Event"}
      </button>
    </form>
  );
}

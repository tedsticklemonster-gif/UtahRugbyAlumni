"use client";

import { useState, useTransition } from "react";
import { Check, Minus, X } from "lucide-react";
import { rsvpAction } from "@/actions/events";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "going" as const, label: "Going", icon: Check },
  { value: "maybe" as const, label: "Maybe", icon: Minus },
  { value: "no" as const, label: "Can't go", icon: X },
];

export function RsvpChips({
  eventId,
  initial,
}: {
  eventId: string;
  initial: "going" | "maybe" | "no" | null;
}) {
  const [status, setStatus] = useState(initial);
  const [pending, startTransition] = useTransition();

  function handleClick(val: "going" | "maybe" | "no") {
    const next = status === val ? null : val;
    setStatus(next);
    startTransition(async () => { await rsvpAction(eventId, next); });
    navigator.vibrate?.(8);
  }

  return (
    <div className="flex gap-1.5">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = status === value;
        return (
          <button
            key={value}
            onClick={() => handleClick(value)}
            disabled={pending}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
              active
                ? value === "going"
                  ? "bg-emerald-600 text-white"
                  : value === "maybe"
                  ? "bg-amber-600 text-white"
                  : "bg-zinc-600 text-white"
                : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            )}
          >
            <Icon className="size-3" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setReactionAction } from "@/actions/feed";
import { cn } from "@/lib/utils";

const EMOJIS: Array<{ key: string; glyph: string; label: string }> = [
  { key: "like",   glyph: "👍", label: "Like"   },
  { key: "fire",   glyph: "🔥", label: "Fire"   },
  { key: "clap",   glyph: "👏", label: "Clap"   },
  { key: "muscle", glyph: "💪", label: "Strong" },
  { key: "laugh",  glyph: "😂", label: "Haha"   },
  { key: "heart",  glyph: "❤️", label: "Love"   },
];

export type ReactionSummary = { emoji: string; count: number }[];

interface ReactionPickerProps {
  postId: string;
  myAlumniId: string | null;
  myReaction: string | null;
  reactions: ReactionSummary;
  onOptimistic: (next: string | null, reactions: ReactionSummary) => void;
}

export function ReactionPicker({ postId, myAlumniId, myReaction, reactions, onOptimistic }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef(0);

  function openPicker() {
    setOpen(true);
    navigator.vibrate?.(10);
  }

  function handlePointerDown() {
    if (!myAlumniId) return;
    pressTimer.current = setTimeout(openPicker, 500);
  }

  function handlePointerUp() {
    if (!myAlumniId) return;
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    // Double-tap detection — runs in an event handler (not during render), so
    // Date.now() is safe here. Suppress the React purity lint, which can't tell
    // event handlers apart from render-time helpers defined in the component body.
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    if (now - lastTap.current < 350) {
      openPicker();
    } else {
      lastTap.current = now;
      setTimeout(() => {
        if (Date.now() - lastTap.current >= 340) {
          handleReact("like");
        }
      }, 350);
    }
  }

  function handleReact(emoji: string) {
    if (!myAlumniId) return;
    setOpen(false);
    const next = myReaction === emoji ? null : emoji;

    // Optimistic update
    const updated = [...reactions];
    if (myReaction) {
      const idx = updated.findIndex((r) => r.emoji === myReaction);
      if (idx >= 0) {
        if (updated[idx].count <= 1) updated.splice(idx, 1);
        else updated[idx] = { ...updated[idx], count: updated[idx].count - 1 };
      }
    }
    if (next) {
      const idx = updated.findIndex((r) => r.emoji === next);
      if (idx >= 0) updated[idx] = { ...updated[idx], count: updated[idx].count + 1 };
      else updated.push({ emoji: next, count: 1 });
    }

    onOptimistic(next, updated);
    startTransition(async () => { await setReactionAction(postId, next); });
    navigator.vibrate?.(8);
  }

  // Close on outside click
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const topEmojis = [...reactions].sort((a, b) => b.count - a.count).slice(0, 3);
  const total = reactions.reduce((s, r) => s + r.count, 0);
  const myGlyph = myReaction ? EMOJIS.find((e) => e.key === myReaction)?.glyph : null;

  return (
    <div className="relative" ref={pickerRef}>
      {/* Emoji picker popup */}
      {open && (
        <div className="absolute bottom-12 left-0 z-50 flex gap-1 rounded-2xl border border-border-strong bg-surface-1 px-2 py-2 shadow-xl">
          {EMOJIS.map(({ key, glyph, label }) => (
            <button
              key={key}
              onClick={() => handleReact(key)}
              title={label}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl text-2xl transition-transform hover:scale-125 active:scale-110",
                myReaction === key && "bg-zinc-700"
              )}
            >
              {glyph}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Main reaction button */}
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => { if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; } }}
          disabled={!myAlumniId || pending}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors select-none",
            myReaction
              ? "text-utah-red"
              : "text-zinc-400 hover:text-zinc-200 disabled:cursor-default"
          )}
        >
          <span className="text-lg leading-none">{myGlyph ?? "👍"}</span>
          <span className="hidden sm:inline">{myReaction ? "Reacted" : "React"}</span>
        </button>

        {/* Reaction summary */}
        {total > 0 && (
          <div className="flex items-center gap-1.5">
            {topEmojis.map((r) => {
              const em = EMOJIS.find((e) => e.key === r.emoji);
              return (
                <span key={r.emoji} className="flex items-center gap-0.5 text-sm text-zinc-400">
                  <span>{em?.glyph}</span>
                  <span>{r.count}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";


export function InviteBanner({ forwardToken }: { forwardToken?: string | null }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = forwardToken
      ? `${window.location.origin}/forward/${forwardToken}`
      : `${window.location.origin}/join`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Utah Rugby Alumni Network", url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="relative overflow-hidden border-b border-utah-red/40 bg-utah-red/10 px-4 py-3">
      {/* Diagonal stripe accent */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-[0.06]"
        style={{
          background:
            "repeating-linear-gradient(135deg, white 0 1px, transparent 1px 10px)",
        }}
      />
      <div className="relative mx-auto flex max-w-2xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-eyebrow text-3xs text-utah-red`}>Grow the Network</p>
          <p className="mt-0.5 text-sm font-bold leading-snug text-white">
            Forward this to every Ute rugger in your phone.
          </p>
        </div>
        <button
          onClick={handleShare}
          className={`text-eyebrow inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-utah-red px-3 py-2 text-2xs text-white transition-colors hover:bg-utah-red/90 active:bg-utah-red/80`}
        >
          {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
          {copied ? "Copied!" : "Share"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export function CopyForwardLink({ forwardToken }: { forwardToken?: string | null }) {
  const [copied, setCopied] = useState(false);

  const slug = forwardToken || "generic";
  const forwardUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/forward/${slug}`
      : `/forward/${slug}`;

  async function handleShare() {
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (nav && "share" in nav) {
      try {
        await (nav as Navigator).share({
          title: "Utah Rugby Alumni Network",
          text: "Join the Utah Rugby Alumni Network — find teammates and stay connected.",
          url: forwardUrl,
        });
        return;
      } catch {
        // fall through to copy
      }
    }
    if (nav?.clipboard) {
      await nav.clipboard.writeText(forwardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded-lg border border-zinc-700 bg-surface-0 px-3 py-2 text-xs text-zinc-300">
        {forwardUrl}
      </code>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-utah-red px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-utah-red/90"
      >
        {copied ? (
          <>
            <Check className="size-3.5" />
            Copied
          </>
        ) : canShare ? (
          <>
            <Share2 className="size-3.5" />
            Share
          </>
        ) : (
          <>
            <Copy className="size-3.5" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}

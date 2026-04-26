"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface ShareProfileButtonProps {
  url: string;
  shareTitle: string;
  shareText: string;
}

export function ShareProfileButton({
  url,
  shareTitle,
  shareText,
}: ShareProfileButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = { title: shareTitle, text: shareText, url };
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (nav && "share" in nav) {
      try {
        await (nav as Navigator).share(shareData);
        return;
      } catch {
        // fall through to copy
      }
    }
    if (nav?.clipboard) {
      await nav.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-[#CC0000] hover:text-white"
      aria-label="Share profile"
    >
      {copied ? (
        <>
          <Check className="size-4 text-emerald-400" />
          Copied
        </>
      ) : (
        <>
          {typeof navigator !== "undefined" && "share" in navigator ? (
            <Share2 className="size-4" />
          ) : (
            <Copy className="size-4" />
          )}
          Share
        </>
      )}
    </button>
  );
}

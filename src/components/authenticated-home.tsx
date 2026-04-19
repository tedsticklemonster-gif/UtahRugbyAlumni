"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { FeedClient } from "@/app/feed/feed-client";
import type { FeedPost } from "@/actions/feed";

interface AuthenticatedHomeProps {
  posts: FeedPost[];
  cursor: string | null;
  myAlumniId: string | null;
}

export function AuthenticatedHome({ posts, cursor, myAlumniId }: AuthenticatedHomeProps) {
  return (
    <div>
      <InviteBanner />
      <FeedClient initialPosts={posts} initialCursor={cursor} myAlumniId={myAlumniId} />
    </div>
  );
}

function InviteBanner() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/join`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Utah Rugby Alumni Network", url });
      } catch {
        // user cancelled share sheet
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="border-b border-[#CC0000]/30 bg-[#CC0000]/10 px-4 py-3">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">
            Grow the network
          </p>
          <p className="mt-0.5 text-sm font-semibold leading-snug text-white">
            Forward this to every Ute rugger in your phone.
          </p>
        </div>
        <button
          onClick={handleShare}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#CC0000] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#AA0000] active:bg-[#880000]"
        >
          {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
          {copied ? "Copied!" : "Share"}
        </button>
      </div>
    </div>
  );
}

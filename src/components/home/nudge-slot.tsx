"use client";

import { useState, useSyncExternalStore } from "react";
import { Share2, Check, X } from "lucide-react";
import { ProfileCompletion, type ProfileFields } from "@/components/home/profile-completion";

const TELEGRAM_INVITE = "https://t.me/+ajaqw-YQ1ZsxYjQx";
const TELEGRAM_DISMISS_KEY = "telegram_banner_dismissed";

const subscribeStorage = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

/** One nudge at a time. The invite, Telegram, and profile-completion cards all
 * compete for the same slot and rotate daily, so the home page never stacks
 * promos between the member and the feed. */
export function NudgeSlot({
  forwardToken,
  profileFields,
  nowMs,
}: {
  forwardToken?: string | null;
  profileFields: ProfileFields | null;
  nowMs: number;
}) {
  // Session-local override so dismissing takes effect immediately (the storage
  // event only fires across tabs). Server snapshot says "dismissed" so SSR
  // renders a stable candidate list and hydration stays consistent.
  const [localDismiss, setLocalDismiss] = useState(false);
  const storedDismiss = useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem(TELEGRAM_DISMISS_KEY) === "1",
    () => true,
  );
  const telegramDismissed = storedDismiss || localDismiss;

  const profileIncomplete =
    profileFields !== null && Object.values(profileFields).some((v) => !v);

  const candidates: ("profile" | "telegram" | "invite")[] = [];
  if (profileIncomplete) candidates.push("profile");
  if (!telegramDismissed) candidates.push("telegram");
  candidates.push("invite");

  const day = Math.floor(nowMs / 86_400_000);
  const active = candidates[day % candidates.length];

  return (
    <div className="px-4 pt-5">
      {active === "profile" && profileFields && (
        <ProfileCompletion fields={profileFields} />
      )}
      {active === "telegram" && (
        <TelegramNudge
          onDismiss={() => {
            localStorage.setItem(TELEGRAM_DISMISS_KEY, "1");
            setLocalDismiss(true);
          }}
        />
      )}
      {active === "invite" && <InviteNudge forwardToken={forwardToken} />}
    </div>
  );
}

function TelegramNudge({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="rounded-2xl border border-telegram/30 bg-telegram/10 px-4 py-4">
      <div className="flex items-start gap-3">
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-7 shrink-0 text-telegram mt-0.5" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-white">Join the Telegram</p>
          <p className="text-body-sm text-zinc-400 mt-1">
            The group chat gets instant alerts for posts, events, and new
            members.
          </p>
          <a
            href={TELEGRAM_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-telegram px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-telegram/85"
          >
            Join Telegram
          </a>
        </div>
        <button
          onClick={onDismiss}
          className="p-1.5 text-zinc-500 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}

function InviteNudge({ forwardToken }: { forwardToken?: string | null }) {
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
    <div className="relative overflow-hidden rounded-2xl border border-utah-red/40 bg-utah-red/10 px-4 py-4">
      {/* Diagonal stripe accent */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-[0.06]"
        style={{
          background:
            "repeating-linear-gradient(135deg, white 0 1px, transparent 1px 10px)",
        }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-eyebrow text-utah-red">Grow the Network</p>
          <p className="mt-1 text-base font-bold leading-snug text-white">
            Forward this to every Ute rugger in your phone.
          </p>
        </div>
        <button
          onClick={handleShare}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-utah-red px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-utah-red/90 active:bg-utah-red/80"
        >
          {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
          {copied ? "Copied!" : "Share"}
        </button>
      </div>
    </div>
  );
}

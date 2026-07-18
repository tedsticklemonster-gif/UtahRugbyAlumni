"use client";

import { useState, useTransition, useEffect, useRef, useSyncExternalStore } from "react";
import { getPostsAction, type FeedPost } from "@/actions/feed";
import { PostCard } from "@/components/post-card";
import { CreatePost } from "@/components/create-post";
import { UpcomingRail } from "@/components/home/upcoming-rail";
import { AnnouncementsCard } from "@/components/home/announcements-card";
import { CommunityStrip, type EraMember } from "@/components/home/community-strip";
import { NextGameCard } from "@/components/home/next-game-card";
import Link from "next/link";
import { Briefcase, X } from "lucide-react";
import { InviteBanner } from "@/components/home/invite-banner";
import { ProfileCompletion } from "@/components/home/profile-completion";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { EmptyState } from "@/components/empty-state";
import type { HubPresenceMember, HubAnnouncement, HubRecentJoin } from "@/actions/hub";
import type { UpcomingItem as HubUpcomingItem } from "@/actions/events";
import type { Game } from "@/lib/schedule";

const TELEGRAM_INVITE = "https://t.me/+ajaqw-YQ1ZsxYjQx";

const TELEGRAM_DISMISS_KEY = "telegram_banner_dismissed";
const subscribeStorage = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

interface HomePageProps {
  presence: HubPresenceMember[];
  upcoming: HubUpcomingItem[];
  announcements: HubAnnouncement[];
  recentJoins: HubRecentJoin[];
  initialPosts: FeedPost[];
  initialCursor: string | null;
  myAlumniId: string | null;
  myForwardToken: string | null;
  showOnboarding: boolean;
  alumniFirstName: string;
  alumniId: string | null;
  profileFields: {
    has_photo: boolean;
    has_bio: boolean;
    has_profession: boolean;
    has_company: boolean;
    has_city: boolean;
    has_linkedin: boolean;
    has_grad_year: boolean;
    has_position: boolean;
  } | null;
  eraMembers: EraMember[];
  myGradYear: number | null;
  nextGame: Game | null;
  nowMs: number;
}

export function HomePage({
  presence,
  upcoming,
  announcements,
  recentJoins,
  initialPosts,
  initialCursor,
  myAlumniId,
  myForwardToken,
  showOnboarding,
  alumniFirstName,
  alumniId,
  profileFields,
  eraMembers,
  myGradYear,
  nextGame,
  nowMs,
}: HomePageProps) {
  const [wizardDismissed, setWizardDismissed] = useState(false);
  // Override flag so dismissing in this session takes effect immediately
  // (the storage event only fires across tabs/windows, not within the same tab).
  const [localDismiss, setLocalDismiss] = useState(false);
  // Read the dismissed flag from localStorage via an external store so SSR
  // returns "dismissed" (hides banner cleanly) and hydration is consistent.
  const storedDismiss = useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem(TELEGRAM_DISMISS_KEY) === "1",
    () => true,
  );
  const telegramDismissed = storedDismiss || localDismiss;
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, startLoad] = useTransition();

  // Sync state when the server refreshes with new posts (e.g., after router.refresh())
  const latestInitialPostIdRef = useRef<string | null>(initialPosts[0]?.id ?? null);
  useEffect(() => {
    const newId = initialPosts[0]?.id ?? null;
    if (newId !== latestInitialPostIdRef.current) {
      latestInitialPostIdRef.current = newId;
      setPosts(initialPosts);
      setCursor(initialCursor);
    }
  }, [initialPosts, initialCursor]);

  function loadMore() {
    if (!cursor) return;
    startLoad(async () => {
      const { posts: more, nextCursor } = await getPostsAction(cursor);
      setPosts((prev) => [...prev, ...more]);
      setCursor(nextCursor);
    });
  }

  return (
    <PullToRefresh>
      {/* Invite banner — full bleed */}
      <InviteBanner forwardToken={myForwardToken} />

      <div className="mx-auto max-w-2xl">
        {showOnboarding && !wizardDismissed && (
          <OnboardingWizard
            alumniId={alumniId ?? ""}
            firstName={alumniFirstName ?? ""}
            onDismiss={() => setWizardDismissed(true)}
          />
        )}

        {profileFields && <ProfileCompletion fields={profileFields} />}

        {/* Next match */}
        <NextGameCard game={nextGame} nowMs={nowMs} />

        {/* Announcements — the reason this app exists */}
        {announcements.length > 0 && <AnnouncementsCard items={announcements} />}

        {/* Upcoming games / events */}
        {upcoming.length > 0 && (
          <div className="pt-5">
            <UpcomingRail items={upcoming} />
          </div>
        )}

        {/* Community — active, new, and your era */}
        <CommunityStrip
          presence={presence}
          joins={recentJoins}
          eraMembers={eraMembers}
          myGradYear={myGradYear}
        />

        {/* Jobs — network value */}
        <div className="px-4 pt-5">
          <Link
            href="/network?tab=jobs"
            className="group flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-1/60 px-4 py-3 transition-colors hover:border-sky-500/40 hover:bg-sky-500/5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <Briefcase className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-300 group-hover:text-white">
                Job Board
              </p>
              <p className="text-2xs text-zinc-600">
                Alumni hiring and open positions
              </p>
            </div>
            <span className="text-eyebrow text-3xs text-sky-400">View →</span>
          </Link>
        </div>

        {/* Telegram banner — dismissible */}
        {!telegramDismissed && (
          <div className="mx-4 mt-4 rounded-xl border border-[#26A5E4]/30 bg-[#26A5E4]/10 px-4 py-3">
            <div className="flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 shrink-0 text-[#26A5E4] mt-0.5" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">Turn on notifications</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Join the Telegram channel to get instant alerts for posts, events, and new members.
                </p>
                <a
                  href={TELEGRAM_INVITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#26A5E4] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#1E96D1]"
                >
                  Join Telegram
                </a>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem(TELEGRAM_DISMISS_KEY, "1");
                  setLocalDismiss(true);
                }}
                className="p-0.5 text-zinc-500 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* Alumni Wall / Feed */}
        <div className="px-4 pb-8 space-y-3">
          {/* Section header */}
          <div className="flex items-end justify-between pt-5 pb-1 border-b border-zinc-900">
            <div>
              <span className="block h-[2px] w-8 bg-utah-red" />
              <p className="text-eyebrow mt-2 text-2xs text-zinc-500">Brotherhood</p>
              <h2 className="text-display mt-0.5 text-2xl leading-none text-white">
                Alumni Wall
              </h2>
            </div>
          </div>

          <CreatePost />

          {posts.length === 0 && (
            <EmptyState
              title="No posts yet"
              description="Be the first to post something."
            />
          )}

          {posts.map((post) => (
            <PostCard key={post.id} post={post} myAlumniId={myAlumniId} />
          ))}

          {cursor && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="text-eyebrow w-full border border-border bg-surface-0 py-3 text-2xs text-zinc-400 transition-colors hover:border-border-strong hover:text-white disabled:opacity-40"
            >
              {loading ? "Loading…" : "Load More"}
            </button>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}

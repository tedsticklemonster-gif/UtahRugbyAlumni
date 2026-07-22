"use client";

import { useState, useTransition, useEffect, useRef, Fragment } from "react";
import { getPostsAction, type FeedPost } from "@/actions/feed";
import { PostCard } from "@/components/post-card";
import { CreatePost } from "@/components/create-post";
import { UpcomingRail } from "@/components/home/upcoming-rail";
import { AnnouncementsCard } from "@/components/home/announcements-card";
import { CommunityStrip, type EraMember } from "@/components/home/community-strip";
import { NextGameCard } from "@/components/home/next-game-card";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { NudgeSlot } from "@/components/home/nudge-slot";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { EmptyState } from "@/components/empty-state";
import type { HubPresenceMember, HubAnnouncement, HubRecentJoin } from "@/actions/hub";
import type { UpcomingItem as HubUpcomingItem } from "@/actions/events";
import type { Game } from "@/lib/schedule";

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
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, startLoad] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

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
    if (!cursor || loading) return;
    startLoad(async () => {
      const { posts: more, nextCursor } = await getPostsAction(cursor);
      setPosts((prev) => [...prev, ...more]);
      setCursor(nextCursor);
    });
  }

  // Auto-load the next page as the sentinel approaches the viewport; the
  // "Load more" button below stays as a manual fallback.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !cursor) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, loading]);

  function focusComposer() {
    const el = document.querySelector<HTMLTextAreaElement>(
      "[data-composer] textarea",
    );
    el?.focus();
  }

  // Modules interleaved into the wall so the feed leads without burying them.
  const communityIndex = Math.min(2, posts.length);
  const jobsIndex = Math.min(5, posts.length);

  const communityModule = (
    <div className="-mx-4">
      <CommunityStrip
        presence={presence}
        joins={recentJoins}
        eraMembers={eraMembers}
        myGradYear={myGradYear}
      />
    </div>
  );

  const jobBoardModule = (
    <Link
      href="/network?tab=jobs"
      className="group flex items-center gap-3.5 rounded-2xl border border-border-subtle bg-surface-1/60 px-4 py-4 transition-colors hover:border-info/40 hover:bg-info/5"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
        <Briefcase className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-card-title text-zinc-100 group-hover:text-white">
          Job Board
        </p>
        <p className="text-sm text-zinc-500">
          Alumni hiring and open positions
        </p>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-info">
        View
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );

  return (
    <PullToRefresh>
      <div className="mx-auto max-w-2xl">
        {showOnboarding && !wizardDismissed && (
          <OnboardingWizard
            alumniId={alumniId ?? ""}
            firstName={alumniFirstName ?? ""}
            onDismiss={() => setWizardDismissed(true)}
          />
        )}

        {/* Next match */}
        <NextGameCard game={nextGame} nowMs={nowMs} />

        {/* Announcements — the reason this app exists */}
        {announcements.length > 0 && <AnnouncementsCard items={announcements} />}

        {/* One nudge at a time — invite / Telegram / profile strength rotate */}
        <NudgeSlot
          forwardToken={myForwardToken}
          profileFields={profileFields}
          nowMs={nowMs}
        />

        {/* Alumni Wall / Feed */}
        <div className="px-4 pb-8 space-y-4">
          {/* Section header */}
          <div className="pt-7 pb-1">
            <h2 className="text-title-2 text-white">Alumni Wall</h2>
          </div>

          <div data-composer>
            <CreatePost />
          </div>

          {posts.length === 0 && (
            <EmptyState
              title="The wall's quiet."
              description="Someone has to kick off. Post a memory, a match photo, or just check in."
              action={
                <button
                  onClick={focusComposer}
                  className="rounded-full bg-utah-red px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-utah-red/90"
                >
                  Kick it off
                </button>
              }
            />
          )}

          {posts.map((post, i) => (
            <Fragment key={post.id}>
              <PostCard post={post} myAlumniId={myAlumniId} />
              {i + 1 === communityIndex && communityModule}
              {i + 1 === jobsIndex && jobBoardModule}
              {i + 1 === Math.min(4, posts.length) && upcoming.length > 0 && (
                <div className="-mx-4">
                  <UpcomingRail items={upcoming} />
                </div>
              )}
            </Fragment>
          ))}

          {posts.length === 0 && (
            <>
              {upcoming.length > 0 && (
                <div className="-mx-4">
                  <UpcomingRail items={upcoming} />
                </div>
              )}
              {communityModule}
              {jobBoardModule}
            </>
          )}

          {cursor && (
            <>
              <div ref={sentinelRef} aria-hidden />
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full rounded-full border border-border bg-surface-0 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-border-strong hover:text-white disabled:opacity-40"
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            </>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}

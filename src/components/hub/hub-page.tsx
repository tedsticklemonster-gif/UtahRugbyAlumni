"use client";

import { useState, useTransition } from "react";
import { getPostsAction, type FeedPost } from "@/actions/feed";
import { PostCard } from "@/components/post-card";
import { CreatePost } from "@/components/create-post";
import { AlumniPresenceStrip } from "@/components/hub/alumni-presence-strip";
import { UpcomingRail } from "@/components/hub/upcoming-rail";
import { AnnouncementsCard } from "@/components/hub/announcements-card";
import { NewJoinsStrip } from "@/components/hub/new-joins-strip";
import { InviteBanner } from "@/components/hub/invite-banner";
import { PullToRefresh } from "@/components/pull-to-refresh";
import type { HubPresenceMember, HubAnnouncement, HubRecentJoin } from "@/actions/hub";
import type { UpcomingItem as HubUpcomingItem } from "@/actions/events";

const display =
  "font-[family-name:var(--font-barlow-condensed)] font-black uppercase italic tracking-tight";
const eyebrow =
  "font-[family-name:var(--font-barlow)] font-extrabold uppercase tracking-[0.25em]";

interface HubPageProps {
  presence: HubPresenceMember[];
  upcoming: HubUpcomingItem[];
  announcements: HubAnnouncement[];
  recentJoins: HubRecentJoin[];
  initialPosts: FeedPost[];
  initialCursor: string | null;
  myAlumniId: string | null;
  myForwardToken: string | null;
}

export function HubPage({
  presence,
  upcoming,
  announcements,
  recentJoins,
  initialPosts,
  initialCursor,
  myAlumniId,
  myForwardToken,
}: HubPageProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, startLoad] = useTransition();

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
        {/* Alumni presence strip */}
        <AlumniPresenceStrip presence={presence} />

        {/* Upcoming games / events */}
        {upcoming.length > 0 && (
          <div className="pt-5">
            <UpcomingRail items={upcoming} />
          </div>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <AnnouncementsCard items={announcements} />
        )}

        {/* New members */}
        {recentJoins.length > 0 && (
          <NewJoinsStrip joins={recentJoins} />
        )}

        {/* Alumni Wall / Feed */}
        <div className="px-4 pb-8 space-y-3">
          {/* Section header */}
          <div className="flex items-end justify-between pt-5 pb-1 border-b border-zinc-900">
            <div>
              <span className="block h-[2px] w-8 bg-[#CC0000]" />
              <p className={`${eyebrow} mt-2 text-[10px] text-zinc-500`}>Brotherhood</p>
              <h2 className={`${display} mt-0.5 text-2xl leading-none text-white`}>
                Alumni Wall
              </h2>
            </div>
          </div>

          <CreatePost />

          {posts.length === 0 && (
            <div className="border border-zinc-900 bg-zinc-950 py-12 text-center">
              <p className={`${display} text-xl text-zinc-400`}>No posts yet</p>
              <p className="mt-1 text-xs text-zinc-600">Be the first to post something.</p>
            </div>
          )}

          {posts.map((post) => (
            <PostCard key={post.id} post={post} myAlumniId={myAlumniId} />
          ))}

          {cursor && (
            <button
              onClick={loadMore}
              disabled={loading}
              className={`${eyebrow} w-full border border-zinc-800 bg-zinc-950 py-3 text-[10px] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white disabled:opacity-40`}
            >
              {loading ? "Loading…" : "Load More"}
            </button>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}

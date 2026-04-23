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
import type {
  HubPresenceMember,
  HubUpcomingItem,
  HubAnnouncement,
  HubRecentJoin,
} from "@/actions/hub";

interface HubPageProps {
  presence: HubPresenceMember[];
  upcoming: HubUpcomingItem[];
  announcements: HubAnnouncement[];
  recentJoins: HubRecentJoin[];
  initialPosts: FeedPost[];
  initialCursor: string | null;
  myAlumniId: string | null;
}

export function HubPage({
  presence,
  upcoming,
  announcements,
  recentJoins,
  initialPosts,
  initialCursor,
  myAlumniId,
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
      <InviteBanner />

      <div className="mx-auto max-w-xl">
        {/* Alumni presence strip — full bleed, no side padding */}
        <AlumniPresenceStrip presence={presence} />

        {/* Upcoming games rail */}
        {upcoming.length > 0 && (
          <div className="pt-4">
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

        {/* Feed */}
        <div className="px-4 pb-6 space-y-4">
          <div className="pt-2 pb-1 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Alumni Wall
            </p>
          </div>

          <CreatePost />

          {posts.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-12 text-center">
              <p className="text-sm font-semibold text-zinc-400">No posts yet</p>
              <p className="mt-1 text-xs text-zinc-600">Be the first to post something!</p>
            </div>
          )}

          {posts.map((post) => (
            <PostCard key={post.id} post={post} myAlumniId={myAlumniId} />
          ))}

          {cursor && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full rounded-xl border border-zinc-800 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200 disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}

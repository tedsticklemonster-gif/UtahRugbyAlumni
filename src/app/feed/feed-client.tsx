"use client";

import { useState, useTransition } from "react";
import { CreatePost } from "@/components/create-post";
import { PostCard } from "@/components/post-card";
import { getPostsAction, type FeedPost } from "@/actions/feed";

interface FeedClientProps {
  initialPosts: FeedPost[];
  initialCursor: string | null;
  myAlumniId: string | null;
}

export function FeedClient({ initialPosts, initialCursor, myAlumniId }: FeedClientProps) {
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
    <div className="mx-auto max-w-xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight text-white">Alumni Feed</h1>
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
  );
}

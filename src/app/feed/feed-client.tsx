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
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-14 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-zinc-800">
            <svg className="size-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-white">Nothing posted yet</p>
          <p className="mt-1 text-xs text-zinc-500">Be the first — share a photo, update, or memory.</p>
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

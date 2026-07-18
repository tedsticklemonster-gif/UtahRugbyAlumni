import { PostCardSkeleton } from "@/components/skeletons/post-card-skeleton";

export default function FeedLoading() {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <div className="border-b border-white/6 px-4 py-4">
        <div className="h-6 w-32 animate-pulse rounded bg-surface-2" />
      </div>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        {/* Create post skeleton */}
        <div className="flex items-center gap-3 surface-card p-3 animate-pulse">
          <div className="size-9 shrink-0 rounded-full bg-surface-2" />
          <div className="h-9 flex-1 rounded-xl bg-surface-2" />
        </div>

        {/* Post skeletons */}
        {Array.from({ length: 4 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

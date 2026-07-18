export function PostCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden animate-pulse">
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div className="h-9 w-9 rounded-full bg-surface-2 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-32 rounded bg-surface-2" />
          <div className="h-2.5 w-16 rounded bg-surface-2" />
        </div>
      </div>
      <div className="px-4 pb-4 space-y-2">
        <div className="h-3 w-full rounded bg-surface-2" />
        <div className="h-3 w-4/5 rounded bg-surface-2" />
      </div>
      <div className="border-t border-zinc-800 px-3 py-2 flex gap-4">
        <div className="h-7 w-16 rounded-lg bg-surface-2" />
        <div className="h-7 w-16 rounded-lg bg-surface-2" />
      </div>
    </div>
  );
}

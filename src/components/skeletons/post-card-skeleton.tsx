export function PostCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden animate-pulse">
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div className="h-9 w-9 rounded-full bg-zinc-800 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-32 rounded bg-zinc-800" />
          <div className="h-2.5 w-16 rounded bg-zinc-800" />
        </div>
      </div>
      <div className="px-4 pb-4 space-y-2">
        <div className="h-3 w-full rounded bg-zinc-800" />
        <div className="h-3 w-4/5 rounded bg-zinc-800" />
      </div>
      <div className="border-t border-zinc-800 px-3 py-2 flex gap-4">
        <div className="h-7 w-16 rounded-lg bg-zinc-800" />
        <div className="h-7 w-16 rounded-lg bg-zinc-800" />
      </div>
    </div>
  );
}

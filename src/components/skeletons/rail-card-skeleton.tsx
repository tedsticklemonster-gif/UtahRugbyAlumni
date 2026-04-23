export function RailCardSkeleton() {
  return (
    <div className="flex gap-3 px-4 pb-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-52 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 animate-pulse"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-zinc-800" />
            <div className="h-3 w-20 rounded bg-zinc-800" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-zinc-800" />
            <div className="h-3 w-3/4 rounded bg-zinc-800" />
          </div>
          <div className="mt-3 h-2.5 w-28 rounded bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

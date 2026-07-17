export default function NetworkLoading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header skeleton */}
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <div className="h-7 w-36 animate-pulse rounded bg-zinc-800" />
        <div className="mt-2 h-3.5 w-64 animate-pulse rounded bg-zinc-800" />
        <div className="mt-4 h-9 w-44 animate-pulse rounded-full bg-zinc-800" />
      </div>

      {/* Rails skeleton */}
      <div className="border-b border-zinc-800 pb-4 pt-4">
        <div className="mb-3 flex items-center gap-2 px-4">
          <div className="h-2.5 w-24 animate-pulse rounded bg-zinc-800" />
        </div>
        <div className="flex gap-3 overflow-hidden px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-32 shrink-0 animate-pulse overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
            >
              <div className="aspect-[4/5] bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-px bg-zinc-800 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-zinc-900">
            <div className="aspect-[4/5] bg-zinc-800" />
            <div className="p-2 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-zinc-800" />
              <div className="h-2.5 w-1/2 rounded bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

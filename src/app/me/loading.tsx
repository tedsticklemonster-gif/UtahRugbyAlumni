export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <div className="border-b border-white/6 px-5 py-4">
        <div className="h-4 w-12 animate-pulse rounded bg-surface-2" />
        <div className="mt-3 h-7 w-36 animate-pulse rounded bg-surface-2" />
        <div className="mt-2 h-3 w-56 animate-pulse rounded bg-surface-2" />
      </div>

      <div className="mx-auto max-w-xl px-5 py-8">
        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="size-32 animate-pulse rounded-full bg-surface-2" />
          <div className="space-y-1.5 text-center">
            <div className="mx-auto h-4 w-40 animate-pulse rounded bg-surface-2" />
            <div className="mx-auto h-3 w-24 animate-pulse rounded bg-surface-2" />
          </div>
        </div>

        {/* Referral card skeleton */}
        <div className="mb-6 flex items-center gap-4 surface-card p-5 animate-pulse">
          <div className="size-12 shrink-0 rounded-xl bg-surface-2" />
          <div className="flex-1 space-y-1.5">
            <div className="h-7 w-8 rounded bg-surface-2" />
            <div className="h-3 w-40 rounded bg-surface-2" />
          </div>
          <div className="h-8 w-24 rounded-lg bg-surface-2" />
        </div>

        {/* Form skeleton */}
        <div className="surface-card p-5 space-y-4 animate-pulse">
          <div className="h-3 w-28 rounded bg-surface-2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-surface-2" />
              <div className="h-10 w-full rounded-lg bg-surface-2" />
            </div>
          ))}
          <div className="h-10 w-full rounded-xl bg-surface-2" />
        </div>
      </div>
    </div>
  );
}

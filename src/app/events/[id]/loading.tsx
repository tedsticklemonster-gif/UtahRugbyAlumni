export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-surface-0 animate-pulse">
      <div className="border-b border-white/6 px-5 py-4 md:px-10">
        <div className="h-5 w-20 rounded bg-surface-2" />
      </div>
      <div className="px-5 py-6 md:px-10 max-w-2xl space-y-5">
        <div className="h-4 w-24 rounded bg-surface-2" />
        <div className="h-8 w-3/4 rounded bg-surface-2" />
        <div className="surface-card p-4 space-y-3">
          <div className="h-4 w-48 rounded bg-surface-2" />
          <div className="h-4 w-36 rounded bg-surface-2" />
          <div className="h-4 w-28 rounded bg-surface-2" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-surface-2" />
        <div className="surface-card p-4">
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-surface-2" />
            <div className="h-4 w-2/3 rounded bg-surface-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

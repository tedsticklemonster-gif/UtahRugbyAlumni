export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 animate-pulse">
      <div className="border-b border-zinc-800 px-5 py-4 md:px-10">
        <div className="h-5 w-20 rounded bg-zinc-800" />
      </div>
      <div className="px-5 py-6 md:px-10 max-w-2xl space-y-5">
        <div className="h-4 w-24 rounded bg-zinc-800" />
        <div className="h-8 w-3/4 rounded bg-zinc-800" />
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
          <div className="h-4 w-48 rounded bg-zinc-800" />
          <div className="h-4 w-36 rounded bg-zinc-800" />
          <div className="h-4 w-28 rounded bg-zinc-800" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-zinc-800" />
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-zinc-800" />
            <div className="h-4 w-2/3 rounded bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

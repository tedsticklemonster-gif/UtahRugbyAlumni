export function AvatarRowSkeleton() {
  return (
    <div className="flex gap-4 px-4 py-4 border-b border-zinc-800/60">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 animate-pulse">
          <div className="h-14 w-14 rounded-full bg-zinc-800" />
          <div className="h-2 w-10 rounded bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

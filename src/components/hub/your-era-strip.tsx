import Link from "next/link";


export type EraMember = {
  id: string;
  first_name: string;
  last_name: string;
  grad_year: number | null;
  photo_signed_url: string | null;
};

export function YourEraStrip({ members, myGradYear }: { members: EraMember[]; myGradYear: number | null }) {
  if (!myGradYear || members.length === 0) return null;

  const startYear = myGradYear - 2;
  const endYear = myGradYear + 2;

  return (
    <div className="px-4 pt-4">
      <div className="flex items-end justify-between mb-3">
        <div>
          <span className="block h-[2px] w-6 bg-utah-red" />
          <p className={`text-eyebrow mt-1.5 text-3xs text-zinc-500`}>Your Era</p>
          <h3 className={`text-display text-lg text-white`}>
            &rsquo;{String(startYear).slice(-2)}&ndash;&rsquo;{String(endYear).slice(-2)} Crew
          </h3>
        </div>
        <Link
          href={`/directory?year_start=${startYear}&year_end=${endYear}`}
          className={`text-eyebrow text-3xs text-zinc-500 hover:text-white transition-colors`}
        >
          View All →
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {members.map((m) => (
          <Link
            key={m.id}
            href={`/u/${m.id}`}
            className="flex flex-col items-center gap-1.5 w-16 shrink-0 group"
          >
            {m.photo_signed_url ? (
              <img
                src={m.photo_signed_url}
                alt={`${m.first_name} ${m.last_name}`}
                className="size-12 rounded-full object-cover border-2 border-zinc-800 group-hover:border-utah-red transition-colors"
              />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400 border-2 border-zinc-800 group-hover:border-utah-red transition-colors">
                {m.first_name[0]}{m.last_name[0]}
              </div>
            )}
            <p className="text-2xs text-zinc-400 truncate w-full text-center group-hover:text-white transition-colors">
              {m.first_name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

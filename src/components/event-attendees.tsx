import Link from "next/link";
import type { EventAttendee } from "@/actions/events";

function Initials({ first, last }: { first: string; last: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-2xs font-bold text-zinc-300">
      {first[0]}
      {last[0]}
    </div>
  );
}

export function EventAttendees({ attendees }: { attendees: EventAttendee[] }) {
  if (attendees.length === 0) return null;

  const going = attendees.filter((a) => a.status === "going");
  const maybe = attendees.filter((a) => a.status === "maybe");

  return (
    <div className="surface-card p-4 space-y-4">
      {going.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
            Going ({going.length})
          </p>
          <ul className="space-y-2">
            {going.map((a) => (
              <li key={a.alumni_id}>
                <Link
                  href={`/u/${a.alumni_id}`}
                  className="flex items-center gap-2.5 rounded-lg px-1 py-1 -mx-1 hover:bg-surface-2 transition-colors"
                >
                  <Initials first={a.first_name} last={a.last_name} />
                  <span className="text-sm font-medium text-zinc-200">
                    {a.first_name} {a.last_name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {maybe.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
            Maybe ({maybe.length})
          </p>
          <ul className="space-y-2">
            {maybe.map((a) => (
              <li key={a.alumni_id}>
                <Link
                  href={`/u/${a.alumni_id}`}
                  className="flex items-center gap-2.5 rounded-lg px-1 py-1 -mx-1 hover:bg-surface-2 transition-colors"
                >
                  <Initials first={a.first_name} last={a.last_name} />
                  <span className="text-sm font-medium text-zinc-400">
                    {a.first_name} {a.last_name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

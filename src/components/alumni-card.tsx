import { MapPin, Briefcase, ExternalLink } from "lucide-react";

interface AlumniCardProps {
  firstName: string;
  lastName: string;
  gradYear: number | null;
  position: string | null;
  profession: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  photoUrl?: string | null;
  linkedinUrl?: string | null;
  bio?: string | null;
  isGated: boolean;
}

export function AlumniCard({
  firstName,
  lastName,
  gradYear,
  position,
  profession,
  company,
  city,
  state,
  photoUrl,
  linkedinUrl,
  bio,
  isGated,
}: AlumniCardProps) {
  const location = [city, state].filter(Boolean).join(", ");
  const initials = `${firstName[0]}${lastName[0]}`;

  return (
    <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white overflow-hidden transition-shadow hover:shadow-md">
      {/* Photo strip */}
      <div className="relative h-1.5 bg-[#CC0000]" />

      <div className="flex items-start gap-3 p-4">
        {/* Avatar */}
        {!isGated && photoUrl ? (
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            className="size-12 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-sm font-bold text-white">
            {initials}
          </div>
        )}

        {/* Name + tags */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight text-zinc-900 truncate">
            {firstName} {lastName}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {gradYear && (
              <span className="rounded-md bg-zinc-950 px-1.5 py-0.5 text-[10px] font-bold text-white">
                &lsquo;{String(gradYear).slice(-2)}
              </span>
            )}
            {position && (
              <span className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 capitalize">
                {position}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500">
        {(profession || company) && (
          <p className="flex items-center gap-1.5 truncate">
            <Briefcase className="size-3 shrink-0 text-zinc-400" />
            <span className="truncate">
              {profession}
              {profession && company && (
                <span className="text-zinc-400"> · {company}</span>
              )}
              {!profession && company}
            </span>
          </p>
        )}
        {location && (
          <p className="flex items-center gap-1.5 truncate">
            <MapPin className="size-3 shrink-0 text-zinc-400" />
            {location}
          </p>
        )}
        {!isGated && bio && (
          <p className="line-clamp-2 pt-1 text-zinc-400">{bio}</p>
        )}
        {!isGated && linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 pt-0.5 font-medium text-[#0A66C2] hover:underline"
          >
            <ExternalLink className="size-3" />
            LinkedIn
          </a>
        )}
      </div>

      {/* Gated prompt */}
      {isGated && (
        <p className="border-t border-zinc-100 px-4 py-2 text-[10px] text-zinc-400">
          Sign in to see photo, bio & LinkedIn
        </p>
      )}
    </article>
  );
}

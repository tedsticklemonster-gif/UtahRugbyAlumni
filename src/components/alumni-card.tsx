"use client";

import Link from "next/link";
import { Briefcase, MapPin, BadgeCheck, Sparkles, Handshake, Hammer, MessageCircle } from "lucide-react";
import { UserPhoto } from "@/components/user-photo";
import { SponsorHalo } from "@/components/sponsor-halo";
import type { SponsorTier } from "@/lib/sponsor";

export type Availability =
  | "employed"
  | "self_employed"
  | "open_to_work"
  | "looking_for_work"
  | "student"
  | "retired"
  | "not_specified"
  | null
  | undefined;

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
  alumniId?: string;
  canMessage?: boolean;
  verified?: boolean;
  availability?: Availability;
  hiring?: boolean | null;
  willingToMentor?: boolean | null;
  services?: string[] | null;
  sponsorTier?: SponsorTier;
}

type RibbonKind = "hiring" | "open_to_work" | "self_employed" | "mentor" | null;

function primaryRibbon(a: {
  hiring?: boolean | null;
  availability?: Availability;
  willingToMentor?: boolean | null;
}): RibbonKind {
  if (a.hiring) return "hiring";
  if (a.availability === "open_to_work" || a.availability === "looking_for_work")
    return "open_to_work";
  if (a.availability === "self_employed") return "self_employed";
  if (a.willingToMentor) return "mentor";
  return null;
}

function ribbonStyles(r: RibbonKind) {
  switch (r) {
    case "hiring":
      return {
        label: "Hiring",
        icon: Hammer,
        className: "bg-info/90 text-white",
      };
    case "open_to_work":
      return {
        label: "Open to work",
        icon: Sparkles,
        className: "bg-success/90 text-zinc-950",
      };
    case "self_employed":
      return {
        label: "Self-employed",
        icon: Briefcase,
        className: "bg-black/55 text-white backdrop-blur",
      };
    case "mentor":
      return {
        label: "Mentor",
        icon: Handshake,
        className: "bg-warning/90 text-zinc-950",
      };
    default:
      return null;
  }
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
  linkedinUrl: _linkedinUrl,
  bio,
  isGated,
  alumniId,
  canMessage,
  verified,
  availability,
  hiring,
  willingToMentor,
  services,
  sponsorTier,
}: AlumniCardProps) {
  void _linkedinUrl;
  const location = [city, state].filter(Boolean).join(", ");
  const ribbon = primaryRibbon({ hiring, availability, willingToMentor });
  const ribbonCfg = ribbonStyles(ribbon);
  const topServices = (services ?? []).slice(0, 2);

  const clickable = Boolean(alumniId && !isGated);

  return (
    <article className="surface-card group relative flex flex-col overflow-hidden transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised active:translate-y-0 active:scale-[0.99]">
      {/* Overlay link instead of wrapping the card in an <a> — the Message
          action is also a link, and nested anchors are invalid HTML (breaks hydration) */}
      {clickable && (
        <Link
          href={`/u/${alumniId}`}
          aria-label={`View ${firstName} ${lastName}'s profile`}
          className="absolute inset-0 z-0"
        />
      )}
      {/* Photo area — 4:5 portrait for that Instagram grid feel */}
      <SponsorHalo tier={sponsorTier ?? null} size="md" rounded="rounded-xl">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-0">
        <UserPhoto
          src={isGated ? null : photoUrl ?? null}
          alt={`${firstName} ${lastName}`}
          firstName={firstName}
          lastName={lastName}
          fill
          rounded="xl"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Top ribbons */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          {ribbonCfg ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold shadow-sm ${ribbonCfg.className}`}
            >
              <ribbonCfg.icon className="size-3" />
              {ribbonCfg.label}
            </span>
          ) : (
            <span />
          )}
          {verified && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-2xs font-semibold text-white backdrop-blur"
              title="Verified alumnus"
            >
              <BadgeCheck className="size-3 text-info" />
            </span>
          )}
        </div>

        {/* Bottom gradient + name */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10">
          <p className="text-display text-[1.0625rem] leading-tight text-white drop-shadow-md">
            {firstName} {lastName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {gradYear && (
              <span className="rounded-md bg-utah-red px-1.5 py-0.5 text-2xs font-bold text-white">
                &rsquo;{String(gradYear).slice(-2)}
              </span>
            )}
            {position && (
              <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-2xs font-semibold capitalize text-white backdrop-blur-sm">
                {position}
              </span>
            )}
          </div>
        </div>
      </div>
      </SponsorHalo>

      {/* Below fold */}
      <div className="flex flex-1 flex-col gap-2 p-3 text-xs text-zinc-400">
        {(profession || company) && (
          <p className="flex items-center gap-1.5 truncate text-zinc-300">
            <Briefcase className="size-3 shrink-0 text-zinc-500" />
            <span className="truncate">
              {profession}
              {profession && company && (
                <span className="text-zinc-500"> · {company}</span>
              )}
              {!profession && company}
            </span>
          </p>
        )}
        {location && (
          <p className="flex items-center gap-1.5 truncate">
            <MapPin className="size-3 shrink-0 text-zinc-500" />
            {location}
          </p>
        )}
        {topServices.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {topServices.map((s) => (
              <span
                key={s}
                className="rounded-md bg-surface-2 px-1.5 py-0.5 text-2xs font-medium text-zinc-300"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        {!isGated && bio && (
          <p className="line-clamp-2 pt-0.5 text-zinc-500">{bio}</p>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {!isGated && canMessage && alumniId ? (
            <Link
              href={`/messages/${alumniId}`}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 inline-flex items-center gap-1 rounded-full border border-border-strong px-2.5 py-1 text-xs font-semibold text-zinc-200 transition-colors hover:border-utah-red hover:text-white"
            >
              <MessageCircle className="size-3" />
              Message
            </Link>
          ) : (
            <span />
          )}
          {isGated && (
            <p className="text-2xs italic text-zinc-500">
              Sign in to see photo
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

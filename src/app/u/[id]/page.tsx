export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  ExternalLink,
  MessageCircle,
  ArrowLeft,
  CalendarDays,
  Shield,
  BadgeCheck,
  Sparkles,
  Hammer,
  Handshake,
  Globe,
  Users,
} from "lucide-react";
import {
  getAlumniProfileAction,
  getAlumniRecentPostsAction,
} from "@/actions/profile-view";
import { PostCard } from "@/components/post-card";
import { UserPhoto } from "@/components/user-photo";
import { ShareProfileButton } from "@/components/share-profile-button";
import { SponsorHalo } from "@/components/sponsor-halo";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { TIER_LABELS, formatLifetime } from "@/lib/sponsor";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://utah-rugby-alumni.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getAlumniProfileAction(id);
  if (!profile) return { title: "Alumni Profile" };

  const name = `${profile.first_name} ${profile.last_name}`;
  const grad = profile.grad_year ? `Class of ${profile.grad_year}` : "Utah Rugby Alumni";
  const descBits = [grad, profile.position, profile.profession, profile.company].filter(Boolean);
  const description = descBits.join(" · ");
  const ogUrl = `${APP_URL}/api/og/profile/${id}`;

  return {
    title: `${name} — Utah Rugby Alumni`,
    description,
    openGraph: {
      title: `${name} — Utah Rugby Alumni`,
      description,
      url: `${APP_URL}/u/${id}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Utah Rugby Alumni`,
      description,
      images: [ogUrl],
    },
  };
}

function availabilityLabel(availability: string | null): {
  label: string;
  className: string;
  Icon: React.ComponentType<{ className?: string }>;
} | null {
  switch (availability) {
    case "open_to_work":
      return {
        label: "Open to work",
        className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        Icon: Sparkles,
      };
    case "looking_for_work":
      return {
        label: "Actively looking",
        className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        Icon: Sparkles,
      };
    case "self_employed":
      return {
        label: "Self-employed",
        className: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
        Icon: Briefcase,
      };
    default:
      return null;
  }
}

export default async function AlumniProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile, { posts, myAlumniId }] = await Promise.all([
    getAlumniProfileAction(id),
    getAlumniRecentPostsAction(id),
  ]);

  if (!profile) notFound();

  const location = [profile.city, profile.state].filter(Boolean).join(", ");
  const availability = availabilityLabel(profile.availability);

  const shareUrl = profile.myForwardToken
    ? `${APP_URL}/u/${profile.id}?ref=${profile.myForwardToken}`
    : `${APP_URL}/u/${profile.id}`;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Back nav */}
      <div className="sticky top-14 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm px-4 py-3">
        <Link
          href="/network"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" />
          Directory
        </Link>
      </div>

      {/* Hero banner — blurred photo backdrop */}
      <div className="relative h-40 w-full overflow-hidden bg-zinc-900">
        {profile.photo_signed_url && (
          <div
            aria-hidden
            className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl opacity-40"
            style={{ backgroundImage: `url(${profile.photo_signed_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950" />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1.5 bg-utah-red"
        />
      </div>

      {/* Avatar + identity */}
      <div className="relative px-4 -mt-16 pb-4">
        <div className="flex items-end gap-4">
          <SponsorHalo tier={profile.sponsor_tier} size="lg">
            {profile.photo_signed_url ? (
              <PhotoLightbox
                src={profile.photo_signed_url}
                alt={`${profile.first_name} ${profile.last_name}`}
                trigger={
                  <div className="relative size-32 shrink-0 overflow-hidden rounded-full border-4 border-zinc-950 shadow-xl">
                    <UserPhoto
                      src={profile.photo_signed_url}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      firstName={profile.first_name}
                      lastName={profile.last_name}
                      fill
                      rounded="full"
                      priority
                    />
                  </div>
                }
              />
            ) : (
              <div className="relative size-32 shrink-0 overflow-hidden rounded-full border-4 border-zinc-950 shadow-xl">
                <UserPhoto
                  src={null}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  firstName={profile.first_name}
                  lastName={profile.last_name}
                  fill
                  rounded="full"
                  priority
                />
              </div>
            )}
          </SponsorHalo>
          <div className="pb-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {profile.hiring && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 text-2xs font-black uppercase tracking-wider text-white">
                  <Hammer className="size-3" /> Hiring
                </span>
              )}
              {availability && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-bold ${availability.className}`}
                >
                  <availability.Icon className="size-3" /> {availability.label}
                </span>
              )}
              {profile.willing_to_mentor && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-2xs font-bold text-amber-300">
                  <Handshake className="size-3" /> Mentor
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              {profile.first_name} {profile.last_name}
            </h1>
            {profile.verified && (
              <BadgeCheck className="size-5 text-sky-400" aria-label="Verified" />
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.grad_year && (
              <span className="rounded-md bg-utah-red px-2 py-0.5 text-xs font-black text-white">
                &rsquo;{String(profile.grad_year).slice(-2)}
              </span>
            )}
            {profile.position && (
              <span className="rounded-md border border-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400 capitalize">
                {profile.position}
              </span>
            )}
            {profile.years_experience !== null && profile.years_experience > 0 && (
              <span className="rounded-md border border-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
                {profile.years_experience}+ yrs exp
              </span>
            )}
          </div>
          {/* Sponsor tier + referral count badges */}
          {(profile.sponsor_tier || profile.referral_count > 0) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {profile.sponsor_tier && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: profile.sponsor_tier === "gold" ? "rgba(255,215,0,0.15)" : profile.sponsor_tier === "silver" ? "rgba(192,192,192,0.15)" : "rgba(184,115,51,0.15)",
                    color: profile.sponsor_tier === "gold" ? "#FFD700" : profile.sponsor_tier === "silver" ? "#C0C0C0" : "#B87333",
                    border: `1px solid ${profile.sponsor_tier === "gold" ? "rgba(255,215,0,0.4)" : profile.sponsor_tier === "silver" ? "rgba(192,192,192,0.4)" : "rgba(184,115,51,0.4)"}`,
                  }}
                >
                  🏆 {TIER_LABELS[profile.sponsor_tier]}
                  {profile.isOwnProfile && profile.lifetime_giving_cents > 0 && (
                    <span className="opacity-70">· Lifetime giving {formatLifetime(profile.lifetime_giving_cents)}</span>
                  )}
                </span>
              )}
              {profile.referral_count > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-utah-red/30 bg-utah-red/10 px-3 py-1 text-xs font-semibold text-utah-red">
                  <Users className="size-3" />
                  Brought {profile.referral_count} {profile.referral_count === 1 ? "teammate" : "teammates"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2">
          {(profile.profession || profile.company) && (
            <p className="flex items-center gap-2 text-sm text-zinc-300">
              <Briefcase className="size-4 shrink-0 text-zinc-500" />
              <span>
                {profile.job_title ?? profile.profession}
                {(profile.job_title ?? profile.profession) && profile.company && (
                  <span className="text-zinc-500"> · {profile.company}</span>
                )}
                {!(profile.job_title ?? profile.profession) && profile.company}
              </span>
            </p>
          )}
          {location && (
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <MapPin className="size-4 shrink-0 text-zinc-500" />
              {location}
            </p>
          )}
          {profile.grad_year && (
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <CalendarDays className="size-4 shrink-0 text-zinc-500" />
              Class of {profile.grad_year}
            </p>
          )}
        </div>

        {/* Service / industry tags */}
        {((profile.services && profile.services.length > 0) ||
          (profile.industries && profile.industries.length > 0)) && (
          <div className="mt-4 space-y-2">
            {profile.services && profile.services.length > 0 && (
              <div>
                <p className="text-2xs font-bold uppercase tracking-widest text-zinc-500">
                  Services
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.services.map((s) => (
                    <Link
                      key={s}
                      href={`/directory?service=${encodeURIComponent(s)}`}
                      className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-zinc-200 hover:border-utah-red"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {profile.industries && profile.industries.length > 0 && (
              <div>
                <p className="text-2xs font-bold uppercase tracking-widest text-zinc-500">
                  Industries
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.industries.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-xs font-medium text-zinc-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-sm leading-relaxed text-zinc-200">{profile.bio}</p>
        )}

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          {profile.canMessage && (
            <Link
              href={`/messages/${profile.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-utah-red px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
            >
              <MessageCircle className="size-4" />
              Message
            </Link>
          )}
          <ShareProfileButton
            url={shareUrl}
            shareTitle={`${profile.first_name} ${profile.last_name} — Utah Rugby Alumni`}
            shareText={`Check out ${profile.first_name}'s profile on the Utah Rugby Alumni Network.`}
          />
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
            >
              <ExternalLink className="size-4" />
              LinkedIn
            </a>
          )}
          {profile.website_url && (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
            >
              <Globe className="size-4" />
              Website
            </a>
          )}
          {profile.instagram_handle && (
            <a
              href={`https://instagram.com/${profile.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              @{profile.instagram_handle}
            </a>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="border-t border-zinc-800 px-4 py-4">
        <p className="mb-3 text-2xs font-bold uppercase tracking-widest text-zinc-500">
          Recent Posts
        </p>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-10 text-center">
            <Shield className="mx-auto mb-2 size-7 text-zinc-700" />
            <p className="text-sm text-zinc-500">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} myAlumniId={myAlumniId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Briefcase, ExternalLink, MessageCircle, ArrowLeft, CalendarDays, Shield } from "lucide-react";
import { getAlumniProfileAction, getAlumniRecentPostsAction } from "@/actions/profile-view";
import { PostCard } from "@/components/post-card";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getAlumniProfileAction(id);
  if (!profile) return { title: "Alumni Profile" };
  return {
    title: `${profile.first_name} ${profile.last_name} — Utah Rugby Alumni`,
  };
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
  const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Back nav */}
      <div className="sticky top-14 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm px-4 py-3">
        <Link
          href="/directory"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" />
          Directory
        </Link>
      </div>

      {/* Hero */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {profile.photo_signed_url ? (
            <img
              src={profile.photo_signed_url}
              alt={`${profile.first_name} ${profile.last_name}`}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-zinc-800 shrink-0"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-2xl font-black text-zinc-300 shrink-0">
              {initials}
            </div>
          )}

          {/* Name + tags */}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              {profile.first_name} {profile.last_name}
            </h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.grad_year && (
                <span className="rounded-md bg-zinc-950 border border-zinc-700 px-2 py-0.5 text-xs font-bold text-zinc-300">
                  &lsquo;{String(profile.grad_year).slice(-2)}
                </span>
              )}
              {profile.position && (
                <span className="rounded-md border border-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-500 capitalize">
                  {profile.position}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2">
          {(profile.profession || profile.company) && (
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <Briefcase className="size-4 shrink-0 text-zinc-600" />
              <span>
                {profile.job_title ?? profile.profession}
                {(profile.job_title ?? profile.profession) && profile.company && (
                  <span className="text-zinc-600"> · {profile.company}</span>
                )}
                {!(profile.job_title ?? profile.profession) && profile.company}
              </span>
            </p>
          )}
          {location && (
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <MapPin className="size-4 shrink-0 text-zinc-600" />
              {location}
            </p>
          )}
          {profile.grad_year && (
            <p className="flex items-center gap-2 text-sm text-zinc-400">
              <CalendarDays className="size-4 shrink-0 text-zinc-600" />
              Class of {profile.grad_year}
            </p>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">{profile.bio}</p>
        )}

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          {profile.canMessage && (
            <Link
              href={`/messages/${profile.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#CC0000] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
            >
              <MessageCircle className="size-4" />
              Message
            </Link>
          )}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
            >
              <ExternalLink className="size-4" />
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="border-t border-zinc-800 px-4 py-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
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

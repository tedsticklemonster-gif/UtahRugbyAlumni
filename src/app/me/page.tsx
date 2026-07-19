export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Share2,
  LogOut,
  Trophy,
  Settings,
  HeartHandshake,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileForm } from "@/components/profile-form";
import { PushSubscribe } from "@/components/push-subscribe";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { InstallAppButton } from "@/components/install-app-button";
import { signOutAction } from "@/actions/profile";
import { TIER_LABELS, formatLifetime } from "@/lib/sponsor";

export const metadata = {
  title: "Me — Utah Rugby Alumni Network",
};

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/auth/login");
  }

  const isAdmin = user.app_metadata?.role === "admin";

  const admin = createAdminClient();
  const { data: alumni } = await admin
    .from("alumni")
    .select("*")
    .eq("email", user.email)
    .single();

  if (!alumni) {
    redirect("/join");
  }

  const { data: tokens } = await admin
    .from("forward_tokens")
    .select("token, signups_attributed")
    .eq("referrer_alumni_id", alumni.id);

  const totalReferrals = tokens?.reduce((sum, t) => sum + (t.signups_attributed ?? 0), 0) ?? 0;

  let photoSignedUrl: string | null = null;
  if (alumni.photo_url) {
    const { data: signedData } = await admin.storage
      .from("alumni-photos")
      .createSignedUrl(alumni.photo_url, 86400);
    photoSignedUrl = signedData?.signedUrl ?? null;
  }

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Page header */}
      <div className="border-b border-white/6 px-5 py-6 md:px-10">
        <h1 className="text-title-1 text-white">Me</h1>
        <p className="mt-1.5 text-body-sm text-zinc-400">
          Your profile, giving, and settings.
        </p>
      </div>

      <div className="mx-auto max-w-xl px-5 py-8 md:px-10">

        {/* Identity */}
        <div className="mb-6 flex flex-col items-center gap-3">
          {photoSignedUrl ? (
            <PhotoLightbox
              src={photoSignedUrl}
              alt={`${alumni.first_name} ${alumni.last_name}`}
              trigger={
                <img
                  src={photoSignedUrl}
                  alt={`${alumni.first_name} ${alumni.last_name}`}
                  className="h-32 w-32 rounded-full border-4 border-zinc-800 object-cover shadow-xl transition-opacity hover:opacity-90"
                />
              }
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-zinc-800 bg-zinc-700 text-2xl font-bold text-zinc-300">
              {alumni.first_name[0]}{alumni.last_name[0]}
            </div>
          )}
          <div className="text-center">
            <p className="text-display text-2xl text-white">{alumni.first_name} {alumni.last_name}</p>
            {alumni.grad_year && (
              <p className="mt-0.5 text-sm text-zinc-500">Class of {alumni.grad_year}{alumni.position ? ` · ${alumni.position}` : ""}</p>
            )}
          </div>
          <Link
            href={`/u/${alumni.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
          >
            View public profile
            <ExternalLink className="size-3.5" />
          </Link>
        </div>

        {/* Impact summary — donor tier + referrals */}
        <div className="mb-6 surface-card p-5">
          <p className="mb-3 text-eyebrow">
            Your Impact
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Referrals */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-utah-red/15">
                <Users className="size-5 text-utah-red" />
              </div>
              <div>
                <p className="text-stat text-2xl text-white">{totalReferrals}</p>
                <p className="text-sm text-zinc-500">
                  {totalReferrals === 1 ? "teammate" : "teammates"} gathered
                </p>
              </div>
            </div>
            {/* Donor tier */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/15">
                <Trophy className="size-5 text-warning" />
              </div>
              <div>
                <p className="text-stat text-2xl text-white">
                  {alumni.sponsor_tier
                    ? TIER_LABELS[alumni.sponsor_tier as keyof typeof TIER_LABELS]
                    : "—"}
                </p>
                <p className="text-sm text-zinc-500">
                  {alumni.lifetime_giving_cents > 0
                    ? `${formatLifetime(alumni.lifetime_giving_cents)} lifetime`
                    : "No donations yet"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/thanks"
              className="inline-flex items-center gap-1.5 rounded-full bg-utah-red px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-utah-red/90"
            >
              <Share2 className="size-4" />
              Share your forward link
            </Link>
            <Link
              href="/me/giving"
              className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-4 py-2.5 text-sm font-bold text-zinc-200 transition-colors hover:border-utah-red"
            >
              <HeartHandshake className="size-4" />
              Give back
            </Link>
          </div>
        </div>

        {/* Settings rows */}
        <div className="mb-6 divide-y divide-zinc-800 surface-card">
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-eyebrow">
                Notifications
              </p>
              <Link
                href="/notifications/settings"
                className="flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition-colors hover:text-white"
              >
                <Settings className="size-4" />
                Preferences
              </Link>
            </div>
            <PushSubscribe />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-[0.9375rem] font-semibold text-zinc-300">Install the app</p>
            <InstallAppButton />
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-2/50"
            >
              <span className="flex items-center gap-2.5 text-[0.9375rem] font-semibold text-zinc-300">
                <ShieldCheck className="size-4 text-utah-red" />
                Admin dashboard
              </span>
              <ChevronRight className="size-4 text-zinc-600" />
            </Link>
          )}

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-5 py-4 text-left text-[0.9375rem] font-semibold text-zinc-400 transition-colors hover:bg-surface-2/50 hover:text-white"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>

        {/* Profile form */}
        <div className="surface-card p-5">
          <p className="mb-4 text-eyebrow">
            Your information
          </p>
          <ProfileForm
            alumni={{
              ...alumni,
              photo_signed_url: photoSignedUrl,
            }}
          />
        </div>
      </div>
    </div>
  );
}

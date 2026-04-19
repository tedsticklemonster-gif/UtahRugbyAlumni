export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { LogIn, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AlumniCard } from "@/components/alumni-card";
import { DirectoryFilters } from "@/components/directory-filters";

export const metadata = {
  title: "Directory — Utah Rugby Alumni Network",
  description: "Browse the Utah Rugby Alumni directory.",
};

interface DirectoryPageProps {
  searchParams: Promise<{
    q?: string;
    yearFrom?: string;
    yearTo?: string;
    position?: string;
    state?: string;
    sort?: string;
  }>;
}

export default async function DirectoryPage({
  searchParams,
}: DirectoryPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Check if user is authenticated and verified
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in at all — show sign-in wall
  if (!user) {
    return <DirectorySignInWall />;
  }

  let isVerifiedAlumni = false;
  let myAlumniId: string | null = null;
  if (user?.email) {
    const admin = createAdminClient();
    const { data: alumni } = await admin
      .from("alumni")
      .select("id, verified")
      .eq("email", user.email)
      .single();
    isVerifiedAlumni = alumni?.verified ?? false;
    myAlumniId = alumni?.id ?? null;
  }

  // Query alumni — use the public view for anon, full table for verified alumni
  const admin = createAdminClient();
  let query = admin
    .from("alumni")
    .select("*")
    .eq("directory_visible", true)
    .eq("verified", true)
    .order("last_name", { ascending: true });

  // Apply filters
  if (params.q) {
    const searchTerm = `%${params.q}%`;
    query = query.or(
      `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},profession.ilike.${searchTerm},company.ilike.${searchTerm}`
    );
  }
  if (params.yearFrom) {
    query = query.gte("grad_year", parseInt(params.yearFrom));
  }
  if (params.yearTo) {
    query = query.lte("grad_year", parseInt(params.yearTo));
  }
  if (params.position) {
    query = query.ilike("position", `%${params.position}%`);
  }
  if (params.state) {
    query = query.ilike("state", `%${params.state}%`);
  }

  const { data: alumni } = await query;

  // Generate signed photo URLs for verified alumni viewing
  let photoUrls: Record<string, string> = {};
  if (isVerifiedAlumni && alumni) {
    const photoPaths = alumni
      .filter((a) => a.photo_url)
      .map((a) => a.photo_url!);

    if (photoPaths.length > 0) {
      const { data: signedUrls } = await admin.storage
        .from("alumni-photos")
        .createSignedUrls(photoPaths, 3600);

      if (signedUrls) {
        for (const item of signedUrls) {
          if (item.signedUrl) {
            photoUrls[item.path!] = item.signedUrl;
          }
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Page header — dark, consistent with shell */}
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Alumni Directory
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {alumni?.length ?? 0} members
          {!isVerifiedAlumni && (
            <span> · Verify your account to see photos, bios &amp; LinkedIn</span>
          )}
        </p>
      </div>

      <div className="px-5 pt-5 md:px-10">
        <Suspense>
          <DirectoryFilters />
        </Suspense>
      </div>

      <div className="mt-5 px-5 pb-8 md:px-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {alumni?.map((a) => (
            <AlumniCard
              key={a.id}
              firstName={a.first_name}
              lastName={a.last_name}
              gradYear={a.grad_year}
              position={a.position}
              profession={a.profession}
              company={a.company}
              city={a.city}
              state={a.state}
              photoUrl={
                isVerifiedAlumni && a.photo_url
                  ? photoUrls[a.photo_url] ?? null
                  : null
              }
              linkedinUrl={isVerifiedAlumni ? a.linkedin_url : null}
              bio={isVerifiedAlumni ? a.bio : null}
              isGated={!isVerifiedAlumni}
              alumniId={a.id}
              canMessage={isVerifiedAlumni && a.id !== myAlumniId}
            />
          ))}
        </div>

        {(!alumni || alumni.length === 0) && (
          <p className="mt-16 text-center text-sm text-zinc-500">
            No members found matching your filters.
          </p>
        )}
      </div>
    </div>
  );
}

function DirectorySignInWall() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
        <Users className="size-8 text-zinc-400" />
      </div>
      <h1 className="mt-5 text-2xl font-black text-white">Alumni Directory</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
        The directory is only available to registered alumni. Sign in or create
        an account to find your teammates.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500"
        >
          <LogIn className="size-4" />
          Sign In
        </Link>
        <Link
          href="/join"
          className="inline-flex items-center justify-center rounded-xl bg-[#CC0000] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
        >
          Join the Network
        </Link>
      </div>
    </div>
  );
}

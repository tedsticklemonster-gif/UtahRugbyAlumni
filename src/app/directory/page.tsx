export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { LogIn, Users, AlertCircle, Sparkles, Hammer, Briefcase, Handshake, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AlumniCard, type Availability } from "@/components/alumni-card";
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
    availability?: string;
    hiring?: string;
    mentor?: string;
    service?: string;
  }>;
}

type AlumniRow = {
  id: string;
  first_name: string;
  last_name: string;
  grad_year: number | null;
  position: string | null;
  profession: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  bio: string | null;
  verified: boolean | null;
  availability: Availability;
  hiring: boolean | null;
  services: string[] | null;
  willing_to_mentor: boolean | null;
  created_at: string;
  sponsor_tier: "bronze" | "silver" | "gold" | null;
};

export default async function DirectoryPage({
  searchParams,
}: DirectoryPageProps) {
  const params = await searchParams;

  // getSession() reads the JWT from the cookie (no network call).
  // getUser() makes a live API call that can intermittently return null for
  // a valid session, incorrectly showing the sign-in wall.
  let session = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    return <DirectoryErrorWall />;
  }

  if (!session?.user) {
    return <DirectorySignInWall />;
  }

  const user = session.user;

  let isVerifiedAlumni = false;
  let myAlumniId: string | null = null;
  let alumni: AlumniRow[] = [];
  const photoUrls: Record<string, string> = {};

  try {
    const admin = createAdminClient();

    if (user.email) {
      const { data: me } = await admin
        .from("alumni")
        .select("id, verified")
        .eq("email", user.email)
        .single();
      isVerifiedAlumni = me?.verified ?? false;
      myAlumniId = me?.id ?? null;
    }

    let query = admin
      .from("alumni")
      .select(
        "id, first_name, last_name, grad_year, position, profession, company, city, state, photo_url, linkedin_url, bio, verified, availability, hiring, services, willing_to_mentor, created_at, sponsor_tier"
      )
      .eq("directory_visible", true)
      .in("status", ["self_registered", "imported"])
      .order("last_name", { ascending: true });

    if (params.q) {
      const t = `%${params.q}%`;
      query = query.or(
        `first_name.ilike.${t},last_name.ilike.${t},profession.ilike.${t},company.ilike.${t}`
      );
    }
    if (params.yearFrom) query = query.gte("grad_year", parseInt(params.yearFrom));
    if (params.yearTo) query = query.lte("grad_year", parseInt(params.yearTo));
    if (params.position) query = query.ilike("position", `%${params.position}%`);
    if (params.state) query = query.ilike("state", `%${params.state}%`);
    if (params.availability) query = query.eq("availability", params.availability);
    if (params.hiring === "1") query = query.eq("hiring", true);
    if (params.mentor === "1") query = query.eq("willing_to_mentor", true);
    if (params.service) {
      // Array contains match on services[]
      query = query.contains("services", [params.service.toLowerCase()]);
    }

    const { data: rows, error } = await query;
    if (error) throw error;
    alumni = (rows ?? []) as AlumniRow[];

    if (isVerifiedAlumni && alumni.length > 0) {
      const photoPaths = alumni
        .map((a) => a.photo_url)
        .filter((p): p is string => !!p);

      if (photoPaths.length > 0) {
        const { data: signedUrls } = await admin.storage
          .from("alumni-photos")
          .createSignedUrls(photoPaths, 86400);

        if (signedUrls) {
          for (const item of signedUrls) {
            if (item.signedUrl && item.path) {
              photoUrls[item.path] = item.signedUrl;
            }
          }
        }
      }
    }
  } catch {
    return <DirectoryErrorWall />;
  }

  const renderCard = (a: AlumniRow) => (
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
        isVerifiedAlumni && a.photo_url ? photoUrls[a.photo_url] ?? null : null
      }
      linkedinUrl={isVerifiedAlumni ? a.linkedin_url : null}
      bio={isVerifiedAlumni ? a.bio : null}
      isGated={!isVerifiedAlumni}
      alumniId={a.id}
      canMessage={isVerifiedAlumni && a.id !== myAlumniId}
      verified={!!a.verified}
      availability={a.availability}
      hiring={a.hiring}
      willingToMentor={a.willing_to_mentor}
      services={a.services}
      sponsorTier={a.sponsor_tier ?? null}
    />
  );

  // Rails (skipped when user has applied any filter — avoids duplication)
  const hasAnyFilter =
    !!(params.q || params.yearFrom || params.yearTo || params.position ||
      params.state || params.availability || params.hiring ||
      params.mentor || params.service);

  const hiringRail = alumni.filter((a) => a.hiring).slice(0, 10);
  const openToWorkRail = alumni
    .filter((a) => a.availability === "open_to_work" || a.availability === "looking_for_work")
    .slice(0, 10);
  const selfEmployedRail = alumni
    .filter((a) => a.availability === "self_employed")
    .slice(0, 10);
  const mentorRail = alumni.filter((a) => a.willing_to_mentor).slice(0, 10);
  const recentRail = [...alumni]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Alumni Directory
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {alumni.length} {alumni.length === 1 ? "member" : "members"}
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

      {/* Featured rails — only when no filter is applied */}
      {!hasAnyFilter && alumni.length > 0 && (
        <div className="mt-6 space-y-6">
          {hiringRail.length > 0 && (
            <Rail
              title="Hiring now"
              icon={Hammer}
              tint="text-sky-400"
              href="/directory?hiring=1"
            >
              {hiringRail.map(renderCard)}
            </Rail>
          )}
          {openToWorkRail.length > 0 && (
            <Rail
              title="Open to work"
              icon={Sparkles}
              tint="text-emerald-400"
              href="/directory?availability=open_to_work"
            >
              {openToWorkRail.map(renderCard)}
            </Rail>
          )}
          {selfEmployedRail.length > 0 && (
            <Rail
              title="Self-employed"
              icon={Briefcase}
              tint="text-fuchsia-400"
              href="/directory?availability=self_employed"
            >
              {selfEmployedRail.map(renderCard)}
            </Rail>
          )}
          {mentorRail.length > 0 && (
            <Rail
              title="Open to mentoring"
              icon={Handshake}
              tint="text-amber-400"
              href="/directory?mentor=1"
            >
              {mentorRail.map(renderCard)}
            </Rail>
          )}
          {recentRail.length > 0 && (
            <Rail title="Recently joined" icon={UserPlus} tint="text-zinc-300">
              {recentRail.map(renderCard)}
            </Rail>
          )}
        </div>
      )}

      {/* Full grid */}
      <div className="mt-8 px-5 pb-10 md:px-10">
        {alumni.length > 0 && (
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
            Everyone
          </h2>
        )}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {alumni.map(renderCard)}
        </div>

        {alumni.length === 0 && <DirectoryEmptyState hasFilters={hasAnyFilter} />}
      </div>
    </div>
  );
}

function Rail({
  title,
  icon: Icon,
  tint,
  href,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-5 md:px-10">
        <div className="flex items-center gap-2">
          <Icon className={`size-4 ${tint}`} />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
            {title}
          </h2>
        </div>
        {href && (
          <Link
            href={href}
            className="text-xs font-semibold text-zinc-500 hover:text-white"
          >
            See all →
          </Link>
        )}
      </div>
      <div className="overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex gap-3 px-5 md:px-10">
          {Array.isArray(children)
            ? children.map((child, i) => (
                <div key={i} className="w-44 shrink-0 sm:w-52">
                  {child}
                </div>
              ))
            : children}
        </div>
      </div>
    </section>
  );
}

function DirectoryEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-utah-red/15">
        <Users className="size-7 text-utah-red" />
      </div>
      <h2 className="mt-4 text-lg font-black text-white">
        {hasFilters ? "No matches" : "Be the first to show up here"}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-400">
        {hasFilters
          ? "Try adjusting your filters or clearing them."
          : "Invite a teammate to join so the directory starts filling up. Every alumnus you bring earns you a referral credit."}
      </p>
      <Link
        href="/thanks"
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-utah-red px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
      >
        <UserPlus className="size-4" />
        Invite a teammate
      </Link>
    </div>
  );
}

function DirectoryErrorWall() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
        <AlertCircle className="size-8 text-zinc-400" />
      </div>
      <h1 className="mt-5 text-2xl font-black text-white">Directory unavailable</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
        We couldn&apos;t load the directory right now. Please try again in a
        moment or contact us if the problem persists.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500"
      >
        Back to home
      </Link>
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
          className="inline-flex items-center justify-center rounded-xl bg-utah-red px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
        >
          Join the Network
        </Link>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { Users, Sparkles, Hammer, Briefcase, Handshake, UserPlus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { AlumniCard, type Availability } from "@/components/alumni-card";
import { DirectoryFilters } from "@/components/directory-filters";

export interface PeopleParams {
  q?: string;
  yearFrom?: string;
  yearTo?: string;
  position?: string;
  state?: string;
  availability?: string;
  hiring?: string;
  mentor?: string;
  service?: string;
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

export async function PeopleSection({
  params,
  userEmail,
}: {
  params: PeopleParams;
  userEmail: string | null;
}) {
  const admin = createAdminClient();

  let isVerifiedAlumni = false;
  let myAlumniId: string | null = null;

  if (userEmail) {
    const { data: me } = await admin
      .from("alumni")
      .select("id, verified")
      .eq("email", userEmail)
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
  const alumni = (rows ?? []) as AlumniRow[];

  const photoUrls: Record<string, string> = {};
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
    <>
      <div className="px-5 pt-5 md:px-10">
        <p className="mb-4 text-sm text-zinc-400">
          {alumni.length} {alumni.length === 1 ? "member" : "members"}
          {!isVerifiedAlumni && (
            <span> · Verify your account to see photos, bios &amp; LinkedIn</span>
          )}
        </p>
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
              href="/network?hiring=1"
            >
              {hiringRail.map(renderCard)}
            </Rail>
          )}
          {openToWorkRail.length > 0 && (
            <Rail
              title="Open to work"
              icon={Sparkles}
              tint="text-emerald-400"
              href="/network?availability=open_to_work"
            >
              {openToWorkRail.map(renderCard)}
            </Rail>
          )}
          {selfEmployedRail.length > 0 && (
            <Rail
              title="Self-employed"
              icon={Briefcase}
              tint="text-fuchsia-400"
              href="/network?availability=self_employed"
            >
              {selfEmployedRail.map(renderCard)}
            </Rail>
          )}
          {mentorRail.length > 0 && (
            <Rail
              title="Open to mentoring"
              icon={Handshake}
              tint="text-amber-400"
              href="/network?mentor=1"
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
          <h2 className="text-eyebrow mb-3">
            Everyone
          </h2>
        )}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {alumni.map(renderCard)}
        </div>

        {alumni.length === 0 && <PeopleEmptyState hasFilters={hasAnyFilter} />}
      </div>
    </>
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
          <h2 className="text-eyebrow text-zinc-200">
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

function PeopleEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-surface-1/40 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-utah-red/15">
        <Users className="size-7 text-utah-red" />
      </div>
      <h2 className="text-title-2 mt-4 text-white">
        {hasFilters ? "No matches" : "Be the first to show up here"}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-400">
        {hasFilters
          ? "Try adjusting your filters or clearing them."
          : "Invite a teammate to join so the directory starts filling up. Every alumnus you bring earns you a referral credit."}
      </p>
      <Link
        href="/thanks"
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-utah-red px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-utah-red/90"
      >
        <UserPlus className="size-4" />
        Invite a teammate
      </Link>
    </div>
  );
}

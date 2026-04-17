import { Suspense } from "react";
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

  let isVerifiedAlumni = false;
  if (user?.email) {
    const admin = createAdminClient();
    const { data: alumni } = await admin
      .from("alumni")
      .select("verified")
      .eq("email", user.email)
      .single();
    isVerifiedAlumni = alumni?.verified ?? false;
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Alumni Directory</h1>
        <p className="mt-1 text-muted-foreground">
          {alumni?.length ?? 0} alumni
          {!isVerifiedAlumni && (
            <span>
              {" "}
              · Sign in to see photos, bios, and LinkedIn profiles
            </span>
          )}
        </p>
      </div>

      <Suspense>
        <DirectoryFilters />
      </Suspense>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            // Gated fields: only show to verified alumni
            // Email and phone are NEVER shown to other alumni — admin only.
            photoUrl={
              isVerifiedAlumni && a.photo_url
                ? photoUrls[a.photo_url] ?? null
                : null
            }
            linkedinUrl={isVerifiedAlumni ? a.linkedin_url : null}
            bio={isVerifiedAlumni ? a.bio : null}
            isGated={!isVerifiedAlumni}
          />
        ))}
      </div>

      {(!alumni || alumni.length === 0) && (
        <p className="mt-12 text-center text-muted-foreground">
          No alumni found matching your filters.
        </p>
      )}
    </div>
  );
}

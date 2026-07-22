"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPostsAction } from "@/actions/feed";
import { listUpcoming } from "@/actions/events";

export type HubPresenceMember = {
  id: string;
  first_name: string;
  photo_signed_url: string | null;
};


export type HubAnnouncement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
};

export type HubRecentJoin = {
  id: string;
  first_name: string;
  last_name: string;
  grad_year: number | null;
  city: string | null;
  state: string | null;
};

export async function getHubData() {
  const supabase = await createClient();
  // Members only — this is a public action endpoint. Session (cookie read)
  // rather than getUser (live call with intermittent false-nulls).
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return {
      presence: [] as HubPresenceMember[],
      upcoming: [],
      announcements: [] as HubAnnouncement[],
      recentJoins: [] as HubRecentJoin[],
      myAlumniId: null as string | null,
      myForwardToken: null as string | null,
      profileFields: null,
      showOnboarding: false,
      alumniFirstName: "",
      alumniId: null as string | null,
      eraMembers: [],
      myGradYear: null as number | null,
      initialPosts: [],
      initialCursor: null as string | null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  let myAlumniId: string | null = null;
  let myForwardToken: string | null = null;
  if (user?.email) {
    const { data } = await admin
      .from("alumni")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();
    myAlumniId = data?.id ?? null;

    if (myAlumniId) {
      const { data: tokenData } = await admin
        .from("forward_tokens")
        .select("token")
        .eq("referrer_alumni_id", myAlumniId)
        .maybeSingle();
      myForwardToken = tokenData?.token ?? null;
    }
  }

  // Profile completion fields
  let profileFields: {
    has_photo: boolean;
    has_bio: boolean;
    has_profession: boolean;
    has_company: boolean;
    has_city: boolean;
    has_linkedin: boolean;
    has_grad_year: boolean;
    has_position: boolean;
  } | null = null;

  let showOnboarding = false;
  let alumniFirstName = "";

  if (myAlumniId) {
    const { data: alumniProfile } = await admin
      .from("alumni")
      .select("first_name, photo_url, bio, profession, company, city, linkedin_url, grad_year, position")
      .eq("id", myAlumniId)
      .maybeSingle();

    if (alumniProfile) {
      profileFields = {
        has_photo: !!alumniProfile.photo_url,
        has_bio: !!alumniProfile.bio,
        has_profession: !!alumniProfile.profession,
        has_company: !!alumniProfile.company,
        has_city: !!alumniProfile.city,
        has_linkedin: !!alumniProfile.linkedin_url,
        has_grad_year: !!alumniProfile.grad_year,
        has_position: !!alumniProfile.position,
      };

      alumniFirstName = alumniProfile.first_name ?? "";
      const filledCount = [
        alumniProfile.photo_url,
        alumniProfile.bio,
        alumniProfile.profession,
        alumniProfile.company,
        alumniProfile.city,
        alumniProfile.linkedin_url,
      ].filter(Boolean).length;
      showOnboarding = filledCount < 3;
    }
  }

  // Fetch era members (alumni from overlapping grad years)
  let eraMembers: { id: string; first_name: string; last_name: string; grad_year: number | null; photo_signed_url: string | null }[] = [];
  let myGradYear: number | null = null;

  if (myAlumniId && profileFields?.has_grad_year) {
    const { data: gradData } = await admin
      .from("alumni")
      .select("grad_year")
      .eq("id", myAlumniId)
      .maybeSingle();
    myGradYear = gradData?.grad_year ?? null;

    if (myGradYear) {
      const { data: eraData } = await admin
        .from("alumni")
        .select("id, first_name, last_name, grad_year, photo_url")
        .in("status", ["self_registered", "imported"])
        .eq("directory_visible", true)
        .gte("grad_year", myGradYear - 2)
        .lte("grad_year", myGradYear + 2)
        .neq("id", myAlumniId)
        .order("grad_year", { ascending: true })
        .limit(15);

      if (eraData?.length) {
        const eraPaths = eraData.filter((a) => a.photo_url).map((a) => a.photo_url!);
        const eraSignedMap: Record<string, string> = {};
        if (eraPaths.length) {
          const { data: sigs } = await admin.storage.from("alumni-photos").createSignedUrls(eraPaths, 86400);
          (sigs ?? []).forEach((s) => { if (s.signedUrl && s.path) eraSignedMap[s.path] = s.signedUrl; });
        }
        eraMembers = eraData.map((a) => ({
          id: a.id,
          first_name: a.first_name,
          last_name: a.last_name,
          grad_year: a.grad_year,
          photo_signed_url: a.photo_url ? (eraSignedMap[a.photo_url] ?? null) : null,
        }));
      }
    }
  }

  const [presenceRes, recentJoinsRes, postsData, upcoming] = await Promise.all([
    admin
      .from("alumni")
      .select("id, first_name, photo_url")
      .eq("verified", true)
      .eq("directory_visible", true)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("alumni")
      .select("id, first_name, last_name, grad_year, city, state")
      .eq("verified", true)
      .order("created_at", { ascending: false })
      .limit(5),
    getPostsAction(),
    listUpcoming(),
  ]);

  // Announcements — table may not exist yet on older deploys
  let announcements: HubAnnouncement[] = [];
  try {
    const { data } = await admin
      .from("announcements")
      .select("id, title, body, pinned, created_at")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3);
    announcements = (data ?? []) as HubAnnouncement[];
  } catch {
    // table not yet deployed
  }

  // Batch-sign presence photos
  const rawPresence = presenceRes.data ?? [];
  const photoPaths = rawPresence.filter((a) => a.photo_url).map((a) => a.photo_url!);
  const signedMap: Record<string, string> = {};
  if (photoPaths.length > 0) {
    const { data: sigs } = await admin.storage
      .from("alumni-photos")
      .createSignedUrls(photoPaths, 86400);
    (sigs ?? []).forEach((s) => {
      if (s.signedUrl && s.path) signedMap[s.path] = s.signedUrl;
    });
  }

  const presence: HubPresenceMember[] = rawPresence.map((a) => ({
    id: a.id,
    first_name: a.first_name,
    photo_signed_url: a.photo_url ? (signedMap[a.photo_url] ?? null) : null,
  }));

  const recentJoins: HubRecentJoin[] = (recentJoinsRes.data ?? []) as HubRecentJoin[];

  return {
    presence,
    upcoming,
    announcements,
    recentJoins,
    myAlumniId: postsData.myAlumniId,
    myForwardToken,
    profileFields,
    showOnboarding,
    alumniFirstName,
    alumniId: myAlumniId,
    eraMembers,
    myGradYear,
    initialPosts: postsData.posts,
    initialCursor: postsData.nextCursor,
  };
}

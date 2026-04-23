"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPostsAction } from "@/actions/feed";
import { listUpcoming, type UpcomingItem } from "@/actions/events";

export type HubPresenceMember = {
  id: string;
  first_name: string;
  photo_signed_url: string | null;
};

export type { UpcomingItem as HubUpcomingItem };

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  let myAlumniId: string | null = null;
  if (user?.email) {
    const { data } = await admin
      .from("alumni")
      .select("id")
      .eq("email", user.email)
      .single();
    myAlumniId = data?.id ?? null;
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
      .createSignedUrls(photoPaths, 3600);
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
    initialPosts: postsData.posts,
    initialCursor: postsData.nextCursor,
  };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FeedPost } from "@/actions/feed";

export type AlumniProfile = {
  id: string;
  first_name: string;
  last_name: string;
  grad_year: number | null;
  position: string | null;
  profession: string | null;
  job_title: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  linkedin_url: string | null;
  bio: string | null;
  photo_signed_url: string | null;
  myAlumniId: string | null;
  canMessage: boolean;
};

export async function getAlumniProfileAction(id: string): Promise<AlumniProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = createAdminClient();

  const [viewerRes, alumniRes] = await Promise.all([
    admin.from("alumni").select("id, verified").eq("email", user.email).single(),
    admin
      .from("alumni")
      .select(
        "id, first_name, last_name, grad_year, position, profession, job_title, company, city, state, linkedin_url, bio, photo_url"
      )
      .eq("id", id)
      .eq("verified", true)
      .eq("directory_visible", true)
      .single(),
  ]);

  if (!alumniRes.data) return null;

  const a = alumniRes.data;
  const viewer = viewerRes.data;
  const isVerified = viewer?.verified ?? false;

  let photo_signed_url: string | null = null;
  if (isVerified && a.photo_url) {
    const { data: sig } = await admin.storage
      .from("alumni-photos")
      .createSignedUrl(a.photo_url, 3600);
    photo_signed_url = sig?.signedUrl ?? null;
  }

  return {
    id: a.id,
    first_name: a.first_name,
    last_name: a.last_name,
    grad_year: a.grad_year,
    position: a.position,
    profession: a.profession,
    job_title: a.job_title,
    company: a.company,
    city: a.city,
    state: a.state,
    linkedin_url: isVerified ? a.linkedin_url : null,
    bio: isVerified ? a.bio : null,
    photo_signed_url,
    myAlumniId: viewer?.id ?? null,
    canMessage: isVerified && !!viewer?.id && viewer.id !== a.id,
  };
}

export async function getAlumniRecentPostsAction(
  authorId: string
): Promise<{ posts: FeedPost[]; myAlumniId: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  let myAlumniId: string | null = null;
  if (user?.email) {
    const { data } = await admin.from("alumni").select("id").eq("email", user.email).single();
    myAlumniId = data?.id ?? null;
  }

  const { data: posts } = await admin
    .from("posts")
    .select("id, body, photo_url, created_at, author_id")
    .eq("author_id", authorId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!posts?.length) return { posts: [], myAlumniId };

  const postIds = posts.map((p) => p.id);
  const [authorRes, likesRes, commentsRes] = await Promise.all([
    admin
      .from("alumni")
      .select("id, first_name, last_name, photo_url")
      .eq("id", authorId)
      .single(),
    admin.from("post_likes").select("post_id, alumni_id").in("post_id", postIds),
    admin
      .from("post_comments")
      .select("post_id")
      .in("post_id", postIds)
      .is("deleted_at", null),
  ]);

  const author = authorRes.data;
  const likes = likesRes.data ?? [];
  const comments = commentsRes.data ?? [];

  let authorPhotoUrl: string | null = null;
  if (author?.photo_url) {
    const { data: sig } = await admin.storage
      .from("alumni-photos")
      .createSignedUrl(author.photo_url, 3600);
    authorPhotoUrl = sig?.signedUrl ?? null;
  }

  // Batch-sign post photos
  const postPhotoPaths = posts.filter((p) => p.photo_url).map((p) => p.photo_url!);
  const postPhotoMap: Record<string, string> = {};
  if (postPhotoPaths.length > 0) {
    const { data: sigs } = await admin.storage
      .from("post-photos")
      .createSignedUrls(postPhotoPaths, 3600);
    (sigs ?? []).forEach((s) => {
      if (s.signedUrl && s.path) postPhotoMap[s.path] = s.signedUrl;
    });
  }

  const result: FeedPost[] = posts.map((post) => {
    const postLikes = likes.filter((l) => l.post_id === post.id);
    const postComments = comments.filter((c) => c.post_id === post.id);
    return {
      id: post.id,
      body: post.body,
      photo_signed_url: post.photo_url ? (postPhotoMap[post.photo_url] ?? null) : null,
      created_at: post.created_at,
      author_id: post.author_id,
      author_first_name: author?.first_name ?? "Unknown",
      author_last_name: author?.last_name ?? "",
      author_photo_signed_url: authorPhotoUrl,
      like_count: postLikes.length,
      comment_count: postComments.length,
      i_liked: myAlumniId ? postLikes.some((l) => l.alumni_id === myAlumniId) : false,
      reactions: [],
      my_reaction: null,
    };
  });

  return { posts: result, myAlumniId };
}

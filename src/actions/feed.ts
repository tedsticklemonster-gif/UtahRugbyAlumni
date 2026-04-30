"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { postToTelegram } from "@/lib/telegram";

export type ReactionSummary = { emoji: string; count: number }[];

export type FeedPost = {
  id: string;
  body: string;
  photo_signed_url: string | null;
  created_at: string;
  author_id: string;
  author_first_name: string;
  author_last_name: string;
  author_photo_signed_url: string | null;
  like_count: number;
  comment_count: number;
  i_liked: boolean;
  reactions: ReactionSummary;
  my_reaction: string | null;
};

export type FeedComment = {
  id: string;
  body: string;
  photo_signed_url: string | null;
  created_at: string;
  author_id: string;
  author_first_name: string;
  author_last_name: string;
  author_photo_signed_url: string | null;
};

async function signedUrl(bucket: string, path: string | null, admin: ReturnType<typeof createAdminClient>): Promise<string | null> {
  if (!path) return null;
  const { data } = await admin.storage.from(bucket).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function getPostsAction(cursor?: string): Promise<{
  posts: FeedPost[];
  nextCursor: string | null;
  myAlumniId: string | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  let myAlumniId: string | null = null;
  if (user?.email) {
    const { data } = await admin.from("alumni").select("id").eq("email", user.email).single();
    myAlumniId = data?.id ?? null;
  }

  let query = admin
    .from("posts")
    .select("id, body, photo_url, created_at, author_id")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (cursor) query = query.lt("created_at", cursor);

  const { data: posts } = await query;
  if (!posts?.length) return { posts: [], nextCursor: null, myAlumniId };

  const postIds = posts.map((p) => p.id);
  const authorIds = [...new Set(posts.map((p) => p.author_id))];

  const [authorsRes, likesRes, commentsRes, reactionsRes] = await Promise.all([
    admin.from("alumni").select("id, first_name, last_name, photo_url").in("id", authorIds),
    admin.from("post_likes").select("post_id, alumni_id").in("post_id", postIds),
    admin.from("post_comments").select("post_id").in("post_id", postIds).is("deleted_at", null),
    admin.from("post_reactions").select("post_id, alumni_id, emoji").in("post_id", postIds),
  ]);

  const authors = authorsRes.data ?? [];
  const likes = likesRes.data ?? [];
  const comments = commentsRes.data ?? [];
  const allReactions = reactionsRes.data ?? [];

  // Deduplicated signed URLs for author photos
  const authorPhotoCache = new Map<string, string | null>();
  await Promise.all(
    authors.map(async (a) => {
      if (a.photo_url && !authorPhotoCache.has(a.photo_url)) {
        authorPhotoCache.set(a.photo_url, await signedUrl("alumni-photos", a.photo_url, admin));
      }
    })
  );

  const result: FeedPost[] = await Promise.all(
    posts.map(async (post) => {
      const author = authors.find((a) => a.id === post.author_id);
      const postLikes = likes.filter((l) => l.post_id === post.id);
      const postComments = comments.filter((c) => c.post_id === post.id);
      const authorPhotoUrl = author?.photo_url ?? null;

      const postReactions = allReactions.filter((r) => r.post_id === post.id);
      const reactionMap = new Map<string, number>();
      for (const r of postReactions) reactionMap.set(r.emoji, (reactionMap.get(r.emoji) ?? 0) + 1);
      const reactions: ReactionSummary = Array.from(reactionMap.entries()).map(([emoji, count]) => ({ emoji, count }));
      const myReaction = myAlumniId ? (postReactions.find((r) => r.alumni_id === myAlumniId)?.emoji ?? null) : null;

      return {
        id: post.id,
        body: post.body,
        photo_signed_url: await signedUrl("post-photos", post.photo_url, admin),
        created_at: post.created_at,
        author_id: post.author_id,
        author_first_name: author?.first_name ?? "Unknown",
        author_last_name: author?.last_name ?? "",
        author_photo_signed_url: authorPhotoUrl ? (authorPhotoCache.get(authorPhotoUrl) ?? null) : null,
        like_count: postLikes.length,
        comment_count: postComments.length,
        i_liked: myAlumniId ? postLikes.some((l) => l.alumni_id === myAlumniId) : false,
        reactions,
        my_reaction: myReaction,
      };
    })
  );

  const nextCursor = posts.length === 20 ? posts[posts.length - 1].created_at : null;
  return { posts: result, nextCursor, myAlumniId };
}

export async function createPostAction(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: alumni } = await admin
    .from("alumni")
    .select("id, verified")
    .eq("email", user.email)
    .single();
  if (!alumni?.verified) return { error: "Account not verified" };

  const body = (formData.get("body") as string)?.trim();
  if (!body) return { error: "Post cannot be empty" };
  if (body.length > 2000) return { error: "Post is too long (max 2000 characters)" };

  let photo_url: string | null = null;
  const photoFile = formData.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    const path = `posts/${alumni.id}/${Date.now()}.jpg`;
    const { error: uploadErr } = await admin.storage
      .from("post-photos")
      .upload(path, photoFile, { contentType: "image/jpeg", upsert: false });
    if (uploadErr) return { error: "Failed to upload photo" };
    photo_url = path;
  }

  // Look up author name for Telegram message
  const { data: authorInfo } = await admin
    .from("alumni")
    .select("first_name, last_name")
    .eq("id", alumni.id)
    .single();

  const { error } = await admin
    .from("posts")
    .insert({ author_id: alumni.id, body, photo_url });

  if (error) return { error: error.message };

  // Push to Telegram channel (fire-and-forget)
  const authorName = authorInfo
    ? `${authorInfo.first_name} ${authorInfo.last_name}`
    : "A rugger";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://utah-rugby.com";
  // Escape HTML entities so user content doesn't break Telegram's HTML parse mode
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  postToTelegram(
    `<b>${esc(authorName)}</b> posted:\n\n${esc(body)}\n\n<a href="${appUrl}">View on Utah Rugby Alumni</a>`
  );

  revalidatePath("/");
  return {};
}

export async function toggleLikeAction(postId: string): Promise<{ liked: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { liked: false, error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: alumni } = await admin.from("alumni").select("id").eq("email", user.email).single();
  if (!alumni) return { liked: false, error: "Not found" };

  const { data: existing } = await admin
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("alumni_id", alumni.id)
    .single();

  if (existing) {
    await admin.from("post_likes").delete().eq("id", existing.id);
    return { liked: false };
  }

  await admin.from("post_likes").insert({ post_id: postId, alumni_id: alumni.id });
  return { liked: true };
}

export async function setReactionAction(postId: string, emoji: string | null): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: alumni } = await admin.from("alumni").select("id").eq("email", user.email).single();
  if (!alumni) return { error: "Not found" };

  if (emoji === null) {
    await admin.from("post_reactions").delete().eq("post_id", postId).eq("alumni_id", alumni.id);
  } else {
    const isNew = !(await admin.from("post_reactions").select("id").eq("post_id", postId).eq("alumni_id", alumni.id).single()).data;
    await admin.from("post_reactions").upsert(
      { post_id: postId, alumni_id: alumni.id, emoji },
      { onConflict: "post_id,alumni_id" }
    );
    // Notify post author (skip self-reactions)
    if (isNew) {
      const { data: post } = await admin.from("posts").select("author_id").eq("id", postId).single();
      if (post?.author_id && post.author_id !== alumni.id) {
        await admin.from("notifications").insert({
          recipient_id: post.author_id,
          actor_id: alumni.id,
          kind: "post_reaction",
          entity_type: "post",
          entity_id: postId,
        }).select();
      }
    }
  }
  return {};
}

export async function getCommentsAction(postId: string): Promise<FeedComment[]> {
  const admin = createAdminClient();

  const { data: comments } = await admin
    .from("post_comments")
    .select("id, body, photo_url, created_at, author_id")
    .eq("post_id", postId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (!comments?.length) return [];

  const authorIds = [...new Set(comments.map((c) => c.author_id))];
  const { data: authors } = await admin
    .from("alumni")
    .select("id, first_name, last_name, photo_url")
    .in("id", authorIds);

  const authorPhotoCache = new Map<string, string | null>();
  await Promise.all(
    (authors ?? []).map(async (a) => {
      if (a.photo_url && !authorPhotoCache.has(a.photo_url)) {
        authorPhotoCache.set(a.photo_url, await signedUrl("alumni-photos", a.photo_url, admin));
      }
    })
  );

  return Promise.all(
    comments.map(async (c) => {
      const author = (authors ?? []).find((a) => a.id === c.author_id);
      const authorPhotoUrl = author?.photo_url ?? null;
      return {
        id: c.id,
        body: c.body,
        photo_signed_url: await signedUrl("post-photos", c.photo_url, admin),
        created_at: c.created_at,
        author_id: c.author_id,
        author_first_name: author?.first_name ?? "Unknown",
        author_last_name: author?.last_name ?? "",
        author_photo_signed_url: authorPhotoUrl ? (authorPhotoCache.get(authorPhotoUrl) ?? null) : null,
      };
    })
  );
}

export async function addCommentAction(postId: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: alumni } = await admin
    .from("alumni")
    .select("id, verified")
    .eq("email", user.email)
    .single();
  if (!alumni?.verified) return { error: "Account not verified" };

  const body = (formData.get("body") as string)?.trim();
  if (!body) return { error: "Comment cannot be empty" };
  if (body.length > 1000) return { error: "Comment too long (max 1000 characters)" };

  let photo_url: string | null = null;
  const photoFile = formData.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    const path = `comments/${alumni.id}/${Date.now()}.jpg`;
    const { error: uploadErr } = await admin.storage
      .from("post-photos")
      .upload(path, photoFile, { contentType: "image/jpeg", upsert: false });
    if (!uploadErr) photo_url = path;
  }

  const { data: comment, error } = await admin
    .from("post_comments")
    .insert({ post_id: postId, author_id: alumni.id, body, photo_url })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Notify post author (skip self-comments)
  const { data: post } = await admin.from("posts").select("author_id").eq("id", postId).single();
  if (post?.author_id && post.author_id !== alumni.id) {
    await admin.from("notifications").insert({
      recipient_id: post.author_id,
      actor_id: alumni.id,
      kind: "post_comment",
      entity_type: "post",
      entity_id: postId,
    }).select();
  }

  return {};
}

export async function deleteCommentAction(commentId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: alumni } = await admin.from("alumni").select("id").eq("email", user.email).single();
  if (!alumni) return { error: "Not found" };

  // Only allow deleting own comments
  const { error } = await admin
    .from("post_comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("author_id", alumni.id);

  if (error) return { error: error.message };
  return {};
}

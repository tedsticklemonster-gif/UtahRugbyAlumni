export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPostsAction } from "@/actions/feed";
import { FeedClient } from "./feed-client";

export const metadata = {
  title: "Feed — Utah Rugby Alumni Network",
};

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { posts, nextCursor, myAlumniId } = await getPostsAction();

  return <FeedClient initialPosts={posts} initialCursor={nextCursor} myAlumniId={myAlumniId} />;
}

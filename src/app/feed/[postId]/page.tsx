import { notFound, redirect } from "next/navigation";
import { getPostAction } from "@/actions/feed";
import { PostCard } from "@/components/post-card";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  const supabase = await createClient();
  // Send logged-out visitors (e.g. from a shared link) to login instead of a
  // 404 — getPostAction now returns null without a session.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect(`/auth/login?next=/feed/${postId}`);

  const post = await getPostAction(postId);
  if (!post) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  let myAlumniId: string | null = null;
  if (user?.email) {
    const admin = createAdminClient();
    const { data } = await admin.from("alumni").select("id").eq("email", user.email).single();
    myAlumniId = data?.id ?? null;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5" />
        Back to Feed
      </Link>

      <PostCard post={post} myAlumniId={myAlumniId} />
    </div>
  );
}

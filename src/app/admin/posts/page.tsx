export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";
import { PostsModeration } from "@/components/admin/PostsModeration";

export const metadata = { title: "Posts — Admin" };

export default async function PostsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string; page?: string }>;
}) {
  const params = await searchParams;
  const showDeleted = params.show === "deleted";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  const admin = createAdminClient();

  let query = admin
    .from("posts")
    .select(
      `id, body, photo_url, created_at, deleted_at,
       author:alumni!author_id(id, first_name, last_name)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (showDeleted) {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
  }

  const { data: posts, count } = await query;
  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <AdminPage
      title="Post Moderation"
      description={`${total} ${showDeleted ? "hidden" : "live"} post${total !== 1 ? "s" : ""}`}
    >
      <PostsModeration
        posts={(posts ?? []) as unknown as Parameters<typeof PostsModeration>[0]["posts"]}
        showDeleted={showDeleted}
        page={page}
        totalPages={totalPages}
      />
    </AdminPage>
  );
}

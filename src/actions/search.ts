"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SearchResult =
  | { type: "alumni"; id: string; first_name: string; last_name: string; grad_year: number | null; profession: string | null; company: string | null; photo_url: string | null }
  | { type: "post"; id: string; body: string; author_name: string; created_at: string }
  | { type: "event"; id: string; title: string; starts_at: string; kind: string };

export async function searchAction(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return [];

  const admin = createAdminClient();
  const q = query.trim().toLowerCase();
  const pattern = `%${q}%`;

  const [alumniRes, postsRes, eventsRes] = await Promise.all([
    admin
      .from("alumni")
      .select("id, first_name, last_name, grad_year, profession, company, photo_url")
      .in("status", ["self_registered", "imported"])
      .eq("directory_visible", true)
      .or(`first_name.ilike.${pattern},last_name.ilike.${pattern},company.ilike.${pattern},profession.ilike.${pattern}`)
      .limit(10),
    admin
      .from("posts")
      .select("id, body, author_id, created_at")
      .is("deleted_at", null)
      .ilike("body", pattern)
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("events")
      .select("id, title, starts_at, kind")
      .is("deleted_at", null)
      .ilike("title", pattern)
      .order("starts_at", { ascending: false })
      .limit(5),
  ]);

  const results: SearchResult[] = [];

  for (const a of alumniRes.data ?? []) {
    results.push({ type: "alumni", ...a });
  }

  // Resolve post author names
  const postAuthorIds = [...new Set((postsRes.data ?? []).map((p) => p.author_id))];
  const authorsRes = postAuthorIds.length
    ? await admin.from("alumni").select("id, first_name, last_name").in("id", postAuthorIds)
    : { data: [] };
  const authorMap = new Map((authorsRes.data ?? []).map((a) => [a.id, `${a.first_name} ${a.last_name}`]));

  for (const p of postsRes.data ?? []) {
    results.push({
      type: "post",
      id: p.id,
      body: p.body.length > 120 ? p.body.slice(0, 120) + "…" : p.body,
      author_name: authorMap.get(p.author_id) ?? "Unknown",
      created_at: p.created_at,
    });
  }

  for (const e of eventsRes.data ?? []) {
    results.push({ type: "event", ...e });
  }

  return results;
}

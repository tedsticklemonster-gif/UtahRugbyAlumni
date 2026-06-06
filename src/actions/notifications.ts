"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AppNotification = {
  id: string;
  kind: string;
  entity_type: string | null;
  entity_id: string | null;
  actor_id: string | null;
  read_at: string | null;
  created_at: string;
  actor_first_name: string | null;
  actor_last_name: string | null;
  actor_photo_signed_url: string | null;
  body_preview: string | null;
};

async function getMyId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("alumni").select("id").eq("email", user.email).single();
  return data?.id ?? null;
}

export async function listNotificationsAction(): Promise<AppNotification[]> {
  const myId = await getMyId();
  if (!myId) return [];

  const admin = createAdminClient();
  const { data: notifs } = await admin
    .from("notifications")
    .select("id, kind, entity_type, entity_id, read_at, created_at, actor_id, body_preview")
    .eq("recipient_id", myId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!notifs?.length) return [];

  const actorIds = [...new Set(notifs.map((n) => n.actor_id).filter(Boolean))];
  const actorsRes = actorIds.length
    ? await admin.from("alumni").select("id, first_name, last_name, photo_url").in("id", actorIds)
    : { data: [] };
  const actors = actorsRes.data ?? [];

  // Batch-sign actor photos
  const photoPaths = actors.filter((a) => a.photo_url).map((a) => a.photo_url!);
  const signedMap: Record<string, string> = {};
  if (photoPaths.length) {
    const { data: sigs } = await admin.storage.from("alumni-photos").createSignedUrls(photoPaths, 3600);
    (sigs ?? []).forEach((s) => { if (s.signedUrl && s.path) signedMap[s.path] = s.signedUrl; });
  }

  return notifs.map((n) => {
    const actor = actors.find((a) => a.id === n.actor_id);
    return {
      id: n.id,
      kind: n.kind,
      entity_type: n.entity_type,
      entity_id: n.entity_id,
      actor_id: n.actor_id ?? null,
      read_at: n.read_at,
      created_at: n.created_at,
      actor_first_name: actor?.first_name ?? null,
      actor_last_name: actor?.last_name ?? null,
      actor_photo_signed_url: actor?.photo_url ? (signedMap[actor.photo_url] ?? null) : null,
      body_preview: n.body_preview ?? null,
    };
  });
}

export async function markAllReadAction(): Promise<void> {
  const myId = await getMyId();
  if (!myId) return;
  const admin = createAdminClient();
  await admin
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", myId)
    .is("read_at", null);
}

export async function markReadAction(id: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
}

export async function getUnreadCountAction(): Promise<number> {
  const myId = await getMyId();
  if (!myId) return 0;
  const admin = createAdminClient();
  const { count } = await admin
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", myId)
    .is("read_at", null);
  return count ?? 0;
}

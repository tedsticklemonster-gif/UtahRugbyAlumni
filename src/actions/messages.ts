"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToAlumni } from "@/lib/push";

export type Conversation = {
  other_id: string;
  other_first_name: string;
  other_last_name: string;
  other_photo_signed_url: string | null;
  last_message_body: string;
  last_message_at: string;
  last_sent_by_me: boolean;
  unread_count: number;
};

export type Message = {
  id: string;
  sender_id: string;
  body: string;
  photo_signed_url: string | null;
  created_at: string;
  read_at: string | null;
};

export type ThreadPartner = {
  id: string;
  first_name: string;
  last_name: string;
  photo_signed_url: string | null;
};

async function getCurrentAlumni() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("alumni").select("id, first_name, last_name").eq("email", user.email).single();
  return data ?? null;
}

export async function getConversationsAction(): Promise<{
  conversations: Conversation[];
  myId: string | null;
}> {
  const me = await getCurrentAlumni();
  if (!me) return { conversations: [], myId: null };

  const admin = createAdminClient();

  const { data: msgs } = await admin
    .from("messages")
    .select("id, sender_id, recipient_id, body, created_at, read_at")
    .or(`sender_id.eq.${me.id},recipient_id.eq.${me.id}`)
    .order("created_at", { ascending: false })
    .limit(200);

  if (!msgs?.length) return { conversations: [], myId: me.id };

  // Group by conversation partner
  const convMap = new Map<string, {
    lastMsg: typeof msgs[0];
    unread: number;
  }>();

  for (const msg of msgs) {
    const otherId = msg.sender_id === me.id ? msg.recipient_id : msg.sender_id;
    if (!convMap.has(otherId)) {
      convMap.set(otherId, { lastMsg: msg, unread: 0 });
    }
    if (msg.recipient_id === me.id && !msg.read_at) {
      convMap.get(otherId)!.unread++;
    }
  }

  const otherIds = [...convMap.keys()];
  const { data: others } = await admin
    .from("alumni")
    .select("id, first_name, last_name, photo_url")
    .in("id", otherIds);

  const conversations: Conversation[] = await Promise.all(
    otherIds.map(async (otherId) => {
      const { lastMsg, unread } = convMap.get(otherId)!;
      const other = (others ?? []).find((a) => a.id === otherId);

      let photoSignedUrl: string | null = null;
      if (other?.photo_url) {
        const { data } = await admin.storage
          .from("alumni-photos")
          .createSignedUrl(other.photo_url, 3600);
        photoSignedUrl = data?.signedUrl ?? null;
      }

      return {
        other_id: otherId,
        other_first_name: other?.first_name ?? "Unknown",
        other_last_name: other?.last_name ?? "",
        other_photo_signed_url: photoSignedUrl,
        last_message_body: lastMsg.body,
        last_message_at: lastMsg.created_at,
        last_sent_by_me: lastMsg.sender_id === me.id,
        unread_count: unread,
      };
    })
  );

  conversations.sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));

  return { conversations, myId: me.id };
}

export async function getThreadAction(otherAlumniId: string): Promise<{
  messages: Message[];
  partner: ThreadPartner | null;
  myId: string | null;
}> {
  const me = await getCurrentAlumni();
  if (!me) return { messages: [], partner: null, myId: null };

  const admin = createAdminClient();

  const { data: partner } = await admin
    .from("alumni")
    .select("id, first_name, last_name, photo_url")
    .eq("id", otherAlumniId)
    .single();

  let partnerPhotoSignedUrl: string | null = null;
  if (partner?.photo_url) {
    const { data } = await admin.storage
      .from("alumni-photos")
      .createSignedUrl(partner.photo_url, 3600);
    partnerPhotoSignedUrl = data?.signedUrl ?? null;
  }

  const { data: msgs } = await admin
    .from("messages")
    .select("id, sender_id, body, photo_url, created_at, read_at")
    .or(
      `and(sender_id.eq.${me.id},recipient_id.eq.${otherAlumniId}),and(sender_id.eq.${otherAlumniId},recipient_id.eq.${me.id})`
    )
    .order("created_at", { ascending: true })
    .limit(100);

  // Mark unread messages from partner as read
  const unreadIds = (msgs ?? [])
    .filter((m) => m.sender_id === otherAlumniId && !m.read_at)
    .map((m) => m.id);

  if (unreadIds.length) {
    await admin
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);
  }

  const messages: Message[] = await Promise.all(
    (msgs ?? []).map(async (m) => {
      let photoSignedUrl: string | null = null;
      if (m.photo_url) {
        const { data } = await admin.storage
          .from("post-photos")
          .createSignedUrl(m.photo_url, 3600);
        photoSignedUrl = data?.signedUrl ?? null;
      }
      return {
        id: m.id,
        sender_id: m.sender_id,
        body: m.body,
        photo_signed_url: photoSignedUrl,
        created_at: m.created_at,
        read_at: m.read_at,
      };
    })
  );

  return {
    messages,
    partner: partner
      ? {
          id: partner.id,
          first_name: partner.first_name,
          last_name: partner.last_name,
          photo_signed_url: partnerPhotoSignedUrl,
        }
      : null,
    myId: me.id,
  };
}

export async function sendMessageAction(
  recipientId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const me = await getCurrentAlumni();
  if (!me) return { error: "Not authenticated" };

  const body = (formData.get("body") as string)?.trim();
  if (!body) return { error: "Message cannot be empty" };
  if (body.length > 2000) return { error: "Message too long" };

  const admin = createAdminClient();

  let photo_url: string | null = null;
  const photoFile = formData.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    const path = `messages/${me.id}/${Date.now()}.jpg`;
    const { error: uploadErr } = await admin.storage
      .from("post-photos")
      .upload(path, photoFile, { contentType: "image/jpeg", upsert: false });
    if (!uploadErr) photo_url = path;
  }

  const { error } = await admin.from("messages").insert({
    sender_id: me.id,
    recipient_id: recipientId,
    body,
    photo_url,
  });

  if (error) return { error: error.message };

  // Fire-and-forget push notification to recipient
  sendPushToAlumni(recipientId, {
    title: `${me.first_name} ${me.last_name}`,
    body: body.length > 80 ? body.slice(0, 80) + "…" : body,
    url: `/messages/${me.id}`,
  }).catch(() => {});

  return {};
}

export async function getNewMessagesAction(
  otherAlumniId: string,
  since: string
): Promise<Message[]> {
  const me = await getCurrentAlumni();
  if (!me) return [];

  const admin = createAdminClient();

  const { data: msgs } = await admin
    .from("messages")
    .select("id, sender_id, body, photo_url, created_at, read_at")
    .or(
      `and(sender_id.eq.${me.id},recipient_id.eq.${otherAlumniId}),and(sender_id.eq.${otherAlumniId},recipient_id.eq.${me.id})`
    )
    .gt("created_at", since)
    .order("created_at", { ascending: true });

  if (!msgs?.length) return [];

  // Mark new received messages as read
  const unreadIds = msgs.filter((m) => m.sender_id === otherAlumniId && !m.read_at).map((m) => m.id);
  if (unreadIds.length) {
    await admin.from("messages").update({ read_at: new Date().toISOString() }).in("id", unreadIds);
  }

  return msgs.map((m) => ({
    id: m.id,
    sender_id: m.sender_id,
    body: m.body,
    photo_signed_url: null,
    created_at: m.created_at,
    read_at: m.read_at,
  }));
}

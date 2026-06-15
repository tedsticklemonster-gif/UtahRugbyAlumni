"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type EventPhoto = {
  id: string;
  storage_path: string;
  signed_url: string;
  caption: string | null;
  alumni_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
};

export async function listEventPhotos(eventId: string): Promise<EventPhoto[]> {
  const admin = createAdminClient();

  const { data: photos } = await admin
    .from("event_photos")
    .select("id, storage_path, caption, alumni_id, created_at")
    .eq("event_id", eventId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (!photos?.length) return [];

  // Get uploader names
  const alumniIds = [...new Set(photos.map((p) => p.alumni_id))];
  const { data: alumni } = await admin
    .from("alumni")
    .select("id, first_name, last_name")
    .in("id", alumniIds);

  const alumniMap = new Map((alumni ?? []).map((a) => [a.id, a]));

  // Generate signed URLs
  const paths = photos.map((p) => p.storage_path);
  const { data: signedData } = await admin.storage
    .from("event-photos")
    .createSignedUrls(paths, 86400);

  const signedMap = new Map(
    (signedData ?? []).map((s) => [s.path, s.signedUrl])
  );

  return photos.map((p) => {
    const alum = alumniMap.get(p.alumni_id);
    return {
      id: p.id,
      storage_path: p.storage_path,
      signed_url: signedMap.get(p.storage_path) ?? "",
      caption: p.caption,
      alumni_id: p.alumni_id,
      first_name: alum?.first_name ?? "Alumni",
      last_name: alum?.last_name ?? "",
      created_at: p.created_at,
    };
  });
}

export async function uploadEventPhotos(
  eventId: string,
  formData: FormData
): Promise<{ count: number; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { count: 0, error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: alumni } = await admin
    .from("alumni")
    .select("id, verified")
    .eq("email", user.email)
    .maybeSingle();

  if (!alumni?.verified) return { count: 0, error: "Account not verified" };

  // Extract files from FormData
  const files: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (key === "photos" && value instanceof File && value.size > 0) {
      files.push(value);
    }
  }

  if (files.length === 0) return { count: 0, error: "No photos selected" };
  if (files.length > 10) return { count: 0, error: "Maximum 10 photos at a time" };

  let uploaded = 0;

  for (const file of files) {
    const timestamp = Date.now();
    const path = `events/${eventId}/${alumni.id}/${timestamp}.jpg`;

    const { error: uploadError } = await admin.storage
      .from("event-photos")
      .upload(path, file, { contentType: "image/jpeg", upsert: false });

    if (uploadError) {
      console.error(`[uploadEventPhotos] Upload failed:`, uploadError);
      continue;
    }

    await admin.from("event_photos").insert({
      event_id: eventId,
      alumni_id: alumni.id,
      storage_path: path,
    });

    uploaded++;
  }

  revalidatePath(`/events/${eventId}`);
  return { count: uploaded };
}

export async function deleteEventPhoto(
  photoId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: alumni } = await admin
    .from("alumni")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  if (!alumni) return { error: "Not found" };

  // Only the uploader can delete
  const { data: photo } = await admin
    .from("event_photos")
    .select("id, event_id, alumni_id, storage_path")
    .eq("id", photoId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!photo) return { error: "Photo not found" };

  // Check: uploader or event creator
  const { data: event } = await admin
    .from("events")
    .select("creator_id")
    .eq("id", photo.event_id)
    .maybeSingle();

  if (photo.alumni_id !== alumni.id && event?.creator_id !== alumni.id) {
    return { error: "Not authorized" };
  }

  // Soft delete
  await admin
    .from("event_photos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", photoId);

  revalidatePath(`/events/${photo.event_id}`);
  return {};
}

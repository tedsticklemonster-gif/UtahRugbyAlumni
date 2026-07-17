"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileUpdateSchema } from "@/lib/validators";

export type ProfileState = {
  success: boolean;
  error?: string;
};

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { success: false, error: "Not authenticated." };
  }

  const raw = formData.get("data");
  if (!raw || typeof raw !== "string") {
    return { success: false, error: "Invalid form data." };
  }

  const parsed = profileUpdateSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: `${firstError.path.join(".")}: ${firstError.message}`,
    };
  }

  const data = parsed.data;
  const admin = createAdminClient();

  // Get the alumni record for this user
  const { data: alumni } = await admin
    .from("alumni")
    .select("id, photo_url")
    .eq("email", user.email)
    .maybeSingle();

  if (!alumni) {
    return { success: false, error: "Alumni record not found." };
  }

  // Handle photo upload
  let photoUrl = alumni.photo_url;
  const photoFile = formData.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split(".").pop() ?? "jpg";
    const path = `${alumni.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("alumni-photos")
      .upload(path, photoFile, {
        contentType: photoFile.type,
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: "Photo upload failed." };
    }

    // Delete old photo if it exists
    if (alumni.photo_url) {
      await admin.storage.from("alumni-photos").remove([alumni.photo_url]);
    }

    photoUrl = path;
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    first_name: data.first_name,
    last_name: data.last_name,
    grad_year: data.grad_year ?? null,
    position: data.position || null,
    phone: data.phone || null,
    profession: data.profession || null,
    job_title: data.job_title || null,
    company: data.company || null,
    city: data.city || null,
    state: data.state || null,
    linkedin_url: data.linkedin_url || null,
    bio: data.bio || null,
    photo_url: photoUrl,
    directory_visible: data.directory_visible,
    availability: data.availability ?? "not_specified",
    hiring: data.hiring ?? false,
    services: data.services && data.services.length > 0 ? data.services : null,
    industries: data.industries && data.industries.length > 0 ? data.industries : null,
    years_experience: data.years_experience ?? null,
    willing_to_mentor: data.willing_to_mentor ?? false,
    website_url: data.website_url || null,
    instagram_handle: data.instagram_handle || null,
  };

  // SMS CONSENT: Only update sms_consent_at when consent changes to true.
  // NEVER send SMS unless sms_consent = true.
  if (data.sms_consent !== undefined) {
    updateData.sms_consent = data.sms_consent;
    if (data.sms_consent) {
      updateData.sms_consent_at = new Date().toISOString();
    }
  }

  const { error: updateError } = await admin
    .from("alumni")
    .update(updateData)
    .eq("id", alumni.id);

  if (updateError) {
    console.error("Profile update error:", updateError);
    return { success: false, error: "Update failed. Please try again." };
  }

  revalidatePath("/me");
  revalidatePath("/network");

  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function deleteAccountAction(): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { success: false, error: "Not authenticated." };
  }

  const admin = createAdminClient();

  // Get the alumni record
  const { data: alumni } = await admin
    .from("alumni")
    .select("id, photo_url")
    .eq("email", user.email)
    .maybeSingle();

  if (!alumni) {
    return { success: false, error: "Alumni record not found." };
  }

  // Delete photo from storage
  if (alumni.photo_url) {
    await admin.storage.from("alumni-photos").remove([alumni.photo_url]);
  }

  // Clear PII and set status to opted_out
  await admin
    .from("alumni")
    .update({
      first_name: "Deleted",
      last_name: "User",
      email: `deleted-${alumni.id}@removed.local`,
      phone: null,
      profession: null,
      job_title: null,
      company: null,
      city: null,
      state: null,
      linkedin_url: null,
      photo_url: null,
      bio: null,
      sms_consent: false,
      directory_visible: false,
      status: "opted_out",
      notes: `Account deleted by user on ${new Date().toISOString()}`,
    })
    .eq("id", alumni.id);

  // Sign out
  await supabase.auth.signOut();

  return { success: true };
}

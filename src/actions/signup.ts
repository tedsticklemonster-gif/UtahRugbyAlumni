"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { signupSchema } from "@/lib/validators";

export type SignupState = {
  success: boolean;
  error?: string;
  alumniId?: string;
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  // Parse the JSON payload from the form
  const raw = formData.get("data");
  if (!raw || typeof raw !== "string") {
    return { success: false, error: "Invalid form data." };
  }

  const parsed = signupSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: `${firstError.path.join(".")}: ${firstError.message}`,
    };
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  // Check for duplicate email
  const { data: existing } = await supabase
    .from("alumni")
    .select("id")
    .eq("email", data.email)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error:
        "This email is already registered. Try signing in instead.",
    };
  }

  // Upload photo if provided
  let photoUrl: string | null = null;
  const photoFile = formData.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    // We'll upload after creating the alumni record so we have the ID
  }

  // Call the register_alumni RPC
  const { data: alumniId, error: rpcError } = await supabase.rpc(
    "register_alumni",
    {
      p_first_name: data.first_name,
      p_last_name: data.last_name,
      p_email: data.email,
      p_grad_year: data.grad_year ?? null,
      p_position: data.position || null,
      p_phone: data.phone || null,
      p_profession: data.profession || null,
      p_job_title: data.job_title || null,
      p_company: data.company || null,
      p_city: data.city || null,
      p_state: data.state || null,
      p_linkedin_url: data.linkedin_url || null,
      p_bio: data.bio || null,
      p_photo_url: null, // Set after upload
      // SMS CONSENT: Only store true if user explicitly checked the box.
      // NEVER default this to true.
      p_sms_consent: data.sms_consent,
      p_directory_visible: data.directory_visible,
      p_referred_by_token: data.referred_by_token || null,
      p_availability: data.availability ?? "not_specified",
      p_hiring: data.hiring ?? false,
      p_services: data.services && data.services.length > 0 ? data.services : null,
      p_industries: data.industries && data.industries.length > 0 ? data.industries : null,
      p_years_experience: data.years_experience ?? null,
      p_willing_to_mentor: data.willing_to_mentor ?? false,
      p_website_url: data.website_url || null,
      p_instagram_handle: data.instagram_handle || null,
    }
  );

  if (rpcError) {
    console.error("register_alumni RPC error:", rpcError);
    return { success: false, error: "Registration failed. Please try again." };
  }

  // Upload photo now that we have the alumni ID
  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split(".").pop() ?? "jpg";
    const path = `${alumniId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("alumni-photos")
      .upload(path, photoFile, {
        contentType: photoFile.type,
        upsert: false,
      });

    if (!uploadError) {
      photoUrl = path;
      await supabase
        .from("alumni")
        .update({ photo_url: photoUrl })
        .eq("id", alumniId);
    }
    // Non-fatal: registration succeeds even if photo upload fails
  }

  // Send magic link for email verification via Supabase Auth
  const { error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    email_confirm: false,
    user_metadata: { alumni_id: alumniId },
  });

  if (authError && !authError.message.includes("already been registered")) {
    console.error("Auth user creation error:", authError);
    // Non-fatal: alumni row is created, they can request a magic link later
  }

  // Send the magic link email
  // Note: Using admin client's generateLink to create the magic link,
  // then Supabase sends the built-in email template.
  await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: data.email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  // Log the welcome email send
  await supabase.from("email_sends").insert({
    alumni_id: alumniId,
    recipient_email: data.email,
    campaign: "welcome",
    sent_at: new Date().toISOString(),
  });

  return { success: true, alumniId: alumniId as string };
}

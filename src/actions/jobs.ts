"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  description: string;
  salary_range: string | null;
  apply_url: string | null;
  created_at: string;
  alumni_id: string;
  alumni_first_name: string;
  alumni_last_name: string;
  alumni_photo_url: string | null;
  alumni_grad_year: number | null;
};

async function getMyId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("alumni").select("id").eq("email", user.email).maybeSingle();
  return data?.id ?? null;
}

export async function listJobsAction(): Promise<JobListing[]> {
  const admin = createAdminClient();
  const { data: jobs } = await admin
    .from("job_listings")
    .select("id, title, company, location, remote, description, salary_range, apply_url, created_at, alumni_id")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!jobs?.length) return [];

  const alumniIds = [...new Set(jobs.map((j) => j.alumni_id))];
  const { data: alumni } = await admin
    .from("alumni")
    .select("id, first_name, last_name, photo_url, grad_year")
    .in("id", alumniIds);

  const alumniMap = new Map((alumni ?? []).map((a) => [a.id, a]));

  return jobs.map((j) => {
    const a = alumniMap.get(j.alumni_id);
    return {
      ...j,
      alumni_first_name: a?.first_name ?? "Unknown",
      alumni_last_name: a?.last_name ?? "",
      alumni_photo_url: a?.photo_url ?? null,
      alumni_grad_year: a?.grad_year ?? null,
    };
  });
}

export async function createJobAction(formData: FormData): Promise<{ error?: string }> {
  const myId = await getMyId();
  if (!myId) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const title = (formData.get("title") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  if (!title || !company || !description) return { error: "Title, company, and description are required" };

  const { error } = await admin.from("job_listings").insert({
    alumni_id: myId,
    title,
    company,
    location: (formData.get("location") as string)?.trim() || null,
    remote: formData.get("remote") === "true",
    description,
    salary_range: (formData.get("salary_range") as string)?.trim() || null,
    apply_url: (formData.get("apply_url") as string)?.trim() || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/jobs");
  return {};
}

export async function closeJobAction(jobId: string): Promise<{ error?: string }> {
  const myId = await getMyId();
  if (!myId) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("job_listings")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("alumni_id", myId);

  if (error) return { error: error.message };
  revalidatePath("/jobs");
  return {};
}

export async function toggleBookmarkAction(targetAlumniId?: string, targetJobId?: string): Promise<{ bookmarked: boolean; error?: string }> {
  const myId = await getMyId();
  if (!myId) return { bookmarked: false, error: "Not authenticated" };

  const admin = createAdminClient();

  const matchField = targetAlumniId ? "target_alumni_id" : "target_job_id";
  const matchValue = targetAlumniId ?? targetJobId;

  const { data: existing } = await admin
    .from("bookmarks")
    .select("id")
    .eq("alumni_id", myId)
    .eq(matchField, matchValue!)
    .maybeSingle();

  if (existing) {
    await admin.from("bookmarks").delete().eq("id", existing.id);
    return { bookmarked: false };
  }

  const insert: Record<string, string> = { alumni_id: myId };
  if (targetAlumniId) insert.target_alumni_id = targetAlumniId;
  if (targetJobId) insert.target_job_id = targetJobId;

  await admin.from("bookmarks").insert(insert);
  return { bookmarked: true };
}

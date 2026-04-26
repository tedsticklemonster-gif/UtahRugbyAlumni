import { createAdminClient } from "@/lib/supabase/admin";

export interface JobResult {
  ok: boolean;
  [key: string]: unknown;
}

export interface JobDefinition {
  name: string;
  schedule: string; // cron expression for reference
  run: () => Promise<JobResult>;
}

/**
 * Wraps a job's run() with start/end recording in job_runs.
 * Returns the job result; never throws.
 */
export async function runJob(job: JobDefinition): Promise<JobResult> {
  const admin = createAdminClient();

  // Record start
  const { data: run } = await admin
    .from("job_runs")
    .insert({ job_name: job.name, status: "running" })
    .select("id")
    .single();

  let result: JobResult = { ok: false };
  let status: "success" | "error" = "error";

  try {
    result = await job.run();
    status = result.ok ? "success" : "error";
  } catch (err) {
    result = { ok: false, error: String(err) };
  }

  // Record end
  if (run?.id) {
    await admin
      .from("job_runs")
      .update({ status, ended_at: new Date().toISOString(), result })
      .eq("id", run.id);
  }

  return result;
}

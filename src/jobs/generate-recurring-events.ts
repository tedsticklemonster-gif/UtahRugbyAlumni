import { createAdminClient } from "@/lib/supabase/admin";
import { generateOccurrences } from "@/lib/recurrence";
import type { RecurrenceRule } from "@/lib/recurrence";
import type { JobDefinition, JobResult } from "@/jobs/index";

export const generateRecurringEvents: JobDefinition = {
  name: "generate-recurring-events",
  schedule: "0 6 * * *", // daily at 6 AM UTC
  async run(): Promise<JobResult> {
    const admin = createAdminClient();

    // Find all parent events (have recurrence_rule, no series_id)
    const { data: parents } = await admin
      .from("events")
      .select("id, title, description, starts_at, ends_at, location, location_url, kind, creator_id, recurrence_rule, recurrence_end")
      .not("recurrence_rule", "is", null)
      .is("series_id", null)
      .is("deleted_at", null);

    if (!parents?.length) return { ok: true, parents: 0, created: 0 };

    const now = new Date();
    const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    let totalCreated = 0;

    for (const parent of parents) {
      const rule = parent.recurrence_rule as RecurrenceRule;
      const recEnd = parent.recurrence_end ? new Date(parent.recurrence_end) : threeMonths;
      const until = recEnd < threeMonths ? recEnd : threeMonths;

      // Get existing instances for this series
      const { data: existing } = await admin
        .from("events")
        .select("starts_at")
        .eq("series_id", parent.id)
        .is("deleted_at", null);

      const existingDates = new Set(
        (existing ?? []).map((e) => new Date(e.starts_at).toISOString().slice(0, 10))
      );

      // Generate missing occurrences
      const occurrences = generateOccurrences(
        new Date(parent.starts_at),
        parent.ends_at ? new Date(parent.ends_at) : null,
        rule,
        now, // only generate future instances
        until
      );

      const toInsert = occurrences.filter(
        (o) => !existingDates.has(o.starts_at.toISOString().slice(0, 10))
      );

      for (const occ of toInsert) {
        await admin.from("events").insert({
          creator_id: parent.creator_id,
          title: parent.title,
          description: parent.description,
          starts_at: occ.starts_at.toISOString(),
          ends_at: occ.ends_at?.toISOString() ?? null,
          location: parent.location,
          location_url: parent.location_url,
          kind: parent.kind,
          series_id: parent.id,
        });
        totalCreated++;
      }
    }

    return { ok: true, parents: parents.length, created: totalCreated };
  },
};

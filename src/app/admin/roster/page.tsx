export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { RosterTable } from "@/components/roster-table";
import { updateAlumniStatusAction, deleteAlumniAction } from "@/actions/admin";
import { RosterExportButton } from "@/components/admin/RosterExportButton";

export const metadata = {
  title: "Roster — Utah Rugby Alumni Network Admin",
};

export default async function RosterPage() {
  const supabase = createAdminClient();

  const [{ data: alumni }, { data: tokenStats }] = await Promise.all([
    supabase
      .from("alumni")
      .select(
        "id, first_name, last_name, grad_year, email, phone, status, verified, directory_visible, sms_consent, source, last_contacted_at, created_at, sponsor_tier, lifetime_giving_cents"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("forward_tokens")
      .select("referrer_alumni_id, signups_attributed"),
  ]);

  // Build referral count map: alumni_id -> total signups
  const referralMap = new Map<string, number>();
  for (const t of tokenStats ?? []) {
    if (t.referrer_alumni_id) {
      referralMap.set(
        t.referrer_alumni_id,
        (referralMap.get(t.referrer_alumni_id) ?? 0) + (t.signups_attributed ?? 0)
      );
    }
  }

  // Merge referral counts into alumni data
  const alumniWithReferrals = (alumni ?? []).map((a) => ({
    ...a,
    referral_count: referralMap.get(a.id) ?? 0,
  }));

  async function handleStatusChange(ids: string[], status: string) {
    "use server";
    await updateAlumniStatusAction(ids, status);
  }

  async function handleDelete(
    ids: string[]
  ): Promise<{ success: boolean; error?: string; deleted: number }> {
    "use server";
    return deleteAlumniAction(ids);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Roster</h1>
        <RosterExportButton />
      </div>
      <RosterTable
        alumni={alumniWithReferrals}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { RosterTable } from "@/components/roster-table";
import { updateAlumniStatusAction, deleteAlumniAction } from "@/actions/admin";

export const metadata = {
  title: "Roster — Utah Rugby Alumni Network Admin",
};

export default async function RosterPage() {
  const supabase = createAdminClient();

  const { data: alumni } = await supabase
    .from("alumni")
    .select(
      "id, first_name, last_name, grad_year, email, phone, status, verified, directory_visible, sms_consent, source, created_at"
    )
    .order("created_at", { ascending: false });

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
      <h1 className="text-2xl font-bold tracking-tight mb-6">Roster</h1>
      <RosterTable
        alumni={alumni ?? []}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";

import { listAuthUsersAction } from "@/actions/access";
import { AccessTable } from "@/components/access-table";

export const metadata = {
  title: "Access — Utah Rugby Alumni Network Admin",
};

export default async function AccessPage() {
  const [{ users, error }, { count: totalAlumni }] = await Promise.all([
    listAuthUsersAction(),
    (await import("@/lib/supabase/admin")).createAdminClient()
      .from("alumni")
      .select("id", { count: "exact", head: true })
      .in("status", ["self_registered", "imported"]),
  ]);

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-6">Access</h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Access</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Grant or revoke admin access for verified alumni. Admins can manage the
        roster, send emails, and import data.
      </p>
      {totalAlumni !== null && (
        <p className="text-xs text-muted-foreground mb-4">
          {users.length} of {totalAlumni} alumni have created accounts.
          Only alumni with accounts can be granted admin access.
        </p>
      )}
      <AccessTable users={users} />
    </div>
  );
}

export const dynamic = "force-dynamic";

import { listAuthUsersAction } from "@/actions/access";
import { AccessTable } from "@/components/access-table";

export const metadata = {
  title: "Access — Utah Rugby Alumni Network Admin",
};

export default async function AccessPage() {
  const { users, error } = await listAuthUsersAction();

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
      <AccessTable users={users} />
    </div>
  );
}

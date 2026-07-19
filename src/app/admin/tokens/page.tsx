export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { listForwardTokensAction } from "@/actions/admin";
import { TokensManager } from "@/components/tokens-manager";

export const metadata = {
  title: "Forward Tokens — Utah Rugby Alumni Network Admin",
};

export default async function TokensPage() {
  const { tokens, error } = await listForwardTokensAction();

  // Fetch alumni list for the token creation dropdown
  const admin = createAdminClient();
  const { data: alumni } = await admin
    .from("alumni")
    .select("id, first_name, last_name, email")
    .order("last_name", { ascending: true });

  if (error) {
    return (
      <div>
        <h1 className="text-title-1 mb-6">
          Forward Tokens
        </h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-title-1 mb-6">
        Forward Tokens
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Create personalized forward links for alumni to share. When someone
        signs up via a forward link, the referral is attributed to the alumni.
      </p>
      <TokensManager tokens={tokens} alumni={alumni ?? []} />
    </div>
  );
}

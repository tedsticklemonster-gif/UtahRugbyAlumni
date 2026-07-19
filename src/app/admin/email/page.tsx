export const dynamic = "force-dynamic";

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { EmailSendForm } from "@/components/email-send-form";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Send Email — Utah Rugby Alumni Network Admin",
};

export default async function EmailPage() {
  const supabase = createAdminClient();

  const { data: alumni } = await supabase
    .from("alumni")
    .select("id, first_name, last_name, email, status, grad_year")
    .not("status", "eq", "opted_out")
    .order("last_name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-title-1">Send Email</h1>
        <Link
          href="/admin/email/metrics"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View Metrics
        </Link>
      </div>
      <EmailSendForm allAlumni={alumni ?? []} />
    </div>
  );
}

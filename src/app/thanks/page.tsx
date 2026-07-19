import Link from "next/link";
import { Mail, Share2, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { CopyForwardLink } from "@/components/copy-forward-link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "You're in — Utah Rugby Alumni",
};

export default async function ThanksPage() {
  // Try to get the user's personal forward token
  let forwardToken: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const admin = createAdminClient();
      const { data: alumni } = await admin
        .from("alumni")
        .select("id")
        .eq("email", user.email)
        .single();
      if (alumni) {
        const { data: tokenData } = await admin
          .from("forward_tokens")
          .select("token")
          .eq("referrer_alumni_id", alumni.id)
          .maybeSingle();
        forwardToken = tokenData?.token ?? null;
      }
    }
  } catch {
    // Not logged in yet — use generic link
  }
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Red accent bar */}
      <div className="h-1.5 bg-utah-red" />

      <div className="mx-auto max-w-xl px-5 py-8 md:px-10">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <h1 className="text-display text-3xl text-white">
            You&rsquo;re in.
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Welcome to the Utah Rugby Alumni network.
          </p>
        </div>

        {/* Step 1 — verify email */}
        <div className="mb-3 surface-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-utah-red/15">
              <Mail className="size-4 text-utah-red" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-utah-red">
                Step 1
              </p>
              <p className="mt-0.5 text-base font-bold text-white">
                Verify your email
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                Check your inbox for a sign-in link. Clicking it verifies
                you and unlocks photos, LinkedIn, and messaging for other
                alumni.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2 — share with teammates */}
        <div className="mb-3 surface-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-info/15">
              <Share2 className="size-4 text-info" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-info">
                Step 2
              </p>
              <p className="mt-0.5 text-base font-bold text-white">
                Grab 3 teammates
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                We have almost no contact info for most alumni. Forward
                this link to every Utah rugger in your phone — that&rsquo;s
                how we build the network.
              </p>
              <div className="mt-3">
                <CopyForwardLink forwardToken={forwardToken} />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 — explore */}
        <div className="mb-8 surface-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-warning/15">
              <Users className="size-4 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-warning">
                Step 3
              </p>
              <p className="mt-0.5 text-base font-bold text-white">
                Find your teammates
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                Browse the directory — filter by grad year, services, or
                who&rsquo;s hiring right now.
              </p>
              <Link
                href="/network"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-utah-red px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-utah-red/90"
              >
                Browse Directory
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-500 transition-colors hover:text-white"
          >
            Back to home →
          </Link>
        </div>
      </div>
    </div>
  );
}

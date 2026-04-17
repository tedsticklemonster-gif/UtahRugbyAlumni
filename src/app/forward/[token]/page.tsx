import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ForwardPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: ForwardPageProps) {
  return {
    title: "Join the Utah Rugby Alumni Network",
    description:
      "A fellow Utah Rugby alum thought you'd want to know about this.",
  };
}

export default async function ForwardPage({ params }: ForwardPageProps) {
  const { token } = await params;
  const supabase = createAdminClient();

  // Validate the token exists
  const { data: forwardToken } = await supabase
    .from("forward_tokens")
    .select("token, referrer_alumni_id")
    .eq("token", token)
    .maybeSingle();

  // Allow "generic" as a fallback token that doesn't need to exist in the DB
  if (!forwardToken && token !== "generic") {
    notFound();
  }

  // Get referrer name if available
  let referrerName = "A fellow Utah Rugby alum";
  if (forwardToken?.referrer_alumni_id) {
    const { data: referrer } = await supabase
      .from("alumni")
      .select("first_name, last_name")
      .eq("id", forwardToken.referrer_alumni_id)
      .single();

    if (referrer) {
      referrerName = `${referrer.first_name} ${referrer.last_name}`;
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Utah Rugby Alumni Network
          </CardTitle>
          <CardDescription>
            {referrerName} thought you&apos;d want to know about this.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              A group of Utah Rugby alumni are building a network to stay
              connected — see who played when, what everyone&apos;s up to, and
              get game-day updates (only if you opt in).
            </p>
            <p>
              It takes about 2 minutes to set up your profile. We&apos;re
              trying to reach every player who ever wore the jersey.
            </p>
          </div>
          <Link
            href={`/join?ref=${token}`}
            className={buttonVariants({ size: "lg" }) + " w-full"}
          >
            Join the Network
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

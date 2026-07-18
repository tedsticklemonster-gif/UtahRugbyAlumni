export const dynamic = "force-dynamic";

import Link from "next/link";
import { LogIn, Users, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NetworkTabs } from "@/components/network/network-tabs";
import { PostJobButton } from "@/components/post-job-button";
import { PeopleSection, type PeopleParams } from "./people-section";
import { JobsSection } from "./jobs-section";

export const metadata = {
  title: "Network — Utah Rugby Alumni",
  description:
    "Find teammates, look up professionals in the Utah rugby community, and see who's hiring.",
};

interface NetworkPageProps {
  searchParams: Promise<PeopleParams & { tab?: string }>;
}

export default async function NetworkPage({ searchParams }: NetworkPageProps) {
  const params = await searchParams;
  const tab = params.tab === "jobs" ? "jobs" : "people";

  // getSession() reads the JWT from the cookie (no network call).
  // getUser() makes a live API call that can intermittently return null for
  // a valid session, incorrectly showing the sign-in wall.
  let session = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    return <NetworkErrorWall />;
  }

  if (!session?.user) {
    return <NetworkSignInWall />;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Network</h1>
          {tab === "jobs" && <PostJobButton />}
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          {tab === "jobs"
            ? "Alumni hiring right now, and teammates looking for their next move."
            : "Find teammates and professionals in the Utah rugby community."}
        </p>
        <div className="mt-4">
          <NetworkTabs active={tab} />
        </div>
      </div>

      {tab === "jobs" ? (
        <JobsSection />
      ) : (
        <PeopleSection params={params} userEmail={session.user.email ?? null} />
      )}
    </div>
  );
}

function NetworkErrorWall() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
        <AlertCircle className="size-8 text-zinc-400" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-white">Network unavailable</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
        We couldn&apos;t load the network right now. Please try again in a
        moment or contact us if the problem persists.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500"
      >
        Back to home
      </Link>
    </div>
  );
}

function NetworkSignInWall() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
        <Users className="size-8 text-zinc-400" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-white">The Network</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
        The alumni network is only available to registered alumni. Sign in or
        create an account to find your teammates.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500"
        >
          <LogIn className="size-4" />
          Sign In
        </Link>
        <Link
          href="/join"
          className="inline-flex items-center justify-center rounded-xl bg-utah-red px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
        >
          Join the Network
        </Link>
      </div>
    </div>
  );
}

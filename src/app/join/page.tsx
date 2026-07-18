import { Suspense } from "react";
import { SignupForm } from "@/components/signup-form";

export const metadata = {
  title: "Join — Utah Rugby Alumni Network",
  description: "Sign up to join the Utah Rugby Alumni Network.",
};

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Join the Network</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Takes about 2 minutes. Only your name, grad year, and position are
          visible publicly — everything else is private.
        </p>
      </div>

      <div className="mx-auto max-w-xl px-5 py-8 md:px-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <Suspense>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

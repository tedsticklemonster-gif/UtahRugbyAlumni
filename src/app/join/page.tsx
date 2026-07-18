import { Suspense } from "react";
import { SignupForm } from "@/components/signup-form";

export const metadata = {
  title: "Join — Utah Rugby Alumni Network",
  description: "Sign up to join the Utah Rugby Alumni Network.",
};

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-surface-0">
      <div className="border-b border-white/6 px-5 py-6 md:px-10">
        <h1 className="text-title-1 text-white">Join the Network</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Takes about 2 minutes. Only your name, grad year, and position are
          visible publicly — everything else is private.
        </p>
      </div>

      <div className="mx-auto max-w-xl px-5 py-8 md:px-10">
        <div className="surface-card p-5">
          <Suspense>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BrandMark } from "@/components/brand-mark";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CC0000]/15">
          <Mail className="size-7 text-[#CC0000]" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-white">Check your email</h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
          We sent a magic link to <span className="font-semibold text-white">{email}</span>.
          Tap it to sign in — no password needed.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-sm text-zinc-500 underline-offset-4 hover:text-white hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <BrandMark className="size-14" />
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Utah Rugby Alumni
            </p>
            <h1 className="mt-1 text-2xl font-black text-white">Sign in</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#CC0000] focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#CC0000] py-3 text-sm font-bold text-white transition-colors hover:bg-[#AA0000] disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Magic Link"}
            {!loading && <ArrowRight className="size-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          No account yet?{" "}
          <Link href="/join" className="font-semibold text-white hover:text-[#CC0000]">
            Join the network
          </Link>
        </p>
      </div>
    </div>
  );
}

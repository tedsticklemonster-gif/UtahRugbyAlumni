"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BrandMark } from "@/components/brand-mark";

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-utah-red/15">
          <Mail className="size-7 text-utah-red" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-white">Check your email</h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
          We sent a sign-in link to{" "}
          <span className="font-semibold text-white">{email}</span>.
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
            <p className="text-2xs font-bold uppercase tracking-widest text-zinc-500">
              Utah Rugby Alumni Network
            </p>
            <h1 className="mt-1 text-2xl font-black text-white">Sign in</h1>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        {/* Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 py-3 text-sm font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-60"
        >
          <GoogleIcon />
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-600">or sign in with email</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Email magic link */}
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-utah-red focus:outline-none focus:ring-1 focus:ring-utah-red"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-utah-red py-3 text-sm font-bold text-white transition-colors hover:bg-[#AA0000] disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Sign-In Link"}
            {!loading && <ArrowRight className="size-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          No account yet?{" "}
          <Link href="/join" className="font-semibold text-white hover:text-utah-red">
            Join the network
          </Link>
        </p>
      </div>
    </div>
  );
}

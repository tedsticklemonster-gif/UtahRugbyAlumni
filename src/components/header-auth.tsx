"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function HeaderAuth() {
  const [status, setStatus] = useState<"loading" | "signed-in" | "signed-out">("loading");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "signed-in" : "signed-out");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setStatus(session ? "signed-in" : "signed-out");
    });

    return () => subscription.unsubscribe();
  }, []);

  // Render a fixed-width placeholder while loading to avoid layout shift
  if (status === "loading") {
    return <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800" />;
  }

  if (status === "signed-in") {
    return (
      <Link
        href="/profile"
        className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
      >
        <UserCircle className="size-4 shrink-0" />
        <span className="hidden sm:inline">Profile</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="flex items-center gap-1 px-2 py-1.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white"
      >
        <LogIn className="size-4 shrink-0" />
        <span>Sign In</span>
      </Link>
      <Link
        href="/join"
        className="rounded-lg bg-[#CC0000] px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#AA0000]"
      >
        Join
      </Link>
    </div>
  );
}

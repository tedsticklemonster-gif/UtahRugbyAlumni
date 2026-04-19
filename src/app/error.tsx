"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-4xl font-black text-zinc-700">!</p>
      <h1 className="mt-3 text-xl font-black text-white">Something went wrong</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
        An unexpected error occurred. Try again, or head back home.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl bg-[#CC0000] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 py-24 text-center">
      <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/15">
        <TriangleAlert className="size-7 text-destructive" strokeWidth={1.5} aria-hidden />
      </span>
      <h1 className="text-title-1 text-white">Something went wrong</h1>
      <p className="text-caption mt-2 max-w-xs leading-relaxed">
        An unexpected error occurred. Try again, or head back home.
      </p>
      <div className="mt-7 flex gap-3">
        <Button variant="outline" size="pill-lg" onClick={reset}>
          Try again
        </Button>
        <Button size="pill-lg" render={<Link href="/" />}>
          Go home
        </Button>
      </div>
    </div>
  );
}

"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Inline error card for failed loads/actions. */
export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-8 text-center",
        className
      )}
    >
      <TriangleAlert className="mx-auto mb-3 size-6 text-destructive" aria-hidden />
      <p className="text-sm font-semibold text-zinc-200">{title}</p>
      {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

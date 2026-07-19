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
      className={cn("surface-card px-6 py-10 text-center", className)}
    >
      <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/15">
        <TriangleAlert className="size-6 text-destructive" aria-hidden />
      </span>
      <p className="text-card-title text-zinc-100">{title}</p>
      {description && <p className="text-caption mt-1.5">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

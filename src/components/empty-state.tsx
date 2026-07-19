import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** The app-wide empty state. Keep copy short: a title, one sentence, one CTA. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("surface-card px-6 py-12 text-center", className)}
    >
      {Icon && (
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-surface-2">
          <Icon className="size-6 text-zinc-400" strokeWidth={1.5} aria-hidden />
        </span>
      )}
      <p className="text-card-title text-zinc-100">{title}</p>
      {description && <p className="text-body-sm mt-1.5 text-zinc-500">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

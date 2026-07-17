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
      className={cn(
        "rounded-xl border border-dashed border-zinc-800 px-6 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <Icon className="mx-auto mb-3 size-8 text-zinc-600" strokeWidth={1.5} aria-hidden />
      )}
      <p className="text-sm font-semibold text-zinc-200">{title}</p>
      {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

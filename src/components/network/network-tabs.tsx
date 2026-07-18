import Link from "next/link";
import { cn } from "@/lib/utils";

/** Link-based segmented control — the URL is the state, so back/forward and
 * redirects behave. */
export function NetworkTabs({ active }: { active: "people" | "jobs" }) {
  const pill = (isActive: boolean) =>
    cn(
      "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
      isActive
        ? "bg-utah-red text-white shadow-[0_0_16px_-6px_oklch(0.525_0.222_27.33/0.5)]"
        : "text-zinc-400 hover:text-white"
    );
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-1 p-1 shadow-card">
      <Link href="/network" className={pill(active === "people")}>
        People
      </Link>
      <Link href="/network?tab=jobs" className={pill(active === "jobs")}>
        Jobs
      </Link>
    </div>
  );
}

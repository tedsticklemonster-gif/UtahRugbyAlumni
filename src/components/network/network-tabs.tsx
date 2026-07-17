import Link from "next/link";
import { cn } from "@/lib/utils";

/** Link-based segmented control — the URL is the state, so back/forward and
 * redirects behave. */
export function NetworkTabs({ active }: { active: "people" | "jobs" }) {
  const pill = (isActive: boolean) =>
    cn(
      "rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide transition-colors",
      isActive
        ? "bg-utah-red text-white"
        : "text-zinc-400 hover:text-white"
    );
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 p-1">
      <Link href="/network" className={pill(active === "people")}>
        People
      </Link>
      <Link href="/network?tab=jobs" className={pill(active === "jobs")}>
        Jobs
      </Link>
    </div>
  );
}

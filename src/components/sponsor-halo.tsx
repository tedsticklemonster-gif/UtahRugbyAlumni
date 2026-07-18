import type { SponsorTier } from "@/lib/sponsor";
import { TIER_LABELS } from "@/lib/sponsor";

const TIER_STYLES: Record<
  Exclude<SponsorTier, null>,
  { ring: string; glow: string }
> = {
  bronze: {
    ring: "ring-2 ring-tier-bronze",
    glow: "shadow-[0_0_12px_var(--tier-bronze)]",
  },
  silver: {
    ring: "ring-2 ring-tier-silver",
    glow: "shadow-[0_0_14px_var(--tier-silver)]",
  },
  gold: {
    ring: "ring-2 ring-tier-gold",
    glow: "shadow-[0_0_14px_var(--tier-gold)]",
  },
};

const RING_OFFSET: Record<"sm" | "md" | "lg", string> = {
  sm: "",
  md: "ring-offset-2 ring-offset-surface-0",
  lg: "ring-offset-4 ring-offset-surface-0",
};

interface SponsorHaloProps {
  tier: SponsorTier;
  size?: "sm" | "md" | "lg";
  /** Tailwind rounded class to apply — defaults to rounded-full for circular avatars */
  rounded?: string;
  className?: string;
  children: React.ReactNode;
}

export function SponsorHalo({
  tier,
  size = "md",
  rounded = "rounded-full",
  className = "",
  children,
}: SponsorHaloProps) {
  if (!tier) return <>{children}</>;

  const styles = TIER_STYLES[tier];
  const offset = RING_OFFSET[size];

  return (
    <div
      className={`${rounded} ${styles.ring} ${offset} ${size === "lg" ? styles.glow : ""} ${className}`}
      aria-label={TIER_LABELS[tier]}
    >
      {children}
    </div>
  );
}

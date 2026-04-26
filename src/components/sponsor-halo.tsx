import type { SponsorTier } from "@/lib/sponsor";
import { TIER_LABELS } from "@/lib/sponsor";

const TIER_STYLES: Record<
  Exclude<SponsorTier, null>,
  { ring: string; glow: string }
> = {
  bronze: {
    ring: "ring-[3px] ring-[#B87333]",
    glow: "shadow-[0_0_12px_rgba(184,115,51,0.4)]",
  },
  silver: {
    ring: "ring-[3px] ring-[#C0C0C0]",
    glow: "shadow-[0_0_14px_rgba(192,192,192,0.5)]",
  },
  gold: {
    ring: "ring-[3px] ring-[#FFD700]",
    glow: "shadow-[0_0_16px_rgba(255,215,0,0.55)]",
  },
};

const RING_OFFSET: Record<"sm" | "md" | "lg", string> = {
  sm: "",
  md: "ring-offset-2 ring-offset-zinc-950",
  lg: "ring-offset-4 ring-offset-zinc-950",
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

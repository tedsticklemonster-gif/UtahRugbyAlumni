export type SponsorTier = "bronze" | "silver" | "gold" | null;

export const TIER_LABELS: Record<Exclude<SponsorTier, null>, string> = {
  bronze: "Bronze Sponsor",
  silver: "Silver Sponsor",
  gold: "Gold Sponsor",
};

export function tierFromCents(cents: number): SponsorTier {
  if (cents >= 100000) return "gold";
  if (cents >= 50000) return "silver";
  if (cents >= 10000) return "bronze";
  return null;
}

export function formatLifetime(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

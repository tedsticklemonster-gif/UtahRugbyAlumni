import { ExternalLink, HeartHandshake, Target, Trophy, Users, Star } from "lucide-react";
import Script from "next/script";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Give — Utah Rugby Alumni" };

const DONORBOX_CAMPAIGN = "25-26-season-campaign";
const OFFICIAL_GIVING_URL = "https://www.utah-rugby.com/donations";


type CampaignProgress = {
  name: string;
  goalCents: number | null;
  raisedCents: number;
  donorCount: number;
};

async function fetchCampaignProgress(): Promise<CampaignProgress | null> {
  try {
    const admin = createAdminClient();
    const { data: campaign } = await admin
      .from("campaigns")
      .select("id, name, goal_cents")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!campaign) return null;

    const { data: pledges } = await admin
      .from("pledges")
      .select("amount_cents, donor_email, status")
      .eq("campaign_id", campaign.id)
      .in("status", ["pledged", "paid"]);

    const raisedCents = (pledges ?? []).reduce((sum, p) => sum + p.amount_cents, 0);
    const donorCount = new Set((pledges ?? []).map((p) => p.donor_email.toLowerCase())).size;

    return { name: campaign.name, goalCents: campaign.goal_cents, raisedCents, donorCount };
  } catch {
    return null;
  }
}

const IMPACT_ITEMS = [
  { amount: "$50", desc: "Covers practice jerseys for a new player" },
  { amount: "$150", desc: "Sponsors a player's tournament travel" },
  { amount: "$500", desc: "Funds a full recruiting trip" },
  { amount: "$1,000", desc: "Covers an away match weekend for the team" },
  { amount: "$5,000", desc: "Names a scholarship for an incoming player" },
];

const SPONSOR_TIERS = [
  { tier: "Bronze", amount: "$100+", perks: "Name on donor wall, alumni network badge", color: "text-amber-600", bg: "bg-amber-900/20 border-amber-800/40" },
  { tier: "Silver", amount: "$500+", perks: "Bronze perks + silver profile halo + event VIP", color: "text-zinc-300", bg: "bg-surface-2/50 border-zinc-600/40" },
  { tier: "Gold", amount: "$1,000+", perks: "Silver perks + gold halo + featured in directory + 1:1 with coaching staff", color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-700/40" },
];

export default async function GivePage() {
  const progress = await fetchCampaignProgress();
  const pct =
    progress?.goalCents && progress.goalCents > 0
      ? Math.min(Math.round((progress.raisedCents / progress.goalCents) * 100), 100)
      : null;

  return (
    <div className="min-h-screen bg-surface-0">
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-utah-red/15 text-utah-red">
            <HeartHandshake className="size-5" />
          </span>
          <div>
            <h1 className={`text-display text-3xl text-white`}>Give Back</h1>
            <p className="text-sm text-zinc-500">Support University of Utah Rugby</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-8 md:px-10 max-w-2xl mx-auto">
        {/* Fundraising thermometer — only shown when the board has an active campaign */}
        {progress && (
          <div className="surface-card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Target className="size-4 text-utah-red" />
              <p className={`text-eyebrow text-2xs text-utah-red`}>{progress.name}</p>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-display text-4xl text-white`}>
                ${Math.round(progress.raisedCents / 100).toLocaleString()}
              </span>
              {progress.goalCents && (
                <span className="text-sm text-zinc-500">
                  of ${Math.round(progress.goalCents / 100).toLocaleString()} goal
                </span>
              )}
            </div>
            {pct !== null && (
              <div className="mt-4 h-4 w-full rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-utah-red to-[#FF3333] transition-all duration-1000"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>{pct !== null ? `${pct}% funded` : ""}</span>
              {progress.donorCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {progress.donorCount} {progress.donorCount === 1 ? "donor" : "donors"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Impact section */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="size-4 text-amber-400" />
            <p className={`text-eyebrow text-2xs text-zinc-400`}>Your Impact</p>
          </div>
          <p className="text-sm text-zinc-300 mb-4">
            Every dollar goes directly to the program — travel, kit, recruiting, and alumni events.
          </p>
          <div className="space-y-2">
            {IMPACT_ITEMS.map(({ amount, desc }) => (
              <div key={amount} className="flex items-baseline gap-3 py-2 border-b border-zinc-800 last:border-0">
                <span className={`text-display text-xl text-utah-red w-20 shrink-0`}>{amount}</span>
                <span className="text-sm text-zinc-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donorbox widget */}
        <div className="surface-card p-6">
          <p className={`text-eyebrow text-2xs text-utah-red mb-3`}>Donate Now</p>
          <Script src="https://donorbox.org/widget.js" strategy="lazyOnload" />
          <iframe
            src={`https://donorbox.org/embed/${DONORBOX_CAMPAIGN}?default_interval=o&show_content=true`}
            name="donorbox"
            title="Donate to Utah Rugby"
            allow="payment"
            style={{
              maxWidth: "500px",
              minWidth: "250px",
              maxHeight: "none",
              width: "100%",
              border: "none",
            }}
            height="685px"
          />
        </div>

        {/* Sponsor tiers */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="size-4 text-yellow-400" />
            <p className={`text-eyebrow text-2xs text-zinc-400`}>Sponsor Tiers</p>
          </div>
          <div className="space-y-3">
            {SPONSOR_TIERS.map(({ tier, amount, perks, color, bg }) => (
              <div key={tier} className={`rounded-xl border p-4 ${bg}`}>
                <div className="flex items-baseline justify-between">
                  <span className={`text-display text-xl ${color}`}>{tier}</span>
                  <span className={`text-eyebrow text-2xs ${color}`}>{amount}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">{perks}</p>
              </div>
            ))}
          </div>
        </div>

        {/* More ways to give */}
        <div className="surface-card p-6">
          <p className={`text-eyebrow text-2xs text-zinc-500 mb-2`}>More ways to give</p>
          <p className="text-sm leading-relaxed text-zinc-400">
            View all giving options, sponsorship opportunities, and more on the official Utah Rugby site.
          </p>
          <a
            href={OFFICIAL_GIVING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
          >
            utah-rugby.com/donations
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

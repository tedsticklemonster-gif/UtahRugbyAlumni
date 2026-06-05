import { ExternalLink, HeartHandshake, Target, Trophy, Users, Star } from "lucide-react";
import Script from "next/script";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Give — Utah Rugby Alumni" };

const DONORBOX_CAMPAIGN = "25-26-season-campaign";
const OFFICIAL_GIVING_URL = "https://www.utah-rugby.com/donations";

const display =
  "font-[family-name:var(--font-barlow-condensed)] font-black uppercase italic tracking-tight";
const eyebrow =
  "font-[family-name:var(--font-barlow)] font-extrabold uppercase tracking-[0.25em]";

// Configurable goal — update as campaigns change
const GOAL_AMOUNT = 25000;
const RAISED_AMOUNT = 8750; // TODO: Pull from Donorbox API or pledges table
const DONOR_COUNT = 34; // TODO: Pull from pledges table

const IMPACT_ITEMS = [
  { amount: "$50", desc: "Covers practice jerseys for a new player" },
  { amount: "$150", desc: "Sponsors a player's tournament travel" },
  { amount: "$500", desc: "Funds a full recruiting trip" },
  { amount: "$1,000", desc: "Covers an away match weekend for the team" },
  { amount: "$5,000", desc: "Names a scholarship for an incoming player" },
];

const SPONSOR_TIERS = [
  { tier: "Bronze", amount: "$100+", perks: "Name on donor wall, alumni network badge", color: "text-amber-600", bg: "bg-amber-900/20 border-amber-800/40" },
  { tier: "Silver", amount: "$500+", perks: "Bronze perks + silver profile halo + event VIP", color: "text-zinc-300", bg: "bg-zinc-800/50 border-zinc-600/40" },
  { tier: "Gold", amount: "$1,000+", perks: "Silver perks + gold halo + featured in directory + 1:1 with coaching staff", color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-700/40" },
];

export default async function GivePage() {
  const pct = Math.min(Math.round((RAISED_AMOUNT / GOAL_AMOUNT) * 100), 100);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#CC0000]/15 text-[#CC0000]">
            <HeartHandshake className="size-5" />
          </span>
          <div>
            <h1 className={`${display} text-3xl text-white`}>Give Back</h1>
            <p className="text-sm text-zinc-500">Support University of Utah Rugby</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-8 md:px-10 max-w-2xl mx-auto">
        {/* Fundraising thermometer */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Target className="size-4 text-[#CC0000]" />
            <p className={`${eyebrow} text-[10px] text-[#CC0000]`}>25–26 Season Campaign</p>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`${display} text-4xl text-white`}>
              ${RAISED_AMOUNT.toLocaleString()}
            </span>
            <span className="text-sm text-zinc-500">
              of ${GOAL_AMOUNT.toLocaleString()} goal
            </span>
          </div>
          {/* Thermometer bar */}
          <div className="mt-4 h-4 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#CC0000] to-[#FF3333] transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>{pct}% funded</span>
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {DONOR_COUNT} donors
            </span>
          </div>
        </div>

        {/* Impact section */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="size-4 text-amber-400" />
            <p className={`${eyebrow} text-[10px] text-zinc-400`}>Your Impact</p>
          </div>
          <p className="text-sm text-zinc-300 mb-4">
            Every dollar goes directly to the program — travel, kit, recruiting, and alumni events.
          </p>
          <div className="space-y-2">
            {IMPACT_ITEMS.map(({ amount, desc }) => (
              <div key={amount} className="flex items-baseline gap-3 py-2 border-b border-zinc-800 last:border-0">
                <span className={`${display} text-xl text-[#CC0000] w-20 shrink-0`}>{amount}</span>
                <span className="text-sm text-zinc-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donorbox widget */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className={`${eyebrow} text-[10px] text-[#CC0000] mb-3`}>Donate Now</p>
          <Script src="https://donorbox.org/widget.js" strategy="lazyOnload" />
          <iframe
            src={`https://donorbox.org/embed/${DONORBOX_CAMPAIGN}?default_interval=o&show_content=true`}
            name="donorbox"
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
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="size-4 text-yellow-400" />
            <p className={`${eyebrow} text-[10px] text-zinc-400`}>Sponsor Tiers</p>
          </div>
          <div className="space-y-3">
            {SPONSOR_TIERS.map(({ tier, amount, perks, color, bg }) => (
              <div key={tier} className={`rounded-xl border p-4 ${bg}`}>
                <div className="flex items-baseline justify-between">
                  <span className={`${display} text-xl ${color}`}>{tier}</span>
                  <span className={`${eyebrow} text-[10px] ${color}`}>{amount}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">{perks}</p>
              </div>
            ))}
          </div>
        </div>

        {/* More ways to give */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className={`${eyebrow} text-[10px] text-zinc-500 mb-2`}>More ways to give</p>
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

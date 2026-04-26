import { ExternalLink, HeartHandshake } from "lucide-react";

export const metadata = { title: "Give" };

const DONATE_URL = "https://donorbox.org/25-26-season-campaign";
const OFFICIAL_GIVING_URL = "https://www.utah-rugby.com/donations";

export default function GivePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
            <HeartHandshake className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Give</h1>
            <p className="text-sm text-zinc-500">Support University of Utah Rugby</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-8 md:px-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">
            25–26 Season Campaign
          </p>
          <p className="mt-2 text-base font-bold text-white">Donate to the program</p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            Donations go directly to the University of Utah Rugby program —
            travel, kit, recruiting, and alumni events.
          </p>
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#CC0000] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
          >
            Donate now
            <ExternalLink className="size-4" />
          </a>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            More ways to give
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            View all giving options, sponsorship opportunities, and more on the
            official Utah Rugby site.
          </p>
          <a
            href={OFFICIAL_GIVING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
          >
            utah-rugby.com/donations
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

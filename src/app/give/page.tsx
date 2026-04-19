import { ExternalLink, HeartHandshake } from "lucide-react";

export const metadata = { title: "Give" };

export default function GivePage() {
  const donateUrl = process.env.NEXT_PUBLIC_DONATE_URL;

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
            Direct support
          </p>
          <p className="mt-2 text-base font-bold text-white">Donate to the program</p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            Donations go directly to the University of Utah Rugby program —
            travel, kit, recruiting, and alumni events.
          </p>
          {donateUrl ? (
            <a
              href={donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#CC0000] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
            >
              Donate now
              <ExternalLink className="size-4" />
            </a>
          ) : (
            <p className="mt-4 rounded-xl border border-zinc-700 px-4 py-3 text-xs text-zinc-500">
              Donation link coming soon — set{" "}
              <code className="text-zinc-400">NEXT_PUBLIC_DONATE_URL</code> in env.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Sponsors
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Sponsor list coming soon — pulled from utah-rugby.com monthly.
          </p>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, HeartHandshake, Users, ExternalLink, Megaphone, Newspaper } from "lucide-react";
import { HeroLogo } from "@/components/hero-logo";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getHubData } from "@/actions/hub";
import { HubPage } from "@/components/hub/hub-page";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const hubData = await getHubData();
    return <HubPage {...hubData} />;
  }

  const { count: alumniCount } = await supabase
    .from("alumni")
    .select("*", { count: "exact", head: true })
    .eq("verified", true);

  const { data: states } = await supabase
    .from("alumni")
    .select("state")
    .eq("verified", true)
    .not("state", "is", null);

  const uniqueStates = new Set(states?.map((r) => r.state)).size;
  const count = alumniCount ?? 0;

  // Recent joins — last 5 verified alumni
  const admin = createAdminClient();
  const { data: recentJoins } = await admin
    .from("alumni")
    .select("first_name, last_name, grad_year, city, state, created_at")
    .eq("verified", true)
    .order("created_at", { ascending: false })
    .limit(5);

  // Announcements — best-effort, table may not exist yet
  let announcements: Array<{ id: string; title: string; body: string; created_at: string }> = [];
  try {
    const { data } = await admin
      .from("announcements")
      .select("id, title, body, created_at")
      .order("created_at", { ascending: false })
      .limit(3);
    announcements = data ?? [];
  } catch {
    // table not yet deployed — show empty
  }

  return (
    <div className="flex flex-col bg-zinc-950">

      {/* ── Full-bleed photo hero ── */}
      <section className="relative h-[540px] overflow-hidden md:h-[620px]">
        {/* Background photo */}
        <Image
          src="/hero-bg.jpg"
          alt="University of Utah Rugby alumni"
          fill
          className="object-cover object-center"
          priority
          quality={85}
        />

        {/* Gradient overlay — heavy at bottom where text lives, lighter at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20" />

        {/* Red accent line at very top */}
        <div className="absolute inset-x-0 top-0 h-1 bg-[#CC0000]" />

        {/* Content pinned to bottom */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col px-5 pb-8 md:px-10 md:pb-10">
          {/* Logo — big and prominent */}
          <div className="mb-5">
            <HeroLogo />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
            University of Utah Rugby
          </p>

          <h1 className="mt-1.5 text-4xl font-black leading-[1.05] tracking-tight text-white md:text-5xl">
            Once a Ute,
            <br />
            <span className="text-[#CC0000]">always a Ute.</span>
          </h1>

          <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-300">
            The private alumni network for University of Utah Rugby — find
            teammates, see the schedule, and stay connected.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href="/join"
              className="inline-flex items-center rounded-xl bg-[#CC0000] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
            >
              Join the Network
            </Link>
            <Link
              href="/directory"
              className="inline-flex items-center rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      {count > 0 && (
        <div className="grid grid-cols-2 border-y border-zinc-800">
          <div className="border-r border-zinc-800 px-5 py-5">
            <p className="text-3xl font-black tabular-nums text-white">{count}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Alumni Registered
            </p>
          </div>
          {uniqueStates > 1 && (
            <div className="px-5 py-5">
              <p className="text-3xl font-black tabular-nums text-white">{uniqueStates}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                States Represented
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Quick access grid ── */}
      <div className="grid grid-cols-4 gap-px bg-zinc-800">
        <QuickTile href="/feed"           icon={<Newspaper className="size-5" />}      title="Feed"       sub="Alumni wall"         />
        <QuickTile href="/directory"      icon={<Users className="size-5" />}          title="Directory"  sub="Find a teammate"     />
        <QuickTile href="/schedule"       icon={<CalendarDays className="size-5" />}   title="Schedule"   sub="Games & events"      />
        <QuickTile href="/give"           icon={<HeartHandshake className="size-5" />} title="Give"       sub="Support the program" />
      </div>

      {/* ── Official website links ── */}
      <div className="px-5 pb-2 md:px-10">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Official Website
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { href: "https://www.utah-rugby.com", label: "Home" },
            { href: "https://www.utah-rugby.com/new-page-2", label: "Schedule" },
            { href: "https://www.utah-rugby.com/news", label: "News" },
            { href: "https://www.utah-rugby.com/donate", label: "Donate" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              {label}
              <ExternalLink className="size-3 text-zinc-600" />
            </a>
          ))}
        </div>
      </div>

      {/* ── Brotherhood / growth CTA ── */}
      <div className="px-5 py-6 md:px-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">
            Help grow the network
          </p>
          <p className="mt-1.5 text-base font-bold text-white">
            Know a former Ute rugger?
          </p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            We have almost no contact info for most alumni. Forward this to
            every player in your phone — that&apos;s how we build the network.
          </p>
          <Link
            href="/thanks"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-[#CC0000]"
          >
            Get your forward link <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* ── Activity wall ── */}
      {(announcements.length > 0 || (recentJoins && recentJoins.length > 0)) && (
        <div className="px-5 pb-8 md:px-10">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Latest Activity
          </p>
          <div className="space-y-2">
            {/* Announcements first */}
            {announcements.map((ann) => (
              <div key={ann.id} className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#CC0000]/15">
                  <Megaphone className="size-3.5 text-[#CC0000]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{ann.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-400">{ann.body}</p>
                </div>
              </div>
            ))}

            {/* Recent joins */}
            {recentJoins?.map((a, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                  {a.first_name[0]}{a.last_name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {a.first_name} {a.last_name}
                    {a.grad_year ? <span className="ml-1.5 text-xs font-normal text-zinc-500">'{String(a.grad_year).slice(-2)}</span> : null}
                  </p>
                  {(a.city || a.state) && (
                    <p className="text-xs text-zinc-500">
                      {[a.city, a.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[10px] font-medium text-zinc-600">joined</span>
              </div>
            ))}
          </div>
          <Link
            href="/directory"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 transition-colors hover:text-white"
          >
            View full directory <ArrowRight className="size-3" />
          </Link>
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}

function QuickTile({
  href, icon, title, sub, external,
}: {
  href: string; icon: React.ReactNode; title: string; sub: string; external?: boolean;
}) {
  const cls = "group relative flex flex-col items-center gap-2 bg-zinc-950 px-2 py-4 transition-colors hover:bg-zinc-900 active:bg-zinc-800";
  const body = (
    <>
      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors group-hover:bg-[#CC0000]/15 group-hover:text-[#CC0000]">
        {icon}
      </span>
      <div className="text-center">
        <p className="text-xs font-bold text-white">{title}</p>
        <p className="mt-0.5 text-[10px] leading-tight text-zinc-500">{sub}</p>
      </div>
      {external && <ExternalLink className="absolute right-2 top-2 size-3 text-zinc-700" />}
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
  ) : (
    <Link href={href} className={cls}>{body}</Link>
  );
}

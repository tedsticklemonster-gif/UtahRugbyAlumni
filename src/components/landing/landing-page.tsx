import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  GraduationCap,
  Handshake,
  Users,
  Newspaper,
  Trophy,
} from "lucide-react";
import { HeroLogo } from "@/components/hero-logo";
import { InstallTile } from "@/components/install-tile";
import { UserPhoto } from "@/components/user-photo";
import { SponsorHalo } from "@/components/sponsor-halo";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchSchedule,
  parseGameDate,
  pickNextGame,
  formatGameDateParts,
  daysUntil,
  type Game,
} from "@/lib/schedule";

// Diagonal bottom-slash on the hero section
const heroSlash = { clipPath: "polygon(0 0, 100% 0, 100% 95.5%, 0 100%)" };

function isNew(createdAt: string | undefined, nowMs: number): boolean {
  if (!createdAt) return false;
  return nowMs - new Date(createdAt).getTime() < 1000 * 60 * 60 * 24 * 7;
}

export async function LandingPage() {
  const admin = createAdminClient();

  const [
    { count: alumniCount },
    { data: recentJoins },
    { data: hiringAlumni },
    schedule,
  ] = await Promise.all([
    admin
      .from("alumni")
      .select("id", { count: "exact", head: true })
      .in("status", ["self_registered", "imported"])
      .eq("directory_visible", true),
    admin
      .from("alumni")
      .select(
        "id, first_name, last_name, grad_year, city, state, photo_url, created_at, sponsor_tier"
      )
      .in("status", ["self_registered", "imported"])
      .eq("directory_visible", true)
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("alumni")
      .select("id, first_name, last_name, grad_year, company, photo_url, sponsor_tier")
      .in("status", ["self_registered", "imported"])
      .eq("directory_visible", true)
      .eq("hiring", true)
      .order("created_at", { ascending: false })
      .limit(8),
    fetchSchedule(),
  ]);

  const count = alumniCount ?? 0;

  // Sign photo URLs
  const recentPaths = (recentJoins ?? [])
    .filter((a) => a.photo_url)
    .map((a) => a.photo_url!);
  const recentMap: Record<string, string> = {};
  if (recentPaths.length) {
    const { data } = await admin.storage
      .from("alumni-photos")
      .createSignedUrls(recentPaths, 86400);
    (data ?? []).forEach((s) => {
      if (s.signedUrl && s.path) recentMap[s.path] = s.signedUrl;
    });
  }

  const hiringPaths = (hiringAlumni ?? [])
    .filter((a) => a.photo_url)
    .map((a) => a.photo_url!);
  const hiringMap: Record<string, string> = {};
  if (hiringPaths.length) {
    const { data } = await admin.storage
      .from("alumni-photos")
      .createSignedUrls(hiringPaths, 86400);
    (data ?? []).forEach((s) => {
      if (s.signedUrl && s.path) hiringMap[s.path] = s.signedUrl;
    });
  }

  // Server component, runs once per request. Date.now() is safe here; the lint
  // rule treats all component bodies as client-side render functions.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const nextGame = schedule ? pickNextGame(schedule.games, nowMs) : null;
  const recentResults = (schedule?.games ?? []).filter((g) => g.result).slice(0, 3);
  const upcomingGames = (schedule?.games ?? [])
    .filter((g) => {
      if (g.result) return false;
      const d = parseGameDate(g.date);
      return d ? d.getTime() >= nowMs : true;
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-black text-white antialiased">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="relative h-[580px] overflow-hidden md:h-[700px]" style={heroSlash}>
          <Image
            src="/hero-bg.jpg"
            alt="University of Utah Rugby alumni"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          {/* Heavy gradient — text lives at the bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/15" />
          {/* Red wash on left */}
          <div
            className="absolute inset-0 opacity-35 mix-blend-multiply"
            style={{
              background:
                "linear-gradient(95deg, rgb(139 0 0 / 0.6) 0%, transparent 55%)",
            }}
          />
          {/* Subtle diagonal stripe in upper-right */}
          <div
            className="absolute right-0 top-0 h-36 w-72 opacity-[0.06]"
            style={{
              background:
                "repeating-linear-gradient(135deg, white 0 2px, transparent 2px 12px)",
            }}
          />

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 px-5 pb-14 md:px-10 md:pb-20">
            <div className="mx-auto max-w-6xl">
              {/* Logo badge */}
              <div className="mb-5">
                <HeroLogo />
              </div>

              {/* Eyebrow */}
              <div className="mb-4 flex items-center gap-3">
                <span className="block h-[2px] w-10 bg-utah-red" />
                <p className="text-eyebrow text-2xs text-zinc-300 md:text-xs">
                  University of Utah Rugby · Alumni Network
                </p>
              </div>

              {/* Main headline */}
              <h1 className="text-display text-hero text-white">
                Once a Ute,
                <br />
                <span className="text-utah-red">Always a Ute.</span>
              </h1>

              <p className="mt-6 max-w-sm text-[13px] leading-relaxed text-zinc-300 md:text-sm">
                The private network for every player who played for the U.
                Find old teammates. Hire from the brotherhood. Get hired by them.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <Link
                  href="/join"
                  className="inline-flex items-center gap-2 rounded-sm bg-utah-red px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition-transform motion-safe:hover:-translate-y-px"
                >
                  Join the Network
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/network"
                  className="inline-flex items-center gap-2 rounded-sm border-2 border-white/30 bg-black/30 px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-black"
                >
                  Browse Directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value proposition ──────────────────────────────────────────── */}
      <section className="border-t border-zinc-900 bg-zinc-950">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-px bg-zinc-900 md:grid-cols-3">
          {[
            {
              icon: Briefcase,
              title: "Hire Your Brothers",
              desc: "Alumni are actively hiring right now. Need a job? Need to fill one? Start here.",
              iconClass: "text-utah-red",
            },
            {
              icon: GraduationCap,
              title: "Source the Network",
              desc: `${count >= 25 ? count + "+ " : ""}Alumni searchable by profession, city, and year. Need a lawyer, contractor, or advisor? You already know one.`,
              iconClass: "text-white",
            },
            {
              icon: Handshake,
              title: "Stay in the Loop",
              desc: "Game schedules, events, watch parties, and direct messaging. One place for all of it.",
              iconClass: "text-utah-red",
            },
          ].map(({ icon: Icon, title, desc, iconClass }) => (
            <div key={title} className="bg-zinc-950 p-6 md:p-8">
              <Icon className={`size-7 mb-4 ${iconClass}`} strokeWidth={1.75} />
              <h3 className="text-display text-xl text-white md:text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Next Match strip ─────────────────────────────────────────────── */}
      <NextMatchStrip game={nextGame} nowMs={nowMs} />

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      {count > 0 && (
        <section className="border-y border-zinc-900 bg-zinc-950">
          <div className="mx-auto grid max-w-6xl grid-cols-2">
            {[
              // Below 25 members the raw count hurts social proof — lead with heritage instead
              count >= 25
                ? { value: count, label: "Alumni Registered", suffix: undefined }
                : { value: 1972, label: "Founded", suffix: undefined },
              { value: new Date().getFullYear() - 1972, label: "Years of Tradition", suffix: "+" },
            ]
              .filter((s) => s.value !== null)
              .map((s, i, arr) => (
                <div
                  key={s.label}
                  className={`px-4 py-7 md:px-8 md:py-10 ${i < arr.length - 1 ? "border-r border-zinc-900" : ""}`}
                >
                  <div className="flex items-baseline gap-1">
                    <span className="text-display text-4xl tabular-nums leading-none text-white md:text-6xl">
                      {s.value}
                    </span>
                    {s.suffix && (
                      <span className="text-display text-2xl leading-none text-utah-red md:text-3xl">
                        {s.suffix}
                      </span>
                    )}
                  </div>
                  <span className="mt-2 block h-[2px] w-8 bg-utah-red" />
                  <p className="text-eyebrow mt-2 text-3xs text-zinc-500 md:text-2xs">
                    {s.label}
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ── Quick access grid ────────────────────────────────────────────── */}
      <section className="bg-black">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-zinc-900 md:grid-cols-5">
          {[
            { href: "/", icon: Newspaper, title: "Feed", sub: "Alumni wall" },
            {
              href: "/network",
              icon: Users,
              title: "Directory",
              sub: "Find a teammate",
            },
            {
              href: "/schedule",
              icon: CalendarDays,
              title: "Schedule",
              sub: "Games & events",
            },
            {
              href: "/jobs",
              icon: Briefcase,
              title: "Jobs",
              sub: "Who's hiring",
            },
          ].map(({ href, icon: Icon, title, sub }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col items-start gap-3 bg-black p-5 transition-colors hover:bg-zinc-950 md:p-6"
            >
              <Icon
                className="size-6 text-zinc-500 transition-colors group-hover:text-white"
                strokeWidth={1.75}
              />
              <div>
                <p className="text-display text-2xl leading-none text-white md:text-3xl">
                  {title}
                </p>
                <p className="mt-1.5 text-xs text-zinc-500">{sub}</p>
              </div>
              {/* Red bottom border on hover */}
              <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-utah-red transition-transform duration-200 group-hover:scale-x-100" />
              <ArrowUpRight className="absolute right-4 top-4 size-4 text-zinc-700 transition-colors group-hover:text-white" />
            </Link>
          ))}
            <InstallTile />
        </div>
      </section>

      {/* ── Schedule preview ─────────────────────────────────────────────── */}
      {(upcomingGames.length > 0 || recentResults.length > 0) && (
        <section className="bg-black px-5 py-10 md:px-10 md:py-14">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <span className="block h-[2px] w-10 bg-utah-red" />
                <p className="text-eyebrow mt-2 text-2xs text-zinc-500">Season</p>
                <h2 className="text-display mt-1 text-3xl text-white md:text-5xl">
                  The Schedule
                </h2>
              </div>
              <Link
                href="/schedule"
                className="text-eyebrow group inline-flex items-center gap-1.5 text-2xs text-zinc-400 transition-colors hover:text-white"
              >
                View All
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Upcoming */}
              <div>
                <p className="text-eyebrow mb-3 text-2xs text-utah-red">
                  Upcoming
                </p>
                {upcomingGames.length === 0 ? (
                  <p className="py-6 text-sm text-zinc-500">No upcoming games scheduled.</p>
                ) : (
                  <ul className="divide-y divide-zinc-900 border-y border-zinc-900">
                    {upcomingGames.map((g, i) => {
                      const d = formatGameDateParts(g.date);
                      return (
                        <li key={i} className="flex items-center gap-4 py-3">
                          <div className="flex w-12 shrink-0 flex-col items-center border-r border-zinc-900 pr-3">
                            <span className="text-display text-2xl leading-none text-white">
                              {d.day}
                            </span>
                            <span className="text-eyebrow text-3xs text-utah-red">
                              {d.month}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-display truncate text-base leading-none text-white md:text-xl">
                              vs {g.opponent}
                            </p>
                            <p className="text-eyebrow mt-1 text-3xs text-zinc-500">
                              {g.location} · {g.date}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Results */}
              <div>
                <p className="text-eyebrow mb-3 text-2xs text-zinc-400">
                  Recent Results
                </p>
                {recentResults.length === 0 ? (
                  <p className="py-6 text-sm text-zinc-500">
                    Results posted after each match.
                  </p>
                ) : (
                  <ul className="divide-y divide-zinc-900 border-y border-zinc-900">
                    {recentResults.map((g, i) => {
                      const win = g.result === "Win";
                      return (
                        <li key={i} className="flex items-center gap-4 py-3">
                          <span
                            className={`text-display flex h-9 w-9 shrink-0 items-center justify-center text-base leading-none text-white ${
                              win ? "bg-utah-red" : "border border-zinc-800 bg-zinc-900"
                            }`}
                          >
                            {win ? "W" : "L"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-display truncate text-base leading-none text-white md:text-xl">
                              vs {g.opponent}
                            </p>
                            <p className="text-eyebrow mt-1 text-3xs text-zinc-500">
                              {g.score}
                              {g.manOfMatch ? ` · MoM ${g.manOfMatch}` : ""}
                            </p>
                          </div>
                          <Trophy
                            className={`size-4 ${win ? "text-white" : "text-zinc-800"}`}
                            strokeWidth={1.75}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Recently Joined rail ─────────────────────────────────────────── */}
      {recentJoins && recentJoins.length > 0 && (
        <section className="border-t border-zinc-900 bg-black px-5 py-10 md:px-10 md:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <span className="block h-[2px] w-10 bg-utah-red" />
                <p className="text-eyebrow mt-2 text-2xs text-zinc-500">
                  The Brotherhood
                </p>
                <h2 className="text-display mt-1 text-3xl text-white md:text-4xl">
                  Recently Joined
                </h2>
              </div>
              <Link
                href="/network"
                className="text-eyebrow group inline-flex items-center gap-1.5 text-2xs text-zinc-400 transition-colors hover:text-white"
              >
                All Alumni
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
              {recentJoins.map((a) => (
                <Link key={a.id} href={`/u/${a.id}`} className="group w-32 shrink-0 md:w-36">
                  <SponsorHalo tier={((a as Record<string, unknown>).sponsor_tier as "bronze" | "silver" | "gold" | null) ?? null} size="sm" rounded="rounded-none">
                  <div className="relative aspect-square overflow-hidden border border-zinc-900 bg-zinc-950">
                    <UserPhoto
                      src={a.photo_url ? recentMap[a.photo_url] ?? null : null}
                      alt={`${a.first_name} ${a.last_name}`}
                      firstName={a.first_name}
                      lastName={a.last_name}
                      fill
                      rounded="none"
                    />
                    {/* Grayscale → colour on hover */}
                    <div className="pointer-events-none absolute inset-0 grayscale transition-all duration-300 group-hover:grayscale-0" />
                    {/* Red sweep on hover */}
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{
                        background:
                          "linear-gradient(to top, color-mix(in oklab, var(--utah-red) 60%, transparent), transparent)",
                      }}
                    />
                    {isNew(a.created_at, nowMs) && (
                      <span className="text-eyebrow absolute left-0 top-0 bg-utah-red px-1.5 py-0.5 text-[8px] text-white">
                        New
                      </span>
                    )}
                  </div>
                  </SponsorHalo>
                  <p className="text-display mt-2 truncate text-base leading-tight text-white">
                    {a.first_name} {a.last_name}
                  </p>
                  <p className="text-eyebrow text-3xs text-zinc-500">
                    {a.grad_year
                      ? `Class of ${a.grad_year}`
                      : [a.city, a.state].filter(Boolean).join(", ") || "—"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Alumni Hiring rail ───────────────────────────────────────────── */}
      {hiringAlumni && hiringAlumni.length > 0 && (
        <section className="border-t border-zinc-900 bg-black px-5 py-10 md:px-10 md:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <span className="block h-[2px] w-10 bg-utah-red" />
                <p className="text-eyebrow mt-2 text-2xs text-utah-red">
                  Network
                </p>
                <h2 className="text-display mt-1 text-3xl text-white md:text-4xl">
                  Alumni Hiring
                </h2>
              </div>
              <Link
                href="/jobs"
                className="text-eyebrow group inline-flex items-center gap-1.5 text-2xs text-zinc-400 transition-colors hover:text-white"
              >
                All Jobs
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
              {hiringAlumni.map((a) => (
                <Link
                  key={a.id}
                  href={`/u/${a.id}`}
                  className="group relative w-36 shrink-0 md:w-40"
                >
                  <div className="relative aspect-[4/5] overflow-hidden border-2 border-utah-red bg-zinc-950">
                    <UserPhoto
                      src={a.photo_url ? hiringMap[a.photo_url] ?? null : null}
                      alt={`${a.first_name} ${a.last_name}`}
                      firstName={a.first_name}
                      lastName={a.last_name}
                      fill
                      rounded="none"
                    />
                    {/* Grayscale → colour on hover */}
                    <div className="pointer-events-none absolute inset-0 grayscale transition-all duration-300 group-hover:grayscale-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    {/* Diagonal HIRING ribbon */}
                    <div className="text-eyebrow absolute left-[-32px] top-3 -rotate-30 bg-utah-red px-10 py-0.5 text-3xs text-white shadow-md">
                      Hiring
                    </div>
                    <div className="absolute inset-x-2 bottom-2">
                      <p className="text-display truncate text-base leading-tight text-white">
                        {a.first_name} {a.last_name}
                      </p>
                      {a.company && (
                        <p className="text-eyebrow truncate text-3xs text-zinc-300">
                          {a.company}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Brotherhood CTA ──────────────────────────────────────────────── */}
      <section className="bg-black px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden border border-zinc-900 bg-gradient-to-br from-zinc-950 to-black p-7 md:p-12">
            {/* Left red accent bar */}
            <span className="absolute left-0 top-0 h-full w-[5px] bg-utah-red" />
            {/* Diagonal stripe background */}
            <div
              className="absolute right-0 top-0 h-full w-1/2 opacity-[0.03]"
              style={{
                background:
                  "repeating-linear-gradient(135deg, white 0 1px, transparent 1px 14px)",
              }}
            />
            <div className="relative">
              <p className="text-eyebrow text-2xs text-utah-red">
                Help Build the Network
              </p>
              <h3 className="text-display mt-2 max-w-2xl text-3xl leading-[0.95] text-white md:text-5xl">
                Know a former Ute rugger?{" "}
                <span className="text-utah-red">Pull him in.</span>
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
                We have almost no contact info for most alumni. Text this link
                to every player in your phone. That&apos;s how we build the
                network.
              </p>
              <Link
                href="/thanks"
                className="mt-6 inline-flex items-center gap-2 rounded-sm bg-utah-red px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition-transform motion-safe:hover:-translate-y-px"
              >
                Get Your Forward Link
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-5 py-6 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a
            href="https://www.utah-rugby.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-eyebrow inline-flex items-center gap-1.5 text-2xs text-zinc-500 transition-colors hover:text-white"
          >
            utah-rugby.com
            <ArrowUpRight className="size-3" />
          </a>
          <p className="text-eyebrow text-3xs text-zinc-700">
            Est. 1972
          </p>
        </div>
      </footer>

    </div>
  );
}

// ─── Next Match strip ────────────────────────────────────────────────────────
function NextMatchStrip({ game, nowMs }: { game: Game | null; nowMs: number }) {
  if (!game) {
    return (
      <section className="bg-black py-6">
        <div className="mx-auto flex max-w-6xl items-center gap-4 border-l-4 border-utah-red px-5 md:px-10">
          <div>
            <p className="text-eyebrow text-2xs text-utah-red">
              Off-Season
            </p>
            <p className="text-display mt-1 text-2xl text-white md:text-3xl">
              See you in the spring.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const d = formatGameDateParts(game.date);
  const days = daysUntil(game.date, nowMs);

  return (
    <section className="relative overflow-hidden bg-black">
      {/* Red diagonal wash */}
      <div
        className="absolute right-0 top-0 h-full w-2/5 opacity-10"
        style={{
          background:
            "linear-gradient(105deg, transparent 0%, var(--utah-red) 100%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-5 py-7 md:px-10 md:py-9">
        <div className="flex items-stretch gap-4 border-l-[5px] border-utah-red pl-5 md:gap-8 md:pl-7">
          {/* Date block */}
          <div className="flex shrink-0 flex-col items-start justify-center border-r border-zinc-900 pr-5 md:pr-8">
            <p className="text-eyebrow text-2xs text-zinc-500">{d.weekday}</p>
            <p className="text-display -mt-1 text-5xl leading-none text-white md:text-6xl">
              {d.day}
            </p>
            <p className="text-eyebrow text-2xs text-utah-red">
              {d.month}
            </p>
          </div>

          {/* Match info */}
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="text-eyebrow text-2xs text-utah-red">
              Next Match
            </p>
            <p className="text-display mt-0.5 truncate text-3xl leading-none text-white md:text-5xl">
              vs {game.opponent}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
              <span className="text-eyebrow">
                <span
                  className={`inline-block h-1.5 w-1.5 align-middle ${
                    game.location === "Home" ? "bg-utah-red" : "bg-zinc-600"
                  }`}
                />
                <span className="ml-1.5 align-middle">{game.location}</span>
              </span>
              <span className="text-zinc-800">|</span>
              <span className="text-eyebrow">{game.date}</span>
              {days !== null && days <= 30 && (
                <>
                  <span className="text-zinc-800">|</span>
                  <span className="text-eyebrow text-utah-red">
                    {days === 0
                      ? "Today"
                      : days === 1
                        ? "Tomorrow"
                        : `${days} Days Out`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* CTA — desktop only */}
          <Link
            href="/schedule"
            className="hidden shrink-0 items-center self-center gap-2 rounded-sm border-2 border-white/25 px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white hover:text-black md:inline-flex"
          >
            Full Schedule
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

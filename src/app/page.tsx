export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  HeartHandshake,
  Users,
  Newspaper,
  Trophy,
} from "lucide-react";
import { HeroLogo } from "@/components/hero-logo";
import { UserPhoto } from "@/components/user-photo";
import { SponsorHalo } from "@/components/sponsor-halo";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getHubData } from "@/actions/hub";
import { HubPage } from "@/components/hub/hub-page";
import { fetchSchedule, type Game } from "@/lib/schedule";

// ─── Design tokens ──────────────────────────────────────────────────────────
const RED = "#CC0000";
const RED_DEEP = "#8B0000";
const display =
  "font-[family-name:var(--font-barlow-condensed)] font-black uppercase italic tracking-tight";
const eyebrow =
  "font-[family-name:var(--font-barlow)] font-extrabold uppercase tracking-[0.25em]";

// Diagonal bottom-slash on the hero section
const heroSlash = { clipPath: "polygon(0 0, 100% 0, 100% 95.5%, 0 100%)" };

// ─── Schedule helpers ────────────────────────────────────────────────────────
function parseGameDate(d: string): Date | null {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : new Date(t);
}

function pickNextGame(games: Game[]): Game | null {
  const now = Date.now();
  const upcoming = games
    .map((g) => ({ g, t: parseGameDate(g.date)?.getTime() ?? null }))
    .filter((x) => x.t !== null && x.t! >= now - 1000 * 60 * 60 * 12)
    .sort((a, b) => a.t! - b.t!);
  if (upcoming.length > 0) return upcoming[0].g;
  return games.find((g) => !g.result) ?? null;
}

function formatDateParts(d: string) {
  const date = parseGameDate(d);
  if (!date) return { weekday: "—", day: "—", month: d || "TBD" };
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
    day: String(date.getDate()),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
}

function daysUntil(d: string): number | null {
  const date = parseGameDate(d);
  if (!date) return null;
  const ms = date.getTime() - Date.now();
  return ms < 0 ? 0 : Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function isNew(createdAt?: string): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 1000 * 60 * 60 * 24 * 7;
}

// ────────────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient();

  // getSession() reads the JWT directly from the cookie — no network call.
  // getUser() makes a live Supabase API call that can intermittently return
  // null even with a valid session, incorrectly showing the public page.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    const hubData = await getHubData();
    return <HubPage {...hubData} />;
  }

  // ── Public landing — fetch everything in parallel ──
  const admin = createAdminClient();

  const [
    { count: alumniCount },
    { data: states },
    { data: recentJoins },
    { data: hiringAlumni },
    schedule,
  ] = await Promise.all([
    admin
      .from("alumni")
      .select("*", { count: "exact", head: true })
      .in("status", ["self_registered", "imported"])
      .eq("directory_visible", true),
    admin
      .from("alumni")
      .select("state")
      .in("status", ["self_registered", "imported"])
      .eq("directory_visible", true)
      .not("state", "is", null),
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

  const uniqueStates = new Set(states?.map((r) => r.state)).size;
  const count = alumniCount ?? 0;

  // Sign photo URLs
  const recentPaths = (recentJoins ?? [])
    .filter((a) => a.photo_url)
    .map((a) => a.photo_url!);
  const recentMap: Record<string, string> = {};
  if (recentPaths.length) {
    const { data } = await admin.storage
      .from("alumni-photos")
      .createSignedUrls(recentPaths, 3600);
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
      .createSignedUrls(hiringPaths, 3600);
    (data ?? []).forEach((s) => {
      if (s.signedUrl && s.path) hiringMap[s.path] = s.signedUrl;
    });
  }

  const nextGame = schedule ? pickNextGame(schedule.games) : null;
  const recentResults = (schedule?.games ?? []).filter((g) => g.result).slice(0, 3);
  const upcomingGames = (schedule?.games ?? []).filter((g) => !g.result).slice(0, 5);

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
              background: `linear-gradient(95deg, ${RED_DEEP}99 0%, transparent 55%)`,
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
                <span className="block h-[2px] w-10" style={{ backgroundColor: RED }} />
                <p className={`${eyebrow} text-[10px] text-zinc-300 md:text-[11px]`}>
                  University of Utah Rugby · Alumni Network
                </p>
              </div>

              {/* Main headline */}
              <h1
                className={`${display} text-[17vw] leading-[0.88] text-white sm:text-6xl md:text-[7.5rem]`}
              >
                Once a Ute,
                <br />
                <span style={{ color: RED }}>Always a Ute.</span>
              </h1>

              <p className="mt-6 max-w-sm text-[13px] leading-relaxed text-zinc-300 md:text-sm">
                The private network for every player who ever pulled on the U.
                Find teammates, track the program, hire your brothers.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <Link
                  href="/join"
                  className="inline-flex items-center gap-2 rounded-sm px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition-transform hover:-translate-y-px"
                  style={{ backgroundColor: RED }}
                >
                  Join the Network
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/directory"
                  className="inline-flex items-center gap-2 rounded-sm border-2 border-white/30 bg-black/30 px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-black"
                >
                  Browse Directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Next Match strip ─────────────────────────────────────────────── */}
      <NextMatchStrip game={nextGame} />

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      {count > 0 && (
        <section className="border-y border-zinc-900 bg-zinc-950">
          <div className="mx-auto grid max-w-6xl grid-cols-3">
            {[
              { value: count, label: "Alumni Registered" },
              {
                value: uniqueStates > 0 ? uniqueStates : null,
                label: "States Represented",
              },
              { value: new Date().getFullYear() - 1972, label: "Years of Tradition", suffix: "+" },
            ]
              .filter((s) => s.value !== null)
              .map((s, i, arr) => (
                <div
                  key={s.label}
                  className={`px-4 py-7 md:px-8 md:py-10 ${i < arr.length - 1 ? "border-r border-zinc-900" : ""}`}
                >
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`${display} text-4xl tabular-nums leading-none text-white md:text-6xl`}
                    >
                      {s.value}
                    </span>
                    {s.suffix && (
                      <span
                        className={`${display} text-2xl leading-none md:text-3xl`}
                        style={{ color: RED }}
                      >
                        {s.suffix}
                      </span>
                    )}
                  </div>
                  <span
                    className="mt-2 block h-[2px] w-8"
                    style={{ backgroundColor: RED }}
                  />
                  <p
                    className={`${eyebrow} mt-2 text-[9px] text-zinc-500 md:text-[10px]`}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ── Quick access grid ────────────────────────────────────────────── */}
      <section className="bg-black">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-zinc-900 md:grid-cols-4">
          {[
            { href: "/feed", icon: Newspaper, title: "Feed", sub: "Alumni wall" },
            {
              href: "/directory",
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
              href: "/give",
              icon: HeartHandshake,
              title: "Give",
              sub: "Support the program",
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
                <p className={`${display} text-2xl leading-none text-white md:text-3xl`}>
                  {title}
                </p>
                <p className="mt-1.5 text-[11px] text-zinc-500">{sub}</p>
              </div>
              {/* Red bottom border on hover */}
              <span
                className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[#CC0000] transition-transform duration-200 group-hover:scale-x-100"
              />
              <ArrowUpRight className="absolute right-4 top-4 size-4 text-zinc-700 transition-colors group-hover:text-white" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Schedule preview ─────────────────────────────────────────────── */}
      {(upcomingGames.length > 0 || recentResults.length > 0) && (
        <section className="bg-black px-5 py-10 md:px-10 md:py-14">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <span className="block h-[2px] w-10" style={{ backgroundColor: RED }} />
                <p className={`${eyebrow} mt-2 text-[10px] text-zinc-500`}>Season</p>
                <h2 className={`${display} mt-1 text-3xl text-white md:text-5xl`}>
                  The Schedule
                </h2>
              </div>
              <Link
                href="/schedule"
                className={`${eyebrow} group inline-flex items-center gap-1.5 text-[10px] text-zinc-400 transition-colors hover:text-white`}
              >
                View All
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Upcoming */}
              <div>
                <p className={`${eyebrow} mb-3 text-[10px]`} style={{ color: RED }}>
                  Upcoming
                </p>
                {upcomingGames.length === 0 ? (
                  <p className="py-6 text-sm text-zinc-500">No upcoming games scheduled.</p>
                ) : (
                  <ul className="divide-y divide-zinc-900 border-y border-zinc-900">
                    {upcomingGames.map((g, i) => {
                      const d = formatDateParts(g.date);
                      return (
                        <li key={i} className="flex items-center gap-4 py-3">
                          <div className="flex w-12 shrink-0 flex-col items-center border-r border-zinc-900 pr-3">
                            <span
                              className={`${display} text-2xl leading-none text-white`}
                            >
                              {d.day}
                            </span>
                            <span
                              className={`${eyebrow} text-[9px]`}
                              style={{ color: RED }}
                            >
                              {d.month}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`${display} truncate text-base leading-none text-white md:text-xl`}
                            >
                              vs {g.opponent}
                            </p>
                            <p className={`${eyebrow} mt-1 text-[9px] text-zinc-500`}>
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
                <p className={`${eyebrow} mb-3 text-[10px] text-zinc-400`}>
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
                            className={`${display} flex h-9 w-9 shrink-0 items-center justify-center text-base leading-none text-white`}
                            style={{
                              backgroundColor: win ? RED : "#1a1a1a",
                              border: win ? "none" : "1px solid #2a2a2a",
                            }}
                          >
                            {win ? "W" : "L"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`${display} truncate text-base leading-none text-white md:text-xl`}
                            >
                              vs {g.opponent}
                            </p>
                            <p className={`${eyebrow} mt-1 text-[9px] text-zinc-500`}>
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
                <span className="block h-[2px] w-10" style={{ backgroundColor: RED }} />
                <p className={`${eyebrow} mt-2 text-[10px] text-zinc-500`}>
                  The Brotherhood
                </p>
                <h2 className={`${display} mt-1 text-3xl text-white md:text-4xl`}>
                  Recently Joined
                </h2>
              </div>
              <Link
                href="/directory"
                className={`${eyebrow} group inline-flex items-center gap-1.5 text-[10px] text-zinc-400 transition-colors hover:text-white`}
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
                        background: `linear-gradient(to top, ${RED}99, transparent)`,
                      }}
                    />
                    {isNew(a.created_at) && (
                      <span
                        className={`${eyebrow} absolute left-0 top-0 px-1.5 py-0.5 text-[8px] text-white`}
                        style={{ backgroundColor: RED }}
                      >
                        New
                      </span>
                    )}
                  </div>
                  </SponsorHalo>
                  <p
                    className={`${display} mt-2 truncate text-base leading-tight text-white`}
                  >
                    {a.first_name} {a.last_name}
                  </p>
                  <p className={`${eyebrow} text-[9px] text-zinc-500`}>
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
                <span className="block h-[2px] w-10" style={{ backgroundColor: RED }} />
                <p className={`${eyebrow} mt-2 text-[10px]`} style={{ color: RED }}>
                  Network
                </p>
                <h2 className={`${display} mt-1 text-3xl text-white md:text-4xl`}>
                  Alumni Hiring
                </h2>
              </div>
              <Link
                href="/jobs"
                className={`${eyebrow} group inline-flex items-center gap-1.5 text-[10px] text-zinc-400 transition-colors hover:text-white`}
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
                  <div
                    className="relative aspect-[4/5] overflow-hidden border-2 bg-zinc-950"
                    style={{ borderColor: RED }}
                  >
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
                    <div
                      className={`${eyebrow} absolute left-[-32px] top-3 px-10 py-0.5 text-[9px] text-white shadow-md`}
                      style={{
                        backgroundColor: RED,
                        transform: "rotate(-30deg)",
                      }}
                    >
                      Hiring
                    </div>
                    <div className="absolute inset-x-2 bottom-2">
                      <p
                        className={`${display} truncate text-base leading-tight text-white`}
                      >
                        {a.first_name} {a.last_name}
                      </p>
                      {a.company && (
                        <p className={`${eyebrow} truncate text-[9px] text-zinc-300`}>
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
            <span
              className="absolute left-0 top-0 h-full w-[5px]"
              style={{ backgroundColor: RED }}
            />
            {/* Diagonal stripe background */}
            <div
              className="absolute right-0 top-0 h-full w-1/2 opacity-[0.03]"
              style={{
                background:
                  "repeating-linear-gradient(135deg, white 0 1px, transparent 1px 14px)",
              }}
            />
            <div className="relative">
              <p className={`${eyebrow} text-[10px]`} style={{ color: RED }}>
                Help Build the Network
              </p>
              <h3
                className={`${display} mt-2 max-w-2xl text-3xl leading-[0.95] text-white md:text-5xl`}
              >
                Know a former Ute rugger?{" "}
                <span style={{ color: RED }}>Pull him in.</span>
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
                We have almost no contact info for most alumni. Forward this to
                every player in your phone — that&apos;s how we build the
                network. No ads. No noise. Just the brotherhood.
              </p>
              <Link
                href="/thanks"
                className="mt-6 inline-flex items-center gap-2 rounded-sm px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white transition-transform hover:-translate-y-px"
                style={{ backgroundColor: RED }}
              >
                Get Your Forward Link
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Official website links ────────────────────────────────────────── */}
      <section className="border-t border-zinc-900 bg-zinc-950 px-5 py-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="block h-[2px] w-8" style={{ backgroundColor: RED }} />
            <p className={`${eyebrow} text-[10px] text-zinc-500`}>Official Site</p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-zinc-900 sm:grid-cols-4">
            {[
              { href: "https://www.utah-rugby.com", label: "Home" },
              {
                href: "https://www.utah-rugby.com/new-page-2",
                label: "Schedule",
              },
              { href: "https://www.utah-rugby.com/news", label: "News" },
              { href: "https://www.utah-rugby.com/donate", label: "Donate" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${eyebrow} group flex items-center justify-between bg-zinc-950 px-4 py-4 text-[10px] text-zinc-400 transition-colors hover:bg-black hover:text-white`}
              >
                {label}
                <ArrowUpRight className="size-3 text-zinc-700 transition-colors group-hover:text-white" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="h-4 bg-black" />
    </div>
  );
}

// ─── Next Match strip (standalone so it can be server-composed) ──────────────
function NextMatchStrip({ game }: { game: Game | null }) {
  if (!game) {
    return (
      <section className="bg-black py-6">
        <div
          className="mx-auto flex max-w-6xl items-center gap-4 border-l-4 px-5 md:px-10"
          style={{ borderColor: RED }}
        >
          <div>
            <p className={`${eyebrow} text-[10px]`} style={{ color: RED }}>
              Off-Season
            </p>
            <p className={`${display} mt-1 text-2xl text-white md:text-3xl`}>
              See you in the spring.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const d = formatDateParts(game.date);
  const days = daysUntil(game.date);

  return (
    <section className="relative overflow-hidden bg-black">
      {/* Red diagonal wash */}
      <div
        className="absolute right-0 top-0 h-full w-2/5 opacity-10"
        style={{
          background: `linear-gradient(105deg, transparent 0%, ${RED} 100%)`,
        }}
      />
      <div className="relative mx-auto max-w-6xl px-5 py-7 md:px-10 md:py-9">
        <div
          className="flex items-stretch gap-4 border-l-[5px] pl-5 md:gap-8 md:pl-7"
          style={{ borderColor: RED }}
        >
          {/* Date block */}
          <div className="flex shrink-0 flex-col items-start justify-center border-r border-zinc-900 pr-5 md:pr-8">
            <p className={`${eyebrow} text-[10px] text-zinc-500`}>{d.weekday}</p>
            <p className={`${display} -mt-1 text-5xl leading-none text-white md:text-6xl`}>
              {d.day}
            </p>
            <p className={`${eyebrow} text-[10px]`} style={{ color: RED }}>
              {d.month}
            </p>
          </div>

          {/* Match info */}
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className={`${eyebrow} text-[10px]`} style={{ color: RED }}>
              Next Match
            </p>
            <p
              className={`${display} mt-0.5 truncate text-3xl leading-none text-white md:text-5xl`}
            >
              vs {game.opponent}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
              <span className={eyebrow}>
                <span
                  className="inline-block h-1.5 w-1.5 align-middle"
                  style={{
                    backgroundColor:
                      game.location === "Home" ? RED : "#555",
                  }}
                />
                <span className="ml-1.5 align-middle">{game.location}</span>
              </span>
              <span className="text-zinc-800">|</span>
              <span className={eyebrow}>{game.date}</span>
              {days !== null && days <= 30 && (
                <>
                  <span className="text-zinc-800">|</span>
                  <span className={eyebrow} style={{ color: RED }}>
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
            className="hidden shrink-0 items-center self-center gap-2 rounded-sm border-2 border-white/25 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white hover:text-black md:inline-flex"
          >
            Full Schedule
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

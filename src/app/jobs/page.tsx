export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, Hammer, MapPin, ArrowLeft, MessageCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserPhoto } from "@/components/user-photo";
import { SponsorHalo } from "@/components/sponsor-halo";

export const metadata = {
  title: "Jobs — Utah Rugby Alumni",
  description: "Rugby alumni who are hiring and alumni who are open to work.",
};

type HiringAlum = {
  id: string;
  first_name: string;
  last_name: string;
  grad_year: number | null;
  company: string | null;
  job_title: string | null;
  profession: string | null;
  city: string | null;
  state: string | null;
  photo_url: string | null;
  services: string[] | null;
  industries: string[] | null;
  availability: string | null;
  hiring: boolean;
  sponsor_tier: "bronze" | "silver" | "gold" | null;
};

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/auth/login?next=/jobs");

  const admin = createAdminClient();

  const [hiringRes, openRes] = await Promise.all([
    admin
      .from("alumni")
      .select(
        "id, first_name, last_name, grad_year, company, job_title, profession, city, state, photo_url, services, industries, availability, hiring, sponsor_tier"
      )
      .in("status", ["self_registered", "imported"])
      .eq("directory_visible", true)
      .eq("hiring", true)
      .order("created_at", { ascending: false })
      .limit(24),
    admin
      .from("alumni")
      .select(
        "id, first_name, last_name, grad_year, company, job_title, profession, city, state, photo_url, services, industries, availability, hiring, sponsor_tier"
      )
      .in("status", ["self_registered", "imported"])
      .eq("directory_visible", true)
      .in("availability", ["open_to_work", "looking_for_work"])
      .order("created_at", { ascending: false })
      .limit(24),
  ]);

  const hiring = (hiringRes.data as HiringAlum[]) ?? [];
  const open = (openRes.data as HiringAlum[]) ?? [];

  // Batch-sign all photos
  const allPaths = [...hiring, ...open]
    .filter((a) => a.photo_url)
    .map((a) => a.photo_url!);
  const photoMap: Record<string, string> = {};
  if (allPaths.length > 0) {
    const { data: sigs } = await admin.storage
      .from("alumni-photos")
      .createSignedUrls(allPaths, 3600);
    (sigs ?? []).forEach((s) => {
      if (s.signedUrl && s.path) photoMap[s.path] = s.signedUrl;
    });
  }

  function photoFor(a: HiringAlum) {
    return a.photo_url ? photoMap[a.photo_url] ?? null : null;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 px-5 py-4 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Home
        </Link>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-white">
          Jobs
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Rugby alumni hiring right now, and teammates looking for their next
          move.
        </p>
      </div>

      <div className="space-y-8 px-5 py-6 md:px-10">
        {/* Hiring now */}
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-400">
              <Hammer className="size-3" /> Alumni Hiring Now
            </p>
            <span className="text-[10px] font-semibold text-zinc-500">
              {hiring.length} {hiring.length === 1 ? "alum" : "alumni"}
            </span>
          </div>
          {hiring.length === 0 ? (
            <EmptyCard
              icon={<Hammer className="size-6 text-sky-400" />}
              title="No one hiring right now"
              body="Toggle 'Hiring' on your profile to post here."
              cta={{ href: "/profile", label: "Edit my profile" }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {hiring.map((a) => (
                <JobCard key={a.id} alum={a} photo={photoFor(a)} mode="hiring" />
              ))}
            </div>
          )}
        </section>

        {/* Open to work */}
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <Sparkles className="size-3" /> Open To Work
            </p>
            <span className="text-[10px] font-semibold text-zinc-500">
              {open.length} {open.length === 1 ? "alum" : "alumni"}
            </span>
          </div>
          {open.length === 0 ? (
            <EmptyCard
              icon={<Sparkles className="size-6 text-emerald-400" />}
              title="No one listed as open to work"
              body="Know someone looking? Forward them the network."
              cta={{ href: "/thanks", label: "Get forward link" }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {open.map((a) => (
                <JobCard key={a.id} alum={a} photo={photoFor(a)} mode="open" />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function JobCard({
  alum,
  photo,
  mode,
}: {
  alum: HiringAlum;
  photo: string | null;
  mode: "hiring" | "open";
}) {
  const location = [alum.city, alum.state].filter(Boolean).join(", ");
  const role = alum.job_title ?? alum.profession;
  const badge =
    mode === "hiring"
      ? { label: "Hiring", className: "bg-sky-500 text-white", Icon: Hammer }
      : {
          label: "Open to work",
          className: "bg-emerald-500 text-white",
          Icon: Sparkles,
        };

  return (
    <Link
      href={`/u/${alum.id}`}
      className="group flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-zinc-700"
    >
      <SponsorHalo tier={alum.sponsor_tier ?? null} size="md" rounded="rounded-xl">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
          <UserPhoto
            src={photo}
            alt={`${alum.first_name} ${alum.last_name}`}
            firstName={alum.first_name}
            lastName={alum.last_name}
            fill
            rounded="none"
          />
        </div>
      </SponsorHalo>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${badge.className}`}
          >
            <badge.Icon className="size-2.5" />
            {badge.label}
          </span>
          {alum.grad_year && (
            <span className="rounded-md bg-[#CC0000] px-1.5 py-0.5 text-[10px] font-black text-white">
              &rsquo;{String(alum.grad_year).slice(-2)}
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-sm font-bold text-white">
          {alum.first_name} {alum.last_name}
        </p>
        {(role || alum.company) && (
          <p className="flex items-center gap-1 truncate text-xs text-zinc-300">
            <Briefcase className="size-3 shrink-0 text-zinc-500" />
            <span className="truncate">
              {role}
              {role && alum.company && <span className="text-zinc-500"> · </span>}
              {alum.company}
            </span>
          </p>
        )}
        {location && (
          <p className="flex items-center gap-1 truncate text-xs text-zinc-500">
            <MapPin className="size-3 shrink-0" />
            {location}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-[#CC0000]">
          <MessageCircle className="size-3" />
          View profile
        </div>
      </div>
    </Link>
  );
}

function EmptyCard({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-10 text-center">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-zinc-800">
        {icon}
      </div>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-xs text-zinc-500">{body}</p>
      <Link
        href={cta.href}
        className="mt-3 inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-[#CC0000]"
      >
        {cta.label}
      </Link>
    </div>
  );
}

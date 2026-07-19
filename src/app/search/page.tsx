export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, User, FileText, CalendarDays, ArrowLeft } from "lucide-react";
import { searchAction, type SearchResult } from "@/actions/search";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Search — Utah Rugby Alumni" };

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/auth/login?next=/search");

  const results: SearchResult[] = query.length >= 2 ? await searchAction(query) : [];

  return (
    <div className="min-h-screen bg-surface-0">
      <div className="border-b border-white/6 px-5 py-4 md:px-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="size-3.5" /> Home
        </Link>
        <h1 className="mt-3 text-title-1 text-white">Search</h1>
      </div>

      <div className="px-5 py-4 md:px-10">
        <form action="/search" method="get">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search alumni, posts, events…"
              autoFocus
              className="w-full rounded-xl border border-border-strong bg-surface-1 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
          </div>
        </form>
      </div>

      <div className="px-5 pb-8 md:px-10 space-y-2 max-w-2xl">
        {query.length >= 2 && results.length === 0 && (
          <div className="py-12 text-center">
            <Search className="mx-auto size-8 text-zinc-700 mb-3" />
            <p className="text-sm font-bold text-zinc-400">No results for &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-xs text-zinc-600">Try a different search term.</p>
          </div>
        )}

        {results.map((r) => {
          if (r.type === "alumni") {
            return (
              <Link
                key={`alumni-${r.id}`}
                href={`/u/${r.id}`}
                className="flex items-center gap-3 surface-card p-3 transition-colors hover:border-border-strong"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-surface-2 text-zinc-400">
                  <User className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{r.first_name} {r.last_name}</p>
                  <p className="text-xs text-zinc-500 truncate">
                    {[r.profession, r.company, r.grad_year ? `Class of ${r.grad_year}` : null].filter(Boolean).join(" · ") || "Alumni"}
                  </p>
                </div>
                <span className="text-3xs font-bold uppercase tracking-widest text-zinc-600">Alumni</span>
              </Link>
            );
          }
          if (r.type === "post") {
            return (
              <Link
                key={`post-${r.id}`}
                href={`/feed/${r.id}`}
                className="flex items-center gap-3 surface-card p-3 transition-colors hover:border-border-strong"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-surface-2 text-zinc-400">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-300 truncate">{r.body}</p>
                  <p className="text-xs text-zinc-600 truncate">by {r.author_name}</p>
                </div>
                <span className="text-3xs font-bold uppercase tracking-widest text-zinc-600">Post</span>
              </Link>
            );
          }
          return (
            <Link
              key={`event-${r.id}`}
              href={`/events/${r.id}`}
              className="flex items-center gap-3 surface-card p-3 transition-colors hover:border-border-strong"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-utah-red/15 text-utah-red">
                <CalendarDays className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{r.title}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(r.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <span className="text-3xs font-bold uppercase tracking-widest text-zinc-600">Event</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

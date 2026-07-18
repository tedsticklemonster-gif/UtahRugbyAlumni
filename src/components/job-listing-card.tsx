"use client";

import Link from "next/link";
import { Briefcase, MapPin, DollarSign, ExternalLink, Globe } from "lucide-react";
import type { JobListing } from "@/actions/jobs";

export function JobListingCard({ job }: { job: JobListing }) {
  const timeAgo = getTimeAgo(job.created_at);

  return (
    <div className="surface-card p-4 transition-[border-color,box-shadow] duration-200 ease-out hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-card-title text-white">{job.title}</h3>
          <p className="flex items-center gap-1.5 mt-1 text-sm text-zinc-300">
            <Briefcase className="size-3.5 shrink-0 text-zinc-500" />
            {job.company}
          </p>
        </div>
        {job.alumni_grad_year && (
          <span className="rounded-md bg-utah-red px-1.5 py-0.5 text-2xs font-semibold text-white shrink-0">
            &rsquo;{String(job.alumni_grad_year).slice(-2)}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {job.location && (
          <p className="flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="size-3" />
            {job.location}
          </p>
        )}
        {job.remote && (
          <p className="flex items-center gap-1 text-xs text-success">
            <Globe className="size-3" />
            Remote
          </p>
        )}
        {job.salary_range && (
          <p className="flex items-center gap-1 text-xs text-zinc-500">
            <DollarSign className="size-3" />
            {job.salary_range}
          </p>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-zinc-400 line-clamp-3">
        {job.description}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <Link
          href={`/u/${job.alumni_id}`}
          className="text-caption text-2xs hover:text-white transition-colors"
          suppressHydrationWarning
        >
          Posted by {job.alumni_first_name} {job.alumni_last_name} · {timeAgo}
        </Link>
        {job.apply_url && (
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-utah-red px-3.5 py-1.5 text-xs font-semibold text-white shadow-card hover:bg-utah-red/90 transition-colors"
          >
            Apply <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

"use client";

import Link from "next/link";
import { User, Briefcase, MapPin, FileText, Camera, Link2 } from "lucide-react";


interface ProfileFields {
  has_photo: boolean;
  has_bio: boolean;
  has_profession: boolean;
  has_company: boolean;
  has_city: boolean;
  has_linkedin: boolean;
  has_grad_year: boolean;
  has_position: boolean;
}

const FIELDS: { key: keyof ProfileFields; label: string; icon: typeof User }[] = [
  { key: "has_photo", label: "Add a photo", icon: Camera },
  { key: "has_bio", label: "Write a bio", icon: FileText },
  { key: "has_profession", label: "Add profession", icon: Briefcase },
  { key: "has_company", label: "Add company", icon: Briefcase },
  { key: "has_city", label: "Add location", icon: MapPin },
  { key: "has_linkedin", label: "Add LinkedIn", icon: Link2 },
  { key: "has_grad_year", label: "Add grad year", icon: User },
  { key: "has_position", label: "Add position played", icon: User },
];

export function ProfileCompletion({ fields }: { fields: ProfileFields }) {
  const completed = Object.values(fields).filter(Boolean).length;
  const total = FIELDS.length;
  const pct = Math.round((completed / total) * 100);

  if (pct === 100) return null;

  const missing = FIELDS.filter((f) => !fields[f.key]);
  const nextTip = missing[0];

  return (
    <div className="mx-4 mt-4">
      <Link
        href="/me"
        className="block rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-utah-red/40"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-white">Profile Strength</p>
          <span className={`text-display text-lg text-utah-red`}>{pct}%</span>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-utah-red transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {nextTip && (
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
            <nextTip.icon className="size-3.5 text-zinc-500" />
            <span>
              Next: <span className="text-zinc-300">{nextTip.label}</span>
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}

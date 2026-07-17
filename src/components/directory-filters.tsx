"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AVAILABILITY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Any" },
  { value: "open_to_work", label: "Open to work" },
  { value: "looking_for_work", label: "Actively looking" },
  { value: "self_employed", label: "Self-employed" },
  { value: "employed", label: "Employed" },
  { value: "student", label: "Student" },
];

export function DirectoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/directory?${params.toString()}`);
    },
    [router, searchParams]
  );

  const debouncedUpdate = useCallback(
    (key: string, value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => updateFilter(key, value), 300);
    },
    [updateFilter]
  );

  const toggleFlag = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(key) === "1") {
        params.delete(key);
      } else {
        params.set(key, "1");
      }
      router.push(`/directory?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearFilters() {
    router.push("/directory");
  }

  const hasFilters =
    searchParams.has("yearFrom") ||
    searchParams.has("yearTo") ||
    searchParams.has("position") ||
    searchParams.has("state") ||
    searchParams.has("q") ||
    searchParams.has("availability") ||
    searchParams.has("hiring") ||
    searchParams.has("mentor") ||
    searchParams.has("service");

  const availability = searchParams.get("availability") ?? "";
  const hiring = searchParams.get("hiring") === "1";
  const mentor = searchParams.get("mentor") === "1";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-1 lg:col-span-2">
          <Label htmlFor="q" className="text-xs uppercase tracking-wide text-zinc-400">
            Search
          </Label>
          <Input
            id="q"
            placeholder="Name, profession, company..."
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => debouncedUpdate("q", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="availability" className="text-xs uppercase tracking-wide text-zinc-400">
            Availability
          </Label>
          <select
            id="availability"
            value={availability}
            onChange={(e) => updateFilter("availability", e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-utah-red"
          >
            {AVAILABILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="service" className="text-xs uppercase tracking-wide text-zinc-400">
            Service
          </Label>
          <Input
            id="service"
            placeholder="e.g. legal"
            defaultValue={searchParams.get("service") ?? ""}
            onChange={(e) => debouncedUpdate("service", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="yearFrom" className="text-xs uppercase tracking-wide text-zinc-400">
            Year from
          </Label>
          <Input
            id="yearFrom"
            type="number"
            min={1960}
            placeholder="1960"
            defaultValue={searchParams.get("yearFrom") ?? ""}
            onChange={(e) => updateFilter("yearFrom", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="yearTo" className="text-xs uppercase tracking-wide text-zinc-400">
            Year to
          </Label>
          <Input
            id="yearTo"
            type="number"
            placeholder={String(new Date().getFullYear())}
            defaultValue={searchParams.get("yearTo") ?? ""}
            onChange={(e) => updateFilter("yearTo", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => toggleFlag("hiring")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            hiring
              ? "bg-sky-500 text-white"
              : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
          }`}
        >
          Hiring now
        </button>
        <button
          type="button"
          onClick={() => toggleFlag("mentor")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            mentor
              ? "bg-amber-500 text-zinc-950"
              : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
          }`}
        >
          Mentors
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto text-xs font-semibold text-zinc-500 hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

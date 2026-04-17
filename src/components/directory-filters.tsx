"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function DirectoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  function clearFilters() {
    router.push("/directory");
  }

  const hasFilters =
    searchParams.has("yearFrom") ||
    searchParams.has("yearTo") ||
    searchParams.has("position") ||
    searchParams.has("state") ||
    searchParams.has("q");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1">
          <Label htmlFor="q" className="text-xs">
            Search
          </Label>
          <Input
            id="q"
            placeholder="Name, profession..."
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => updateFilter("q", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="yearFrom" className="text-xs">
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
          <Label htmlFor="yearTo" className="text-xs">
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
        <div className="space-y-1">
          <Label htmlFor="position" className="text-xs">
            Position
          </Label>
          <Input
            id="position"
            placeholder="e.g. flanker"
            defaultValue={searchParams.get("position") ?? ""}
            onChange={(e) => updateFilter("position", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="state" className="text-xs">
            State
          </Label>
          <Input
            id="state"
            placeholder="e.g. Utah"
            defaultValue={searchParams.get("state") ?? ""}
            onChange={(e) => updateFilter("state", e.target.value)}
          />
        </div>
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}

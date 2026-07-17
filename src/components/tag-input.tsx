"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface TagInputProps {
  label: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  maxTags?: number;
}

export function TagInput({
  label,
  placeholder,
  value,
  onChange,
  maxTags = 10,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const next = draft.trim().toLowerCase();
    if (!next) return;
    if (value.includes(next)) {
      setDraft("");
      return;
    }
    if (value.length >= maxTags) return;
    onChange([...value, next]);
    setDraft("");
  }

  function removeAt(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 focus-within:ring-1 focus-within:ring-utah-red">
        {value.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-utah-red/15 px-2 py-0.5 text-xs font-semibold text-[#FF5555]"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => removeAt(i)}
              className="opacity-70 hover:opacity-100"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            } else if (e.key === "Backspace" && !draft && value.length) {
              removeAt(value.length - 1);
            }
          }}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent py-1 text-sm text-white outline-none placeholder:text-zinc-500"
        />
      </div>
      <p className="text-xs text-zinc-500">
        Press Enter or comma to add. {value.length}/{maxTags}
      </p>
    </div>
  );
}

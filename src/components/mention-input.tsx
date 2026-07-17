"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface MentionCandidate {
  id: string;
  first_name: string;
  last_name: string;
  handle: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string, mentionIds: string[]) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
}

export function MentionInput({ value, onChange, placeholder, rows = 2, maxLength = 2000, className }: MentionInputProps) {
  const [candidates, setCandidates] = useState<MentionCandidate[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number>(-1);
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mentionQuery === null || mentionQuery.length < 1) return;
    // Escape postgrest operator metacharacters in user input so a `,` or `)` in
    // the query can't break out of the .or() expression.
    const q = mentionQuery.toLowerCase().replace(/[%,()]/g, "");
    if (!q) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("alumni")
      .select("id, first_name, last_name, handle")
      .eq("verified", true)
      .or(`handle.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      .limit(6)
      .then(({ data }) => {
        if (!cancelled) setCandidates(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [mentionQuery]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    const pos = e.target.selectionStart ?? text.length;

    // Detect @-trigger: find last @ before cursor with no space after it
    const before = text.slice(0, pos);
    const atMatch = before.match(/@([\w]*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionStart(pos - atMatch[0].length);
    } else {
      setMentionQuery(null);
      setMentionStart(-1);
      setCandidates([]);
    }

    onChange(text, mentionIds);
  }

  function insertMention(candidate: MentionCandidate) {
    const name = candidate.handle
      ? `@${candidate.handle}`
      : `@${candidate.first_name}${candidate.last_name}`;

    const before = value.slice(0, mentionStart);
    const after = value.slice(textareaRef.current?.selectionStart ?? value.length);
    const next = before + name + " " + after;

    const nextIds = mentionIds.includes(candidate.id)
      ? mentionIds
      : [...mentionIds, candidate.id];

    setMentionIds(nextIds);
    setMentionQuery(null);
    setCandidates([]);
    onChange(next, nextIds);

    setTimeout(() => {
      if (textareaRef.current) {
        const pos = before.length + name.length + 1;
        textareaRef.current.setSelectionRange(pos, pos);
        textareaRef.current.focus();
      }
    }, 0);
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={className}
      />

      {candidates.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
          {candidates.map((c) => (
            <button
              key={c.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); insertMention(c); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-800"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-2xs font-bold text-zinc-300">
                {c.first_name[0]}{c.last_name[0]}
              </div>
              <div>
                <p className="font-semibold text-white">{c.first_name} {c.last_name}</p>
                {c.handle && <p className="text-2xs text-zinc-500">@{c.handle}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

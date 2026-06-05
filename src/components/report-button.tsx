"use client";

import { useState, useTransition } from "react";
import { Flag, X, Check } from "lucide-react";
import { reportContentAction } from "@/actions/moderation";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "fake_profile", label: "Fake profile" },
  { value: "other", label: "Other" },
] as const;

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: "alumni" | "post" | "comment" | "event" | "message";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<typeof REASONS[number]["value"]>("spam");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      await reportContentAction(targetType, targetId, reason, details);
      setSubmitted(true);
      setTimeout(() => { setOpen(false); setSubmitted(false); }, 2000);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-600 hover:text-red-400 transition-colors"
        title="Report"
      >
        <Flag className="size-3" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Report Content</h3>
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            {submitted ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-900/50 text-emerald-400">
                  <Check className="size-6" />
                </div>
                <p className="text-sm font-bold text-white">Report submitted</p>
                <p className="mt-1 text-xs text-zinc-500">An admin will review this.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  {REASONS.map(({ value, label }) => (
                    <label key={value} className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors ${reason === value ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}>
                      <input
                        type="radio"
                        name="reason"
                        value={value}
                        checked={reason === value}
                        onChange={() => setReason(value)}
                        className="accent-[#CC0000]"
                      />
                      <span className="text-sm text-zinc-300">{label}</span>
                    </label>
                  ))}
                </div>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Additional details (optional)"
                  rows={2}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none"
                />
                <button
                  onClick={handleSubmit}
                  disabled={pending}
                  className="w-full rounded-xl bg-[#CC0000] py-2.5 text-sm font-bold text-white hover:bg-[#AA0000] disabled:opacity-50"
                >
                  {pending ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

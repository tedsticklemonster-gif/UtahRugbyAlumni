"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Check } from "lucide-react";
import { createJobAction } from "@/actions/jobs";

export function PostJobButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createJobAction(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => { setOpen(false); setSuccess(false); }, 2000);
    });
  }

  const inputCls = "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-utah-red px-4 py-2 text-xs font-bold text-white hover:bg-[#AA0000] transition-colors"
      >
        <Plus className="size-4" /> Post a Job
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-zinc-800 bg-zinc-900 p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Post a Job</h3>
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-900/50 text-emerald-400">
                  <Check className="size-6" />
                </div>
                <p className="text-sm font-bold text-white">Job posted!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input name="title" placeholder="Job title *" required className={inputCls} />
                <input name="company" placeholder="Company *" required className={inputCls} />
                <input name="location" placeholder="Location (e.g. Salt Lake City, UT)" className={inputCls} />
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input type="checkbox" name="remote" value="true" className="accent-utah-red" />
                  Remote position
                </label>
                <textarea
                  name="description"
                  placeholder="Job description *"
                  required
                  rows={4}
                  maxLength={2000}
                  className={`${inputCls} resize-none`}
                />
                <input name="salary_range" placeholder="Salary range (e.g. $80k-$120k)" className={inputCls} />
                <input name="apply_url" placeholder="Application URL" type="url" className={inputCls} />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-xl bg-utah-red py-2.5 text-sm font-bold text-white hover:bg-[#AA0000] disabled:opacity-50"
                >
                  {pending ? "Posting..." : "Post Job"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Eye } from "lucide-react";
import { updateReportStatusAction } from "@/actions/moderation";

export function ModerationActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle(status: "reviewed" | "actioned" | "dismissed") {
    startTransition(async () => {
      await updateReportStatusAction(reportId, status);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => handle("actioned")}
        disabled={pending}
        className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        title="Take action"
      >
        <Check className="size-4" />
      </button>
      <button
        onClick={() => handle("reviewed")}
        disabled={pending}
        className="flex size-8 items-center justify-center rounded-lg bg-surface-2 text-zinc-400 hover:bg-zinc-700 transition-colors disabled:opacity-50"
        title="Mark reviewed"
      >
        <Eye className="size-4" />
      </button>
      <button
        onClick={() => handle("dismissed")}
        disabled={pending}
        className="flex size-8 items-center justify-center rounded-lg bg-surface-2 text-zinc-400 hover:bg-zinc-700 transition-colors disabled:opacity-50"
        title="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

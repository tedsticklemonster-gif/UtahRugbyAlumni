"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CreatePost } from "@/components/create-post";
import { EventComposer } from "@/components/event-composer";
import { cn } from "@/lib/utils";

type Tab = "post" | "event";

interface ComposerSheetProps {
  open: boolean;
  onClose: () => void;
}

export function ComposerSheet({ open, onClose }: ComposerSheetProps) {
  const [tab, setTab] = useState<Tab>("post");
  // Reset tab to "post" whenever the sheet transitions from open → closed.
  // React 19 derived-state-from-props pattern (avoids cascading-render lint).
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setTab("post");
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-surface-0 border-t border-zinc-800",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-zinc-700" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div className="flex gap-1">
            {(["post", "event"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold capitalize transition-colors",
                  tab === t
                    ? "bg-surface-2 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-zinc-400 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 pb-safe max-h-[70vh] overflow-y-auto">
          {tab === "post" ? (
            <CreatePost onSuccess={onClose} />
          ) : (
            <EventComposer onSuccess={onClose} />
          )}
        </div>
      </div>
    </>
  );
}

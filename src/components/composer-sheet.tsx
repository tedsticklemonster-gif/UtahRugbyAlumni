"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { CreatePost } from "@/components/create-post";
import { cn } from "@/lib/utils";

interface ComposerSheetProps {
  open: boolean;
  onClose: () => void;
}

export function ComposerSheet({ open, onClose }: ComposerSheetProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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
          "fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-zinc-950 border-t border-zinc-800",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-zinc-700" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div className="flex gap-1">
            <span className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-bold text-white">
              Post
            </span>
            <span className="rounded-lg px-3 py-1 text-xs font-medium text-zinc-600 cursor-not-allowed">
              Event (coming soon)
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 pb-safe">
          <CreatePost onSuccess={onClose} />
        </div>
      </div>
    </>
  );
}

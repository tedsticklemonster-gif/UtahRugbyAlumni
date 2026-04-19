"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Show on iOS (no beforeinstallprompt support) or when prompt is available
  if (!isIOS && !installPrompt) return null;

  const handleClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") setInstallPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        aria-label="Install app"
        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
      >
        <Download className="size-5" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#CC0000]">
                  <Smartphone className="size-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Install the App</p>
                  <p className="text-sm text-zinc-400">Utah Rugby Alumni</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-zinc-300"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <ol className="space-y-3 text-sm text-zinc-300">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-white">1</span>
                <span>Tap the <strong className="text-white">Share</strong> button at the bottom of Safari (the box with an arrow pointing up)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-white">2</span>
                <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-white">3</span>
                <span>Tap <strong className="text-white">Add</strong> in the top right corner</span>
              </li>
            </ol>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full rounded-xl bg-[#CC0000] py-2.5 text-sm font-semibold text-white hover:bg-[#AA0000] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

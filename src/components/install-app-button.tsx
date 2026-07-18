"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine } from "lucide-react";
import { InstallGuide } from "@/components/install-guide";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Hide if already running as standalone PWA
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true);

  if (isStandalone) return null;

  const handleClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") setInstallPrompt(null);
    } else {
      setGuideOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        aria-label="Install app to home screen"
        className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-zinc-400 transition-colors hover:bg-surface-2 hover:text-white"
      >
        <ArrowDownToLine className="size-[18px] shrink-0" />
        <span className="hidden text-sm font-medium md:inline">
          App
        </span>
      </button>

      {guideOpen && <InstallGuide onClose={() => setGuideOpen(false)} />}
    </>
  );
}

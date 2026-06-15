"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, ArrowUpRight } from "lucide-react";
import { InstallGuide } from "@/components/install-guide";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

const display =
  "font-[family-name:var(--font-barlow-condensed)] font-black uppercase italic tracking-tight";

const subscribeStandalone = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function InstallTile() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  // Read standalone status from the platform on every render. Server snapshot
  // returns false so SSR markup matches first client paint; no setState in effect.
  const standalone = useSyncExternalStore(
    subscribeStandalone,
    () => isStandalone(),
    () => false,
  );

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (standalone) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
    } else if (isIOS()) {
      setGuideOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="group relative flex flex-col items-start gap-3 bg-black p-5 transition-colors hover:bg-zinc-950 md:p-6 text-left"
      >
        <Download
          className="size-6 text-zinc-500 transition-colors group-hover:text-white"
          strokeWidth={1.75}
        />
        <div>
          <p className={`${display} text-2xl leading-none text-white md:text-3xl`}>
            Get App
          </p>
          <p className="mt-1.5 text-[11px] text-zinc-500">Add to home screen</p>
        </div>
        <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[#CC0000] transition-transform duration-200 group-hover:scale-x-100" />
        <ArrowUpRight className="absolute right-4 top-4 size-4 text-zinc-700 transition-colors group-hover:text-white" />
      </button>

      {guideOpen && <InstallGuide onClose={() => setGuideOpen(false)} />}
    </>
  );
}

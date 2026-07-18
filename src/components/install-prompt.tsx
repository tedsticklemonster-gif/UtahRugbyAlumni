"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallGuide } from "@/components/install-guide";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "urn_install_dismissed_at";
const DISMISS_DAYS = 14;

function recentlyDismissed() {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return false;
  return (Date.now() - dismissedAt) / 86_400_000 < DISMISS_DAYS;
}

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

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"ios" | "android">("ios");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setMode("android");
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    if (isIOS()) {
      const t = setTimeout(() => setVisible(true), 3000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  };

  if (!visible) return null;

  return (
    <>
      <div
        role="dialog"
        aria-label="Install Utah Rugby Alumni"
        className="fixed inset-x-0 bottom-16 z-40 mx-auto max-w-md px-3 md:hidden"
      >
        <div className="relative rounded-2xl border border-border-strong bg-surface-1 p-4 shadow-xl">
          <button
            type="button"
            aria-label="Dismiss install prompt"
            onClick={dismiss}
            className="absolute right-2 top-2 rounded-md p-1 text-zinc-500 hover:text-white"
          >
            <X className="size-4" />
          </button>

          <p className="pr-6 text-sm font-bold text-white">
            Install Utah Rugby Alumni
          </p>
          <p className="mt-1 pr-6 text-xs leading-relaxed text-zinc-400">
            Add it to your home screen for one-tap access — works like a native app.
          </p>

          <div className="mt-3 flex gap-2">
            {mode === "ios" ? (
              <Button
                size="sm"
                className="bg-utah-red text-white hover:bg-utah-red/90"
                onClick={() => setGuideOpen(true)}
              >
                Show me how
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-utah-red text-white hover:bg-utah-red/90"
                onClick={install}
              >
                Install
              </Button>
            )}
            <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
      </div>

      {guideOpen && (
        <InstallGuide onClose={() => { setGuideOpen(false); dismiss(); }} />
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type SubscribeState = "unsupported" | "denied" | "subscribed" | "unsubscribed" | "loading";

function initialPushState(): SubscribeState {
  // Runs once on mount before paint via lazy initializer — keeps `setState`
  // out of effect bodies for the synchronous platform-detection branches.
  if (typeof window === "undefined") return "loading";
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  return "loading";
}

export function PushSubscribe() {
  const [state, setState] = useState<SubscribeState>(initialPushState);

  useEffect(() => {
    if (state !== "loading") return;
    let cancelled = false;
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (!cancelled) setState(sub ? "subscribed" : "unsubscribed");
    });
    return () => {
      cancelled = true;
    };
  }, [state]);

  const subscribe = async () => {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = sub.toJSON();
      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      setState("subscribed");
    } catch {
      setState(Notification.permission === "denied" ? "denied" : "unsubscribed");
    }
  };

  const unsubscribe = async () => {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("unsubscribed");
    } catch {
      setState("subscribed");
    }
  };

  if (state === "unsupported" || state === "denied") return null;

  return (
    <button
      onClick={state === "subscribed" ? unsubscribe : subscribe}
      disabled={state === "loading"}
      className="flex items-center gap-2 rounded-full border border-border-strong px-4 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:border-white/25 hover:text-white disabled:opacity-50"
    >
      {state === "subscribed" ? (
        <>
          <BellOff className="size-4" />
          Turn off notifications
        </>
      ) : (
        <>
          <Bell className="size-4" />
          {state === "loading" ? "…" : "Turn on notifications"}
        </>
      )}
    </button>
  );
}

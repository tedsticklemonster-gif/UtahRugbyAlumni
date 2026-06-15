"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, CalendarDays, UserPlus, Briefcase, Megaphone, ExternalLink } from "lucide-react";
import { updateNotificationPrefsAction } from "@/actions/notification-prefs";

const TELEGRAM_INVITE = "https://t.me/+ajaqw-YQ1ZsxYjQx";

const PREF_OPTIONS = [
  { key: "messages", label: "Direct messages", desc: "When someone sends you a message", icon: MessageCircle, default: true },
  { key: "event_reminders", label: "Event reminders", desc: "Reminders for events you RSVP'd to", icon: CalendarDays, default: true },
  { key: "new_events", label: "New events", desc: "When a new event is created", icon: CalendarDays, default: true },
  { key: "post_reactions", label: "Post reactions", desc: "When someone reacts to your posts", icon: Bell, default: true },
  { key: "post_comments", label: "Post comments", desc: "When someone comments on your posts", icon: MessageCircle, default: true },
  { key: "new_joins", label: "New member joins", desc: "When a new alumni joins the network", icon: UserPlus, default: false },
  { key: "era_joins", label: "Era member joins", desc: "When someone from your era joins", icon: UserPlus, default: true },
  { key: "jobs", label: "Job opportunities", desc: "When alumni post new jobs", icon: Briefcase, default: false },
  { key: "announcements", label: "Announcements", desc: "Admin announcements and updates", icon: Megaphone, default: true },
  { key: "weekly_digest", label: "Weekly digest email", desc: "Weekly summary of network activity", icon: Bell, default: true },
];

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export function NotificationSettings({
  initialPrefs,
}: {
  alumniId?: string;
  initialPrefs: Record<string, boolean>;
}) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const p: Record<string, boolean> = {};
    for (const opt of PREF_OPTIONS) {
      p[opt.key] = initialPrefs[opt.key] ?? opt.default;
    }
    return p;
  });
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggle(key: string) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  }

  function handleSave() {
    startSave(async () => {
      await updateNotificationPrefsAction(prefs);
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Telegram — primary notification channel */}
      <div className="rounded-xl border border-[#26A5E4]/30 bg-[#26A5E4]/5 p-4">
        <div className="flex items-start gap-3">
          <TelegramIcon className="size-8 shrink-0 text-[#26A5E4]" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Telegram Channel</p>
            <p className="mt-0.5 text-xs text-zinc-400">
              The best way to get instant notifications. New posts, events, announcements,
              and member joins all go straight to Telegram.
            </p>
            <a
              href={TELEGRAM_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#26A5E4] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1E96D1]"
            >
              Join Channel
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Email preferences */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">Email Notifications</p>
        <div className="space-y-1">
          {PREF_OPTIONS.map(({ key, label, desc, icon: Icon }) => (
            <label
              key={key}
              className="flex items-center justify-between gap-3 rounded-xl p-3 hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="size-4 shrink-0 text-zinc-500" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[key]}
                onClick={() => toggle(key)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  prefs[key] ? "bg-[#CC0000]" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    prefs[key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-[#CC0000] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#AA0000] disabled:opacity-50"
        >
          {saving ? "Saving\u2026" : saved ? "Saved!" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}

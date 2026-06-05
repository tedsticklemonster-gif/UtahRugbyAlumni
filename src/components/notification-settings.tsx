"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, CalendarDays, UserPlus, Briefcase, Megaphone } from "lucide-react";
import { updateNotificationPrefsAction } from "@/actions/notification-prefs";

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

export function NotificationSettings({
  alumniId,
  initialPrefs,
}: {
  alumniId: string;
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

      <div className="pt-4">
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

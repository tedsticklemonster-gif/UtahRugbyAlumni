"use client";

import { useState } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface Step {
  title: string;
  instruction: string;
  visual: React.ReactNode;
}

/* ── CSS-illustrated iPhone Safari UI mockups ── */

function ShareButtonVisual() {
  return (
    <div className="relative mx-auto w-[220px]">
      {/* Phone chrome */}
      <div className="overflow-hidden rounded-3xl border-4 border-zinc-700 bg-zinc-900">
        {/* Safari address bar */}
        <div className="flex items-center gap-2 border-b border-zinc-700 bg-zinc-800 px-3 py-2">
          <div className="h-5 flex-1 rounded-md bg-zinc-700 px-2 flex items-center">
            <span className="text-[9px] text-zinc-400 truncate">utah-rugby-alumni.vercel.app</span>
          </div>
        </div>
        {/* Page content preview */}
        <div className="flex h-28 items-center justify-center bg-zinc-950">
          <div className="h-8 w-8 rounded-xl bg-white/10" />
        </div>
        {/* Safari bottom bar */}
        <div className="flex items-center justify-around border-t border-zinc-700 bg-zinc-800 px-4 py-2">
          <div className="text-zinc-500">←</div>
          <div className="text-zinc-500">→</div>
          {/* Share button — highlighted */}
          <div className="relative">
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 animate-pulse items-center justify-center rounded-lg bg-[#CC0000]">
                <svg viewBox="0 0 24 24" className="size-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="mt-0.5 text-[7px] font-medium text-[#CC0000]">tap here</span>
            </div>
            {/* Arrow indicator */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[#CC0000]">↓</div>
          </div>
          <div className="text-zinc-500">⊞</div>
          <div className="text-zinc-500">⋯</div>
        </div>
      </div>
    </div>
  );
}

function ShareSheetVisual() {
  return (
    <div className="relative mx-auto w-[220px]">
      <div className="overflow-hidden rounded-3xl border-4 border-zinc-700 bg-zinc-900">
        <div className="h-16 bg-zinc-950" />
        {/* Share sheet sliding up */}
        <div className="rounded-t-2xl bg-zinc-800 px-3 pt-3 pb-2">
          <div className="mb-2 h-1 w-8 rounded-full bg-zinc-600 mx-auto" />
          {/* App icons row */}
          <div className="mb-3 flex gap-2 overflow-x-hidden">
            {["💬", "📧", "📋", "✉️"].map((e, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-700 text-sm">{e}</div>
                <span className="text-[6px] text-zinc-500">Share</span>
              </div>
            ))}
          </div>
          {/* Action rows */}
          {[
            { icon: "📋", label: "Copy" },
            { icon: "🔖", label: "Add Bookmark" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 rounded-lg bg-zinc-700 px-2 py-2 mb-1">
              <span className="text-xs">{icon}</span>
              <span className="text-[9px] text-zinc-300">{label}</span>
            </div>
          ))}
          {/* Highlighted row */}
          <div className="flex items-center gap-2 rounded-lg bg-[#CC0000] px-2 py-2 mb-1">
            <span className="text-xs">➕</span>
            <span className="text-[9px] font-bold text-white">Add to Home Screen</span>
            <span className="ml-auto text-[8px] text-white/70">← tap</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NameConfirmVisual() {
  return (
    <div className="relative mx-auto w-[220px]">
      <div className="overflow-hidden rounded-3xl border-4 border-zinc-700 bg-zinc-900">
        <div className="h-8 bg-zinc-950" />
        {/* Dialog */}
        <div className="bg-zinc-800 px-4 pt-4 pb-3">
          {/* Dialog title bar */}
          <div className="mb-3 flex items-center justify-between">
            <button className="text-[9px] text-zinc-400">Cancel</button>
            <span className="text-[9px] font-semibold text-white">Add to Home Screen</span>
            {/* Add button highlighted */}
            <button className="rounded bg-[#CC0000] px-2 py-0.5 text-[9px] font-bold text-white">
              Add
            </button>
          </div>
          {/* Icon + name preview */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white">
              <div className="text-[10px] font-black text-[#CC0000]">UU</div>
            </div>
            <div className="h-4 w-24 rounded bg-zinc-700 flex items-center justify-center">
              <span className="text-[7px] text-zinc-400">UU Rugby</span>
            </div>
          </div>
          <p className="mt-1 text-center text-[7px] text-zinc-500">
            Tap <strong className="text-white">Add</strong> to save to home screen
          </p>
        </div>
        <div className="h-8 bg-zinc-950" />
      </div>
    </div>
  );
}

function InstalledVisual() {
  return (
    <div className="relative mx-auto w-[220px]">
      <div className="overflow-hidden rounded-3xl border-4 border-zinc-700 bg-zinc-900">
        {/* Home screen with app icon */}
        <div className="flex h-48 flex-wrap content-start gap-3 bg-zinc-950 p-4">
          {/* Other apps */}
          {[..."📱📷🎵📺"].map((e, i) => (
            <div key={i} className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-lg">{e}</div>
          ))}
          {/* Our app — highlighted */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white ring-2 ring-[#CC0000] ring-offset-1 ring-offset-zinc-950">
              <div className="text-xs font-black text-[#CC0000]">UU</div>
              {/* Sparkle */}
              <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#CC0000] text-[7px] font-bold text-white">✓</div>
            </div>
            <span className="text-[7px] font-medium text-white">UU Rugby</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS: Step[] = [
  {
    title: "Open in Safari",
    instruction: "Make sure you're using Safari — this won't work in Chrome or other browsers on iPhone. The address bar should show utah-rugby-alumni.vercel.app.",
    visual: <ShareButtonVisual />,
  },
  {
    title: 'Tap the Share button',
    instruction: 'Tap the Share icon at the bottom center of your screen — it looks like a box with an arrow pointing up. It\'s highlighted in red below.',
    visual: <ShareButtonVisual />,
  },
  {
    title: '"Add to Home Screen"',
    instruction: 'Scroll down in the menu that pops up until you see "Add to Home Screen" and tap it.',
    visual: <ShareSheetVisual />,
  },
  {
    title: 'Tap "Add"',
    instruction: 'You\'ll see a preview showing the Utah Rugby icon. Tap "Add" in the top right corner.',
    visual: <NameConfirmVisual />,
  },
  {
    title: "You're installed!",
    instruction: "The Utah Rugby Alumni app is now on your home screen. Tap it any time to open it — no browser, no URL, just the app.",
    visual: <InstalledVisual />,
  },
];

interface InstallGuideProps {
  onClose: () => void;
}

export function InstallGuide({ onClose }: InstallGuideProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-sm rounded-t-3xl bg-zinc-900 border border-zinc-800 p-6 md:rounded-3xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-zinc-500 hover:text-white"
        >
          <X className="size-5" />
        </button>

        {/* Progress dots */}
        <div className="mb-5 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-[#CC0000]" : "w-1.5 bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* Step label */}
        <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="mb-4 text-center text-lg font-black text-white">
          {current.title}
        </h2>

        {/* Visual */}
        <div className="mb-5">{current.visual}</div>

        {/* Instruction */}
        <p className="mb-6 text-center text-sm leading-relaxed text-zinc-400">
          {current.instruction}
        </p>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="size-4" />
              Back
            </button>
          )}
          <button
            onClick={isLast ? onClose : () => setStep(s => s + 1)}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#CC0000] py-2.5 text-sm font-bold text-white hover:bg-[#AA0000]"
          >
            {isLast ? "Done" : "Next"}
            {!isLast && <ChevronRight className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

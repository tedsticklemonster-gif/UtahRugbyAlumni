"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronRight, Check, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { updateProfileAction } from "@/actions/profile";

const display =
  "font-[family-name:var(--font-barlow-condensed)] font-black uppercase italic tracking-tight";

interface OnboardingWizardProps {
  alumniId: string;
  firstName: string;
  currentStep?: number;
  onDismiss: () => void;
}

const STEPS = [
  { title: "Add a Photo", desc: "Help your teammates recognize you." },
  { title: "Your Profession", desc: "Let the network know what you do." },
  { title: "Your Location", desc: "Find alumni in your area." },
  { title: "Career Signal", desc: "Are you hiring or looking?" },
];

export function OnboardingWizard({ alumniId, firstName, onDismiss }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, startSubmit] = useTransition();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [profession, setProfession] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [availability, setAvailability] = useState("not_specified");
  const [hiring, setHiring] = useState(false);
  const [willingToMentor, setWillingToMentor] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 800,
        maxSizeMB: 0.5,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      setPhotoFile(compressed);
      setPhotoPreview(URL.createObjectURL(compressed));
    } catch {
      // ignore
    }
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  }

  function finish() {
    const data: Record<string, unknown> = {};
    if (profession) data.profession = profession;
    if (jobTitle) data.job_title = jobTitle;
    if (company) data.company = company;
    if (city) data.city = city;
    if (state) data.state = state;
    if (availability !== "not_specified") data.availability = availability;
    if (hiring) data.hiring = true;
    if (willingToMentor) data.willing_to_mentor = true;

    const fd = new FormData();
    fd.set("data", JSON.stringify(data));
    if (photoFile) fd.set("photo", photoFile);

    startSubmit(async () => {
      await updateProfileAction({ success: false }, fd);
      router.refresh();
      onDismiss();
    });
  }

  const inputCls = "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none";

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-[#CC0000]/30 bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">
            Welcome, {firstName}
          </p>
          <h3 className={`${display} text-xl text-white`}>Complete Your Profile</h3>
        </div>
        <button onClick={onDismiss} className="p-1 text-zinc-600 hover:text-white transition-colors" aria-label="Dismiss">
          <X className="size-5" />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 px-4 pb-3">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-[#CC0000]" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="px-4 pb-4">
        <p className="text-sm font-bold text-white mb-1">{STEPS[step].title}</p>
        <p className="text-xs text-zinc-500 mb-4">{STEPS[step].desc}</p>

        {step === 0 && (
          <div className="flex flex-col items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            {photoPreview ? (
              <img src={photoPreview} alt="" className="size-24 rounded-full object-cover border-2 border-[#CC0000]" />
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex size-24 items-center justify-center rounded-full border-2 border-dashed border-zinc-700 text-zinc-500 hover:border-[#CC0000] hover:text-[#CC0000] transition-colors"
              >
                <Camera className="size-8" />
              </button>
            )}
            {photoPreview && (
              <button onClick={() => fileRef.current?.click()} className="text-xs text-zinc-400 hover:text-white">Change photo</button>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Profession (e.g. Software Engineer)" className={inputCls} />
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job title" className={inputCls} />
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className={inputCls} />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-3">
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputCls} />
            <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className={inputCls} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <select value={availability} onChange={(e) => setAvailability(e.target.value)} className={inputCls}>
              <option value="not_specified">Select status...</option>
              <option value="employed">Happily employed</option>
              <option value="open_to_work">Open to work</option>
              <option value="looking_for_work">Actively looking</option>
              <option value="self_employed">Self-employed</option>
              <option value="retired">Retired</option>
              <option value="student">Student</option>
            </select>
            <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/50 px-3 py-3 cursor-pointer">
              <input type="checkbox" checked={hiring} onChange={(e) => setHiring(e.target.checked)} className="accent-[#CC0000]" />
              <span className="text-sm text-white">I&apos;m hiring</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/50 px-3 py-3 cursor-pointer">
              <input type="checkbox" checked={willingToMentor} onChange={(e) => setWillingToMentor(e.target.checked)} className="accent-[#CC0000]" />
              <span className="text-sm text-white">Open to mentoring</span>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between">
          <button onClick={onDismiss} className="text-xs text-zinc-600 hover:text-white transition-colors">
            Skip for now
          </button>
          <button
            onClick={next}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#CC0000] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#AA0000] disabled:opacity-50"
          >
            {submitting ? "Saving..." : step < STEPS.length - 1 ? (
              <>Next <ChevronRight className="size-4" /></>
            ) : (
              <>Finish <Check className="size-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

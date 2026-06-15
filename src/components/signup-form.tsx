"use client";

import { useActionState, useState, startTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signupSchema,
  type SignupInput,
  AVAILABILITY_VALUES,
  AVAILABILITY_LABELS,
} from "@/lib/validators";
import { signupAction, type SignupState } from "@/actions/signup";
import { PhotoUpload } from "@/components/photo-upload";
import { TagInput } from "@/components/tag-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export function SignupForm() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? undefined;

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      directory_visible: true,
      sms_consent: false,
      referred_by_token: ref,
      availability: "not_specified",
      hiring: false,
      willing_to_mentor: false,
      services: [],
      industries: [],
    },
  });

  // useWatch is compiler-safe (watch() from useForm() is not — it returns a
  // non-memoizable function).
  const phone = useWatch({ control, name: "phone" });
  const bio = useWatch({ control, name: "bio" });
  const smsConsent = useWatch({ control, name: "sms_consent" });
  const directoryVisible = useWatch({ control, name: "directory_visible" });
  const hiring = useWatch({ control, name: "hiring" }) ?? false;
  const willingToMentor = useWatch({ control, name: "willing_to_mentor" }) ?? false;
  const services = useWatch({ control, name: "services" }) ?? [];
  const industries = useWatch({ control, name: "industries" }) ?? [];

  const [state, formAction, isPending] = useActionState<SignupState, FormData>(
    signupAction,
    { success: false }
  );

  function onSubmit(data: SignupInput) {
    const fd = new FormData();
    fd.set("data", JSON.stringify(data));
    if (photoFile) {
      fd.set("photo", photoFile);
    }
    startTransition(() => formAction(fd));
  }

  if (state.success) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-900/50">
          <svg className="size-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">You&apos;re in!</h2>
        <p className="mt-2 text-sm text-zinc-400 max-w-xs mx-auto">
          Check your email to verify your account. Once confirmed, you&apos;ll have full access to the network.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <PhotoUpload onFileReady={setPhotoFile} />

      {/* Required fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name *</Label>
          <Input id="first_name" {...register("first_name")} />
          {errors.first_name && (
            <p className="text-sm text-destructive">
              {errors.first_name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name *</Label>
          <Input id="last_name" {...register("last_name")} />
          {errors.last_name && (
            <p className="text-sm text-destructive">
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Optional fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="grad_year">Graduation year</Label>
          <Input
            id="grad_year"
            type="number"
            min={1960}
            max={new Date().getFullYear() + 1}
            {...register("grad_year", { valueAsNumber: true })}
          />
          {errors.grad_year && (
            <p className="text-sm text-destructive">
              {errors.grad_year.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">Position played</Label>
          <Input
            id="position"
            placeholder="e.g. flanker, lock, prop"
            {...register("position")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          {...register("phone")}
        />
      </div>

      {/* SMS CONSENT: TCPA-required checkbox. Only shown when phone is entered.
          Must be unchecked by default. Never pre-check this. */}
      {phone && phone.length > 0 && (
        <div className="flex items-start gap-3 rounded-md border p-4 bg-muted/50">
          <Checkbox
            id="sms_consent"
            checked={smsConsent}
            onCheckedChange={(checked) =>
              setValue("sms_consent", checked === true)
            }
          />
          <Label htmlFor="sms_consent" className="text-sm leading-relaxed font-normal">
            I agree to receive text messages from Utah Rugby Alumni Network
            about game day reminders, alumni events, and program updates at the
            number provided. Message frequency varies. Message and data rates
            may apply. Reply STOP to unsubscribe, HELP for help. Consent is not
            a condition of registering.
          </Label>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="profession">Profession</Label>
          <Input id="profession" {...register("profession")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_title">Job title</Label>
          <Input id="job_title" {...register("job_title")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...register("company")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
        <Input
          id="linkedin_url"
          type="url"
          placeholder="https://linkedin.com/in/yourname"
          {...register("linkedin_url")}
        />
        {errors.linkedin_url && (
          <p className="text-sm text-destructive">
            {errors.linkedin_url.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="A few words about yourself..."
          maxLength={500}
          {...register("bio")}
        />
        <p className="text-xs text-muted-foreground text-right">
          {bio?.length ?? 0}/500
        </p>
      </div>

      {/* Professional availability — powers directory hiring rails */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
        <div>
          <p className="text-sm font-bold text-white">Career signal</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            Helps other alumni find you for work, hires, or mentorship.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability">I&apos;m currently…</Label>
          <select
            id="availability"
            {...register("availability")}
            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
          >
            {AVAILABILITY_VALUES.map((v) => (
              <option key={v} value={v}>
                {AVAILABILITY_LABELS[v]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="years_experience">Years of experience</Label>
          <Input
            id="years_experience"
            type="number"
            min={0}
            max={80}
            placeholder="e.g. 8"
            {...register("years_experience", { valueAsNumber: true })}
          />
        </div>

        <TagInput
          label="Services you offer"
          placeholder="e.g. plumbing, legal, coaching"
          value={services as string[]}
          onChange={(v) => setValue("services", v)}
        />
        <TagInput
          label="Industries you work in"
          placeholder="e.g. construction, tech, healthcare"
          value={industries as string[]}
          onChange={(v) => setValue("industries", v)}
        />

        <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <Checkbox
            id="hiring"
            checked={hiring}
            onCheckedChange={(checked) => setValue("hiring", checked === true)}
          />
          <Label htmlFor="hiring" className="text-sm font-normal leading-snug">
            <span className="font-semibold text-white">I&apos;m hiring</span>
            <span className="block text-xs text-zinc-400">
              Show a &ldquo;Hiring&rdquo; badge so alumni know you have open roles.
            </span>
          </Label>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <Checkbox
            id="willing_to_mentor"
            checked={willingToMentor}
            onCheckedChange={(checked) =>
              setValue("willing_to_mentor", checked === true)
            }
          />
          <Label
            htmlFor="willing_to_mentor"
            className="text-sm font-normal leading-snug"
          >
            <span className="font-semibold text-white">Open to mentoring</span>
            <span className="block text-xs text-zinc-400">
              Younger alumni can reach out for career advice.
            </span>
          </Label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website_url">Website</Label>
            <Input
              id="website_url"
              type="url"
              placeholder="https://yourcompany.com"
              {...register("website_url")}
            />
            {errors.website_url && (
              <p className="text-sm text-destructive">
                {errors.website_url.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram_handle">Instagram handle</Label>
            <Input
              id="instagram_handle"
              placeholder="yourhandle"
              {...register("instagram_handle")}
            />
            {errors.instagram_handle && (
              <p className="text-sm text-destructive">
                {errors.instagram_handle.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          id="directory_visible"
          checked={directoryVisible}
          onCheckedChange={(checked) =>
            setValue("directory_visible", checked === true)
          }
        />
        <Label htmlFor="directory_visible" className="font-normal">
          Show my profile in the alumni directory
        </Label>
      </div>

      {/* Hidden field for referral token */}
      <input type="hidden" {...register("referred_by_token")} />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Submitting..." : "Join the Network"}
      </Button>
    </form>
  );
}

"use client";

import { useActionState, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
  AVAILABILITY_VALUES,
  AVAILABILITY_LABELS,
} from "@/lib/validators";
import {
  updateProfileAction,
  deleteAccountAction,
  type ProfileState,
} from "@/actions/profile";
import { PhotoUpload } from "@/components/photo-upload";
import { TagInput } from "@/components/tag-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface Alumni {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  grad_year: number | null;
  position: string | null;
  phone: string | null;
  profession: string | null;
  job_title: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  linkedin_url: string | null;
  photo_url: string | null;
  photo_signed_url: string | null;
  bio: string | null;
  sms_consent: boolean;
  directory_visible: boolean;
  availability?: string | null;
  hiring?: boolean | null;
  services?: string[] | null;
  industries?: string[] | null;
  years_experience?: number | null;
  willing_to_mentor?: boolean | null;
  website_url?: string | null;
  instagram_handle?: string | null;
}

export function ProfileForm({ alumni }: { alumni: Alumni }) {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      first_name: alumni.first_name,
      last_name: alumni.last_name,
      grad_year: alumni.grad_year,
      position: alumni.position ?? undefined,
      phone: alumni.phone ?? undefined,
      profession: alumni.profession ?? undefined,
      job_title: alumni.job_title ?? undefined,
      company: alumni.company ?? undefined,
      city: alumni.city ?? undefined,
      state: alumni.state ?? undefined,
      linkedin_url: alumni.linkedin_url ?? undefined,
      bio: alumni.bio ?? undefined,
      sms_consent: alumni.sms_consent,
      directory_visible: alumni.directory_visible,
      availability:
        (alumni.availability as (typeof AVAILABILITY_VALUES)[number] | undefined) ??
        "not_specified",
      hiring: alumni.hiring ?? false,
      willing_to_mentor: alumni.willing_to_mentor ?? false,
      services: alumni.services ?? [],
      industries: alumni.industries ?? [],
      years_experience: alumni.years_experience ?? null,
      website_url: alumni.website_url ?? undefined,
      instagram_handle: alumni.instagram_handle ?? undefined,
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

  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    { success: false }
  );

  function onSubmit(data: ProfileUpdateInput) {
    const fd = new FormData();
    fd.set("data", JSON.stringify(data));
    if (photoFile) {
      fd.set("photo", photoFile);
    }
    startTransition(() => formAction(fd));
  }

  async function handleDelete() {
    const result = await deleteAccountAction();
    if (result.success) {
      router.push("/");
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {state.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="rounded-md bg-emerald-950 border border-emerald-800 p-3 text-sm text-emerald-300">
            Profile updated!
          </div>
        )}

        <PhotoUpload
          currentPhotoUrl={alumni.photo_signed_url}
          onFileReady={setPhotoFile}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" {...register("first_name")} />
            {errors.first_name && (
              <p className="text-sm text-destructive">
                {errors.first_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" {...register("last_name")} />
            {errors.last_name && (
              <p className="text-sm text-destructive">
                {errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={alumni.email} disabled />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed.
          </p>
        </div>

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
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position played</Label>
            <Input id="position" {...register("position")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" inputMode="tel" {...register("phone")} />
        </div>

        {/* SMS CONSENT: TCPA-required checkbox. Only shown when phone is entered. */}
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
              about game day reminders, alumni events, and program updates at
              the number provided. Message frequency varies. Message and data
              rates may apply. Reply STOP to unsubscribe, HELP for help.
              Consent is not a condition of registering.
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
          <Input id="linkedin_url" type="url" {...register("linkedin_url")} />
          {errors.linkedin_url && (
            <p className="text-sm text-destructive">
              {errors.linkedin_url.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" maxLength={500} {...register("bio")} />
          <p className="text-xs text-muted-foreground text-right">
            {bio?.length ?? 0}/500
          </p>
        </div>

        {/* Professional availability */}
        <div className="rounded-xl border border-border bg-surface-0/60 p-4 space-y-4">
          <div>
            <p className="text-sm font-bold text-white">Career signal</p>
            <p className="mt-0.5 text-xs text-zinc-400">
              Powers the &ldquo;Open to work&rdquo; and &ldquo;Hiring&rdquo; rails.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">I&apos;m currently…</Label>
            <select
              id="availability"
              {...register("availability")}
              className="flex h-10 w-full rounded-md border border-border-strong bg-surface-1 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-utah-red"
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
              {...register("years_experience", { valueAsNumber: true })}
            />
          </div>

          <TagInput
            label="Services you offer"
            placeholder="e.g. plumbing, legal, coaching"
            value={services as string[]}
            onChange={(v) => setValue("services", v, { shouldDirty: true })}
          />
          <TagInput
            label="Industries you work in"
            placeholder="e.g. construction, tech, healthcare"
            value={industries as string[]}
            onChange={(v) => setValue("industries", v, { shouldDirty: true })}
          />

          <div className="flex items-start gap-3 rounded-lg border border-border bg-black/40 p-3">
            <Checkbox
              id="hiring"
              checked={hiring}
              onCheckedChange={(checked) =>
                setValue("hiring", checked === true, { shouldDirty: true })
              }
            />
            <Label htmlFor="hiring" className="text-sm font-normal leading-snug">
              <span className="font-semibold text-white">I&apos;m hiring</span>
              <span className="block text-xs text-zinc-400">
                Show a &ldquo;Hiring&rdquo; badge on your profile.
              </span>
            </Label>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border bg-black/40 p-3">
            <Checkbox
              id="willing_to_mentor"
              checked={willingToMentor}
              onCheckedChange={(checked) =>
                setValue("willing_to_mentor", checked === true, {
                  shouldDirty: true,
                })
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

        <Button type="submit" className="w-full" disabled={isPending || (!isDirty && !photoFile)}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
        {!showDeleteConfirm ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete My Account
          </Button>
        ) : (
          <div className="rounded-md border border-destructive p-4 space-y-3">
            <p className="text-sm">
              This will permanently remove your profile and all associated data.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Yes, Delete My Account
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

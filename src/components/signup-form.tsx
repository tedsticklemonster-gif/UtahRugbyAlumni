"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validators";
import { signupAction, type SignupState } from "@/actions/signup";
import { PhotoUpload } from "@/components/photo-upload";
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      directory_visible: true,
      sms_consent: false,
      referred_by_token: ref,
    },
  });

  const phone = watch("phone");
  const bio = watch("bio");
  const smsConsent = watch("sms_consent");
  const directoryVisible = watch("directory_visible");

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
    formAction(fd);
  }

  if (state.success) {
    // Redirect handled by the page, but show fallback
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold">You&apos;re in!</h2>
        <p className="mt-2 text-muted-foreground">
          Check your email to verify your account.
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

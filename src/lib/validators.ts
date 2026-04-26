import { z } from "zod";

export const AVAILABILITY_VALUES = [
  "not_specified",
  "employed",
  "self_employed",
  "open_to_work",
  "looking_for_work",
  "student",
  "retired",
] as const;
export type AvailabilityValue = (typeof AVAILABILITY_VALUES)[number];

export const AVAILABILITY_LABELS: Record<AvailabilityValue, string> = {
  not_specified: "Prefer not to say",
  employed: "Employed",
  self_employed: "Self-employed / own a business",
  open_to_work: "Open to new opportunities",
  looking_for_work: "Actively looking for work",
  student: "Student",
  retired: "Retired",
};

export const signupSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  grad_year: z
    .number()
    .int()
    .min(1960)
    .max(new Date().getFullYear() + 1)
    .nullable()
    .optional(),
  position: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  profession: z.string().max(200).optional(),
  job_title: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  linkedin_url: z
    .string()
    .url("Invalid URL")
    .refine(
      (url) => url.includes("linkedin.com"),
      "Must be a LinkedIn URL"
    )
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "Bio must be 500 characters or fewer").optional(),
  // SMS CONSENT: Legally critical (TCPA).
  // This field must never default to true.
  sms_consent: z.boolean(),
  directory_visible: z.boolean(),
  referred_by_token: z.string().optional(),
  // Professional-availability signals (migration 012)
  availability: z.enum(AVAILABILITY_VALUES).optional(),
  hiring: z.boolean().optional(),
  services: z.array(z.string().max(60)).max(10).optional(),
  industries: z.array(z.string().max(60)).max(10).optional(),
  years_experience: z.number().int().min(0).max(80).nullable().optional(),
  willing_to_mentor: z.boolean().optional(),
  website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagram_handle: z
    .string()
    .max(40)
    .regex(/^[A-Za-z0-9._]*$/, "Only letters, numbers, . and _")
    .optional()
    .or(z.literal("")),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const profileUpdateSchema = signupSchema
  .omit({ email: true, referred_by_token: true })
  .partial();

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

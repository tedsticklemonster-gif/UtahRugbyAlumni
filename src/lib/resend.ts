import { Resend } from "resend";

// SERVER-ONLY: Never import this file from client components.
// Lazy-init so builds succeed even when RESEND_API_KEY is not yet set.
let _resend: Resend | null = null;
export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
  }
  return _resend;
}

// Sender identity. Until EMAIL_FROM points at a Resend-verified custom domain,
// this falls back to Resend's shared test sender — which only reliably
// delivers to the Resend account's own email. Set EMAIL_FROM in Vercel once
// the domain is verified.
export const FROM_EMAIL = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
export const FROM_NAME = process.env.EMAIL_FROM_NAME ?? "Moose (Utah Rugby Alumni)";

/** True once a real sending domain is configured — jobs that would email the
 * whole membership should no-op until then. */
export function hasVerifiedSender(): boolean {
  return Boolean(process.env.EMAIL_FROM) && !FROM_EMAIL.endsWith("@resend.dev");
}

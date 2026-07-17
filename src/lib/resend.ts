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

/** @deprecated Use getResend() — kept for existing imports */
export const resend = new Proxy({} as Resend, {
  get(_, prop) {
    return (getResend() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Resend's shared test sender — works without a verified domain, but only
// reliably delivers to the Resend account's own email. Swap this for an
// address on a verified custom domain before emailing all alumni.
export const FROM_EMAIL = "onboarding@resend.dev";
export const FROM_NAME = "Moose (Utah Rugby Alumni)";

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

export const FROM_EMAIL = "moose@alumni.utah-rugby.com";
export const FROM_NAME = "Moose (Utah Rugby Alumni)";

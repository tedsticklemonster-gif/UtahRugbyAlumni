import { Resend } from "resend";

// SERVER-ONLY: Never import this file from client components.
export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = "moose@alumni.utah-rugby.com";
export const FROM_NAME = "Moose (Utah Rugby Alumni)";

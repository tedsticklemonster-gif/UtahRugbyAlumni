import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.text();

  // Verify webhook signature
  const signature = request.headers.get("svix-signature");
  const timestamp = request.headers.get("svix-timestamp");
  const svixId = request.headers.get("svix-id");

  if (!signature || !timestamp || !svixId) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret) {
    // Resend uses Svix for webhooks. Verify the signature.
    const toSign = `${svixId}.${timestamp}.${body}`;
    // The secret from Resend starts with "whsec_", strip the prefix and decode
    const secretBytes = Buffer.from(secret.replace("whsec_", ""), "base64");
    const expectedSignature = crypto
      .createHmac("sha256", secretBytes)
      .update(toSign)
      .digest("base64");

    // Signature header format: "v1,<base64>"
    const signatures = signature.split(" ").map((s) => s.replace("v1,", ""));
    const isValid = signatures.some((sig) => sig === expectedSignature);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const event = JSON.parse(body);
  const supabase = createAdminClient();

  // Handle different event types
  if (event.type === "email.opened") {
    const messageId = event.data?.email_id;
    if (messageId) {
      await supabase
        .from("email_sends")
        .update({ opened_at: new Date().toISOString() })
        .eq("resend_id", messageId)
        .is("opened_at", null); // Only set first open
    }
  }

  if (event.type === "email.clicked") {
    const messageId = event.data?.email_id;
    if (messageId) {
      await supabase
        .from("email_sends")
        .update({ clicked_at: new Date().toISOString() })
        .eq("resend_id", messageId)
        .is("clicked_at", null); // Only set first click
    }
  }

  return NextResponse.json({ received: true });
}

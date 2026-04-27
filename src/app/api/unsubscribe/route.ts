import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(page("Invalid link", "This unsubscribe link is missing or malformed."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const alumniId = verifyUnsubscribeToken(token);

  if (!alumniId) {
    return new NextResponse(page("Invalid link", "This unsubscribe link is invalid or has been tampered with."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("alumni")
    .update({ status: "opted_out" })
    .eq("id", alumniId);

  if (error) {
    return new NextResponse(page("Something went wrong", "We couldn't process your request. Please try again later."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }

  return new NextResponse(
    page(
      "You've been unsubscribed",
      "You won't receive any more emails from the Utah Rugby Alumni Network. If this was a mistake, reply to any previous email from us and we'll re-add you."
    ),
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}

function page(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Utah Rugby Alumni</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0a0a; color: #e4e4e7; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { max-width: 420px; text-align: center; padding: 40px 24px; }
    h1 { font-size: 20px; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.6; color: #a1a1aa; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}

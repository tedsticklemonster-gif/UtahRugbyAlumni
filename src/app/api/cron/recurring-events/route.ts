import { NextResponse } from "next/server";
import { runJob } from "@/jobs/index";
import { generateRecurringEvents } from "@/jobs/generate-recurring-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await runJob(generateRecurringEvents);
  return NextResponse.json(result);
}

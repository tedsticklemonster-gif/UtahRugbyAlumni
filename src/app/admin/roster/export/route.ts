import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Wrap in quotes if it contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("q") ?? "";
  const includeNotes = searchParams.get("notes") === "1";

  const admin = createAdminClient();

  let query = admin
    .from("alumni")
    .select(
      "id, first_name, last_name, grad_year, email, phone, status, verified, " +
        "directory_visible, sms_consent, profession, job_title, company, city, state, " +
        "linkedin_url, source, last_contacted_at, created_at" +
        (includeNotes ? ", notes" : "")
    )
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (status) query = query.eq("status", status);

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data: rows, error } = await query;

  if (error) {
    return new NextResponse("Export failed: " + error.message, { status: 500 });
  }

  const columns = [
    "first_name",
    "last_name",
    "grad_year",
    "email",
    "phone",
    "status",
    "verified",
    "directory_visible",
    "sms_consent",
    "profession",
    "job_title",
    "company",
    "city",
    "state",
    "linkedin_url",
    "source",
    "last_contacted_at",
    "created_at",
    ...(includeNotes ? ["notes"] : []),
  ];

  const header = columns.join(",");
  const csvRows = (rows ?? []).map((row) =>
    columns
      .map((col) => escapeCsv((row as unknown as Record<string, unknown>)[col] as string))
      .join(",")
  );

  const csv = [header, ...csvRows].join("\n");
  const filename = `roster-${new Date().toISOString().slice(0, 10)}.csv`;

  // Log via audit (best-effort, non-blocking)
  admin.from("admin_audit_log").insert({
    actor_id: user.id,
    actor_email: user.email,
    action: "roster.export",
    target_table: "alumni",
    payload: {
      rows: rows?.length ?? 0,
      status_filter: status || "all",
      include_notes: includeNotes,
    },
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

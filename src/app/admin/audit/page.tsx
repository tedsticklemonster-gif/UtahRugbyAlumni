export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";

const ACTION_LABELS: Record<string, string> = {
  "alumni.status_change": "Status change",
  "alumni.delete": "Deleted alumni",
  "alumni.import": "CSV import",
  "email.send": "Email send",
  "forward_token.create": "Created token",
  "admin_role.grant": "Granted admin",
  "admin_role.revoke": "Revoked admin",
  "announcement.create": "Created announcement",
  "announcement.update": "Updated announcement",
  "announcement.delete": "Deleted announcement",
  "post.delete": "Deleted post",
  "post.restore": "Restored post",
  "event.cancel": "Cancelled event",
  "event.update": "Updated event",
  "roster.export": "Exported roster",
  "pledge.create": "Created pledge",
  "pledge.update": "Updated pledge",
  "campaign.create": "Created campaign",
  "campaign.update": "Updated campaign",
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = 50;
  const offset = (page - 1) * pageSize;
  const actionFilter = params.action ?? "";

  const admin = createAdminClient();

  let query = admin
    .from("admin_audit_log")
    .select("id, actor_email, action, target_table, target_id, payload, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (actionFilter) {
    query = query.eq("action", actionFilter);
  }

  const { data: rows, count } = await query;
  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // Distinct action types for filter dropdown
  const { data: actionTypes } = await admin
    .from("admin_audit_log")
    .select("action")
    .order("action");
  const uniqueActions = Array.from(
    new Set((actionTypes ?? []).map((r) => r.action))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-stat text-lg">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} total entries
          </p>
        </div>
        <form method="GET" className="flex items-center gap-2">
          <select
            name="action"
            defaultValue={actionFilter}
            className="rounded-lg border px-3 py-1.5 text-sm bg-background"
          >
            <option value="">All actions</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {ACTION_LABELS[a] ?? a}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                When
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Who
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Action
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Detail
              </th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No audit entries yet.
                </td>
              </tr>
            ) : (
              (rows ?? []).map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-xs">{row.actor_email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {ACTION_LABELS[row.action] ?? row.action}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground max-w-xs truncate">
                    {row.payload
                      ? Object.entries(row.payload as Record<string, unknown>)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")
                      : row.target_id ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`?page=${page - 1}${actionFilter ? `&action=${actionFilter}` : ""}`}
                className="rounded-lg border px-3 py-1.5 hover:bg-muted"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`?page=${page + 1}${actionFilter ? `&action=${actionFilter}` : ""}`}
                className="rounded-lg border px-3 py-1.5 hover:bg-muted"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

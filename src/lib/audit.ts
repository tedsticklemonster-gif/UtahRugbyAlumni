import { createAdminClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "alumni.status_change"
  | "alumni.delete"
  | "alumni.import"
  | "email.send"
  | "forward_token.create"
  | "admin_role.grant"
  | "admin_role.revoke"
  | "announcement.create"
  | "announcement.update"
  | "announcement.delete"
  | "post.delete"
  | "post.restore"
  | "event.cancel"
  | "event.update"
  | "roster.export"
  | "pledge.create"
  | "pledge.update"
  | "campaign.create"
  | "campaign.update";

export interface AuditParams {
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  targetTable?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
}

/**
 * Append a row to admin_audit_log via the service-role client.
 * Fire-and-forget — never throws or blocks the calling action.
 */
export async function logAdminAction(params: AuditParams): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("admin_audit_log").insert({
      actor_id: params.actorId,
      actor_email: params.actorEmail,
      action: params.action,
      target_table: params.targetTable ?? null,
      target_id: params.targetId ?? null,
      payload: params.payload ?? null,
    });
  } catch (err) {
    // Audit logging must never crash the calling action
    console.error("[audit] Failed to log admin action:", err);
  }
}

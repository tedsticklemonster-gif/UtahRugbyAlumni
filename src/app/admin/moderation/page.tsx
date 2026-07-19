export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listReportsAction } from "@/actions/moderation";
import { ModerationActions } from "@/components/admin/moderation-actions";

export const metadata = { title: "Moderation — Admin" };

export default async function ModerationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const reports = await listReportsAction();

  const pending = reports.filter((r) => r.status === "pending");
  const resolved = reports.filter((r) => r.status !== "pending");

  return (
    <div className="min-h-screen bg-surface-0">
      <div className="border-b border-white/6 px-5 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <Shield className="size-5 text-utah-red" />
          <h1 className="text-title-1 text-white">Moderation</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-500">Review reported content and user issues</p>
      </div>

      <div className="px-5 py-6 md:px-10 space-y-6 max-w-2xl">
        {/* Pending */}
        <section>
          <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-widest text-warning mb-3">
            <AlertTriangle className="size-3" /> Pending Review ({pending.length})
          </p>
          {pending.length === 0 ? (
            <div className="surface-card p-6 text-center">
              <CheckCircle className="mx-auto size-8 text-success mb-2" />
              <p className="text-sm font-bold text-white">All clear</p>
              <p className="text-xs text-zinc-500">No pending reports.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((r) => (
                <div key={r.id} className="rounded-xl border border-warning/30 bg-surface-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white capitalize">{r.reason}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {r.target_type} · Reported by {r.reporter_name} · {new Date(r.created_at).toLocaleDateString()}
                      </p>
                      {r.details && <p className="mt-2 text-xs text-zinc-400">{r.details}</p>}
                    </div>
                    <ModerationActions reportId={r.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Resolved */}
        {resolved.length > 0 && (
          <section>
            <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
              <XCircle className="size-3" /> Resolved ({resolved.length})
            </p>
            <div className="space-y-2">
              {resolved.map((r) => (
                <div key={r.id} className="surface-card p-4 opacity-60">
                  <p className="text-sm text-zinc-400 capitalize">{r.reason}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {r.target_type} · {r.status} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

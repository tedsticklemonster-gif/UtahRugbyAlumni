"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createForwardTokenAction,
  type ForwardToken,
} from "@/actions/admin";

interface Alumni {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export function TokensManager({
  tokens,
  alumni,
}: {
  tokens: ForwardToken[];
  alumni: Alumni[];
}) {
  const [selectedAlumniId, setSelectedAlumniId] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";

  async function handleCreate() {
    if (!selectedAlumniId) return;
    setCreating(true);
    setError(null);
    const result = await createForwardTokenAction(selectedAlumniId);
    setCreating(false);
    if (!result.success) {
      setError(result.error ?? "Failed to create token.");
    } else {
      setSelectedAlumniId("");
    }
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${appUrl}/forward/${token}`);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  // Alumni who already have tokens
  const alumniWithTokens = new Set(
    tokens.map((t) => t.referrer_alumni_id).filter(Boolean)
  );

  return (
    <div className="space-y-6">
      {/* Create new token */}
      <div className="flex items-end gap-3">
        <div className="flex-1 max-w-sm">
          <label className="text-sm font-medium mb-1 block">
            Create token for alumni
          </label>
          <select
            value={selectedAlumniId}
            onChange={(e) => setSelectedAlumniId(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Select alumni...</option>
            {alumni
              .filter((a) => !alumniWithTokens.has(a.id))
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.first_name} {a.last_name} ({a.email})
                </option>
              ))}
          </select>
        </div>
        <Button
          onClick={handleCreate}
          disabled={!selectedAlumniId || creating}
        >
          {creating ? "Creating..." : "Create Token"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Existing tokens */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referrer</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Signups</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  {t.referrer_name ?? "Generic"}
                </TableCell>
                <TableCell className="text-xs font-mono">{t.token}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{t.signups_attributed}</Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {new Date(t.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(t.token)}
                  >
                    {copied === t.token ? "Copied!" : "Copy Link"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tokens.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No forward tokens yet. Create one above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        {tokens.length} token{tokens.length !== 1 ? "s" : ""} &middot;{" "}
        {tokens.reduce((sum, t) => sum + t.signups_attributed, 0)} total
        signups attributed
      </p>
    </div>
  );
}

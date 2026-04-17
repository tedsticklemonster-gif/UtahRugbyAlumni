"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toggleAdminAction, type AuthUser } from "@/actions/access";

export function AccessTable({ users }: { users: AuthUser[] }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(userId: string, grant: boolean) {
    setLoading(userId);
    setError(null);
    const result = await toggleAdminAction(userId, grant);
    setLoading(null);
    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
    }
  }

  // Sort: admins first, then by email
  const sorted = [...users].sort((a, b) => {
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (a.role !== "admin" && b.role === "admin") return 1;
    return a.email.localeCompare(b.email);
  });

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((u) => {
              const isAdmin = u.role === "admin";
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.alumni_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={isAdmin ? "default" : "secondary"}>
                      {isAdmin ? "Admin" : "Member"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={isAdmin ? "outline" : "default"}
                      size="sm"
                      disabled={loading === u.id}
                      onClick={() => handleToggle(u.id, !isAdmin)}
                    >
                      {loading === u.id
                        ? "..."
                        : isAdmin
                          ? "Revoke Admin"
                          : "Grant Admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No auth users found. Alumni need to verify their email to
                  appear here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        {sorted.length} verified user{sorted.length !== 1 ? "s" : ""} &middot;{" "}
        {sorted.filter((u) => u.role === "admin").length} admin
        {sorted.filter((u) => u.role === "admin").length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

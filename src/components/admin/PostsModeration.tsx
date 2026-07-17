"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { deletePostAction, restorePostAction } from "@/actions/posts-admin";

interface Post {
  id: string;
  body: string;
  photo_url: string | null;
  created_at: string;
  deleted_at: string | null;
  author: { id: string; first_name: string; last_name: string } | null;
}

interface PostsModerationProps {
  posts: Post[];
  showDeleted: boolean;
  page: number;
  totalPages: number;
}

export function PostsModeration({
  posts: initial,
  showDeleted,
  page,
  totalPages,
}: PostsModerationProps) {
  const [posts, setPosts] = useState(initial);
  const [confirming, setConfirming] = useState<{
    id: string;
    action: "delete" | "restore";
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!confirming) return;
    setLoading(true);
    const result =
      confirming.action === "delete"
        ? await deletePostAction(confirming.id)
        : await restorePostAction(confirming.id);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Action failed.");
      setConfirming(null);
      return;
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === confirming.id
          ? {
              ...p,
              deleted_at:
                confirming.action === "delete"
                  ? new Date().toISOString()
                  : null,
            }
          : p
      )
    );
    setConfirming(null);
  }

  return (
    <div className="space-y-4">
      {/* Toggle filter */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/posts"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !showDeleted
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Live
        </Link>
        <Link
          href="/admin/posts?show=deleted"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            showDeleted
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Hidden
        </Link>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {posts.length === 0 ? (
        <EmptyState
          title={showDeleted ? "No hidden posts" : "No posts yet"}
          description={
            showDeleted
              ? "No posts have been hidden by admins."
              : "Alumni haven't posted anything yet."
          }
        />
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`rounded-lg border p-4 flex items-start justify-between gap-4 ${
                post.deleted_at ? "opacity-60" : ""
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium">
                    {post.author
                      ? `${post.author.first_name} ${post.author.last_name}`
                      : "Unknown"}
                  </p>
                  <span className="text-2xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  {post.deleted_at && (
                    <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-2xs font-semibold">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.body}
                </p>
              </div>
              <div className="shrink-0">
                {post.deleted_at ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setConfirming({ id: post.id, action: "restore" })
                    }
                  >
                    Restore
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      setConfirming({ id: post.id, action: "delete" })
                    }
                  >
                    Hide
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/posts?page=${page - 1}${showDeleted ? "&show=deleted" : ""}`}
                className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/posts?page=${page + 1}${showDeleted ? "&show=deleted" : ""}`}
                className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(open) => !open && setConfirming(null)}
        title={
          confirming?.action === "delete" ? "Hide this post?" : "Restore post?"
        }
        description={
          confirming?.action === "delete"
            ? `This will hide the post from the feed. The author won't be notified. You can restore it later.`
            : `This will make the post visible again on the feed.`
        }
        confirmLabel={confirming?.action === "delete" ? "Hide" : "Restore"}
        destructive={confirming?.action === "delete"}
        loading={loading}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

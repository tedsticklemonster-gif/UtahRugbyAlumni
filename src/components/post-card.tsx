"use client";

import { MemberAvatar } from "@/components/member-avatar";
import { relativeTime } from "@/lib/time";
import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { MessageCircle, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { AttachPhoto } from "@/components/attach-photo";
import {
  addCommentAction,
  deleteCommentAction,
  editPostAction,
  deletePostAction,
  getCommentsAction,
  type FeedComment,
  type FeedPost,
  type ReactionSummary,
} from "@/actions/feed";
import { ReactionPicker } from "@/components/reaction-picker";


function SwipeableComment({
  comment: c,
  isOwn,
  onDeleted,
}: {
  comment: FeedComment;
  isOwn: boolean;
  onDeleted: (id: string) => void;
}) {
  const [offsetX, setOffsetX] = useState(0);
  const [deleting, startDelete] = useTransition();
  const startX = useRef(0);

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (!isOwn) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) setOffsetX(Math.max(dx, -80));
  }
  function handleTouchEnd() {
    if (offsetX < -60) {
      setOffsetX(-80);
    } else {
      setOffsetX(0);
    }
  }

  function handleDelete() {
    navigator.vibrate?.(20);
    startDelete(async () => {
      await deleteCommentAction(c.id);
      onDeleted(c.id);
    });
  }

  return (
    <div className="relative overflow-hidden">
      {/* Delete reveal */}
      {isOwn && (
        <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-utah-red">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm font-semibold text-white px-3"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      )}

      {/* Comment row */}
      <div
        className="flex gap-2 bg-surface-0 transition-transform"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={`/u/${c.author_id}`}
          className="shrink-0 hover:opacity-80 transition-opacity"
        >
          <MemberAvatar
            photoUrl={c.author_photo_signed_url}
            firstName={c.author_first_name}
            lastName={c.author_last_name}
            size="sm"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl rounded-tl-md bg-surface-2 px-3.5 py-2.5">
            <Link
              href={`/u/${c.author_id}`}
              className="text-sm font-semibold text-white transition-colors hover:text-utah-red"
            >
              {c.author_first_name} {c.author_last_name}
            </Link>
            <p className="text-body-sm mt-0.5 text-zinc-300 whitespace-pre-wrap">
              {c.body}
            </p>
            {c.photo_signed_url && (
              <PhotoLightbox
                src={c.photo_signed_url}
                alt="Comment photo"
                trigger={
                  <img
                    src={c.photo_signed_url}
                    alt=""
                    className="mt-2 max-h-40 rounded-md object-cover bg-surface-1"
                    loading="lazy"
                  />
                }
              />
            )}
          </div>
          <p className="text-caption mt-1 pl-3.5" suppressHydrationWarning>
            {relativeTime(c.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

interface PostCardProps {
  post: FeedPost;
  myAlumniId: string | null;
  onDeleted?: (id: string) => void;
}

export function PostCard({ post, myAlumniId }: PostCardProps) {
  const [myReaction, setMyReaction] = useState<string | null>(post.my_reaction);
  const [reactions, setReactions] = useState<ReactionSummary>(post.reactions);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(post.body);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editPending, startEdit] = useTransition();
  const isAuthor = post.author_id === myAlumniId;

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [commentBody, setCommentBody] = useState("");
  const [commentPhoto, setCommentPhoto] = useState<File | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [commentError, setCommentError] = useState<string | null>(null);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  function handleOptimisticReaction(next: string | null, nextReactions: ReactionSummary) {
    setMyReaction(next);
    setReactions(nextReactions);
  }

  async function loadComments() {
    if (commentsLoaded) return;
    setCommentsLoading(true);
    const data = await getCommentsAction(post.id);
    setComments(data);
    setCommentsLoaded(true);
    setCommentsLoading(false);
  }

  function toggleComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && !commentsLoaded) loadComments();
  }

  async function handleComment() {
    if (!commentBody.trim() && !commentPhoto) return;
    setCommentError(null);
    const fd = new FormData();
    fd.set("body", commentBody);
    if (commentPhoto) fd.set("photo", commentPhoto);
    startSubmit(async () => {
      const result = await addCommentAction(post.id, fd);
      if (result.error) {
        setCommentError(result.error);
        return;
      }
      setCommentBody("");
      setCommentPhoto(null);
      const fresh = await getCommentsAction(post.id);
      setComments(fresh);
      setCommentsLoaded(true);
    });
  }

  return (
    <div className="surface-card overflow-hidden">
      {/* Author row */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <Link
          href={`/u/${post.author_id}`}
          className="shrink-0 hover:opacity-80 transition-opacity"
        >
          <MemberAvatar
            photoUrl={post.author_photo_signed_url}
            firstName={post.author_first_name}
            lastName={post.author_last_name}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${post.author_id}`}
            className="text-display block text-[1.0625rem] leading-tight text-white transition-colors hover:text-utah-red"
          >
            {post.author_first_name} {post.author_last_name}
          </Link>
          <p className="text-caption mt-0.5" suppressHydrationWarning>
            {relativeTime(post.created_at)}
            {post.updated_at && <span className="text-zinc-600"> · edited</span>}
          </p>
        </div>
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <MoreHorizontal className="size-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 z-10 min-w-[160px] rounded-xl border border-border-subtle bg-surface-3 py-1 shadow-overlay">
                <button
                  onClick={() => { setEditing(true); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-zinc-300 hover:bg-white/6"
                >
                  <Pencil className="size-4" /> Edit post
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    startEdit(async () => {
                      await deletePostAction(post.id);
                    });
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-destructive hover:bg-white/6"
                >
                  <Trash2 className="size-4" /> Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pinned badge */}
      {post.pinned && (
        <div className="px-5 pb-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/12 px-2.5 py-1 text-xs font-semibold text-warning">
            Pinned
          </span>
        </div>
      )}

      {/* Category tag */}
      {post.category && (
        <div className="px-5 pb-1.5">
          <span className="inline-flex rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-zinc-400">
            {post.category}
          </span>
        </div>
      )}

      {/* Post body */}
      {editing ? (
        <div className="px-5 pb-3 space-y-2.5">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-input bg-surface-2 px-3.5 py-2.5 text-base text-white focus:border-ring focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                const fd = new FormData();
                fd.set("body", editBody);
                startEdit(async () => {
                  await editPostAction(post.id, fd);
                  setEditing(false);
                });
              }}
              disabled={editPending}
              className="rounded-full bg-utah-red px-4 py-2 text-sm font-semibold text-white hover:bg-utah-red/90 disabled:opacity-50"
            >
              {editPending ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => { setEditing(false); setEditBody(post.body); }}
              className="rounded-full border border-border-strong px-4 py-2 text-sm text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-body px-5 pb-4 text-zinc-100 whitespace-pre-wrap">
          {post.body}
        </p>
      )}

      {/* Post photo — full bleed inside the card */}
      {post.photo_signed_url && (
        <PhotoLightbox
          src={post.photo_signed_url}
          alt="Post photo"
          trigger={
            <img
              src={post.photo_signed_url}
              alt="Post photo"
              className="w-full max-h-[30rem] object-cover bg-surface-0"
              loading="lazy"
            />
          }
        />
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 border-t border-white/6 px-3 py-1.5">
        <ReactionPicker
          postId={post.id}
          myAlumniId={myAlumniId}
          myReaction={myReaction}
          reactions={reactions}
          onOptimistic={handleOptimisticReaction}
        />

        <button
          onClick={toggleComments}
          className="flex min-h-11 items-center gap-2 px-3 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
        >
          <MessageCircle className="size-5" />
          {post.comment_count > 0 && <span>{post.comment_count}</span>}
          <span className="hidden sm:inline">Comment</span>
        </button>
      </div>

      {/* Comments section */}
      {commentsOpen && (
        <div className="border-t border-white/6 px-5 pb-5 pt-3 space-y-3.5">
          {commentsLoading && (
            <p className="text-caption">Loading…</p>
          )}

          {comments.map((c) => (
            <SwipeableComment
              key={c.id}
              comment={c}
              isOwn={c.author_id === myAlumniId}
              onDeleted={(id) =>
                setComments((prev) => prev.filter((x) => x.id !== id))
              }
            />
          ))}

          {/* Add comment input */}
          {myAlumniId && (
            <div className="flex gap-2 pt-1">
              <div className="flex-1 rounded-2xl border border-border-subtle bg-surface-2 px-3.5 py-2.5">
                <textarea
                  ref={commentInputRef}
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Write a comment…"
                  rows={1}
                  className="w-full resize-none bg-transparent text-base text-white placeholder-zinc-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                />
                <div className="mt-2 flex items-center justify-between">
                  <AttachPhoto
                    onFileReady={setCommentPhoto}
                    onClear={() => setCommentPhoto(null)}
                  />
                  <button
                    onClick={handleComment}
                    disabled={submitting || (!commentBody.trim() && !commentPhoto)}
                    className="flex items-center gap-1.5 rounded-full bg-utah-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-utah-red/90 disabled:opacity-40"
                  >
                    <Send className="size-4" />
                    {submitting ? "…" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {commentError && (
            <p className="text-sm text-destructive">{commentError}</p>
          )}
        </div>
      )}
    </div>
  );
}

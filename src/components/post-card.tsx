"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { MessageCircle, Send } from "lucide-react";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { AttachPhoto } from "@/components/attach-photo";
import {
  addCommentAction,
  deleteCommentAction,
  getCommentsAction,
  type FeedComment,
  type FeedPost,
  type ReactionSummary,
} from "@/actions/feed";
import { ReactionPicker } from "@/components/reaction-picker";
import { cn } from "@/lib/utils";

const eyebrow =
  "font-[family-name:var(--font-barlow)] font-extrabold uppercase tracking-[0.25em]";

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Avatar({
  photoUrl,
  firstName,
  lastName,
  size = "md",
}: {
  photoUrl: string | null;
  firstName: string;
  lastName: string;
  size?: "sm" | "md";
}) {
  const sz = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className={cn("rounded-full object-cover shrink-0", sz)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-zinc-300",
        sz
      )}
    >
      {firstName[0]}
      {lastName[0]}
    </div>
  );
}

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
        <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-[#CC0000]">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`${eyebrow} text-[9px] text-white px-3`}
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      )}

      {/* Comment row */}
      <div
        className="flex gap-2 bg-zinc-900 transition-transform"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={`/u/${c.author_id}`}
          className="shrink-0 hover:opacity-80 transition-opacity"
        >
          <Avatar
            photoUrl={c.author_photo_signed_url}
            firstName={c.author_first_name}
            lastName={c.author_last_name}
            size="sm"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="bg-zinc-800 px-3 py-2">
            <Link
              href={`/u/${c.author_id}`}
              className="text-xs font-bold text-white transition-colors hover:text-[#CC0000]"
            >
              {c.author_first_name} {c.author_last_name}
            </Link>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap">
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
                    className="mt-2 max-h-40 object-cover"
                  />
                }
              />
            )}
          </div>
          <p className="mt-0.5 pl-3 text-[10px] text-zinc-600">
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
    <div className="border border-zinc-900 bg-zinc-950 overflow-hidden">
      {/* Author row */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <Link
          href={`/u/${post.author_id}`}
          className="shrink-0 hover:opacity-80 transition-opacity"
        >
          <Avatar
            photoUrl={post.author_photo_signed_url}
            firstName={post.author_first_name}
            lastName={post.author_last_name}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${post.author_id}`}
            className="text-sm font-bold text-white transition-colors hover:text-[#CC0000]"
          >
            {post.author_first_name} {post.author_last_name}
          </Link>
          <p className={`${eyebrow} text-[9px] text-zinc-600`}>
            {relativeTime(post.created_at)}
          </p>
        </div>
      </div>

      {/* Post body */}
      <p className="px-4 pb-3 text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
        {post.body}
      </p>

      {/* Post photo */}
      {post.photo_signed_url && (
        <div className="px-4 pb-3">
          <PhotoLightbox
            src={post.photo_signed_url}
            alt="Post photo"
            trigger={
              <img
                src={post.photo_signed_url}
                alt="Post photo"
                className="w-full max-h-80 object-cover"
              />
            }
          />
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 border-t border-zinc-900 px-3 py-1">
        <ReactionPicker
          postId={post.id}
          myAlumniId={myAlumniId}
          myReaction={myReaction}
          reactions={reactions}
          onOptimistic={handleOptimisticReaction}
        />

        <button
          onClick={toggleComments}
          className={`${eyebrow} flex items-center gap-1.5 px-3 py-2 text-[10px] text-zinc-500 transition-colors hover:text-zinc-300`}
        >
          <MessageCircle className="size-4" />
          {post.comment_count > 0 && <span>{post.comment_count}</span>}
          <span className="hidden sm:inline">Comment</span>
        </button>
      </div>

      {/* Comments section */}
      {commentsOpen && (
        <div className="border-t border-zinc-900 px-4 pb-4 pt-3 space-y-3">
          {commentsLoading && (
            <p className={`${eyebrow} text-[10px] text-zinc-500`}>Loading…</p>
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
              <div className="flex-1 border border-zinc-800 bg-zinc-900 px-3 py-2">
                <textarea
                  ref={commentInputRef}
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Write a comment…"
                  rows={1}
                  className="w-full resize-none bg-transparent text-xs text-white placeholder-zinc-600 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                />
                <div className="mt-1.5 flex items-center justify-between">
                  <AttachPhoto
                    onFileReady={setCommentPhoto}
                    onClear={() => setCommentPhoto(null)}
                  />
                  <button
                    onClick={handleComment}
                    disabled={submitting || (!commentBody.trim() && !commentPhoto)}
                    className={`${eyebrow} flex items-center gap-1 rounded-sm bg-[#CC0000] px-2.5 py-1 text-[9px] text-white transition-colors hover:bg-[#AA0000] disabled:opacity-40`}
                  >
                    <Send className="size-3" />
                    {submitting ? "…" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {commentError && (
            <p className="text-xs text-red-400">{commentError}</p>
          )}
        </div>
      )}
    </div>
  );
}

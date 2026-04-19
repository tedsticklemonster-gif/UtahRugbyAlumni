"use client";

import { useState, useTransition, useRef } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { AttachPhoto } from "@/components/attach-photo";
import { toggleLikeAction, addCommentAction, getCommentsAction, type FeedComment, type FeedPost } from "@/actions/feed";
import { cn } from "@/lib/utils";

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

function Avatar({ photoUrl, firstName, lastName, size = "md" }: {
  photoUrl: string | null;
  firstName: string;
  lastName: string;
  size?: "sm" | "md";
}) {
  const sz = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  if (photoUrl) {
    return <img src={photoUrl} alt={`${firstName} ${lastName}`} className={cn("rounded-full object-cover shrink-0", sz)} />;
  }
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-full bg-zinc-700 font-bold text-zinc-300", sz)}>
      {firstName[0]}{lastName[0]}
    </div>
  );
}

interface PostCardProps {
  post: FeedPost;
  myAlumniId: string | null;
  onDeleted?: (id: string) => void;
}

export function PostCard({ post, myAlumniId }: PostCardProps) {
  const [liked, setLiked] = useState(post.i_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [liking, startLike] = useTransition();

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [commentBody, setCommentBody] = useState("");
  const [commentPhoto, setCommentPhoto] = useState<File | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [commentError, setCommentError] = useState<string | null>(null);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);

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

  function handleLike() {
    if (!myAlumniId) return;
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));
    startLike(async () => {
      const result = await toggleLikeAction(post.id);
      if (result.error) {
        // Revert on error
        setLiked(wasLiked);
        setLikeCount((c) => c + (wasLiked ? 1 : -1));
      }
    });
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
      // Reload comments
      const fresh = await getCommentsAction(post.id);
      setComments(fresh);
      setCommentsLoaded(true);
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Author row */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <Avatar
          photoUrl={post.author_photo_signed_url}
          firstName={post.author_first_name}
          lastName={post.author_last_name}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">
            {post.author_first_name} {post.author_last_name}
          </p>
          <p className="text-xs text-zinc-500">{relativeTime(post.created_at)}</p>
        </div>
      </div>

      {/* Post body */}
      <p className="px-4 pb-3 text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">{post.body}</p>

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
                className="w-full max-h-80 rounded-xl object-cover"
              />
            }
          />
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 border-t border-zinc-800 px-3 py-1">
        <button
          onClick={handleLike}
          disabled={liking || !myAlumniId}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
            liked
              ? "text-[#CC0000]"
              : "text-zinc-500 hover:text-zinc-300 disabled:cursor-default"
          )}
        >
          <Heart className={cn("size-4", liked && "fill-current")} />
          {likeCount > 0 && <span>{likeCount}</span>}
          <span className="hidden sm:inline">Like</span>
        </button>

        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <MessageCircle className="size-4" />
          {post.comment_count > 0 && <span>{post.comment_count}</span>}
          <span className="hidden sm:inline">Comment</span>
        </button>
      </div>

      {/* Comments section */}
      {commentsOpen && (
        <div className="border-t border-zinc-800 px-4 pb-4 pt-3 space-y-3">
          {commentsLoading && (
            <p className="text-xs text-zinc-500">Loading…</p>
          )}

          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar
                photoUrl={c.author_photo_signed_url}
                firstName={c.author_first_name}
                lastName={c.author_last_name}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="rounded-xl bg-zinc-800 px-3 py-2">
                  <p className="text-xs font-semibold text-white">
                    {c.author_first_name} {c.author_last_name}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap">{c.body}</p>
                  {c.photo_signed_url && (
                    <PhotoLightbox
                      src={c.photo_signed_url}
                      alt="Comment photo"
                      trigger={
                        <img src={c.photo_signed_url} alt="" className="mt-2 max-h-40 rounded-lg object-cover" />
                      }
                    />
                  )}
                </div>
                <p className="mt-0.5 pl-3 text-[10px] text-zinc-600">{relativeTime(c.created_at)}</p>
              </div>
            </div>
          ))}

          {/* Add comment */}
          {myAlumniId && (
            <div className="flex gap-2 pt-1">
              <div className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2">
                <textarea
                  ref={commentInputRef}
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Write a comment…"
                  rows={1}
                  className="w-full resize-none bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
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
                    className="flex items-center gap-1 rounded-lg bg-[#CC0000] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#AA0000] disabled:opacity-40"
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

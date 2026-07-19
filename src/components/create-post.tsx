"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { createPostAction } from "@/actions/feed";
import { useMe } from "@/components/me-provider";
import { MentionInput } from "@/components/mention-input";
import { cn } from "@/lib/utils";

export function CreatePost({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { me } = useMe();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 1200,
        maxSizeMB: 0.8,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: 0.85,
      });
      setPhoto(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch {
      setError("Failed to process image.");
    } finally {
      setCompressing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clearPhoto() {
    setPhoto(null);
    setPreview(null);
  }

  async function handleSubmit() {
    if (!body.trim() && !photo) return;
    setError(null);
    const fd = new FormData();
    fd.set("body", body);
    if (photo) fd.set("photo", photo);
    if (mentionIds.length > 0) fd.set("mention_ids", JSON.stringify(mentionIds));
    startSubmit(async () => {
      const result = await createPostAction(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      setBody("");
      setMentionIds([]);
      clearPhoto();
      router.refresh();
      onSuccess?.();
    });
  }

  if (!me) return null;

  const initials = `${me.first_name[0]}${me.last_name[0]}`;
  const busy = submitting || compressing;

  return (
    <div className="surface-card p-5">
      <div className="flex gap-3">
        {/* Avatar */}
        {me.photo_signed_url ? (
          <img src={me.photo_signed_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm font-bold text-zinc-300">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <MentionInput
            value={body}
            onChange={(text, ids) => { setBody(text); setMentionIds(ids); }}
            placeholder="What's on your mind, rugger?"
            rows={body ? 3 : 2}
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-border-strong bg-surface-2 px-3.5 py-3 text-base text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />

          {preview && (
            <div className="relative mt-2 inline-block">
              <img src={preview} alt="" className="max-h-48 rounded-xl object-cover" />
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-surface-1 border border-border-strong text-zinc-400 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}

          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-400 hover:bg-surface-2 hover:text-zinc-200 disabled:opacity-50"
              >
                <ImageIcon className="size-5" />
                {compressing ? "Processing…" : "Photo"}
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={busy || (!body.trim() && !photo)}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-bold transition-colors",
                "bg-utah-red text-white hover:bg-utah-red/90 disabled:opacity-40"
              )}
            >
              {submitting ? "Posting…" : "Post"}
            </button>
          </div>

          {body.length > 1800 && (
            <p className="mt-1 text-right text-xs text-zinc-500">{body.length}/2000</p>
          )}
        </div>
      </div>
    </div>
  );
}

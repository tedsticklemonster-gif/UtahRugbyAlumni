"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { uploadEventPhotos } from "@/actions/event-photos";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILES = 10;

export function EventPhotoUploader({ eventId }: { eventId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ url: string; file: File }[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setError(null);
    setSuccess(null);

    const valid = files.filter((f) => ACCEPTED_TYPES.includes(f.type));
    if (valid.length === 0) {
      setError("Please select JPEG, PNG, WebP, or HEIC images.");
      return;
    }

    const total = previews.length + valid.length;
    if (total > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} photos at a time.`);
      return;
    }

    setCompressing(true);
    try {
      const compressed = await Promise.all(
        valid.map((f) =>
          imageCompression(f, {
            maxWidthOrHeight: 1200,
            maxSizeMB: 1,
            useWebWorker: true,
            fileType: "image/jpeg",
            initialQuality: 0.85,
          })
        )
      );

      const newPreviews = compressed.map((f) => ({
        url: URL.createObjectURL(f),
        file: f,
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);
    } catch {
      setError("Failed to process images. Please try again.");
    } finally {
      setCompressing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removePreview(index: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleUpload() {
    if (previews.length === 0) return;

    startTransition(async () => {
      const formData = new FormData();
      for (const p of previews) {
        formData.append("photos", p.file);
      }

      const result = await uploadEventPhotos(eventId, formData);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(`${result.count} photo${result.count === 1 ? "" : "s"} uploaded!`);
        previews.forEach((p) => URL.revokeObjectURL(p.url));
        setPreviews([]);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
        Add Photos
      </p>

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="mb-3 grid grid-cols-4 gap-2">
          {previews.map((p, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800">
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removePreview(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-zinc-300 hover:text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={compressing || pending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white disabled:opacity-50"
        >
          <Camera className="size-3.5" />
          {compressing ? "Processing..." : "Select Photos"}
        </button>

        {previews.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#CC0000] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#AA0000] disabled:opacity-50"
          >
            {pending ? "Uploading..." : `Upload ${previews.length}`}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {success && <p className="mt-2 text-xs text-green-400">{success}</p>}
    </div>
  );
}

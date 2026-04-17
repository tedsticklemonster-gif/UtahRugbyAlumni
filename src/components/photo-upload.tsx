"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];
const MAX_SIZE_MB = 5;

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  onFileReady: (file: File) => void;
  className?: string;
}

export function PhotoUpload({
  currentPhotoUrl,
  onFileReady,
  className,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    currentPhotoUrl ?? null
  );
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a JPEG, PNG, WebP, or HEIC image.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    setCompressing(true);
    try {
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 800,
        maxSizeMB: 1,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: 0.85,
      });

      const previewUrl = URL.createObjectURL(compressed);
      setPreview(previewUrl);
      onFileReady(compressed);
    } catch {
      setError("Failed to process image. Please try another.");
    } finally {
      setCompressing(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {preview ? (
        <img
          src={preview}
          alt="Photo preview"
          className="h-24 w-24 rounded-full object-cover border"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full border bg-muted text-muted-foreground text-xs">
          No photo
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFile}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={compressing}
        onClick={() => inputRef.current?.click()}
      >
        {compressing ? "Processing..." : preview ? "Change Photo" : "Upload Photo"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { Camera, X } from "lucide-react";

interface AttachPhotoProps {
  onFileReady: (file: File) => void;
  onClear: () => void;
}

export function AttachPhoto({ onFileReady, onClear }: AttachPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 600,
        maxSizeMB: 0.3,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: 0.8,
      });
      setPreview(URL.createObjectURL(compressed));
      onFileReady(compressed);
    } catch {
      // silently fail, user can retry
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clear() {
    setPreview(null);
    onClear();
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={handleFile}
        className="hidden"
      />
      {preview ? (
        <div className="relative">
          <img src={preview} alt="" className="h-14 w-14 rounded-lg object-cover border border-zinc-700" />
          <button
            type="button"
            onClick={clear}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-50"
        >
          <Camera className="size-4" />
          {loading ? "…" : "Photo"}
        </button>
      )}
    </div>
  );
}

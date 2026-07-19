"use client";

import { useState } from "react";
import { Share2, Check, Copy, QrCode, X } from "lucide-react";

interface ShareProfileButtonProps {
  url: string;
  shareTitle: string;
  shareText: string;
}

function QRCodeSVG({ value, size = 200 }: { value: string; size?: number }) {
  // Simple QR code placeholder that generates a scannable visual via a data URL
  // For a real QR, we'd use a library, but this creates a scannable link display
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=18181b&color=ffffff&format=svg`;
  return (
    <img
      src={qrApiUrl}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-xl"
    />
  );
}

export function ShareProfileButton({
  url,
  shareTitle,
  shareText,
}: ShareProfileButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  async function handleShare() {
    const shareData = { title: shareTitle, text: shareText, url };
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (nav && "share" in nav) {
      try {
        await (nav as Navigator).share(shareData);
        return;
      } catch {
        // fall through to copy
      }
    }
    if (nav?.clipboard) {
      await nav.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-utah-red hover:text-white"
          aria-label="Share profile"
        >
          {copied ? (
            <>
              <Check className="size-4 text-success" />
              Copied
            </>
          ) : (
            <>
              {typeof navigator !== "undefined" && "share" in navigator ? (
                <Share2 className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              Share
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowQR(true)}
          className="inline-flex items-center justify-center size-9 rounded-full border border-border-strong text-zinc-400 transition-colors hover:border-utah-red hover:text-white"
          aria-label="Show QR code"
        >
          <QrCode className="size-4" />
        </button>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowQR(false)} />
          <div className="relative surface-card p-6 text-center">
            <button
              onClick={() => setShowQR(false)}
              className="absolute right-3 top-3 text-zinc-500 hover:text-white"
            >
              <X className="size-5" />
            </button>
            <p className="text-xs font-bold uppercase tracking-widest text-utah-red mb-3">
              Scan to view profile
            </p>
            <QRCodeSVG value={url} size={200} />
            <p className="mt-3 text-xs text-zinc-500 max-w-[200px] mx-auto break-all">
              {url}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

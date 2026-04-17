"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyForwardLink() {
  const [copied, setCopied] = useState(false);

  const forwardUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/forward/generic`
      : "";

  async function handleCopy() {
    await navigator.clipboard.writeText(forwardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
        {forwardUrl || "/forward/generic"}
      </code>
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? "Copied!" : "Copy Link"}
      </Button>
    </div>
  );
}

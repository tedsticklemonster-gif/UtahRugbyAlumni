"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const startY = useRef(0);
  const pulling = useRef(false);
  const triggered = useRef(false);

  return (
    <div
      onTouchStart={(e) => {
        startY.current = e.touches[0].clientY;
        pulling.current = window.scrollY === 0;
        triggered.current = false;
      }}
      onTouchMove={(e) => {
        if (!pulling.current || triggered.current) return;
        const delta = e.touches[0].clientY - startY.current;
        if (delta > 80) {
          triggered.current = true;
          navigator.vibrate?.(10);
        }
      }}
      onTouchEnd={() => {
        if (triggered.current) {
          router.refresh();
        }
        pulling.current = false;
      }}
    >
      {children}
    </div>
  );
}

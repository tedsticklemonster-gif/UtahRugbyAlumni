"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const startY = useRef(0);
  const pulling = useRef(false);
  const triggered = useRef(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

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
        const progress = Math.min(delta / 80, 1);
        setPullProgress(progress);
        if (delta > 80) {
          triggered.current = true;
          navigator.vibrate?.(10);
        }
      }}
      onTouchEnd={() => {
        if (triggered.current) {
          setRefreshing(true);
          router.refresh();
          setTimeout(() => {
            setRefreshing(false);
            setPullProgress(0);
          }, 600);
        } else {
          setPullProgress(0);
        }
        pulling.current = false;
      }}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: refreshing ? 40 : pullProgress > 0 ? pullProgress * 40 : 0 }}
      >
        <RefreshCw
          className="size-4 text-zinc-500 transition-transform"
          style={{
            opacity: pullProgress > 0.3 || refreshing ? 1 : 0,
            transform: `rotate(${refreshing ? 360 : pullProgress * 180}deg)`,
          }}
        />
      </div>
      {children}
    </div>
  );
}

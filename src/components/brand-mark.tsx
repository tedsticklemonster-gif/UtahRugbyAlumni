import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Header brand mark — renders the UU Rugby logo inside a white badge.
 * Sharp corners to match the new design language.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-sm bg-white flex items-center justify-center p-0.5",
        className
      )}
    >
      <Image
        src="/logo.jpg"
        alt="University of Utah Rugby"
        width={128}
        height={128}
        className="object-contain w-full h-full"
        priority
      />
    </div>
  );
}

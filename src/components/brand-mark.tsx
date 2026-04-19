import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Header brand mark — renders the UU Rugby logo inside a white rounded badge
 * so it reads cleanly on the dark zinc-950 header.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-xl bg-white flex items-center justify-center p-0.5",
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

import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 py-24 text-center">
      <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-surface-2">
        <Compass className="size-7 text-zinc-400" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="text-eyebrow">404</p>
      <h1 className="text-title-1 mt-2 text-white">Page not found</h1>
      <p className="text-caption mt-2 max-w-xs leading-relaxed">
        This page doesn&apos;t exist. Head back home or browse the directory.
      </p>
      <div className="mt-7 flex gap-3">
        <Button size="pill-lg" render={<Link href="/" />}>
          Go home
        </Button>
        <Button variant="outline" size="pill-lg" render={<Link href="/network" />}>
          Directory
        </Button>
      </div>
    </div>
  );
}

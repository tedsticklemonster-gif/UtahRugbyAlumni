import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Utah Rugby Alumni
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/directory"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Directory
          </Link>
          <Link href="/join" className={buttonVariants({ size: "sm" })}>
            Join the Network
          </Link>
        </nav>
      </div>
    </header>
  );
}

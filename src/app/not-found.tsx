import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-6xl font-black text-zinc-800">404</p>
      <h1 className="mt-3 text-xl font-black text-white">Page not found</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
        This page doesn&apos;t exist. Head back home or browse the directory.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-[#CC0000] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#AA0000]"
        >
          Go home
        </Link>
        <Link
          href="/directory"
          className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500"
        >
          Directory
        </Link>
      </div>
    </div>
  );
}

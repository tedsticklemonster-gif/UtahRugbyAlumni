import Image from "next/image";

/**
 * Large prominent logo for the home page hero.
 * White background badge with drop shadow so it pops against the photo overlay.
 */
export function HeroLogo() {
  return (
    <div className="inline-flex size-24 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-2xl ring-2 ring-white/20">
      <Image
        src="/logo.jpg"
        alt="University of Utah Rugby"
        width={256}
        height={256}
        className="h-full w-full object-contain"
        priority
      />
    </div>
  );
}

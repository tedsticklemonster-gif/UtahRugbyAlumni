import Image from "next/image";

interface UserPhotoProps {
  src: string | null | undefined;
  alt: string;
  firstName: string;
  lastName: string;
  size?: number;
  className?: string;
  rounded?: "full" | "xl" | "2xl" | "none";
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

/* Muted brand-family duotones — red, umber, slate, stone. Restrained on
   purpose: the grid should read as one team, not a bag of Skittles. */
const HASH_COLORS = [
  "from-utah-red/80 to-[oklch(0.30_0.09_27)]",
  "from-[oklch(0.45_0.06_55)] to-[oklch(0.28_0.04_55)]",
  "from-[oklch(0.42_0.04_260)] to-[oklch(0.27_0.03_260)]",
  "from-zinc-600 to-zinc-800",
];

function hashName(first: string, last: string): number {
  const s = `${first}${last}`.toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Renders a user photo from a Supabase signed URL using `next/image`, with a
 * gradient-initials fallback when no photo exists or the viewer is gated.
 */
export function UserPhoto({
  src,
  alt,
  firstName,
  lastName,
  size = 64,
  className = "",
  rounded = "full",
  priority = false,
  fill = false,
  sizes,
}: UserPhotoProps) {
  const roundedClass =
    rounded === "full" ? "rounded-full"
    : rounded === "2xl" ? "rounded-2xl"
    : rounded === "none" ? ""
    : "rounded-xl";
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const color = HASH_COLORS[hashName(firstName, lastName) % HASH_COLORS.length];

  if (src) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
          className={`object-cover ${roundedClass} ${className}`}
          unoptimized
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className={`object-cover ${roundedClass} ${className}`}
        unoptimized
      />
    );
  }

  const fontSize = Math.round(size * 0.4);
  return (
    <div
      aria-label={alt}
      style={fill ? undefined : { width: size, height: size, fontSize }}
      className={`text-display flex items-center justify-center bg-gradient-to-br text-white ${color} ${roundedClass} ${
        fill ? "absolute inset-0 text-[clamp(1.5rem,8vw,4rem)]" : ""
      } ${className}`}
    >
      {initials}
    </div>
  );
}

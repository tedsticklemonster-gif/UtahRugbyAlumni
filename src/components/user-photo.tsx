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

const HASH_COLORS = [
  "from-[#CC0000] to-[#7a0000]",
  "from-indigo-600 to-indigo-900",
  "from-emerald-600 to-emerald-900",
  "from-amber-500 to-amber-800",
  "from-fuchsia-600 to-fuchsia-900",
  "from-sky-600 to-sky-900",
  "from-rose-600 to-rose-900",
  "from-teal-600 to-teal-900",
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
      className={`flex items-center justify-center bg-gradient-to-br font-black text-white ${color} ${roundedClass} ${
        fill ? "absolute inset-0 text-[clamp(1.5rem,8vw,4rem)]" : ""
      } ${className}`}
    >
      {initials}
    </div>
  );
}

import { cn } from "@/lib/utils";

const SIZES = {
  xs: "h-6 w-6 text-3xs",
  sm: "h-7 w-7 text-2xs",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-20 w-20 text-lg",
} as const;

export type MemberAvatarSize = keyof typeof SIZES;

/** The app's single avatar: photo when available, initials fallback otherwise.
 * Wrap in <SponsorHalo> where a tier ring is wanted (see alumni-card). */
export function MemberAvatar({
  photoUrl,
  firstName,
  lastName,
  size = "md",
  className,
}: {
  photoUrl: string | null | undefined;
  firstName: string;
  lastName: string;
  size?: MemberAvatarSize;
  className?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URLs, sized via CSS
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className={cn("shrink-0 rounded-full object-cover", SIZES[size], className)}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-zinc-300",
        SIZES[size],
        className
      )}
    >
      {firstName?.[0]}
      {lastName?.[0]}
    </div>
  );
}

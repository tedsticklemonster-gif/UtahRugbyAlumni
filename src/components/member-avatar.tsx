import { cn } from "@/lib/utils";

const SIZES = {
  xs: "h-7 w-7 text-2xs",
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-xl",
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
        "text-display flex shrink-0 items-center justify-center rounded-full bg-surface-2 text-zinc-300",
        SIZES[size],
        className
      )}
    >
      {firstName?.[0]}
      {lastName?.[0]}
    </div>
  );
}

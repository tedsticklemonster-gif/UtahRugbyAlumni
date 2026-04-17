import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AlumniCardProps {
  firstName: string;
  lastName: string;
  gradYear: number | null;
  position: string | null;
  profession: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  // Gated fields — only available to verified, authenticated alumni
  photoUrl?: string | null;
  linkedinUrl?: string | null;
  bio?: string | null;
  isGated: boolean;
}

export function AlumniCard({
  firstName,
  lastName,
  gradYear,
  position,
  profession,
  company,
  city,
  state,
  photoUrl,
  linkedinUrl,
  bio,
  isGated,
}: AlumniCardProps) {
  const location = [city, state].filter(Boolean).join(", ");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
        {!isGated && photoUrl ? (
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            className="h-12 w-12 rounded-full object-cover border"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground font-medium text-sm">
            {firstName[0]}
            {lastName[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base">
            {firstName} {lastName}
          </CardTitle>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {gradYear && (
              <Badge variant="secondary" className="text-xs">
                &apos;{String(gradYear).slice(-2)}
              </Badge>
            )}
            {position && (
              <Badge variant="outline" className="text-xs">
                {position}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-1.5">
        {profession && (
          <p className="text-sm">
            {profession}
            {company && (
              <span className="text-muted-foreground"> at {company}</span>
            )}
          </p>
        )}
        {!profession && company && (
          <p className="text-sm text-muted-foreground">{company}</p>
        )}
        {location && (
          <p className="text-sm text-muted-foreground">{location}</p>
        )}
        {!isGated && bio && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
            {bio}
          </p>
        )}
        {!isGated && linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-block mt-1"
          >
            LinkedIn
          </a>
        )}
      </CardContent>
    </Card>
  );
}

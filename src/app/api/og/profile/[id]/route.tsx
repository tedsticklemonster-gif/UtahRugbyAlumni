import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const UTAH_RED = "#CC0000";

function initials(first: string | null, last: string | null): string {
  const f = (first ?? "").trim()[0] ?? "";
  const l = (last ?? "").trim()[0] ?? "";
  return `${f}${l}`.toUpperCase() || "U";
}

function gradientFrom(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  const h2 = (h + 40) % 360;
  return `linear-gradient(135deg, hsl(${h}, 55%, 32%), hsl(${h2}, 60%, 20%))`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: a } = await admin
    .from("alumni")
    .select(
      "first_name, last_name, grad_year, position, profession, job_title, company, city, state, photo_url, availability, hiring, willing_to_mentor, verified, status, directory_visible"
    )
    .eq("id", id)
    .single();

  if (!a || !a.directory_visible || !["self_registered", "imported"].includes(a.status ?? "")) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#fff",
            fontSize: 64,
            fontWeight: 900,
          }}
        >
          Utah Rugby Alumni
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  let photoUrl: string | null = null;
  if (a.photo_url) {
    const { data: sig } = await admin.storage
      .from("alumni-photos")
      .createSignedUrl(a.photo_url, 3600);
    photoUrl = sig?.signedUrl ?? null;
  }

  const name = `${a.first_name} ${a.last_name}`;
  const location = [a.city, a.state].filter(Boolean).join(", ");
  const subtitle = [a.job_title ?? a.profession, a.company]
    .filter(Boolean)
    .join(" · ");

  const ribbonLabel = a.hiring
    ? "HIRING"
    : a.availability === "open_to_work" || a.availability === "looking_for_work"
    ? "OPEN TO WORK"
    : a.availability === "self_employed"
    ? "SELF-EMPLOYED"
    : a.willing_to_mentor
    ? "MENTOR"
    : null;
  const ribbonColor = a.hiring
    ? "#0EA5E9"
    : a.availability === "open_to_work" || a.availability === "looking_for_work"
    ? "#10B981"
    : a.availability === "self_employed"
    ? "#D946EF"
    : "#F59E0B";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0a0a0a",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Utah red bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 14,
            background: UTAH_RED,
          }}
        />

        {/* Left: photo */}
        <div
          style={{
            width: 420,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: gradientFrom(name),
            marginTop: 14,
          }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              width={420}
              height={616}
              style={{
                width: 420,
                height: 616,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 220,
                fontWeight: 900,
                color: "rgba(255,255,255,0.85)",
                display: "flex",
              }}
            >
              {initials(a.first_name, a.last_name)}
            </div>
          )}
        </div>

        {/* Right: text */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px 64px 64px 56px",
            marginTop: 14,
          }}
        >
          {ribbonLabel && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                background: ribbonColor,
                color: "#fff",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 2,
                borderRadius: 999,
                alignSelf: "flex-start",
                marginBottom: 28,
              }}
            >
              {ribbonLabel}
            </div>
          )}

          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -1,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {name}
          </div>

          {a.grad_year && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 28,
                color: "#d4d4d8",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  padding: "4px 14px",
                  background: UTAH_RED,
                  color: "#fff",
                  borderRadius: 8,
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                Class of {a.grad_year}
              </div>
              {a.position && (
                <div style={{ textTransform: "capitalize", display: "flex" }}>
                  {a.position}
                </div>
              )}
            </div>
          )}

          {subtitle && (
            <div
              style={{
                marginTop: 24,
                fontSize: 30,
                color: "#e4e4e7",
                fontWeight: 600,
                display: "flex",
              }}
            >
              {subtitle}
            </div>
          )}

          {location && (
            <div
              style={{
                marginTop: 8,
                fontSize: 26,
                color: "#a1a1aa",
                display: "flex",
              }}
            >
              {location}
            </div>
          )}

          <div
            style={{
              marginTop: "auto",
              paddingTop: 40,
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              color: "#71717a",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                background: UTAH_RED,
                borderRadius: 999,
                display: "flex",
              }}
            />
            UTAH RUGBY ALUMNI
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const UTAH_RED = "#CC0000";

const KIND_LABEL: Record<string, string> = {
  reunion: "REUNION",
  game_watch: "GAME WATCH",
  fundraiser: "FUNDRAISER",
  practice: "PRACTICE",
  social: "SOCIAL",
  other: "EVENT",
};

function formatEventDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return { date, time };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: e } = await admin
    .from("events")
    .select("title, description, starts_at, location, kind, photo_url, deleted_at")
    .eq("id", id)
    .single();

  if (!e || e.deleted_at) {
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
  if (e.photo_url) {
    const { data: sig } = await admin.storage
      .from("event-photos")
      .createSignedUrl(e.photo_url, 3600);
    photoUrl = sig?.signedUrl ?? null;
  }

  const { date, time } = formatEventDate(e.starts_at);
  const kindLabel = KIND_LABEL[e.kind as string] ?? "EVENT";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0a0a0a",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Background photo */}
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              objectFit: "cover",
              opacity: 0.35,
            }}
          />
        )}

        {/* Utah red top bar */}
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

        {/* Dark gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "64px 72px 72px 72px",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "8px 18px",
              background: UTAH_RED,
              color: "#fff",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 3,
              borderRadius: 999,
              alignSelf: "flex-start",
              marginBottom: 24,
            }}
          >
            {kindLabel}
          </div>

          <div
            style={{
              fontSize: 84,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: -1,
              marginBottom: 28,
              maxWidth: 1000,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {e.title}
          </div>

          <div
            style={{
              display: "flex",
              gap: 28,
              fontSize: 30,
              color: "#f4f4f5",
              fontWeight: 700,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex" }}>{date}</div>
            <div
              style={{
                width: 6,
                height: 6,
                background: "#71717a",
                borderRadius: 999,
                display: "flex",
              }}
            />
            <div style={{ display: "flex" }}>{time}</div>
            {e.location && (
              <>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    background: "#71717a",
                    borderRadius: 999,
                    display: "flex",
                  }}
                />
                <div style={{ display: "flex" }}>{e.location}</div>
              </>
            )}
          </div>

          <div
            style={{
              marginTop: 32,
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              color: "#a1a1aa",
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

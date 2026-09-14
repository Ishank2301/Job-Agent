import { ImageResponse } from "next/og";

export const alt = "Job·Agent — the AI career agent with a human holding the keys";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f5f1",
          color: "#1c1917",
          position: "relative",
        }}
      >
        {/* soft color blobs */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: 120,
            width: 500,
            height: 400,
            borderRadius: 999,
            background:
              "radial-gradient(closest-side, rgba(14,122,95,0.18), transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            right: 100,
            width: 560,
            height: 420,
            borderRadius: 999,
            background:
              "radial-gradient(closest-side, rgba(180,83,9,0.12), transparent)",
          }}
        />

        {/* logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "14px 28px",
            border: "1px solid rgba(28,25,23,0.14)",
            borderRadius: 18,
            background: "#ffffff",
          }}
        >
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z"
              stroke="#0e7a5f"
              strokeWidth="1.4"
            />
            <circle cx="12" cy="11" r="2.4" fill="#0e7a5f" />
          </svg>
          <span
            style={{
              fontSize: 40,
              letterSpacing: 12,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
            }}
          >
            Job·Agent
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 600,
            marginTop: 48,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.2,
            fontFamily: "Georgia, serif",
          }}
        >
          Discover. Tailor. Apply. — you approve every send.
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 44,
          }}
        >
          {["DRY_RUN by default", "Human-in-the-loop", "Self-hostable"].map(
            (chip) => (
              <span
                key={chip}
                style={{
                  display: "flex",
                  fontSize: 24,
                  color: "#0e7a5f",
                  border: "1px solid rgba(14,122,95,0.35)",
                  background: "rgba(14,122,95,0.08)",
                  borderRadius: 999,
                  padding: "10px 24px",
                }}
              >
                {chip}
              </span>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}

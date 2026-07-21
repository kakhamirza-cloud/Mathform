import { ImageResponse } from "next/og";
import { analyzeFormula } from "@/lib/formula";
import { buildTraits } from "@/lib/traits";

export const runtime = "nodejs";

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const formula = searchParams.get("f");

  if (!formula?.trim()) {
    return new Response("Missing formula", { status: 400 });
  }

  try {
    const analysis = analyzeFormula(formula);
    const traits = buildTraits(analysis);
    const { colors } = traits;
    const formulaLabel = truncate(traits.formula, 48);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: `linear-gradient(145deg, ${colors.paper} 0%, ${colors.secondary}55 45%, ${colors.primary}66 100%)`,
            fontFamily: "Georgia, serif",
            color: colors.ink,
            padding: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 28,
              letterSpacing: 8,
              textTransform: "uppercase",
              opacity: 0.75,
            }}
          >
            <span>UNVOXD</span>
            <span style={{ fontSize: 22, letterSpacing: 2 }}>{traits.rarity}</span>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 48,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 340,
                  height: 340,
                  borderRadius: 999,
                  background: colors.accent,
                  opacity: 0.2,
                }}
              />
              <div
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: traits.head === "soft-square" ? 28 : 999,
                  background: colors.skin,
                  border: `6px solid ${colors.ink}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 28,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: colors.ink,
                  }}
                />
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: colors.ink,
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: -8,
                  width: 150,
                  height: 190,
                  borderRadius: 80,
                  background: colors.primary,
                  border: `5px solid ${colors.ink}`,
                }}
              />
              <div
                style={{
                  marginTop: 18,
                  fontSize: 42,
                  opacity: 0.7,
                  display: "flex",
                  gap: 16,
                }}
              >
                {traits.glyphs.slice(0, 3).map((g) => (
                  <span key={g}>{g}</span>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: 520,
                gap: 16,
              }}
            >
              <div style={{ fontSize: 26, opacity: 0.65 }}>{traits.archetype}</div>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: -1,
                }}
              >
                {traits.name}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 28,
                  fontFamily: "monospace",
                  padding: "14px 18px",
                  background: `${colors.ink}14`,
                  borderRadius: 8,
                }}
              >
                {formulaLabel}
              </div>
              <div style={{ fontSize: 24, opacity: 0.7, marginTop: 8 }}>
                formula × results → character
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 22,
              opacity: 0.55,
              fontFamily: "monospace",
            }}
          >
            <span>@unvoxd_nft</span>
            <span>#{traits.seed.toString(16)}</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 1200,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=604800",
        },
      },
    );
  } catch (err) {
    console.error("OG image render failed:", err);
    return new Response("Could not render character", { status: 500 });
  }
}

import sharp from "sharp";
import { analyzeFormula } from "@/lib/formula";
import { buildTraits } from "@/lib/traits";
import { renderCharacterSvg } from "@/lib/renderCharacter";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const formula = searchParams.get("f");

  if (!formula?.trim()) {
    return new Response("Missing formula", { status: 400 });
  }

  try {
    const analysis = analyzeFormula(formula);
    const traits = buildTraits(analysis);
    const svg = renderCharacterSvg(traits);

    const png = await sharp(Buffer.from(svg)).resize(1200, 1200).png().toBuffer();

    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Could not render character", { status: 400 });
  }
}

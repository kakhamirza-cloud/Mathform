/**
 * Export forge SVG + pixel PNG for OpenSea.
 *
 * Usage:
 *   npx tsx scripts/export-opensea.ts [count]
 *   npx tsx scripts/export-opensea.ts 3333 --pixel-only   # rewrite PNGs (+ metadata) only
 *   npx tsx scripts/export-opensea.ts 3333 --cooler-mint    # pixel PNGs + cooler OpenSea pack
 *
 * Default count = 24. Pass 3333 for full supply.
 *
 * Output:
 *   opensea-export/forge/images/*.svg
 *   opensea-export/cooler/images/*.png  (pixel art — #ccff00 bg)
 *   opensea-export/metadata/*.json
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { createCanvas } from "@napi-rs/canvas";
import { analyzeFormula } from "../src/lib/formula";
import { buildTraits, type CharacterTraits } from "../src/lib/traits";
import { renderCharacterSvg } from "../src/lib/renderCharacter";
import { renderPixelArt } from "../src/lib/renderPixelArt";

const ROOT = path.join(process.cwd(), "opensea-export");
const FORGE_IMG = path.join(ROOT, "forge", "images");
const COOLER_IMG = path.join(ROOT, "cooler", "images");
const META = path.join(ROOT, "metadata");

/** Minimal DOM so canvas renderers can run in Node. */
function installNodeCanvas() {
  const g = globalThis as typeof globalThis & {
    document?: { createElement: (tag: string) => unknown };
  };
  g.document = {
    createElement(tag: string) {
      if (tag !== "canvas") {
        throw new Error(`Node export only supports canvas, got ${tag}`);
      }
      // Pixel art resizes to 24 then 480; forge cooler used 1024 — start large enough.
      return createCanvas(1024, 1024);
    },
  };
}

function formulaForIndex(i: number): string {
  const templates = [
    `sin(x)^2 + cos(x)^2 + ${i}/1000`,
    `e^(i*pi) + 1 + ${i}*0.001`,
    `(1 + sqrt(5))/2 + ${i}/3333`,
    `x^3 - 2*x + 1 + ${i}`,
    `abs(sin(pi*x)) * log(e + x^2 + ${i})`,
    `sqrt(x^2 + y^2) + pi/4 + ${i}/100`,
    `tan(x/2) + ${i}*0.01`,
    `cos(2*pi*x) + sin(${i}*x/100)`,
    `log(1 + abs(x)) + ${i}/50`,
    `x^2 + ${i}*x + ${i % 97}`,
    `pi*e + ${i}/777`,
    `sinh(x) + cosh(x) + ${i}/200`,
  ];
  return templates[i % templates.length]!.replace(/\s+/g, " ");
}

function openSeaAttributes(traits: CharacterTraits) {
  return [
    { trait_type: "Rarity", value: traits.rarity },
    { trait_type: "Archetype", value: traits.archetype },
    { trait_type: "Head", value: traits.head },
    { trait_type: "Eyes", value: traits.eyes },
    { trait_type: "Mouth", value: traits.mouth },
    { trait_type: "Aura", value: traits.aura },
    { trait_type: "Accessory", value: traits.accessory },
    { trait_type: "Pattern", value: traits.pattern },
    { trait_type: "Stance", value: traits.stance },
    { trait_type: "Complexity", value: traits.complexity, display_type: "number" },
    { trait_type: "Entropy", value: traits.stats.entropy, display_type: "number" },
    { trait_type: "Precision", value: traits.stats.precision, display_type: "number" },
    { trait_type: "Chaos", value: traits.stats.chaos, display_type: "number" },
    { trait_type: "Elegance", value: traits.stats.elegance, display_type: "number" },
    { trait_type: "Power", value: traits.stats.power, display_type: "number" },
    { trait_type: "Formula", value: traits.formula },
  ];
}

function pixelArtPng(traits: CharacterTraits): Buffer {
  const canvas = renderPixelArt(traits) as unknown as {
    toBuffer: (mime: string) => Buffer;
  };
  return canvas.toBuffer("image/png");
}

function main() {
  installNodeCanvas();

  const args = process.argv.slice(2);
  const pixelOnly = args.includes("--pixel-only");
  const coolerMint = args.includes("--cooler-mint");
  const countArg = args.find((a) => /^\d+$/.test(a));
  const count = Math.max(
    1,
    Math.min(3333, Number(countArg ?? (pixelOnly ? 3333 : 24)) || 24),
  );

  fs.mkdirSync(FORGE_IMG, { recursive: true });
  fs.mkdirSync(COOLER_IMG, { recursive: true });
  fs.mkdirSync(META, { recursive: true });

  const collection: Array<{
    tokenId: number;
    name: string;
    formula: string;
    power: number;
  }> = [];

  console.log(
    pixelOnly
      ? `Rewriting ${count} cooler PNGs → pixel art (#ccff00)`
      : `Exporting ${count} forge SVG + pixel PNG`,
  );

  for (let i = 0; i < count; i++) {
    const tokenId = i + 1;
    const formula = formulaForIndex(i);
    const analysis = analyzeFormula(formula);
    const traits = buildTraits(analysis);

    if (!pixelOnly) {
      fs.writeFileSync(
        path.join(FORGE_IMG, `${tokenId}.svg`),
        renderCharacterSvg(traits),
        "utf8",
      );
    }

    fs.writeFileSync(path.join(COOLER_IMG, `${tokenId}.png`), pixelArtPng(traits));

    const meta = {
      name: `${traits.name} #${tokenId}`,
      description: `Hood Forged character from: ${traits.formula}. 24×24 pixel art on #ccff00. Power ${traits.stats.power}/99.`,
      image: `ipfs://REPLACE_PIXEL_CID/${tokenId}.png`,
      animation_url: `ipfs://REPLACE_FORGE_CID/${tokenId}.svg`,
      external_url: "https://unvoxd.site",
      attributes: openSeaAttributes(traits),
    };
    fs.writeFileSync(
      path.join(META, `${tokenId}.json`),
      JSON.stringify(meta, null, 2),
      "utf8",
    );

    collection.push({
      tokenId,
      name: traits.name,
      formula: traits.formula,
      power: traits.stats.power,
    });

    if ((i + 1) % 25 === 0 || i + 1 === count) {
      console.log(`exported ${i + 1}/${count}`);
    }
  }

  fs.writeFileSync(
    path.join(ROOT, "collection.json"),
    JSON.stringify(
      {
        name: "Hood Forged",
        symbol: "HOOD",
        supply: count,
        art: {
          forge: "forge/images/*.svg — base on-site forge look",
          pixel:
            "cooler/images/*.png — 24×24 pixel art (#ccff00 bg)",
        },
        description:
          "Formula-forged characters. Pixel art mint image. Same formula = same character. Power fuels worker formula gathering.",
        items: collection,
      },
      null,
      2,
    ),
    "utf8",
  );

  fs.writeFileSync(
    path.join(ROOT, "OPENSEA.md"),
    `# Hood Forged mint pack (${count})

## Folders

| Path | What |
|---|---|
| \`forge/images/*.svg\` | Base forge characters |
| \`cooler/images/*.png\` | **Pixel art** (24×24 upscaled, #ccff00) — **OpenSea mint image** |
| \`cooler/metadata/*.json\` | Cooler-only token metadata (no forge animation) |
| \`metadata/*.json\` | Legacy shared metadata (includes forge animation_url) |

## OpenSea mint (cooler only)

\`\`\`bash
npx tsx scripts/export-opensea.ts 3333 --pixel-only
npx tsx scripts/prepare-cooler-mint.ts
# After IPFS upload:
npx tsx scripts/apply-ipfs-cid.ts <YOUR_CID>
\`\`\`

See \`cooler/MINT.md\` for full steps.

## Full 3333 export

\`\`\`bash
npx tsx scripts/export-opensea.ts 3333
npx tsx scripts/export-opensea.ts 3333 --pixel-only
npx tsx scripts/export-opensea.ts 3333 --cooler-mint
\`\`\`
`,
    "utf8",
  );

  console.log(`\nDone → ${ROOT}`);
  console.log(`Forge SVG:  ${FORGE_IMG}`);
  console.log(`Pixel PNG:  ${COOLER_IMG}`);

  if (coolerMint) {
    console.log("\nPreparing cooler OpenSea mint pack…");
    execSync("npx --yes tsx scripts/prepare-cooler-mint.ts", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  }
}

main();

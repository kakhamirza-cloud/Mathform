/**
 * Export BOTH forge SVG + cooler-art PNG for OpenSea / site mint decisions.
 *
 * Usage:
 *   npx tsx scripts/export-opensea.ts [count]
 *
 * Default count = 24. Pass 3333 for full supply.
 *
 * Output:
 *   opensea-export/forge/images/*.svg
 *   opensea-export/cooler/images/*.png
 *   opensea-export/metadata/*.json   (points at cooler art by default)
 */
import fs from "fs";
import path from "path";
import { createCanvas } from "@napi-rs/canvas";
import { analyzeFormula } from "../src/lib/formula";
import { buildTraits, type CharacterTraits } from "../src/lib/traits";
import { renderCharacterSvg } from "../src/lib/renderCharacter";
import { renderCoolArt } from "../src/lib/renderCoolArt";

const ROOT = path.join(process.cwd(), "opensea-export");
const FORGE_IMG = path.join(ROOT, "forge", "images");
const COOLER_IMG = path.join(ROOT, "cooler", "images");
const META = path.join(ROOT, "metadata");

/** Minimal DOM so renderCoolArt can run in Node. */
function installNodeCanvas() {
  const g = globalThis as typeof globalThis & { document?: { createElement: (tag: string) => unknown } };
  g.document = {
    createElement(tag: string) {
      if (tag !== "canvas") {
        throw new Error(`Node export only supports canvas, got ${tag}`);
      }
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

function coolArtPng(traits: CharacterTraits): Buffer {
  const canvas = renderCoolArt(traits) as unknown as {
    toBuffer: (mime: string) => Buffer;
  };
  return canvas.toBuffer("image/png");
}

function main() {
  installNodeCanvas();

  const count = Math.max(1, Math.min(3333, Number(process.argv[2] ?? 24) || 24));

  fs.mkdirSync(FORGE_IMG, { recursive: true });
  fs.mkdirSync(COOLER_IMG, { recursive: true });
  fs.mkdirSync(META, { recursive: true });

  const collection: Array<{
    tokenId: number;
    name: string;
    formula: string;
    power: number;
  }> = [];

  for (let i = 0; i < count; i++) {
    const tokenId = i + 1;
    const formula = formulaForIndex(i);
    const analysis = analyzeFormula(formula);
    const traits = buildTraits(analysis);

    fs.writeFileSync(
      path.join(FORGE_IMG, `${tokenId}.svg`),
      renderCharacterSvg(traits),
      "utf8",
    );
    fs.writeFileSync(path.join(COOLER_IMG, `${tokenId}.png`), coolArtPng(traits));

    const meta = {
      name: `${traits.name} #${tokenId}`,
      description: `UNVOXD character forged from: ${traits.formula}. Includes forge SVG + cooler art. Power ${traits.stats.power}/99 — worker capacity for formula gathering.`,
      image: `ipfs://REPLACE_COOLER_CID/${tokenId}.png`,
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
        name: "UNVOXD",
        symbol: "UNVOXD",
        supply: count,
        art: {
          forge: "forge/images/*.svg — base on-site forge look",
          cooler: "cooler/images/*.png — cooler art (recommended mint image)",
        },
        description:
          "Formula-forged characters. Ask collectors: mint on UNVOXD.site or OpenSea. Same formula = same character. Power fuels worker formula gathering.",
        items: collection,
      },
      null,
      2,
    ),
    "utf8",
  );

  fs.writeFileSync(
    path.join(ROOT, "OPENSEA.md"),
    `# UNVOXD dual-art mint pack (${count})

## Folders

| Path | What |
|---|---|
| \`forge/images/*.svg\` | Base forge characters |
| \`cooler/images/*.png\` | Cooler art (use this as the main OpenSea image) |
| \`metadata/*.json\` | OpenSea traits (includes **Power**) |

## Ask your community

> Do you want to mint on **UNVOXD.site** or **OpenSea**?

- **Site mint** → forge live from formula, same deterministic art  
- **OpenSea mint** → upload cooler PNG (and optionally link forge SVG)

## Mint a few on OpenSea now

1. Create collection **UNVOXD** on OpenSea  
2. Create NFT → upload \`cooler/images/1.png\`  
3. Copy name / description / traits from \`metadata/1.json\`  
4. Show both arts in your tweet so people can vote site vs OpenSea  

## Full 3333

\`\`\`bash
npx tsx scripts/export-opensea.ts 3333
\`\`\`

Then pin \`cooler/images\` + \`forge/images\` to IPFS and replace CIDs in metadata.
`,
    "utf8",
  );

  console.log(`\nDone → ${ROOT}`);
  console.log(`Forge SVG:  ${FORGE_IMG}`);
  console.log(`Cooler PNG: ${COOLER_IMG}`);
}

main();

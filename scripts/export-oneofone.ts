/**
 * Export 20 hand-drawn 1/1 Hood Forged pixel characters.
 *
 * Usage: npx tsx scripts/export-oneofone.ts
 *
 * Output:
 *   opensea-export/1-1/images/*.png
 *   opensea-export/1-1/metadata/*.json
 */
import fs from "fs";
import path from "path";
import { createCanvas } from "@napi-rs/canvas";
import {
  ONE_OF_ONE_THEMES,
  oneOfOnePixelToBuffer,
  renderOneOfOnePixel,
} from "../src/lib/renderOneOfOnePixel";

const ROOT = path.join(process.cwd(), "opensea-export", "1-1");
const IMG = path.join(ROOT, "images");
const META = path.join(ROOT, "metadata");

function installNodeCanvas() {
  const g = globalThis as typeof globalThis & {
    document?: { createElement: (tag: string) => unknown };
  };
  g.document = {
    createElement(tag: string) {
      if (tag !== "canvas") {
        throw new Error(`Node export only supports canvas, got ${tag}`);
      }
      return createCanvas(1024, 1024);
    },
  };
}

function themeLabel(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function main() {
  installNodeCanvas();
  fs.mkdirSync(IMG, { recursive: true });
  fs.mkdirSync(META, { recursive: true });

  const items: Array<{ tokenId: number; id: string; name: string }> = [];

  console.log(`Exporting ${ONE_OF_ONE_THEMES.length} 1/1 pixel characters…`);

  ONE_OF_ONE_THEMES.forEach((theme, index) => {
    const tokenId = index + 1;
    const canvas = renderOneOfOnePixel(theme) as ReturnType<
      typeof renderOneOfOnePixel
    > & { toBuffer: (mime: string) => Buffer };

    fs.writeFileSync(path.join(IMG, `${tokenId}.png`), oneOfOnePixelToBuffer(canvas));

    const meta = {
      name: `${theme.name} #${tokenId}`,
      description: `1/1 Hood Forged pixel art — ${themeLabel(theme.id)} theme. Hand-drawn 24×24 grid on #ccff00, upscaled to 480px.`,
      image: `ipfs://REPLACE_1OF1_CID/${tokenId}.png`,
      external_url: "https://unvoxd.site",
      attributes: [
        { trait_type: "Edition", value: "1/1" },
        { trait_type: "Theme", value: themeLabel(theme.id) },
        { trait_type: "Style", value: "Pixel" },
        { trait_type: "Background", value: "#ccff00" },
        { trait_type: "Rarity", value: "Unique" },
      ],
    };

    fs.writeFileSync(
      path.join(META, `${tokenId}.json`),
      JSON.stringify(meta, null, 2),
      "utf8",
    );

    items.push({ tokenId, id: theme.id, name: theme.name });
    console.log(`  ${tokenId}. ${theme.name}`);
  });

  fs.writeFileSync(
    path.join(ROOT, "collection.json"),
    JSON.stringify(
      {
        name: "Hood Forged 1/1",
        symbol: "HOOD1",
        supply: ONE_OF_ONE_THEMES.length,
        description:
          "Twenty hand-drawn 1/1 Hood Forged pixel characters — fantasy, dark, and sci-fi themes on #ccff00.",
        items,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`\nDone → ${ROOT}`);
}

main();

/**
 * Render Hood Forged honorary pixel PNG (same style as opensea-export/cooler).
 *
 * Usage:
 *   npx tsx scripts/render-honorary-pixel.ts [output-path]
 *   npx tsx scripts/render-honorary-pixel.ts --doodles [output-path]
 *   npx tsx scripts/render-honorary-pixel.ts --trippy [output-path]
 */
import fs from "fs";
import path from "path";
import { createCanvas } from "@napi-rs/canvas";
import {
  renderHonoraryDoodlesPixel,
  renderHonoraryPixel,
  renderHonoraryTrippyPixel,
  honoraryPixelToBuffer,
} from "../src/lib/renderHonoraryPixel";

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

type HonoraryVariant = "default" | "doodles" | "trippy";

function parseVariant(args: string[]): HonoraryVariant {
  if (args.includes("--doodles")) return "doodles";
  if (args.includes("--trippy")) return "trippy";
  return "default";
}

function defaultOutput(variant: HonoraryVariant): string {
  const names: Record<HonoraryVariant, string> = {
    default: "hood-forged-honorary-reference.png",
    doodles: "hood-forged-honorary-doodles.png",
    trippy: "hood-forged-honorary-trippy.png",
  };
  return path.join(process.cwd(), "marketing", names[variant]);
}

function main() {
  installNodeCanvas();
  const args = process.argv.slice(2);
  const variant = parseVariant(args);
  const outArg = args.find((a) => !a.startsWith("--"));
  const out = outArg ?? defaultOutput(variant);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  const render =
    variant === "doodles"
      ? renderHonoraryDoodlesPixel
      : variant === "trippy"
        ? renderHonoraryTrippyPixel
        : renderHonoraryPixel;
  const canvas = render() as ReturnType<typeof renderHonoraryPixel> & {
    toBuffer: (mime: string) => Buffer;
  };
  fs.writeFileSync(out, honoraryPixelToBuffer(canvas));
  console.log(`Wrote ${out}`);
}

main();

/**
 * Make a looping Twitter GIF: UNVOXD character "forging" a formula.
 *
 *   npx tsx scripts/make-forge-gif.ts
 *
 * Output: marketing/unvoxd-forge.gif
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { createCanvas, type Canvas } from "@napi-rs/canvas";
import { analyzeFormula } from "../src/lib/formula";
import { buildTraits, type CharacterTraits } from "../src/lib/traits";
import { renderCoolArt } from "../src/lib/renderCoolArt";

const OUT_DIR = path.join(process.cwd(), "marketing");
const FRAMES_DIR = path.join(OUT_DIR, "gif-frames");
const GIF_PATH = path.join(OUT_DIR, "unvoxd-forge.gif");

const FORMULA = "e^(i*pi) + 1";
const SIZE = 512; // Twitter-friendly square
const FRAMES = 48;
const FPS = 12;

function installNodeCanvas() {
  const g = globalThis as typeof globalThis & {
    document?: { createElement: (tag: string) => unknown };
  };
  g.document = {
    createElement(tag: string) {
      if (tag !== "canvas") throw new Error(`expected canvas, got ${tag}`);
      return createCanvas(1024, 1024);
    },
  };
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function drawFrame(
  baseTraits: CharacterTraits,
  frameIndex: number,
): Canvas {
  const t = frameIndex / FRAMES;
  // 0–0.7 type formula + reveal glyphs, 0.7–1 hold + pulse
  const writeT = Math.min(1, t / 0.7);
  const write = easeOutCubic(writeT);
  const holdPulse = t > 0.7 ? 0.5 + 0.5 * Math.sin(((t - 0.7) / 0.3) * Math.PI * 2) : 0;

  const typedLen = Math.max(1, Math.floor(write * baseTraits.formula.length));
  const typed = baseTraits.formula.slice(0, typedLen);
  const glyphCount = Math.max(
    0,
    Math.floor(write * baseTraits.glyphs.length),
  );

  const frameTraits: CharacterTraits = {
    ...baseTraits,
    formula: typed,
    glyphs: baseTraits.glyphs.slice(0, glyphCount),
  };

  const art = renderCoolArt(frameTraits) as unknown as Canvas;
  const out = createCanvas(SIZE, SIZE);
  const ctx = out.getContext("2d");

  // slight bob while "working"
  const bob = Math.sin(frameIndex * 0.35) * 3;
  ctx.fillStyle = "#f3efe6";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.drawImage(art, 0, bob, SIZE, SIZE);

  // chalk sparks near the formula bar as it types
  if (writeT < 1) {
    const barX = (56 / 640) * SIZE + (typedLen / Math.max(1, baseTraits.formula.length)) * (SIZE * 0.72);
    const barY = (58 / 640) * SIZE + bob;
    for (let i = 0; i < 6; i++) {
      const a = frameIndex * 0.4 + i;
      const px = barX + Math.cos(a) * (6 + i * 2);
      const py = barY + Math.sin(a * 1.3) * (4 + i);
      ctx.fillStyle = `rgba(26, 35, 50, ${0.25 + (i % 3) * 0.1})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.5 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // soft brand pulse at the end of the loop
  if (holdPulse > 0) {
    ctx.fillStyle = `rgba(47, 111, 102, ${0.08 * holdPulse})`;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.font = `bold ${Math.round(18 + holdPulse * 4)}px Syne, Arial, sans-serif`;
    ctx.fillStyle = `rgba(26, 35, 50, ${0.45 + holdPulse * 0.35})`;
    ctx.textAlign = "center";
    ctx.fillText("FORGED", SIZE / 2, SIZE - 28);
  }

  return out;
}

function findFfmpeg(): string {
  const candidates = [
    process.env.FFMPEG_PATH,
    "ffmpeg",
    "D:\\ffmpeg\\ffmpeg-2026-02-15-git-33b215d155-full_build\\bin\\ffmpeg.exe",
  ].filter(Boolean) as string[];

  for (const bin of candidates) {
    const check = spawnSync(bin, ["-version"], { encoding: "utf8" });
    if (check.status === 0) return bin;
  }
  throw new Error("ffmpeg not found — install it or set FFMPEG_PATH");
}

function main() {
  installNodeCanvas();
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const traits = buildTraits(analyzeFormula(FORMULA));
  console.log(`Forging GIF for "${traits.name}" · ${FORMULA}`);

  for (let i = 0; i < FRAMES; i++) {
    const canvas = drawFrame(traits, i);
    const file = path.join(FRAMES_DIR, `frame_${String(i).padStart(3, "0")}.png`);
    fs.writeFileSync(file, canvas.toBuffer("image/png"));
    if (i % 8 === 0 || i === FRAMES - 1) console.log(`frame ${i + 1}/${FRAMES}`);
  }

  const ffmpeg = findFfmpeg();
  const palette = path.join(FRAMES_DIR, "palette.png");
  const pattern = path.join(FRAMES_DIR, "frame_%03d.png");

  // Two-pass palette GIF for smaller / cleaner Twitter upload
  const pass1 = spawnSync(
    ffmpeg,
    [
      "-y",
      "-framerate",
      String(FPS),
      "-i",
      pattern,
      "-vf",
      "palettegen=max_colors=192:stats_mode=diff",
      palette,
    ],
    { encoding: "utf8" },
  );
  if (pass1.status !== 0) {
    console.error(pass1.stderr);
    throw new Error("palettegen failed");
  }

  const pass2 = spawnSync(
    ffmpeg,
    [
      "-y",
      "-framerate",
      String(FPS),
      "-i",
      pattern,
      "-i",
      palette,
      "-lavfi",
      "paletteuse=dither=bayer:bayer_scale=3",
      "-loop",
      "0",
      GIF_PATH,
    ],
    { encoding: "utf8" },
  );
  if (pass2.status !== 0) {
    console.error(pass2.stderr);
    throw new Error("paletteuse failed");
  }

  const kb = Math.round(fs.statSync(GIF_PATH).size / 1024);
  console.log(`Done → ${GIF_PATH} (${kb} KB)`);
}

main();

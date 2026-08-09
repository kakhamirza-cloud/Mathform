/**
 * Pixel forge art.
 * Native grid is 24×24, then nearest-neighbor upscaled.
 * Same formula traits → same pixel bytes.
 */
import type { CharacterTraits } from "./traits";
import { createRng } from "./rng";

const GRID = 24;
const SCALE = 20; // 24 * 20 = 480 display
const SIZE = GRID * SCALE;

type RGB = [number, number, number];

function parseHsl(input: string): { h: number; s: number; l: number } {
  const m = input.match(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)/i);
  if (!m) return { h: 200, s: 35, l: 55 };
  return { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const ss = s / 100;
  const ll = l / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = ll - c / 2;
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function shade(rgb: RGB, dl: number): RGB {
  return [
    Math.max(0, Math.min(255, rgb[0] + dl)),
    Math.max(0, Math.min(255, rgb[1] + dl)),
    Math.max(0, Math.min(255, rgb[2] + dl)),
  ];
}

function fromCss(input: string, dl = 0): RGB {
  const { h, s, l } = parseHsl(input);
  return shade(hslToRgb(h, s, l), dl);
}

function setPx(buf: Uint8ClampedArray, x: number, y: number, rgb: RGB, a = 255) {
  if (x < 0 || y < 0 || x >= GRID || y >= GRID) return;
  const i = (y * GRID + x) * 4;
  buf[i] = rgb[0];
  buf[i + 1] = rgb[1];
  buf[i + 2] = rgb[2];
  buf[i + 3] = a;
}

function fillRect(
  buf: Uint8ClampedArray,
  x0: number,
  y0: number,
  w: number,
  h: number,
  rgb: RGB,
) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) setPx(buf, x, y, rgb);
  }
}

/** Head silhouette from trait head type. */
function drawHead(
  buf: Uint8ClampedArray,
  kind: string,
  skin: RGB,
  ink: RGB,
) {
  // Bust: head ~x 6–17, y 4–15, neck, shoulders
  const body = shade(skin, -18);

  // shoulders / torso strip
  fillRect(buf, 4, 18, 16, 5, body);
  fillRect(buf, 5, 17, 14, 1, body);

  // neck
  fillRect(buf, 10, 15, 4, 3, skin);

  if (kind === "diamond") {
    // diamond-ish stepped head
    fillRect(buf, 11, 3, 2, 1, skin);
    fillRect(buf, 9, 4, 6, 1, skin);
    fillRect(buf, 8, 5, 8, 1, skin);
    fillRect(buf, 7, 6, 10, 8, skin);
    fillRect(buf, 8, 14, 8, 1, skin);
    fillRect(buf, 9, 15, 6, 1, skin);
  } else if (kind === "hex" || kind === "soft-square") {
    fillRect(buf, 7, 4, 10, 1, skin);
    fillRect(buf, 6, 5, 12, 10, skin);
    fillRect(buf, 7, 15, 10, 1, skin);
  } else if (kind === "triangle") {
    fillRect(buf, 11, 3, 2, 1, skin);
    fillRect(buf, 10, 4, 4, 1, skin);
    fillRect(buf, 9, 5, 6, 1, skin);
    fillRect(buf, 8, 6, 8, 1, skin);
    fillRect(buf, 7, 7, 10, 8, skin);
  } else if (kind === "oval") {
    fillRect(buf, 8, 3, 8, 1, skin);
    fillRect(buf, 7, 4, 10, 12, skin);
    fillRect(buf, 8, 16, 8, 1, skin);
  } else {
    // round / default head box
    fillRect(buf, 7, 4, 10, 1, skin);
    fillRect(buf, 6, 5, 12, 11, skin);
  }

  // outline ticks (left/right edges)
  for (let y = 5; y <= 15; y++) {
    setPx(buf, 5, y, ink);
    setPx(buf, 18, y, ink);
  }
}

function drawEyes(
  buf: Uint8ClampedArray,
  style: string,
  ink: RGB,
  accent: RGB,
) {
  const ly = 8;
  const ry = 8;
  const lx = 9;
  const rx = 14;

  if (style === "slash") {
    setPx(buf, lx, ly, ink);
    setPx(buf, lx + 1, ly - 1, ink);
    setPx(buf, rx, ry, ink);
    setPx(buf, rx + 1, ry - 1, ink);
    return;
  }
  if (style === "plus") {
    setPx(buf, lx, ly, ink);
    setPx(buf, lx - 1, ly, ink);
    setPx(buf, lx + 1, ly, ink);
    setPx(buf, lx, ly - 1, ink);
    setPx(buf, lx, ly + 1, ink);
    setPx(buf, rx, ry, ink);
    setPx(buf, rx - 1, ry, ink);
    setPx(buf, rx + 1, ry, ink);
    setPx(buf, rx, ry - 1, ink);
    setPx(buf, rx, ry + 1, ink);
    return;
  }
  if (style === "ring") {
    fillRect(buf, lx - 1, ly - 1, 3, 3, ink);
    setPx(buf, lx, ly, accent);
    fillRect(buf, rx - 1, ry - 1, 3, 3, ink);
    setPx(buf, rx, ry, accent);
    return;
  }
  if (style === "square") {
    fillRect(buf, lx - 1, ly - 1, 3, 3, ink);
    fillRect(buf, rx - 1, ry - 1, 3, 3, ink);
    return;
  }
  if (style === "almond") {
    fillRect(buf, lx - 1, ly, 3, 1, ink);
    setPx(buf, lx, ly, accent);
    fillRect(buf, rx - 1, ry, 3, 1, ink);
    setPx(buf, rx, ry, accent);
    return;
  }
  if (style === "asym") {
    fillRect(buf, lx - 1, ly - 1, 2, 2, ink);
    fillRect(buf, rx - 1, ry - 2, 3, 4, ink);
    setPx(buf, rx, ry, accent);
    return;
  }
  if (style === "spiral") {
    setPx(buf, lx, ly, ink);
    setPx(buf, lx + 1, ly - 1, ink);
    setPx(buf, lx + 1, ly + 1, ink);
    setPx(buf, rx, ry, ink);
    setPx(buf, rx - 1, ry - 1, ink);
    setPx(buf, rx - 1, ry + 1, ink);
    return;
  }
  // dot default
  setPx(buf, lx, ly, ink);
  setPx(buf, rx, ry, ink);
}

function drawMouth(buf: Uint8ClampedArray, style: string, ink: RGB) {
  const y = 12;
  const cx = 11;
  if (style === "none") return;
  if (style === "curve") {
    setPx(buf, cx - 1, y, ink);
    setPx(buf, cx, y + 1, ink);
    setPx(buf, cx + 1, y + 1, ink);
    setPx(buf, cx + 2, y, ink);
    return;
  }
  if (style === "zigzag") {
    setPx(buf, cx - 2, y, ink);
    setPx(buf, cx - 1, y + 1, ink);
    setPx(buf, cx, y, ink);
    setPx(buf, cx + 1, y + 1, ink);
    setPx(buf, cx + 2, y, ink);
    return;
  }
  if (style === "box") {
    fillRect(buf, cx - 1, y, 4, 2, ink);
    return;
  }
  if (style === "tilde") {
    setPx(buf, cx - 2, y + 1, ink);
    setPx(buf, cx - 1, y, ink);
    setPx(buf, cx, y, ink);
    setPx(buf, cx + 1, y + 1, ink);
    setPx(buf, cx + 2, y + 1, ink);
    return;
  }
  // line
  fillRect(buf, cx - 1, y, 4, 1, ink);
}

function drawAccessory(
  buf: Uint8ClampedArray,
  accessory: string,
  accent: RGB,
  ink: RGB,
  primary: RGB,
) {
  // Map math accessories → overlays (hat / glasses / pipe / earring)
  if (accessory.includes("crown") || accessory.includes("π")) {
    fillRect(buf, 8, 2, 8, 2, accent);
    setPx(buf, 8, 1, accent);
    setPx(buf, 11, 1, accent);
    setPx(buf, 15, 1, accent);
  } else if (accessory.includes("hood") || accessory.includes("λ")) {
    fillRect(buf, 6, 3, 12, 2, primary);
    fillRect(buf, 5, 5, 2, 8, primary);
    fillRect(buf, 17, 5, 2, 8, primary);
  } else if (accessory.includes("scarf") || accessory.includes("∞")) {
    fillRect(buf, 7, 15, 10, 2, accent);
    fillRect(buf, 6, 16, 3, 3, accent);
  } else if (accessory.includes("lens") || accessory.includes("φ")) {
    fillRect(buf, 8, 7, 3, 3, ink);
    fillRect(buf, 13, 7, 3, 3, ink);
    setPx(buf, 9, 8, accent);
    setPx(buf, 14, 8, accent);
    fillRect(buf, 11, 8, 2, 1, ink);
  } else if (accessory.includes("cape") || accessory.includes("∫")) {
    fillRect(buf, 3, 16, 3, 6, primary);
    fillRect(buf, 18, 16, 3, 6, primary);
  } else if (accessory.includes("pendant") || accessory.includes("Δ")) {
    setPx(buf, 11, 16, accent);
    setPx(buf, 12, 16, accent);
    setPx(buf, 11, 17, accent);
    setPx(buf, 12, 17, accent);
  } else if (accessory.includes("badge") || accessory.includes("ℵ")) {
    fillRect(buf, 16, 17, 3, 3, accent);
  } else if (accessory.includes("staff") || accessory.includes("spear")) {
    fillRect(buf, 3, 8, 1, 12, ink);
    setPx(buf, 3, 7, accent);
  } else {
    // default earring
    setPx(buf, 5, 10, accent);
    setPx(buf, 5, 11, accent);
  }
}

function drawAuraPixels(
  buf: Uint8ClampedArray,
  aura: string,
  accent: RGB,
  secondary: RGB,
  seed: number,
) {
  const rng = createRng(seed ^ 0xa11a);
  if (aura === "halo") {
    for (let x = 7; x <= 16; x++) setPx(buf, x, 2, accent);
  } else if (aura === "spark" || aura === "burst") {
    for (let i = 0; i < 8; i++) {
      setPx(buf, 2 + rng.int(0, 19), 1 + rng.int(0, 5), i % 2 ? accent : secondary);
    }
  } else if (aura === "orbit") {
    setPx(buf, 4, 7, accent);
    setPx(buf, 19, 7, accent);
    setPx(buf, 4, 14, secondary);
    setPx(buf, 19, 14, secondary);
  } else if (aura === "grid") {
    for (let x = 1; x < 23; x += 4) setPx(buf, x, 1, secondary);
  } else {
    // faint corner motes
    setPx(buf, 1, 1, secondary);
    setPx(buf, 22, 1, accent);
  }
}

/** Render pixel character from forge traits. */
export function renderPixelArt(traits: CharacterTraits): HTMLCanvasElement {
  const low = document.createElement("canvas");
  low.width = GRID;
  low.height = GRID;
  const lowCtx = low.getContext("2d");
  if (!lowCtx) {
    const empty = document.createElement("canvas");
    empty.width = SIZE;
    empty.height = SIZE;
    return empty;
  }

  const img = lowCtx.createImageData(GRID, GRID);
  const buf = img.data;

  const skin = fromCss(traits.colors.skin);
  const primary = fromCss(traits.colors.primary);
  const secondary = fromCss(traits.colors.secondary);
  const accent = fromCss(traits.colors.accent);
  const ink = fromCss(traits.colors.ink, -20);
  // Brand canvas #ccff00
  const bg: RGB = [204, 255, 0];

  fillRect(buf, 0, 0, GRID, GRID, bg);
  drawAuraPixels(buf, traits.aura, accent, secondary, traits.seed);
  drawHead(buf, traits.head, skin, ink);
  drawEyes(buf, traits.eyes, ink, accent);
  drawMouth(buf, traits.mouth, ink);
  drawAccessory(buf, traits.accessory, accent, ink, primary);

  // rarity mark — 1px in corner
  if (traits.rarity === "Legendary" || traits.rarity === "Epic") {
    setPx(buf, 22, 22, accent);
    setPx(buf, 23, 22, accent);
    setPx(buf, 22, 23, accent);
  }

  lowCtx.putImageData(img, 0, 0);

  // Upscale with nearest-neighbor (chunky pixels)
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(low, 0, 0, SIZE, SIZE);

  // tiny formula fingerprint along bottom edge (1px tall bar encoding seed)
  const rng = createRng(traits.seed ^ 0x51ed);
  ctx.fillStyle = `rgb(${ink[0]},${ink[1]},${ink[2]})`;
  for (let i = 0; i < 24; i++) {
    if (rng.next() > 0.45) {
      ctx.fillRect(i * SCALE, SIZE - SCALE, SCALE, SCALE);
    }
  }

  return canvas;
}

export function pixelArtToDataUrl(traits: CharacterTraits): string {
  return renderPixelArt(traits).toDataURL("image/png");
}

export function downloadPixelArt(traits: CharacterTraits) {
  const url = pixelArtToDataUrl(traits);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${traits.name.toLowerCase().replace(/\s+/g, "-")}-pixel.png`;
  a.click();
}

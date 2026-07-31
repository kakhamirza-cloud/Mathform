import type { CharacterTraits } from "./traits";
import { createRng } from "./rng";

const SIZE = 1024;

function parseHsl(input: string): { h: number; s: number; l: number } {
  const m = input.match(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)/i);
  if (!m) return { h: 30, s: 40, l: 55 };
  return { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) };
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${((h % 360) + 360) % 360} ${Math.max(0, Math.min(100, s))}% ${Math.max(0, Math.min(100, l))}%)`;
}

function shade(color: string, deltaL: number): string {
  const { h, s, l } = parseHsl(color);
  return hsl(h, s, l + deltaL);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function strokeFill(
  ctx: CanvasRenderingContext2D,
  fill: string,
  line = 10,
) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = line;
  ctx.strokeStyle = "#111111";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

/** Creature silhouette family from archetype — never the reference bat/rat. */
function creatureFamily(archetype: string): "fox" | "moth" | "golem" | "sprite" | "warden" {
  if (archetype.includes("Fox") || archetype.includes("Nomad")) return "fox";
  if (archetype.includes("Moth") || archetype.includes("Sprite")) return "moth";
  if (archetype.includes("Golem") || archetype.includes("Tensor")) return "golem";
  if (archetype.includes("Djinn") || archetype.includes("Chaos")) return "sprite";
  return "warden";
}

function drawSpikyFur(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  spikes: number,
  fill: string,
  rng: ReturnType<typeof createRng>,
) {
  ctx.beginPath();
  for (let i = 0; i < spikes; i++) {
    const a0 = (Math.PI * 2 * i) / spikes - Math.PI / 2;
    const a1 = (Math.PI * 2 * (i + 0.5)) / spikes - Math.PI / 2;
    const outer = r * (1.12 + rng.next() * 0.22);
    const x0 = cx + Math.cos(a0) * r * 0.92;
    const y0 = cy + Math.sin(a0) * r * 0.92;
    const x1 = cx + Math.cos(a1) * outer;
    const y1 = cy + Math.sin(a1) * outer;
    if (i === 0) ctx.moveTo(x0, y0);
    else ctx.lineTo(x0, y0);
    ctx.lineTo(x1, y1);
  }
  ctx.closePath();
  strokeFill(ctx, fill, 9);
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  traits: CharacterTraits,
  cx: number,
  cy: number,
  r: number,
  fur: string,
) {
  const family = creatureFamily(traits.archetype);
  ctx.save();

  if (family === "fox") {
    // pointed ears
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * r * 0.35, cy - r * 0.55);
      ctx.lineTo(cx + side * r * 0.95, cy - r * 1.25);
      ctx.lineTo(cx + side * r * 0.7, cy - r * 0.35);
      ctx.closePath();
      strokeFill(ctx, fur, 8);
      ctx.beginPath();
      ctx.moveTo(cx + side * r * 0.45, cy - r * 0.55);
      ctx.lineTo(cx + side * r * 0.82, cy - r * 1.05);
      ctx.lineTo(cx + side * r * 0.62, cy - r * 0.42);
      ctx.closePath();
      ctx.fillStyle = shade(traits.colors.accent, 12);
      ctx.fill();
    }
  } else if (family === "moth") {
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + side * r * 0.85, cy - r * 0.15, r * 0.55, r * 0.95, side * 0.35, 0, Math.PI * 2);
      strokeFill(ctx, shade(traits.colors.secondary, 8), 8);
    }
  } else if (family === "golem") {
    roundRect(ctx, cx - r, cy - r, r * 2, r * 2, r * 0.18);
    strokeFill(ctx, fur, 10);
  } else if (family === "sprite") {
    drawSpikyFur(ctx, cx, cy, r * 1.05, 14, fur, createRng(traits.seed ^ 0x51));
  }

  // main head mass
  if (traits.head === "diamond") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.9, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r * 0.9, cy);
    ctx.closePath();
  } else if (traits.head === "hex") {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (traits.head === "triangle") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy + r * 0.85);
    ctx.lineTo(cx - r, cy + r * 0.85);
    ctx.closePath();
  } else if (traits.head === "soft-square") {
    roundRect(ctx, cx - r, cy - r * 0.95, r * 2, r * 1.9, r * 0.35);
  } else if (traits.head === "oval") {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.85, r * 1.1, 0, 0, Math.PI * 2);
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
  strokeFill(ctx, fur, 11);

  // cel shade wedge
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.92, -0.4, 1.4);
  ctx.arc(cx, cy, r * 0.55, 1.4, -0.4, true);
  ctx.closePath();
  ctx.fillStyle = shade(fur, -14);
  ctx.globalAlpha = 0.55;
  ctx.fill();
  ctx.globalAlpha = 1;

  // snout / muzzle — abstract, not the reference snout
  if (family === "fox" || family === "warden") {
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.35, r * 0.38, r * 0.28, 0, 0, Math.PI * 2);
    strokeFill(ctx, shade(fur, -8), 7);
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.28, r * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = traits.colors.ink;
    ctx.fill();
  }

  ctx.restore();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  traits: CharacterTraits,
  cx: number,
  cy: number,
  r: number,
) {
  const ink = traits.colors.ink;
  const accent = traits.colors.accent;
  const y = cy - r * 0.08;
  const spread = r * 0.38;

  const drawOne = (x: number) => {
    ctx.save();
    if (traits.eyes === "almond") {
      ctx.beginPath();
      ctx.ellipse(x, y, 28, 16, 0, 0, Math.PI * 2);
      strokeFill(ctx, ink, 6);
      ctx.beginPath();
      ctx.arc(x + 6, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
    } else if (traits.eyes === "ring") {
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.lineWidth = 8;
      ctx.strokeStyle = ink;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
    } else if (traits.eyes === "slash") {
      ctx.beginPath();
      ctx.moveTo(x - 22, y + 12);
      ctx.lineTo(x + 22, y - 12);
      ctx.lineWidth = 9;
      ctx.strokeStyle = ink;
      ctx.lineCap = "round";
      ctx.stroke();
    } else if (traits.eyes === "plus") {
      ctx.beginPath();
      ctx.moveTo(x - 20, y);
      ctx.lineTo(x + 20, y);
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x, y + 20);
      ctx.lineWidth = 8;
      ctx.strokeStyle = ink;
      ctx.lineCap = "round";
      ctx.stroke();
    } else if (traits.eyes === "square") {
      roundRect(ctx, x - 18, y - 18, 36, 36, 6);
      strokeFill(ctx, ink, 5);
      roundRect(ctx, x - 7, y - 7, 14, 14, 2);
      ctx.fillStyle = accent;
      ctx.fill();
    } else if (traits.eyes === "spiral") {
      ctx.beginPath();
      for (let i = 0; i < 40; i++) {
        const t = i / 40;
        const a = t * Math.PI * 4;
        const rad = 4 + t * 20;
        const px = x + Math.cos(a) * rad;
        const py = y + Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.lineWidth = 5;
      ctx.strokeStyle = ink;
      ctx.stroke();
    } else {
      // half-lidded cool stare (cel style)
      ctx.beginPath();
      ctx.ellipse(x, y, 22, 18, 0, 0, Math.PI * 2);
      strokeFill(ctx, "#f4f0e6", 6);
      ctx.beginPath();
      ctx.arc(x + 3, y + 2, 10, 0, Math.PI * 2);
      ctx.fillStyle = ink;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 26, y - 8);
      ctx.quadraticCurveTo(x, y - 18, x + 26, y - 8);
      ctx.lineWidth = 7;
      ctx.strokeStyle = ink;
      ctx.stroke();
    }
    ctx.restore();
  };

  drawOne(cx - spread);
  if (traits.eyes !== "asym") drawOne(cx + spread);
  else {
    roundRect(ctx, cx + spread - 10, y - 22, 28, 44, 6);
    strokeFill(ctx, ink, 5);
  }
}

function drawMouth(
  ctx: CanvasRenderingContext2D,
  traits: CharacterTraits,
  cx: number,
  cy: number,
  r: number,
) {
  const y = cy + r * 0.42;
  const ink = traits.colors.ink;
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (traits.mouth === "none") {
    ctx.restore();
    return;
  }
  if (traits.mouth === "curve") {
    ctx.beginPath();
    ctx.moveTo(cx - 36, y);
    ctx.quadraticCurveTo(cx, y + 28, cx + 36, y);
    ctx.stroke();
  } else if (traits.mouth === "zigzag") {
    ctx.beginPath();
    ctx.moveTo(cx - 40, y);
    ctx.lineTo(cx - 20, y + 16);
    ctx.lineTo(cx, y);
    ctx.lineTo(cx + 20, y + 16);
    ctx.lineTo(cx + 40, y);
    ctx.stroke();
  } else if (traits.mouth === "box") {
    roundRect(ctx, cx - 32, y - 8, 64, 28, 6);
    ctx.stroke();
  } else if (traits.mouth === "tilde") {
    ctx.beginPath();
    ctx.moveTo(cx - 38, y);
    ctx.quadraticCurveTo(cx - 18, y - 16, cx, y);
    ctx.quadraticCurveTo(cx + 18, y + 16, cx + 38, y);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - 34, y);
    ctx.lineTo(cx + 34, y);
    ctx.stroke();
    // tiny teeth notches
    ctx.beginPath();
    ctx.moveTo(cx - 8, y);
    ctx.lineTo(cx - 4, y + 10);
    ctx.lineTo(cx, y);
    ctx.lineTo(cx + 4, y + 10);
    ctx.lineTo(cx + 8, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  traits: CharacterTraits,
  cx: number,
  cy: number,
) {
  const shirt = "#f3efe6";
  const shirtShade = "#d9d2c4";
  const ink = traits.colors.ink;

  // torso
  ctx.beginPath();
  ctx.moveTo(cx - 130, cy + 40);
  ctx.quadraticCurveTo(cx - 160, cy + 220, cx - 90, cy + 320);
  ctx.lineTo(cx + 90, cy + 320);
  ctx.quadraticCurveTo(cx + 160, cy + 220, cx + 130, cy + 40);
  ctx.closePath();
  strokeFill(ctx, shirt, 12);

  // cel shade on shirt
  ctx.beginPath();
  ctx.moveTo(cx + 20, cy + 50);
  ctx.quadraticCurveTo(cx + 120, cy + 160, cx + 70, cy + 300);
  ctx.lineTo(cx + 90, cy + 320);
  ctx.quadraticCurveTo(cx + 150, cy + 200, cx + 120, cy + 50);
  ctx.closePath();
  ctx.fillStyle = shirtShade;
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;

  // distressed holes (style cue from ref — not the same layout)
  const rng = createRng(traits.seed ^ 0x77a);
  for (let i = 0; i < 5; i++) {
    const hx = cx - 70 + rng.next() * 140;
    const hy = cy + 90 + rng.next() * 160;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    for (let k = 0; k < 5; k++) {
      const a = (Math.PI * 2 * k) / 5;
      ctx.lineTo(hx + Math.cos(a) * (10 + rng.next() * 12), hy + Math.sin(a) * (8 + rng.next() * 10));
    }
    ctx.closePath();
    ctx.fillStyle = traits.colors.skin;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = ink;
    ctx.stroke();
  }

  // accent splatters from chaos/rarity — abstract paint, not blood copy
  const splats = Math.floor(traits.stats.chaos / 25) + (traits.rarity === "Legendary" ? 3 : 1);
  for (let i = 0; i < splats; i++) {
    const sx = cx - 80 + rng.next() * 160;
    const sy = cy + 70 + rng.next() * 180;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 6 + rng.next() * 10, 4 + rng.next() * 7, rng.next(), 0, Math.PI * 2);
    ctx.fillStyle = shade(traits.colors.accent, -10);
    ctx.fill();
  }

  // collar line
  ctx.beginPath();
  ctx.moveTo(cx - 70, cy + 55);
  ctx.quadraticCurveTo(cx, cy + 95, cx + 70, cy + 55);
  ctx.lineWidth = 8;
  ctx.strokeStyle = ink;
  ctx.stroke();
}

function drawAccessory(
  ctx: CanvasRenderingContext2D,
  traits: CharacterTraits,
  cx: number,
  cy: number,
  r: number,
) {
  const acc = traits.accessory.toLowerCase();
  const accent = traits.colors.accent;
  const ink = traits.colors.ink;
  ctx.save();

  if (acc.includes("crown")) {
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy - r - 10);
    ctx.lineTo(cx - 45, cy - r - 70);
    ctx.lineTo(cx - 15, cy - r - 25);
    ctx.lineTo(cx, cy - r - 80);
    ctx.lineTo(cx + 15, cy - r - 25);
    ctx.lineTo(cx + 45, cy - r - 70);
    ctx.lineTo(cx + 70, cy - r - 10);
    ctx.closePath();
    strokeFill(ctx, accent, 8);
    ctx.font = "bold 28px Georgia, serif";
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.fillText("π", cx, cy - r - 28);
  } else if (acc.includes("staff") || acc.includes("spear")) {
    const x = cx + (acc.includes("spear") ? -150 : 150);
    ctx.beginPath();
    ctx.moveTo(x, cy - 180);
    ctx.lineTo(x, cy + 280);
    ctx.lineWidth = 14;
    ctx.strokeStyle = ink;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, cy - 190);
    ctx.lineTo(x + 28, cy - 130);
    ctx.lineTo(x - 28, cy - 130);
    ctx.closePath();
    strokeFill(ctx, accent, 6);
  } else if (acc.includes("scarf") || acc.includes("cape") || acc.includes("hood")) {
    ctx.beginPath();
    ctx.moveTo(cx - 100, cy + 30);
    ctx.quadraticCurveTo(cx - 180, cy + 120, cx - 40, cy + 260);
    ctx.quadraticCurveTo(cx + 40, cy + 120, cx + 120, cy + 40);
    ctx.quadraticCurveTo(cx, cy + 90, cx - 100, cy + 30);
    ctx.closePath();
    strokeFill(ctx, accent, 8);
  } else if (acc.includes("lens") || acc.includes("pendant") || acc.includes("badge")) {
    const x = cx + 110;
    const y = cy + (acc.includes("pendant") ? 80 : 10);
    ctx.beginPath();
    ctx.arc(x, y, 42, 0, Math.PI * 2);
    strokeFill(ctx, accent, 8);
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(traits.glyphs[0] ?? "φ", x, y + 2);
  } else {
    // quirky prop hat — abstract cone-ish but different colors/angle from the ref
    ctx.beginPath();
    ctx.moveTo(cx - 55, cy - r + 10);
    ctx.lineTo(cx + 10, cy - r - 130);
    ctx.lineTo(cx + 60, cy - r + 20);
    ctx.closePath();
    strokeFill(ctx, shade(accent, -5), 8);
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy - r - 40);
    ctx.lineTo(cx + 45, cy - r - 35);
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#f4f0e6";
    ctx.lineCap = "butt";
    ctx.stroke();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 6;
    ctx.stroke();
  }
  ctx.restore();
}

function drawAura(
  ctx: CanvasRenderingContext2D,
  traits: CharacterTraits,
  cx: number,
  cy: number,
) {
  const accent = traits.colors.accent;
  const secondary = traits.colors.secondary;
  ctx.save();
  ctx.globalAlpha = 0.45;

  if (traits.aura === "orbit" || traits.aura === "halo") {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 260, 70, -0.35, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = accent;
    ctx.stroke();
  } else if (traits.aura === "burst" || traits.aura === "spark") {
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 140, cy + Math.sin(a) * 140);
      ctx.lineTo(cx + Math.cos(a) * 250, cy + Math.sin(a) * 250);
      ctx.lineWidth = 6;
      ctx.strokeStyle = i % 2 ? accent : secondary;
      ctx.stroke();
    }
  } else if (traits.aura === "wave" || traits.aura === "ribbon") {
    ctx.beginPath();
    ctx.moveTo(cx - 240, cy + 40);
    ctx.bezierCurveTo(cx - 80, cy - 120, cx + 80, cy + 140, cx + 240, cy - 20);
    ctx.lineWidth = 18;
    ctx.strokeStyle = secondary;
    ctx.lineCap = "round";
    ctx.stroke();
  } else {
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, 120 + i * 40, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = i % 2 ? accent : secondary;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  traits: CharacterTraits,
) {
  const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  g.addColorStop(0, shade(traits.colors.paper, 4));
  g.addColorStop(0.55, shade(traits.colors.secondary, 28));
  g.addColorStop(1, shade(traits.colors.primary, 22));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // soft vignette panel like a portrait plate
  roundRect(ctx, 48, 48, SIZE - 96, SIZE - 96, 28);
  ctx.fillStyle = shade(traits.colors.paper, 2);
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#111111";
  ctx.stroke();
}

/**
 * Cel-shaded “cooler art” portrait from forged traits.
 * Style cues only (bold ink, flat shade, distressed shirt) — original creatures.
 */
export function renderCoolArtToCanvas(
  traits: CharacterTraits,
  canvas?: HTMLCanvasElement,
): HTMLCanvasElement {
  const el = canvas ?? document.createElement("canvas");
  el.width = SIZE;
  el.height = SIZE;
  const ctx = el.getContext("2d");
  if (!ctx) return el;

  const stanceY =
    traits.stance === "float" ? -30 : traits.stance === "crouch" ? 36 : 0;
  const lean = traits.stance === "lean" ? -18 : traits.stance === "stride" ? 14 : 0;

  drawBackdrop(ctx, traits);

  const cx = SIZE / 2 + lean;
  const cy = 430 + stanceY;
  const headR = 150;

  drawAura(ctx, traits, cx, cy);
  drawBody(ctx, traits, cx, cy + 20);
  drawHead(ctx, traits, cx, cy - 120, headR, traits.colors.skin);
  drawEyes(ctx, traits, cx, cy - 120, headR);
  drawMouth(ctx, traits, cx, cy - 120, headR);
  drawAccessory(ctx, traits, cx, cy - 120, headR);

  // floating glyphs
  ctx.save();
  ctx.font = "600 42px Georgia, serif";
  ctx.fillStyle = traits.colors.ink;
  ctx.globalAlpha = 0.55;
  traits.glyphs.slice(0, 4).forEach((g, i) => {
    const a = -0.8 + i * 0.55;
    ctx.fillText(g, cx + Math.cos(a) * 280, cy - 40 + Math.sin(a) * 120);
  });
  ctx.restore();

  // labels
  ctx.save();
  ctx.fillStyle = traits.colors.ink;
  ctx.font = "700 36px Syne, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(traits.name, 80, SIZE - 100);
  ctx.font = "500 22px ui-monospace, monospace";
  ctx.globalAlpha = 0.7;
  ctx.fillText(`${traits.rarity} · ${traits.archetype}`, 80, SIZE - 64);
  const formula =
    traits.formula.length > 42 ? `${traits.formula.slice(0, 40)}…` : traits.formula;
  ctx.fillText(formula, 80, SIZE - 34);
  ctx.restore();

  return el;
}

export function coolArtToDataUrl(traits: CharacterTraits): string {
  return renderCoolArtToCanvas(traits).toDataURL("image/png");
}

export function downloadCoolArtPng(traits: CharacterTraits): void {
  const canvas = renderCoolArtToCanvas(traits);
  const slug = traits.name.toLowerCase().replace(/\s+/g, "-");
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-cooler-art.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

import type { CharacterTraits } from "./traits";
import { createRng } from "./rng";

/**
 * Cooler art = SAME forged character layout as renderCharacterSvg,
 * just higher-res with lighting / gradients / depth.
 * Coordinates are 640-space (forge art), scaled up for export.
 */
const BASE = 640;
const SIZE = 1024;
const S = SIZE / BASE;

function parseHsl(input: string): { h: number; s: number; l: number } {
  const m = input.match(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)/i);
  if (!m) return { h: 200, s: 35, l: 55 };
  return { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) };
}

function cssHsl(input: string, a = 1): string {
  const { h, s, l } = parseHsl(input);
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

function shadeCss(input: string, dl: number, a = 1): string {
  const { h, s, l } = parseHsl(input);
  return `hsla(${h}, ${s}%, ${Math.max(5, Math.min(95, l + dl))}%, ${a})`;
}

function headPath(
  ctx: CanvasRenderingContext2D,
  kind: string,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.beginPath();
  if (kind === "diamond") {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.85, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r * 0.85, cy);
    ctx.closePath();
  } else if (kind === "hex") {
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (kind === "soft-square") {
    const s = r * 0.9;
    ctx.moveTo(cx - s, cy - s * 0.7);
    ctx.quadraticCurveTo(cx - s, cy - s, cx - s * 0.7, cy - s);
    ctx.lineTo(cx + s * 0.7, cy - s);
    ctx.quadraticCurveTo(cx + s, cy - s, cx + s, cy - s * 0.7);
    ctx.lineTo(cx + s, cy + s * 0.7);
    ctx.quadraticCurveTo(cx + s, cy + s, cx + s * 0.7, cy + s);
    ctx.lineTo(cx - s * 0.7, cy + s);
    ctx.quadraticCurveTo(cx - s, cy + s, cx - s, cy + s * 0.7);
    ctx.closePath();
  } else if (kind === "oval") {
    ctx.ellipse(cx, cy, r * 0.85, r * 1.15, 0, 0, Math.PI * 2);
  } else if (kind === "triangle") {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy + r * 0.85);
    ctx.lineTo(cx - r, cy + r * 0.85);
    ctx.closePath();
  } else {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
}

function fillStroke(
  ctx: CanvasRenderingContext2D,
  fill: string | CanvasGradient,
  ink: string,
  line = 4,
) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = line;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  style: string,
  x: number,
  y: number,
  ink: string,
  accent: string,
) {
  ctx.save();
  if (style === "almond") {
    ctx.beginPath();
    ctx.ellipse(x, y, 16, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = ink;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 3, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
  } else if (style === "ring") {
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
  } else if (style === "slash") {
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 8);
    ctx.lineTo(x + 12, y - 8);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.stroke();
  } else if (style === "plus") {
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x + 12, y);
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x, y + 12);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();
  } else if (style === "spiral") {
    ctx.beginPath();
    for (let i = 0; i < 36; i++) {
      const t = i / 36;
      const a = t * Math.PI * 3.4;
      const rad = 3 + t * 14;
      const px = x + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (style === "square") {
    ctx.fillStyle = ink;
    ctx.fillRect(x - 11, y - 11, 22, 22);
    ctx.fillStyle = accent;
    ctx.fillRect(x - 4, y - 4, 8, 8);
  } else if (style === "asym") {
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = ink;
    ctx.fill();
    ctx.fillRect(x + 28, y - 14, 18, 28);
  } else {
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = ink;
    ctx.fill();
  }
  ctx.restore();
}

function drawMouth(
  ctx: CanvasRenderingContext2D,
  style: string,
  cx: number,
  cy: number,
  ink: string,
) {
  if (style === "none") return;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (style === "curve") {
    ctx.moveTo(cx - 22, cy);
    ctx.quadraticCurveTo(cx, cy + 18, cx + 22, cy);
  } else if (style === "zigzag") {
    ctx.moveTo(cx - 24, cy);
    ctx.lineTo(cx - 12, cy + 10);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + 12, cy + 10);
    ctx.lineTo(cx + 24, cy);
  } else if (style === "box") {
    ctx.strokeRect(cx - 18, cy - 6, 36, 14);
    return;
  } else if (style === "tilde") {
    ctx.moveTo(cx - 24, cy);
    ctx.quadraticCurveTo(cx - 16, cy - 12, cx - 8, cy);
    ctx.quadraticCurveTo(cx, cy + 12, cx + 8, cy);
    ctx.quadraticCurveTo(cx + 16, cy - 12, cx + 24, cy);
  } else {
    ctx.moveTo(cx - 20, cy);
    ctx.lineTo(cx + 20, cy);
  }
  ctx.stroke();
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  pattern: string,
  color: string,
  seed: number,
) {
  const rng = createRng(seed ^ 0xabc123);
  if (pattern === "dots") {
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(rng.next() * BASE, rng.next() * BASE, 1.5 + rng.next() * 4, 0, Math.PI * 2);
      ctx.fillStyle = cssHsl(color, 0.12 + rng.next() * 0.2);
      ctx.fill();
    }
  } else if (pattern === "stripes") {
    for (let i = 0; i < 18; i++) {
      const x = i * 40 - 20;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 24, 0);
      ctx.lineTo(x + 24 + BASE, BASE);
      ctx.lineTo(x + BASE, BASE);
      ctx.closePath();
      ctx.fillStyle = cssHsl(color, 0.08);
      ctx.fill();
    }
  } else if (pattern === "chevrons") {
    ctx.strokeStyle = cssHsl(color, 0.15);
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const y = 40 + i * 50;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(320, y - 18);
      ctx.lineTo(600, y);
      ctx.stroke();
    }
  } else if (pattern === "cells") {
    ctx.strokeStyle = cssHsl(color, 0.14);
    ctx.lineWidth = 1.5;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        ctx.strokeRect(40 + col * 70, 40 + row * 70, 54, 54);
      }
    }
  } else if (pattern === "rings") {
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(320, 300, 60 + i * 45, 0, Math.PI * 2);
      ctx.strokeStyle = cssHsl(color, 0.08 + i * 0.02);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  } else if (pattern === "lattice") {
    ctx.strokeStyle = cssHsl(color, 0.1);
    ctx.lineWidth = 1;
    for (let x = 30; x < BASE; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 620);
      ctx.stroke();
    }
    for (let y = 30; y < BASE; y += 36) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(620, y);
      ctx.stroke();
    }
  } else if (pattern === "scanlines") {
    ctx.strokeStyle = cssHsl(color, 0.1);
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      const y = 20 + i * 16;
      ctx.beginPath();
      ctx.moveTo(24, y);
      ctx.lineTo(616, y);
      ctx.stroke();
    }
  } else {
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = cssHsl(color, 0.08 + rng.next() * 0.18);
      ctx.fillRect(rng.next() * BASE, rng.next() * BASE, 1 + rng.next() * 3, 1 + rng.next() * 3);
    }
  }
}

function drawAura(
  ctx: CanvasRenderingContext2D,
  aura: string,
  cx: number,
  cy: number,
  accent: string,
  secondary: string,
  seed: number,
) {
  const rng = createRng(seed ^ 0x55aa);
  if (aura === "orbit") {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-18 * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, 150, 48, 0, 0, Math.PI * 2);
    ctx.strokeStyle = cssHsl(accent, 0.55);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.rotate((50 * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, 120, 36, 0, 0, Math.PI * 2);
    ctx.strokeStyle = cssHsl(secondary, 0.4);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx + 145, cy - 40, 7, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
  } else if (aura === "wave") {
    for (let i = 0; i < 4; i++) {
      const y = cy - 90 + i * 55;
      ctx.beginPath();
      ctx.moveTo(cx - 160, y);
      for (let t = 0; t < 4; t++) {
        ctx.quadraticCurveTo(cx - 120 + t * 80, y - 24, cx - 80 + t * 80, y);
      }
      ctx.strokeStyle = cssHsl(i % 2 ? accent : secondary, 0.35);
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  } else if (aura === "grid") {
    ctx.strokeStyle = cssHsl(accent, 0.35);
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 130, cy - 130, 260, 260);
    ctx.beginPath();
    ctx.moveTo(cx, cy - 130);
    ctx.lineTo(cx, cy + 130);
    ctx.moveTo(cx - 130, cy);
    ctx.lineTo(cx + 130, cy);
    ctx.stroke();
  } else if (aura === "spark") {
    for (let i = 0; i < 14; i++) {
      const a = rng.next() * Math.PI * 2;
      const d = 110 + rng.next() * 70;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 70, cy + Math.sin(a) * 70);
      ctx.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d);
      ctx.strokeStyle = cssHsl(accent, 0.45);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  } else if (aura === "halo") {
    ctx.beginPath();
    ctx.arc(cx, cy - 150, 54, 0, Math.PI * 2);
    ctx.strokeStyle = cssHsl(accent, 0.55);
    ctx.lineWidth = 8;
    ctx.stroke();
  } else if (aura === "moire") {
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(cx + (i % 2 ? 8 : -8), cy, 70 + i * 18, 0, Math.PI * 2);
      ctx.strokeStyle = cssHsl(i % 2 ? accent : secondary, 0.28);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  } else if (aura === "burst") {
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI * 2 * i) / 16;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 90, cy + Math.sin(a) * 90);
      ctx.lineTo(cx + Math.cos(a) * 170, cy + Math.sin(a) * 170);
      ctx.strokeStyle = cssHsl(accent, 0.35);
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - 170, cy + 40);
    ctx.bezierCurveTo(cx - 80, cy - 120, cx + 80, cy + 120, cx + 170, cy - 20);
    ctx.strokeStyle = cssHsl(secondary, 0.35);
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

function drawAccessory(
  ctx: CanvasRenderingContext2D,
  accessory: string,
  cx: number,
  cy: number,
  accent: string,
  ink: string,
) {
  ctx.save();
  ctx.font = "18px Georgia, serif";
  ctx.textAlign = "center";

  if (accessory.includes("crown")) {
    ctx.beginPath();
    ctx.moveTo(cx - 48, cy - 118);
    ctx.lineTo(cx - 30, cy - 150);
    ctx.lineTo(cx - 10, cy - 122);
    ctx.lineTo(cx, cy - 158);
    ctx.lineTo(cx + 10, cy - 122);
    ctx.lineTo(cx + 30, cy - 150);
    ctx.lineTo(cx + 48, cy - 118);
    ctx.closePath();
    fillStroke(ctx, accent, ink, 2);
    ctx.fillStyle = ink;
    ctx.font = "18px Georgia, serif";
    ctx.fillText("π", cx, cy - 128);
  } else if (accessory.includes("staff")) {
    ctx.beginPath();
    ctx.moveTo(cx + 110, cy - 160);
    ctx.lineTo(cx + 110, cy + 160);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font = "28px Georgia, serif";
    ctx.fillText("∑", cx + 110, cy - 170);
  } else if (accessory.includes("scarf")) {
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy + 40);
    ctx.bezierCurveTo(cx - 20, cy + 90, cx + 40, cy + 20, cx + 90, cy + 110);
    ctx.strokeStyle = cssHsl(accent, 0.85);
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.font = "26px Georgia, serif";
    ctx.fillText("∞", cx + 100, cy + 130);
  } else if (accessory.includes("pendant")) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + 55);
    ctx.lineTo(cx, cy + 95);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + 95);
    ctx.lineTo(cx + 18, cy + 125);
    ctx.lineTo(cx, cy + 145);
    ctx.lineTo(cx - 18, cy + 125);
    ctx.closePath();
    fillStroke(ctx, accent, ink, 2);
  } else if (accessory.includes("spear")) {
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy + 150);
    ctx.lineTo(cx - 120, cy - 150);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy - 150);
    ctx.lineTo(cx - 100, cy - 110);
    ctx.lineTo(cx - 140, cy - 110);
    ctx.closePath();
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.font = "22px Georgia, serif";
    ctx.fillText("√", cx - 120, cy - 165);
  } else if (accessory.includes("lens")) {
    ctx.beginPath();
    ctx.arc(cx + 70, cy - 10, 28, 0, Math.PI * 2);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 70, cy - 10, 10, 0, Math.PI * 2);
    ctx.fillStyle = cssHsl(accent, 0.35);
    ctx.fill();
  } else if (accessory.includes("collar")) {
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy + 50);
    ctx.quadraticCurveTo(cx, cy + 85, cx + 60, cy + 50);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();
  } else if (accessory.includes("hood")) {
    ctx.beginPath();
    ctx.moveTo(cx - 78, cy - 20);
    ctx.quadraticCurveTo(cx - 90, cy - 120, cx, cy - 150);
    ctx.quadraticCurveTo(cx + 90, cy - 120, cx + 78, cy - 20);
    ctx.fillStyle = cssHsl(accent, 0.35);
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (accessory.includes("cape")) {
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy + 30);
    ctx.bezierCurveTo(cx - 160, cy + 40, cx - 150, cy + 200, cx - 20, cy + 210);
    ctx.lineTo(cx + 10, cy + 40);
    ctx.closePath();
    ctx.fillStyle = cssHsl(accent, 0.45);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(cx + 95, cy + 70, 22, 0, Math.PI * 2);
    fillStroke(ctx, accent, ink, 2);
    ctx.fillStyle = ink;
    ctx.font = "16px Georgia, serif";
    ctx.fillText("ℵ", cx + 95, cy + 77);
  }
  ctx.restore();
}

/** Same forged character as the SVG preview — upgraded lighting & depth. */
export function renderCoolArt(traits: CharacterTraits): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Draw in forge coordinate space, then we scale the whole canvas via transform
  ctx.scale(S, S);

  const { colors } = traits;
  const rng = createRng(traits.seed ^ 0xc0ffee);
  const cx = 320;
  const cy = 290;
  const stanceY =
    traits.stance === "float"
      ? -18
      : traits.stance === "crouch"
        ? 22
        : traits.stance === "lean"
          ? 8
          : 0;
  const lean =
    traits.stance === "lean" ? -8 : traits.stance === "stride" ? 6 : 0;

  // Solid brand canvas #ccff00
  ctx.fillStyle = "#ccff00";
  ctx.fillRect(0, 0, BASE, BASE);

  // faint pattern under the figure (keeps seed variation without changing the canvas color)
  ctx.globalAlpha = 0.12;
  drawPattern(ctx, traits.pattern, colors.ink, traits.seed);
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(lean, stanceY);

  drawAura(ctx, traits.aura, cx, cy, colors.accent, colors.secondary, traits.seed);

  // soft ground shadow under body
  ctx.beginPath();
  ctx.ellipse(cx, cy + 250, 90, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = cssHsl(colors.ink, 0.12);
  ctx.fill();

  // --- body (same ellipse) with volume ---
  ctx.beginPath();
  ctx.ellipse(cx, cy + 145, 78, 100, 0, 0, Math.PI * 2);
  const bodyGrad = ctx.createLinearGradient(cx - 78, cy + 60, cx + 78, cy + 240);
  bodyGrad.addColorStop(0, shadeCss(colors.primary, 12));
  bodyGrad.addColorStop(0.45, colors.primary);
  bodyGrad.addColorStop(1, shadeCss(colors.primary, -18));
  ctx.shadowColor = cssHsl(colors.ink, 0.22);
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;
  fillStroke(ctx, bodyGrad, colors.ink, 3.5);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // secondary wash (same as forge opacity overlay)
  ctx.beginPath();
  ctx.ellipse(cx, cy + 145, 78, 100, 0, 0, Math.PI * 2);
  ctx.fillStyle = cssHsl(colors.secondary, 0.28);
  ctx.fill();

  // body highlight rim
  ctx.beginPath();
  ctx.ellipse(cx - 22, cy + 110, 28, 48, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fill();

  // --- arms (same paths, slightly thicker + gradient stroke via layered) ---
  const arm = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x1, y1, x2, y2);
    ctx.strokeStyle = shadeCss(colors.primary, -14);
    ctx.lineWidth = 30;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x1, y1, x2, y2);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 26;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x1 - 4, y1 - 6, x2 - 2, y2 - 4);
    ctx.strokeStyle = shadeCss(colors.primary, 16, 0.55);
    ctx.lineWidth = 10;
    ctx.stroke();
  };
  arm(cx - 70, cy + 90, cx - 130, cy + 120, cx - 115, cy + 180);
  arm(cx + 70, cy + 90, cx + 130, cy + 110, cx + 120, cy + 175);

  // --- head (same shape + size) ---
  headPath(ctx, traits.head, cx, cy - 20, 92);
  const headGrad = ctx.createLinearGradient(cx - 90, cy - 110, cx + 90, cy + 70);
  headGrad.addColorStop(0, shadeCss(colors.skin, 14));
  headGrad.addColorStop(0.5, colors.skin);
  headGrad.addColorStop(1, shadeCss(colors.skin, -14));
  ctx.shadowColor = cssHsl(colors.ink, 0.2);
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;
  fillStroke(ctx, headGrad, colors.ink, 4);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // accent wash (forge uses 0.12)
  headPath(ctx, traits.head, cx, cy - 20, 92);
  ctx.fillStyle = cssHsl(colors.accent, 0.12);
  ctx.fill();

  // glossy highlight clipped to head
  ctx.save();
  headPath(ctx, traits.head, cx, cy - 20, 92);
  ctx.clip();
  ctx.beginPath();
  ctx.ellipse(cx - 30, cy - 55, 36, 22, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fill();
  ctx.restore();

  // face — same positions as forge
  drawEyes(ctx, traits.eyes, cx - 28, cy - 30, colors.ink, colors.accent);
  if (traits.eyes !== "asym") {
    drawEyes(ctx, traits.eyes, cx + 28, cy - 30, colors.ink, colors.accent);
  }
  drawMouth(ctx, traits.mouth, cx, cy + 18, colors.ink);

  drawAccessory(ctx, traits.accessory, cx, cy - 20, colors.accent, colors.ink);

  // floating glyphs — same placement logic as forge
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  traits.glyphs.forEach((g, i) => {
    const a = (Math.PI * 2 * i) / traits.glyphs.length + rng.next();
    const r = 175 + rng.next() * 40;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 0.75;
    ctx.font = `${22 + rng.int(0, 14)}px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle = cssHsl(colors.ink, 0.55);
    ctx.fillText(g, x, y);
  });

  ctx.restore(); // lean/stance

  // formula bar
  const formulaLabel =
    traits.formula.length > 42
      ? `${traits.formula.slice(0, 40)}…`
      : traits.formula;
  ctx.fillStyle = cssHsl(colors.ink, 0.08);
  roundRect(ctx, 36, 36, 568, 54, 12);
  ctx.fill();
  ctx.fillStyle = colors.ink;
  ctx.font = "22px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(formulaLabel, 56, 70);

  // result echo
  [...traits.resultEcho].forEach((d, i) => {
    const x = 70 + i * 62;
    const y = 560 + (i % 2 === 0 ? -6 : 6);
    ctx.font = "18px ui-monospace, monospace";
    ctx.fillStyle = cssHsl(colors.ink, 0.35);
    ctx.fillText(d, x, y);
  });

  // footer
  ctx.font = "14px Georgia, serif";
  ctx.fillStyle = cssHsl(colors.ink, 0.55);
  ctx.fillText(`${traits.name} · ${traits.rarity}`, 56, 610);
  ctx.font = "12px ui-monospace, monospace";
  ctx.textAlign = "end";
  ctx.fillStyle = cssHsl(colors.ink, 0.4);
  ctx.fillText(`#${traits.seed.toString(16)}`, 584, 610);

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function coolArtToDataUrl(traits: CharacterTraits): string {
  return renderCoolArt(traits).toDataURL("image/png");
}

export function downloadCoolArt(traits: CharacterTraits) {
  const url = coolArtToDataUrl(traits);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${traits.name.toLowerCase().replace(/\s+/g, "-")}-cool-art.png`;
  a.click();
}

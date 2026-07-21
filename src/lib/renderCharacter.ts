import type { CharacterTraits } from "./traits";
import { createRng } from "./rng";

const SIZE = 640;

function esc(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function headPath(kind: string, cx: number, cy: number, r: number): string {
  switch (kind) {
    case "diamond":
      return `M ${cx} ${cy - r} L ${cx + r * 0.85} ${cy} L ${cx} ${cy + r} L ${cx - r * 0.85} ${cy} Z`;
    case "hex": {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
      });
      return `M ${pts.join(" L ")} Z`;
    }
    case "soft-square": {
      const s = r * 0.9;
      return `M ${cx - s} ${cy - s * 0.7} Q ${cx - s} ${cy - s} ${cx - s * 0.7} ${cy - s} L ${cx + s * 0.7} ${cy - s} Q ${cx + s} ${cy - s} ${cx + s} ${cy - s * 0.7} L ${cx + s} ${cy + s * 0.7} Q ${cx + s} ${cy + s} ${cx + s * 0.7} ${cy + s} L ${cx - s * 0.7} ${cy + s} Q ${cx - s} ${cy + s} ${cx - s} ${cy + s * 0.7} Z`;
    }
    case "oval":
      return `M ${cx} ${cy - r * 1.15} A ${r * 0.85} ${r * 1.15} 0 1 1 ${cx - 0.01} ${cy - r * 1.15} Z`;
    case "triangle":
      return `M ${cx} ${cy - r} L ${cx + r} ${cy + r * 0.85} L ${cx - r} ${cy + r * 0.85} Z`;
    default:
      return `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx + r - 0.01} ${cy} Z`;
  }
}

function eyeMark(
  style: string,
  x: number,
  y: number,
  ink: string,
  accent: string,
): string {
  switch (style) {
    case "almond":
      return `<ellipse cx="${x}" cy="${y}" rx="16" ry="10" fill="${ink}" /><circle cx="${x + 3}" cy="${y}" r="4" fill="${accent}" />`;
    case "ring":
      return `<circle cx="${x}" cy="${y}" r="12" fill="none" stroke="${ink}" stroke-width="4" /><circle cx="${x}" cy="${y}" r="4" fill="${accent}" />`;
    case "slash":
      return `<path d="M ${x - 12} ${y + 8} L ${x + 12} ${y - 8}" stroke="${ink}" stroke-width="5" stroke-linecap="round" />`;
    case "plus":
      return `<path d="M ${x - 12} ${y} H ${x + 12} M ${x} ${y - 12} V ${y + 12}" stroke="${ink}" stroke-width="4" stroke-linecap="round" />`;
    case "spiral":
      return `<path d="M ${x} ${y} m -10 0 a 10 10 0 1 0 20 0 a 6 6 0 1 1 -12 0" fill="none" stroke="${ink}" stroke-width="3" />`;
    case "square":
      return `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="3" fill="${ink}" /><rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="${accent}" />`;
    case "asym":
      return `<circle cx="${x}" cy="${y}" r="8" fill="${ink}" /><rect x="${x + 28}" y="${y - 14}" width="18" height="28" rx="4" fill="${ink}" />`;
    default:
      return `<circle cx="${x}" cy="${y}" r="7" fill="${ink}" />`;
  }
}

function mouthMark(style: string, cx: number, cy: number, ink: string): string {
  switch (style) {
    case "curve":
      return `<path d="M ${cx - 22} ${cy} Q ${cx} ${cy + 18} ${cx + 22} ${cy}" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" />`;
    case "zigzag":
      return `<path d="M ${cx - 24} ${cy} L ${cx - 12} ${cy + 10} L ${cx} ${cy} L ${cx + 12} ${cy + 10} L ${cx + 24} ${cy}" fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />`;
    case "box":
      return `<rect x="${cx - 18}" y="${cy - 6}" width="36" height="14" rx="3" fill="none" stroke="${ink}" stroke-width="3" />`;
    case "tilde":
      return `<path d="M ${cx - 24} ${cy} q 8 -12 16 0 t 16 0" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" />`;
    case "none":
      return "";
    default:
      return `<path d="M ${cx - 20} ${cy} H ${cx + 20}" stroke="${ink}" stroke-width="4" stroke-linecap="round" />`;
  }
}

function patternLayer(
  pattern: string,
  color: string,
  seed: number,
): string {
  const rng = createRng(seed ^ 0xabc123);
  if (pattern === "dots") {
    return Array.from({ length: 40 }, () => {
      const x = rng.next() * SIZE;
      const y = rng.next() * SIZE;
      const r = 1.5 + rng.next() * 4;
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${0.12 + rng.next() * 0.2}" />`;
    }).join("");
  }
  if (pattern === "stripes") {
    return Array.from({ length: 18 }, (_, i) => {
      const x = i * 40 - 20;
      return `<path d="M ${x} 0 L ${x + 24} 0 L ${x + 24 + SIZE} ${SIZE} L ${x + SIZE} ${SIZE} Z" fill="${color}" opacity="0.08" />`;
    }).join("");
  }
  if (pattern === "chevrons") {
    return Array.from({ length: 12 }, (_, i) => {
      const y = 40 + i * 50;
      return `<path d="M 40 ${y} L 320 ${y - 18} L 600 ${y}" fill="none" stroke="${color}" stroke-width="3" opacity="0.15" />`;
    }).join("");
  }
  if (pattern === "cells") {
    return Array.from({ length: 8 }, (_, row) =>
      Array.from({ length: 8 }, (_, col) => {
        const x = 40 + col * 70;
        const y = 40 + row * 70;
        return `<rect x="${x}" y="${y}" width="54" height="54" rx="8" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.14" />`;
      }).join(""),
    ).join("");
  }
  if (pattern === "rings") {
    return Array.from({ length: 6 }, (_, i) => {
      const r = 60 + i * 45;
      return `<circle cx="320" cy="300" r="${r}" fill="none" stroke="${color}" stroke-width="2" opacity="${0.08 + i * 0.02}" />`;
    }).join("");
  }
  if (pattern === "lattice") {
    let out = "";
    for (let x = 30; x < SIZE; x += 36) {
      out += `<path d="M ${x} 20 V 620" stroke="${color}" stroke-width="1" opacity="0.1" />`;
    }
    for (let y = 30; y < SIZE; y += 36) {
      out += `<path d="M 20 ${y} H 620" stroke="${color}" stroke-width="1" opacity="0.1" />`;
    }
    return out;
  }
  if (pattern === "scanlines") {
    return Array.from({ length: 40 }, (_, i) => {
      const y = 20 + i * 16;
      return `<path d="M 24 ${y} H 616" stroke="${color}" stroke-width="1" opacity="0.1" />`;
    }).join("");
  }
  // noise
  return Array.from({ length: 80 }, () => {
    const x = rng.next() * SIZE;
    const y = rng.next() * SIZE;
    return `<rect x="${x}" y="${y}" width="${1 + rng.next() * 3}" height="${1 + rng.next() * 3}" fill="${color}" opacity="${0.08 + rng.next() * 0.18}" />`;
  }).join("");
}

function auraLayer(
  aura: string,
  cx: number,
  cy: number,
  accent: string,
  secondary: string,
  seed: number,
): string {
  const rng = createRng(seed ^ 0x55aa);
  if (aura === "orbit") {
    return `
      <ellipse cx="${cx}" cy="${cy}" rx="150" ry="48" fill="none" stroke="${accent}" stroke-width="3" opacity="0.55" transform="rotate(-18 ${cx} ${cy})" />
      <ellipse cx="${cx}" cy="${cy}" rx="120" ry="36" fill="none" stroke="${secondary}" stroke-width="2" opacity="0.4" transform="rotate(32 ${cx} ${cy})" />
      <circle cx="${cx + 145}" cy="${cy - 40}" r="7" fill="${accent}" />
    `;
  }
  if (aura === "wave") {
    return Array.from({ length: 4 }, (_, i) => {
      const y = cy - 90 + i * 55;
      return `<path d="M ${cx - 160} ${y} q 40 -24 80 0 t 80 0 t 80 0 t 80 0" fill="none" stroke="${i % 2 ? accent : secondary}" stroke-width="3" opacity="0.35" />`;
    }).join("");
  }
  if (aura === "grid") {
    return `<g opacity="0.35" stroke="${accent}" fill="none" stroke-width="2">
      <rect x="${cx - 130}" y="${cy - 130}" width="260" height="260" rx="24" />
      <path d="M ${cx} ${cy - 130} V ${cy + 130} M ${cx - 130} ${cy} H ${cx + 130}" />
    </g>`;
  }
  if (aura === "spark") {
    return Array.from({ length: 14 }, () => {
      const a = rng.next() * Math.PI * 2;
      const d = 110 + rng.next() * 70;
      const x2 = cx + Math.cos(a) * d;
      const y2 = cy + Math.sin(a) * d;
      return `<path d="M ${cx + Math.cos(a) * 70} ${cy + Math.sin(a) * 70} L ${x2} ${y2}" stroke="${accent}" stroke-width="2" opacity="0.45" />`;
    }).join("");
  }
  if (aura === "halo") {
    return `<circle cx="${cx}" cy="${cy - 150}" r="54" fill="none" stroke="${accent}" stroke-width="8" opacity="0.55" />`;
  }
  if (aura === "moire") {
    return Array.from({ length: 7 }, (_, i) => {
      const r = 70 + i * 18;
      return `<circle cx="${cx + (i % 2 ? 8 : -8)}" cy="${cy}" r="${r}" fill="none" stroke="${i % 2 ? accent : secondary}" stroke-width="2" opacity="0.28" />`;
    }).join("");
  }
  if (aura === "burst") {
    return Array.from({ length: 16 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 16;
      return `<path d="M ${cx + Math.cos(a) * 90} ${cy + Math.sin(a) * 90} L ${cx + Math.cos(a) * 170} ${cy + Math.sin(a) * 170}" stroke="${accent}" stroke-width="3" opacity="0.35" />`;
    }).join("");
  }
  // ribbon
  return `<path d="M ${cx - 170} ${cy + 40} C ${cx - 80} ${cy - 120}, ${cx + 80} ${cy + 120}, ${cx + 170} ${cy - 20}" fill="none" stroke="${secondary}" stroke-width="14" stroke-linecap="round" opacity="0.35" />`;
}

function accessoryLayer(
  accessory: string,
  cx: number,
  cy: number,
  accent: string,
  ink: string,
): string {
  if (accessory.includes("crown")) {
    return `<g fill="${accent}" stroke="${ink}" stroke-width="2">
      <path d="M ${cx - 48} ${cy - 118} L ${cx - 30} ${cy - 150} L ${cx - 10} ${cy - 122} L ${cx} ${cy - 158} L ${cx + 10} ${cy - 122} L ${cx + 30} ${cy - 150} L ${cx + 48} ${cy - 118} Z" />
      <text x="${cx}" y="${cy - 128}" text-anchor="middle" font-size="18" fill="${ink}" font-family="Georgia, serif">π</text>
    </g>`;
  }
  if (accessory.includes("staff")) {
    return `<g stroke="${ink}" stroke-width="5" stroke-linecap="round">
      <path d="M ${cx + 110} ${cy - 160} V ${cy + 160}" />
      <text x="${cx + 110}" y="${cy - 170}" text-anchor="middle" font-size="28" fill="${accent}" stroke="none" font-family="Georgia, serif">∑</text>
    </g>`;
  }
  if (accessory.includes("scarf")) {
    return `<path d="M ${cx - 70} ${cy + 40} C ${cx - 20} ${cy + 90}, ${cx + 40} ${cy + 20}, ${cx + 90} ${cy + 110}" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round" opacity="0.85" />
      <text x="${cx + 100}" y="${cy + 130}" font-size="26" fill="${ink}" font-family="Georgia, serif">∞</text>`;
  }
  if (accessory.includes("pendant")) {
    return `<path d="M ${cx} ${cy + 55} L ${cx} ${cy + 95}" stroke="${ink}" stroke-width="3" />
      <path d="M ${cx} ${cy + 95} L ${cx + 18} ${cy + 125} L ${cx} ${cy + 145} L ${cx - 18} ${cy + 125} Z" fill="${accent}" stroke="${ink}" stroke-width="2" />`;
  }
  if (accessory.includes("spear")) {
    return `<path d="M ${cx - 120} ${cy + 150} L ${cx - 120} ${cy - 150}" stroke="${ink}" stroke-width="4" />
      <path d="M ${cx - 120} ${cy - 150} L ${cx - 100} ${cy - 110} L ${cx - 140} ${cy - 110} Z" fill="${accent}" />
      <text x="${cx - 120}" y="${cy - 165}" text-anchor="middle" font-size="22" fill="${ink}" font-family="Georgia, serif">√</text>`;
  }
  if (accessory.includes("lens")) {
    return `<circle cx="${cx + 70}" cy="${cy - 10}" r="28" fill="none" stroke="${accent}" stroke-width="6" />
      <circle cx="${cx + 70}" cy="${cy - 10}" r="10" fill="${accent}" opacity="0.35" />`;
  }
  if (accessory.includes("collar")) {
    return `<path d="M ${cx - 60} ${cy + 50} Q ${cx} ${cy + 85} ${cx + 60} ${cy + 50}" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round" />`;
  }
  if (accessory.includes("hood")) {
    return `<path d="M ${cx - 78} ${cy - 20} Q ${cx - 90} ${cy - 120} ${cx} ${cy - 150} Q ${cx + 90} ${cy - 120} ${cx + 78} ${cy - 20}" fill="${accent}" opacity="0.35" stroke="${ink}" stroke-width="3" />`;
  }
  if (accessory.includes("cape")) {
    return `<path d="M ${cx - 40} ${cy + 30} C ${cx - 160} ${cy + 40}, ${cx - 150} ${cy + 200}, ${cx - 20} ${cy + 210} L ${cx + 10} ${cy + 40} Z" fill="${accent}" opacity="0.45" />`;
  }
  return `<circle cx="${cx + 95}" cy="${cy + 70}" r="22" fill="${accent}" stroke="${ink}" stroke-width="2" />
    <text x="${cx + 95}" y="${cy + 77}" text-anchor="middle" font-size="16" fill="${ink}" font-family="Georgia, serif">ℵ</text>`;
}

/**
 * Procedural character SVG. Same traits → identical bytes, so remints stay verifiable.
 */
export function renderCharacterSvg(traits: CharacterTraits): string {
  const rng = createRng(traits.seed ^ 0xC0FFEE);
  const { colors } = traits;
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

  const floatingGlyphs = traits.glyphs
    .map((g, i) => {
      const a = (Math.PI * 2 * i) / traits.glyphs.length + rng.next();
      const r = 175 + rng.next() * 40;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.75;
      return `<text x="${x}" y="${y}" text-anchor="middle" font-size="${22 + rng.int(0, 14)}" fill="${colors.ink}" opacity="0.55" font-family="Georgia, 'Times New Roman', serif">${esc(g)}</text>`;
    })
    .join("");

  const resultBits = [...traits.resultEcho].map((d, i) => {
    const x = 70 + i * 62;
    const y = 560 + (i % 2 === 0 ? -6 : 6);
    return `<text x="${x}" y="${y}" font-size="18" fill="${colors.ink}" opacity="0.35" font-family="ui-monospace, monospace">${esc(d)}</text>`;
  }).join("");

  const formulaLabel =
    traits.formula.length > 42
      ? `${traits.formula.slice(0, 40)}…`
      : traits.formula;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="${esc(traits.name)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.paper}" />
      <stop offset="55%" stop-color="${colors.secondary}" stop-opacity="0.22" />
      <stop offset="100%" stop-color="${colors.primary}" stop-opacity="0.28" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${colors.accent}" stop-opacity="0" />
    </radialGradient>
    <filter id="soft">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="${colors.ink}" flood-opacity="0.18" />
    </filter>
  </defs>

  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)" />
  ${patternLayer(traits.pattern, colors.ink, traits.seed)}

  <g transform="translate(${lean} ${stanceY})">
    ${auraLayer(traits.aura, cx, cy, colors.accent, colors.secondary, traits.seed)}

    <!-- body -->
    <ellipse cx="${cx}" cy="${cy + 145}" rx="78" ry="100" fill="${colors.primary}" filter="url(#soft)" />
    <ellipse cx="${cx}" cy="${cy + 145}" rx="78" ry="100" fill="${colors.secondary}" opacity="0.28" />

    <!-- arms -->
    <path d="M ${cx - 70} ${cy + 90} Q ${cx - 130} ${cy + 120} ${cx - 115} ${cy + 180}" fill="none" stroke="${colors.primary}" stroke-width="28" stroke-linecap="round" />
    <path d="M ${cx + 70} ${cy + 90} Q ${cx + 130} ${cy + 110} ${cx + 120} ${cy + 175}" fill="none" stroke="${colors.primary}" stroke-width="28" stroke-linecap="round" />

    <!-- head -->
    <path d="${headPath(traits.head, cx, cy - 20, 92)}" fill="${colors.skin}" stroke="${colors.ink}" stroke-width="4" filter="url(#soft)" />
    <path d="${headPath(traits.head, cx, cy - 20, 92)}" fill="${colors.accent}" opacity="0.12" />

    ${eyeMark(traits.eyes, cx - 28, cy - 30, colors.ink, colors.accent)}
    ${traits.eyes === "asym" ? "" : eyeMark(traits.eyes, cx + 28, cy - 30, colors.ink, colors.accent)}
    ${mouthMark(traits.mouth, cx, cy + 18, colors.ink)}

    ${accessoryLayer(traits.accessory, cx, cy - 20, colors.accent, colors.ink)}
    ${floatingGlyphs}
  </g>

  <!-- formula + result echo woven into the art -->
  <rect x="36" y="36" width="568" height="54" rx="12" fill="${colors.ink}" opacity="0.08" />
  <text x="56" y="70" font-size="22" fill="${colors.ink}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace">${esc(formulaLabel)}</text>
  ${resultBits}

  <text x="56" y="610" font-size="14" fill="${colors.ink}" opacity="0.55" font-family="Georgia, serif">${esc(traits.name)} · ${esc(traits.rarity)}</text>
  <text x="584" y="610" text-anchor="end" font-size="12" fill="${colors.ink}" opacity="0.4" font-family="ui-monospace, monospace">#${traits.seed.toString(16)}</text>
</svg>`;
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

import type { FormulaAnalysis } from "./formula";
import { createRng } from "./rng";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export type CharacterTraits = {
  seed: number;
  name: string;
  formula: string;
  rarity: Rarity;
  archetype: string;
  head: string;
  eyes: string;
  mouth: string;
  aura: string;
  accessory: string;
  pattern: string;
  stance: string;
  colors: {
    skin: string;
    primary: string;
    secondary: string;
    accent: string;
    ink: string;
    paper: string;
  };
  stats: {
    entropy: number;
    precision: number;
    chaos: number;
    elegance: number;
  };
  glyphs: string[];
  resultEcho: string;
  complexity: number;
};

const ARCHETYPES = [
  "Integral Sage",
  "Fractal Knight",
  "Chaos Sprite",
  "Prime Warden",
  "Vector Nomad",
  "Orbit Fox",
  "Series Moth",
  "Tensor Golem",
  "Limit Djinn",
  "Sigma Scout",
] as const;

const HEADS = [
  "round",
  "diamond",
  "hex",
  "soft-square",
  "oval",
  "triangle",
] as const;

const EYES = [
  "dot",
  "almond",
  "ring",
  "slash",
  "plus",
  "spiral",
  "square",
  "asym",
] as const;

const MOUTHS = ["line", "curve", "zigzag", "box", "none", "tilde"] as const;

const AURAS = [
  "orbit",
  "wave",
  "grid",
  "spark",
  "halo",
  "moire",
  "burst",
  "ribbon",
] as const;

const ACCESSORIES = [
  "π crown",
  "∑ staff",
  "∞ scarf",
  "Δ pendant",
  "√ spear",
  "φ lens",
  "∇ collar",
  "λ hood",
  "∫ cape",
  "ℵ badge",
] as const;

const PATTERNS = [
  "dots",
  "stripes",
  "chevrons",
  "cells",
  "noise",
  "rings",
  "lattice",
  "scanlines",
] as const;

const STANCES = ["planted", "lean", "float", "crouch", "stride"] as const;

const NAME_A = [
  "Aleph",
  "Null",
  "Prime",
  "Echo",
  "Axiom",
  "Quanta",
  "Flux",
  "Orbit",
  "Nexus",
  "Lumen",
] as const;

const NAME_B = [
  "of Roots",
  "of Limits",
  "of Series",
  "of Fields",
  "of Maps",
  "of Knots",
  "of Waves",
  "of Primes",
  "of Angles",
  "of Proofs",
] as const;

const GLYPH_POOL = ["π", "∑", "∞", "√", "Δ", "φ", "∇", "λ", "∫", "ℵ", "∂", "≈", "≠", "±", "×"];

function hsl(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h) % 360} ${Math.round(s)}% ${Math.round(l)}%)`;
}

function complexityScore(analysis: FormulaAnalysis): number {
  const { structure, results } = analysis;
  let score =
    structure.length * 0.35 +
    structure.operatorCount * 4 +
    structure.functionCount * 6 +
    structure.uniqueChars * 1.2 +
    (structure.hasPi ? 8 : 0) +
    (structure.hasE ? 8 : 0) +
    (structure.hasInfinity ? 12 : 0) +
    (structure.hasComplex ? 10 : 0);

  if (results.evaluated) {
    score += Math.min(20, Math.log10(1 + Math.abs(results.variance) + 1) * 6);
    score += Math.min(12, results.samples.length);
  } else {
    score += 3; // unparsable but creative formulas still get a bump
  }
  return Math.round(score);
}

function rarityFromComplexity(score: number): Rarity {
  if (score >= 70) return "Legendary";
  if (score >= 52) return "Epic";
  if (score >= 36) return "Rare";
  if (score >= 22) return "Uncommon";
  return "Common";
}

function clampStat(n: number): number {
  return Math.max(1, Math.min(99, Math.round(n)));
}

export function buildTraits(analysis: FormulaAnalysis): CharacterTraits {
  const rng = createRng(analysis.seed);
  const complexity = complexityScore(analysis);
  const rarity = rarityFromComplexity(complexity);

  const hueA = rng.next() * 360;
  // Keep palettes away from generic purple-default; bias toward teal / copper / ink
  const hueB = (hueA + 28 + rng.next() * 50) % 360;
  const hueC = (hueA + 160 + rng.next() * 40) % 360;

  const glyphs = Array.from({ length: 3 + rng.int(0, 3) }, () =>
    rng.pick(GLYPH_POOL),
  );

  // Prefer formula-native symbols when present
  if (analysis.structure.hasPi) glyphs[0] = "π";
  if (analysis.structure.hasE) glyphs[1] = "e";
  if (analysis.structure.hasInfinity) glyphs[2] = "∞";

  const resultEcho =
    analysis.results.digitStream.slice(0, 8) ||
    String(analysis.structure.digitSum).padStart(4, "0");

  const entropy = clampStat(
    20 +
      analysis.structure.uniqueChars * 3 +
      analysis.structure.operatorCount * 4 +
      rng.next() * 15,
  );
  const precision = clampStat(
    analysis.results.evaluated
      ? 70 - Math.min(50, Math.log10(1 + analysis.results.variance) * 12) + rng.next() * 10
      : 35 + rng.next() * 20,
  );
  const chaos = clampStat(
    10 +
      Math.min(70, Math.abs(analysis.results.mean) % 40) +
      (analysis.structure.hasComplex ? 18 : 0) +
      rng.next() * 12,
  );
  const elegance = clampStat(
    15 +
      analysis.structure.functionCount * 8 +
      (analysis.structure.hasPi || analysis.structure.hasE ? 14 : 0) +
      (100 - Math.min(40, analysis.structure.length)) * 0.4 +
      rng.next() * 10,
  );

  return {
    seed: analysis.seed,
    name: `${rng.pick(NAME_A)} ${rng.pick(NAME_B)}`,
    formula: analysis.formula,
    rarity,
    archetype: rng.pick(ARCHETYPES),
    head: rng.pick(HEADS),
    eyes: rng.pick(EYES),
    mouth: rng.pick(MOUTHS),
    aura: rng.pick(AURAS),
    accessory: rng.pick(ACCESSORIES),
    pattern: rng.pick(PATTERNS),
    stance: rng.pick(STANCES),
    colors: {
      skin: hsl(hueA, 18 + rng.next() * 16, 72 + rng.next() * 12),
      primary: hsl(hueB, 42 + rng.next() * 28, 38 + rng.next() * 18),
      secondary: hsl(hueC, 35 + rng.next() * 25, 48 + rng.next() * 16),
      accent: hsl((hueA + 90) % 360, 55 + rng.next() * 25, 46 + rng.next() * 12),
      ink: hsl(hueA, 18, 16 + rng.next() * 8),
      paper: hsl(hueC, 12 + rng.next() * 10, 88 + rng.next() * 6),
    },
    stats: { entropy, precision, chaos, elegance },
    glyphs,
    resultEcho,
    complexity,
  };
}

import { create, all, type MathNode } from "mathjs";
import { hashString, mixSeeds } from "./rng";

const math = create(all, {});

export type FormulaAnalysis = {
  formula: string;
  normalized: string;
  seed: number;
  /** Structural fingerprint from the written formula */
  structure: {
    length: number;
    operatorCount: number;
    functionCount: number;
    digitSum: number;
    hasPi: boolean;
    hasE: boolean;
    hasInfinity: boolean;
    hasComplex: boolean;
    uniqueChars: number;
  };
  /** Numeric fingerprint from evaluating the formula */
  results: {
    samples: number[];
    mean: number;
    variance: number;
    magnitude: number;
    digitStream: string;
    evaluated: boolean;
    error?: string;
  };
};

const SAMPLE_POINTS = [-2, -1, -0.5, 0, 0.5, 1, Math.E / 2, Math.PI, 2, 3];

function countNodeTypes(node: MathNode): { operators: number; functions: number } {
  let operators = 0;
  let functions = 0;
  node.traverse((n) => {
    if (n.type === "OperatorNode") operators += 1;
    if (n.type === "FunctionNode") functions += 1;
  });
  return { operators, functions };
}

function foldSamples(samples: number[]): {
  mean: number;
  variance: number;
  magnitude: number;
  digitStream: string;
} {
  if (samples.length === 0) {
    return { mean: 0, variance: 0, magnitude: 0, digitStream: "0" };
  }
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance =
    samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
  const magnitude = Math.sqrt(samples.reduce((a, b) => a + b * b, 0));
  const digitStream = samples
    .map((v) => {
      const abs = Math.abs(v);
      if (!Number.isFinite(abs)) return "9";
      return abs.toFixed(6).replace(".", "").replace(/^0+/, "") || "0";
    })
    .join("")
    .slice(0, 48);
  return { mean, variance, magnitude, digitStream };
}

function toFiniteNumbers(value: unknown): number[] {
  if (typeof value === "number" && Number.isFinite(value)) return [value];
  if (
    value &&
    typeof value === "object" &&
    "re" in value &&
    typeof (value as { re: unknown }).re === "number"
  ) {
    const c = value as { re: number; im?: number };
    const out = [c.re];
    if (typeof c.im === "number" && Number.isFinite(c.im)) out.push(c.im);
    return out.filter(Number.isFinite);
  }
  if (Array.isArray(value)) return value.flatMap(toFiniteNumbers);
  return [];
}

/**
 * Analyze a formula from both its written form and computed samples.
 * Even if evaluation fails, structure alone still yields a unique seed.
 */
export function analyzeFormula(raw: string): FormulaAnalysis {
  const formula = raw.trim();
  if (!formula) {
    throw new Error("Enter a math formula to forge.");
  }

  const normalized = formula.toLowerCase().replace(/\s+/g, "");
  const digitSum = [...normalized]
    .filter((c) => c >= "0" && c <= "9")
    .reduce((sum, c) => sum + Number(c), 0);

  const structure = {
    length: normalized.length,
    operatorCount: 0,
    functionCount: 0,
    digitSum,
    hasPi: /pi|π/.test(normalized),
    hasE: /(^|[^a-z])e([^a-z]|$)|exp\(/.test(normalized),
    hasInfinity: /inf|infinity|∞/.test(normalized),
    hasComplex: /i(?![a-z])|complex/.test(normalized),
    uniqueChars: new Set(normalized).size,
  };

  const samples: number[] = [];
  let evaluated = false;
  let error: string | undefined;

  try {
    const node = math.parse(formula);
    const counts = countNodeTypes(node);
    structure.operatorCount = counts.operators;
    structure.functionCount = counts.functions;

    const compiled = node.compile();
    for (const x of SAMPLE_POINTS) {
      try {
        const value = compiled.evaluate({
          x,
          y: x * 0.5,
          t: x,
          n: Math.round(x),
          a: x,
          b: x + 1,
        });
        samples.push(...toFiniteNumbers(value));
        evaluated = true;
      } catch {
        // skip points that blow up (div by zero, domain errors, etc.)
      }
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not parse formula";
  }

  const results = {
    samples: samples.slice(0, 24),
    ...foldSamples(samples),
    evaluated,
    error,
  };

  // Formula text + structure + result digits all feed uniqueness
  const seed = mixSeeds(
    normalized,
    structure.length,
    structure.operatorCount,
    structure.functionCount,
    structure.digitSum,
    structure.uniqueChars,
    structure.hasPi ? 0x314159 : 0,
    structure.hasE ? 0x271828 : 0,
    results.digitStream,
    Math.round(results.mean * 1e6),
    Math.round(results.variance * 1e4),
    Math.round(results.magnitude * 1e3),
    hashString(formula),
  );

  return { formula, normalized, seed, structure, results };
}

/** Deterministic PRNG so the same formula always remints the same character. */

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mixSeeds(...parts: Array<number | string>): number {
  let h = 0x811c9dc5;
  for (const part of parts) {
    const n = typeof part === "string" ? hashString(part) : part >>> 0;
    h ^= n + 0x9e3779b9 + ((h << 6) >>> 0) + (h >>> 2);
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  }
  return h >>> 0;
}

export function createRng(seed: number) {
  let state = seed >>> 0;
  return {
    next(): number {
      // mulberry32
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    pick<T>(items: readonly T[]): T {
      return items[this.int(0, items.length - 1)]!;
    },
    chance(p: number): boolean {
      return this.next() < p;
    },
  };
}

export type Rng = ReturnType<typeof createRng>;

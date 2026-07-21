"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { analyzeFormula } from "@/lib/formula";
import { buildTraits } from "@/lib/traits";
import { renderCharacterSvg, svgToDataUrl } from "@/lib/renderCharacter";

export function ShareView() {
  const searchParams = useSearchParams();
  const formula = searchParams.get("f") ?? "";

  const result = useMemo(() => {
    if (!formula.trim()) return null;
    try {
      const analysis = analyzeFormula(formula);
      const traits = buildTraits(analysis);
      const svg = renderCharacterSvg(traits);
      return { traits, preview: svgToDataUrl(svg) };
    } catch {
      return null;
    }
  }, [formula]);

  if (!formula.trim()) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-20 text-center">
        <p className="text-[var(--muted)]">No formula in this share link.</p>
        <Link href="/" className="text-[var(--teal)] underline underline-offset-4">
          Forge your own on UNVOXD
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-20 text-center">
        <p className="text-[var(--muted)]">Could not load this character.</p>
        <Link href="/" className="text-[var(--teal)] underline underline-offset-4">
          Forge your own on UNVOXD
        </Link>
      </div>
    );
  }

  const { traits, preview } = result;

  return (
    <div className="mx-auto grid max-w-4xl gap-8 py-10 lg:grid-cols-2 lg:items-center">
      <div className="overflow-hidden rounded-sm border border-[var(--ink)]/12 bg-[var(--paper)]/50 p-3 shadow-[0_24px_60px_-28px_rgba(26,35,50,0.45)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt={traits.name}
          className="aspect-square w-full object-contain"
        />
      </div>
      <div className="space-y-4">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--muted)]">
          {traits.archetype} · {traits.rarity}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
          {traits.name}
        </h1>
        <p className="font-mono text-sm text-[var(--ink)]/80">{formula}</p>
        <p className="text-sm text-[var(--muted)]">
          Forged on UNVOXD — every math formula becomes a one-of-one character.
        </p>
        <Link
          href="/"
          className="inline-block rounded-sm bg-[var(--ink)] px-5 py-3 text-sm font-medium text-[var(--paper)] transition hover:bg-[var(--teal)]"
        >
          Forge yours
        </Link>
      </div>
    </div>
  );
}

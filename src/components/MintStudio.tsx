"use client";

import { useEffect, useMemo, useState } from "react";
import { analyzeFormula } from "@/lib/formula";
import { buildTraits, type CharacterTraits } from "@/lib/traits";
import { renderCharacterSvg, svgToDataUrl } from "@/lib/renderCharacter";
import { getShareUrl, shareToTwitter } from "@/lib/share";

const EXAMPLES = [
  "sin(x)^2 + cos(x)^2",
  "e^(i*pi) + 1",
  "(1 + sqrt(5)) / 2",
  "x^3 - 2*x + 1",
  "abs(sin(pi*x)) * log(e + x^2)",
  "sqrt(x^2 + y^2) + pi/4",
];

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs tracking-wide uppercase text-[var(--muted)]">
        <span>{label}</span>
        <span className="font-mono text-[var(--ink)]">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-sm bg-[var(--ink)]/10">
        <div
          className="h-full rounded-sm bg-[var(--copper)] transition-[width] duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function MintStudio() {
  const [formula, setFormula] = useState("sin(x)^2 + cos(x)^2");
  const [error, setError] = useState<string | null>(null);
  const [traits, setTraits] = useState<CharacterTraits | null>(null);
  const [svg, setSvg] = useState<string>("");
  const [warn, setWarn] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!svg) return null;
    return svgToDataUrl(svg);
  }, [svg]);

  const shareUrl = useMemo(() => {
    if (!traits) return "";
    return getShareUrl(traits.formula);
  }, [traits]);

  function generate(nextFormula: string) {
    try {
      const analysis = analyzeFormula(nextFormula);
      const nextTraits = buildTraits(analysis);
      const nextSvg = renderCharacterSvg(nextTraits);
      setTraits(nextTraits);
      setSvg(nextSvg);
      setError(null);
      setWarn(
        analysis.results.evaluated
          ? null
          : analysis.results.error
            ? `Parsed loosely: ${analysis.results.error}. Character still forged from formula structure.`
            : "Could not sample numeric results — traits use formula structure only.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
      setTraits(null);
      setSvg("");
      setWarn(null);
    }
  }

  useEffect(() => {
    generate(formula);
    // initial generate only — further runs come from the form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleForge(e: React.FormEvent) {
    e.preventDefault();
    generate(formula);
  }

  function handleShare() {
    if (!traits) return;
    shareToTwitter(traits);
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
      <section className="space-y-8">
        <form onSubmit={handleForge} className="space-y-4">
          <label className="block space-y-2">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--muted)]">
              Math formula
            </span>
            <textarea
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              rows={3}
              spellCheck={false}
              className="w-full resize-y rounded-sm border border-[var(--ink)]/15 bg-[var(--paper)]/80 px-4 py-3 font-mono text-base text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] outline-none transition focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/25"
              placeholder="e.g. sin(x)^2 + cos(x)^2"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setFormula(ex);
                  generate(ex);
                }}
                className="rounded-sm border border-[var(--ink)]/12 bg-[var(--paper)]/60 px-3 py-1.5 font-mono text-[11px] text-[var(--ink)]/80 transition hover:border-[var(--teal)]/50 hover:text-[var(--ink)]"
              >
                {ex.length > 28 ? `${ex.slice(0, 26)}…` : ex}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              className="forge-btn rounded-sm bg-[var(--ink)] px-5 py-3 text-sm font-medium tracking-wide text-[var(--paper)] transition hover:bg-[var(--teal)]"
            >
              Forge character
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={!traits}
              className="share-btn rounded-sm border border-[#1a2332]/20 bg-[#1a2332] px-5 py-3 text-sm font-medium tracking-wide text-white transition hover:bg-[#2f6f66] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Share on X
            </button>
          </div>

          {error && (
            <p className="text-sm text-[var(--danger)]" role="alert">
              {error}
            </p>
          )}
          {warn && !error && (
            <p className="text-sm text-[var(--copper)]">{warn}</p>
          )}
        </form>

        {traits && (
          <div className="trait-panel space-y-5 border-t border-[var(--ink)]/10 pt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--muted)]">
                  {traits.archetype}
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
                  {traits.name}
                </h2>
              </div>
              <span className="rarity-chip rounded-sm border border-[var(--ink)]/15 bg-[var(--paper)] px-3 py-1 font-mono text-xs tracking-wider uppercase">
                {traits.rarity}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              {[
                ["Accessory", traits.accessory],
                ["Aura", traits.aura],
                ["Pattern", traits.pattern],
                ["Eyes", traits.eyes],
                ["Head", traits.head],
                ["Stance", traits.stance],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                    {k}
                  </dt>
                  <dd className="text-[var(--ink)]">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatBar label="Entropy" value={traits.stats.entropy} />
              <StatBar label="Precision" value={traits.stats.precision} />
              <StatBar label="Chaos" value={traits.stats.chaos} />
              <StatBar label="Elegance" value={traits.stats.elegance} />
            </div>

            <p className="font-mono text-xs text-[var(--muted)]">
              seed {traits.seed.toString(16)} · complexity {traits.complexity} ·
              echo {traits.resultEcho}
            </p>
          </div>
        )}
      </section>

      <aside className="space-y-6">
        <div className="preview-frame relative overflow-hidden rounded-sm border border-[var(--ink)]/12 bg-[var(--paper)]/50 p-3 shadow-[0_24px_60px_-28px_rgba(26,35,50,0.45)]">
          <div className="pointer-events-none absolute inset-0 preview-sheen" />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={traits ? traits.name : "Character preview"}
              className="relative z-[1] aspect-square w-full object-contain"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-[var(--muted)]">
              Enter a formula to forge
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-sm border border-[var(--ink)]/10 bg-[var(--paper)]/50 p-4">
          <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
            Share preview
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Your tweet includes a link with a large character image card and tags{" "}
            <span className="font-mono text-[var(--ink)]">@unvoxd_nft</span>.
          </p>
          {traits && (
            <>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-sm bg-[var(--ink)]/5 p-3 font-mono text-[11px] leading-relaxed text-[var(--ink)]/80">
                {`I forged "${traits.name}" from ${traits.formula.length > 48 ? `${traits.formula.slice(0, 46)}…` : traits.formula} on UNVOXD\n\n${traits.rarity} · ${traits.archetype}\n\n@unvoxd_nft\n${shareUrl}`}
              </pre>
              <p className="text-xs text-[var(--muted)]">
                Image preview works once deployed publicly — X reads the share link
                and pulls your character art automatically.
              </p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

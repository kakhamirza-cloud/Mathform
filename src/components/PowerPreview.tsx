"use client";

import { useEffect, useMemo, useState } from "react";

const GATHER_MS = 4200;

const STAGES = [
  { id: "stake", label: "Stake", blurb: "Assign your NFT as a worker" },
  { id: "gather", label: "Gather", blurb: "Hunt new formulas on cooldown" },
  { id: "earn", label: "Earn", blurb: "Power × time → $UNVX" },
  { id: "convert", label: "Convert", blurb: "Turn tokens into real value" },
] as const;

const SAMPLE_FORMULAS = [
  "sin(x)^2 + cos(x)^2",
  "e^(i*pi) + 1",
  "(1+sqrt(5))/2",
  "x^3 - 2x + 1",
  "log(e + x^2)",
  "pi*e + x/7",
];

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function PowerPreview() {
  const [power, setPower] = useState(64);
  const [staked, setStaked] = useState(false);
  const [gathering, setGathering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [gathered, setGathered] = useState<string[]>([]);
  const [pulse, setPulse] = useState(0);
  const [activeStage, setActiveStage] = useState(0);

  const reward = useMemo(
    () => Math.round(8 + power * 0.35 + (staked ? 4 : 0)),
    [power, staked],
  );

  const cooldownLabel = useMemo(() => {
    const sec = Math.max(8, Math.round(28 - power * 0.18));
    return `${sec}s`;
  }, [power]);

  useEffect(() => {
    if (!gathering) return;
    setActiveStage(1);
    setProgress(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = clamp((now - start) / GATHER_MS, 0, 1);
      setProgress(t);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const formula =
        SAMPLE_FORMULAS[Math.floor(Math.random() * SAMPLE_FORMULAS.length)]!;
      setGathered((prev) => [formula, ...prev].slice(0, 5));
      setTokens((tkn) => tkn + reward);
      setGathering(false);
      setProgress(0);
      setPulse((p) => p + 1);
      setActiveStage(2);
      window.setTimeout(() => setActiveStage(3), 900);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gathering, reward]);

  function handleStake() {
    setStaked(true);
    setActiveStage(0);
  }

  function handleGather() {
    if (!staked || gathering) return;
    setGathering(true);
  }

  function handleConvert() {
    if (tokens <= 0) return;
    setTokens(0);
    setPulse((p) => p + 1);
    setActiveStage(3);
  }

  return (
    <div className="power-page mx-auto max-w-6xl space-y-10">
      <section className="space-y-4">
        <p className="font-mono text-xs tracking-[0.22em] uppercase text-[var(--muted)]">
          Preview · not live yet
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">
          Power turns PFPs into workers
        </h1>
        <p className="max-w-2xl text-lg text-[var(--muted)]">
          Your character&apos;s <span className="text-[var(--ink)]">Power</span>{" "}
          stat decides how hard it works. Stake it, gather formulas, earn $UNVX,
          convert later. This page is a live demo of the loop.
        </p>
      </section>

      {/* Stage rail */}
      <ol className="power-stages grid gap-3 sm:grid-cols-4">
        {STAGES.map((stage, i) => (
          <li
            key={stage.id}
            className={`power-stage rounded-sm border px-4 py-3 transition ${
              activeStage === i
                ? "border-[var(--teal)] bg-[var(--teal)]/15 shadow-[0_0_0_1px_rgba(47,111,102,0.25)]"
                : "border-[var(--ink)]/10 bg-[var(--paper)]/50"
            }`}
          >
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--muted)]">
              0{i + 1}
            </p>
            <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
              {stage.label}
            </p>
            <p className="text-sm text-[var(--muted)]">{stage.blurb}</p>
          </li>
        ))}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Worker card */}
        <section className="power-card relative overflow-hidden rounded-sm border border-[var(--ink)]/12 bg-[var(--paper)]/70 p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-0 preview-sheen opacity-60" />
          <div className="relative z-[1] space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--muted)]">
                  Worker NFT
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  Flux of Limits
                </h2>
                <p className="font-mono text-xs text-[var(--muted)]">
                  forged from e^(i*pi)+1 · Rare
                </p>
              </div>
              <div
                key={pulse}
                className="power-orb flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-[var(--ink)] bg-[var(--teal)]/20"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  Power
                </span>
                <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  {power}
                </span>
              </div>
            </div>

            <label className="block space-y-2">
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <span>Simulate Power</span>
                <span>{power}/99</span>
              </div>
              <input
                type="range"
                min={1}
                max={99}
                value={power}
                onChange={(e) => setPower(Number(e.target.value))}
                className="power-slider w-full"
              />
              <p className="text-sm text-[var(--muted)]">
                Higher Power → bigger gather rewards · shorter feel on cooldown (
                demo ~{cooldownLabel})
              </p>
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleStake}
                disabled={staked}
                className="rounded-sm bg-[var(--ink)] px-4 py-3 text-sm font-medium text-[var(--brand)] transition hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {staked ? "Staked" : "Stake worker"}
              </button>
              <button
                type="button"
                onClick={handleGather}
                disabled={!staked || gathering}
                className="rounded-sm border border-[var(--copper)]/50 bg-[var(--copper)]/15 px-4 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--copper)] hover:text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {gathering ? "Gathering…" : "Gather formula"}
              </button>
              <button
                type="button"
                onClick={handleConvert}
                disabled={tokens <= 0}
                className="rounded-sm border border-[var(--ink)]/15 px-4 py-3 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--teal)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Convert $UNVX
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <span>Gather progress</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-sm bg-[var(--ink)]/10">
                <div
                  className="power-bar h-full rounded-sm bg-[var(--teal)]"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Live feed */}
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-sm border border-[var(--ink)]/10 bg-[var(--paper)]/60 p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                Wallet $UNVX
              </p>
              <p
                key={`t-${tokens}-${pulse}`}
                className="power-count font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]"
              >
                {tokens}
              </p>
              <p className="text-xs text-[var(--muted)]">
                +{reward} per successful gather
              </p>
            </div>
            <div className="rounded-sm border border-[var(--ink)]/10 bg-[var(--paper)]/60 p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                Status
              </p>
              <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
                {!staked ? "Idle" : gathering ? "Working" : "Ready"}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {staked ? "Worker assigned" : "Stake to begin"}
              </p>
            </div>
          </div>

          <div className="rounded-sm border border-[var(--ink)]/10 bg-[var(--paper)]/60 p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
              Formulas gathered
            </p>
            {gathered.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                Nothing yet — stake, then hit gather.
              </p>
            ) : (
              <ul className="space-y-2">
                {gathered.map((f, i) => (
                  <li
                    key={`${f}-${i}-${pulse}`}
                    className="power-formula rounded-sm border border-[var(--teal)]/25 bg-[var(--teal)]/10 px-3 py-2 font-mono text-sm text-[var(--ink)]"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-sm border border-dashed border-[var(--ink)]/15 bg-[var(--paper)]/40 p-4 text-sm text-[var(--muted)]">
            <p className="font-medium text-[var(--ink)]">How Power works</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Forged from your formula (complexity, π/e/∞, rarity).</li>
              <li>Same formula → same Power forever.</li>
              <li>Workers gather formulas on a cooldown.</li>
              <li>Rewards scale with Power; convert $UNVX later.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

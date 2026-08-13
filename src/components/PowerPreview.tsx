/**
 * Coming-soon Power / stake preview — not live, no demo actions.
 */
import Image from "next/image";
import Link from "next/link";

const COMING = [
  {
    step: "01",
    title: "Stake",
    body: "Stake Hood Forged characters — or junk NFTs from Robinhood Chain — to clear wallet clutter.",
  },
  {
    step: "02",
    title: "Earn $UNVX",
    body: "Staked assets earn $UNVX over time. Higher Power on your character means faster rewards.",
  },
  {
    step: "03",
    title: "Gather",
    body: "Workers hunt new formulas on cooldown. Same formula still forges the same character forever.",
  },
  {
    step: "04",
    title: "Convert",
    body: "Turn $UNVX into real utility later. Preview only — not live on-chain yet.",
  },
] as const;

export function PowerPreview() {
  return (
    <div className="power-page mx-auto max-w-6xl space-y-12">
      <section className="space-y-4">
        <p className="inline-flex rounded-sm border border-[var(--ink)]/25 bg-white/50 px-3 py-1 font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink)]">
          Preview · not live yet
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">
          What&apos;s coming
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Stake. Earn $UNVX. Put Power to work. This is a look at the loop — mint
          and whitelist first.
        </p>
      </section>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COMING.map((item) => (
          <li
            key={item.step}
            className="power-stage space-y-2 border border-[var(--ink)]/12 bg-white/55 px-4 py-4"
          >
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--muted)]">
              {item.step}
            </p>
            <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--ink)]">
              {item.title}
            </p>
            <p className="text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
          </li>
        ))}
      </ol>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="flex flex-col justify-between border border-[var(--ink)]/12 bg-white/55 p-5 sm:p-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--muted)]">
              Optional staking
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--ink)]">
              Stake junk NFTs. Earn $UNVX.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Clear clutter from your Robinhood wallet. Stake junk NFTs here and
              earn $UNVX while they sit out of the way. Hood Forged PFPs can work
              as formula gatherers too.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { k: "Stake", v: "NFTs" },
              { k: "Earn", v: "$UNVX" },
              { k: "Status", v: "Soon" },
            ].map((cell) => (
              <div
                key={cell.k}
                className="border border-[var(--ink)]/10 bg-white/70 px-2 py-3 text-center"
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  {cell.k}
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)] sm:text-xl">
                  {cell.v}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden border border-[var(--ink)]/12 bg-white/55 p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 opacity-30">
            <Image
              src="/gallery/3333.png"
              alt=""
              width={144}
              height={144}
              className="h-full w-full object-cover"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <p className="relative font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--muted)]">
            Power
          </p>
          <h2 className="relative mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--ink)]">
            Higher Power → harder workers
          </h2>
          <ul className="relative mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>Forged from your formula — locked forever.</li>
            <li>Same formula → same Power.</li>
            <li>Staked characters gather formulas on cooldown.</li>
            <li>Rewards scale with Power.</li>
          </ul>
          <Link
            href="/whitelist"
            className="wl-cta-btn relative mt-6 inline-flex rounded-sm px-5 py-3 text-xs tracking-[0.14em] uppercase"
          >
            Join whitelist
          </Link>
        </div>
      </section>
    </div>
  );
}

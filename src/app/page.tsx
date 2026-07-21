import Link from "next/link";
import { MintStudio } from "@/components/MintStudio";

export default function Home() {
  return (
    <>
      <header className="px-6 pt-10 pb-6 sm:px-10 sm:pt-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="brand-mark font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-[0.18em] text-[var(--ink)] sm:text-6xl">
                UNVOXD
              </p>
              <p className="mt-4 max-w-xl text-base text-[var(--muted)] sm:text-lg">
                Type a formula. We read its structure and sample its results, then
                forge a one-of-one character you can share on X.
              </p>
            </div>
            <Link
              href="/whitelist"
              className="wl-cta-btn shrink-0 rounded-sm px-5 py-3 text-sm font-medium tracking-[0.12em] uppercase"
            >
              Apply for whitelist
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 pb-16 sm:px-10">
        <MintStudio />
      </main>

      <footer className="border-t border-[var(--ink)]/10 px-6 py-6 text-sm text-[var(--muted)] sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <span>Share your forge · tag @unvoxd_nft · same formula → same character</span>
          <span className="font-mono text-xs tracking-wider uppercase">
            formula × results → character
          </span>
        </div>
      </footer>
    </>
  );
}

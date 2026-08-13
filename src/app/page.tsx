import Image from "next/image";
import Link from "next/link";
import { MintStudio } from "@/components/MintStudio";
import { WalletButton } from "@/components/WalletButton";

const STRIP = [
  "/gallery/1.png",
  "/gallery/7.png",
  "/gallery/42.png",
  "/gallery/128.png",
  "/gallery/3312.png",
  "/gallery/3333.png",
  "/gallery/1.png",
  "/gallery/42.png",
  "/gallery/7.png",
  "/gallery/128.png",
];

export default function Home() {
  return (
    <>
      <header className="absolute inset-x-0 top-0 z-20 px-4 pt-5 sm:px-10 sm:pt-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="font-[family-name:var(--font-display)] text-xs font-bold tracking-[0.18em] uppercase text-[var(--ink)] sm:text-sm sm:tracking-[0.22em]">
            Hood Forged
          </p>
          <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <a
              href="#forge"
              className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--muted)] transition hover:text-[var(--ink)] sm:text-xs sm:tracking-[0.12em]"
            >
              Forge
            </a>
            <Link
              href="/power"
              className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--muted)] transition hover:text-[var(--ink)] sm:text-xs sm:tracking-[0.12em]"
            >
              Power
            </Link>
            <Link
              href="/whitelist"
              className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--muted)] transition hover:text-[var(--ink)] sm:text-xs sm:tracking-[0.12em]"
            >
              Whitelist
            </Link>
            <WalletButton />
          </nav>
        </div>
      </header>

      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] sm:opacity-[0.22]" aria-hidden>
          <div className="absolute inset-y-0 right-0 w-[70%] max-w-3xl translate-x-[18%] sm:w-full sm:translate-x-[12%]">
            <Image
              src="/gallery/3312.png"
              alt=""
              fill
              className="object-cover object-left"
              style={{ imageRendering: "pixelated" }}
              priority
            />
          </div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 pb-24 pt-24 sm:px-10 sm:pb-28 sm:pt-28">
          <h1 className="brand-mark max-w-3xl font-[family-name:var(--font-display)] text-5xl font-extrabold leading-[0.9] tracking-[0.08em] text-[var(--ink)] sm:text-8xl sm:tracking-[0.1em]">
            Hood Forged
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--muted)] sm:mt-6 sm:text-lg">
            Formula becomes character. 3333 pixel mints on Robinhood Chain.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
            <a
              href="#forge"
              className="wl-cta-btn rounded-sm px-5 py-3 text-xs tracking-[0.12em] uppercase sm:px-6 sm:py-3.5 sm:text-sm sm:tracking-[0.14em]"
            >
              Forge yours
            </a>
            <Link
              href="/whitelist"
              className="rounded-sm border border-[var(--ink)]/40 bg-white/45 px-5 py-3 text-xs font-medium tracking-[0.12em] uppercase text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--brand)] sm:px-6 sm:py-3.5 sm:text-sm sm:tracking-[0.14em]"
            >
              Join whitelist
            </Link>
            <Link
              href="/power"
              className="rounded-sm border border-[var(--ink)]/25 bg-white/30 px-5 py-3 text-xs font-medium tracking-[0.12em] uppercase text-[var(--ink)] transition hover:border-[var(--ink)]/50 sm:px-6 sm:py-3.5 sm:text-sm sm:tracking-[0.14em]"
            >
              Power preview
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-[var(--ink)]/15 bg-[var(--brand)]/85 backdrop-blur-sm">
          <div className="flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STRIP.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative h-14 w-14 shrink-0 border-r border-[var(--ink)]/10 sm:h-20 sm:w-20"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 space-y-14 px-4 py-12 sm:space-y-16 sm:px-10 sm:py-20">
        <section id="forge" className="scroll-mt-6 sm:scroll-mt-8">
          <div className="mx-auto mb-6 max-w-6xl sm:mb-8">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--muted)] sm:text-xs sm:tracking-[0.2em]">
              Try it
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--ink)] sm:text-3xl">
              Type a formula. Forge a character.
            </h2>
          </div>
          <MintStudio />
        </section>
      </main>

      <footer className="border-t border-[var(--ink)]/10 px-4 py-5 text-xs text-[var(--muted)] sm:px-10 sm:py-6 sm:text-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <span>@HoodForged · Robinhood Chain · same formula → same character</span>
          <span className="font-mono text-[10px] tracking-wider uppercase sm:text-xs">$UNVX</span>
        </div>
      </footer>
    </>
  );
}

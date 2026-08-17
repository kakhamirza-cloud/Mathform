import type { Metadata } from "next";
import Link from "next/link";
import { WlChecker } from "@/components/WlChecker";
import { WalletButton } from "@/components/WalletButton";

export const metadata: Metadata = {
  title: "WL Checker | Hood Forged",
  description: "Check if your wallet is on the Hood Forged whitelist.",
};

export default function CheckPage() {
  return (
    <>
      <header className="border-b border-[var(--ink)]/10 px-4 py-4 sm:px-10 sm:py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[0.12em] text-[var(--ink)] sm:text-2xl sm:tracking-[0.14em]"
          >
            Hood Forged
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2 font-mono text-[10px] tracking-wider uppercase sm:gap-3 sm:text-xs">
            <Link href="/" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Forge
            </Link>
            <Link href="/power" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Power
            </Link>
            <Link href="/whitelist" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Whitelist
            </Link>
            <span className="text-[var(--ink)]">Check</span>
            <WalletButton />
          </nav>
        </div>
      </header>
      <main className="px-4 py-8 sm:px-10 sm:py-14">
        <WlChecker />
      </main>
    </>
  );
}

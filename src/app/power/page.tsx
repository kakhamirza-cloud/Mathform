import type { Metadata } from "next";
import Link from "next/link";
import { PowerPreview } from "@/components/PowerPreview";
import { WalletButton } from "@/components/WalletButton";

export const metadata: Metadata = {
  title: "Power Preview | Hood Forged",
  description:
    "Preview of what's coming — stake NFTs, earn $UNVX, put Power to work. Not live yet.",
};

export default function PowerPage() {
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
            <span className="text-[var(--ink)]">Power</span>
            <Link href="/whitelist" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Whitelist
            </Link>
            <WalletButton />
          </nav>
        </div>
      </header>
      <main className="px-4 py-8 sm:px-10 sm:py-14">
        <PowerPreview />
      </main>
    </>
  );
}

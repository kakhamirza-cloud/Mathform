import type { Metadata } from "next";
import Link from "next/link";
import { PowerPreview } from "@/components/PowerPreview";

export const metadata: Metadata = {
  title: "Power | UNVOXD",
  description:
    "Preview how Power turns UNVOXD characters into formula-gathering workers.",
};

export default function PowerPage() {
  return (
    <>
      <header className="border-b border-[var(--ink)]/10 px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[0.14em] text-[var(--ink)]"
          >
            UNVOXD
          </Link>
          <nav className="flex flex-wrap items-center gap-3 font-mono text-xs tracking-wider uppercase">
            <Link href="/" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Forge
            </Link>
            <span className="text-[var(--teal)]">Power</span>
            <Link
              href="/whitelist"
              className="text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Whitelist
            </Link>
          </nav>
        </div>
      </header>
      <main className="px-6 py-10 sm:px-10 sm:py-14">
        <PowerPreview />
      </main>
    </>
  );
}

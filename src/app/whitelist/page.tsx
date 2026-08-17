import type { Metadata } from "next";
import Link from "next/link";
import { WhitelistForm } from "@/components/WhitelistForm";

export const metadata: Metadata = {
  title: "Whitelist | Hood Forged",
  description: "Apply for the Hood Forged formula character NFT whitelist.",
};

export default function WhitelistPage() {
  return (
    <>
      <header className="px-6 pt-10 pb-2 sm:px-10">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[0.16em] text-[var(--ink)]"
          >
            Hood Forged
          </Link>
          <Link
            href="/check"
            className="font-mono text-[10px] tracking-wider uppercase text-[var(--muted)] hover:text-[var(--ink)] sm:text-xs"
          >
            Check WL
          </Link>
        </div>
      </header>
      <main className="px-6 pb-20 sm:px-10">
        <WhitelistForm />
      </main>
    </>
  );
}

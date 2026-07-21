import type { Metadata } from "next";
import { WhitelistForm } from "@/components/WhitelistForm";

export const metadata: Metadata = {
  title: "Whitelist | UNVOXD",
  description: "Apply for the UNVOXD formula character NFT whitelist.",
};

export default function WhitelistPage() {
  return (
    <>
      <header className="px-6 pt-10 pb-2 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <p className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[0.16em] text-[var(--ink)]">
            UNVOXD
          </p>
        </div>
      </header>
      <main className="px-6 pb-20 sm:px-10">
        <WhitelistForm />
      </main>
    </>
  );
}

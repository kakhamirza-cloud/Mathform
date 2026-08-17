"use client";

import Link from "next/link";
import { useState } from "react";
import { isOnAllowlist } from "@/lib/allowlist";
import { isRobinhoodWallet, normalizeRobinhoodWallet } from "@/lib/whitelist";

type Result = "idle" | "yes" | "no" | "invalid";

export function WlChecker() {
  const [wallet, setWallet] = useState("");
  const [result, setResult] = useState<Result>("idle");

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const value = normalizeRobinhoodWallet(wallet);
    if (!isRobinhoodWallet(value)) {
      setResult("invalid");
      return;
    }
    setResult(isOnAllowlist(value) ? "yes" : "no");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--teal)]">
            August 21 · 3:00 PM UTC
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
            WL checker
          </h1>
          <p className="max-w-md text-sm text-[var(--muted)]">
            Paste your wallet. We’ll tell you if you’re on the Hood Forged
            whitelist.
          </p>
        </div>
        <Link href="/" className="forge-ghost-btn shrink-0">
          Home
        </Link>
      </div>

      <form onSubmit={handleCheck} className="forge-sheet space-y-5">
        <label className="block space-y-2">
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--muted)]">
            Wallet
          </span>
          <input
            value={wallet}
            onChange={(e) => {
              setWallet(e.target.value);
              setResult("idle");
            }}
            placeholder="0x…"
            autoComplete="off"
            spellCheck={false}
            className="forge-field w-full"
            aria-label="Wallet address"
          />
        </label>
        <button type="submit" className="wl-cta-btn w-full rounded-sm px-5 py-3 text-xs tracking-[0.14em] uppercase sm:text-sm">
          Check
        </button>

        {result === "yes" && (
          <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            You’re in. See you at mint.
          </p>
        )}
        {result === "no" && (
          <p className="text-sm text-[var(--muted)]">
            Not on the list yet. No WL?{" "}
            <Link href="/whitelist" className="underline underline-offset-2 hover:text-[var(--ink)]">
              Apply here
            </Link>{" "}
            or drop your wallet under the mint tweet.
          </p>
        )}
        {result === "invalid" && (
          <p className="text-sm text-[var(--danger)]">That doesn’t look like a wallet.</p>
        )}
      </form>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  connectWallet,
  ensureRobinhoodChain,
  getChainId,
  getConnectedAddress,
  getEthereum,
  ROBINHOOD_CHAIN,
  shortAddress,
} from "@/lib/robinhood";

export function useRobinhoodWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [addr, id] = await Promise.all([getConnectedAddress(), getChainId()]);
      setAddress(addr);
      setChainId(id);
    } catch {
      setAddress(null);
      setChainId(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const eth = getEthereum();
    if (!eth?.on) return;

    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[] | undefined;
      setAddress(accounts?.[0] ?? null);
    };
    const onChain = (...args: unknown[]) => {
      const hex = args[0] as string | undefined;
      setChainId(hex ? Number.parseInt(hex, 16) : null);
    };

    eth.on("accountsChanged", onAccounts);
    eth.on("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [refresh]);

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      setChainId(await getChainId());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connect failed");
    } finally {
      setBusy(false);
    }
  }

  async function switchChain() {
    setBusy(true);
    setError(null);
    try {
      await ensureRobinhoodChain();
      setChainId(await getChainId());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Switch failed");
    } finally {
      setBusy(false);
    }
  }

  const onRobinhood = chainId === ROBINHOOD_CHAIN.chainId;

  return { address, chainId, onRobinhood, busy, error, connect, switchChain };
}

export function WalletButton() {
  const { address, onRobinhood, busy, error, connect, switchChain } =
    useRobinhoodWallet();

  if (address && !onRobinhood) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => void switchChain()}
          disabled={busy}
          className="wl-cta-btn rounded-sm px-3 py-2 text-[10px] font-medium tracking-[0.1em] uppercase disabled:opacity-50 sm:px-4 sm:py-2.5 sm:text-xs sm:tracking-[0.12em]"
        >
          {busy ? "Switching…" : "Switch to Robinhood"}
        </button>
        {error ? <p className="max-w-[14rem] text-right text-xs text-[var(--danger)]">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void connect()}
        disabled={busy}
        className="wl-cta-btn rounded-sm px-3 py-2 text-[10px] font-medium tracking-[0.1em] uppercase disabled:opacity-50 sm:px-4 sm:py-2.5 sm:text-xs sm:tracking-[0.12em]"
      >
        {busy
          ? "Connecting…"
          : address
            ? shortAddress(address)
            : "Connect"}
      </button>
      {error ? <p className="max-w-[14rem] text-right text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}

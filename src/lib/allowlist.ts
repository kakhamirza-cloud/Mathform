import allowlist from "../../data/allowlist.json";
import { normalizeRobinhoodWallet } from "./whitelist";

function normalizeWalletKey(value: string): string {
  return normalizeRobinhoodWallet(value).toLowerCase();
}

const wallets: string[] = allowlist.wallets;

const WALLET_SET = new Set(
  wallets.map(normalizeWalletKey).filter((w) => w.length > 0),
);

export function isOnAllowlist(value: string): boolean {
  const key = normalizeWalletKey(value);
  return key.length > 0 && WALLET_SET.has(key);
}

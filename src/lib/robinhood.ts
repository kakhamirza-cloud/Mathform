/** Robinhood Chain (Arbitrum Orbit L2) — wallet + network helpers. */

export const ROBINHOOD_CHAIN = {
  chainId: 4663,
  chainIdHex: "0x1237",
  name: "Robinhood Chain",
  rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
  explorerUrl: "https://robinhoodchain.blockscout.com",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
} as const;

type Eip1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

export function getEthereum(): Eip1193 | null {
  if (typeof window === "undefined") return null;
  const eth = (window as Window & { ethereum?: Eip1193 }).ethereum;
  return eth ?? null;
}

export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export async function connectWallet(): Promise<string> {
  const eth = getEthereum();
  if (!eth) {
    throw new Error("No wallet found. Install MetaMask or another wallet.");
  }
  const accounts = (await eth.request({
    method: "eth_requestAccounts",
  })) as string[];
  const address = accounts[0];
  if (!address) throw new Error("No account returned.");
  await ensureRobinhoodChain();
  return address;
}

export async function getConnectedAddress(): Promise<string | null> {
  const eth = getEthereum();
  if (!eth) return null;
  const accounts = (await eth.request({ method: "eth_accounts" })) as string[];
  return accounts[0] ?? null;
}

export async function getChainId(): Promise<number | null> {
  const eth = getEthereum();
  if (!eth) return null;
  const hex = (await eth.request({ method: "eth_chainId" })) as string;
  return Number.parseInt(hex, 16);
}

export async function ensureRobinhoodChain(): Promise<void> {
  const eth = getEthereum();
  if (!eth) throw new Error("No wallet found.");

  const current = await getChainId();
  if (current === ROBINHOOD_CHAIN.chainId) return;

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ROBINHOOD_CHAIN.chainIdHex }],
    });
  } catch (err) {
    const code = (err as { code?: number })?.code;
    // 4902 = chain not added
    if (code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: ROBINHOOD_CHAIN.chainIdHex,
            chainName: ROBINHOOD_CHAIN.name,
            nativeCurrency: ROBINHOOD_CHAIN.nativeCurrency,
            rpcUrls: [ROBINHOOD_CHAIN.rpcUrl],
            blockExplorerUrls: [ROBINHOOD_CHAIN.explorerUrl],
          },
        ],
      });
      return;
    }
    throw err instanceof Error ? err : new Error("Could not switch to Robinhood Chain.");
  }
}

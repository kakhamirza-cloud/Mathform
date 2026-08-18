/**
 * Snapshot unique NFT holders from Robinhood Chain Blockscout
 * and merge into data/allowlist.json + OpenSea CSV.
 *
 * Usage: npx tsx scripts/snapshot-rh-holders.ts
 */
import fs from "fs";
import path from "path";

const BASE = "https://robinhoodchain.blockscout.com/api/v2/tokens";
const ZERO = "0x0000000000000000000000000000000000000000";
const DEAD = "0x000000000000000000000000000000000000dead";

const COLLECTIONS: Array<{ name: string; address: string }> = [
  { name: "realstonkbroker", address: "0x539cdd042c2f3d93ebc5be7dfff0c79f3b4fabf0" },
  { name: "MancerXYZ", address: "0x797a2e030b7e49107c8f07bf0300ea9cae88ca57" },
  { name: "MonkeyHoodNFT", address: "0x6581b6fa83e714956935cd1e16ac8f6f5c44c484" },
  { name: "cashcatss", address: "0xe3b34c4bb0f12c82143745eee6a6cf4e3154b1fa" },
  { name: "pyopyopyo410", address: "0x08dc7cb3f4ccc8eea782e2924d151e2130f22b28" },
  { name: "OnChainHoodies", address: "0x9ec6c5b9f572a9b02138e553bc5f5882da735f45" },
  { name: "brokerpunksnft", address: "0xe6f39752438d607390b339cdb609144acea6d6db" },
  { name: "RH Machine", address: "0xb509e195bcb3e4461e235ff152c68d66915f67b5" },
];

type HolderPage = {
  items: Array<{
    address?: { hash?: string; name?: string | null };
    value?: string;
  }>;
  next_page_params?: Record<string, string | number> | null;
};

function normalize(addr: string): string {
  return addr.trim().toLowerCase();
}

const SKIP_NAMES = /amm|vault|seaport|opensea|conduit|reservoir|blur|marketplace|router/i;

function isWallet(addr: string): boolean {
  return /^0x[a-f0-9]{40}$/.test(addr) && addr !== ZERO && addr !== DEAD;
}

async function fetchJson(url: string, attempts = 6): Promise<HolderPage> {
  let last = "";
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url);
    last = `${res.status}`;
    if (res.ok) return (await res.json()) as HolderPage;
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  throw new Error(`${url} failed after ${attempts} tries (${last})`);
}

async function fetchHolders(contract: string): Promise<string[]> {
  const out: string[] = [];
  let url = `${BASE}/${contract}/holders`;

  for (let page = 0; page < 500; page++) {
    const data = await fetchJson(url);
    for (const item of data.items ?? []) {
      const hash = item.address?.hash;
      const name = item.address?.name ?? "";
      if (!hash || SKIP_NAMES.test(name)) continue;
      out.push(hash);
    }
    if (!data.next_page_params) break;
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(data.next_page_params).map(([k, v]) => [k, String(v)]),
      ),
    );
    url = `${BASE}/${contract}/holders?${qs.toString()}`;
    await new Promise((r) => setTimeout(r, 180));
  }
  return out;
}

function walletsFromText(text: string): string[] {
  return [...text.matchAll(/0x[a-fA-F0-9]{40}/g)].map((m) => m[0]);
}

async function main() {
  const root = process.cwd();
  const extraPath = path.join(root, "data", "extra-wallets.txt");
  const allowPath = path.join(root, "data", "allowlist.json");
  const csvPath = path.join(root, "data", "opensea-allowlist.csv");

  const unique = new Map<string, string>(); // lower -> original

  function add(addr: string) {
    const key = normalize(addr);
    if (!isWallet(key)) return;
    if (!unique.has(key)) unique.set(key, addr.trim());
  }

  const existing = JSON.parse(fs.readFileSync(allowPath, "utf8")) as {
    wallets: string[];
  };
  for (const w of existing.wallets) add(w);
  console.log(`existing checker: ${existing.wallets.length}`);

  if (fs.existsSync(extraPath)) {
    const extra = walletsFromText(fs.readFileSync(extraPath, "utf8"));
    extra.forEach(add);
    console.log(`extra pasted: ${extra.length}`);
  }

  const perCollection: Record<string, number> = {};
  for (const col of COLLECTIONS) {
    const holders = await fetchHolders(col.address);
    const before = unique.size;
    holders.forEach(add);
    perCollection[col.name] = holders.length;
    console.log(
      `${col.name}: ${holders.length} holders (+${unique.size - before} new unique)`,
    );
  }

  const wallets = [...unique.values()].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );

  fs.writeFileSync(allowPath, JSON.stringify({ wallets }, null, 2) + "\n", "utf8");
  fs.writeFileSync(
    csvPath,
    ["address,maxMint", ...wallets.map((w) => `${w},2`)].join("\n") + "\n",
    "utf8",
  );
  fs.writeFileSync(
    path.join(root, "data", "holder-snapshot.json"),
    JSON.stringify({ total: wallets.length, collections: perCollection }, null, 2),
    "utf8",
  );

  console.log(`\nunique wallets: ${wallets.length}`);
  console.log(`wrote ${allowPath}`);
  console.log(`wrote ${csvPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

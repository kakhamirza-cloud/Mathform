/**
 * Prepare Hood Forged cooler (pixel) art for OpenSea mint.
 * Reads shared metadata, writes cooler-only JSON (no forge animation_url).
 *
 * Usage: npx tsx scripts/prepare-cooler-mint.ts
 *
 * Output:
 *   opensea-export/cooler/metadata/*.json
 *   opensea-export/cooler/contract.json
 *   opensea-export/cooler/MINT.md
 *   opensea-export/cooler/ipfs-manifest.json
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "opensea-export");
const COOLER = path.join(ROOT, "cooler");
const COOLER_IMG = path.join(COOLER, "images");
const COOLER_META = path.join(COOLER, "metadata");
const SOURCE_META = path.join(ROOT, "metadata");

const PLACEHOLDER_CID = "REPLACE_ROOT_CID";

type TokenMeta = {
  name: string;
  description: string;
  image?: string;
  animation_url?: string;
  external_url?: string;
  background_color?: string;
  attributes?: Array<Record<string, unknown>>;
};

function main() {
  if (!fs.existsSync(COOLER_IMG)) {
    console.error(`Missing ${COOLER_IMG} — run: npx tsx scripts/export-opensea.ts 3333 --pixel-only`);
    process.exit(1);
  }
  if (!fs.existsSync(SOURCE_META)) {
    console.error(`Missing ${SOURCE_META} — run: npx tsx scripts/export-opensea.ts 3333`);
    process.exit(1);
  }

  const pngCount = fs.readdirSync(COOLER_IMG).filter((f) => f.endsWith(".png")).length;
  const metaFiles = fs
    .readdirSync(SOURCE_META)
    .filter((f) => /^\d+\.json$/.test(f))
    .sort((a, b) => Number(a.replace(".json", "")) - Number(b.replace(".json", "")));

  if (pngCount !== metaFiles.length) {
    console.error(`Mismatch: ${pngCount} PNGs vs ${metaFiles.length} metadata files`);
    process.exit(1);
  }

  fs.mkdirSync(COOLER_META, { recursive: true });

  for (const file of metaFiles) {
    const tokenId = file.replace(".json", "");
    const raw = JSON.parse(fs.readFileSync(path.join(SOURCE_META, file), "utf8")) as TokenMeta;

    const meta: TokenMeta = {
      name: raw.name,
      description: raw.description.replace(
        /24×24 pixel art on #ccff00\./,
        "24×24 pixel art on #ccff00 — Hood Forged mint image.",
      ),
      image: `ipfs://${PLACEHOLDER_CID}/images/${tokenId}.png`,
      external_url: `https://unvoxd.site/share?f=${encodeURIComponent(
        (raw.attributes?.find((a) => a.trait_type === "Formula")?.value as string) ?? "",
      )}`,
      background_color: "ccff00",
      attributes: [
        ...(raw.attributes ?? []),
        { trait_type: "Art Style", value: "Pixel" },
        { trait_type: "Background", value: "#ccff00" },
        { trait_type: "Mint Image", value: "Cooler" },
      ],
    };

    const body = JSON.stringify(meta, null, 2);
    // Keep *.json for humans + tooling, and extensionless copies for SeaDrop tokenURI
    // (OpenSea appends tokenId only → ipfs://CID/metadata/1)
    fs.writeFileSync(path.join(COOLER_META, file), body, "utf8");
    fs.writeFileSync(path.join(COOLER_META, tokenId), body, "utf8");
  }

  const contract = {
    name: "Hood Forged",
    description:
      "3333 formula-forged pixel characters on #ccff00. Enter a math formula — structure and results become traits. Same formula = same character. Power fuels worker formula gathering.",
    image: `ipfs://${PLACEHOLDER_CID}/images/collection-banner.png`,
    banner_image: `ipfs://${PLACEHOLDER_CID}/images/collection-banner.png`,
    external_link: "https://unvoxd.site",
    seller_fee_basis_points: 500,
    fee_recipient: "0x0000000000000000000000000000000000000000",
  };

  fs.writeFileSync(
    path.join(COOLER, "contract.json"),
    JSON.stringify(contract, null, 2),
    "utf8",
  );

  const manifest = {
    placeholder_cid: PLACEHOLDER_CID,
    supply: metaFiles.length,
    token_base_uri: `ipfs://${PLACEHOLDER_CID}/metadata/`,
    image_base_uri: `ipfs://${PLACEHOLDER_CID}/images/`,
    structure: {
      images: "cooler/images/{tokenId}.png",
      metadata: "cooler/metadata/{tokenId}.json",
    },
    after_ipfs_upload: [
      "Replace REPLACE_ROOT_CID in cooler/metadata/*.json via: npx tsx scripts/apply-ipfs-cid.ts <CID>",
      "Set contract baseURI to ipfs://<CID>/metadata/",
      "Set contractURI to ipfs://<CID>/contract.json (upload contract.json to IPFS root)",
    ],
  };

  fs.writeFileSync(
    path.join(COOLER, "ipfs-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );

  fs.writeFileSync(
    path.join(COOLER, "MINT.md"),
    `# Hood Forged — Buyer mint on OpenSea (Robinhood Chain)

Mint image = **cooler** pixel PNGs only (not forge SVG).
Buyers mint. You upload assets + deploy drop. You do **not** mint all 3333 yourself.

## Folder layout

\`\`\`
opensea-export/cooler/
  images/1.png … 3333.png
  metadata/1 … 3333          ← extensionless (required for OpenSea tokenURI)
  metadata/1.json … 3333.json ← same content (backup / tooling)
  contract.json
  ipfs-manifest.json
\`\`\`

## A. Before anything

1. Wallet with **ETH on Robinhood Chain** (bridge from Ethereum).
2. Set royalty wallet in \`contract.json\` → \`fee_recipient\` (not \`0x000…\`).
3. Optional: copy banner to \`images/collection-banner.png\` + logo for OpenSea.

## B. Upload IPFS (Pinata)

Upload as **one folder** so you get a single root CID:

\`\`\`
<CID>/
  images/
  metadata/
  contract.json
\`\`\`

Then apply CID locally and **re-upload metadata** (or apply CID first, then upload once):

\`\`\`bash
npx tsx scripts/apply-ipfs-cid.ts <YOUR_CID>
\`\`\`

## C. OpenSea Studio drop (buyer mint)

1. Go to [opensea.io/studio](https://opensea.io/studio) → **Drop a collection**
2. Deploy contract:
   - Name: \`Hood Forged\`
   - Symbol: \`HOOD\`
   - Chain: **Robinhood Chain**
3. Collection settings: description, logo, banner, socials, creator earnings (5%)
4. **Metadata** (pick one):
   - **Recommended:** self-host IPFS → on explorer call \`setBaseURI\` = \`ipfs://<CID>/metadata/\` (trailing slash)
   - Or Studio Media upload + CSV (loses numeric Power / stats traits)
5. Optional: \`setContractURI\` = \`ipfs://<CID>/contract.json\`
6. **Drop Setup**:
   - Limited edition
   - Supply: **3333**
   - Public stage: price, start time, per-wallet limit
   - Optional WL stage before public
7. Customize drop landing page → **Publish drop**
8. Buyers mint on your OpenSea drop page (they pay mint + gas)

## D. After mint starts

- OpenSea indexes traits from your metadata JSON
- If you used Studio upload path: run **Complete Reveal** after mint (or when ready)
- If self-hosted + \`setBaseURI\` before mint: traits show as tokens mint (instant if baseURI already set)

## Values cheat sheet

| Field | Value |
|---|---|
| Supply | 3333 |
| Symbol | HOOD |
| baseURI | \`ipfs://<CID>/metadata/\` |
| contractURI | \`ipfs://<CID>/contract.json\` |
| Mint image | cooler PNG only |
`,
    "utf8",
  );

  console.log(`Prepared ${metaFiles.length} cooler mint metadata files`);
  console.log(`  images:   ${COOLER_IMG}`);
  console.log(`  metadata: ${COOLER_META}`);
  console.log(`  guide:    ${path.join(COOLER, "MINT.md")}`);
}

main();

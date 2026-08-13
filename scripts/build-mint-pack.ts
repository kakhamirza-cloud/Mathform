/**
 * Build final Hood Forged mint pack (3333):
 *   tokens 1–3311  → cooler formula pixel art
 *   tokens 3312–3331 → exclusive 1/1s (from 1-1 (2))
 *   tokens 3332–3333 → royalties / honoraries
 *
 * Usage: npx tsx scripts/build-mint-pack.ts
 *
 * Output: opensea-export/mint/{images,metadata,contract.json,MINT.md}
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "opensea-export");
const COOLER_IMG = path.join(ROOT, "cooler", "images");
const COOLER_META = path.join(ROOT, "cooler", "metadata");
const ONEOFONE_IMG = path.join(ROOT, "1-1 (2)", "images");
const ONEOFONE_META = path.join(ROOT, "1-1 (2)", "metadata");
const ONEOFONE_COL = path.join(ROOT, "1-1 (2)", "collection.json");
const ROYALTIES_DIR = path.join(ROOT, "Royalties");
const OUT = path.join(ROOT, "mint");
const OUT_IMG = path.join(OUT, "images");
const OUT_META = path.join(OUT, "metadata");

const SUPPLY = 3333;
const COOLER_COUNT = 3311; // 3333 - 20 - 2
const ONEOFONE_START = 3312;
const ROYALTY_START = 3332;
const PLACEHOLDER = "REPLACE_ROOT_CID";

type Attr = { trait_type: string; value: string | number; display_type?: string };
type TokenMeta = {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  background_color?: string;
  attributes: Attr[];
};

const ROYALTIES: Array<{
  file: string;
  name: string;
  theme: string;
  description: string;
  traits: Attr[];
}> = [
  {
    file: "hood-forged-honorary-reference.png",
    name: "Surreal Honorary",
    theme: "Surreal",
    description:
      "Hood Forged royalty honorary — surreal stalk-eye portrait. Reserved creator royalty piece.",
    traits: [
      { trait_type: "Theme", value: "Surreal" },
      { trait_type: "Headdress", value: "Pink Skull Cap" },
      { trait_type: "Eyes", value: "Stalk" },
      { trait_type: "Clothes", value: "Red Plaid" },
      { trait_type: "Skin", value: "Lavender" },
    ],
  },
  {
    file: "hood-forged-honorary-doodles.png",
    name: "Crown Honorary",
    theme: "Crown",
    description:
      "Hood Forged royalty honorary — crown + shades portrait. Reserved creator royalty piece.",
    traits: [
      { trait_type: "Theme", value: "Crown" },
      { trait_type: "Headwear", value: "Gold Crown" },
      { trait_type: "Eyes", value: "Blue Shades" },
      { trait_type: "Clothes", value: "White Collar" },
      { trait_type: "Skin", value: "Peach" },
    ],
  },
];

function ensureDirs() {
  fs.mkdirSync(OUT_IMG, { recursive: true });
  fs.mkdirSync(OUT_META, { recursive: true });
}

function writeMeta(tokenId: number, meta: TokenMeta) {
  meta.image = `ipfs://${PLACEHOLDER}/images/${tokenId}.png`;
  meta.background_color = "ccff00";
  const body = JSON.stringify(meta, null, 2);
  fs.writeFileSync(path.join(OUT_META, `${tokenId}.json`), body, "utf8");
  // SeaDrop tokenURI appends id without .json
  fs.writeFileSync(path.join(OUT_META, String(tokenId)), body, "utf8");
}

function copyPng(src: string, tokenId: number) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing image: ${src}`);
  }
  fs.copyFileSync(src, path.join(OUT_IMG, `${tokenId}.png`));
}

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

function main() {
  ensureDirs();

  if (!fs.existsSync(COOLER_IMG) || !fs.existsSync(COOLER_META)) {
    throw new Error("Missing cooler images/metadata — run prepare-cooler-mint first");
  }
  if (!fs.existsSync(ONEOFONE_IMG) || !fs.existsSync(ONEOFONE_META)) {
    throw new Error("Missing 1-1 (2) images/metadata");
  }

  const oneOfOneCol = readJson<{
    items: Array<{ tokenId: number; id: string; name: string }>;
  }>(ONEOFONE_COL);

  console.log(`Building mint pack → ${OUT}`);
  console.log(`  1–${COOLER_COUNT}: cooler`);
  console.log(`  ${ONEOFONE_START}–${ROYALTY_START - 1}: exclusive 1/1 (${oneOfOneCol.items.length})`);
  console.log(`  ${ROYALTY_START}–${SUPPLY}: royalties (${ROYALTIES.length})`);

  // ── Cooler 1..3311 ─────────────────────────────────────────────
  for (let id = 1; id <= COOLER_COUNT; id++) {
    const srcImg = path.join(COOLER_IMG, `${id}.png`);
    const srcMetaPath = path.join(COOLER_META, `${id}.json`);
    if (!fs.existsSync(srcImg) || !fs.existsSync(srcMetaPath)) {
      throw new Error(`Missing cooler token ${id}`);
    }
    copyPng(srcImg, id);
    const raw = readJson<TokenMeta>(srcMetaPath);
    const attrs = (raw.attributes ?? []).filter(
      (a) => a.trait_type !== "Mint Image" && a.trait_type !== "Edition",
    );
    attrs.push({ trait_type: "Edition", value: "Standard" });
    attrs.push({ trait_type: "Mint Image", value: "Cooler" });
    writeMeta(id, {
      name: raw.name.replace(/#\d+$/, `#${id}`),
      description: raw.description,
      image: "",
      external_url: raw.external_url ?? "https://unvoxd.site",
      attributes: attrs,
    });
    if (id % 500 === 0) console.log(`  cooler ${id}/${COOLER_COUNT}`);
  }

  // ── Exclusive 1/1 → 3312..3331 ──────────────────────────────────
  oneOfOneCol.items.forEach((item, index) => {
    const tokenId = ONEOFONE_START + index;
    const srcId = item.tokenId;
    copyPng(path.join(ONEOFONE_IMG, `${srcId}.png`), tokenId);
    const raw = readJson<TokenMeta>(path.join(ONEOFONE_META, `${srcId}.json`));
    const attrs = (raw.attributes ?? []).filter((a) => a.trait_type !== "Edition");
    attrs.unshift({ trait_type: "Edition", value: "1/1" });
    attrs.push({ trait_type: "Mint Image", value: "Exclusive" });
    writeMeta(tokenId, {
      name: `${item.name} #${tokenId}`,
      description: `${raw.description} Token #${tokenId} in the Hood Forged 3333 drop.`,
      image: "",
      external_url: "https://unvoxd.site",
      attributes: attrs,
    });
    console.log(`  1/1 ${tokenId}: ${item.name}`);
  });

  // ── Royalties → 3332..3333 ─────────────────────────────────────
  ROYALTIES.forEach((royalty, index) => {
    const tokenId = ROYALTY_START + index;
    copyPng(path.join(ROYALTIES_DIR, royalty.file), tokenId);
    writeMeta(tokenId, {
      name: `${royalty.name} #${tokenId}`,
      description: royalty.description,
      image: "",
      external_url: "https://unvoxd.site",
      attributes: [
        { trait_type: "Edition", value: "Royalty" },
        { trait_type: "Series", value: "Honorary" },
        ...royalty.traits,
        { trait_type: "Style", value: "Pixel" },
        { trait_type: "Background", value: "#ccff00" },
        { trait_type: "Rarity", value: "Royalty" },
        { trait_type: "Mint Image", value: "Royalty" },
      ],
    });
    console.log(`  royalty ${tokenId}: ${royalty.name}`);
  });

  // Banner if present
  const bannerSrc = path.join(COOLER_IMG, "collection-banner.png");
  if (fs.existsSync(bannerSrc)) {
    fs.copyFileSync(bannerSrc, path.join(OUT_IMG, "collection-banner.png"));
  }

  const contract = {
    name: "Hood Forged",
    description:
      "3333 Hood Forged pixel characters on #ccff00 — 3311 formula cooler mints, 20 exclusive 1/1s, and 2 royalty honoraries. Same formula = same character.",
    image: `ipfs://${PLACEHOLDER}/images/collection-banner.png`,
    banner_image: `ipfs://${PLACEHOLDER}/images/collection-banner.png`,
    external_link: "https://unvoxd.site",
    seller_fee_basis_points: 500,
    fee_recipient: "0x0000000000000000000000000000000000000000",
  };
  fs.writeFileSync(path.join(OUT, "contract.json"), JSON.stringify(contract, null, 2), "utf8");

  const specials = [
    ...oneOfOneCol.items.map((item, i) => ({
      tokenId: ONEOFONE_START + i,
      edition: "1/1",
      name: item.name,
      id: item.id,
    })),
    ...ROYALTIES.map((r, i) => ({
      tokenId: ROYALTY_START + i,
      edition: "Royalty",
      name: r.name,
      id: r.theme.toLowerCase(),
    })),
  ];

  fs.writeFileSync(
    path.join(OUT, "collection.json"),
    JSON.stringify(
      {
        name: "Hood Forged",
        symbol: "HOOD",
        supply: SUPPLY,
        breakdown: {
          cooler: COOLER_COUNT,
          exclusive_1of1: oneOfOneCol.items.length,
          royalties: ROYALTIES.length,
        },
        ranges: {
          cooler: `1-${COOLER_COUNT}`,
          exclusive_1of1: `${ONEOFONE_START}-${ROYALTY_START - 1}`,
          royalties: `${ROYALTY_START}-${SUPPLY}`,
        },
        specials,
      },
      null,
      2,
    ),
    "utf8",
  );

  fs.writeFileSync(
    path.join(OUT, "ipfs-manifest.json"),
    JSON.stringify(
      {
        placeholder_cid: PLACEHOLDER,
        supply: SUPPLY,
        token_base_uri: `ipfs://${PLACEHOLDER}/metadata/`,
        image_base_uri: `ipfs://${PLACEHOLDER}/images/`,
        after_ipfs_upload: [
          "npx tsx scripts/apply-ipfs-cid.ts <CID> --mint",
          "setBaseURI → ipfs://<CID>/metadata/",
          "setContractURI → ipfs://<CID>/contract.json",
        ],
      },
      null,
      2,
    ),
    "utf8",
  );

  fs.writeFileSync(
    path.join(OUT, "MINT.md"),
    `# Hood Forged — final mint pack (3333)

Upload this folder to IPFS for OpenSea buyer mint on Robinhood Chain.

## Supply breakdown

| Token IDs | Count | Content |
|---|---|---|
| 1 – ${COOLER_COUNT} | ${COOLER_COUNT} | Cooler formula pixel art |
| ${ONEOFONE_START} – ${ROYALTY_START - 1} | 20 | Exclusive 1/1 characters |
| ${ROYALTY_START} – ${SUPPLY} | 2 | Royalty honoraries |

Total = **3333** (22 cooler slots replaced by specials)

## Upload

\`\`\`
opensea-export/mint/
  images/
  metadata/
  contract.json
\`\`\`

1. Set \`fee_recipient\` in \`contract.json\`
2. Upload folder to Pinata → get CID
3. \`npx tsx scripts/apply-ipfs-cid.ts <CID> --mint\`
4. Re-upload metadata if CID was applied after first pin
5. OpenSea Studio Drop on Robinhood Chain → \`setBaseURI\` = \`ipfs://<CID>/metadata/\`
`,
    "utf8",
  );

  // Sanity counts
  const pngs = fs.readdirSync(OUT_IMG).filter((f) => /^\d+\.png$/.test(f)).length;
  const metas = fs.readdirSync(OUT_META).filter((f) => /^\d+\.json$/.test(f)).length;
  if (pngs !== SUPPLY || metas !== SUPPLY) {
    throw new Error(`Count mismatch: ${pngs} pngs, ${metas} json (expected ${SUPPLY})`);
  }

  console.log(`\nDone → ${OUT}`);
  console.log(`  ${pngs} images + ${metas} metadata`);
}

main();

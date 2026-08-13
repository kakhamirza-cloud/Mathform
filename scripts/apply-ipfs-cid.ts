/**
 * Replace REPLACE_ROOT_CID in mint metadata with your IPFS CID.
 *
 * Usage:
 *   npx tsx scripts/apply-ipfs-cid.ts <CID>          # opensea-export/mint (default)
 *   npx tsx scripts/apply-ipfs-cid.ts <CID> --cooler # opensea-export/cooler
 *   npx tsx scripts/apply-ipfs-cid.ts <CID> --mint   # opensea-export/mint
 */
import fs from "fs";
import path from "path";

const PLACEHOLDER = "REPLACE_ROOT_CID";

function main() {
  const args = process.argv.slice(2);
  const cid = args.find((a) => !a.startsWith("--"))?.trim();
  const useCooler = args.includes("--cooler");
  const folder = useCooler ? "cooler" : "mint";

  if (!cid || cid === PLACEHOLDER) {
    console.error("Usage: npx tsx scripts/apply-ipfs-cid.ts <IPFS_CID> [--mint|--cooler]");
    process.exit(1);
  }

  const root = path.join(process.cwd(), "opensea-export", folder);
  const metaDir = path.join(root, "metadata");

  if (!fs.existsSync(metaDir)) {
    console.error(`Missing ${metaDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(metaDir).filter((f) => f.endsWith(".json") || /^\d+$/.test(f));
  let updated = 0;

  for (const file of files) {
    const p = path.join(metaDir, file);
    const text = fs.readFileSync(p, "utf8");
    if (!text.includes(PLACEHOLDER)) continue;
    fs.writeFileSync(p, text.replaceAll(PLACEHOLDER, cid), "utf8");
    updated++;
  }

  for (const name of ["contract.json", "ipfs-manifest.json"]) {
    const p = path.join(root, name);
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, "utf8");
    fs.writeFileSync(p, text.replaceAll(PLACEHOLDER, cid), "utf8");
  }

  console.log(`Updated ${updated} files in opensea-export/${folder}`);
  console.log(`  baseURI → ipfs://${cid}/metadata/`);
  console.log(`  contractURI → ipfs://${cid}/contract.json`);
}

main();

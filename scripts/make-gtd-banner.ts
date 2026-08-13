/**
 * Compose Hood Forged GTD partner-community tweet banner
 * using the exact uploaded community images.
 *
 * Usage: npx tsx scripts/make-gtd-banner.ts
 */
import fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const ASSETS =
  "C:/Users/Mirza/.cursor/projects/d-Cursor-Project-unvoxd-nft/assets";

const COMMUNITY_FILES = [
  "c__Users_Mirza_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_lCzH55La_400x400-7ddee248-ca2e-47fe-b337-b8a5f35dd33e.png",
  "c__Users_Mirza_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_8a7YE2Ss_400x400-e5789338-4b70-489c-ba2b-1d08302ebde4.png",
  "c__Users_Mirza_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_VBF_LA_Z_400x400-d5a158f1-5add-4657-a9b4-2262d6ab400a.png",
  "c__Users_Mirza_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_fjkB0TGS_400x400-84f6c167-d539-4529-8dc6-5490f0f5d10b.png",
  "c__Users_Mirza_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_p-agm8B__400x400-872c381a-387f-4e32-836d-4a62ae83af9f.png",
  "c__Users_Mirza_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_F-XcE6gq_400x400-5e96ea44-014a-4b93-aff5-605fb5f06b1f.png",
  "c__Users_Mirza_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ZIfWwX3y_400x400-d89c6ae8-5fb2-485f-8d77-bd0995957266.png",
  "c__Users_Mirza_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Z9onTCpU_400x400-0b979f8a-15d3-4bb8-843a-e17cbf87c03c.png",
];

const W = 1500;
const H = 500;
const BG = "#ccff00";
const INK = "#18161c";

async function main() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // subtle pixel grid atmosphere
  ctx.fillStyle = "rgba(0,0,0,0.04)";
  for (let y = 0; y < H; y += 8) ctx.fillRect(0, y, W, 1);
  for (let x = 0; x < W; x += 8) ctx.fillRect(x, 0, 1, H);

  // Brand header
  ctx.fillStyle = INK;
  ctx.font = "bold 72px Arial Black, Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("HOOD FORGED", W / 2, 78);

  ctx.font = "bold 34px Arial, sans-serif";
  ctx.fillText("GTD WHITELIST", W / 2, 122);

  // Load all community images exactly
  const images = [];
  for (const file of COMMUNITY_FILES) {
    const full = path.join(ASSETS, file);
    if (!fs.existsSync(full)) throw new Error(`Missing ${full}`);
    images.push(await loadImage(full));
  }

  // 8 equal tiles in one row
  const gap = 18;
  const sidePad = 40;
  const tile = Math.floor((W - sidePad * 2 - gap * (images.length - 1)) / images.length);
  const rowY = 160;
  const startX = Math.floor((W - (tile * images.length + gap * (images.length - 1))) / 2);

  images.forEach((img, i) => {
    const x = startX + i * (tile + gap);
    // black pixel frame
    ctx.fillStyle = INK;
    ctx.fillRect(x - 4, rowY - 4, tile + 8, tile + 8);
    ctx.fillStyle = BG;
    ctx.fillRect(x - 2, rowY - 2, tile + 4, tile + 4);
    ctx.fillStyle = INK;
    ctx.fillRect(x - 1, rowY - 1, tile + 2, tile + 2);
    ctx.drawImage(img, x, rowY, tile, tile);
  });

  // bottom caption bar
  ctx.fillStyle = INK;
  ctx.fillRect(0, H - 48, W, 48);
  ctx.fillStyle = BG;
  ctx.font = "bold 22px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GUARANTEED ACCESS  ·  @HoodForged  ·  unvoxd.site", W / 2, H - 18);

  const out = path.join(process.cwd(), "marketing", "hood-forged-gtd-communities-banner.png");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, canvas.toBuffer("image/png"));
  console.log(`Wrote ${out}`);
  console.log(`Included ${images.length} community images`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

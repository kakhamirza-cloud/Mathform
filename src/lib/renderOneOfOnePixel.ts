/**
 * Hand-drawn 1/1 Hood Forged pixel busts — same 24×24 grid + upscale as renderPixelArt.
 */
import { createRng } from "./rng";

const GRID = 24;
const SCALE = 20;
const SIZE = GRID * SCALE;
const BG: [number, number, number] = [204, 255, 0];

export type RGB = [number, number, number];

export type OneOfOneTheme = {
  id: string;
  name: string;
  seed: number;
  draw: (buf: Uint8ClampedArray) => RGB;
};

function setPx(buf: Uint8ClampedArray, x: number, y: number, rgb: RGB) {
  if (x < 0 || y < 0 || x >= GRID || y >= GRID) return;
  const i = (y * GRID + x) * 4;
  buf[i] = rgb[0];
  buf[i + 1] = rgb[1];
  buf[i + 2] = rgb[2];
  buf[i + 3] = 255;
}

function fillRect(
  buf: Uint8ClampedArray,
  x0: number,
  y0: number,
  w: number,
  h: number,
  rgb: RGB,
) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) setPx(buf, x, y, rgb);
  }
}

function createGrid(): {
  buf: Uint8ClampedArray;
  finish: (seed: number, ink: RGB) => HTMLCanvasElement;
} {
  const low = document.createElement("canvas") as HTMLCanvasElement & {
    width: number;
    height: number;
    getContext: (t: string) => CanvasRenderingContext2D | null;
  };
  low.width = GRID;
  low.height = GRID;
  const lowCtx = low.getContext("2d");
  if (!lowCtx) {
    return {
      buf: new Uint8ClampedArray(GRID * GRID * 4),
      finish: () => {
        const empty = document.createElement("canvas") as HTMLCanvasElement;
        empty.width = SIZE;
        empty.height = SIZE;
        return empty;
      },
    };
  }

  const img = lowCtx.createImageData(GRID, GRID);
  return {
    buf: img.data,
    finish(seed: number, ink: RGB) {
      lowCtx.putImageData(img, 0, 0);

      const canvas = document.createElement("canvas") as HTMLCanvasElement;
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return canvas;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(low, 0, 0, SIZE, SIZE);

      const rng = createRng(seed ^ 0x51ed);
      ctx.fillStyle = `rgb(${ink[0]},${ink[1]},${ink[2]})`;
      for (let i = 0; i < 24; i++) {
        if (rng.next() > 0.45) {
          ctx.fillRect(i * SCALE, SIZE - SCALE, SCALE, SCALE);
        }
      }

      return canvas;
    },
  };
}

function cornerAccents(buf: Uint8ClampedArray, a: RGB, b: RGB) {
  setPx(buf, 1, 1, a);
  setPx(buf, 22, 1, b);
}

function drawBust(
  buf: Uint8ClampedArray,
  skin: RGB,
  body: RGB,
  ink: RGB,
) {
  fillRect(buf, 4, 18, 16, 5, body);
  fillRect(buf, 5, 17, 14, 1, body);
  fillRect(buf, 10, 15, 4, 3, skin);
  fillRect(buf, 7, 4, 10, 1, skin);
  fillRect(buf, 6, 5, 12, 11, skin);
  for (let y = 5; y <= 15; y++) {
    setPx(buf, 5, y, ink);
    setPx(buf, 18, y, ink);
  }
}

function dotEyes(buf: Uint8ClampedArray, ink: RGB, accent?: RGB) {
  setPx(buf, 9, 8, ink);
  setPx(buf, 14, 8, ink);
  if (accent) {
    setPx(buf, 9, 8, accent);
    setPx(buf, 14, 8, accent);
  }
}

function lineMouth(buf: Uint8ClampedArray, ink: RGB, y = 12) {
  fillRect(buf, 10, y, 4, 1, ink);
}

// ── 20 themed 1/1 busts ─────────────────────────────────────────────

function drawVampire(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [24, 18, 32];
  const skin: RGB = [228, 220, 228];
  const black: RGB = [32, 28, 36];
  const red: RGB = [196, 32, 48];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, red);
  drawBust(buf, skin, black, ink);
  fillRect(buf, 7, 2, 10, 3, black);
  fillRect(buf, 8, 1, 8, 1, black);
  dotEyes(buf, ink, red);
  setPx(buf, 10, 12, red);
  setPx(buf, 13, 12, red);
  fillRect(buf, 9, 13, 6, 1, ink);
  fillRect(buf, 6, 16, 3, 2, black);
  fillRect(buf, 15, 16, 3, 2, black);
  return ink;
}

function drawDragon(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [20, 28, 18];
  const scale: RGB = [48, 148, 72];
  const scaleDark: RGB = [28, 98, 48];
  const horn: RGB = [248, 214, 88];
  const eye: RGB = [255, 228, 64];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, horn);
  drawBust(buf, scale, scaleDark, ink);
  setPx(buf, 8, 1, horn);
  setPx(buf, 15, 1, horn);
  setPx(buf, 11, 0, horn);
  fillRect(buf, 9, 6, 6, 3, scaleDark);
  fillRect(buf, 10, 9, 4, 2, scaleDark);
  dotEyes(buf, ink, eye);
  fillRect(buf, 10, 12, 4, 2, ink);
  setPx(buf, 11, 13, scale);
  setPx(buf, 12, 13, scale);
  return ink;
}

function drawRobot(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [24, 24, 28];
  const metal: RGB = [168, 176, 188];
  const metalDark: RGB = [108, 116, 132];
  const red: RGB = [228, 48, 48];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, red);
  drawBust(buf, metal, metalDark, ink);
  fillRect(buf, 7, 3, 10, 2, metalDark);
  setPx(buf, 12, 0, metal);
  setPx(buf, 12, 1, metalDark);
  fillRect(buf, 8, 7, 3, 3, ink);
  fillRect(buf, 13, 7, 3, 3, ink);
  setPx(buf, 9, 8, red);
  setPx(buf, 14, 8, red);
  fillRect(buf, 10, 12, 4, 1, metalDark);
  setPx(buf, 11, 16, red);
  setPx(buf, 12, 16, red);
  setPx(buf, 6, 19, metalDark);
  setPx(buf, 17, 19, metalDark);
  return ink;
}

function drawWizard(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [28, 22, 48];
  const skin: RGB = [212, 188, 156];
  const robe: RGB = [68, 58, 148];
  const hat: RGB = [48, 38, 128];
  const star: RGB = [255, 228, 96];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, star);
  drawBust(buf, skin, robe, ink);
  fillRect(buf, 8, 0, 8, 3, hat);
  setPx(buf, 7, 2, hat);
  setPx(buf, 16, 2, hat);
  setPx(buf, 12, 1, star);
  fillRect(buf, 10, 10, 4, 2, skin);
  setPx(buf, 10, 11, ink);
  setPx(buf, 13, 11, ink);
  dotEyes(buf, ink);
  lineMouth(buf, ink);
  fillRect(buf, 3, 6, 1, 10, ink);
  setPx(buf, 3, 5, star);
  return ink;
}

function drawDemon(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [24, 16, 20];
  const skin: RGB = [168, 32, 48];
  const skinDark: RGB = [108, 22, 32];
  const horn: RGB = [32, 24, 28];
  const eye: RGB = [255, 228, 64];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, eye);
  drawBust(buf, skin, skinDark, ink);
  setPx(buf, 7, 2, horn);
  setPx(buf, 16, 2, horn);
  setPx(buf, 8, 1, horn);
  setPx(buf, 15, 1, horn);
  dotEyes(buf, ink, eye);
  fillRect(buf, 10, 12, 4, 2, ink);
  setPx(buf, 10, 12, eye);
  setPx(buf, 13, 12, eye);
  return ink;
}

function drawGhost(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [48, 48, 72];
  const ghost: RGB = [228, 232, 248];
  const ghostDark: RGB = [188, 196, 228];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, ghostDark);
  fillRect(buf, 6, 5, 12, 13, ghost);
  fillRect(buf, 7, 4, 10, 1, ghost);
  fillRect(buf, 4, 18, 16, 5, ghost);
  fillRect(buf, 5, 17, 14, 1, ghost);
  fillRect(buf, 8, 7, 3, 3, ink);
  fillRect(buf, 13, 7, 3, 3, ink);
  fillRect(buf, 10, 13, 4, 1, ink);
  setPx(buf, 5, 21, ghostDark);
  setPx(buf, 8, 22, ghost);
  setPx(buf, 12, 22, ghostDark);
  setPx(buf, 16, 21, ghost);
  setPx(buf, 18, 20, ghostDark);
  return ink;
}

function drawKnight(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [24, 24, 28];
  const steel: RGB = [176, 184, 196];
  const steelDark: RGB = [108, 116, 128];
  const red: RGB = [168, 32, 40];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, red);
  drawBust(buf, steel, steelDark, ink);
  fillRect(buf, 7, 2, 10, 4, steel);
  fillRect(buf, 8, 1, 8, 1, steel);
  fillRect(buf, 10, 8, 4, 2, ink);
  setPx(buf, 11, 9, steel);
  setPx(buf, 12, 9, steel);
  fillRect(buf, 6, 16, 3, 2, steelDark);
  fillRect(buf, 15, 16, 3, 2, steelDark);
  setPx(buf, 12, 0, red);
  return ink;
}

function drawAlien(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [16, 32, 24];
  const skin: RGB = [108, 196, 128];
  const skinDark: RGB = [68, 148, 88];
  const eye: RGB = [24, 24, 28];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, skinDark);
  drawBust(buf, skin, skinDark, ink);
  setPx(buf, 11, 0, skin);
  setPx(buf, 12, 0, skin);
  fillRect(buf, 8, 7, 3, 4, eye);
  fillRect(buf, 13, 7, 3, 4, eye);
  setPx(buf, 9, 8, skin);
  setPx(buf, 14, 8, skin);
  lineMouth(buf, ink, 13);
  return ink;
}

function drawWerewolf(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [24, 20, 16];
  const fur: RGB = [132, 96, 64];
  const furDark: RGB = [88, 60, 40];
  const eye: RGB = [255, 214, 48];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, eye);
  drawBust(buf, fur, furDark, ink);
  setPx(buf, 6, 4, fur);
  setPx(buf, 17, 4, fur);
  setPx(buf, 5, 5, fur);
  setPx(buf, 18, 5, fur);
  fillRect(buf, 10, 9, 4, 2, furDark);
  dotEyes(buf, ink, eye);
  fillRect(buf, 10, 12, 4, 2, ink);
  setPx(buf, 11, 12, fur);
  setPx(buf, 12, 12, fur);
  return ink;
}

function drawPhoenix(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [32, 16, 8];
  const feather: RGB = [255, 128, 32];
  const featherDark: RGB = [196, 64, 24];
  const flame: RGB = [255, 228, 64];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, flame);
  drawBust(buf, feather, featherDark, ink);
  setPx(buf, 10, 0, flame);
  setPx(buf, 13, 0, flame);
  setPx(buf, 11, 0, feather);
  setPx(buf, 12, 0, feather);
  setPx(buf, 4, 6, flame);
  setPx(buf, 19, 6, flame);
  dotEyes(buf, ink, flame);
  fillRect(buf, 10, 12, 4, 1, ink);
  return ink;
}

function drawSkeleton(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [24, 24, 28];
  const bone: RGB = [228, 224, 208];
  const boneDark: RGB = [188, 180, 164];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, boneDark);
  drawBust(buf, bone, boneDark, ink);
  fillRect(buf, 8, 7, 3, 3, ink);
  fillRect(buf, 13, 7, 3, 3, ink);
  fillRect(buf, 10, 12, 4, 2, ink);
  setPx(buf, 11, 13, bone);
  setPx(buf, 12, 13, bone);
  setPx(buf, 10, 3, bone);
  setPx(buf, 13, 3, bone);
  return ink;
}

function drawCyborg(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [24, 24, 28];
  const skin: RGB = [196, 168, 148];
  const metal: RGB = [128, 136, 148];
  const glow: RGB = [64, 228, 255];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, glow);
  fillRect(buf, 4, 18, 16, 5, metal);
  fillRect(buf, 5, 17, 14, 1, metal);
  fillRect(buf, 10, 15, 4, 3, skin);
  fillRect(buf, 6, 5, 6, 11, skin);
  fillRect(buf, 12, 5, 6, 11, metal);
  fillRect(buf, 7, 4, 10, 1, skin);
  for (let y = 5; y <= 15; y++) {
    setPx(buf, 5, y, ink);
    setPx(buf, 18, y, ink);
    setPx(buf, 11, y, ink);
  }
  setPx(buf, 9, 8, ink);
  fillRect(buf, 13, 7, 3, 3, glow);
  setPx(buf, 14, 8, ink);
  lineMouth(buf, ink);
  setPx(buf, 14, 10, glow);
  setPx(buf, 15, 11, glow);
  return ink;
}

function drawWitch(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [20, 28, 20];
  const skin: RGB = [148, 188, 128];
  const cloak: RGB = [48, 28, 68];
  const hat: RGB = [32, 18, 48];
  const purple: RGB = [168, 88, 228];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, purple);
  drawBust(buf, skin, cloak, ink);
  fillRect(buf, 9, 0, 6, 1, hat);
  fillRect(buf, 10, 1, 4, 2, hat);
  fillRect(buf, 8, 3, 8, 1, hat);
  dotEyes(buf, ink, purple);
  setPx(buf, 11, 12, ink);
  setPx(buf, 12, 12, ink);
  setPx(buf, 3, 8, purple);
  return ink;
}

function drawOrc(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [20, 24, 16];
  const skin: RGB = [88, 148, 72];
  const skinDark: RGB = [48, 98, 48];
  const tusk: RGB = [240, 232, 208];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, tusk);
  drawBust(buf, skin, skinDark, ink);
  fillRect(buf, 9, 2, 6, 2, skinDark);
  setPx(buf, 10, 1, skinDark);
  setPx(buf, 13, 1, skinDark);
  dotEyes(buf, ink);
  setPx(buf, 9, 12, tusk);
  setPx(buf, 14, 12, tusk);
  fillRect(buf, 10, 13, 4, 1, ink);
  return ink;
}

function drawAngel(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [32, 28, 48];
  const skin: RGB = [248, 232, 212];
  const robe: RGB = [248, 248, 255];
  const gold: RGB = [255, 214, 88];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, gold);
  drawBust(buf, skin, robe, ink);
  for (let x = 8; x <= 15; x++) setPx(buf, x, 1, gold);
  setPx(buf, 3, 8, robe);
  setPx(buf, 20, 8, robe);
  setPx(buf, 2, 10, gold);
  setPx(buf, 21, 10, gold);
  dotEyes(buf, ink);
  lineMouth(buf, ink);
  return ink;
}

function drawNinja(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [16, 16, 20];
  const black: RGB = [32, 32, 40];
  const blackDark: RGB = [20, 20, 28];
  const white: RGB = [240, 240, 248];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, white);
  drawBust(buf, black, blackDark, ink);
  fillRect(buf, 7, 4, 10, 9, black);
  fillRect(buf, 8, 7, 8, 2, white);
  setPx(buf, 9, 8, ink);
  setPx(buf, 14, 8, ink);
  setPx(buf, 12, 0, black);
  return ink;
}

function drawPirate(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [24, 20, 16];
  const skin: RGB = [196, 148, 108];
  const coat: RGB = [88, 48, 32];
  const bandana: RGB = [168, 32, 40];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, bandana);
  drawBust(buf, skin, coat, ink);
  fillRect(buf, 7, 3, 10, 2, bandana);
  fillRect(buf, 8, 2, 8, 1, bandana);
  setPx(buf, 9, 8, ink);
  fillRect(buf, 13, 7, 3, 3, ink);
  setPx(buf, 14, 8, skin);
  fillRect(buf, 10, 11, 4, 1, ink);
  setPx(buf, 11, 12, ink);
  setPx(buf, 12, 12, ink);
  return ink;
}

function drawSamurai(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [24, 20, 16];
  const armor: RGB = [48, 52, 68];
  const armorDark: RGB = [28, 32, 48];
  const red: RGB = [196, 48, 48];
  const skin: RGB = [212, 176, 140];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, red);
  fillRect(buf, 4, 18, 16, 5, armorDark);
  fillRect(buf, 5, 17, 14, 1, armor);
  fillRect(buf, 10, 15, 4, 2, skin);
  fillRect(buf, 7, 3, 10, 12, armor);
  fillRect(buf, 8, 2, 8, 1, armor);
  for (let y = 5; y <= 14; y++) {
    setPx(buf, 5, y, ink);
    setPx(buf, 18, y, ink);
  }
  fillRect(buf, 10, 9, 4, 1, ink);
  setPx(buf, 11, 10, skin);
  setPx(buf, 12, 10, skin);
  setPx(buf, 11, 1, red);
  setPx(buf, 12, 1, red);
  setPx(buf, 11, 0, red);
  return ink;
}

function drawLich(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [16, 24, 16];
  const bone: RGB = [148, 168, 132];
  const boneDark: RGB = [88, 108, 88];
  const crown: RGB = [168, 148, 48];
  const glow: RGB = [128, 255, 96];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, glow);
  drawBust(buf, bone, boneDark, ink);
  fillRect(buf, 8, 1, 8, 2, crown);
  setPx(buf, 7, 2, crown);
  setPx(buf, 16, 2, crown);
  fillRect(buf, 8, 7, 3, 2, glow);
  fillRect(buf, 13, 7, 3, 2, glow);
  fillRect(buf, 10, 12, 4, 2, ink);
  setPx(buf, 11, 13, bone);
  return ink;
}

function drawGolem(buf: Uint8ClampedArray): RGB {
  const ink: RGB = [24, 24, 28];
  const stone: RGB = [132, 128, 120];
  const stoneDark: RGB = [88, 84, 76];
  const rune: RGB = [64, 228, 196];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  cornerAccents(buf, blue, rune);
  drawBust(buf, stone, stoneDark, ink);
  setPx(buf, 8, 6, stoneDark);
  setPx(buf, 15, 8, stoneDark);
  setPx(buf, 10, 14, stoneDark);
  fillRect(buf, 8, 7, 3, 2, rune);
  fillRect(buf, 13, 7, 3, 2, rune);
  fillRect(buf, 10, 12, 4, 1, stoneDark);
  setPx(buf, 11, 12, ink);
  setPx(buf, 12, 12, ink);
  return ink;
}

export const ONE_OF_ONE_THEMES: OneOfOneTheme[] = [
  { id: "vampire", name: "Vampire Hood Forged", seed: 0x100001, draw: drawVampire },
  { id: "dragon", name: "Dragon Hood Forged", seed: 0x100002, draw: drawDragon },
  { id: "robot", name: "Robot Hood Forged", seed: 0x100003, draw: drawRobot },
  { id: "wizard", name: "Wizard Hood Forged", seed: 0x100004, draw: drawWizard },
  { id: "demon", name: "Demon Hood Forged", seed: 0x100005, draw: drawDemon },
  { id: "ghost", name: "Ghost Hood Forged", seed: 0x100006, draw: drawGhost },
  { id: "knight", name: "Knight Hood Forged", seed: 0x100007, draw: drawKnight },
  { id: "alien", name: "Alien Hood Forged", seed: 0x100008, draw: drawAlien },
  { id: "werewolf", name: "Werewolf Hood Forged", seed: 0x100009, draw: drawWerewolf },
  { id: "phoenix", name: "Phoenix Hood Forged", seed: 0x10000a, draw: drawPhoenix },
  { id: "skeleton", name: "Skeleton Hood Forged", seed: 0x10000b, draw: drawSkeleton },
  { id: "cyborg", name: "Cyborg Hood Forged", seed: 0x10000c, draw: drawCyborg },
  { id: "witch", name: "Witch Hood Forged", seed: 0x10000d, draw: drawWitch },
  { id: "orc", name: "Orc Hood Forged", seed: 0x10000e, draw: drawOrc },
  { id: "angel", name: "Angel Hood Forged", seed: 0x10000f, draw: drawAngel },
  { id: "ninja", name: "Ninja Hood Forged", seed: 0x100010, draw: drawNinja },
  { id: "pirate", name: "Pirate Hood Forged", seed: 0x100011, draw: drawPirate },
  { id: "samurai", name: "Samurai Hood Forged", seed: 0x100012, draw: drawSamurai },
  { id: "lich", name: "Lich Hood Forged", seed: 0x100013, draw: drawLich },
  { id: "golem", name: "Golem Hood Forged", seed: 0x100014, draw: drawGolem },
];

export function renderOneOfOnePixel(theme: OneOfOneTheme): HTMLCanvasElement {
  const { buf, finish } = createGrid();
  const ink = theme.draw(buf);
  return finish(theme.seed, ink);
}

export function oneOfOnePixelToBuffer(
  canvas: HTMLCanvasElement & { toBuffer?: (mime: string) => Buffer },
): Buffer {
  if (typeof canvas.toBuffer === "function") {
    return canvas.toBuffer("image/png");
  }
  throw new Error("Canvas toBuffer unavailable");
}

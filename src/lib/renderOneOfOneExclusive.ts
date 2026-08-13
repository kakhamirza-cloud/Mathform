/**
 * Exclusive 1/1 Hood Forged busts — each piece is a unique pixel map, not a palette swap.
 */
import { createRng } from "./rng";

const GRID = 24;
const SCALE = 20;
const SIZE = GRID * SCALE;
const BG: [number, number, number] = [204, 255, 0];

export type RGB = [number, number, number];

export type ExclusiveTheme = {
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

      const rng = createRng(seed ^ 0x1a11);
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

const WHITE: RGB = [248, 248, 252];
const INK: RGB = [24, 22, 28];

function drawVampire(buf: Uint8ClampedArray): RGB {
  const skin: RGB = [236, 228, 236];
  const hair: RGB = [16, 12, 20];
  const cape: RGB = [96, 12, 28];
  const red: RGB = [196, 28, 44];
  const gold: RGB = [220, 168, 48];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, red);
  setPx(buf, 22, 1, gold);

  // high collar cape — silhouette goes up beside the face
  fillRect(buf, 3, 16, 18, 7, cape);
  fillRect(buf, 4, 12, 3, 5, cape);
  fillRect(buf, 17, 12, 3, 5, cape);
  fillRect(buf, 10, 18, 4, 5, hair);
  setPx(buf, 11, 20, gold);

  fillRect(buf, 7, 5, 10, 10, skin);
  fillRect(buf, 8, 4, 8, 1, skin);
  fillRect(buf, 10, 15, 4, 2, skin);
  for (let y = 5; y <= 14; y++) {
    setPx(buf, 6, y, INK);
    setPx(buf, 17, y, INK);
  }

  // widow's peak
  fillRect(buf, 7, 3, 10, 2, hair);
  setPx(buf, 11, 4, hair);
  setPx(buf, 12, 4, hair);
  setPx(buf, 8, 2, hair);
  setPx(buf, 15, 2, hair);

  // vertical slit eyes
  fillRect(buf, 9, 8, 1, 3, red);
  fillRect(buf, 14, 8, 1, 3, red);
  fillRect(buf, 10, 13, 4, 1, INK);
  setPx(buf, 10, 12, WHITE);
  setPx(buf, 13, 12, WHITE);
  return INK;
}

function drawDragon(buf: Uint8ClampedArray): RGB {
  const scale: RGB = [40, 124, 64];
  const dark: RGB = [20, 72, 40];
  const horn: RGB = [232, 196, 72];
  const fire: RGB = [255, 96, 24];
  const eye: RGB = [255, 220, 48];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, fire);
  setPx(buf, 22, 1, horn);

  fillRect(buf, 5, 17, 14, 6, dark);
  for (let y = 18; y <= 22; y++) {
    for (let x = 5; x <= 18; x++) {
      if ((x + y) % 2 === 0) setPx(buf, x, y, scale);
    }
  }

  // wider snouted head
  fillRect(buf, 6, 6, 12, 10, scale);
  fillRect(buf, 8, 4, 8, 2, scale);
  fillRect(buf, 9, 15, 6, 3, scale);
  fillRect(buf, 10, 16, 4, 2, dark);

  setPx(buf, 8, 1, horn);
  setPx(buf, 15, 1, horn);
  setPx(buf, 7, 2, horn);
  setPx(buf, 16, 2, horn);
  setPx(buf, 8, 3, dark);
  setPx(buf, 15, 3, dark);

  fillRect(buf, 8, 8, 2, 2, INK);
  fillRect(buf, 14, 8, 2, 2, INK);
  setPx(buf, 9, 8, eye);
  setPx(buf, 14, 8, eye);

  fillRect(buf, 10, 12, 4, 2, INK);
  setPx(buf, 11, 13, fire);
  setPx(buf, 12, 13, fire);
  setPx(buf, 11, 14, fire);
  setPx(buf, 2, 12, fire);
  setPx(buf, 3, 13, fire);
  setPx(buf, 21, 12, fire);
  setPx(buf, 20, 13, fire);
  return INK;
}

function drawRobot(buf: Uint8ClampedArray): RGB {
  const metal: RGB = [168, 176, 188];
  const dark: RGB = [88, 96, 112];
  const red: RGB = [228, 40, 48];
  const cyan: RGB = [48, 220, 255];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, cyan);
  setPx(buf, 22, 1, red);

  // box torso with panel seams
  fillRect(buf, 5, 16, 14, 7, dark);
  fillRect(buf, 7, 16, 10, 1, metal);
  setPx(buf, 8, 19, red);
  setPx(buf, 11, 19, cyan);
  setPx(buf, 15, 19, red);
  setPx(buf, 5, 18, metal);
  setPx(buf, 18, 18, metal);

  // square head + antenna
  fillRect(buf, 7, 4, 10, 11, metal);
  fillRect(buf, 11, 0, 2, 4, dark);
  setPx(buf, 11, 0, cyan);
  setPx(buf, 12, 0, cyan);
  for (let y = 4; y <= 14; y++) {
    setPx(buf, 6, y, INK);
    setPx(buf, 17, y, INK);
  }
  fillRect(buf, 7, 9, 10, 1, dark);

  fillRect(buf, 8, 6, 3, 3, INK);
  fillRect(buf, 13, 6, 3, 3, INK);
  setPx(buf, 9, 7, red);
  setPx(buf, 14, 7, cyan);
  fillRect(buf, 9, 12, 6, 1, dark);
  setPx(buf, 10, 12, INK);
  setPx(buf, 13, 12, INK);
  return INK;
}

function drawWizard(buf: Uint8ClampedArray): RGB {
  const skin: RGB = [212, 176, 132];
  const robe: RGB = [52, 40, 132];
  const hat: RGB = [32, 24, 96];
  const beard: RGB = [220, 220, 228];
  const star: RGB = [255, 220, 64];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, star);
  setPx(buf, 22, 1, robe);

  fillRect(buf, 4, 17, 16, 6, robe);
  fillRect(buf, 10, 17, 4, 6, hat);

  fillRect(buf, 7, 8, 10, 7, skin);
  fillRect(buf, 10, 15, 4, 2, skin);

  // tall pointed hat
  setPx(buf, 11, 0, hat);
  setPx(buf, 12, 0, hat);
  fillRect(buf, 10, 1, 4, 2, hat);
  fillRect(buf, 8, 3, 8, 2, hat);
  fillRect(buf, 6, 5, 12, 2, hat);
  fillRect(buf, 5, 6, 14, 1, hat);
  setPx(buf, 12, 2, star);

  setPx(buf, 9, 10, INK);
  setPx(buf, 14, 10, INK);
  fillRect(buf, 8, 13, 8, 4, beard);
  setPx(buf, 11, 14, INK);
  setPx(buf, 12, 14, INK);

  // staff
  fillRect(buf, 2, 7, 1, 15, [160, 112, 48]);
  setPx(buf, 2, 6, star);
  setPx(buf, 1, 7, star);
  setPx(buf, 3, 7, star);
  return INK;
}

function drawDemon(buf: Uint8ClampedArray): RGB {
  const skin: RGB = [168, 24, 40];
  const dark: RGB = [88, 12, 20];
  const horn: RGB = [28, 16, 20];
  const eye: RGB = [255, 220, 48];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, eye);
  setPx(buf, 22, 1, skin);

  fillRect(buf, 5, 17, 14, 6, dark);
  fillRect(buf, 9, 17, 6, 1, skin);

  // tapered head
  fillRect(buf, 8, 4, 8, 2, skin);
  fillRect(buf, 7, 6, 10, 10, skin);
  fillRect(buf, 10, 16, 4, 2, skin);
  for (let y = 6; y <= 15; y++) {
    setPx(buf, 6, y, INK);
    setPx(buf, 17, y, INK);
  }

  setPx(buf, 7, 1, horn);
  setPx(buf, 16, 1, horn);
  setPx(buf, 6, 2, horn);
  setPx(buf, 17, 2, horn);
  setPx(buf, 7, 3, horn);
  setPx(buf, 16, 3, horn);
  setPx(buf, 8, 3, skin);

  fillRect(buf, 9, 8, 2, 2, eye);
  fillRect(buf, 13, 8, 2, 2, eye);
  setPx(buf, 9, 8, INK);
  setPx(buf, 14, 8, INK);
  fillRect(buf, 9, 12, 6, 2, INK);
  setPx(buf, 9, 12, eye);
  setPx(buf, 14, 12, eye);
  return INK;
}

function drawGhost(buf: Uint8ClampedArray): RGB {
  const ghost: RGB = [228, 232, 248];
  const shade: RGB = [168, 180, 220];
  const gold: RGB = [220, 168, 48];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, shade);
  setPx(buf, 22, 1, gold);

  fillRect(buf, 7, 4, 10, 1, ghost);
  fillRect(buf, 6, 5, 12, 14, ghost);
  // wavy hem — no solid torso block
  setPx(buf, 5, 18, ghost);
  setPx(buf, 7, 19, ghost);
  setPx(buf, 9, 18, shade);
  setPx(buf, 11, 20, ghost);
  setPx(buf, 13, 18, ghost);
  setPx(buf, 15, 19, shade);
  setPx(buf, 17, 18, ghost);
  setPx(buf, 18, 20, shade);
  setPx(buf, 6, 21, ghost);
  setPx(buf, 10, 22, shade);
  setPx(buf, 14, 21, ghost);
  setPx(buf, 16, 22, ghost);

  fillRect(buf, 8, 7, 3, 4, INK);
  fillRect(buf, 13, 7, 3, 4, INK);
  setPx(buf, 9, 8, WHITE);
  setPx(buf, 14, 8, WHITE);
  fillRect(buf, 10, 14, 4, 1, shade);
  fillRect(buf, 9, 16, 6, 1, gold);
  setPx(buf, 11, 17, gold);
  return shade;
}

function drawKnight(buf: Uint8ClampedArray): RGB {
  const steel: RGB = [176, 184, 196];
  const dark: RGB = [88, 96, 112];
  const plume: RGB = [188, 24, 36];
  const gold: RGB = [220, 168, 48];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, gold);
  setPx(buf, 22, 1, plume);

  // pauldrons stick out
  fillRect(buf, 3, 16, 18, 7, dark);
  fillRect(buf, 3, 16, 4, 4, steel);
  fillRect(buf, 17, 16, 4, 4, steel);
  fillRect(buf, 10, 17, 4, 6, steel);
  setPx(buf, 11, 19, gold);

  // full helm — no skin
  fillRect(buf, 7, 4, 10, 12, steel);
  fillRect(buf, 8, 2, 8, 2, steel);
  fillRect(buf, 9, 1, 6, 1, dark);
  setPx(buf, 11, 0, plume);
  setPx(buf, 12, 0, plume);
  setPx(buf, 12, 1, plume);

  fillRect(buf, 10, 7, 4, 5, INK);
  setPx(buf, 11, 8, steel);
  setPx(buf, 12, 8, steel);
  setPx(buf, 11, 10, dark);
  setPx(buf, 12, 10, dark);
  return INK;
}

function drawAlien(buf: Uint8ClampedArray): RGB {
  const skin: RGB = [96, 196, 132];
  const dark: RGB = [48, 132, 88];
  const eye: RGB = [16, 16, 20];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, skin);
  setPx(buf, 22, 1, dark);

  // tiny body
  fillRect(buf, 8, 18, 8, 5, dark);
  fillRect(buf, 10, 16, 4, 3, skin);

  // oversized oval head
  fillRect(buf, 8, 2, 8, 1, skin);
  fillRect(buf, 6, 3, 12, 2, skin);
  fillRect(buf, 5, 5, 14, 10, skin);
  fillRect(buf, 7, 15, 10, 1, skin);
  setPx(buf, 11, 0, skin);
  setPx(buf, 12, 0, dark);

  fillRect(buf, 6, 7, 5, 6, eye);
  fillRect(buf, 13, 7, 5, 6, eye);
  setPx(buf, 7, 8, WHITE);
  setPx(buf, 14, 8, WHITE);
  fillRect(buf, 11, 14, 2, 1, INK);
  return INK;
}

function drawWerewolf(buf: Uint8ClampedArray): RGB {
  const fur: RGB = [140, 92, 52];
  const dark: RGB = [88, 52, 28];
  const eye: RGB = [255, 200, 32];
  const fang: RGB = [240, 232, 216];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, eye);
  setPx(buf, 22, 1, fur);

  fillRect(buf, 4, 17, 16, 6, dark);
  fillRect(buf, 9, 17, 6, 2, fur);

  fillRect(buf, 6, 6, 12, 10, fur);
  fillRect(buf, 8, 4, 8, 2, fur);
  fillRect(buf, 10, 16, 4, 2, fur);

  // pointed ears
  setPx(buf, 6, 2, fur);
  setPx(buf, 17, 2, fur);
  setPx(buf, 5, 3, fur);
  setPx(buf, 18, 3, fur);
  setPx(buf, 6, 4, dark);
  setPx(buf, 17, 4, dark);

  setPx(buf, 9, 8, eye);
  setPx(buf, 14, 8, eye);
  fillRect(buf, 10, 10, 4, 2, dark);
  fillRect(buf, 9, 12, 6, 3, INK);
  setPx(buf, 10, 12, fang);
  setPx(buf, 13, 12, fang);
  setPx(buf, 11, 14, fur);
  setPx(buf, 12, 14, fur);
  return INK;
}

function drawPhoenix(buf: Uint8ClampedArray): RGB {
  const orange: RGB = [255, 108, 24];
  const red: RGB = [196, 40, 16];
  const flame: RGB = [255, 220, 48];
  const beak: RGB = [255, 180, 32];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, flame);
  setPx(buf, 22, 1, red);

  fillRect(buf, 6, 17, 12, 6, red);
  fillRect(buf, 10, 17, 4, 6, orange);

  fillRect(buf, 7, 7, 10, 9, orange);
  fillRect(buf, 8, 5, 8, 2, orange);

  // flame crest
  setPx(buf, 11, 0, flame);
  setPx(buf, 12, 0, flame);
  setPx(buf, 9, 1, flame);
  setPx(buf, 14, 1, flame);
  setPx(buf, 10, 2, orange);
  setPx(buf, 13, 2, orange);
  setPx(buf, 11, 3, red);
  setPx(buf, 12, 3, red);

  // wing flares
  setPx(buf, 3, 8, flame);
  setPx(buf, 4, 9, orange);
  setPx(buf, 3, 10, red);
  setPx(buf, 20, 8, flame);
  setPx(buf, 19, 9, orange);
  setPx(buf, 20, 10, red);

  setPx(buf, 9, 9, INK);
  setPx(buf, 14, 9, INK);
  fillRect(buf, 10, 12, 4, 2, beak);
  setPx(buf, 11, 14, beak);
  setPx(buf, 12, 14, beak);
  return INK;
}

function drawSkeleton(buf: Uint8ClampedArray): RGB {
  const bone: RGB = [232, 224, 208];
  const dark: RGB = [168, 156, 140];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, bone);
  setPx(buf, 22, 1, dark);

  // ribcage chest
  fillRect(buf, 6, 17, 12, 6, dark);
  setPx(buf, 8, 18, bone);
  setPx(buf, 10, 19, bone);
  setPx(buf, 12, 18, bone);
  setPx(buf, 14, 19, bone);
  setPx(buf, 16, 18, bone);
  fillRect(buf, 11, 17, 2, 6, bone);

  // skull
  fillRect(buf, 8, 3, 8, 2, bone);
  fillRect(buf, 7, 5, 10, 9, bone);
  fillRect(buf, 9, 14, 6, 3, bone);
  fillRect(buf, 8, 7, 3, 3, INK);
  fillRect(buf, 13, 7, 3, 3, INK);
  fillRect(buf, 9, 12, 6, 2, INK);
  setPx(buf, 10, 12, bone);
  setPx(buf, 12, 12, bone);
  setPx(buf, 11, 13, bone);
  setPx(buf, 13, 13, bone);
  return INK;
}

function drawCyborg(buf: Uint8ClampedArray): RGB {
  const skin: RGB = [204, 168, 140];
  const metal: RGB = [112, 120, 136];
  const glow: RGB = [32, 220, 255];
  const dark: RGB = [64, 72, 88];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, skin);
  setPx(buf, 22, 1, glow);

  fillRect(buf, 4, 17, 8, 6, [48, 40, 36]);
  fillRect(buf, 12, 17, 8, 6, dark);
  setPx(buf, 11, 19, glow);
  setPx(buf, 12, 19, glow);

  fillRect(buf, 6, 5, 6, 11, skin);
  fillRect(buf, 12, 5, 6, 11, metal);
  fillRect(buf, 8, 4, 8, 1, skin);
  fillRect(buf, 10, 16, 4, 2, skin);
  for (let y = 5; y <= 15; y++) {
    setPx(buf, 5, y, INK);
    setPx(buf, 18, y, INK);
    setPx(buf, 11, y, INK);
  }

  setPx(buf, 8, 8, INK);
  setPx(buf, 9, 8, INK);
  fillRect(buf, 13, 7, 4, 4, glow);
  setPx(buf, 14, 8, INK);
  setPx(buf, 15, 8, WHITE);
  fillRect(buf, 8, 12, 3, 1, INK);
  setPx(buf, 14, 12, glow);
  setPx(buf, 15, 13, glow);
  setPx(buf, 16, 3, metal);
  setPx(buf, 16, 2, glow);
  return INK;
}

function drawWitch(buf: Uint8ClampedArray): RGB {
  const skin: RGB = [132, 176, 108];
  const cloak: RGB = [48, 20, 72];
  const hat: RGB = [24, 12, 40];
  const purple: RGB = [168, 72, 220];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, purple);
  setPx(buf, 22, 1, hat);

  fillRect(buf, 4, 17, 16, 6, cloak);

  fillRect(buf, 7, 7, 10, 9, skin);
  fillRect(buf, 10, 16, 4, 2, skin);

  // wide brim + point
  fillRect(buf, 4, 5, 16, 2, hat);
  fillRect(buf, 9, 2, 6, 3, hat);
  fillRect(buf, 10, 0, 4, 2, hat);
  setPx(buf, 11, 0, purple);

  setPx(buf, 9, 10, INK);
  setPx(buf, 14, 10, INK);
  setPx(buf, 15, 12, [88, 48, 64]);
  fillRect(buf, 10, 13, 4, 1, INK);
  setPx(buf, 13, 13, INK);
  setPx(buf, 2, 10, purple);
  setPx(buf, 2, 11, purple);
  return INK;
}

function drawOrc(buf: Uint8ClampedArray): RGB {
  const skin: RGB = [72, 132, 56];
  const dark: RGB = [40, 84, 36];
  const tusk: RGB = [240, 228, 200];
  const paint: RGB = [180, 32, 40];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, paint);
  setPx(buf, 22, 1, tusk);

  fillRect(buf, 4, 17, 16, 6, dark);
  fillRect(buf, 8, 17, 8, 2, skin);

  // wide squat head
  fillRect(buf, 5, 6, 14, 10, skin);
  fillRect(buf, 7, 4, 10, 2, skin);
  fillRect(buf, 9, 16, 6, 2, skin);
  fillRect(buf, 7, 4, 10, 2, dark);

  fillRect(buf, 8, 8, 3, 2, INK);
  fillRect(buf, 13, 8, 3, 2, INK);
  fillRect(buf, 8, 7, 3, 1, paint);
  fillRect(buf, 13, 7, 3, 1, paint);
  fillRect(buf, 10, 12, 4, 2, INK);
  setPx(buf, 8, 13, tusk);
  setPx(buf, 8, 14, tusk);
  setPx(buf, 15, 13, tusk);
  setPx(buf, 15, 14, tusk);
  setPx(buf, 11, 16, [200, 160, 48]);
  return INK;
}

function drawAngel(buf: Uint8ClampedArray): RGB {
  const skin: RGB = [252, 232, 208];
  const robe: RGB = [244, 244, 252];
  const gold: RGB = [232, 188, 56];
  const wing: RGB = [220, 228, 248];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, gold);
  setPx(buf, 22, 1, wing);

  fillRect(buf, 7, 17, 10, 6, robe);
  fillRect(buf, 10, 17, 4, 1, gold);

  fillRect(buf, 7, 6, 10, 10, skin);
  fillRect(buf, 8, 5, 8, 1, skin);
  fillRect(buf, 10, 16, 4, 1, skin);

  // halo ring
  fillRect(buf, 8, 1, 8, 1, gold);
  setPx(buf, 7, 2, gold);
  setPx(buf, 16, 2, gold);
  setPx(buf, 8, 3, gold);
  setPx(buf, 15, 3, gold);

  // wings
  fillRect(buf, 1, 8, 4, 2, wing);
  fillRect(buf, 2, 10, 3, 2, wing);
  setPx(buf, 1, 12, gold);
  fillRect(buf, 19, 8, 4, 2, wing);
  fillRect(buf, 19, 10, 3, 2, wing);
  setPx(buf, 22, 12, gold);

  setPx(buf, 9, 9, INK);
  setPx(buf, 14, 9, INK);
  fillRect(buf, 10, 12, 4, 1, INK);
  return INK;
}

function drawNinja(buf: Uint8ClampedArray): RGB {
  const black: RGB = [28, 28, 36];
  const dark: RGB = [16, 16, 22];
  const wrap: RGB = [240, 240, 248];
  const steel: RGB = [176, 184, 196];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, wrap);
  setPx(buf, 22, 1, steel);

  fillRect(buf, 5, 17, 14, 6, dark);
  fillRect(buf, 10, 17, 4, 6, black);

  // hooded head — almost all black
  fillRect(buf, 6, 4, 12, 12, black);
  fillRect(buf, 8, 2, 8, 2, black);
  fillRect(buf, 10, 1, 4, 1, dark);
  fillRect(buf, 10, 16, 4, 1, black);

  fillRect(buf, 8, 8, 8, 2, wrap);
  setPx(buf, 9, 8, INK);
  setPx(buf, 10, 8, INK);
  setPx(buf, 13, 8, INK);
  setPx(buf, 14, 8, INK);

  // katana
  fillRect(buf, 20, 6, 1, 12, steel);
  setPx(buf, 20, 5, wrap);
  setPx(buf, 19, 16, [140, 48, 40]);
  return INK;
}

function drawPirate(buf: Uint8ClampedArray): RGB {
  const skin: RGB = [188, 132, 88];
  const coat: RGB = [92, 36, 24];
  const hat: RGB = [28, 24, 20];
  const gold: RGB = [220, 168, 48];
  const red: RGB = [168, 28, 36];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, gold);
  setPx(buf, 22, 1, red);

  fillRect(buf, 4, 17, 16, 6, coat);
  fillRect(buf, 10, 17, 4, 6, WHITE);
  setPx(buf, 11, 19, gold);

  fillRect(buf, 7, 7, 10, 9, skin);
  fillRect(buf, 10, 16, 4, 1, skin);

  // tricorn
  fillRect(buf, 5, 4, 14, 3, hat);
  setPx(buf, 4, 5, hat);
  setPx(buf, 19, 5, hat);
  fillRect(buf, 8, 2, 8, 2, hat);
  setPx(buf, 11, 3, gold);

  fillRect(buf, 8, 8, 3, 3, INK);
  setPx(buf, 13, 9, INK);
  setPx(buf, 14, 9, INK);
  fillRect(buf, 9, 13, 6, 2, [72, 48, 32]);
  setPx(buf, 4, 10, gold);
  setPx(buf, 3, 11, gold);

  // hook
  setPx(buf, 20, 18, steelHook());
  setPx(buf, 21, 18, steelHook());
  setPx(buf, 21, 19, steelHook());
  return INK;
}

function steelHook(): RGB {
  return [176, 184, 196];
}

function drawSamurai(buf: Uint8ClampedArray): RGB {
  const armor: RGB = [40, 48, 72];
  const dark: RGB = [20, 24, 40];
  const red: RGB = [188, 32, 40];
  const gold: RGB = [220, 168, 48];
  const skin: RGB = [212, 168, 128];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, gold);
  setPx(buf, 22, 1, red);

  fillRect(buf, 4, 17, 16, 6, dark);
  fillRect(buf, 4, 17, 3, 3, armor);
  fillRect(buf, 17, 17, 3, 3, armor);
  fillRect(buf, 10, 17, 4, 6, red);

  // kabuto + mempo
  fillRect(buf, 7, 4, 10, 12, armor);
  fillRect(buf, 8, 2, 8, 2, armor);
  fillRect(buf, 10, 16, 4, 1, skin);
  setPx(buf, 11, 0, gold);
  setPx(buf, 12, 0, gold);
  setPx(buf, 10, 1, gold);
  setPx(buf, 13, 1, gold);

  fillRect(buf, 9, 8, 6, 1, INK);
  fillRect(buf, 8, 11, 8, 4, dark);
  setPx(buf, 10, 12, skin);
  setPx(buf, 13, 12, skin);
  return INK;
}

function drawLich(buf: Uint8ClampedArray): RGB {
  const bone: RGB = [148, 168, 128];
  const dark: RGB = [48, 64, 48];
  const glow: RGB = [96, 255, 80];
  const crown: RGB = [168, 140, 40];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, glow);
  setPx(buf, 22, 1, crown);

  fillRect(buf, 5, 17, 14, 6, dark);
  setPx(buf, 6, 20, bone);
  setPx(buf, 17, 21, bone);
  setPx(buf, 8, 22, dark);

  fillRect(buf, 7, 5, 10, 10, bone);
  fillRect(buf, 8, 4, 8, 1, bone);
  fillRect(buf, 9, 15, 6, 2, bone);

  fillRect(buf, 8, 1, 8, 2, crown);
  setPx(buf, 7, 2, crown);
  setPx(buf, 16, 2, crown);
  setPx(buf, 9, 0, crown);
  setPx(buf, 12, 0, glow);
  setPx(buf, 14, 0, crown);

  fillRect(buf, 8, 7, 3, 3, glow);
  fillRect(buf, 13, 7, 3, 3, glow);
  setPx(buf, 9, 8, INK);
  setPx(buf, 14, 8, INK);
  fillRect(buf, 9, 12, 6, 2, INK);
  setPx(buf, 10, 13, bone);
  setPx(buf, 13, 13, bone);
  return INK;
}

function drawGolem(buf: Uint8ClampedArray): RGB {
  const stone: RGB = [132, 124, 108];
  const dark: RGB = [80, 72, 60];
  const rune: RGB = [32, 220, 188];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, rune);
  setPx(buf, 22, 1, stone);

  // chunky asymmetric body
  fillRect(buf, 4, 16, 7, 7, dark);
  fillRect(buf, 11, 17, 9, 6, stone);
  setPx(buf, 5, 16, stone);
  setPx(buf, 18, 16, dark);
  setPx(buf, 19, 18, dark);

  fillRect(buf, 6, 5, 11, 10, stone);
  fillRect(buf, 8, 3, 8, 2, stone);
  setPx(buf, 5, 7, dark);
  setPx(buf, 17, 9, dark);
  setPx(buf, 7, 14, dark);
  setPx(buf, 16, 4, stone);

  // crack + rune eye
  setPx(buf, 11, 6, dark);
  setPx(buf, 12, 7, dark);
  setPx(buf, 12, 8, rune);
  setPx(buf, 13, 9, dark);
  fillRect(buf, 8, 8, 2, 2, rune);
  fillRect(buf, 14, 10, 2, 2, INK);
  fillRect(buf, 10, 13, 4, 1, dark);
  setPx(buf, 11, 16, rune);
  return INK;
}

export const EXCLUSIVE_THEMES: ExclusiveTheme[] = [
  { id: "vampire", name: "Crimson Count", seed: 0x200001, draw: drawVampire },
  { id: "dragon", name: "Goldscale Wyrm", seed: 0x200002, draw: drawDragon },
  { id: "robot", name: "Auric Unit", seed: 0x200003, draw: drawRobot },
  { id: "wizard", name: "Starstaff Sage", seed: 0x200004, draw: drawWizard },
  { id: "demon", name: "Horned Sovereign", seed: 0x200005, draw: drawDemon },
  { id: "ghost", name: "Gilded Shade", seed: 0x200006, draw: drawGhost },
  { id: "knight", name: "Plume Champion", seed: 0x200007, draw: drawKnight },
  { id: "alien", name: "Void Envoy", seed: 0x200008, draw: drawAlien },
  { id: "werewolf", name: "Moonfang", seed: 0x200009, draw: drawWerewolf },
  { id: "phoenix", name: "Ember Crown", seed: 0x20000a, draw: drawPhoenix },
  { id: "skeleton", name: "Bone Regent", seed: 0x20000b, draw: drawSkeleton },
  { id: "cyborg", name: "Split Circuit", seed: 0x20000c, draw: drawCyborg },
  { id: "witch", name: "Hex Matron", seed: 0x20000d, draw: drawWitch },
  { id: "orc", name: "Tusk Warlord", seed: 0x20000e, draw: drawOrc },
  { id: "angel", name: "Halo Forged", seed: 0x20000f, draw: drawAngel },
  { id: "ninja", name: "Gold Mask", seed: 0x200010, draw: drawNinja },
  { id: "pirate", name: "Goldtooth", seed: 0x200011, draw: drawPirate },
  { id: "samurai", name: "Crest Blade", seed: 0x200012, draw: drawSamurai },
  { id: "lich", name: "Crown of Rot", seed: 0x200013, draw: drawLich },
  { id: "golem", name: "Rune Core", seed: 0x200014, draw: drawGolem },
];

export function renderExclusiveOneOfOne(theme: ExclusiveTheme): HTMLCanvasElement {
  const { buf, finish } = createGrid();
  const ink = theme.draw(buf);
  return finish(theme.seed, ink);
}

export function exclusiveOneOfOneToBuffer(
  canvas: HTMLCanvasElement & { toBuffer?: (mime: string) => Buffer },
): Buffer {
  if (typeof canvas.toBuffer === "function") {
    return canvas.toBuffer("image/png");
  }
  throw new Error("Canvas toBuffer unavailable");
}

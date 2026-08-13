/**
 * Trippy surreal honorary — standalone 24×24 pixel bust.
 * Fresh layout from the reference portrait; not shared with other honoraries.
 */
import { createRng } from "./rng";

const GRID = 24;
const SCALE = 20;
const SIZE = GRID * SCALE;
const BG: [number, number, number] = [204, 255, 0];

type RGB = [number, number, number];

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

      const rng = createRng(seed ^ 0x7e1ab7);
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

/** Hand-drawn trippy honorary pixel map (reference portrait → Hood Forged bust). */
export function renderHonoraryTrippyPixel(seed = 0xe7eba11): HTMLCanvasElement {
  const { buf, finish } = createGrid();

  const blue: RGB = [96, 148, 214];
  const skin: RGB = [182, 172, 220];
  const pink: RGB = [234, 126, 150];
  const ink: RGB = [24, 20, 32];
  const tan: RGB = [206, 174, 142];
  const red: RGB = [198, 38, 50];
  const white: RGB = [250, 250, 254];
  const iris: RGB = [78, 136, 212];
  const eyeWhite: RGB = [238, 234, 226];
  const plaid: RGB = [176, 48, 52];
  const plaidDark: RGB = [80, 22, 30];
  const teeBlue: RGB = [120, 168, 220];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, blue);
  setPx(buf, 22, 1, red);

  // Red plaid jacket — checker shoulders, open white tee
  fillRect(buf, 4, 18, 16, 5, plaid);
  fillRect(buf, 5, 17, 14, 1, plaidDark);
  for (let y = 18; y <= 22; y++) {
    for (let x = 4; x <= 8; x++) {
      if ((x + y) % 2 === 0) setPx(buf, x, y, plaidDark);
    }
    for (let x = 15; x <= 19; x++) {
      if ((x + y) % 2 === 0) setPx(buf, x, y, plaidDark);
    }
  }
  fillRect(buf, 10, 18, 4, 5, white);
  setPx(buf, 11, 19, teeBlue);
  setPx(buf, 12, 21, teeBlue);

  // Neck + periwinkle face (same bust frame as doodles honorary)
  fillRect(buf, 10, 15, 4, 2, skin);
  fillRect(buf, 7, 4, 10, 1, skin);
  fillRect(buf, 6, 5, 12, 10, skin);
  for (let y = 5; y <= 14; y++) {
    setPx(buf, 5, y, ink);
    setPx(buf, 18, y, ink);
  }

  // Pink fleshy skull-cap
  setPx(buf, 10, 0, pink);
  setPx(buf, 13, 0, pink);
  fillRect(buf, 9, 1, 6, 2, pink);
  fillRect(buf, 8, 2, 8, 1, pink);

  // Horizontal eye-stalk visor — tan bars + red nerve tips (reference signature)
  fillRect(buf, 7, 8, 4, 1, tan);
  fillRect(buf, 13, 8, 4, 1, tan);
  fillRect(buf, 0, 9, 7, 1, tan);
  fillRect(buf, 17, 9, 7, 1, tan);
  setPx(buf, 0, 9, red);
  setPx(buf, 23, 9, red);

  // Grimace
  fillRect(buf, 10, 12, 4, 1, ink);
  setPx(buf, 11, 11, white);

  // Raised hand + detached eyeball (viewer's upper-right)
  setPx(buf, 21, 0, red);
  setPx(buf, 22, 0, red);
  setPx(buf, 22, 1, red);
  fillRect(buf, 19, 1, 4, 1, skin);

  setPx(buf, 19, 2, ink);
  setPx(buf, 20, 2, eyeWhite);
  setPx(buf, 21, 2, eyeWhite);
  setPx(buf, 22, 2, ink);

  setPx(buf, 19, 3, eyeWhite);
  setPx(buf, 20, 3, iris);
  setPx(buf, 21, 3, red);
  setPx(buf, 22, 3, eyeWhite);

  setPx(buf, 19, 4, eyeWhite);
  setPx(buf, 20, 4, iris);
  setPx(buf, 21, 4, iris);
  setPx(buf, 22, 4, eyeWhite);

  setPx(buf, 19, 5, ink);
  setPx(buf, 20, 5, eyeWhite);
  setPx(buf, 21, 5, eyeWhite);
  setPx(buf, 22, 5, ink);

  fillRect(buf, 19, 6, 4, 1, skin);
  setPx(buf, 18, 7, skin);
  setPx(buf, 17, 8, skin);

  return finish(seed, ink);
}

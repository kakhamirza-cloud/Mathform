/**
 * One-off honorary pixel busts — same 24×24 grid + upscale as renderPixelArt.
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

type SurrealHonoraryPalette = {
  skin: RGB;
  jacket: RGB;
  jacketDark: RGB;
};

/** Exact pixel layout from the uploaded honorary — only skin + jacket are palette-swapped. */
const UPLOADED_LAYOUT = [
  "..........P..P..........",
  ".L.......PPPPPP.......R.",
  ".......PPPPPPPPP........",
  ".......PPPPPPPPPP.......",
  ".......SSSSSSSSSS.......",
  ".....ISSSRRSSRRSSSI.....",
  ".....ISSSTTSSTTSSSI.....",
  ".....ISSSTTSSTTSSSI.....",
  ".....ISSSTTSSTTSSSI.....",
  "....EESSSTTSSTTSSSEER...",
  "....EISSSRSSSSRSSSEELR..",
  "....EESSSSRSSSSRSSESS...",
  ".....ISSSSIIIISSSSISS...",
  ".....ISSSSIWWISSSSISS...",
  "....SISSSSSSSSSSSSI.....",
  "....ISSSSSSSSSSSSSI.....",
  "..........SILS..........",
  ".....MMMMSSRRSSMMMM.....",
  "....MMMMMMMMMMMMMMMM....",
  "....MMddddWWWWddddMM....",
  "....MMddLdWWWWLdddMM....",
  "....MMMMMMWWWWMMMMMM....",
  "....MMMMMMMMMMMMMMMM....",
] as const;

type LayoutRole = (typeof UPLOADED_LAYOUT)[number][number];

function colorForLayoutRole(
  role: LayoutRole,
  x: number,
  y: number,
  palette: SurrealHonoraryPalette,
  colors: {
    pink: RGB;
    ink: RGB;
    white: RGB;
    blue: RGB;
    teeBlue: RGB;
    tan: RGB;
    red: RGB;
    brown: RGB;
  },
): RGB | null {
  switch (role) {
    case ".":
      return null;
    case "S":
      return palette.skin;
    case "P":
      return colors.pink;
    case "T":
      return colors.tan;
    case "R":
      return colors.red;
    case "I":
      return colors.ink;
    case "W":
      return colors.white;
    case "E":
      return colors.brown;
    case "L":
      return colors.teeBlue;
    case "M":
      return (x + y) % 2 === 0 ? palette.jacketDark : palette.jacket;
    case "d":
      return palette.jacketDark;
    default:
      return null;
  }
}

/** Uploaded honorary layout with reference portrait skin + plaid colours. */
function drawSurrealHonorary(
  buf: Uint8ClampedArray,
  palette: SurrealHonoraryPalette,
): RGB {
  const colors = {
    pink: [214, 132, 156] as RGB,
    ink: [28, 22, 34] as RGB,
    white: [236, 236, 242] as RGB,
    blue: [96, 148, 214] as RGB,
    teeBlue: [120, 168, 220] as RGB,
    tan: [196, 164, 132] as RGB,
    red: [196, 44, 52] as RGB,
    brown: [132, 86, 48] as RGB,
  };

  fillRect(buf, 0, 0, GRID, GRID, BG);

  for (let y = 0; y < UPLOADED_LAYOUT.length; y++) {
    const row = UPLOADED_LAYOUT[y];
    for (let x = 0; x < row.length; x++) {
      const rgb = colorForLayoutRole(row[x] as LayoutRole, x, y, palette, colors);
      if (rgb) setPx(buf, x, y, rgb);
    }
  }

  return colors.ink;
}

/** Lavender surreal honorary inspired by community reference art. */
export function renderHonoraryPixel(seed = 0x481516): HTMLCanvasElement {
  const { buf, finish } = createGrid();
  const ink = drawSurrealHonorary(buf, {
    skin: [168, 154, 208],
    jacket: [176, 48, 52],
    jacketDark: [80, 22, 30],
  });
  return finish(seed, ink);
}

/** Crown + shades honorary inspired by Doodles-style reference. */
export function renderHonoraryDoodlesPixel(seed = 0xd00d1e): HTMLCanvasElement {
  const { buf, finish } = createGrid();

  const skin: RGB = [244, 208, 182];
  const ink: RGB = [24, 24, 28];
  const yellow: RGB = [255, 214, 58];
  const pink: RGB = [255, 118, 168];
  const mint: RGB = [118, 220, 186];
  const frame: RGB = [36, 58, 132];
  const lens: RGB = [186, 218, 255];
  const white: RGB = [248, 248, 252];
  const blue: RGB = [96, 148, 214];

  fillRect(buf, 0, 0, GRID, GRID, BG);
  setPx(buf, 1, 1, blue);
  setPx(buf, 22, 1, mint);

  // white collared shirt
  fillRect(buf, 4, 18, 16, 5, white);
  fillRect(buf, 5, 17, 14, 1, white);
  setPx(buf, 10, 17, ink);
  setPx(buf, 13, 17, ink);
  setPx(buf, 11, 18, ink);
  setPx(buf, 12, 18, ink);
  setPx(buf, 12, 20, ink); // button

  // neck + peach face
  fillRect(buf, 10, 15, 4, 3, skin);
  fillRect(buf, 7, 4, 10, 1, skin);
  fillRect(buf, 6, 5, 12, 11, skin);

  // mint hair patch (left, behind shades arm)
  fillRect(buf, 5, 5, 2, 4, mint);
  setPx(buf, 6, 4, mint);

  // left ear tick
  setPx(buf, 5, 11, skin);
  setPx(buf, 5, 12, ink);

  for (let y = 5; y <= 15; y++) {
    setPx(buf, 5, y, ink);
    setPx(buf, 18, y, ink);
  }

  // yellow three-point crown + pink gem
  setPx(buf, 8, 1, yellow);
  setPx(buf, 11, 0, yellow);
  setPx(buf, 15, 1, yellow);
  fillRect(buf, 9, 1, 6, 2, yellow);
  setPx(buf, 12, 1, pink);

  // oversized blue-framed sunglasses
  fillRect(buf, 7, 7, 5, 4, frame);
  fillRect(buf, 13, 7, 5, 4, frame);
  fillRect(buf, 12, 8, 1, 2, frame);
  fillRect(buf, 8, 8, 3, 2, lens);
  fillRect(buf, 14, 8, 3, 2, lens);
  setPx(buf, 8, 8, white);
  setPx(buf, 14, 8, white);
  setPx(buf, 7, 7, ink);
  setPx(buf, 11, 7, ink);
  setPx(buf, 17, 7, ink);
  setPx(buf, 7, 10, ink);
  setPx(buf, 11, 10, ink);
  setPx(buf, 17, 10, ink);

  // neutral mouth
  fillRect(buf, 10, 13, 4, 1, ink);

  return finish(seed, ink);
}

/** Blue surreal honorary — standalone file, not shared with reference honorary. */
export { renderHonoraryTrippyPixel } from "./renderTrippyHonoraryPixel";

export function honoraryPixelToBuffer(
  canvas: HTMLCanvasElement & { toBuffer?: (mime: string) => Buffer },
): Buffer {
  if (typeof canvas.toBuffer === "function") {
    return canvas.toBuffer("image/png");
  }
  throw new Error("Canvas toBuffer unavailable");
}

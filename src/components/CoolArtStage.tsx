"use client";

import { useMemo } from "react";
import type { CharacterTraits } from "@/lib/traits";
import { downloadPixelArt, pixelArtToDataUrl } from "@/lib/renderPixelArt";

type CoolArtStageProps = {
  traits: CharacterTraits;
};

export function CoolArtStage({ traits }: CoolArtStageProps) {
  const preview = useMemo(() => pixelArtToDataUrl(traits), [traits]);

  return (
    <div className="space-y-3 rounded-sm border border-[var(--copper)]/35 bg-[var(--paper)]/60 p-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
            Pixel art
          </h3>
          <p className="font-mono text-[10px] tracking-wider uppercase text-[var(--muted)]">
            24×24 · CryptoPunks-style
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadPixelArt(traits)}
          className="rounded-sm bg-[var(--ink)] px-3 py-1.5 font-mono text-[11px] tracking-wide text-[var(--paper)] transition hover:bg-[var(--teal)]"
        >
          Download PNG
        </button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={preview}
        alt={`${traits.name} pixel art`}
        className="aspect-square w-full rounded-sm object-contain"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

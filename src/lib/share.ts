import type { CharacterTraits } from "./traits";
import { buildShareUrl } from "./site";

const TWITTER_HANDLE = "unvoxd_nft";

function truncateFormula(formula: string, max = 72): string {
  const compact = formula.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1)}…`;
}

/** Pre-filled tweet with character details, share link (image preview), and @unvoxd_nft. */
export function buildTweetText(
  traits: CharacterTraits,
  shareUrl: string,
): string {
  const formula = truncateFormula(traits.formula);
  return [
    `I forged "${traits.name}" from ${formula} on UNVOXD`,
    "",
    `${traits.rarity} · ${traits.archetype} · Complexity ${traits.complexity}`,
    "Every math formula becomes a one-of-one character.",
    "",
    `@${TWITTER_HANDLE}`,
    shareUrl,
  ].join("\n");
}

export function buildTwitterIntentUrl(text: string): string {
  return `https://twitter.com/intent/tweet?${new URLSearchParams({ text }).toString()}`;
}

/**
 * Opens X with a pre-filled tweet. The share URL renders a large image card
 * (Twitter fetches /api/image via Open Graph on the /share page).
 */
export function shareToTwitter(traits: CharacterTraits): void {
  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const shareUrl = buildShareUrl(traits.formula, origin);
  const text = buildTweetText(traits, shareUrl);

  window.open(buildTwitterIntentUrl(text), "_blank", "noopener,noreferrer");
}

export function getShareUrl(formula: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;
  return buildShareUrl(formula, origin);
}

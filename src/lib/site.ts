/** Client-safe site URL helpers (no next/headers). */

export function getSiteUrlFromEnv(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    if (!url.includes("localhost")) return url;
  }
  if (process.env.CF_PAGES_URL) {
    return process.env.CF_PAGES_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "https://unvoxd.site";
}

export function buildShareUrl(formula: string, baseUrl?: string): string {
  const origin = (baseUrl ?? getSiteUrlFromEnv()).replace(/\/$/, "");
  return `${origin}/share?f=${encodeURIComponent(formula)}`;
}

export function buildCharacterImageUrl(formula: string, baseUrl?: string): string {
  const origin = (baseUrl ?? getSiteUrlFromEnv()).replace(/\/$/, "");
  return `${origin}/api/image?f=${encodeURIComponent(formula)}`;
}

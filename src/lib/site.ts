/** Public site URL for Open Graph / Twitter card images (must be absolute). */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function buildShareUrl(formula: string, baseUrl?: string): string {
  const origin = (baseUrl ?? getSiteUrl()).replace(/\/$/, "");
  return `${origin}/share?f=${encodeURIComponent(formula)}`;
}

export function buildCharacterImageUrl(formula: string, baseUrl?: string): string {
  const origin = (baseUrl ?? getSiteUrl()).replace(/\/$/, "");
  return `${origin}/api/image?f=${encodeURIComponent(formula)}`;
}

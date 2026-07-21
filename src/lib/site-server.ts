import { headers } from "next/headers";
import { getSiteUrlFromEnv } from "./site";

/**
 * Absolute site origin for Open Graph / Twitter cards.
 * Prefer NEXT_PUBLIC_SITE_URL, then the live Host header, then unvoxd.site.
 * Never emit localhost into public meta tags.
 */
export async function getSiteUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv && !fromEnv.includes("localhost")) {
    return fromEnv;
  }

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host && !host.includes("localhost")) {
      const proto = h.get("x-forwarded-proto") ?? "https";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // headers() unavailable outside a request
  }

  return getSiteUrlFromEnv();
}

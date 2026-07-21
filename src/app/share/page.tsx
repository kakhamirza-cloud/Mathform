import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ShareView } from "@/components/ShareView";
import { analyzeFormula } from "@/lib/formula";
import { buildTraits } from "@/lib/traits";
import { buildCharacterImageUrl, buildShareUrl, getSiteUrl } from "@/lib/site";

type PageProps = {
  searchParams: Promise<{ f?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { f } = await searchParams;
  const siteUrl = getSiteUrl();

  if (!f?.trim()) {
    return {
      title: "UNVOXD Share",
      description: "Formula-forged character NFTs by UNVOXD.",
    };
  }

  try {
    const analysis = analyzeFormula(f);
    const traits = buildTraits(analysis);
    const shareUrl = buildShareUrl(f, siteUrl);
    const imageUrl = buildCharacterImageUrl(f, siteUrl);
    const description = `${traits.rarity} ${traits.archetype} forged from: ${f}`;

    return {
      title: `${traits.name} | UNVOXD`,
      description,
      openGraph: {
        type: "website",
        url: shareUrl,
        title: `${traits.name} | UNVOXD`,
        description,
        siteName: "UNVOXD",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 1200,
            alt: traits.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@unvoxd_nft",
        creator: "@unvoxd_nft",
        title: `${traits.name} | UNVOXD`,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "UNVOXD Share",
      description: "Formula-forged character NFTs by UNVOXD.",
    };
  }
}

export default function SharePage() {
  return (
    <>
      <header className="border-b border-[var(--ink)]/10 px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[0.14em] text-[var(--ink)]"
          >
            UNVOXD
          </Link>
          <p className="font-mono text-xs tracking-wider uppercase text-[var(--muted)]">
            Shared character
          </p>
        </div>
      </header>
      <main className="px-6 sm:px-10">
        <Suspense
          fallback={
            <p className="py-20 text-center text-[var(--muted)]">Loading character…</p>
          }
        >
          <ShareView />
        </Suspense>
      </main>
    </>
  );
}

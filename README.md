# UNVOXD — Formula Character NFTs

Enter a math formula. The app analyzes **both** the written formula and sampled numeric results, then forges a unique procedural character (SVG) you can share on X (@unvoxd_nft).

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How uniqueness works

1. Normalize the formula text and hash its structure (operators, functions, symbols like π / e / ∞).
2. Evaluate at sample points with [mathjs](https://mathjs.org/) to build a result fingerprint.
3. Mix formula + results into a deterministic seed.
4. Map the seed onto traits (archetype, colors, aura, accessory, stats) and render SVG art.
5. **Different formulas → different characters.** The same formula always remints the same art (verifiable).

## Share on X

Click **Share on X** to open a pre-filled tweet with your character details, a share link, and @unvoxd_nft. X loads the character image from the share link as a large preview card.

Set `NEXT_PUBLIC_SITE_URL` in production so Twitter can fetch the image (localhost won't show previews).

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

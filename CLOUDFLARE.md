# Cloudflare Workers (OpenNext)

In **Workers → your project → Settings → Build**, use these commands:

| Setting | Command |
|---|---|
| **Build command** | `npm run build:cf` |
| **Deploy command** | `npx wrangler deploy` |
| **Non-production deploy** | `npm run upload` |

`npm run build` alone is only `next build` and will fail with:

> Could not find compiled Open Next config, did you run the build command?

`build:cf` runs `opennextjs-cloudflare build`, which creates `.open-next/` before Wrangler deploys.

Also set (required for Twitter cards):

```
NEXT_PUBLIC_SITE_URL=https://unvoxd.site
```

under **Settings → Variables and secrets** (Build variables), then **Redeploy**.

If this is missing, Open Graph tags can point at `http://localhost:3000/...` and X will show a plain link with no image.
## Enable workers.dev (if it shows Disabled)

Your public URL won’t work while **workers.dev** is Disabled.

### Enable now in the dashboard
1. Open **Workers & Pages** → **mathform**
2. Go to **Settings** → **Domains & Routes** (or the **Domains** tab)
3. Find **workers.dev** → click **Enable**
4. Confirm

Your site should then open at:  
https://mathform.kakhamirza.workers.dev

`wrangler.jsonc` now has `"workers_dev": true` so future deploys keep it on.
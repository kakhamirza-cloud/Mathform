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

Also set:

```
NEXT_PUBLIC_SITE_URL=https://your-workers-subdomain.workers.dev
```

(or your custom domain) under **Build Variables and secrets**.

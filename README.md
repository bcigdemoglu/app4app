# app4app

An application to create applications

## Critical Links

- Production: <https://www.ilayda.com>
- Staging: <https://ilayda.vercel.app>
- Local: <http://localhost:3000>
- Sitemap: <https://www.ilayda.com/sitemap.xml>
- Vercel Dashboard: <https://vercel.com/bcigdemoglu/ilayda>
- [Google Search Console](https://search.google.com/u/2/search-console/performance/search-analytics?resource_id=sc-domain%3Ailayda.com)
- [Hotjar Dashboard](https://insights.hotjar.com/sites/3813067/dashboard/95jiZm9LTQBKY5RJ5g5h3D-Site-overview)

## Important Files

- Sitemap generator: [sitemap.ts](src/app/sitemap.ts)
- Blog post generator: [contentlayer.config.ts](contentlayer.config.ts)
- Blog posts located at: [posts](posts)
- Blog post images located at: [posts](posts)

## Run locally

### Install required tools: `brew`, `node` and `pnpm`

```bash
# Install brew if not installed
command -v brew &> /dev/null || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Install node if not installed
command -v node &> /dev/null || brew install node
# Install pnpm if not installed
command -v pnpm &> /dev/null || brew install pnpm
```

### Run dev server

```bash
# Install dependencies and run dev server
pnpm install
pnpm dev
# Open in browser
open -a "Google Chrome" http://localhost:3000
```

# app4app

An application to create applications

## Critical Links

- Production: <https://www.ilayda.com>
- Staging: <https://ilayda.vercel.app>
- Local: <http://localhost:3000>
- Sitemap: <https://www.ilayda.com/sitemap.xml>
- Vercel Dashboard: <https://vercel.com/bcigdemoglu/ilayda>
  - [Vercel Analytics](https://vercel.com/bcigdemoglu/ilayda/analytics)
- [Google Search Console](https://search.google.com/u/2/search-console/performance/search-analytics?resource_id=sc-domain%3Ailayda.com)
  - [Sitemap Indexing](https://search.google.com/u/2/search-console/index?resource_id=sc-domain:ilayda.com&pages=SITEMAP&sitemap=https:%2F%2Fwww.ilayda.com%2Fsitemap.xml)
- [Hotjar Dashboard](https://insights.hotjar.com/sites/3813067/dashboard/95jiZm9LTQBKY5RJ5g5h3D-Site-overview)
- [Supabase Dashboard](https://supabase.com/dashboard/project/fehegdrzmwuqmeutkptb)
- [Google OAuth Cloud Console](https://console.cloud.google.com/apis/credentials?authuser=2&project=app4app-413214)

## Important Files

- Sitemap generator: [sitemap.ts](src/app/sitemap.ts)
- Blog posts located at: [posts](posts)
- Blog post images located at: [posts](posts)
- 404 Not Found Page: [not-found.tsx](src/app/not-found.tsx)

## Run locally

### Install required tools: `nvm`, `brew`, `node` and `pnpm`

```bash
# Install brew if not installed
command -v brew &> /dev/null || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Install pnpm if not installed
command -v pnpm &> /dev/null || curl -fsSL https://get.pnpm.io/install.sh | sh -
# Install and use node ^20
pnpm env use --global 20
```

#### Maintain DB types

```bash
# Install supabase and login
brew install supabase/tap/supabase && brew upgrade supabase
supabase login
# Generate supabase table types
supabase gen types typescript --project-id fehegdrzmwuqmeutkptb > ./src/app/lib/database.types.ts
```

### Run dev server

```bash
# Install dependencies and run dev server
pnpm install
pnpm dev
# Open in browser
open -a "Google Chrome" http://localhost:3000
# Get the local server URL which is accessible from the local network
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "http://"$2":3000"}'
```

# [gorkemkaryol.dev](https://gorkemkaryol.dev)

[![CI](https://github.com/Glory42/gorkemkaryol.dev/actions/workflows/ci.yml/badge.svg)](https://github.com/Glory42/gorkemkaryol.dev/actions/workflows/ci.yml)
[![live](https://img.shields.io/badge/live-gorkemkaryol.dev-4C9AFF?style=flat-square)](https://gorkemkaryol.dev)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-React_19-FF4154?style=flat-square&logo=react&logoColor=white)](https://tanstack.com/start)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white)](https://bun.sh)
[![License: GPLv3](https://img.shields.io/badge/license-GPLv3-4C9AFF?style=flat-square)](./LICENSE)

This is the source for my personal site. It's where I keep my projects, a running log of what I'm reading and watching, and a playground of small web toys I build when I want to try something. It's a TanStack Start app running on Cloudflare Workers, and every external bit of data on it is pulled live at request time rather than from a hand-maintained list.

![Preview](./public/preview/preview.webp)

## Pages

- **Home** - a pinned `whoami` panel (role, status, links and a `now.txt` with what I'm building, reading and watching), the repos I've tagged `showcase` on GitHub, work I've contributed to, a one-line-per-job experience log and my setup
- **Projects** - two columns: _featured_ is my own repos (anything I've tagged with the `featured` topic on GitHub), _contributed_ is a few manual entries plus my GitHub contribution activity. Opening a project renders its live GitHub README server-side, or a hand-written write-up for private work like Gathin.
- **Experience** - my work and community history, each company linked to its site
- **Interests** - what I'm reading and have finished (from [Literal](https://literal.club)), and the films and series I'm watching or have watched (from Interis, below)
- **Playground** - Snake, Flappy Bird and Tetris in the browser; a NASA page (astronomy picture of the day + near-Earth asteroids); `whoami`, which shows what the Cloudflare edge sees about your connection; `sysinfo`; and `shell`, a small working prompt
- **404** - an offline-style runner game (_Lost Packet_) to play while you find your way back

## Stack

- TanStack Start (React 19 + TanStack Router + server functions)
- Bun
- Cloudflare Workers, via `@cloudflare/vite-plugin`
- TypeScript
- Tailwind CSS
- Vitest for tests, `marked` for README rendering

## Integrations

Everything here is read-only, fetched on the server, and cached at the edge, so the site stays fast and I never have to copy-paste an "updated" list into a file.

- **GitHub GraphQL API** - featured and showcase projects, each repo's website for its live link, and contribution data
- **Literal GraphQL API** - my favorites shelf and currently-reading shelf (the home page shows the current book)
- **Interis** (`interis.gorkemkaryol.dev`) - my self-hosted movie tracker; the interests page pulls my top 4 films and top 4 series from its public API, and the home page shows what I'm watching now
- **NASA APIs** - APOD (picture of the day, image or video) and NeoWs (near-Earth objects)

### Curating projects

Projects are picked on GitHub, not in code. Add a repo topic and it shows up within the cache window (10 minutes):

- `featured` - listed on `/projects`
- `showcase` - listed on the home page

Both lists are ordered by GitHub's last update time, and a repo's **Website** field becomes its "live" link. The topics themselves are never shown as tags. `/sitemap.xml` is built from the same data, so new projects are indexed without a deploy.

## Environment

Copy `.env.example` to `.env` for local dev; set the same keys as Worker bindings for production.

```bash
GITHUB_TOKEN=...
PUBLIC_GITHUB_USERNAME=...
LITERAL_EMAIL=...
LITERAL_PASSWORD=...
INTERIS_USERNAME=...     # Interis username, used to fetch top films/series
NASA_API_KEY=...         # optional, falls back to NASA's DEMO_KEY when unset
```

`INTERIS_USERNAME` and `PUBLIC_GITHUB_USERNAME` are non-secret and live under `vars` in `wrangler.jsonc`, so preview deployments get them without a secret binding. `keep_vars: true` keeps the dashboard secrets from being wiped on each deploy.

Every API secret is server-only and read from the Workers runtime bindings at request time; see `src/lib/env.ts`.

## Development

```bash
bun install
bun dev            # vite dev on http://localhost:3000
```

## Test

```bash
bun test           # vitest run
```

## Build

```bash
bun run build
```

Runs `vite build`, `tsc --noEmit`, then assembles `.output/`, the Worker deploy artifact `wrangler.jsonc` points at.

## Deploy

```bash
bun run deploy     # build + wrangler deploy
```

`wrangler.jsonc` sets `nodejs_compat` because TanStack Start's server runtime pulls in Node-compatible modules internally.

## Project structure

```
src/
  routes/       file-based routes (TanStack Router)
  features/     per-section UI: home, projects, experience, interests, playground, plus not-found (404 game), palette (⌘K) and site-map
  components/   shared layout + ui primitives
  server/       upstream sources (github, literal, interis, nasa), markdown, edge cache helpers
  lib/          env parsing and shared utilities
```

## License

[GPL-3.0](./LICENSE)

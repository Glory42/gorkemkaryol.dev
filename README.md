# gorkemkaryol.dev

Personal portfolio built with TanStack Start, deployed on Cloudflare Workers.

## Stack

- TanStack Start (React + TanStack Router + server functions)
- Bun
- Cloudflare Workers
- TypeScript
- Tailwind CSS

## Integrations

- **GitHub GraphQL API** — pinned projects and contribution data
- **Literal GraphQL API** — favorite books shelf and currently reading shelf
- **Interis** (`interis.gorkemkaryol.dev`) — my self-hosted movie and series tracker; the interests page pulls top-rated films and series from it via the public API and links each card back to the Interis entry

## Environment

Create a `.dev.vars` file (for local dev) or set Worker bindings (for production):

```bash
GITHUB_TOKEN=...
PUBLIC_GITHUB_USERNAME=...
LITERAL_EMAIL=...
LITERAL_PASSWORD=...
INTERIS_USERNAME=...   # your Interis username, used to fetch top films/series
```

`INTERIS_USERNAME` is a non-secret public variable — it is also declared under `vars` in `wrangler.jsonc` so it is available in preview deployments without a secret binding.

All API secrets are server-only and read from Workers runtime bindings at request time.

## Development

```bash
bun install
bun dev
```

## Build

```bash
bun run build
```

Creates `.output/` (Worker deploy artifact expected by `wrangler.jsonc`).

## Deploy

```bash
npx wrangler deploy
```

`wrangler.jsonc` uses `nodejs_compat` because TanStack Start's server runtime imports Node-compatible modules internally.

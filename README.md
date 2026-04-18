# gorkemkaryol.dev

Production portfolio migrated to TanStack Start with Bun runtime and Cloudflare Workers deployment.

## Stack

- TanStack Start (React + TanStack Router + server functions)
- Bun
- Cloudflare Workers
- TypeScript
- Tailwind CSS
- GitHub GraphQL API (projects + contributions)
- Literal GraphQL API (currently reading)

## Environment

Create a `.dev.vars` or Worker bindings with:

```bash
GITHUB_TOKEN=...
PUBLIC_GITHUB_USERNAME=...
LITERAL_EMAIL=...
LITERAL_PASSWORD=...
```

All API secrets are server-only and read from Workers runtime bindings.

## Development

```bash
bun install
bun dev
```

## Build

```bash
bun run build
```

`bun run build` creates both `dist/` (Vite output) and `.output/` (Worker deploy output expected by `wrangler.jsonc`).

## Deploy

```bash
npx wrangler deploy
```

`wrangler.jsonc` uses `nodejs_compat` because TanStack Start server runtime imports Node-compatible modules internally.

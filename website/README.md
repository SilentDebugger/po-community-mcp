# DischargePlus MCP — Wiki

Next.js 15 documentation site for the DischargePlus MCP server. Deploys to
Sevalla as a Docker app.

## Develop

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t po-community-mcp-wiki .
docker run --rm -p 3000:3000 po-community-mcp-wiki
```

## Content layout

- `app/page.tsx` — landing page.
- `app/wiki/` — the wiki. One route per entry.
- `app/wiki/tools/[slug]/page.tsx` — per-tool pages, generated from
  `lib/tools.ts`.
- `lib/tools.ts` — single source of truth for tool metadata. Update this file
  when a tool is added or its signature changes.
- `lib/wiki-nav.ts` — sidebar structure. Add new pages here.

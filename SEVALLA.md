# Sevalla Deployment Guide

This repo ships **two** deployable services:

| Service       | Path                | What it is                                      |
| ------------- | ------------------- | ----------------------------------------------- |
| `mcp-server`  | `typescript/`       | Express + MCP HTTP server (the actual MCP tool) |
| `wiki`        | `website/`          | Next.js 15 docs/wiki site                       |

On Sevalla each becomes its **own Application** (one container per app). They
deploy independently, get their own domains, and can be scaled separately.

---

## Prerequisites

- A Sevalla account with Application Hosting access
- This repo connected to Sevalla via GitHub (or pushed to a public Git URL)
- Your custom domain(s) ready, if you want them attached

> Sevalla requires images built for **linux/amd64**. Both Dockerfiles in this
> repo are arch-agnostic (Node Alpine base) and Sevalla builds them for you,
> so this just works.

---

## 1. Deploy the MCP server (`typescript/`)

### Create the app

In Sevalla, **Add application** → connect this repository → pick the branch.

### Build settings

In **Settings → Build strategy → Update build strategy**:

| Field             | Value                  |
| ----------------- | ---------------------- |
| Build strategy    | `Dockerfile`           |
| Dockerfile path   | `typescript/Dockerfile`|
| Context           | `typescript`           |

### Networking

In **Networking → Update port**: leave the default `8080`.
The Dockerfile defaults to `PORT=8080` and the Express server reads
`process.env.PORT`, so Sevalla's auto-injected `$PORT` is honored without any
extra work.

### Environment variables

Set in **Environment variables**:

| Key            | Value                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| `PO_ENV`       | `prod` (or `dev`)                                                                            |
| `LOG_LEVEL`    | `info`                                                                                       |
| `ALLOWED_HOST` | Your public Sevalla URL **and** any custom domains, comma-separated (see note below)         |

> **Why `ALLOWED_HOST` matters.** The MCP SDK validates the inbound `Host`
> header against a hostname allowlist (DNS-rebinding protection). When you
> deploy on Sevalla your container will be reached via something like
> `your-app-abc12.sevalla.app` and possibly your own `mcp.example.com`. Both
> need to be listed or every request will be rejected.
>
> Example: `ALLOWED_HOST=your-app-abc12.sevalla.app,mcp.example.com`
>
> You don't need to include `localhost`, `127.0.0.1`, or `[::1]` — the code
> always allows those so the container's own `HEALTHCHECK` and Sevalla's
> internal probes succeed regardless of environment.

You do **not** need to set `PORT` — Sevalla injects it.

### Health check

The Dockerfile has `HEALTHCHECK` hitting `/health`, and the server already
exposes that route, so Sevalla's health column should go green within ~30s of
boot.

### Verify

Once deployed, hit `https://<your-mcp-app>.sevalla.app/health` — it should
return `{ "status": "ok", "timestamp": "..." }`.

The MCP endpoint itself is `POST /mcp` — see the root `README.md` for the
SHARP headers and request body it expects.

---

## 2. Deploy the wiki site (`website/`)

### Create the app

Add a **second** application in Sevalla, same repo, same branch.

### Build settings

| Field             | Value                |
| ----------------- | -------------------- |
| Build strategy    | `Dockerfile`         |
| Dockerfile path   | `website/Dockerfile` |
| Context           | `website`            |

### Networking

Default port `8080` again — the Dockerfile sets `PORT=8080` and Next.js
standalone (`server.js`) listens on `process.env.PORT`.

### Environment variables

None are required. Optional:

| Key                       | Value                |
| ------------------------- | -------------------- |
| `NEXT_TELEMETRY_DISABLED` | `1` (already in image) |

### Verify

`https://<your-wiki-app>.sevalla.app/` should render the landing page.
`/wiki`, `/wiki/getting-started`, `/wiki/tools/...` should all 200.

---

## 3. (Optional) Connect them privately

If you want the wiki to reach the MCP server without going over the public
internet (for, say, a "Try it" widget), use a Sevalla **private connection**:

1. In the wiki's **Networking** page → **Add internal connection** →
   pick the MCP application.
2. Tick **Add environment variables** to auto-populate things like
   `MCP_HOST` / `MCP_PORT`.
3. Both applications must live in the **same data center / region**.

The wiki currently doesn't call the MCP server at runtime, so this is purely
for future use.

---

## 4. Custom domains

In each app's **Domains** page:

1. Add the domain (e.g. `mcp.example.com` for the MCP, `docs.example.com` for
   the wiki).
2. Point the DNS records as Sevalla instructs.
3. **Add the new hostname to `ALLOWED_HOST`** on the MCP app (the wiki has no
   such restriction). Example: `ALLOWED_HOST=your-app-abc12.sevalla.app,mcp.example.com`
4. Redeploy (env var changes trigger a redeploy automatically).

---

## 5. Common gotchas

- **502 / "host not allowed" right after deploy.** You forgot to add the
  Sevalla-assigned hostname to `ALLOWED_HOST`. Add it, save, redeploy.
- **App boots but Sevalla shows "unhealthy".** Sevalla's healthcheck and the
  Dockerfile's `HEALTHCHECK` both expect the app to listen on `$PORT`. If you
  set the application port in Sevalla to something other than `8080`, make
  sure the env var matches what the container actually binds to (the code
  reads `$PORT` so this should be automatic).
- **Build fails on `npm ci` for the wiki.** The website doesn't ship a
  `package-lock.json`. The Dockerfile already falls back to `npm install`, so
  this only matters if you delete the fallback. To get reproducible installs,
  commit `website/package-lock.json` (run `cd website && npm install`).
- **MCP requests time out after 30s.** Sevalla applies a 60s public request
  timeout. The MCP `BuildDischargePacket` orchestrator runs five sub-tools in
  parallel, but a slow FHIR server can still push you past the limit. Consider
  bumping the FHIR query timeouts or using a faster FHIR sandbox.

---

## 6. Quick reference

```text
Sevalla Application 1 — MCP server
  Build strategy:  Dockerfile
  Dockerfile path: typescript/Dockerfile
  Context:         typescript
  Port:            8080
  Env:
    PO_ENV=prod
    LOG_LEVEL=info
    ALLOWED_HOST=<sevalla-url>,<custom-domain>

Sevalla Application 2 — Wiki
  Build strategy:  Dockerfile
  Dockerfile path: website/Dockerfile
  Context:         website
  Port:            8080
  Env: (none required)
```

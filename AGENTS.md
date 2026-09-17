# Project Guidance

## User Preferences

[No preferences yet]

## Verified Commands

**Frontend** (run from `src/frontend/`):

- **install**: `pnpm install --prefer-offline`
- **typecheck**: `pnpm typecheck`
- **lint fix**: `pnpm fix`
- **build**: `pnpm build`

**Backend** (run from `src/backend/`):

- **install**: `mops install`
- **typecheck**: `mops check --fix`
- **build**: `mops build`

**Backend and frontend integration** (run from root):

- **generate bindings**: `pnpm bindgen` This step is necessary to ensure the frontend can call the backend methods.

## Head Metadata (SEO and Link Previews)

`src/frontend/index.html` ships with social-sharing meta tags (`description`, `og:title`, `og:description`, `og:type`, `og:image`, `og:image:alt`, `twitter:card`, `twitter:image`). Links shared to this app only render a preview card if these tags are present in the deployed `index.html`.

When editing `index.html` (e.g. changing the title or favicon):

- **Never remove these meta tags.** Update them instead.
- Keep `og:title` identical to `<title>`, and `og:description` identical to the `description` meta tag.
- `og:image` and `twitter:image` must always point to an absolute `https://` URL. Keep the pre-configured default image unless the user explicitly provides or requests a custom share image; a custom image should be 1200×630 pixels.

## Learnings

- **Local dev runtime**: the app runs via `docker compose -f docker-compose.base44.yml up -d`. The `web` service runs `dev-startup.sh`, which installs pnpm, starts a PocketIC server (port 4943), installs the prebuilt backend WASM (`src/backend/dist/backend.wasm`) into a fresh canister, opens the PocketIC HTTP Gateway, and starts the Vite dev server on 0.0.0.0:5173 (host port 3000).
- **Backend wiring**: `src/frontend/vite-plugin-local-backend.js` serves a dynamic `/env.json` that tells the frontend which canister to call and on which host. `backend_host` MUST be the public preview origin (`https://3000-$BASE44_PUBLIC_HOST_SUFFIX`), NOT the forwarded `Host` header — the sandbox host in that header is not reachable from the browser, so every backend call would fail with "Failed to fetch". Requests hit the same origin and are proxied by Vite (`/api` → PocketIC gateway, whose port is read from `/tmp/pocketic-gateway-port`).
- **Root key**: the same plugin patches `@caffeineai/core-infrastructure`'s `config.js` so `fetchRootKey()` always runs — PocketIC uses a self-signed root key and the preview origin is not "localhost".
- **Sign-in**: II_URL defaults to `https://id.ai/authorize` (mainnet Internet Identity) since `DFX_NETWORK` is not set in dev. Sign-in works against mainnet II while the backend runs locally on PocketIC.
- **Vite dev server**: `allowedHosts: true` is required in `vite.config.js` — the preview reaches the dev server with a rotating external hostname.
- The seeded catalog (42 opportunities) is baked into the backend's migration `src/backend/migrations/20260916_000000.mo`; a fresh PocketIC instance always has it after install.

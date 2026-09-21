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

### Base44 dev environment (docker-compose.base44.yml)

- Two services: `replica` (dfx 0.32.0 local IC + backend canister deploy) and `frontend` (Vite dev server on host port 3000).
- The replica service clears `/app/.dfx/local/state` and `wallets.json` at startup — stale pocket-ic state breaks `dfx start` in containers. Never add wrappers around the pocket-ic binary (relative-path breakage).
- The frontend waits for `/app/.dfx/local/canister_ids.json`, then writes `src/frontend/public/env.json` (`backend_host`, `backend_canister_id`) from `BASE44_PUBLIC_HOST_SUFFIX`. The HttpAgent uses the same origin and the Vite proxy forwards `/api` to the replica.
- After editing `scripts/start-*.sh`, restart the affected service — the running shell keeps the old script content.
- The Vite launch must be `./node_modules/.bin/vite --host 0.0.0.0 --port 5173` (direct exec, no pnpm, no stray `--`).
- Verify with: `curl http://localhost:3000/` (HTTP 200), `curl http://localhost:3000/api/v2/status` (HTTP 200 through proxy).

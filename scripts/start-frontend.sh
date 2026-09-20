#!/bin/bash
set -e

cd /app/src/frontend

# Install frontend dependencies
corepack enable 2>/dev/null || true
pnpm install --prefer-offline

# Wait for the canister_ids.json to appear (written by the replica service
# after dfx deploy completes)
CANISTER_IDS=/app/.dfx/local/canister_ids.json
echo "Waiting for backend canister deployment..."
while [ ! -f "$CANISTER_IDS" ]; do
  sleep 2
done

# Extract the backend canister ID
CANISTER_ID=$(node -e "
  const ids = require('$CANISTER_IDS');
  console.log(ids.backend?.local || '');
")
if [ -z "$CANISTER_ID" ]; then
  echo "ERROR: could not read backend canister ID from $CANISTER_IDS"
  exit 1
fi
echo "Backend canister ID: $CANISTER_ID"

# Build the backend_host: the preview hostname (without protocol) so the
# HttpAgent resolves to the same origin as the page, and the Vite proxy
# forwards /api to the replica.
if [ -n "$BASE44_PUBLIC_HOST_SUFFIX" ]; then
  BACKEND_HOST="3000-${BASE44_PUBLIC_HOST_SUFFIX}"
else
  BACKEND_HOST="localhost:5173"
fi
echo "Backend host: $BACKEND_HOST"

# Generate env.json in public/ so Vite serves it in dev mode
cat > public/env.json <<EOF
{
  "backend_host": "$BACKEND_HOST",
  "backend_canister_id": "$CANISTER_ID",
  "project_id": "undefined",
  "ii_derivation_origin": "undefined",
  "storage_gateway_url": "undefined"
}
EOF
echo "Wrote public/env.json"

# Start the Vite dev server
exec pnpm dev -- --host 0.0.0.0 --port 5173

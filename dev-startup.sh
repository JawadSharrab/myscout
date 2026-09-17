#!/bin/bash
set -e

echo "=== Installing pnpm ==="
npm install -g pnpm@9

echo "=== Installing dependencies ==="
pnpm install --prefer-offline

# @dfinity/pic's postinstall is ignored in pnpm-workspace.yaml (the binary is
# only needed for the backend test lane's platform sidecar).  We need it here
# to run a local PocketIC replica, so run the postinstall manually.
if [ ! -f node_modules/@dfinity/pic/pocket-ic ]; then
  echo "=== Downloading PocketIC binary ==="
  node node_modules/@dfinity/pic/postinstall.mjs
fi
chmod +x node_modules/@dfinity/pic/pocket-ic

echo "=== Starting PocketIC server (background) ==="
node_modules/@dfinity/pic/pocket-ic --port 4943 --ttl 999999999 --hard-ttl 999999999 &
POCKETIC_PID=$!

# Wait for PocketIC to accept connections
echo "=== Waiting for PocketIC to be ready ==="
for i in $(seq 1 30); do
  if node -e "const s=require('net').connect(4943,'127.0.0.1');s.on('connect',()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1))" 2>/dev/null; then
    echo "PocketIC is ready."
    break
  fi
  if [ $i -eq 30 ]; then
    echo "PocketIC did not start in time."
    exit 1
  fi
  sleep 1
done

echo "=== Setting up backend canister ==="
node dev-setup-backend.cjs

echo "=== Starting Vite dev server ==="
cd src/frontend
exec pnpm dev -- --host 0.0.0.0 --port 5173

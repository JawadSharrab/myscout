#!/bin/bash
set -e

# Clear stale canister IDs so the frontend service waits for a fresh deploy
rm -f /app/.dfx/local/canister_ids.json /app/.dfx/local/wallets.json
# Wipe any leftover (possibly incomplete) replica state from previous runs;
# the backend canister is redeployed fresh on every start anyway.
rm -rf /app/.dfx/network/local/state

# Start the local IC replica in the background
dfx start --host 0.0.0.0:4943 --background

# Wait for the replica to be healthy
echo "Waiting for replica to be ready..."
until dfx ping >/dev/null 2>&1; do
  sleep 1
done
echo "Replica is ready."

# Deploy the backend canister (uses prebuilt wasm from src/backend/dist/)
dfx deploy backend
echo "Backend canister deployed."

# Keep the container alive — the replica process is running in the background
exec tail -f /dev/null

#!/bin/bash
set -e

# Start the local IC replica in the background
dfx start --host 0.0.0.0 --port 4943 --background

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

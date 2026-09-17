#!/usr/bin/env node
/**
 * One-shot setup: connects to a running PocketIC server, installs the backend
 * WASM, starts the HTTP Gateway (ICP HTTP boundary API), and writes the
 * canister ID + gateway port to /tmp files for the Vite dev server to pick up.
 *
 * Usage:  node dev-setup-backend.cjs
 *
 * Prerequisites:
 *   - PocketIC server running on http://127.0.0.1:4943
 *   - Backend WASM at src/backend/dist/backend.wasm
 *   - @dfinity/pic installed in node_modules
 */
const { PocketIc, SubnetStateType } = require("@dfinity/pic");
const fs = require("fs");
const path = require("path");

const POCKETIC_URL = process.env.POCKETIC_URL || "http://127.0.0.1:4943";
const WASM_PATH = path.join(__dirname, "src", "backend", "dist", "backend.wasm");
const CANISTER_ID_FILE = "/tmp/pocketic-canister-id";
const GATEWAY_PORT_FILE = "/tmp/pocketic-gateway-port";

async function main() {
  if (!fs.existsSync(WASM_PATH)) {
    throw new Error(`Backend WASM not found at ${WASM_PATH}`);
  }

  console.log("[setup] Connecting to PocketIC at", POCKETIC_URL);
  const pic = await PocketIc.create(POCKETIC_URL, {
    nns: { state: { type: SubnetStateType.New } },
    application: [{ state: { type: SubnetStateType.New } }],
  });

  console.log("[setup] Creating canister…");
  const canisterId = await pic.createCanister();
  console.log("[setup] Canister ID:", canisterId.toString());

  console.log("[setup] Installing backend WASM…");
  await pic.installCode({ canisterId, wasm: WASM_PATH });

  console.log("[setup] Starting HTTP Gateway (makeLive)…");
  const gatewayPort = await pic.makeLive();
  console.log("[setup] HTTP Gateway port:", gatewayPort);

  fs.writeFileSync(CANISTER_ID_FILE, canisterId.toString());
  fs.writeFileSync(GATEWAY_PORT_FILE, String(gatewayPort));

  console.log("[setup] Done. Canister ID and gateway port written to /tmp.");
  // Do NOT tearDown — the instance and HTTP Gateway must stay alive.
}

main().catch((err) => {
  console.error("[setup] FAILED:", err);
  process.exit(1);
});

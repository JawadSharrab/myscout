import fs from "fs";

/**
 * Vite plugin for local backend development with PocketIC.
 *
 * 1. Serves a dynamic /env.json so the frontend's `loadConfig()` picks up the
 *    PocketIC canister ID and uses the preview's own origin as the backend host
 *    (requests are then proxied to PocketIC via the Vite dev-server proxy).
 * 2. Patches `@caffeineai/core-infrastructure`'s config module so `fetchRootKey`
 *    is always called — needed because PocketIC uses a self-signed root key and
 *    the preview origin does not contain "localhost".
 */
export function localBackendPlugin() {
  return {
    name: "local-backend",
    configureServer(server) {
      server.middlewares.use("/env.json", (_req, res) => {
        const protocol =
          _req.headers["x-forwarded-proto"] || "https";
        const host = _req.headers.host;
        const origin = `${protocol}://${host}`;

        let canisterId = "undefined";
        try {
          canisterId = fs
            .readFileSync("/tmp/pocketic-canister-id", "utf-8")
            .trim();
        } catch {
          // canister ID file not ready yet — loadConfig will fall back to CANISTER_ID_BACKEND
        }

        const config = {
          backend_host: origin,
          backend_canister_id: canisterId,
          project_id: "undefined",
          ii_derivation_origin: "undefined",
          storage_gateway_url: "undefined",
        };

        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(config));
      });
    },
    transform(code, id) {
      if (
        id.includes("@caffeineai/core-infrastructure") &&
        id.includes("config.js")
      ) {
        const patched = code.replace(
          'config.backend_host?.includes("localhost")',
          "true",
        );
        if (patched !== code) {
          return { code: patched, map: null };
        }
      }
    },
  };
}

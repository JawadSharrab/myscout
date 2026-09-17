import { fileURLToPath, URL } from "url";
import fs from "fs";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import environment from "vite-plugin-environment";
import { localBackendPlugin } from "./vite-plugin-local-backend.js";

// Read the PocketIC HTTP Gateway port (written by dev-setup-backend.cjs).
// Falls back to the default dfx replica port when the file is absent.
let pocketicProxyTarget = "http://127.0.0.1:4943";
try {
  const port = fs.readFileSync("/tmp/pocketic-gateway-port", "utf-8").trim();
  if (port) pocketicProxyTarget = `http://127.0.0.1:${port}`;
} catch {
  // not available yet — use default
}

const ii_url =
  process.env.DFX_NETWORK === "local"
    ? `http://uqzsh-gqaaa-aaaaq-qaada-cai.localhost:8081/authorize`
    : `https://id.ai/authorize`;

process.env.II_URL = process.env.II_URL || ii_url;

export default defineConfig({
  logLevel: "error",
  build: {
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
  },
  css: {
    postcss: "./postcss.config.js",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: pocketicProxyTarget,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    environment(["II_URL"]),
    react(),
    localBackendPlugin(),
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"]
  },
});

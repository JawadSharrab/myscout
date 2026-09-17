import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    // The DOM environment is also passed on the CLI (`--environment jsdom`);
    // declaring it here keeps a bare `vitest` invocation consistent.
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.tsx"],
    // The container reports a constrained CPU count that makes Vitest's default
    // thread-pool sizing conflict (minThreads > maxThreads). A single fork
    // avoids the pool entirely and is plenty for this small suite.
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
});

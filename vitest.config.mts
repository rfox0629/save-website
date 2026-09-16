import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  // Vitest's own esbuild transform handles JSX, so no React plugin is needed.
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});

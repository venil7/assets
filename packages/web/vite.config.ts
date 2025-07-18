import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const version = JSON.parse(readFileSync("./package.json").toString()).version;

export default defineConfig({
  plugins: [react()],
  base: "/app",
  build: {
    emptyOutDir: true,
    outDir: "../../dist/public",
    assetsDir: "assets",
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "../../node_modules"),
    },
  },
  define: {
    VERSION: `"${version}"`,
  },
});

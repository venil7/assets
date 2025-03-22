import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

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
});

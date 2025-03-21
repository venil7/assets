import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/app",
  build: {
    emptyOutDir: true,
    outDir: "../../dist/public",
    assetsDir: "assets",
  },
});

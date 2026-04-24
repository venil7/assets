import react from "@vitejs/plugin-react";
// import * as Bun from "bun";
import { format } from "date-fns";
import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const ROOT = path.resolve(__dirname, "../../");
const PACKAGE_JSON = path.resolve(ROOT, "./package.json");
const NODE_MODULES = path.resolve(ROOT, "./node_modules/");
const OUTDIR = path.resolve(ROOT, "dist/public/");

const app_version = JSON.parse(readFileSync(PACKAGE_JSON).toString()).version;

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]]
      }
    })
  ],
  base: "/app",
  build: {
    emptyOutDir: true,
    outDir: OUTDIR,
    assetsDir: "assets"
  },
  resolve: {
    alias: { "~": NODE_MODULES }
  },
  define: {
    APP_VERSION: JSON.stringify(app_version),
    BUN_VERSION: JSON.stringify(Bun.version),
    BUILD_DATE: JSON.stringify(format(new Date(), "dd-MM-yyyy"))
  }
});

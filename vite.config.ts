import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import { defineConfig } from "vite";

const version = process.env.npm_package_version ?? "0.0.0";
const commit = process.env.VITE_COMMIT_SHA ?? readGitCommit();

function readGitCommit() {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: "/pdf-workbench/",
  build: {
    assetsDir: "assets",
    emptyOutDir: false,
    outDir: "docs",
    sourcemap: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __COMMIT_SHA__: JSON.stringify(commit),
    __REPO_URL__: JSON.stringify(
      "https://github.com/baditaflorin/pdf-workbench",
    ),
    __PAYPAL_URL__: JSON.stringify(
      "https://www.paypal.com/paypalme/florinbadita",
    ),
  },
  plugins: [react(), tailwindcss()],
});

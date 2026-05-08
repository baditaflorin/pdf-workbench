import { rm } from "node:fs/promises";
import { join } from "node:path";

const docsDir = join(process.cwd(), "docs");
const generatedPaths = [
  "assets",
  "404.html",
  "favicon.svg",
  "icons.svg",
  "index.html",
  "manifest.webmanifest",
  "sw.js",
];

await Promise.all(
  generatedPaths.map((path) =>
    rm(join(docsDir, path), { force: true, recursive: true }),
  ),
);

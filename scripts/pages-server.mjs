import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "docs");
const basePath = "/pdf-workbench";
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);
  const pathname = url.pathname.startsWith(basePath)
    ? url.pathname.slice(basePath.length) || "/"
    : url.pathname;
  const relativePath = pathname === "/" ? "/index.html" : pathname;
  const normalized = normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, normalized);

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type":
        mimeTypes[extname(filePath)] ?? "application/octet-stream",
    });
    response.end(body);
  } catch {
    const body = await readFile(join(root, "index.html"));
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(body);
  }
}).listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}${basePath}/`);
});

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer as createNodeServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json"
};

export function createServer({ getSystemStatus, publicPath }) {
  return createNodeServer((request, response) => {
    if (request.method === "GET" && request.url === "/api/health") {
      const result = getSystemStatus();
      response.writeHead(result.status === "ready" ? 200 : 503, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      });
      response.end(JSON.stringify(result));
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { allow: "GET, HEAD" });
      response.end();
      return;
    }

    serveStatic(request, response, publicPath);
  });
}

function serveStatic(request, response, publicPath) {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const requestedPath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = resolve(publicPath, requestedPath);

  if (!filePath.startsWith(`${resolve(publicPath)}${sep}`) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream",
    "x-content-type-options": "nosniff"
  });
  if (request.method === "HEAD") response.end();
  else createReadStream(filePath).pipe(response);
}

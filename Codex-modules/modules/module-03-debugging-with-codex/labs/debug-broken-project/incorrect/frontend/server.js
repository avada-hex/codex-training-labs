import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const rootDir = process.cwd();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

async function serveFile(res, filePath) {
  try {
    const content = await readFile(filePath);
    const type = MIME_TYPES[extname(filePath)] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-store"
    });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return serveFile(res, join(rootDir, "index.html"));
    }

    if (url.pathname === "/style.css") {
      return serveFile(res, join(rootDir, "style.css"));
    }

    if (url.pathname === "/client.js") {
      return serveFile(res, join(rootDir, "client.js"));
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  });
}

function listen(port) {
  const server = createServer();
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.warn(`Port ${port} is in use, trying ${port + 1}...`);
      listen(port + 1);
      return;
    }

    throw error;
  });

  server.listen(port, () => {
    console.log(`Auth frontend listening on port ${port}`);
  });
}

listen(Number(process.env.PORT) || 5173);

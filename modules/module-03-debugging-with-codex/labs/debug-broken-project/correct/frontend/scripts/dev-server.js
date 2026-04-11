const http = require("http");
const path = require("path");
const fs = require("fs/promises");

const FRONTEND_ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 5173);
const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const serveFile = async (req, res) => {
  let requestPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (requestPath === "/") {
    requestPath = "/index.html";
  }
  const normalizedPath = path.normalize(path.join(FRONTEND_ROOT, requestPath));

  if (!normalizedPath.startsWith(FRONTEND_ROOT)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  try {
    const content = await fs.readFile(normalizedPath);
    const extension = path.extname(normalizedPath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.statusCode = 200;
    res.end(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.statusCode = 404;
      res.end("Not found");
    } else {
      res.statusCode = 500;
      res.end("Server error");
    }
  }
};

const server = http.createServer(serveFile);
server.listen(PORT, () => {
  console.log(`Static dev server (correct frontend) listening on http://localhost:${PORT}`);
});

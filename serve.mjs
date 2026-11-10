import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (p.endsWith("/")) p += "index.html";
    // 旧版已删除页面：跳转到对应新页面
    const legacy = {
      "/user/user-register.html": "/user/user-login.html",
      "/user/user-forgot.html": "/user/user-login.html",
      "/web/web-register.html": "/web/web-login.html",
    };
    if (legacy[p]) { res.writeHead(301, { Location: legacy[p] }); res.end(); return; }
    if (p.startsWith("/admin/")) { res.writeHead(301, { Location: "/web/web-login.html" }); res.end(); return; }
    const file = path.join(root, path.normalize(p));
    if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
    const data = await readFile(file);
    res.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
    });
    res.end(data);
  } catch (e) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
}).listen(8080, () => console.log("恒瑞IMDT 原型已启动: http://localhost:8080/ (no-store)"));

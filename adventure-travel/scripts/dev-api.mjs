// Local stand-in for `vercel dev` (which needs a Vercel login): serves the api/*.js functions
// the way Vercel does and forwards everything else to the running `npm run dev` server, so the
// booking, payment and account flows work at http://localhost:3100 without deploying.
//
//   terminal 1:  npm run dev          (Next on :3000)
//   terminal 2:  npm run dev:api      (this, on :3100)   then open http://localhost:3100
//
// Reads .env.local for the Supabase and Razorpay keys. Function files are re-read on every request.
// Env: PORT (default 3100), NEXT_PORT (default 3000).
import http from "node:http";
import net from "node:net";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
if (existsSync(join(root, ".env.local"))) process.loadEnvFile(join(root, ".env.local"));

const PORT = Number(process.env.PORT) || 3100;
const NEXT_PORT = Number(process.env.NEXT_PORT) || 3000;
const apiDir = join(root, "api");
const require = createRequire(import.meta.url);

function loadFunction(name) {
  // Pick up edits without restarting: drop every cached module under api/.
  for (const key of Object.keys(require.cache)) if (key.startsWith(apiDir)) delete require.cache[key];
  return require(join(apiDir, `${name}.js`));
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

// Vercel's res.status().json() / res.send() helpers on a plain Node response.
function decorate(res) {
  res.status = (code) => ((res.statusCode = code), res);
  res.json = (data) => {
    if (!res.headersSent) res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
    return res;
  };
  res.send = (data) => {
    res.end(typeof data === "object" && !Buffer.isBuffer(data) ? JSON.stringify(data) : data);
    return res;
  };
  return res;
}

async function runFunction(name, mod, req, res) {
  const handler = typeof mod === "function" ? mod : mod.default;
  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);
  // Functions that set `config.api.bodyParser = false` read the raw stream themselves.
  if (mod.config?.api?.bodyParser !== false) {
    const raw = await readBody(req);
    const type = String(req.headers["content-type"] || "");
    if (!raw.length) req.body = undefined;
    else if (type.includes("application/json")) {
      try {
        req.body = JSON.parse(raw.toString("utf8"));
      } catch {
        req.body = raw.toString("utf8");
      }
    } else req.body = raw.toString("utf8");
  }
  await handler(req, decorate(res));
}

const server = http.createServer(async (req, res) => {
  const match = /^\/api\/([a-z0-9-]+)(?:\?|$)/i.exec(req.url);
  if (match && existsSync(join(apiDir, `${match[1]}.js`))) {
    try {
      await runFunction(match[1], loadFunction(match[1]), req, res);
    } catch (error) {
      console.error(`[api/${match[1]}]`, error);
      if (!res.headersSent) res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "The function crashed; see the dev-api terminal." }));
    }
    return;
  }
  // Everything else belongs to Next.
  const upstream = http.request(
    { host: "127.0.0.1", port: NEXT_PORT, path: req.url, method: req.method, headers: req.headers },
    (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers);
      up.pipe(res);
    }
  );
  upstream.on("error", () => {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end(`Next isn't running on :${NEXT_PORT}. Start it with: npm run dev`);
  });
  req.pipe(upstream);
});

// Hot-reload websocket for the dev server.
server.on("upgrade", (req, socket, head) => {
  const upstream = net.connect(NEXT_PORT, "127.0.0.1", () => {
    upstream.write(`${req.method} ${req.url} HTTP/1.1\r\n`);
    for (let i = 0; i < req.rawHeaders.length; i += 2) upstream.write(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`);
    upstream.write("\r\n");
    if (head?.length) upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });
  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
});

server.listen(PORT, () => {
  const configured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL));
  console.log(`API + site on http://localhost:${PORT}  (Next on :${NEXT_PORT})`);
  console.log(configured ? "Supabase keys found: bookings are saved to your real project." : "No Supabase keys in .env.local: booking calls will answer 503.");
});

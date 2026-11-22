// Local development server: runs the SAME Worker code (src/worker.js) in plain Node.js.
//   npm run local   ->   http://localhost:8788   (admin: /control-of-the-website)
// No dependencies needed. Settings are read from .dev.vars (copy .dev.vars.example).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 8788);

// ---- env from .dev.vars ----
const env = {};
const varsFile = path.join(ROOT, '.dev.vars');
if (fs.existsSync(varsFile)) {
  for (const line of fs.readFileSync(varsFile, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !line.trim().startsWith('#')) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} else console.warn('! No .dev.vars found — copy .dev.vars.example to .dev.vars and fill it in.');

// ---- KV stored in a JSON file (.local-kv.json) ----
const kvFile = path.join(ROOT, '.local-kv.json');
const store = fs.existsSync(kvFile) ? JSON.parse(fs.readFileSync(kvFile, 'utf8')) : {};
const save = () => fs.writeFileSync(kvFile, JSON.stringify(store, null, 2));
const live = (k) => { const e = store[k]; if (!e) return null; if (e.exp && e.exp < Date.now()) { delete store[k]; return null; } return e; };
const out = (e, type) => (type === 'arrayBuffer' && e.bin ? (() => { const b = Buffer.from(e.v, 'base64'); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); })() : e.v);
env.CONTENT = {
  async get(k, type) { const e = live(k); return e ? out(e, type) : null; },
  async getWithMetadata(k, type) { const e = live(k); return e ? { value: out(e, type), metadata: e.meta || null } : { value: null, metadata: null }; },
  async put(k, v, o = {}) { const bin = v instanceof ArrayBuffer; store[k] = { v: bin ? Buffer.from(v).toString('base64') : v, bin, meta: o.metadata || null, exp: o.expirationTtl ? Date.now() + o.expirationTtl * 1000 : 0 }; save(); },
  async delete(k) { delete store[k]; save(); },
};

// ---- static assets with SPA fallback ----
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };
env.ASSETS = {
  async fetch(req) {
    const p = decodeURIComponent(new URL(req.url).pathname);
    let f = path.join(PUBLIC, p === '/' ? 'index.html' : p);
    if (!f.startsWith(PUBLIC) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(PUBLIC, 'index.html');
    return new Response(fs.readFileSync(f), { headers: { 'content-type': types[path.extname(f)] || 'application/octet-stream' } });
  },
};

const { default: worker, generateTimeCode } = await import('../src/worker.js');

http.createServer(async (req, res) => {
  try {
    const chunks = []; for await (const c of req) chunks.push(c);
    const h = new Headers(); for (const [k, v] of Object.entries(req.headers)) h.set(k, v);
    h.set('cf-connecting-ip', req.socket.remoteAddress || '127.0.0.1');
    const r = await worker.fetch(new Request(`http://${req.headers.host || 'localhost'}${req.url}`, { method: req.method, headers: h, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) }), env);
    const out = {}; r.headers.forEach((v, k) => { out[k] = v; });
    const sc = r.headers.getSetCookie?.(); if (sc?.length) out['set-cookie'] = sc;
    res.writeHead(r.status, out); res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) { console.error(e); res.writeHead(500); res.end('Server error'); }
}).listen(PORT, async () => {
  const d = new Date();
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const code = generateTimeCode ? generateTimeCode() : timeStr.replace(':', '');
  console.log(`\n  PrismoraWebs running ->  http://localhost:${PORT}`);
  console.log(`  Admin Portal        ->  http://localhost:${PORT}/control-of-the-website`);
  console.log(`  Admin Email         ->  ${env.ADMIN_EMAIL || 'prismorawebs@gmail.com'}`);
  console.log(`  Live Time Code      ->  \x1b[1;32m[ ${code} ]\x1b[0m (matches your clock: ${timeStr})\n  (Ctrl+C to stop)\n`);
});

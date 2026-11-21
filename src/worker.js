import { sendMail, smtpConfigured, smtpConfig, splitRecipients } from './smtp.js';

export const ADMIN_PATH = '/control-of-the-website';
const SESSION_HOURS = 12;
const MAX_CONTENT_BYTES = 900_000;
const enc = new TextEncoder();

/* ---------- routes known to the single-page app (everything else = real 404) ---------- */
const STATIC_ROUTES = ['/', '/legal', '/privacy-policy', '/terms-and-conditions', '/cookie-policy', '/refund-policy', '/disclaimer', '/accessibility'];
const DEFAULT_SLUGS = ['slayernodes'];
async function roomSlugs(env) {
  try {
    const raw = env.CONTENT ? await env.CONTENT.get('content') : null;
    const items = raw && JSON.parse(raw)?.doors?.items;
    if (Array.isArray(items)) return items.map((x) => String(x.slug || '')).filter((s) => /^[a-z0-9-]{2,60}$/.test(s));
  } catch { /* fall through */ }
  return DEFAULT_SLUGS;
}
const sniff = (b) => { // image type from magic bytes (never trust the browser)
  const u = new Uint8Array(b.slice(0, 12));
  if (u[0] === 0xff && u[1] === 0xd8 && u[2] === 0xff) return 'image/jpeg';
  if (u[0] === 0x89 && u[1] === 0x50 && u[2] === 0x4e && u[3] === 0x47) return 'image/png';
  if (u[0] === 0x52 && u[1] === 0x49 && u[2] === 0x46 && u[3] === 0x46 && u[8] === 0x57 && u[9] === 0x45 && u[10] === 0x42 && u[11] === 0x50) return 'image/webp';
  return null;
};
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const text = (body, type = 'text/plain; charset=utf-8', cache = 'public, max-age=3600') => new Response(body, { headers: { 'content-type': type, 'cache-control': cache } });

/* ---------- small helpers ---------- */
const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

const b64url = (buf) => { let s = ''; for (const b of new Uint8Array(buf)) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64url = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); s += '='.repeat((4 - (s.length % 4)) % 4); const bin = atob(s); return Uint8Array.from(bin, (c) => c.charCodeAt(0)); };

async function safeEqual(a, b) { // constant-time comparison of two strings
  const [x, y] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  const u = new Uint8Array(x), v = new Uint8Array(y); let d = 0;
  for (let i = 0; i < u.length; i++) d |= u[i] ^ v[i];
  return d === 0;
}

/* ---------- sessions: signed, expiring, HttpOnly cookie ---------- */
async function hmacKey(env) {
  const raw = await crypto.subtle.digest('SHA-256', enc.encode(`pw-session-v1|${env.SESSION_SECRET || ''}|${env.ADMIN_PASSWORD}`));
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function makeToken(env) {
  const payload = b64url(enc.encode(JSON.stringify({ exp: Date.now() + SESSION_HOURS * 3600e3, n: crypto.randomUUID() })));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(env), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}
async function isAuthed(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const m = /(?:^|;\s*)pw_session=([^;]+)/.exec(request.headers.get('cookie') || '');
  if (!m) return false;
  const [payload, sig] = m[1].split('.');
  if (!payload || !sig) return false;
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(env), unb64url(sig), enc.encode(payload));
    if (!ok) return false;
    return JSON.parse(new TextDecoder().decode(unb64url(payload))).exp > Date.now();
  } catch { return false; }
}
const cookie = (val, maxAge) => `pw_session=${val}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;

/* ---------- rate limiting (KV, falls back to memory) ---------- */
const memHits = new Map();
async function allow(env, key, limit, ttl) {
  if (env.CONTENT) {
    const k = 'rl:' + key; const n = parseInt((await env.CONTENT.get(k)) || '0', 10);
    if (n >= limit) return false;
    await env.CONTENT.put(k, String(n + 1), { expirationTtl: Math.max(60, ttl) });
    return true;
  }
  const now = Date.now(); const h = (memHits.get(key) || []).filter((t) => now - t < ttl * 1000);
  if (h.length >= limit) return false;
  h.push(now); memHits.set(key, h); return true;
}

/* ---------- security headers ---------- */
const CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com", "img-src 'self' data:", "connect-src 'self'", "object-src 'none'",
  "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'", 'upgrade-insecure-requests',
].join('; ');

function secure(res, path) {
  const r = new Response(res.body, res);
  r.headers.set('Content-Security-Policy', CSP);
  r.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  r.headers.set('X-Content-Type-Options', 'nosniff');
  r.headers.set('X-Frame-Options', 'DENY');
  r.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  r.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  r.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  if (path === ADMIN_PATH || path.startsWith(ADMIN_PATH + '/') || path === '/admin.js') {
    r.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    r.headers.set('Cache-Control', 'no-store');
  }
  return r;
}

/* ---------- validation ---------- */
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

async function readJson(request, maxBytes = 20_000) {
  const len = parseInt(request.headers.get('content-length') || '0', 10);
  if (len > maxBytes) throw Object.assign(new Error('Payload too large'), { status: 413 });
  const text = await request.text();
  if (text.length > maxBytes) throw Object.assign(new Error('Payload too large'), { status: 413 });
  try { return JSON.parse(text); } catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}

function sameOriginOk(request, url) {
  if (request.headers.get('x-pw') !== '1') return false; // custom header => cross-site pages cannot send it
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return false;
  const site = request.headers.get('sec-fetch-site');
  if (site && !['same-origin', 'none'].includes(site)) return false;
  return true;
}

/* ---------- API ---------- */
async function api(request, env, url) {
  const path = url.pathname; const method = request.method;
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';

  if (path === '/api/content' && method === 'GET') {
    const raw = env.CONTENT ? await env.CONTENT.get('content') : null;
    return new Response(raw || '{}', { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-cache' } });
  }

  const im = /^\/api\/image\/([a-z0-9-]{3,60}\.(?:jpg|png|webp))$/.exec(path);
  if (im && method === 'GET') {
    const r = env.CONTENT ? await env.CONTENT.getWithMetadata('img:' + im[1], 'arrayBuffer') : null;
    if (!r || !r.value) return json({ error: 'Not found' }, 404);
    return new Response(r.value, { headers: { 'content-type': r.metadata?.type || 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
  }

  if (method !== 'GET' && !sameOriginOk(request, url)) return json({ error: 'Forbidden' }, 403);

  if (path === '/api/session' && method === 'GET')
    return json({ authed: await isAuthed(request, env), configured: !!env.ADMIN_PASSWORD });

  if (path === '/api/login' && method === 'POST') {
    if (!env.ADMIN_PASSWORD) return json({ error: 'Admin password is not configured on the server yet.' }, 503);
    if (!(await allow(env, 'login:' + ip, 5, 900))) return json({ error: 'Too many attempts. Try again in 15 minutes.' }, 429);
    let body; try { body = await readJson(request, 2000); } catch (e) { return json({ error: e.message }, e.status || 400); }
    const ok = await safeEqual(str(body.password, 200), env.ADMIN_PASSWORD);
    if (!ok) { await new Promise((r) => setTimeout(r, 400 + Math.random() * 400)); return json({ error: 'Wrong password.' }, 401); }
    return json({ ok: true }, 200, { 'set-cookie': cookie(await makeToken(env), SESSION_HOURS * 3600) });
  }

  if (path === '/api/logout' && method === 'POST') return json({ ok: true }, 200, { 'set-cookie': cookie('', 0) });

  if (path === '/api/contact' && method === 'POST') {
    let b; try { b = await readJson(request, 12_000); } catch (e) { return json({ error: e.message }, e.status || 400); }
    if (str(b.website, 100)) return json({ ok: true }); // honeypot: pretend success to bots
    const name = str(b.name, 100), email = str(b.email, 200), service = str(b.service, 100), message = str(b.message, 4000);
    if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 10) return json({ error: 'Please fill in your name, a valid email and a message (10+ characters).' }, 400);
    if (Date.now() - Number(b.t || 0) < 2500) return json({ error: 'Please try again.' }, 400); // too fast = bot
    if (!(await allow(env, 'contact:' + ip, 5, 3600))) return json({ error: 'Too many messages. Please try again later.' }, 429);
    if (!smtpConfigured(env)) return json({ error: 'Email is temporarily unavailable. Please email us directly.' }, 503);
    try {
      await sendMail(env, {
        subject: `New website enquiry — ${service || 'General'} — ${name}`,
        replyTo: email, replyName: name,
        text: `New enquiry from the PrismoraWebs website\n\nName: ${name}\nEmail: ${email}\nService: ${service || '-'}\n\nMessage:\n${message}\n\n— IP: ${ip}\n`,
      });
    } catch (e) { console.error('SMTP error:', e.message); return json({ error: 'Could not send your message right now. Please email us directly.' }, 502); }
    return json({ ok: true });
  }

  /* ---- everything below needs an admin session ---- */
  if (!(await isAuthed(request, env))) return json({ error: 'Unauthorized' }, 401);

  if (im && method === 'PUT') {
    if (!env.CONTENT) return json({ error: 'KV storage is not connected.' }, 503);
    const len = parseInt(request.headers.get('content-length') || '0', 10);
    if (len > 1_600_000) return json({ error: 'Image too large (max 1.5 MB).' }, 413);
    const buf = await request.arrayBuffer();
    if (buf.byteLength > 1_600_000 || buf.byteLength < 100) return json({ error: 'Image too large or empty.' }, 413);
    const type = sniff(buf);
    if (!type || EXT[type] !== im[1].split('.').pop()) return json({ error: 'Only real JPG, PNG or WebP images are allowed.' }, 400);
    await env.CONTENT.put('img:' + im[1], buf, { metadata: { type } });
    return json({ ok: true, url: '/api/image/' + im[1] });
  }

  if (path === '/api/content' && method === 'PUT') {
    if (!env.CONTENT) return json({ error: 'KV storage is not connected.' }, 503);
    let body; try { body = await readJson(request, MAX_CONTENT_BYTES); } catch (e) { return json({ error: e.message }, e.status || 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Content must be an object.' }, 400);
    await env.CONTENT.put('content', JSON.stringify(body));
    return json({ ok: true });
  }
  if (path === '/api/content' && method === 'DELETE') {
    if (env.CONTENT) await env.CONTENT.delete('content');
    return json({ ok: true });
  }
  if (path === '/api/admin/status' && method === 'GET') {
    const c = smtpConfig(env); const mask = (e) => splitRecipients(e).map((x) => x.replace(/^(.).*(@.*)$/, '$1***$2')).join(', ');
    return json({ kv: !!env.CONTENT, smtp: smtpConfigured(env), smtpHost: c.host || '', smtpPort: c.port, to: mask(c.to), from: mask(c.from) });
  }
  if (path === '/api/admin/test-email' && method === 'POST') {
    if (!(await allow(env, 'test:' + ip, 5, 900))) return json({ error: 'Slow down — try again in a few minutes.' }, 429);
    try { await sendMail(env, { subject: 'PrismoraWebs — SMTP test', text: 'SMTP is working. This is a test email sent from your admin panel.' }); }
    catch (e) { return json({ error: e.message }, 502); }
    return json({ ok: true });
  }
  return json({ error: 'Not found' }, 404);
}

/* ---------- entry ---------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      if (path.startsWith('/api/')) return secure(await api(request, env, url), path);
      if (request.method !== 'GET' && request.method !== 'HEAD') return secure(new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } }), path);
      if (path === '/admin' || path.startsWith('/admin/')) return secure(new Response('Not found', { status: 404 }), path); // old route is gone
      const origin = url.origin; const today = new Date().toISOString().slice(0, 10);
      if (path === '/robots.txt') return secure(text(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`), path);
      if (path === '/sitemap.xml') {
        const urls = [['/', '1.0', 'weekly'], ['/legal', '0.3', 'yearly'], ['/privacy-policy', '0.3', 'yearly'], ['/terms-and-conditions', '0.3', 'yearly'], ['/cookie-policy', '0.3', 'yearly'], ['/refund-policy', '0.3', 'yearly'], ['/disclaimer', '0.3', 'yearly'], ['/accessibility', '0.3', 'yearly'],
          ...(await roomSlugs(env)).map((s) => ['/work/' + s, '0.8', 'monthly'])];
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([l, p, f]) => `  <url><loc>${origin}${l}</loc><lastmod>${today}</lastmod><changefreq>${f}</changefreq><priority>${p}</priority></url>`).join('\n')}\n</urlset>\n`;
        return secure(text(body, 'application/xml; charset=utf-8'), path);
      }
      if (path === '/.well-known/security.txt' || path === '/security.txt')
        return secure(text(`Contact: mailto:${splitRecipients(env.CONTACT_TO)[0] || 'prismorawebs@gmail.com'}\nExpires: ${new Date(Date.now() + 365 * 864e5).toISOString()}\nPreferred-Languages: en, hi\nCanonical: ${origin}/.well-known/security.txt\n`), path);
      if (path === '/humans.txt') return secure(text('/* TEAM */\nPlanner / Founder: Arman Alam\nDeveloper / Founder: Niladri Yadav\nMarketer / C.E.O: Prince Ghosh\n\n/* SITE */\nBuilt with: HTML, CSS, JavaScript, Cloudflare Workers\n'), path);
      if (path.length > 1 && path.endsWith('/')) return Response.redirect(origin + path.replace(/\/+$/, '') + url.search, 301);

      const isFile = /\.[a-z0-9]{2,5}$/i.test(path);
      const slugMatch = /^\/work\/([a-z0-9-]+)$/.exec(path);
      const known = STATIC_ROUTES.includes(path) || path === ADMIN_PATH || (slugMatch && (await roomSlugs(env)).includes(slugMatch[1]));
      const res = await env.ASSETS.fetch(request);
      if (isFile) {
        if ((res.headers.get('content-type') || '').includes('text/html')) return secure(new Response('Not found', { status: 404 }), path);
        const out = new Response(res.body, res); // fast repeat visits: cache static files at the edge and in the browser
        out.headers.set('Cache-Control', /\.(png|jpe?g|webp|ico|svg|woff2?)$/i.test(path) ? 'public, max-age=604800, stale-while-revalidate=86400' : 'public, max-age=300, stale-while-revalidate=86400');
        return secure(out, path);
      }
      if (!known) { // unknown page: serve the app (it shows a friendly 404) but with a real 404 status
        const r404 = new Response(res.body, { status: 404, headers: res.headers }); r404.headers.set('X-Robots-Tag', 'noindex'); return secure(r404, path);
      }
      return secure(res, path);
    } catch (e) {
      console.error(e);
      return secure(json({ error: 'Server error' }, 500), path);
    }
  },
};

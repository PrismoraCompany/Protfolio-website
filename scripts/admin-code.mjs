// CLI utility to display the current 6-digit Time-Based Admin Security Code
// Usage: npm run code   OR   node scripts/admin-code.mjs [--watch]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const varsFile = path.join(ROOT, '.dev.vars');
const env = {};
if (fs.existsSync(varsFile)) {
  for (const line of fs.readFileSync(varsFile, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !line.trim().startsWith('#')) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const secret = process.env.ADMIN_CODE_KEY || env.ADMIN_CODE_KEY || process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD || 'prismora-secret-key-2025';
const email = process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || 'prismorawebs@gmail.com';
const enc = new TextEncoder();

async function getCode(stepOffset = 0) {
  const step = Math.floor(Date.now() / 60000) + stepOffset;
  const rawKey = await crypto.subtle.digest('SHA-256', enc.encode(`pw-totp-v1|${secret}`));
  const key = await crypto.subtle.importKey('raw', rawKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`step:${step}`));
  const view = new DataView(sig);
  return ((view.getUint32(0) >>> 0) % 900000 + 100000).toString();
}

async function show() {
  const code = await getCode(0);
  const next = await getCode(1);
  const prev = await getCode(-1);
  const secsLeft = 60 - (Math.floor(Date.now() / 1000) % 60);

  if (process.argv.includes('--watch')) {
    process.stdout.write(`\x1Bc`); // clear terminal
  }

  console.log(`\n======================================================`);
  console.log(`🔐  PRISMORAWEBS — TIME-BASED ADMIN SECURITY CODE`);
  console.log(`======================================================`);
  console.log(`Admin Email   : ${email}`);
  console.log(`ACTIVE CODE   : \x1b[1;32m${code}\x1b[0m  (expires in \x1b[33m${secsLeft}s\x1b[0m)`);
  console.log(`Next Code     : ${next}`);
  console.log(`Previous Code : ${prev} (grace period: active)`);
  console.log(`Time (UTC)    : ${new Date().toISOString()}`);
  console.log(`Pattern       : Rotating 60s HMAC-SHA256 window with ±1 step tolerance`);
  console.log(`======================================================\n`);
}

await show();

if (process.argv.includes('--watch')) {
  setInterval(show, 1000);
}

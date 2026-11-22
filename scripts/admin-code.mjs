// CLI utility to display the current 4-digit Clock-Based Admin Security Code
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

const email = process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || 'prismorawebs@gmail.com';

function getClockCode(minuteOffset = 0) {
  const d = new Date(Date.now() + minuteOffset * 60000);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}${m}`;
}

async function show() {
  const code = getClockCode(0);
  const next = getClockCode(1);
  const prev = getClockCode(-1);
  const secsLeft = 60 - (Math.floor(Date.now() / 1000) % 60);
  const d = new Date();
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  if (process.argv.includes('--watch')) {
    process.stdout.write(`\x1Bc`); // clear terminal
  }

  console.log(`\n======================================================`);
  console.log(`🔐  PRISMORAWEBS — CLOCK-BASED ADMIN SECURITY CODE`);
  console.log(`======================================================`);
  console.log(`Admin Email   : ${email}`);
  console.log(`Current Clock : ${timeStr}`);
  console.log(`ACTIVE CODE   : \x1b[1;32m[ ${code} ]\x1b[0m  (matches clock ${timeStr}; expires in \x1b[33m${secsLeft}s\x1b[0m)`);
  console.log(`Next Code     : [ ${next} ]`);
  console.log(`Previous Code : [ ${prev} ] (grace period: active)`);
  console.log(`Pattern       : Current 24-hour time HHMM (e.g. 09:59 → 0959, 18:49 → 1849)`);
  console.log(`======================================================\n`);
}

await show();

if (process.argv.includes('--watch')) {
  setInterval(show, 1000);
}

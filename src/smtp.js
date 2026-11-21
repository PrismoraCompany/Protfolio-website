// Minimal SMTP client for Cloudflare Workers (TCP sockets).
// Port 465 = implicit TLS, port 587 = STARTTLS. Port 25 is blocked by Cloudflare.
// Credentials come from Worker *secrets* only — they are never stored in KV or sent to the browser.

const enc = new TextEncoder();
const dec = new TextDecoder();

const clean = (s) => String(s ?? '').replace(/[\r\n\0]+/g, ' ').trim(); // blocks header injection
const b64bytes = (u8) => { let s = ''; for (const b of u8) s += String.fromCharCode(b); return btoa(s); };
const b64 = (s) => b64bytes(enc.encode(s));
const encWord = (s) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);
const addr = (name, email) => (name ? `${encWord(clean(name).replace(/["<>]/g, ''))} <${clean(email)}>` : clean(email));

export function smtpConfig(env) {
  const port = parseInt(env.SMTP_PORT || '465', 10);
  return {
    host: env.SMTP_HOST, port, secure: env.SMTP_SECURE ? String(env.SMTP_SECURE).toLowerCase() === 'true' : port === 465,
    user: env.SMTP_USER, pass: env.SMTP_PASS,
    from: env.SMTP_FROM || env.SMTP_USER,
    fromName: env.SMTP_FROM_NAME || 'PrismoraWebs',
    to: env.CONTACT_TO || env.SMTP_USER,
  };
}

export const smtpConfigured = (env) => { const c = smtpConfig(env); return !!(c.host && c.user && c.pass && c.from && c.to); };

class Conn {
  constructor(socket) { this.s = socket; this.w = socket.writable.getWriter(); this.r = socket.readable.getReader(); this.buf = ''; }
  async read() {
    const lines = [];
    for (;;) {
      let i;
      while ((i = this.buf.indexOf('\r\n')) < 0) {
        const { value, done } = await this.r.read();
        if (done) throw new Error('SMTP connection closed unexpectedly');
        this.buf += dec.decode(value, { stream: true });
      }
      const line = this.buf.slice(0, i); this.buf = this.buf.slice(i + 2); lines.push(line);
      if (/^\d{3}( |$)/.test(line)) return { code: +line.slice(0, 3), text: lines.join('\n') };
    }
  }
  async write(raw) { await this.w.write(enc.encode(raw)); }
  async cmd(c, ok, label) {
    await this.write(c + '\r\n');
    const r = await this.read();
    if (ok && !ok.includes(r.code)) throw new Error(`SMTP ${r.code} after ${label || c.split(' ')[0]}`);
    return r;
  }
  startTls() {
    this.w.releaseLock(); this.r.releaseLock();
    this.s = this.s.startTls(); this.w = this.s.writable.getWriter(); this.r = this.s.readable.getReader(); this.buf = '';
  }
  close() { try { this.s.close(); } catch { /* ignore */ } }
}

// CONTACT_TO may hold several addresses separated by commas, semicolons or spaces.
export const splitRecipients = (v) => String(v || '').split(/[,;\s]+/).map((x) => clean(x)).filter((x) => /^[^\s<>@,;:]+@[^\s<>@,;:]+\.[^\s<>@,;:]+$/.test(x));

export function buildMessage(cfg, msg) {
  const domain = clean(cfg.from).split('@')[1] || 'localhost';
  const head = [
    'From: ' + addr(cfg.fromName, cfg.from),
    'To: ' + (splitRecipients(msg.to).join(', ') || clean(msg.to)),
    msg.replyTo ? 'Reply-To: ' + addr(msg.replyName, msg.replyTo) : null,
    'Subject: ' + encWord(clean(msg.subject)),
    'Date: ' + new Date().toUTCString().replace('GMT', '+0000'),
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
  ].filter(Boolean).join('\r\n');
  return head + '\r\n\r\n' + b64(msg.text).replace(/.{1,76}/g, '$&\r\n').trimEnd();
}

export async function sendViaConnect(connect, cfg, msg) {
  const socket = connect({ hostname: cfg.host, port: cfg.port }, { secureTransport: cfg.secure ? 'on' : 'starttls', allowHalfOpen: false });
  const c = new Conn(socket);
  const hello = 'EHLO prismorawebs.local';
  try {
    let r = await c.read();
    if (r.code !== 220) throw new Error('SMTP server did not greet (' + r.code + ')');
    let caps = await c.cmd(hello, [250]);
    if (!cfg.secure) { await c.cmd('STARTTLS', [220]); c.startTls(); caps = await c.cmd(hello, [250]); }
    const up = caps.text.toUpperCase();
    if (cfg.user) {
      if (up.includes('AUTH') && up.includes('PLAIN')) await c.cmd('AUTH PLAIN ' + b64(`\0${cfg.user}\0${cfg.pass}`), [235], 'AUTH');
      else { await c.cmd('AUTH LOGIN', [334], 'AUTH'); await c.cmd(b64(cfg.user), [334], 'AUTH'); await c.cmd(b64(cfg.pass), [235], 'AUTH'); }
    }
    await c.cmd(`MAIL FROM:<${clean(cfg.from)}>`, [250], 'MAIL FROM');
    const rcpts = splitRecipients(msg.to); if (!rcpts.length) throw new Error('No valid recipient in CONTACT_TO');
    for (const rcpt of rcpts) await c.cmd(`RCPT TO:<${rcpt}>`, [250, 251], 'RCPT TO');
    await c.cmd('DATA', [354]);
    await c.write(buildMessage(cfg, msg) + '\r\n.\r\n');
    r = await c.read();
    if (r.code !== 250) throw new Error('SMTP message rejected (' + r.code + ')');
    try { await c.cmd('QUIT'); } catch { /* ignore */ }
    return true;
  } finally { c.close(); }
}

export async function sendMail(env, msg) {
  if (!smtpConfigured(env)) throw new Error('SMTP is not configured');
  const { connect } = await import('cloudflare:sockets');
  return sendViaConnect(connect, smtpConfig(env), { to: smtpConfig(env).to, ...msg });
}

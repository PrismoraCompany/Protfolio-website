// Node.js version of Cloudflare's `connect()` — used only for local testing.
import net from 'node:net';
import tls from 'node:tls';
import { Readable, Writable } from 'node:stream';

const wrap = (s) => ({
  readable: Readable.toWeb(s),
  writable: Writable.toWeb(s),
  close: () => s.destroy(),
  startTls() { // upgrade a plain connection (port 587 STARTTLS)
    const t = tls.connect({ socket: s, servername: this._host });
    return wrap(t);
  },
});

export function connect({ hostname, port }, opts = {}) {
  const secure = opts.secureTransport === 'on';
  const s = secure ? tls.connect({ host: hostname, port, servername: hostname }) : net.connect(port, hostname);
  const w = wrap(s); w._host = hostname;
  return w;
}

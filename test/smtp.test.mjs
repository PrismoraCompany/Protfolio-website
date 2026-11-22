// Runs the SMTP client against a local mock SMTP server (no internet needed):  npm test
import net from 'node:net';
import { Readable, Writable } from 'node:stream';
import assert from 'node:assert/strict';
import { sendViaConnect, buildMessage } from '../src/smtp.js';

const log = [];
let captured = '';
const server = net.createServer((sock) => {
  let inData = false; let buf = '';
  const send = (s) => sock.write(s + '\r\n');
  send('220 mock ESMTP');
  sock.on('data', (d) => {
    buf += d.toString();
    let i;
    while ((i = buf.indexOf('\r\n')) >= 0) {
      const line = buf.slice(0, i); buf = buf.slice(i + 2);
      if (inData) { if (line === '.') { inData = false; send('250 queued'); } else captured += line + '\n'; continue; }
      log.push(line.split(' ')[0]);
      if (line.startsWith('EHLO')) { sock.write('250-mock\r\n250-AUTH PLAIN LOGIN\r\n250 8BITMIME\r\n'); }
      else if (line.startsWith('AUTH PLAIN')) { const [, u, p] = Buffer.from(line.split(' ')[2], 'base64').toString().split('\0'); log.push(`cred:${u}:${p}`); send(u === 'me@x.com' && p === 'secret' ? '235 ok' : '535 bad'); }
      else if (line.startsWith('MAIL FROM')) send('250 ok');
      else if (line.startsWith('RCPT TO')) send('250 ok');
      else if (line === 'DATA') { inData = true; send('354 go'); }
      else if (line === 'QUIT') { send('221 bye'); sock.end(); }
      else send('500 ?');
    }
  });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const connect = ({ hostname, port: p }) => { const s = net.connect(p, hostname); return { readable: Readable.toWeb(s), writable: Writable.toWeb(s), close: () => s.destroy() }; };

const cfg = { host: '127.0.0.1', port, secure: true, user: 'me@x.com', pass: 'secret', from: 'me@x.com', fromName: 'PrismoraWebs' };
await sendViaConnect(connect, cfg, { to: 'owner@x.com', subject: 'Héllo — test', replyTo: 'visitor@y.com', replyName: 'Vis Itor', text: 'Line1\n.dot line\nनमस्ते 🙂' });

assert.ok(log.includes('cred:me@x.com:secret'), 'AUTH PLAIN credentials were sent');
assert.deepEqual(log.filter((l) => !l.startsWith('cred')), ['EHLO', 'AUTH', 'MAIL', 'RCPT', 'DATA', 'QUIT']);
const body = Buffer.from(captured.split('\n\n').slice(1).join('').replace(/\n/g, ''), 'base64').toString('utf8');
assert.equal(body, 'Line1\n.dot line\nनमस्ते 🙂', 'UTF-8 body + dot-line survive intact');
assert.match(captured, /Reply-To: Vis Itor <visitor@y.com>/);
assert.match(captured, /Subject: =\?UTF-8\?B\?/);

// multiple recipients in CONTACT_TO (comma, semicolon, space separated)
log.length = 0; captured = '';
await sendViaConnect(connect, cfg, { to: 'team1@gmail.com, team2@gmail.com; team3@gmail.com', subject: 'Multi Enquiry', text: 'Hi all' });
assert.deepEqual(log.filter((l) => !l.startsWith('cred')), ['EHLO', 'AUTH', 'MAIL', 'RCPT', 'RCPT', 'RCPT', 'DATA', 'QUIT'], 'Issues RCPT TO for each recipient');
assert.match(captured, /To: team1@gmail.com, team2@gmail.com, team3@gmail.com/);

// header injection is neutralised
const evil = buildMessage(cfg, { to: 'a@b.com', subject: 'x\r\nBcc: spy@evil.com', replyTo: 'v@y.com\r\nBcc: spy@evil.com', text: 'hi' });
assert.ok(!/^Bcc:/mi.test(evil), 'no injected headers');

// wrong password is reported
await assert.rejects(() => sendViaConnect(connect, { ...cfg, pass: 'nope' }, { to: 'o@x.com', subject: 's', text: 't' }), /SMTP 535/);
server.close();
console.log('SMTP tests passed ✔');

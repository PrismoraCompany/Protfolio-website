(() => {
'use strict';
const { D, merge, clone, esc, col, isObj, $, $$ } = window.PW;

const call = async (method, path, body) => {
  const r = await fetch(path, { method, credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-pw': '1' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data: j };
};

const SECTIONS = [['meta', 'Site & email'], ['nav', 'Navigation'], ['social', 'Social links'], ['hero', 'Hero'], ['about', 'About'], ['doors', 'Doors & rooms'], ['experience', 'Journey'], ['services', 'Services'], ['why', 'Why us'], ['showcase', 'Featured websites'], ['marquee', 'Marquee'], ['stats', 'Stats'], ['packages', 'Packages'], ['toolkit', 'Toolkit'], ['process', 'Process'], ['reviews', 'Reviews'], ['faq', 'FAQ'], ['cta', 'Call to action'], ['contact', 'Contact'], ['footer', 'Footer'], ['legal', 'Legal pages'], ['ui', 'Labels, 404 page & small text'], ['features', 'Features & behaviour'], ['status', 'Email (SMTP) & security']];
const human = (k) => (/^\d+$/.test(k) ? 'Line ' + (+k + 1) : String(k).replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()));
const pa = (p) => esc(JSON.stringify(p));
const LONG = /description|bio|quote|text|subtitle|intro|body|blurb|success|error/i;

let draft, dirty = false, cur = 'hero'; const open = new Set(); let root;
const getAt = (p) => p.reduce((o, k) => o[k], draft);
const setAt = (p, v) => { p.slice(0, -1).reduce((o, k) => o[k], draft)[p[p.length - 1]] = v; markDirty(); };
function markDirty() { dirty = true; const d = $('#dirty'); if (d) { d.textContent = 'Unsaved changes'; d.className = 'dirty'; } }

const PHOTO_LABELS = { shot: 'Website photo / screenshot', bgImage: 'Background image (optional)', photo: 'Photo (portrait works best)', personImage: 'Person image — replaces the silhouette (a transparent PNG cut-out looks best)', spotlightImage: 'Spotlight image — replaces the glowing figure (optional)' };
const TEMPLATES = {
  'reviews.items': { quote: '', name: '', role: '' },
  'doors.items': { slug: '', name: '', plate: 'WEBSITE', tagline: '', color: '#3b4a63', bullets: [], description: '', functions: [], tech: [], facts: [], liveLink: '', links: [], shot: '' },
  links: { label: '', url: '' },
  functions: { title: '', text: '' }, facts: { label: '', value: '' },
};
const tplFor = (path) => TEMPLATES[path.join('.')] || TEMPLATES[path[path.length - 1]];
const SELECTS = { textTheme: ['dark', 'light'], showSilhouette: ['yes', 'no'], roomDrag: ['look', 'grab'], introAnimation: ['yes', 'no'], customCursor: ['yes', 'no'] };
const LABELS = { roomDrag: 'Room drag direction — look: drag right turns the view right (like the arrow keys) · grab: the room follows your cursor', doorsAutoSeconds: 'Doors auto-advance every N seconds (0 = off)', introAnimation: 'Show the loading animation on first visit', customCursor: 'Use the custom animated cursor (desktop)', liveLink: 'Main website link (https://…) — shows the main button', url: 'Website address (https://…)', links: 'Extra “Visit site” buttons', personRatio: 'Person image width ÷ height (e.g. 1.79)', x: 'Name-tag position: horizontal % of the image (head centre)', top: 'Name-tag position: vertical % of the image (top of head)', left: 'Hover area: left edge %', right: 'Hover area: right edge %', desc: 'Short description',  textTheme: 'Text colour on the hero (dark = for light backgrounds, light = for dark backgrounds)', showSilhouette: 'Show the person silhouette', bgOverlay: 'Darkness over the background image (0 – 80)', bgColor: 'Background colour', bgColor2: 'Background colour 2 (optional — creates a top-to-bottom gradient)' };
const IMGRE = /^\/(?:api\/image\/)?[a-z0-9-]{3,60}\.(jpg|png|webp)$/;
function field(path, val, key) {
  const a = `data-p="${pa(path)}"`; const lab = human(key);
  if (['shot', 'bgImage', 'photo', 'personImage', 'spotlightImage'].includes(key)) return `<div class="fd"><label>${PHOTO_LABELS[key]}</label><div class="ph2">${IMGRE.test(val) ? `<img src="${esc(val)}" alt="">` : '<span>No photo — a generated preview is used</span>'}<div><input type="file" accept="image/jpeg,image/png,image/webp" data-shot="${pa(path)}" class="in-a" style="padding:8px"><button class="abtn" style="margin-top:8px" data-act="clearshot" data-p="${pa(path)}">Remove photo</button><div class="amsg" data-upmsg></div></div></div></div>`;
  if (key === 'slug') return `<div class="fd"><label>${lab} (the page address: /work/<b>${esc(val || 'name')}</b>)</label><input class="in-a" data-slug ${a} value="${esc(val)}"></div>`;
  if (SELECTS[key]) return `<div class="fd"><label>${LABELS[key] || lab}</label><select class="in-a" ${a}>${SELECTS[key].map((o) => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`;
  if (/color$/i.test(key)) return `<div class="fd"><label>${lab}</label><div class="cl"><input type="color" ${a} value="${col(val)}"><input class="in-a" ${a} value="${esc(val)}" style="max-width:140px"></div></div>`;
  if (LABELS[key]) { return `<div class="fd"><label>${LABELS[key]}</label><input class="in-a" ${a} value="${esc(val)}"></div>`; }
  const long = String(val).length > 70 || LONG.test(String(key));
  return `<div class="fd"><label>${lab}</label>${long ? `<textarea class="in-a" ${a}>${esc(val)}</textarea>` : `<input class="in-a" ${a} value="${esc(val)}">`}</div>`;
}
const label = (o, i) => o.name || o.title || o.heading || o.tab || o.label || ('Item ' + (i + 1));
function node(path, val, key, top) {
  if (Array.isArray(val)) return arr(path, val, key);
  if (isObj(val)) { const inner = Object.keys(val).map((k) => node([...path, k], val[k], k)).join(''); if (top) return inner; const id = path.join('.'); return `<details class="grp" data-id="${esc(id)}" ${open.has(id) ? 'open' : ''}><summary>${human(key)}</summary><div class="bd2">${inner}</div></details>`; }
  return field(path, val, key);
}
function arr(path, a, key) {
  const ps = pa(path);
  if (a.every((x) => typeof x !== 'object') && !(a.length === 0 && tplFor(path))) return `<div class="fd"><label>${human(key)}</label>${a.map((v, i) => `<div class="lr"><input class="in-a" data-p="${pa([...path, i])}" value="${esc(v)}"><button class="mini2" data-act="del" data-p="${ps}" data-i="${i}" aria-label="Remove">✕</button></div>`).join('')}<button class="addb" data-act="addp" data-p="${ps}">+ Add line</button></div>`;
  return `<div class="fd"><label>${human(key)}</label>${a.map((o, i) => { const id = path.join('.') + '.' + i; return `<details class="grp" data-id="${esc(id)}" ${open.has(id) ? 'open' : ''}><summary><span>${esc(label(o, i))}</span><span class="sp"></span><button class="mini2" data-act="up" data-p="${ps}" data-i="${i}" aria-label="Move up">↑</button><button class="mini2" data-act="down" data-p="${ps}" data-i="${i}" aria-label="Move down">↓</button><button class="mini2" data-act="del" data-p="${ps}" data-i="${i}" aria-label="Delete">✕</button></summary><div class="bd2">${Object.keys(o).map((k) => node([...path, i, k], o[k], k)).join('')}</div></details>`; }).join('')}<button class="addb" data-act="addo" data-p="${ps}">+ Add ${esc(human(key).toLowerCase())}</button></div>`;
}
const prep = (d) => { (d.doors?.items || []).forEach((r) => { if (!Array.isArray(r.links)) r.links = []; }); return d; };   // older saved rooms: add the new links list
const blank = (o) => (Array.isArray(o) ? [] : isObj(o) ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, k === 'color' ? v : blank(v)])) : '');

function loginHTML(configured, emailHint) {
  return `<div class="adm alg"><form class="acardl" id="lf"><h1>Admin sign in</h1><p>${configured ? 'Sign in with your admin credentials to access the panel.' : 'The admin password has not been set on the server yet. In Cloudflare: Worker → Settings → Variables and Secrets → add a secret named <code class="k">ADMIN_PASSWORD</code>.'}</p>
  <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:14px">
    <div><label style="display:block;font:600 11px var(--mono);color:#9a9aa2;margin-bottom:5px">ADMIN EMAIL</label>
    <input class="in-a" id="em" type="email" placeholder="${esc(emailHint || 'prismorawebs@gmail.com')}" autocomplete="username" ${configured ? 'autofocus' : 'disabled'} required></div>
    <div><label style="display:block;font:600 11px var(--mono);color:#9a9aa2;margin-bottom:5px">ADMIN PASSWORD</label>
    <input class="in-a" id="pw" type="password" placeholder="Password" autocomplete="current-password" ${configured ? '' : 'disabled'} required></div>
    <div><label style="display:block;font:600 11px var(--mono);color:#9a9aa2;margin-bottom:5px">SECURITY CODE</label>
    <input class="in-a" id="cd" type="text" maxlength="4" pattern="[0-9]{4}" placeholder="enter the code" autocomplete="one-time-code" style="font-family:var(--mono);font-size:15px;letter-spacing:2px;text-align:center" ${configured ? '' : 'disabled'} required></div>
  </div>
  <div class="aerr" id="er"></div>
  <button class="abtn pr" style="width:100%;padding:12px" ${configured ? '' : 'disabled'}>Sign in</button></form></div>`;
}
function shell() {
  const body = cur === 'status' ? '<div id="statusbox">Loading…</div>' : `<h2>${esc(SECTIONS.find((s) => s[0] === cur)[1])}</h2><p class="hint2">Edit any line, then press <b>Save to live site</b>. Changes go live for every visitor.</p>${node([cur], draft[cur], cur, true)}`;
  return `<div class="adm"><div class="abar"><h1>${esc(draft.meta.brand)}<small>Admin</small></h1><div class="r"><span id="dirty" class="dirty ${dirty ? '' : 'ok'}">${dirty ? 'Unsaved changes' : ''}</span><a class="abtn" href="/" target="_blank" rel="noopener">View site</a><button class="abtn" data-act="discard">Discard</button><button class="abtn pr" data-act="save">Save to live site</button><button class="abtn" data-act="logout">Sign out</button></div></div>
  <div class="aly"><nav class="asd" aria-label="Sections">${SECTIONS.map((s) => `<button class="${s[0] === cur ? 'on' : ''}" data-sec="${s[0]}">${s[1]}</button>`).join('')}</nav><div class="apn" id="apn">${body}</div></div></div>`;
}

async function statusPanel() {
  const box = $('#statusbox'); const r = await call('GET', '/api/admin/status');
  if (!r.ok) { box.textContent = 'Could not load status.'; return; }
  const s = r.data; const yn = (b) => `<span class="${b ? 'ok2' : 'no2'}">${b ? '● Connected' : '● Not set up'}</span>`;
  const viaText = (s.configuredVia === 'admin' || s.configuredVia === 'kv') ? '<span style="color:#7ee2a0">Configured via Admin Panel (Database)</span>' : (s.configuredVia === 'env' ? '<span style="color:#eab308">Configured via Cloudflare Variables/Secrets</span>' : '<span style="color:#8d8d92">Not configured yet</span>');

  box.innerHTML = `<h2>Email (SMTP) & security</h2><p class="hint2">Configure your SMTP email server directly below. Changes take effect instantly without needing to configure Cloudflare Workers variables.</p>
  <div class="acd"><h3>Current Status</h3><div class="st2"><div><span>Database storage (KV)</span>${yn(s.kv)}</div><div><span>SMTP email</span>${yn(s.smtp)}</div><div><span>Configuration source</span><span>${viaText}</span></div>${s.smtp ? `<div><span>Server</span><span>${esc(s.smtpHost)}:${esc(s.smtpPort)} (${s.smtpSecure ? 'SSL/TLS' : 'STARTTLS'})</span></div><div><span>Sends from</span><span>${esc(s.fromName)} &lt;${esc(s.from)}&gt;</span></div><div><span>Enquiries go to</span><span>${esc(s.to)}</span></div>` : ''}</div>
  <button class="abtn" data-act="testmail" ${s.smtp ? '' : 'disabled'}>Send test email</button><div class="amsg" id="tm"></div></div>

  <div class="acd"><h3>Configure SMTP in Admin Panel</h3>
  <p class="t">Save your SMTP credentials directly to your website's database. For Gmail, use an <b>App Password</b> (16 characters from Google Account → Security → App Passwords).</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:14px">
    <div>
      <label style="display:block;font:600 11px var(--mono);color:#9a9aa2;margin-bottom:5px">SMTP HOST</label>
      <input class="in-a" id="smtp-host" type="text" value="${esc(s.smtpHost || 'smtp.gmail.com')}" placeholder="smtp.gmail.com">
    </div>
    <div>
      <label style="display:block;font:600 11px var(--mono);color:#9a9aa2;margin-bottom:5px">SMTP PORT</label>
      <input class="in-a" id="smtp-port" type="number" value="${esc(s.smtpPort || 465)}" placeholder="465">
    </div>
    <div>
      <label style="display:block;font:600 11px var(--mono);color:#9a9aa2;margin-bottom:5px">SECURITY</label>
      <select class="in-a" id="smtp-secure">
        <option value="true" ${s.smtpSecure !== false ? 'selected' : ''}>SSL / TLS (Port 465 - Recommended)</option>
        <option value="false" ${s.smtpSecure === false ? 'selected' : ''}>STARTTLS (Port 587)</option>
      </select>
    </div>
    <div>
      <label style="display:block;font:600 11px var(--mono);color:#9a9aa2;margin-bottom:5px">FROM NAME</label>
      <input class="in-a" id="smtp-fromname" type="text" value="${esc(s.fromName || 'PrismoraWebs')}" placeholder="PrismoraWebs">
    </div>
    <div>
      <label style="display:block;font:600 11px var(--mono);color:#9a9aa2;margin-bottom:5px">SENDER EMAIL (GMAIL)</label>
      <input class="in-a" id="smtp-user" type="email" value="${esc(s.smtpUser || '')}" placeholder="yourname@gmail.com">
    </div>
    <div>
      <label style="display:block;font:600 11px var(--mono);color:#9a9aa2;margin-bottom:5px">GMAIL APP PASSWORD ${s.hasPass ? '<span style="color:#7ee2a0;font-weight:normal">(password saved)</span>' : ''}</label>
      <input class="in-a" id="smtp-pass" type="password" placeholder="${s.hasPass ? '●●●●●●●●●●●●●●●● (leave blank to keep current)' : '16-character App Password'}">
    </div>
  </div>
  <div style="margin-bottom:14px">
    <label style="display:block;font:600 11px var(--mono);color:#9a9aa2;margin-bottom:5px">SEND ENQUIRIES TO (MULTIPLE RECIPIENTS SUPPORTED)</label>
    <input class="in-a" id="smtp-to" type="text" value="${esc(s.to || '')}" placeholder="admin1@gmail.com, admin2@gmail.com">
    <small style="display:block;color:#71717a;font:500 11px/1.4 var(--sans);margin-top:4px">
      Separate multiple emails with commas, semicolons or spaces. Every listed email address will receive incoming website contact enquiries simultaneously.
    </small>
  </div>
  <div style="display:flex;gap:10px;align-items:center">
    <button class="abtn pr" data-act="savesmtp">Save SMTP Configuration</button>
  </div>
  <div class="amsg" id="smtp-msg"></div>
  </div>

  <div class="acd"><h3>Security & Session</h3><p class="t">Admins remain signed in for <b>15 days</b> until manual sign-out. Sign-in requires your admin email, password, and the synchronized 60-second time security code. Brute-force protection limits repeated failed attempts per IP.</p></div>`;
}

function render() { const y = scrollY; root.innerHTML = shell(); if (cur === 'status') statusPanel(); scrollTo(0, y); }

function wire() {
  root.onclick = async (e) => {
    const sb = e.target.closest('[data-sec]'); if (sb) { cur = sb.dataset.sec; render(); scrollTo(0, 0); return; }
    const a = e.target.closest('[data-act]'); if (!a) return; e.preventDefault(); e.stopPropagation();
    const act = a.dataset.act; const p = a.dataset.p ? JSON.parse(a.dataset.p) : null; const i = +a.dataset.i;
    if (act === 'logout') { await call('POST', '/api/logout'); mount(root); }
    else if (act === 'savesmtp') {
      const m = $('#smtp-msg'); m.className = 'amsg'; m.textContent = 'Saving…'; a.disabled = true;
      const host = $('#smtp-host')?.value.trim();
      const port = parseInt($('#smtp-port')?.value || '465', 10);
      const secure = $('#smtp-secure')?.value === 'true';
      const user = $('#smtp-user')?.value.trim();
      const pass = $('#smtp-pass')?.value.trim();
      const fromName = $('#smtp-fromname')?.value.trim();
      const to = $('#smtp-to')?.value.trim();
      const r = await call('PUT', '/api/admin/smtp', { host, port, secure, user, pass, from: user, fromName, to });
      a.disabled = false;
      if (r.ok) {
        m.className = 'amsg'; m.textContent = 'SMTP configuration saved live to database! ✓';
        setTimeout(() => statusPanel(), 1000);
      } else {
        m.className = 'amsg bad'; m.textContent = r.data.error || 'Failed to save SMTP settings.';
      }
    }
    else if (act === 'save') {
      a.disabled = true; const r = await call('PUT', '/api/content', draft); a.disabled = false;
      const d = $('#dirty'); if (r.ok) { dirty = false; window.PW.C = merge(clone(D), clone(draft)); d.textContent = 'Saved ✓ — live now'; d.className = 'dirty ok'; } else { d.textContent = r.status === 401 ? 'Session expired — sign in again' : (r.data.error || 'Save failed'); d.className = 'dirty'; if (r.status === 401) setTimeout(() => mount(root), 1200); }
    }
    else if (act === 'discard') { if (!dirty || confirm('Discard all unsaved changes?')) { draft = clone(window.PW.C); prep(draft); dirty = false; render(); } }
    else if (act === 'del') { if (confirm('Delete this entry?')) { getAt(p).splice(i, 1); markDirty(); render(); } }
    else if (act === 'up') { const ar = getAt(p); if (i > 0) { [ar[i - 1], ar[i]] = [ar[i], ar[i - 1]]; markDirty(); render(); } }
    else if (act === 'down') { const ar = getAt(p); if (i < ar.length - 1) { [ar[i + 1], ar[i]] = [ar[i], ar[i + 1]]; markDirty(); render(); } }
    else if (act === 'addp') { getAt(p).push('New line'); markDirty(); render(); }
    else if (act === 'clearshot') { p.slice(0, -1).reduce((o, k) => o[k], draft)[p[p.length - 1]] = ''; markDirty(); render(); }
    else if (act === 'addo') { const ar = getAt(p); const t = ar[0] ? blank(clone(ar[0])) : clone(tplFor(p) || {}); const k = Object.keys(t); if (k.includes('slug')) t.slug = 'new-website-' + Date.now().toString(36); if (k.includes('name')) t.name = 'New item'; else if (k.includes('title')) t.title = 'New item'; else if (k.includes('heading')) t.heading = 'New heading'; ar.push(t); open.add(p.join('.') + '.' + (ar.length - 1)); markDirty(); render(); }
    else if (act === 'testmail') { const m = $('#tm'); m.className = 'amsg'; m.textContent = 'Sending…'; const r = await call('POST', '/api/admin/test-email'); m.className = 'amsg' + (r.ok ? '' : ' bad'); m.textContent = r.ok ? 'Test email sent ✓ — check your inbox.' : (r.data.error || 'Failed to send.'); }
  };
  root.onchange = async (e) => {
    const t = e.target; if (!t.dataset.shot || !t.files || !t.files[0]) return; const msg = t.closest('.ph2').querySelector('[data-upmsg]');
    msg.className = 'amsg'; msg.textContent = 'Uploading…';
    try {
      const f = t.files[0]; const bmp = await createImageBitmap(f); const key = JSON.parse(t.dataset.shot).slice(-1)[0];
      // cut-outs (people / spotlight) must keep their transparency: PNG *and WebP* sources stay transparent
      // (they used to be flattened to JPEG, which turned the empty area into a solid box)
      const cut = ['personImage', 'spotlightImage'].includes(key) && /^image\/(png|webp)$/.test(f.type);
      let scale = Math.min(1, (cut ? 1100 : 1600) / bmp.width), blob, mime = 'image/jpeg';
      for (let i = 0; i < 6; i++) {            // shrink until it fits the 1.5 MB server limit
        const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * scale); cv.height = Math.round(bmp.height * scale);
        cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
        if (cut) {
          blob = await new Promise((r) => cv.toBlob(r, 'image/webp', .92));          // transparent + small
          if (blob && blob.type === 'image/webp') mime = 'image/webp';
          else { blob = await new Promise((r) => cv.toBlob(r, 'image/png')); mime = 'image/png'; }   // browser can't encode WebP
        } else blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', .84));
        if (blob.size <= 1_450_000) break; scale *= .8;
      }
      const name = crypto.randomUUID() + (mime === 'image/png' ? '.png' : mime === 'image/webp' ? '.webp' : '.jpg');
      const r = await fetch('/api/image/' + name, { method: 'PUT', credentials: 'same-origin', headers: { 'content-type': mime, 'x-pw': '1' }, body: blob });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { msg.className = 'amsg bad'; msg.textContent = j.error || 'Upload failed'; return; }
      setAt(JSON.parse(t.dataset.shot), j.url); render();
    } catch { msg.className = 'amsg bad'; msg.textContent = 'Could not read that image.'; }
  };
  root.oninput = (e) => {
    const t = e.target; if (!t.dataset.p) return;
    if (t.hasAttribute('data-slug')) { const v = t.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+/, ''); if (v !== t.value) t.value = v; }
    setAt(JSON.parse(t.dataset.p), t.value);
    $$(`[data-p='${t.dataset.p.replace(/'/g, '&#39;')}']`, root).forEach((o) => { if (o !== t && (o.type === 'color' ? /^#[0-9a-f]{6}$/i.test(t.value) : true)) o.value = t.value; });
  };
  root.addEventListener('toggle', (e) => { const d = e.target; if (d.dataset && d.dataset.id) { d.open ? open.add(d.dataset.id) : open.delete(d.dataset.id); } }, true);
}

async function mount(app) {
  root = app; root.innerHTML = '<div class="adm alg"><p style="color:#8d8d92">Loading…</p></div>';
  const s = await call('GET', '/api/session');
  if (!s.data.authed) {
    root.innerHTML = loginHTML(s.data.configured, s.data.adminEmailHint);
    const lf = $('#lf'); if (lf) lf.onsubmit = async (e) => {
      e.preventDefault(); const b = lf.querySelector('button'); b.disabled = true; $('#er').textContent = '';
      const email = $('#em')?.value.trim();
      const password = $('#pw')?.value;
      const code = $('#cd')?.value.trim();
      const tz = new Date().getTimezoneOffset();
      const r = await call('POST', '/api/login', { email, password, code, tz }); b.disabled = false;
      if (r.ok) mount(app); else $('#er').textContent = r.data.error || 'Sign in failed.';
    };
    return;
  }
  draft = clone(window.PW.C); prep(draft); dirty = false; wire(); render();
}

window.PW_ADMIN = { mount };
})();

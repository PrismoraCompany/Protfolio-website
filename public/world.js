(() => {
'use strict';
const PW = () => window.PW;
const X = (window.PW_X = {});
const IMG = /^\/(?:api\/image\/)?[a-z0-9-]{3,60}\.(jpg|png|webp)$/;
const liveOk = (u) => /^https?:\/\//i.test(u || '');

/* =============== meta / SEO =============== */
function tag(sel, make, attr, val) {
  let el = document.head.querySelector(sel); if (!el) { el = make(); document.head.appendChild(el); }
  el.setAttribute(attr, val);
}
X.meta = (title, desc, path, noindex) => {
  const { C } = PW(); const base = (C.meta.siteUrl || location.origin).replace(/\/$/, ''); const full = base + (path === '/' ? '/' : path);
  document.title = title;
  const m = (name, prop, v) => tag(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`, () => { const e = document.createElement('meta'); e.setAttribute(prop ? 'property' : 'name', name); return e; }, 'content', v);
  m('description', 0, desc); m('og:title', 1, title); m('og:description', 1, desc); m('og:url', 1, full); m('twitter:title', 0, title); m('twitter:description', 0, desc);
  m('robots', 0, noindex ? 'noindex, nofollow' : 'index, follow');
  tag('link[rel="canonical"]', () => { const e = document.createElement('link'); e.rel = 'canonical'; return e; }, 'href', full);
};
X.jsonld = (obj) => {
  document.getElementById('ld-dyn')?.remove(); if (!obj) return;
  const s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld-dyn'; s.textContent = JSON.stringify(obj); document.head.appendChild(s);
  PW().later(() => s.remove());
};

/* =============== legal helpers =============== */
X.legalLinks = (C) => { const f = C.footer; return [['/privacy-policy', f.privacy], ['/terms-and-conditions', f.terms], ['/cookie-policy', f.cookies], ['/refund-policy', f.refund], ['/disclaimer', f.disclaimer], ['/accessibility', f.accessibility], ['/legal', f.legalHub]].map(([h, t]) => `<a data-link href="${h}">${PW().esc(t)}</a>`).join(''); };
X.legalHub = (C) => {
  const { esc, $ } = PW(); const L = C.legal; document.body.classList.add('legalpage');
  X.meta(`${L.hub.title} — ${C.meta.brand}`, L.hub.intro, '/legal');
  const docs = ['privacy', 'terms', 'cookies', 'refund', 'disclaimer', 'accessibility'];
  const href = { privacy: '/privacy-policy', terms: '/terms-and-conditions', cookies: '/cookie-policy', refund: '/refund-policy', disclaimer: '/disclaimer', accessibility: '/accessibility' };
  $('#app').innerHTML = `<div class="lg"><header class="lgh"><a class="logo" data-link href="/">${esc(C.meta.logoText)}<i></i></a><a class="back" data-link href="/">${esc(C.ui.backHome)}</a></header>
  <main class="lgm"><p class="eyebrow">${esc(C.ui.legalEyebrow)}</p><h1>${esc(L.hub.title)}</h1><p class="lead">${esc(L.hub.intro)}</p>
  <div class="lhub">${docs.map((k) => `<a class="lcard" data-link href="${href[k]}"><b>${esc(L[k].title)}</b><span>${esc(L[k].updated)}</span><p>${esc(L[k].intro.slice(0, 120))}…</p></a>`).join('')}</div></main>
  <footer class="lgf"><span>${esc(PW().copyright(C.footer))}</span><nav>${X.legalLinks(C)}</nav></footer></div>`;
};
X.notFound = () => {
  const { C, $, esc } = PW(); document.body.classList.add('legalpage'); X.meta(`Page not found — ${C.meta.brand}`, 'This page could not be found.', location.pathname, true);
  $('#app').innerHTML = `<div class="lg"><header class="lgh"><a class="logo" data-link href="/">${esc(C.meta.logoText)}<i></i></a></header><main class="lgm nf"><p class="eyebrow">${esc(C.ui.notFoundEyebrow)}</p><h1>${esc(C.ui.notFoundTitle)}</h1><p class="lead">${esc(C.ui.notFoundText)}</p><a class="btn w dk" data-link href="/#doors">${esc(C.ui.notFoundButton)}</a></main></div>`;
};

/* =============== doors (home) =============== */
X.doors = (C) => {
  const { esc, col } = PW(); const d = C.doors;
  return `<section class="doors" id="doors"><div class="dwall" id="dwall"><h2 class="dh rv">${esc(d.heading)}</h2>
 <div class="drow" id="drow">${d.items.map((x, i) => `<div class="dr rv" data-i="${i}" style="--c:${col(x.color)};--d:${(i * .12).toFixed(2)}s">
  <div class="lamp" aria-hidden="true"><i class="arm"></i><i class="shade"></i><i class="bulb"></i><i class="cone"></i></div>
  <button class="door" aria-label="${esc(x.name)} — ${esc(x.plate)}"><span class="arch"><span class="inside"></span><span class="leaf"><b class="plate">${esc(x.plate)}</b><i class="knob"></i><i class="key"></i></span></span></button>
  <span class="enter"><span class="e1">${esc(d.enterDesktop)}</span><span class="e2">${esc(d.enterMobile)}</span></span></div>`).join('')}</div>
 <div class="dcard" id="dcard" aria-live="polite"></div>
 <p class="dhint"><span class="e1">${esc(d.hintDesktop)}</span><span class="e2">${esc(d.hintMobile)}</span></p></div></section>`;
};

X.initDoors = () => {
  const { $, $$, on, later, reduce, navigate, esc, C } = PW();
  const wall = $('#dwall'), row = $('#drow'), card = $('#dcard'); if (!wall) return;
  const drs = $$('.dr', row), items = C.doors.items; let lit = -1, entering = false, touch = false, all = false;
  const place = (i) => {
    if (innerWidth <= 860) { card.style.left = ''; card.style.top = ''; return; }
    const w = wall.getBoundingClientRect(), r = drs[i].getBoundingClientRect(), cw = card.offsetWidth;
    const left = i < items.length / 2 ? r.right - w.left + 26 : r.left - w.left - cw - 26;
    card.style.left = Math.max(14, Math.min(left, w.width - cw - 14)) + 'px'; card.style.top = (r.top - w.top + r.height * .22) + 'px';
  };
  const swing = () => {};
  const show = (i) => {
    all = false; lit = i; drs.forEach((d, k) => d.classList.toggle('lit', k === i)); row.classList.toggle('has', i >= 0);
    if (i < 0) { card.classList.remove('on'); return; }
    const x = items[i];
    card.innerHTML = `<h3>${esc(x.name)}</h3><em>${esc(x.tagline)}</em><ul>${(x.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
    card.classList.remove('on'); void card.offsetWidth; place(i); card.classList.add('on'); swing();
  };
  const enter = (i) => {
    if (entering) return; entering = true; const d = drs[i]; d.classList.add('open');
    const r = d.getBoundingClientRect(), w = wall.getBoundingClientRect();
    wall.style.setProperty('--ox', r.left + r.width / 2 - w.left + 'px'); wall.style.setProperty('--oy', r.top + r.height * .55 - w.top + 'px');
    wall.classList.add('entering'); card.classList.remove('on');
    X.veil(() => navigate('/work/' + items[i].slug), reduce ? 0 : 1000);
  };
  drs.forEach((d, i) => {
    on(d, 'pointerdown', (e) => { touch = e.pointerType !== 'mouse'; });
    on(d, 'pointerenter', (e) => { if (e.pointerType === 'mouse') show(i); });
    on(d, 'focusin', (e) => { if (e.target.matches(':focus-visible')) show(i); }); // keyboard only, so a tap never skips the first step
    on($('.door', d), 'click', (e) => { e.preventDefault(); if (touch) { if (lit !== i) show(i); else enter(i); } else enter(i); });
  });
  on(row, 'pointerleave', (e) => { if (e.pointerType === 'mouse') show(-1); });
  on(document, 'pointerdown', (e) => { if (e.pointerType !== 'mouse' && !e.target.closest('.dr,.dcard')) show(-1); });
  on(window, 'resize', () => { if (lit >= 0) place(lit); });
  later(() => { wall.classList.remove('entering'); });
};

X.veil = (cb, ms) => {
  const v = document.getElementById('veil'); setTimeout(() => v.classList.add('on'), Math.max(0, ms - 380)); setTimeout(cb, ms);
};

/* =============== new home sections =============== */
X.mid = (C) => {
  const { esc } = PW(); const m = C.marquee.items, s = C.stats, p = C.process, r = C.reviews, y = C.why, sc = C.showcase, k = C.packages, tk = C.toolkit;
  const track = (cls) => `<div class="mqt ${cls}"><div>${[...m, ...m].map((x) => `<span>${esc(x)}</span><i>✦</i>`).join('')}</div></div>`;
  return `<section class="mq" id="marquee" aria-hidden="true">${track('')}${track('r')}</section>
<section class="why" id="why"><h2 class="sh rv">${esc(y.title)}</h2><p class="ss rv">${esc(y.subtitle)}</p>
 <div class="wgrid">${y.items.map((x, i) => `<article class="wy rv" style="--d:${(i % 3) * .1}s"><span class="wyn">0${i + 1}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}</div></section>
<section class="show" id="showcase"><div class="ph rv"><span>${esc(sc.heading)}</span></div>
 <div class="shwrap rv"><canvas id="shc" aria-hidden="true"></canvas></div>
 <div class="shcap"><button class="ar" id="shp" type="button" aria-label="${esc(PW().C.ui.prevLabel)}">‹</button><div><b id="sht"></b><span id="shs"></span><em id="shn"></em><a class="shgo" id="shg" href="#">${esc(sc.enter)}</a></div><button class="ar" id="shnx" type="button" aria-label="${esc(PW().C.ui.nextLabel)}">›</button></div>
 <p class="shhint">${esc(sc.hint)}</p>
 <ul class="srtext">${C.doors.items.map((x) => `<li><a data-link href="/work/${esc(x.slug)}">${esc(x.name)} — ${esc(x.plate)}</a></li>`).join('')}</ul></section>
<section class="stats" id="stats"><div class="sgrid">${s.items.map((x, i) => `<div class="stat rv" style="--d:${i * .1}s"><b data-count="${esc(x.value)}">${esc(x.value)}</b><small>${esc(x.label)}</small></div>`).join('')}</div></section>
<section class="proc" id="process"><h2 class="sh rv">${esc(p.title)}</h2><p class="ss rv">${esc(p.subtitle)}</p>
 <ol class="pgrid">${p.steps.map((x, i) => `<li class="pstep rv" style="--d:${i * .12}s"><span class="pn">0${i + 1}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></li>`).join('')}</ol></section>
<section class="pack" id="packages"><h2 class="sh rv">${esc(k.title)}</h2><p class="ss rv">${esc(k.subtitle)}</p>
 <div class="kgrid">${k.items.map((x, i) => `<article class="kc rv ${x.featured === 'yes' ? 'ft' : ''}" style="--d:${i * .12}s"><small>${esc(x.tag)}</small><h3>${esc(x.name)}</h3><b class="kp">${esc(x.price)}</b><p>${esc(x.text)}</p>
  <ul>${(x.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul><a class="btn ${x.featured === 'yes' ? 'w' : 'o dk'}" href="#" data-open-contact>${esc(x.cta)}</a></article>`).join('')}</div></section>
${r.items.length ? `<section class="rev" id="reviews"><h2 class="sh rv">${esc(r.title)}</h2><p class="ss rv">${esc(r.subtitle)}</p>
 <div class="rgrid">${r.items.map((x, i) => `<figure class="rc rv" style="--d:${i * .12}s"><span class="qm">“</span><blockquote>${esc(x.quote)}</blockquote><figcaption><b>${esc(x.name)}</b><small>${esc(x.role)}</small></figcaption></figure>`).join('')}</div></section>` : ''}
<section class="tool" id="toolkit"><h2 class="sh rv">${esc(tk.title)}</h2><p class="ss rv">${esc(tk.subtitle)}</p>
 <div class="tgrid">${tk.items.map((x, i) => `<span class="rv" style="--d:${(i % 5) * .06}s">${esc(x)}</span>`).join('')}</div></section>`;
};
X.late = (C) => {
  const { esc } = PW(); const f = C.faq, c = C.cta;
  return `<section class="faq" id="faq"><h2 class="sh rv">${esc(f.title)}</h2>
 <div class="acc" id="facc">${f.items.map((x, i) => `<div class="sv ${i ? '' : 'open'}"><button class="svh" aria-expanded="${i ? 'false' : 'true'}"><span>${esc(x.q)}</span><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="svb"><div class="svi"><p>${esc(x.a)}</p></div></div></div>`).join('')}</div></section>
<section class="cta" id="cta"><h2 class="rv"><span>${esc(c.title1)}</span><span>${esc(c.title2)}</span></h2><p class="rv">${esc(c.text)}</p><a class="btn w rv" href="#" data-open-contact>${esc(c.button)}</a></section>`;
};
X.initMore = () => {
  const { $$, on, C } = PW();
  const rows = $$('#facc .sv');
  rows.forEach((row) => on(row.querySelector('.svh'), 'click', () => {
    const open = !row.classList.contains('open'); rows.forEach((r) => { r.classList.remove('open'); r.querySelector('.svh').setAttribute('aria-expanded', 'false'); });
    if (open) { row.classList.add('open'); row.querySelector('.svh').setAttribute('aria-expanded', 'true'); }
  }));
  X.jsonld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'FAQPage', mainEntity: C.faq.items.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) },
  ] });
};

/* =============== global polish: reveal, progress, cursor, count-up =============== */
function countUp(el) {
  const m = String(el.dataset.count || '').match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/); if (!m || PW().reduce) return;
  const end = parseFloat(m[2]), t0 = performance.now(), dur = 1500;
  const f = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = m[1] + Math.round(end * e) + m[3]; if (k < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}
X.polish = () => {
  const { $, $$, on, later, scrollers, reduce, clamp } = PW();
  document.getElementById('veil')?.classList.remove('on');
  const els = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) els.forEach((e) => e.classList.add('in'));
  else {
    const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); $$('[data-count]', x.target).forEach(countUp); io.unobserve(x.target); } }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
    els.forEach((e) => io.observe(e)); later(() => io.disconnect());
  }
  const sp = $('#sp i');
  if (sp && $('.hero')) scrollers.push(() => { const H = document.documentElement.scrollHeight - innerHeight; sp.style.transform = `scaleX(${H > 0 ? clamp(scrollY / H) : 0})`; });
  else if (sp) sp.style.transform = 'scaleX(0)';
  const cur = $('#cur');
  if (cur && PW().C.features.customCursor !== 'no' && matchMedia('(pointer:fine)').matches && !reduce && !document.body.classList.contains('roompage')) {
    let x = -50, y = -50, tx = -50, ty = -50, raf, big = false;
    on(window, 'pointermove', (e) => { if (e.pointerType !== 'mouse') return; tx = e.clientX; ty = e.clientY; cur.style.opacity = 1; const b = !!e.target.closest('a,button,[data-go],.door,.lcard,.svh'); if (b !== big) { big = b; cur.classList.toggle('big', b); } });
    const loop = () => { x += (tx - x) * .2; y += (ty - y) * .2; cur.style.transform = `translate(${x}px,${y}px)`; raf = requestAnimationFrame(loop); }; loop();
    later(() => { cancelAnimationFrame(raf); cur.style.opacity = 0; });
  }
};

/* =============== showcase: curved / warped cards carousel (canvas) =============== */
X.initShowcase = () => {
  const { $, on, later, reduce, clamp, navigate, C } = PW();
  const cv = $('#shc'); if (!cv) return; const items = C.doors.items, n = items.length;
  if (!n) { $('#showcase').remove(); return; }
  const ctx = cv.getContext('2d'); const TW = 960, TH = 560; const tex = []; let W = 0, H = 0, pos = 0, target = 0, vis = false, drag = null, moved = 0, last = -1, raf = 0, vel = 0, hover = false;
  const hexRgb = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ''); const v = m ? parseInt(m[1], 16) : 0x3b4a63; return [v >> 16, (v >> 8) & 255, v & 255]; };
  const wrapText = (g, text, x, y, maxW, lh) => { const words = String(text).split(' '); let line = ''; const lines = []; for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; } lines.push(line); lines.forEach((l, i) => g.fillText(l, x, y + i * lh)); return lines.length; };
  const mock = (it, i) => {
    const o = document.createElement('canvas'); o.width = TW; o.height = TH; const g = o.getContext('2d'); const [r, gg, b] = hexRgb(it.color); const v = i % 3;
    if (v === 0) { g.fillStyle = '#08080a'; g.fillRect(0, 0, TW, TH); const gr = g.createRadialGradient(TW * .8, TH * .2, 10, TW * .8, TH * .2, TW * .8); gr.addColorStop(0, `rgba(${r},${gg},${b},.55)`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, TW, TH); }
    else if (v === 1) { const gr = g.createLinearGradient(0, 0, TW, TH); gr.addColorStop(0, `rgb(${Math.min(255, r + 70)},${Math.min(255, gg + 70)},${Math.min(255, b + 70)})`); gr.addColorStop(1, `rgb(${r * .55 | 0},${gg * .55 | 0},${b * .55 | 0})`); g.fillStyle = gr; g.fillRect(0, 0, TW, TH); }
    else { g.fillStyle = '#f1efe8'; g.fillRect(0, 0, TW, TH); g.fillStyle = `rgb(${r},${gg},${b})`; g.fillRect(0, TH - 18, TW, 18); }
    const dark = v !== 2; g.fillStyle = dark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.08)'; g.fillRect(0, 0, TW, 52); [0, 1, 2].forEach((k) => { g.beginPath(); g.arc(30 + k * 24, 26, 7, 0, 6.3); g.fillStyle = dark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.3)'; g.fill(); });
    g.fillStyle = dark ? '#fff' : '#0a0a0b'; g.textBaseline = 'alphabetic'; g.font = '800 84px Outfit, Arial, sans-serif'; const rows = wrapText(g, String(it.name).toUpperCase(), 60, 230, TW - 120, 88);
    g.font = '500 24px "JetBrains Mono", ui-monospace, monospace'; g.fillStyle = dark ? 'rgba(255,255,255,.75)' : 'rgba(0,0,0,.6)'; g.fillText(String(it.plate) + (it.tagline ? '  ·  ' + it.tagline : ''), 60, 230 + rows * 88 + 16);
    g.fillStyle = `rgb(${r},${gg},${b})`; g.beginPath(); g.roundRect ? g.roundRect(60, TH - 120, 230, 56, 28) : g.rect(60, TH - 120, 230, 56); g.fill(); g.fillStyle = '#fff'; g.font = '700 22px "JetBrains Mono", monospace'; g.fillText('VIEW ROOM', 98, TH - 84);
    return o;
  };
  const build = () => items.forEach((it, i) => {
    tex[i] = mock(it, i);
    if (/^\/(?:api\/image\/)?[a-z0-9-]{3,60}\.(jpg|png|webp)$/.test(it.shot || '')) { const im = new Image(); im.onload = () => { const g = tex[i].getContext('2d'); const k = Math.max(TW / im.width, TH / im.height); const w = im.width * k, h = im.height * k; g.drawImage(im, (TW - w) / 2, 0, w, h); }; im.src = it.shot; }
  });
  build(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  const size = () => { const dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); on(window, 'resize', size);
  const geo = () => { const cw = Math.min(W * .5, H * 1.6), ch = cw * .58, R = cw * 2.3; return { cw, ch, R, dth: cw * 1.04 / R, f: R * 2.7 }; };
  const norm = (d) => { d = ((d % n) + n) % n; return d > n / 2 ? d - n : d; };
  const centres = [];
  const draw = () => {
    ctx.clearRect(0, 0, W, H); const { cw, ch, R, dth, f } = geo(); const cx = W / 2, cy = H / 2, S = 42; centres.length = 0;
    const list = items.map((_, i) => ({ i, d: norm(i - pos) })).filter((c) => Math.abs(c.d) < 2.7).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    for (const { i, d } of list) {
      for (let s = 0; s < S; s++) {
        const u0 = s / S - .5, u1 = (s + 1) / S - .5, p = (u) => { const th = (d + u * .98) * dth; const z = R * (1 - Math.cos(th)), sc = f / (f + z); return { x: cx + R * Math.sin(th) * sc, sc, y: cy + (Math.sin(th * 2.3) * ch * .13 + th * ch * .16) * sc * (n < 2 ? .15 : 1), th }; };
        const A = p(u0), B = p(u1), Hs = ch * (A.sc + B.sc) / 2, Y = (A.y + B.y) / 2 - Hs / 2;
        ctx.drawImage(tex[i], s * TW / S, 0, TW / S + .5, TH, A.x, Y, B.x - A.x + 1, Hs);
        const al = clamp(Math.abs((A.th + B.th) / 2) * .5, 0, .72); if (al > .01) { ctx.fillStyle = `rgba(0,0,0,${al})`; ctx.fillRect(A.x, Y, B.x - A.x + 1, Hs); }
      }
      const mid = (() => { const th = d * dth, z = R * (1 - Math.cos(th)), sc = f / (f + z); return cx + R * Math.sin(th) * sc; })(); centres.push({ i, x: mid, w: cw * .5 });
    }
  };
  const caption = () => {
    const a = ((Math.round(pos) % n) + n) % n; if (a === last) return; last = a; const it = items[a];
    $('#sht').textContent = it.name; $('#shs').textContent = it.plate + ' — ' + it.tagline; $('#shn').textContent = `${String(a + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`; const g = $('#shg'); g.setAttribute('href', '/work/' + it.slug); g.dataset.slug = it.slug;
  };
  const loop = () => { if (!drag) { vel *= .9; pos += (target - pos) * .1; } draw(); caption(); raf = vis ? requestAnimationFrame(loop) : 0; };
  const io = new IntersectionObserver((e) => { vis = e[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(loop); }); io.observe(cv); later(() => { io.disconnect(); cancelAnimationFrame(raf); raf = 0; });
  const go = (k) => { target = Math.round(target) + k; };
  on($('#shp'), 'click', () => go(-1)); on($('#shnx'), 'click', () => go(1));
  on($('#shg'), 'click', (e) => { e.preventDefault(); enterRoom(); });
  const enterRoom = () => { const a = ((Math.round(pos) % n) + n) % n; X.veil(() => navigate('/work/' + items[a].slug), reduce ? 0 : 650); };
  on(cv, 'pointerdown', (e) => { drag = { x: e.clientX, p: pos }; moved = 0; cv.setPointerCapture?.(e.pointerId); });
  on(cv, 'pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x; moved = Math.max(moved, Math.abs(dx)); const { cw } = geo(); pos = drag.p - dx / (cw * .8); target = pos; });
  const up = (e) => {
    if (!drag) return; const was = moved; drag = null;
    if (was < 6) { const r = cv.getBoundingClientRect(), px = e.clientX - r.left; let best = null; for (const c of centres) if (Math.abs(px - c.x) < c.w && (!best || Math.abs(px - c.x) < Math.abs(px - best.x))) best = c; if (best) { const d = norm(best.i - pos); if (Math.abs(d) < .35) enterRoom(); else target = Math.round(pos + d); } }
    else target = Math.round(pos);
  };
  on(cv, 'pointerup', up); on(cv, 'pointercancel', () => { drag = null; target = Math.round(pos); });
  on(cv, 'wheel', (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); target += Math.sign(e.deltaX) * .35; target = target; clearTimeout(cv._w); cv._w = setTimeout(() => { target = Math.round(target); }, 140); } }, { passive: false });
  on(cv, 'mouseenter', () => { hover = true; }); on(cv, 'mouseleave', () => { hover = false; });
  const autoMs = Math.round((parseFloat(PW().C.features.doorsAutoSeconds) || 0) * 1000);   // 0 = off
  if (!reduce && n > 1 && autoMs >= 1000) { const iv = setInterval(() => { if (vis && !hover && !drag) go(1); }, autoMs); later(() => clearInterval(iv)); }
  if (n < 2) { ['#shp', '#shnx', '.shhint'].forEach((q) => { const e = $(q); if (e) e.style.display = 'none'; }); }
  caption(); draw();
};

/* =============== the 3D room =============== */
const shot = (it, isLaptop = false) => {
  const { esc, col, url } = PW();
  const targetUrl = it.liveLink || (Array.isArray(it.links) && it.links[0]?.url) || '';
  const domain = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : (String(it.name).toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com');
  const hasImg = IMG.test(it.shot || '');

  if (hasImg) {
    return `<div class="shot-inner"><img class="shotimg" src="${esc(it.shot)}" alt="${esc(it.name)} website screenshot" draggable="false">
      <div class="shot-bar">
        <a class="mshot-visit" href="${url(targetUrl || '#')}" ${targetUrl ? 'target="_blank" rel="noopener noreferrer"' : ''} data-visit="true"><span>VISIT SITE ↗</span></a>
        <span class="url-hint">🔒 ${esc(domain)}</span>
      </div>
      <div class="screen-glare" aria-hidden="true"></div>
    </div>`;
  }

  return `<div class="mshot" style="--c:${col(it.color)}">
    <div class="mb">
      <i class="dot red"></i><i class="dot yel"></i><i class="dot grn"></i>
      <span class="url-pill"><i class="s-lock">🔒</i> ${esc(domain)}</span>
      <span class="live-pill">● LIVE</span>
    </div>
    <div class="mh">
      <h4>${esc(it.name)}</h4>
      <p>${esc(it.tagline || (it.bullets || []).slice(0, 2).join(' · '))}</p>
      <div class="mshot-cta">
        <a class="mshot-visit ${isLaptop ? 'mini' : ''}" href="${url(targetUrl || '#')}" ${targetUrl ? 'target="_blank" rel="noopener noreferrer"' : ''} data-visit="true"><span>VISIT SITE ↗</span></a>
        <span class="mshot-badge">${esc(it.plate || 'WEBSITE')}</span>
      </div>
    </div>
    <div class="screen-glare" aria-hidden="true"></div>
  </div>`;
};

X.room = (slug) => {
  const { C, $, $$, esc, url, col, on, later, reduce, navigate, para, clamp, ease } = PW();
  const d = C.doors, it = d.items.find((x) => x.slug === slug); if (!it) return X.notFound();
  document.body.classList.add('roompage');
  X.meta(`${it.name} — ${C.meta.brand}`, String(it.description || it.tagline).split('\n')[0], '/work/' + slug);
  const targetUrl = it.liveLink || (Array.isArray(it.links) && it.links[0]?.url) || '';
  // "Visit site" buttons: the main live link + any number of extra links added in the admin panel
  const links = [...(liveOk(it.liveLink) ? [{ label: d.roomOpen, url: it.liveLink }] : []),
    ...(Array.isArray(it.links) ? it.links : []).filter((l) => l && liveOk(l.url)).map((l) => ({ label: l.label || d.roomVisit || d.roomOpen, url: l.url }))];
  const btns = (cls) => links.map((l) => `<a class="${cls}" href="${url(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join('');
  const facts = (it.facts || []).map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('');
  const fns = (it.functions || []).map((f, i) => `<button class="fn hs" type="button"><span>0${i + 1}</span><b>${esc(f.title)}</b><p>${esc(f.text)}</p></button>`).join('');
  const tech = (it.tech || []).map((t) => `<span>${esc(t)}</span>`).join('');
  $('#app').innerHTML = `<div class="room" id="room" style="--c:${col(it.color)}">
 <div class="rbar"><a class="rback" data-link href="/#doors">${esc(d.roomBack)}</a><b class="rtitle">${esc(it.name)}</b><button class="rsw" id="rsw" aria-pressed="true"><i></i>${esc(d.roomLight)}</button></div>
 <div class="rstage" id="rstage"><div class="rcube" id="rcube">
  <div class="face f-back"><i class="dimmer"></i><div class="skirt"></div><div class="sign">${esc(it.name)}</div>
   <div class="frame hs" id="shotbtn" role="button" tabindex="0" aria-label="${esc(PW().C.ui.fullScreenLabel)}">
     <div class="frame-edge"></div>
     <div class="shotbox">${shot(it, false)}</div>
   </div>
   <div class="plaque">
     <div class="plaque-tag"><b>${esc(it.plate)}</b><span>${esc(it.tagline)}</span></div>
     <div class="pbtns">
       <a class="rbtn rbtn-visit" href="${url(targetUrl || '#')}" ${targetUrl ? 'target="_blank" rel="noopener noreferrer"' : ''} data-visit="true">VISIT SITE ↗</a>
       <button class="rbtn ghost" id="fullbtn" type="button">${esc(d.roomFull)}</button>
     </div>
   </div>
   <button class="sconce hs l" type="button" aria-label="${esc(PW().C.ui.lightToggleLabel)}"><i class="s-light"></i><i class="s-beam"></i></button>
   <button class="sconce hs r" type="button" aria-label="${esc(PW().C.ui.lightToggleLabel)}"><i class="s-light"></i><i class="s-beam"></i></button>
  </div>
  <div class="face f-left"><i class="dimmer"></i><div class="skirt"></div><div class="board"><h2>${esc(d.aboutTitle)}</h2>${para(it.description)}${facts ? `<dl class="facts">${facts}</dl>` : ''}</div>
   <div class="exit"><h2>${esc(d.exitTitle)}</h2><p>${esc(d.exitText)}</p><button class="rbtn" id="exitcta" type="button">${esc(d.exitButton)}</button></div>
   <button class="xdoor hs" id="xdoor" type="button" aria-label="${esc(d.roomBack)}"><span class="arch"><span class="leaf"><b class="plate">${esc(PW().C.ui.exitPlate)}</b><i class="knob"></i></span></span></button></div>
  <div class="face f-right"><i class="dimmer"></i><div class="skirt"></div>${fns ? `<div class="peg"><h2>${esc(d.functionsTitle)}</h2><div class="fns">${fns}</div></div>` : ''}</div>
  <div class="face f-floor"><div class="rug">${tech ? `<h3>${esc(d.stackTitle)}</h3><div class="chips">${tech}</div>` : ''}</div></div>
  <div class="face f-floor3d">
    <div class="laptop">
      <div class="lb"><span class="tp"></span><span class="kbd-glow"></span></div>
      <div class="lid hs" id="lidbtn" role="button" tabindex="0" aria-label="${esc(PW().C.ui.fullScreenLabel)}">
        <i class="cam-lens"></i>
        <div class="shotbox">${shot(it, true)}</div>
        <a class="lap-visit-pill" href="${url(targetUrl || '#')}" ${targetUrl ? 'target="_blank" rel="noopener noreferrer"' : ''} data-visit="true" title="Visit ${esc(it.name)}">
          <span>VISIT SITE ↗</span>
        </a>
      </div>
    </div>
  </div>
  <div class="face f-ceil"></div><div class="face f-ceil3d"><button class="pend hs" id="pend" type="button" aria-label="${esc(PW().C.ui.lightToggleLabel)}"><i class="cord2"></i><i class="shade2"></i><i class="glow"></i></button></div>
 </div></div>
 <nav class="rhud" aria-label="${esc(PW().C.ui.lookAroundLabel)}">
   ${[['screen', d.roomScreen], ['about', d.roomAbout], ['functions', d.roomFunctions], ['stack', d.roomStack], ['exit', d.roomExit]].map(([k, t]) => `<button class="${k === 'screen' ? 'on' : ''}" data-j="${k}" type="button">${esc(t)}</button>`).join('')}
   ${targetUrl ? `<a class="rhud-visit" href="${url(targetUrl)}" target="_blank" rel="noopener noreferrer" data-visit="true">VISIT SITE ↗</a>` : ''}
 </nav>
 ${links.length ? `<div class="rvisit" id="rvisit">${btns('rbtn')}</div>` : ''}
 <p class="rhelp">${esc(d.roomHelp)}</p>
 <div class="lbx" id="lbx" hidden>
   <button class="lbc" type="button" aria-label="${esc(PW().C.ui.closeLabel)}">×</button>
   <div class="lbi">${shot(it)}</div>
   <div class="lbl">
     ${targetUrl ? `<a class="rbtn rbtn-visit" href="${url(targetUrl)}" target="_blank" rel="noopener noreferrer" data-visit="true">OPEN LIVE SITE ↗</a>` : ''}
     ${btns('rbtn')}
   </div>
 </div>
 <section class="srtext"><h1>${esc(it.name)} — ${esc(it.plate)}</h1><p>${esc(it.tagline)}</p>${para(it.description)}${(it.functions || []).length ? `<h2>${esc(d.functionsTitle)}</h2><ul>${it.functions.map((f) => `<li><b>${esc(f.title)}</b>: ${esc(f.text)}</li>`).join('')}</ul>` : ''}${(it.tech || []).length ? `<p>${esc(it.tech.join(', '))}</p>` : ''}${links.map((l) => `<a href="${url(l.url)}">${esc(l.label)}</a>`).join(' ')}</section>
</div>`;

  const room = $('#room'), stage = $('#rstage'), cube = $('#rcube'), lbx = $('#lbx');
  let yaw = -30, pitch = 2, zoom = .6, vy = 0, vp = 0, drag = false, moved = 0, tw = null, raf; const pts = new Map(); let pinch = 0, z0 = 1;
  const base = () => innerWidth * (innerWidth < innerHeight ? 1.5 : 1.12);
  const apply = () => { const p = base() * zoom; stage.style.setProperty('--p', p + 'px'); cube.style.transform = `translateZ(${p}px) rotateX(${pitch}deg) rotateY(${yaw}deg) translateZ(-1100px)`; };
  const goto = (ty, tp, tz, ms) => {
    const s = { y: yaw, p: pitch, z: zoom }; vy = vp = 0;
    if (reduce) { yaw = ty; pitch = tp; if (tz) zoom = tz; return; }
    tw = { t0: performance.now(), ms: ms || 900, s, e: { y: ty, p: tp, z: tz || zoom } };
  };
  const loop = (t) => {
    if (tw) { const k = clamp((t - tw.t0) / tw.ms), e = ease(k); yaw = tw.s.y + (tw.e.y - tw.s.y) * e; pitch = tw.s.p + (tw.e.p - tw.s.p) * e; zoom = tw.s.z + (tw.e.z - tw.s.z) * e; if (k >= 1) tw = null; }
    else if (!drag) { yaw += vy; pitch += vp; vy *= .93; vp *= .93; if (Math.abs(vy) < .005) vy = 0; if (Math.abs(vp) < .005) vp = 0; }
    pitch = clamp(pitch, -62, 50); yaw = clamp(yaw, -62, 62); apply(); raf = requestAnimationFrame(loop);
  };
  apply(); raf = requestAnimationFrame(loop); later(() => cancelAnimationFrame(raf)); goto(0, 3, innerWidth < innerHeight ? 1.5 : 1, 1700);
  const spots = { screen: [0, 2, 1], about: [-38, 2, .78], functions: [38, 2, .78], stack: [0, -34, 1], exit: [-27, 2, .9] };
  $$('.rhud button').forEach((b) => on(b, 'click', () => {
    $$('.rhud button').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    const [y, p, z] = spots[b.dataset.j];
    goto(y, p, (z || 1) * (innerWidth < innerHeight ? 1.45 : 1), 1000);
  }));
  on(window, 'resize', apply);

  on(room, 'pointerdown', (e) => {
    if (e.target.closest('.rhud,.rbar,.lbx,.rvisit,.lap-visit-pill,.mshot-visit,.rbtn-visit,.wb-visit-action,[data-visit]')) return;
    pts.set(e.pointerId, [e.clientX, e.clientY]); drag = true; moved = 0; tw = null; vy = vp = 0;
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); z0 = zoom; }
  });
  on(window, 'pointermove', (e) => {
    if (!pts.has(e.pointerId)) return; const o = pts.get(e.pointerId); const dx = e.clientX - o[0], dy = e.clientY - o[1]; pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) { const [a, b] = [...pts.values()]; zoom = clamp(z0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / (pinch || 1), .6, 2.6); moved = 99; return; }
    moved += Math.abs(dx) + Math.abs(dy); const k = .2 / Math.sqrt(zoom), s = PW().C.features.roomDrag === 'grab' ? -1 : 1;   // s=1: look (like the arrow keys), s=-1: grab the room
    yaw += s * dx * k; pitch -= s * dy * k; vy = s * dx * k; vp = -s * dy * k;
  });
  const up = (e) => { pts.delete(e.pointerId); if (!pts.size) drag = false; };
  on(window, 'pointerup', up); on(window, 'pointercancel', up);
  on(room, 'click', (e) => {
    const v = e.target.closest('[data-visit="true"]');
    if (v) {
      e.stopPropagation();
      if (!targetUrl) {
        e.preventDefault();
        alert('Website link not set yet. Configure it in Admin → Doors & rooms.');
      }
      return;
    }
    if (moved > 7) { e.stopPropagation(); e.preventDefault(); moved = 0; }
  }, true);
  on(room, 'wheel', (e) => { e.preventDefault(); zoom = clamp(zoom * (1 - e.deltaY * .001), .6, 2.6); tw = null; }, { passive: false });
  on(window, 'keydown', (e) => {
    if (e.key === 'Escape') { if (!lbx.hidden) lbx.hidden = true; return; }
    const m = { ArrowLeft: [-1.2, 0], ArrowRight: [1.2, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (m) { vy = m[0]; vp = m[1]; tw = null; }
  });

  const openBox = (e) => {
    if (e.target.closest('[data-visit="true"]')) return;
    lbx.hidden = false;
  };
  ['shotbtn', 'fullbtn', 'lidbtn'].forEach((id) => on($('#' + id), 'click', openBox));
  on($('.lbc'), 'click', () => { lbx.hidden = true; }); on(lbx, 'click', (e) => { if (e.target === lbx) lbx.hidden = true; });
  const light = () => { const dim = room.classList.toggle('dim'); $('#rsw').setAttribute('aria-pressed', String(!dim)); };
  on($('#rsw'), 'click', light); on($('#pend'), 'click', light); $$('.sconce').forEach((s) => on(s, 'click', light));
  on($('#xdoor'), 'click', () => X.veil(() => navigate('/#doors'), reduce ? 0 : 600));
  on($('#exitcta'), 'click', () => navigate('/#contact'));
  $$('.fn').forEach((f) => on(f, 'click', () => { const was = f.classList.contains('act'); $$('.fn').forEach((x) => x.classList.remove('act')); if (!was) f.classList.add('act'); }));
};
})();

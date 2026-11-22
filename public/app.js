(() => {
'use strict';
const D = window.PW_DEFAULTS;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const url = (u) => (/^(https?:|mailto:|#|\/)/i.test(String(u || '')) ? esc(u) : '#');
const col = (c) => (/^#[0-9a-f]{3,8}$/i.test(c || '') ? c : '#64748b');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const clone = (o) => JSON.parse(JSON.stringify(o));
const merge = (base, over) => {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const k in over) out[k] = k in base ? merge(base[k], over[k]) : over[k];
  return out;
};
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const copyright = (f) => String(f.copyright || f.left || '').replace('{year}', new Date().getFullYear());
const para = (s) => String(s || '').split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join('');

let C = clone(D);
const app = $('#app');
let cleanups = []; const later = (f) => cleanups.push(f);
const on = (t, e, f, o) => { t.addEventListener(e, f, o); later(() => t.removeEventListener(e, f, o)); };
let scrollers = [];

window.PW = { copyright, D, merge, clone, esc, url, col, get C() { return C; }, set C(v) { C = v; }, $, $$, isObj, later, on, go, navigate, para, clamp, lerp, ease, reduce, get ic() { return ic; }, get scrollers() { return scrollers; } };
const X = () => window.PW_X;

/* ---------- icons ---------- */
const P = {
  instagram: '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4z"/><path d="M17.5 6.5h.01"/>',
  twitter: '<path d="M4 4l16 16M20 4L4 20"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.1-1.3-.3-2.5-1-3.5.3-1.1.3-2.4 0-3.5 0 0-1 0-3 1.5-2.6-.5-5.4-.5-8 0C6 2 5 2 5 2c-.3 1.1-.3 2.4 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.4.5-.7 1.1-.9 1.7-.2.6-.2 1.2-.1 1.8v4"/><path d="M9 18c-4.5 2-5-2-7-2"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 6L2 7"/>',
  arrow: '<path d="M7 7l10 10M17 8v9H8"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L3.4 16a2 2 0 0 1 3-2.7L8 15"/>',
};
const ic = (n, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;

/* ---------- content ---------- */
async function loadContent() {
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 2500);
    const r = await fetch('/api/content', { cache: 'no-cache', signal: ctl.signal }); clearTimeout(t);
    if (r.ok) {
      const j = await r.json();
      if (isObj(j)) {
        if (j.hero?.personImage && (j.hero.personImage.endsWith('.jpg') || j.hero.personImage.includes('57f47eb3'))) {
          j.hero.personImage = '/hero-team.webp';
        }
        C = merge(clone(D), j);
      }
    }
  } catch { /* defaults are fine */ }
}

/* ---------- routing ---------- */
const ADMIN = '/control-of-the-website';
const ROUTES = {
  '/': home,
  '/privacy-policy': () => legal('privacy'),
  '/terms-and-conditions': () => legal('terms'),
  '/cookie-policy': () => legal('cookies'),
  '/refund-policy': () => legal('refund'),
  '/disclaimer': () => legal('disclaimer'),
  '/accessibility': () => legal('accessibility'),
  '/legal': () => X().legalHub(C),
  [ADMIN]: admin,
};
function route() {
  cleanups.forEach((f) => { try { f(); } catch { /* ignore */ } }); cleanups = []; scrollers = [];
  const p = location.pathname.replace(/\/+$/, '') || '/';
  document.body.className = '';
  const room = /^\/work\/([a-z0-9-]+)$/.exec(p);
  if (room) X().room(room[1]); else (ROUTES[p] || (() => X().notFound()))(p);
  X()?.polish();
}
function navigate(to) { history.pushState({}, '', to); route(); }
function go(id) {
  if (location.pathname !== '/') { history.pushState({}, '', '/'); route(); setTimeout(() => go(id), 80); return; }
  const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (a) { e.preventDefault(); const to = a.getAttribute('href'); if (to !== location.pathname) { history.pushState({}, '', to); route(); } else scrollTo(0, 0); return; }
  const g = e.target.closest('[data-go]');
  if (g) { e.preventDefault(); $('#menu')?.classList.remove('open'); go(g.dataset.go); }
});
addEventListener('popstate', route);

/* ---------- artwork ---------- */
const SIL = `<svg class="sil" viewBox="0 0 400 420" aria-hidden="true"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0a0b"/><stop offset="1" stop-color="#202023"/></linearGradient></defs>
<path d="M6 420C16 338 110 304 158 294h84c48 10 142 44 152 126z" fill="url(#sg)"/><path d="M158 294l42 60 42-60z" fill="#2c2c30"/>
<rect x="168" y="236" width="64" height="72" rx="22" fill="#0c0c0d"/><ellipse cx="200" cy="188" rx="58" ry="74" fill="#0c0c0d"/>
<g fill="#050506"><circle cx="146" cy="130" r="24"/><circle cx="172" cy="104" r="27"/><circle cx="205" cy="94" r="29"/><circle cx="238" cy="104" r="27"/><circle cx="262" cy="130" r="24"/><circle cx="141" cy="162" r="17"/><circle cx="266" cy="162" r="17"/><path d="M142 160c8-26 34-40 62-40s56 14 60 40c-14-18-34-26-60-26s-48 8-62 26z"/></g></svg>`;
const CASTLE = `<svg class="castle" viewBox="0 0 520 300" preserveAspectRatio="xMinYMax meet" aria-hidden="true"><g fill="#050506"><path d="M0 300V200l18-8v-30l10-70 10 70v30l16 6v-52l8-58 8 58v52l14-6v-26h18v-44l12-76 12 76v44h18v36l20 6v-40h14l8-30 8 30h14v40l16 10v14h50v34z"/><path d="M300 300v-60h24v-30l14-50 14 50v30h30v60zM400 300v-40h40v40z"/></g><g fill="#e9e9e9" opacity=".8"><rect x="80" y="196" width="4" height="9"/><rect x="118" y="170" width="4" height="9"/><rect x="164" y="200" width="4" height="9"/><rect x="336" y="232" width="4" height="9"/></g></svg>`;
const FIG = `<svg class="fig" viewBox="0 0 80 100" aria-hidden="true"><g fill="#fff"><circle cx="46" cy="24" r="8"/><path d="M38 36c8-4 20-2 24 6l6 22c1 4-2 7-6 6l-6-2-4 14c-1 3-4 4-7 3l-12-6c-3-2-4-5-2-8l6-10-10-8c-3-3-2-8 2-10z"/></g></svg>`;
const wob = () => { let d = ''; for (let i = 0; i <= 260; i++) { const t = i / 260 * Math.PI * 2 - Math.PI / 2; const r = 122 + 10 * Math.sin(6 * t + .7) + 5 * Math.sin(11 * t); d += `${i ? 'L' : 'M'}${(200 + r * Math.cos(t)).toFixed(1)} ${(200 + r * Math.sin(t)).toFixed(1)}`; } return d + 'Z'; };

/* ---------- hero background (editable in admin) ---------- */
const IMGRE = /^\/(?:api\/image\/)?[a-z0-9-]{3,60}\.(jpg|png|webp)$/;
const pc = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : d; };
const heroPeople = (h) => {
  const ppl = (h.people || []).filter((p) => p && p.name);
  let src = h.personImage || '/hero-team.webp';
  if (src.endsWith('.jpg') || src.includes('57f47eb3')) src = '/hero-team.webp';
  if (!ppl.length) return `<img class="sil photo" src="${esc(src)}" alt="" draggable="false">`;
  const ar = Math.max(.5, Math.min(4, parseFloat(h.personRatio) || 1.79));
  return `<div class="hpw" style="--ar:${ar}"><img class="hpimg" src="${esc(src)}" alt="${esc(C.ui.teamImageAlt)}" draggable="false">
${ppl.map((p, i) => `<button class="hpz" type="button" data-i="${i}" style="left:${pc(p.left, 0)}%;right:${100 - pc(p.right, 100)}%" aria-label="${esc(p.name)} — ${esc(p.role)}"></button>`).join('')}
${ppl.map((p, i) => `<div class="hpt" data-i="${i}" style="left:${pc(p.x, 50)}%;top:${pc(p.top, 0)}%" role="tooltip"><b>${esc(p.name)}</b><i>${esc(p.role)}</i><small>${esc(p.desc)}</small></div>`).join('')}</div>`;
};
const heroCustom = (h) => !!((h.bgColor && h.bgColor.toLowerCase() !== '#e9e8e4') || h.bgColor2 || IMGRE.test(h.bgImage || ''));
function heroStyle(h) {
  const hex = (v, d) => (/^#[0-9a-f]{3,8}$/i.test(v || '') ? v : d);
  const c1 = hex(h.bgColor, '#e9e8e4'), c2 = hex(h.bgColor2, c1);
  const img = IMGRE.test(h.bgImage || '') ? `url(${h.bgImage})` : 'none';
  const o = Math.min(80, Math.max(0, parseFloat(h.bgOverlay) || 0)) / 100;
  return `--hbg:${c1};--hbg2:${c2};--himg:${img};--ho:${o}`;
}

/* ---------- home ---------- */
function homeHTML() {
  const m = C.meta, n = C.nav, h = C.hero, a = C.about, ex = C.experience, s = C.services, c = C.contact, f = C.footer, so = C.social;
  const links = [['home', n.home], ['about', n.about], ['doors', n.doors], ['experience', n.experience], ['showcase', n.showcase], ['services', n.services]];
  const socials = [['instagram', so.instagram], ['twitter', so.twitter], ['mail', 'mailto:' + m.contactEmail], ['github', so.github]];
  const states = [{ intro: true, eyebrow: ex.eyebrow, title1: ex.title1, title2: ex.title2, text: ex.intro, ghost: ex.title1 + ' ' + ex.title2 }, ...ex.items];
  return `
<div id="ld" aria-hidden="true"><div class="box"><svg viewBox="0 0 400 400"><path id="ldp" d="${wob()}"/><circle id="ldd" r="4.5" fill="#fff"/></svg><div class="t">${esc(m.loaderText)}</div></div></div>
<header class="nav" id="nav"><a class="logo" data-go="home" href="/">${esc(m.logoText)}<i></i></a>
 <nav class="npill" aria-label="Main">${links.map(([id, t]) => `<a href="/#${id}" data-go="${id}" data-s="${id}">${esc(t)}</a>`).join('')}</nav>
 <div class="nsoc">${socials.map(([k, u]) => `<a href="${url(u)}" ${k === 'mail' ? '' : 'target="_blank" rel="noopener noreferrer"'} aria-label="${k}">${ic(k)}</a>`).join('')}</div>
 <button class="burger" id="bg" aria-label="${esc(C.ui.menuLabel)}">${ic('menu')}</button></header>
<div id="menu" class="menu"><button class="mc" id="mclose" aria-label="${esc(C.ui.closeLabel)}">${ic('close')}</button>${links.map(([id, t]) => `<a href="/#${id}" data-go="${id}">${esc(t)}</a>`).join('')}<a href="#" data-open-contact>${esc(c.contactButton)}</a></div>
<main>
<section class="hero${h.textTheme === 'light' && heroCustom(h) ? ' ht' : ''}${h.showSilhouette === 'no' ? ' nosil' : ''}${heroCustom(h) ? ' hc' : ''}" id="home" style="${heroStyle(h)}"><h1><span class="l1">${esc(h.line1)}</span><span class="l2">${esc(h.line2)}</span></h1>${IMGRE.test(h.personImage || '') ? heroPeople(h) : SIL}
 <div class="hl"><span>${esc(h.est)}</span><button class="circ" data-go="about" aria-label="${esc(C.ui.scrollLabel)}">${ic('arrow')}</button></div>
 <div class="hr"><p>${esc(h.blurb)}</p><ul class="tags" id="tags">${h.tags.map((t, i) => `<li class="${i ? '' : 'on'}">${esc(t)}</li>`).join('')}</ul></div></section>

<section class="about" id="about"><div class="st"><div class="apaint" aria-hidden="true"><i class="astars"></i><i class="aw aw1"></i><i class="aw aw2"></i><i class="aw aw3"></i><i class="aw aw4"></i><i class="amoon m1"></i><i class="amoon m2"></i><i class="amoon m3"></i></div>${CASTLE}
 <div class="acard" id="acard"><div class="scene" id="scene"><div class="beam"></div>${IMGRE.test(a.spotlightImage || '') ? `<img class="fig photo" src="${esc(a.spotlightImage)}" alt="" draggable="false">` : FIG}
  <div class="sbody"><div class="sl"><small>${esc(a.label)}</small><em>${esc(a.meta)}</em><p>${esc(a.text)}</p>
   <ul class="team">${a.team.map((t, i) => `<li>${IMGRE.test(t.photo || '') ? `<img class="tph" src="${esc(t.photo)}" alt="${esc(t.name)}">` : ''}<div class="tt"><b>0${i + 1}</b> ${esc(t.name)}<span>${esc(t.role)}</span></div></li>`).join('')}</ul></div>
   <div class="sr"><a class="btn w" href="#" data-open-contact>${esc(a.primaryButton)}</a><a class="btn o" href="#services" data-go="services">${esc(a.secondaryButton)}</a></div></div></div></div>
 <h2 class="atitle" id="atitle"><span class="at1">${esc(a.title1)}</span><span class="at2">${esc(a.title2)}</span></h2></div></section>

${X().doors(C)}
<section class="exp" id="experience"><div class="st"><div class="ghost" id="ghost">${esc(states[0].ghost)}</div>
 <div class="bars" id="bars">${ex.items.map(() => '<i><b></b></i>').join('')}</div>
 ${states.map((x, i) => `<article class="xp ${i ? '' : 'on'}" data-i="${i}"><div class="eb">${esc(x.intro ? x.eyebrow : x.chip)}</div>${x.dates ? `<div class="dt">${esc(x.dates)}</div>` : ''}
  <h2><span>${esc(x.title1)}</span><span>${esc(x.title2)}</span></h2><p class="tx">${esc(x.text)}</p>
  ${x.milestones ? `<div class="ms">${x.milestones.map((q) => `<div><small>${esc(q.label)}</small><p>${esc(q.text)}</p></div>`).join('')}</div>` : ''}</article>`).join('')}
 <div class="tabs" id="xtabs">${ex.items.map((x, i) => `<button data-t="${i}">${esc(x.tab)}</button>`).join('')}</div></div></section>

${X().mid(C)}
<section class="serv" id="services"><h2>${esc(s.title)}</h2><p class="ss">${esc(s.subtitle)}</p>
 <div class="acc" id="acc">${s.items.map((x, i) => `<div class="sv ${i ? '' : 'open'}"><button class="svh" aria-expanded="${i ? 'false' : 'true'}"><span>${esc(x.name)}</span>${ic('chev')}</button>
  <div class="svb"><div class="svi"><p>${esc(x.text)}</p><div class="dl">${esc(C.ui.deliverablesLabel)} ${esc(x.deliverables)}</div><div class="tl">${(x.tools || []).map((t) => `<span>${esc(t)}</span>`).join('')}</div></div></div></div>`).join('')}</div></section>
${X().late(C)}
</main>
<footer class="foot" id="contact"><div class="fin"><h2 class="chrome">${esc(c.title)}</h2>
 <div class="fb">${[[C.ui.instagramLabel, so.instagram], [C.ui.twitterLabel, so.twitter], [C.ui.linkedinLabel, so.linkedin], [C.ui.githubLabel, so.github]].map(([t, u]) => `<a class="pill" href="${url(u)}" target="_blank" rel="noopener noreferrer"><span data-t="${t}">${t}</span></a>`).join('')}<a class="pill solid" href="#" data-open-contact><span data-t="${esc(c.contactButton)}">${esc(c.contactButton)}</span></a></div></div>
 <div class="fgrid">
  <div class="fcol fbrand"><b class="flogo">${esc(m.logoText)}<i></i></b><p>${esc(f.tagline)}</p><a class="femail" href="mailto:${esc(m.contactEmail)}">${esc(m.contactEmail)}</a></div>
  <div class="fcol"><h4>${esc(f.exploreTitle)}</h4>${links.map(([id, t]) => `<a href="/#${id}" data-go="${id}">${esc(t)}</a>`).join('')}</div>
  <div class="fcol"><h4>${esc(f.legalTitle)}</h4>${X().legalLinks(C)}</div>
  <div class="fcol"><h4>${esc(f.contactTitle)}</h4><a href="mailto:${esc(m.contactEmail)}">${esc(m.contactEmail)}</a><a href="#" data-open-contact>${esc(f.startLabel)}</a>${[['Instagram', so.instagram], ['X / Twitter', so.twitter], ['LinkedIn', so.linkedin], ['GitHub', so.github]].map(([t, u]) => `<a href="${url(u)}" target="_blank" rel="noopener noreferrer">${t}</a>`).join('')}</div>
 </div>
 <div class="fbar"><span>${esc(copyright(f))}</span><span>${esc(f.right)}</span></div></footer>
<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="mbox"><button class="mx" id="mx" aria-label="${esc(C.ui.closeLabel)}">${ic('close')}</button>
 <h3 id="mt">${esc(c.formTitle)}</h3><p class="msub">${esc(c.formSubtitle)}</p>
 <form id="cf" novalidate><label>${esc(c.nameLabel)}<input name="name" autocomplete="name" maxlength="100" required></label>
 <label>${esc(c.emailLabel)}<input name="email" type="email" autocomplete="email" maxlength="200" required></label>
 <label>${esc(c.serviceLabel)}<select name="service"><option value="">${esc(c.servicePlaceholder)}</option>${c.services.map((x) => `<option>${esc(x)}</option>`).join('')}</select></label>
 <label>${esc(c.messageLabel)}<textarea name="message" rows="4" maxlength="4000" placeholder="${esc(c.messagePlaceholder)}" required></textarea></label>
 <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
 <button class="btn w full" type="submit">${esc(c.sendButton)}</button><p class="fs" id="fs" role="status"></p>
 <p class="fine">${esc(C.ui.privacyNote)} <a data-link href="/privacy-policy">${esc(C.ui.privacyLinkText)}</a>.</p></form></div></div>`;
}

function home() {
  X().meta(C.meta.pageTitle, C.meta.description, '/');
  app.innerHTML = homeHTML();
  const hero = $('.hero');
  const start = () => hero.classList.add('go');

  /* loader */
  const ld = $('#ld'); let seen = false; try { seen = sessionStorage.getItem('pw_seen') === '1'; } catch { /* private mode */ }
  if (seen || reduce || C.features.introAnimation === 'no') { ld.remove(); start(); }
  else {
    document.body.classList.add('lock');
    const path = $('#ldp'), dot = $('#ldd'), len = path.getTotalLength(); path.style.strokeDasharray = len;
    const t0 = performance.now(); const dur = 2300;
    const step = (t) => {
      const k = clamp((t - t0) / dur); const e = 1 - Math.pow(1 - k, 3);
      path.style.strokeDashoffset = len * (1 - e); const pt = path.getPointAtLength(len * e); dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
      if (k < 1) requestAnimationFrame(step);
      else setTimeout(() => { ld.classList.add('out'); document.body.classList.remove('lock'); start(); try { sessionStorage.setItem('pw_seen', '1'); } catch { /* ignore */ } setTimeout(() => ld.remove(), 1000); }, 350);
    };
    requestAnimationFrame(step);
    later(() => document.body.classList.remove('lock'));
  }

  /* nav */
  const nav = $('#nav'); const secs = ['home', 'about', 'doors', 'experience', 'marquee', 'why', 'showcase', 'stats', 'process', 'packages', 'reviews', 'toolkit', 'services', 'faq', 'cta', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
  const dark = new Set(['about', 'doors', 'experience', 'stats', 'reviews', 'cta', 'contact']); if (C.hero.textTheme === 'light' && heroCustom(C.hero)) dark.add('home'); // light text only makes sense on a custom (dark) hero background
  scrollers.push(() => {
    let cur = 'home';
    for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top <= 70 && r.bottom > 70) { cur = s.id; break; } }
    nav.classList.toggle('dk', dark.has(cur));
    $$('.npill a').forEach((a) => a.classList.toggle('on', a.dataset.s === cur));
  });
  on($('#bg'), 'click', () => $('#menu').classList.add('open')); on($('#mclose'), 'click', () => $('#menu').classList.remove('open'));

  /* hero tags */
  const tags = $$('#tags li'); let ti = 0;
  if (tags.length > 1 && !reduce) { const iv = setInterval(() => { ti = (ti + 1) % tags.length; tags.forEach((t, i) => t.classList.toggle('on', i === ti)); }, 2200); later(() => clearInterval(iv)); }

  initPeople(); initAbout(); X().initShowcase(); initExp(); initServices(); initContact(); X().initDoors(); X().initMore();

  let ticking = false;
  const tick = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; scrollers.forEach((f) => f()); }); };
  on(window, 'scroll', tick, { passive: true }); on(window, 'resize', tick); tick();
  if (location.hash) setTimeout(() => go(location.hash.slice(1)), 120);
}

/* ---------- hero: hover (or tap) a person to see a Minecraft-style name tag ---------- */
function initPeople() {
  const zs = $$('.hpz'), ts = $$('.hpt'); if (!zs.length) return;
  const fit = (t) => { t.style.setProperty('--dx', '0px'); const r = t.getBoundingClientRect(), m = 10; let dx = 0; if (r.left < m) dx = m - r.left; else if (r.right > innerWidth - m) dx = innerWidth - m - r.right; t.style.setProperty('--dx', dx + 'px'); };
  const show = (i) => { ts.forEach((t) => { const on2 = +t.dataset.i === i; t.classList.toggle('on', on2); if (on2) fit(t); }); zs.forEach((z) => z.classList.toggle('on', +z.dataset.i === i)); };
  zs.forEach((z) => {
    const i = +z.dataset.i; let touch = false;
    on(z, 'pointerdown', (e) => { touch = e.pointerType !== 'mouse'; });
    on(z, 'pointerenter', (e) => { if (e.pointerType === 'mouse') show(i); });
    on(z, 'pointerleave', (e) => { if (e.pointerType === 'mouse') show(-1); });
    on(z, 'focus', (e) => { if (e.target.matches(':focus-visible')) show(i); }); on(z, 'blur', () => show(-1)); // keyboard only
    on(z, 'click', () => { if (touch) show(ts.find((t) => +t.dataset.i === i)?.classList.contains('on') ? -1 : i); });
  });
  on(document, 'pointerdown', (e) => { if (e.pointerType !== 'mouse' && !e.target.closest('.hpz')) show(-1); });
}

/* ---------- about: card grows into the spotlight scene ---------- */
function initAbout() {
  const sec = $('#about'), card = $('#acard'), at = $('#atitle'), scene = $('#scene'), t1 = $('.at1', at), t2 = $('.at2', at);
  let tp = 0, cur = 0, raf = 0, w0 = 300, h0 = 260;
  // starting card = the measured "ABOUT US" block + breathing room, so the box always wraps the text
  const measure = () => {
    const vw = innerWidth, vh = innerHeight, fs = parseFloat(getComputedStyle(t1).fontSize) || 100, sh = vw * .05;   // sh = the +5vw shift of line 2
    const half = Math.max(t1.offsetWidth / 2, sh + t2.offsetWidth / 2, t2.offsetWidth / 2 - sh);
    w0 = Math.min(2 * half + fs * .7, vw * .92);
    h0 = Math.min(2 * .97 * Math.max(t1.offsetHeight, t2.offsetHeight) + fs * .5, vh * .84);
  };
  const apply = (p) => {
    const vw = innerWidth, vh = innerHeight, e = ease(clamp(p / .5));
    // grow the card with real width/height (a stretched scale() distorted its border + rounded corners)
    card.style.width = lerp(w0, vw * .92, e).toFixed(1) + 'px';
    card.style.height = lerp(h0, vh * .84, e).toFixed(1) + 'px';
    const dx = lerp(0, vw * .24, e); const op = 1 - clamp((p - .3) / .22);
    t1.style.transform = `translate(calc(-50% - ${dx.toFixed(1)}px),-97%)`; t2.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px + 5vw),-3%)`; at.style.opacity = op;
    const s = clamp((p - .5) / .22); scene.style.opacity = s; scene.style.pointerEvents = s > .6 ? 'auto' : 'none';
  };
  const run = () => { cur += (tp - cur) * .13; if (Math.abs(tp - cur) < .0004) cur = tp; apply(cur); raf = cur !== tp ? requestAnimationFrame(run) : 0; };   // eased follow = silky motion
  scrollers.push(() => { const r = sec.getBoundingClientRect(); tp = clamp(-r.top / (r.height - innerHeight)); if (!raf) raf = requestAnimationFrame(run); });
  later(() => cancelAnimationFrame(raf)); on(window, 'resize', () => { measure(); apply(cur); }); measure(); apply(0);
  document.fonts?.ready.then(() => { measure(); apply(cur); });   // re-measure once the title font has loaded
}

/* ---------- experience: pinned panels with glitch ---------- */
function initExp() {
  const sec = $('#experience'), panels = $$('.xp', sec), ghost = $('#ghost'), bars = $$('#bars i b'), tabs = $$('#xtabs button');
  const ex = C.experience; const states = [{ ghost: ex.title1 + ' ' + ex.title2 }, ...ex.items]; let cur = 0;
  const set = (i) => {
    panels.forEach((p, k) => { p.classList.toggle('on', k === i); p.classList.remove('gl'); });
    if (i !== cur && !reduce) { const p = panels[i]; void p.offsetWidth; p.classList.add('gl'); }
    ghost.textContent = (states[i].ghost || '') + '  —  ' + (states[i].ghost || ''); tabs.forEach((t, k) => t.classList.toggle('on', k === i - 1)); cur = i;
  };
  scrollers.push(() => {
    const r = sec.getBoundingClientRect(); const p = clamp(-r.top / (r.height - innerHeight)); const n = states.length;
    const i = Math.min(n - 1, Math.floor(p * n)); if (i !== cur) set(i);
    ghost.style.setProperty('--gx', -p * 55 + 'vw'); bars.forEach((b, k) => { b.style.transform = `scaleX(${clamp(p * n - (k + 1))})`; });
  });
  tabs.forEach((t, k) => on(t, 'click', () => {
    const top = sec.getBoundingClientRect().top + scrollY; const n = states.length;
    scrollTo({ top: top + ((k + 1) / n) * (sec.offsetHeight - innerHeight) + 6, behavior: reduce ? 'auto' : 'smooth' });
  }));
}

/* ---------- services accordion ---------- */
function initServices() {
  const rows = $$('#acc .sv');
  rows.forEach((row) => on($('.svh', row), 'click', () => {
    const open = !row.classList.contains('open');
    rows.forEach((r) => { r.classList.remove('open'); $('.svh', r).setAttribute('aria-expanded', 'false'); });
    if (open) { row.classList.add('open'); $('.svh', row).setAttribute('aria-expanded', 'true'); }
  }));
}

/* ---------- contact modal (posts to the Worker, which sends via SMTP) ---------- */
function initContact() {
  const modal = $('#modal'), form = $('#cf'), fs = $('#fs'); let opened = 0, busy = false;
  const open = () => { modal.classList.add('open'); document.body.classList.add('lock'); opened = Date.now(); fs.textContent = ''; setTimeout(() => $('input[name=name]', form).focus(), 60); };
  const close = () => { modal.classList.remove('open'); document.body.classList.remove('lock'); };
  document.querySelectorAll('[data-open-contact]').forEach((b) => on(b, 'click', (e) => { e.preventDefault(); $('#menu')?.classList.remove('open'); open(); }));
  on($('#mx'), 'click', close); on(modal, 'click', (e) => { if (e.target === modal) close(); }); on(window, 'keydown', (e) => { if (e.key === 'Escape') close(); });
  on(form, 'submit', async (e) => {
    e.preventDefault(); if (busy) return;
    const f = new FormData(form); const body = { name: f.get('name'), email: f.get('email'), service: f.get('service'), message: f.get('message'), website: f.get('website'), t: opened };
    if (String(body.name).trim().length < 2 || !/^\S+@\S+\.\S+$/.test(body.email) || String(body.message).trim().length < 10) { fs.className = 'fs bad'; fs.textContent = 'Please enter your name, a valid email and a message (10+ characters).'; return; }
    busy = true; fs.className = 'fs'; fs.textContent = '…';
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json', 'x-pw': '1' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { fs.className = 'fs good'; fs.textContent = C.contact.success; form.reset(); } else { fs.className = 'fs bad'; fs.textContent = j.error || C.contact.error; }
    } catch { fs.className = 'fs bad'; fs.textContent = C.contact.error; }
    busy = false;
  });
}

/* ---------- legal pages ---------- */
function legal(key) {
  const L = C.legal[key]; const f = C.footer;
  X().meta(`${L.title} — ${C.meta.brand}`, L.intro, location.pathname); document.body.classList.add('legalpage');
  app.innerHTML = `<div class="lg"><header class="lgh"><a class="logo" data-link href="/">${esc(C.meta.logoText)}<i></i></a><a class="back" data-link href="/">${esc(C.ui.backHome)}</a></header>
  <main class="lgm"><p class="eyebrow">${esc(C.ui.legalEyebrow)}</p><h1>${esc(L.title)}</h1><p class="upd">${esc(L.updated)}</p><p class="lead">${esc(L.intro)}</p>
  ${L.sections.map((s) => `<section><h2>${esc(s.heading)}</h2>${para(s.body)}</section>`).join('')}</main>
  <footer class="lgf"><span>${esc(copyright(f))}</span><nav>${X().legalLinks(C)}</nav></footer></div>`;
  scrollTo(0, 0);
}

/* ---------- admin (private route; code loaded only here) ---------- */
function admin() {
  document.title = 'Admin'; document.body.classList.add('adminpage');
  $('meta[name="robots"]')?.setAttribute('content', 'noindex, nofollow');
  const run = () => window.PW_ADMIN.mount(app);
  if (window.PW_ADMIN) return run();
  const s = document.createElement('script'); s.src = '/admin.js'; s.onload = run; document.head.appendChild(s);
}

(async () => { await loadContent(); route(); })();
// the pixel font is only needed for the hero name tags, so load it after the page is idle
(window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(() => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'; document.head.appendChild(l); });
})();

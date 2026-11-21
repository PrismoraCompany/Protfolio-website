/* Pull-cord lamp: a real Verlet rope (gravity, damping, bending stiffness, spring-loaded pull chain).
   Pull the bead down past the "click" point -> the lamp switches and the whole site flips between light and dark. */
(() => {
'use strict';
const KEY = 'pw_theme';
const root = document.documentElement;
const meta = () => document.querySelector('meta[name="theme-color"]');
const isDark = () => root.dataset.theme === 'dark';
const apply = (t, save) => {
  root.dataset.theme = t === 'dark' ? 'dark' : 'light';
  const m = meta(); if (m) m.setAttribute('content', t === 'dark' ? '#101114' : '#e9e8e4');
  if (save) { try { localStorage.setItem(KEY, root.dataset.theme); } catch { /* private mode */ } }
};
let saved = null; try { saved = localStorage.getItem(KEY); } catch { /* ignore */ }
apply(saved === 'light' ? 'light' : 'dark', false);   // default = dark
window.PW_THEME = { get: () => root.dataset.theme, set: (t) => apply(t, true), toggle: () => apply(isDark() ? 'light' : 'dark', true) };

const cv = document.getElementById('lampc'), hit = document.getElementById('lamphit'), btn = document.getElementById('lampbtn');
if (!cv || !hit) return;
const ctx = cv.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----- geometry ----- */
const CW = 70, CH = 300, dpr = Math.min(devicePixelRatio || 1, 2);
cv.width = CW * dpr; cv.height = CH * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
const AX = CW - 26, AY = 6;          // cord anchor (small ceiling grommet)
const N = 15, SEG = 13, TOTAL = N * SEG, PLUNGE_MAX = 42, CLICK_AT = 24;
const px = new Float32Array(N + 1), py = new Float32Array(N + 1), ox = new Float32Array(N + 1), oy = new Float32Array(N + 1);
for (let i = 0; i <= N; i++) { px[i] = ox[i] = AX; py[i] = oy[i] = AY + i * SEG; }

/* ----- simulation state ----- */
let plunge = 0, dragging = false, tx = 0, ty = 0, armed = true, awake = true, calm = 0, raf = 0, last = 0, acc = 0, flick = 0, touched = false;
const G = 3300, DAMP = .9935, STEP = 1 / 120;

const wake = () => { awake = true; calm = 0; if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };
const impulse = (fx, fy) => { for (let i = 4; i <= N; i++) { const k = i / N; ox[i] -= fx * k; oy[i] -= fy * k; } wake(); };

/* ----- click sound (tiny WebAudio burst) ----- */
let ac = null;
const click = () => {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
    const len = .05, buf = ac.createBuffer(1, Math.floor(ac.sampleRate * len), ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const s = ac.createBufferSource(); s.buffer = buf; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 1.1;
    const g = ac.createGain(); g.gain.value = .2; s.connect(f); f.connect(g); g.connect(ac.destination); s.start();
  } catch { /* audio blocked */ }
};

const toggle = () => {
  root.classList.add('themeswitch'); clearTimeout(toggle.t); toggle.t = setTimeout(() => root.classList.remove('themeswitch'), 750);
  window.PW_THEME.toggle(); click(); wake();
};

/* ----- physics ----- */
const solve = () => {
  const ay = AY + plunge;
  for (let it = 0; it < 16; it++) {
    px[0] = AX; py[0] = ay;
    if (dragging) { const dx = tx - AX, dy = ty - ay, d = Math.hypot(dx, dy) || 1, mx = TOTAL + 2, k = d > mx ? mx / d : 1; px[N] = AX + dx * k; py[N] = ay + dy * k; }
    for (let i = 0; i < N; i++) {
      const dx = px[i + 1] - px[i], dy = py[i + 1] - py[i], d = Math.hypot(dx, dy) || 1e-4, diff = (d - SEG) / d;
      const wA = i === 0 ? 0 : .5, wB = (dragging && i + 1 === N) ? 0 : (i === 0 ? 1 : .5), sum = wA + wB || 1;
      px[i] += dx * diff * (wA / sum); py[i] += dy * diff * (wA / sum); px[i + 1] -= dx * diff * (wB / sum); py[i + 1] -= dy * diff * (wB / sum);
    }
    for (let i = 0; i < N - 1; i++) { // bending stiffness: neighbours resist folding
      const dx = px[i + 2] - px[i], dy = py[i + 2] - py[i], d = Math.hypot(dx, dy) || 1e-4, min = SEG * 1.94;
      if (d < min) { const f = (min - d) / d * .035; px[i] -= dx * f; py[i] -= dy * f; px[i + 2] += dx * f; py[i + 2] += dy * f; }
    }
  }
};
const step = () => {
  const dt2 = STEP * STEP * G;
  for (let i = 1; i <= N; i++) { if (dragging && i === N) continue; const vx = (px[i] - ox[i]) * DAMP, vy = (py[i] - oy[i]) * DAMP; ox[i] = px[i]; oy[i] = py[i]; px[i] += vx; py[i] += vy + dt2; }
  if (dragging) { // spring-loaded pull chain: the cord can be drawn out a little
    ox[N] = px[N]; oy[N] = py[N];
    const d = Math.hypot(tx - AX, ty - AY); const want = Math.max(0, Math.min(PLUNGE_MAX, d - TOTAL)); plunge += (want - plunge) * .45;
    if (armed && plunge >= CLICK_AT) { armed = false; toggle(); } if (plunge < 8) armed = true;
  } else plunge *= .72;
  solve();
};

/* ----- drawing ----- */
const drawLamp = () => {
  ctx.clearRect(0, 0, CW, CH);
  // tiny brass grommet where the cord leaves the ceiling
  const gg = ctx.createLinearGradient(AX - 9, 0, AX + 9, 0); gg.addColorStop(0, '#7a5a14'); gg.addColorStop(.4, '#f3d98a'); gg.addColorStop(1, '#6a4c0e');
  ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(AX - 9, 0); ctx.lineTo(AX + 9, 0); ctx.lineTo(AX + 5, 7); ctx.lineTo(AX - 5, 7); ctx.closePath(); ctx.fill();
  // cord: soft shadow, twine, highlight
  const pts = []; for (let i = 0; i <= N; i++) pts.push([px[i], py[i]]);
  const path = (dx, dy) => { ctx.beginPath(); ctx.moveTo(pts[0][0] + dx, pts[0][1] + dy); for (let i = 1; i < N; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2 + dx, my = (pts[i][1] + pts[i + 1][1]) / 2 + dy; ctx.quadraticCurveTo(pts[i][0] + dx, pts[i][1] + dy, mx, my); } ctx.lineTo(pts[N][0] + dx, pts[N][1] + dy); };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  path(2.5, 2); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2.6; ctx.stroke();
  path(0, 0); ctx.strokeStyle = '#d3c7a3'; ctx.lineWidth = 2.7; ctx.stroke();
  path(0, 0); ctx.setLineDash([1.6, 2.2]); ctx.strokeStyle = 'rgba(112,96,62,.75)'; ctx.lineWidth = 2.7; ctx.stroke(); ctx.setLineDash([]);
  path(-.5, -.4); ctx.strokeStyle = 'rgba(255,252,236,.45)'; ctx.lineWidth = .8; ctx.stroke();
  // tassel + bead
  const ex = px[N], ey = py[N], ang = Math.atan2(py[N] - py[N - 1], px[N] - px[N - 1]);
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(ang - Math.PI / 2);
  ctx.strokeStyle = '#cdbf98'; ctx.lineWidth = 1.2; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * .9, 9); ctx.lineTo(k * 2.2, 28 + Math.abs(k) * -1.5); ctx.stroke(); }
  const bgd = ctx.createRadialGradient(-2.5, 4, 1, 0, 6, 9); bgd.addColorStop(0, '#fff3b8'); bgd.addColorStop(.55, '#d4a431'); bgd.addColorStop(1, '#7b560d');
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.arc(1.6, 7.6, 8.4, 0, 6.3); ctx.fill();
  ctx.fillStyle = bgd; ctx.beginPath(); ctx.arc(0, 6, 8.2, 0, 6.3); ctx.fill(); ctx.fillStyle = '#8a6514'; ctx.fillRect(-2.6, -3.5, 5.2, 4.5);
  ctx.restore();
  hit.style.transform = `translate(${ex - 26}px,${ey - 20}px)`;
};

const loop = (now) => {
  raf = 0; if (document.hidden) { return; }
  acc += Math.min(.05, (now - last) / 1000); last = now;
  while (acc >= STEP) { step(); acc -= STEP; }
  drawLamp();
  let e = 0; for (let i = 1; i <= N; i++) e += Math.abs(px[i] - ox[i]) + Math.abs(py[i] - oy[i]);
  if (!dragging && e < .02 && plunge < .05) { if (++calm > 40) { awake = false; return; } } else calm = 0;
  raf = requestAnimationFrame(loop);
};

/* ----- input ----- */
const local = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
let downAt = null, moved = 0;
hit.addEventListener('pointerdown', (e) => { e.preventDefault(); hit.setPointerCapture(e.pointerId); dragging = true; moved = 0; touched = true; const [x, y] = local(e); tx = x; ty = y - 6; downAt = [x, y]; wake(); });
hit.addEventListener('pointermove', (e) => { if (!dragging) return; const [x, y] = local(e); tx = x; ty = y - 6; moved = Math.max(moved, Math.hypot(x - downAt[0], y - downAt[1])); wake(); });
const release = () => {
  if (!dragging) return; dragging = false;
  if (moved < 6 && armed) { impulse(0, 1.8); toggle(); }            // a quick tap = a quick tug
  armed = true; wake();
};
hit.addEventListener('pointerup', release); hit.addEventListener('pointercancel', release);
if (btn) btn.addEventListener('click', () => { impulse(0, 1.8); toggle(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });

/* gentle first swing so people notice the cord */
setTimeout(() => { if (!touched && !reduce) impulse(1.6, 0.3); }, 1800);
drawLamp(); wake();
})();

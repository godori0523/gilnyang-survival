/* 길냥이 서바이벌 — the hideout room: furniture, where each cat sits, and the adoption portrait.
   Everything is drawn in a fixed 500 x 210 space that the caller scales to the canvas. */
(() => {
'use strict';
const GN = window.GN, TAU = Math.PI * 2, sin = Math.sin, cos = Math.cos;
const VW = 500, VH = 210, FLOOR = 128, INK = '#3b3442';

function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function fillInk(c, fill, lw = 1.3) { c.fillStyle = fill; c.fill(); c.lineWidth = lw; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); }
function poly(c, fill, ...p) { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); fillInk(c, fill); }
function oval(c, x, y, rx, ry, fill) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); fillInk(c, fill); }
function seg(c, col, w, ...p) { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.stroke(); }

/* ───────── room shell ───────── */
function shell(c, t) {
  c.fillStyle = '#f7e8d4'; c.fillRect(0, 0, VW, FLOOR);
  c.fillStyle = '#f2dfc6'; for (let x = 6; x < VW; x += 30) c.fillRect(x, 0, 12, FLOOR);
  c.fillStyle = '#d9a66b'; c.fillRect(0, FLOOR, VW, VH - FLOOR);
  c.strokeStyle = '#c48d55'; c.lineWidth = 1.2; c.beginPath();
  for (let y = FLOOR + 18, k = 0; y < VH; y += 18, k++) { c.moveTo(0, y); c.lineTo(VW, y); for (let x = (k % 2) * 60 + 30; x < VW; x += 120) { c.moveTo(x, y - 18); c.lineTo(x, y); } }
  c.stroke();
  c.fillStyle = '#fff6ea'; c.fillRect(0, FLOOR - 7, VW, 8); seg(c, INK, 1.3, 0, FLOOR + 1, VW, FLOOR + 1);
  // window with a slow cloud
  rr(c, 56, 16, 112, 74, 4); fillInk(c, '#fffaf2');
  c.save(); rr(c, 63, 23, 98, 60, 2); c.fillStyle = '#bfe3ff'; c.fill(); c.clip();
  const cx = 60 + ((t * 6) % 150);
  c.fillStyle = '#ffffff'; for (const [dx, dy, r] of [[0, 52, 10], [12, 46, 13], [26, 52, 10]]) { c.beginPath(); c.arc(cx + dx, dy, r, 0, TAU); c.fill(); }
  c.fillStyle = '#9fd18a'; c.beginPath(); c.ellipse(112, 86, 70, 14, 0, 0, TAU); c.fill();
  c.restore(); rr(c, 63, 23, 98, 60, 2); c.lineWidth = 1.3; c.strokeStyle = INK; c.stroke();
  seg(c, '#fffaf2', 3, 112, 23, 112, 83); seg(c, INK, 1, 110.5, 23, 110.5, 83); seg(c, INK, 1, 113.5, 23, 113.5, 83);
  rr(c, 50, 88, 124, 8, 2); fillInk(c, '#fff6ea');
  // rug
  c.beginPath(); c.ellipse(250, 176, 128, 24, 0, 0, TAU); fillInk(c, '#ffd0a8');
  c.beginPath(); c.ellipse(250, 176, 108, 17, 0, 0, TAU); c.strokeStyle = '#f2a882'; c.lineWidth = 2; c.stroke();
}

/* ───────── furniture: each draws itself at its fixed place ───────── */
const FURN_DRAW = {
  plant(c, t) {
    rr(c, 138, 74, 24, 16, 3); fillInk(c, '#e08a5a');
    for (let i = 0; i < 7; i++) { const x = 141 + i * 3, sw = sin(t * 1.4 + i) * 1.6; seg(c, i % 2 ? '#6fbf5f' : '#8fe08a', 2.2, x, 74, x - 3 + sw + (i - 3) * 1.4, 56 + (i % 3) * 3); }
  },
  tower(c) {
    rr(c, 404, 186, 82, 12, 4); fillInk(c, '#c9b49a');
    rr(c, 438, 50, 12, 138, 3); fillInk(c, '#e8d4b4');
    c.strokeStyle = '#c9a97e'; c.lineWidth = 1; c.beginPath(); for (let y = 56; y < 186; y += 6) { c.moveTo(438.5, y); c.lineTo(449.5, y + 3); } c.stroke();
    rr(c, 412, 96, 66, 9, 4); fillInk(c, '#c9b49a'); rr(c, 418, 48, 54, 9, 4); fillInk(c, '#c9b49a');
    seg(c, INK, 1, 470, 57, 470, 74); oval(c, 470, 77, 4, 4, '#ff8a7a');
  },
  house(c) {
    poly(c, '#d9a66b', 300, 150, 364, 150, 364, 196, 300, 196); poly(c, '#c58f52', 294, 152, 332, 124, 370, 152);
    c.beginPath(); c.arc(332, 176, 12, Math.PI, 0); c.lineTo(344, 196); c.lineTo(320, 196); c.closePath(); fillInk(c, '#5a4636');
    seg(c, '#b77d45', 1, 306, 160, 324, 160); seg(c, '#b77d45', 1, 342, 166, 358, 166);
  },
  scratcher(c) {
    poly(c, '#d9a66b', 78, 196, 146, 196, 136, 172, 88, 172);
    c.strokeStyle = '#b77d45'; c.lineWidth = 1; c.beginPath(); for (let x = 92; x < 140; x += 5) { c.moveTo(x, 174); c.lineTo(x - 4 + (x - 112) * 0.2, 194); } c.stroke();
  },
  toy(c, t) {
    rr(c, 20, 176, 26, 22, 4); fillInk(c, '#7cc4ff');
    seg(c, INK, 3.4, 30, 178, 56, 104); seg(c, '#ffd84d', 2, 30, 178, 56, 104);
    const sx = 66 + sin(t * 2.2) * 8, sy = 148;
    seg(c, INK, 0.8, 56, 104, sx, sy); c.save(); c.translate(sx, sy); c.rotate(sin(t * 2.2) * 0.4);
    c.beginPath(); c.ellipse(0, 6, 4, 9, 0, 0, TAU); fillInk(c, '#ff8fb1'); seg(c, INK, 0.8, 0, -2, 0, 14); c.restore();
  },
  cushion(c) { c.beginPath(); c.ellipse(250, 178, 40, 12, 0, 0, TAU); fillInk(c, '#b79cff'); c.beginPath(); c.ellipse(250, 175, 30, 7, 0, 0, TAU); c.fillStyle = '#cbb8ff'; c.fill(); },
  bowl(c) {
    c.beginPath(); c.moveTo(366, 186); c.bezierCurveTo(368, 200, 396, 200, 398, 186); c.closePath(); fillInk(c, '#7cc4ff');
    c.beginPath(); c.ellipse(382, 186, 16, 4.5, 0, 0, TAU); fillInk(c, '#c98a55');
    c.fillStyle = '#a8743f'; for (const [x, y] of [[376, 185], [382, 187], [388, 185], [379, 184]]) { c.beginPath(); c.arc(x, y, 1.4, 0, TAU); c.fill(); }
  },
};
const BACK_TO_FRONT = ['plant', 'tower', 'house', 'scratcher', 'toy', 'cushion', 'bowl'];

/* ───────── the yard: second space for the hideout ───────── */
function yardShell(c, t) {
  const g = c.createLinearGradient(0, 0, 0, 96); g.addColorStop(0, '#bfe3ff'); g.addColorStop(1, '#e6f4ff'); c.fillStyle = g; c.fillRect(0, 0, VW, 96);
  const cx = 40 + ((t * 5) % 520) - 40; c.fillStyle = '#ffffff'; for (const [dx, dy, r] of [[0, 30, 11], [14, 24, 14], [30, 30, 11]]) { c.beginPath(); c.arc(cx + dx, dy, r, 0, TAU); c.fill(); }
  c.fillStyle = '#ffe58a'; c.beginPath(); c.arc(452, 30, 14, 0, TAU); c.fill();
  // fence
  for (let x = 6; x < VW; x += 26) { rr(c, x, 58, 18, 48, 5); fillInk(c, '#fff6ea', 1.1); }
  rr(c, 0, 72, VW, 7, 2); fillInk(c, '#fff6ea', 1.1); rr(c, 0, 92, VW, 7, 2); fillInk(c, '#fff6ea', 1.1);
  // lawn and path
  c.fillStyle = '#9fd88a'; c.fillRect(0, 104, VW, VH - 104); seg(c, INK, 1.3, 0, 104, VW, 104);
  c.fillStyle = '#8cc977'; for (let i = 0; i < 26; i++) { const x = (i * 97) % VW, y = 116 + (i * 53) % 90; c.beginPath(); c.ellipse(x, y, 14, 5, 0, 0, TAU); c.fill(); }
  c.fillStyle = '#e8d6ae'; c.beginPath(); c.ellipse(250, 186, 70, 14, 0, 0, TAU); c.fill(); c.fillStyle = '#d9c497'; for (const [x, y] of [[214, 184], [244, 190], [276, 182], [300, 189]]) { c.beginPath(); c.ellipse(x, y, 9, 4, 0, 0, TAU); c.fill(); }
}
const YARD_DRAW = {
  hammock(c, t) {
    rr(c, 22, 60, 12, 128, 3); fillInk(c, '#8a5a36'); rr(c, 160, 60, 12, 128, 3); fillInk(c, '#8a5a36');
    c.beginPath(); c.ellipse(28, 54, 30, 22, 0, 0, TAU); fillInk(c, '#7fc96a'); c.beginPath(); c.ellipse(166, 54, 30, 22, 0, 0, TAU); fillInk(c, '#7fc96a');
    const sw = sin(t * 1.2) * 3; c.beginPath(); c.moveTo(34, 104); c.quadraticCurveTo(97, 150 + sw, 160, 104); c.quadraticCurveTo(97, 132 + sw, 34, 104); fillInk(c, '#ff9f43');
  },
  cabin(c) {
    poly(c, '#8a5a36', 328, 128, 372, 96, 416, 128); rr(c, 334, 126, 76, 60, 2); fillInk(c, '#c98f5a');
    c.strokeStyle = '#a8743f'; c.lineWidth = 1; c.beginPath(); for (let y = 138; y < 186; y += 12) { c.moveTo(334, y); c.lineTo(410, y); } c.stroke();
    c.beginPath(); c.arc(372, 170, 13, Math.PI, 0); c.lineTo(385, 186); c.lineTo(359, 186); c.closePath(); fillInk(c, '#5a4636');
  },
  fountain(c, t) {
    c.beginPath(); c.ellipse(250, 150, 40, 12, 0, 0, TAU); fillInk(c, '#cfd6e6'); c.beginPath(); c.ellipse(250, 148, 32, 8, 0, 0, TAU); c.fillStyle = '#9fd8ff'; c.fill();
    rr(c, 246, 116, 8, 32, 2); fillInk(c, '#cfd6e6');
    c.strokeStyle = '#7cc4ff'; c.lineWidth = 2; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(250, 116); c.quadraticCurveTo(250 + k * 18, 96 + sin(t * 4) * 2, 250 + k * 26, 146); c.stroke(); }
  },
  feeder(c) { rr(c, 440, 140, 24, 30, 4); fillInk(c, '#cfeaff'); c.beginPath(); c.arc(452, 152, 7, 0, TAU); c.fillStyle = '#d19a5b'; c.fill(); rr(c, 432, 168, 40, 14, 4); fillInk(c, '#7cc4ff'); },
  tunnel(c) { c.beginPath(); c.ellipse(120, 186, 46, 16, 0, 0, TAU); fillInk(c, '#b79cff'); c.beginPath(); c.ellipse(80, 186, 9, 14, 0, 0, TAU); fillInk(c, '#5a4a7a'); c.strokeStyle = '#9a80e0'; c.lineWidth = 1.2; for (const x of [100, 120, 140]) { c.beginPath(); c.ellipse(x, 186, 3, 15, 0, -1.5, 1.5); c.stroke(); } },
  flowerbed(c, t) {
    rr(c, 190, 112, 120, 18, 4); fillInk(c, '#a8743f');
    for (let i = 0; i < 9; i++) { const x = 200 + i * 13, col = ['#ff9fb0', '#ffd84d', '#ffffff'][i % 3], sw = sin(t * 2 + i) * 1.4; seg(c, '#5fa851', 1.6, x, 114, x + sw, 100); for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(x + sw + cos(k * 1.257) * 3, 98 + sin(k * 1.257) * 3, 2.4, 0, TAU); c.fillStyle = col; c.fill(); } }
  },
  parasol(c) {
    seg(c, INK, 2.6, 400, 70, 404, 150); c.beginPath(); c.moveTo(358, 78); c.quadraticCurveTo(402, 36, 446, 78); c.closePath(); fillInk(c, '#ff8a7a');
    c.save(); c.clip(); c.fillStyle = '#ffffff'; c.fillRect(384, 30, 10, 50); c.fillRect(410, 30, 10, 50); c.restore();
    rr(c, 372, 148, 60, 10, 3); fillInk(c, '#fff6ea');
  },
};
const YARD_ORDER = ['hammock', 'cabin', 'flowerbed', 'fountain', 'parasol', 'feeder', 'tunnel'];
const SPOTS_OUT = [
  { need: 'hammock', x: 96, y: 118, sleep: true }, { need: 'cabin', x: 372, y: 200 }, { need: 'parasol', x: 400, y: 136 }, { need: 'fountain', x: 214, y: 150 },
  { need: null, x: 60, y: 160 }, { need: null, x: 150, y: 150 }, { need: null, x: 290, y: 168 }, { need: null, x: 470, y: 120 },
  { need: null, x: 196, y: 196 }, { need: null, x: 318, y: 200 }, { need: null, x: 34, y: 200 }, { need: null, x: 470, y: 200 },
  { need: null, x: 250, y: 124 }, { need: null, x: 120, y: 120 }, { need: null, x: 330, y: 140 },
];

/* ───────── where cats sit ───────── */
const SPOTS = [
  { need: 'tower', x: 445, y: 38 }, { need: 'tower', x: 445, y: 86 }, { need: 'cushion', x: 250, y: 168, sleep: true },
  { need: null, x: 86, y: 78 }, { need: 'house', x: 336, y: 194 },
  { need: null, x: 186, y: 182 }, { need: null, x: 212, y: 150 }, { need: null, x: 290, y: 194 }, { need: null, x: 394, y: 160 },
  { need: null, x: 66, y: 160 }, { need: null, x: 128, y: 200 }, { need: null, x: 232, y: 200 }, { need: null, x: 352, y: 146 },
  { need: null, x: 154, y: 148 }, { need: null, x: 476, y: 178 }, { need: null, x: 34, y: 196 }, { need: null, x: 280, y: 148 },
];
function layout(cats, furn, which) {
  const open = (which === 'out' ? SPOTS_OUT : SPOTS).filter(s => !s.need || furn[s.need]);
  return cats.map((cat, i) => ({ cat, spot: open[i % open.length], face: (cat.uid * 7) % 3 ? 1 : -1 }));
}
const pops = [];
function pop(uid) { pops.push({ uid, t: 0 }); }

function draw(c, cats, furn, t, sel, dt, which = 'in') {
  if (which === 'out') { yardShell(c, t); for (const id of YARD_ORDER) if (furn[id]) YARD_DRAW[id](c, t); }
  else { shell(c, t); for (const id of BACK_TO_FRONT) if (furn[id]) FURN_DRAW[id](c, t); }
  const L = layout(cats, furn, which).sort((a, b) => a.spot.y - b.spot.y);
  for (const { cat, spot, face } of L) {
    const seed = (cat.uid * 0.37) % 1, s = 0.95;
    c.save(); c.fillStyle = 'rgba(60,40,30,.16)'; c.beginPath(); c.ellipse(spot.x, spot.y + 11, 12, 3.6, 0, 0, TAU); c.fill(); c.restore();
    c.save(); c.translate(spot.x, spot.y); c.scale(face * s, s); GN.art.drawCat(c, GN.CATS[cat.breed].look, t + seed * 9, false); c.restore();
    if (spot.sleep) { c.font = '11px Jua, sans-serif'; c.fillStyle = '#7a6a8c'; c.textAlign = 'center'; for (let i = 0; i < 2; i++) { const q = (t * 0.5 + i * 0.5) % 1; c.globalAlpha = 1 - q; c.fillText('z', spot.x + 16 + q * 8, spot.y - 18 - q * 14); } c.globalAlpha = 1; }
    if (cat.uid === sel) {
      c.font = '13px Jua, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText(cat.name).width + 14, by = Math.max(12, spot.y - 34);
      rr(c, spot.x - w / 2, by - 9, w, 18, 8); fillInk(c, '#ffffff', 1.2); c.fillStyle = INK; c.fillText(cat.name, spot.x, by + 0.5); c.textBaseline = 'alphabetic';
    }
  }
  for (const p of pops) {
    p.t += dt || 0.016; const at = L.find(l => l.cat.uid === p.uid); if (!at) { p.t = 9; continue; }
    const q = p.t / 1.1; c.globalAlpha = Math.max(0, 1 - q); heart(c, at.spot.x + 4, at.spot.y - 30 - q * 26, 6 + q * 3); c.globalAlpha = 1;
  }
  for (let i = pops.length - 1; i >= 0; i--) if (pops[i].t > 1.1) pops.splice(i, 1);
}
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r); c.bezierCurveTo(x - r * 1.8, y - r * 0.2, x - r * 0.8, y - r * 1.6, x, y - r * 0.5); c.bezierCurveTo(x + r * 0.8, y - r * 1.6, x + r * 1.8, y - r * 0.2, x, y + r); fillInk(c, '#ff6b81', 1.1); }
function hit(cats, furn, x, y, which = 'in') {
  let best = null, bd = 26 * 26;
  for (const { cat, spot } of layout(cats, furn, which)) { const d = (spot.x + 4 - x) ** 2 + (spot.y - 4 - y) ** 2; if (d < bd) { bd = d; best = cat.uid; } }
  return best;
}

/* the adoption card: a warm doorway, the cat, and floating hearts */
function portrait(c, w, h, breed, t, done) {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, done ? '#ffe9b8' : '#f7e8d4'); g.addColorStop(1, done ? '#ffd0a8' : '#efd9bd'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  const s = h / 210;
  c.save(); c.scale(s, s); const W2 = w / s;
  rr(c, W2 / 2 - 70, 26, 140, 160, 70); fillInk(c, done ? '#fff3c4' : '#fbeedd');
  c.fillStyle = '#d9a66b'; c.fillRect(0, 186, W2, 30); seg(c, INK, 1.3, 0, 186, W2, 186);
  if (done) for (let i = 0; i < 5; i++) { const q = (t * 0.35 + i / 5) % 1; c.globalAlpha = 1 - q; heart(c, W2 / 2 - 60 + i * 30 + sin(t * 2 + i) * 6, 150 - q * 120, 6); } c.globalAlpha = 1;
  c.translate(W2 / 2 - 6, 152); c.scale(2.6, 2.6); GN.art.drawCat(c, GN.CATS[breed].look, t, false);
  c.restore();
}

GN.room = { VW, VH, draw, hit, pop, portrait };
})();

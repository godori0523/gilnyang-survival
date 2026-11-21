/* 길냥이 서바이벌 — everything that is drawn (cats, enemies, icons, ground) */
(() => {
'use strict';
const GN = window.GN, TAU = Math.PI * 2, INK = '#3b3442';
const sin = Math.sin, cos = Math.cos, abs = Math.abs;

let PEN_W = 2.5;   // default outline width; the detailed art style lowers it
function setPen(w) { PEN_W = w; }
function pen(c, w = PEN_W) { c.lineWidth = w; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round'; }
function ell(c, x, y, rx, ry, fill, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fillStyle = fill; c.fill(); c.stroke(); }
function blob(c, x, y, rx, ry, fill, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fillStyle = fill; c.fill(); }
function tri(c, x1, y1, x2, y2, x3, y3, fill) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.closePath(); c.fillStyle = fill; c.fill(); c.stroke(); }
function dot(c, x, y, r, fill) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = fill || INK; c.fill(); }
function line(c, x1, y1, x2, y2) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
function box(c, x, y, w, h, r, fill) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fillStyle = fill; c.fill(); c.stroke(); }
function inkStroke(c, color, w) { const lw = c.lineWidth, ss = c.strokeStyle; c.lineWidth = w + PEN_W * 1.6; c.strokeStyle = INK; c.stroke(); c.lineWidth = w; c.strokeStyle = color; c.stroke(); c.lineWidth = lw; c.strokeStyle = ss; }
function thin(c, color, w, fn) { const lw = c.lineWidth, ss = c.strokeStyle; c.lineWidth = w; c.strokeStyle = color; fn(); c.lineWidth = lw; c.strokeStyle = ss; }
function angry(c, x1, x2, y, s = 1) { dot(c, x1, y, 1.7 * s); dot(c, x2, y, 1.7 * s); thin(c, INK, 1.8 * s, () => { line(c, x1 - 3 * s, y - 4.5 * s, x1 + 2 * s, y - 2.5 * s); line(c, x2 + 3 * s, y - 4.5 * s, x2 - 2 * s, y - 2.5 * s); }); }
function crown(c, y) { c.beginPath(); c.moveTo(-6, y); c.lineTo(-7, y - 7); c.lineTo(-3, y - 3.5); c.lineTo(0, y - 8.5); c.lineTo(3, y - 3.5); c.lineTo(7, y - 7); c.lineTo(6, y); c.closePath(); c.fillStyle = '#ffd84d'; c.lineWidth = 1.4; c.fill(); c.stroke(); }

/* ───────── cat ───────── */
function drawCat(c, L, t, moving) {
  pen(c); const k = (L.small || 1); c.save(); c.scale(k, k);
  const bob = moving ? sin(t * 14) * 1.4 : sin(t * 3) * 0.6, fat = L.fat || 1;
  const tailCol = L.points || (L.patches ? '#4a4a5c' : L.fur), legCol = L.points || L.fur;
  c.beginPath(); c.moveTo(-12 * fat, 3); c.quadraticCurveTo(-25 * fat, 2 + sin(t * 6) * 4, -20 * fat, -13); inkStroke(c, tailCol, L.bald ? 2.5 : 4);
  const st = moving ? sin(t * 14) * 3 : 0;
  ell(c, -8 + st, 11, 3.6, 3, legCol); ell(c, 4 - st, 11, 3.6, 3, legCol);
  ell(c, -3, 3 + bob * 0.3, 12 * fat, 9 * (1 + (fat - 1) * 0.5), L.fur);
  if (L.belly) blob(c, -2, 7 + bob * 0.3, 7 * fat, 3.6, L.belly);
  if (L.patches) { blob(c, -8, 0, 5, 4, '#4a4a5c', 0.4); blob(c, 1, 7, 4, 3, '#ffb44a'); }
  if (L.stripes) thin(c, L.stripes, 2, () => { line(c, -9, -4, -8, 1); line(c, -4, -5.5, -4, 0); line(c, 1, -5, 0, 0); });
  if (L.bald) thin(c, '#d99e92', 1.3, () => { line(c, -8, 0, -5, 2); line(c, -3, -1, 0, 1); });
  const hy = bob;
  tri(c, -2, -9 + hy, 0, -20 + hy, 6, -13 + hy, L.patches ? '#4a4a5c' : L.ear);
  tri(c, 9, -13 + hy, 15, -20 + hy, 16, -9 + hy, L.ear);
  ell(c, 7, -5 + hy, 11, 10, L.fur);
  c.save(); c.beginPath(); c.ellipse(7, -5 + hy, 10, 9, 0, 0, TAU); c.clip();
  if (L.patches) { dot(c, 0, -12 + hy, 6, '#4a4a5c'); dot(c, 15, -12 + hy, 6, '#ffb44a'); }
  if (L.points) blob(c, 8.5, -2 + hy, 7, 6, L.points);
  if (L.stripes) thin(c, L.stripes, 2, () => { line(c, 5, -15 + hy, 5.5, -11 + hy); line(c, 8.5, -15.5 + hy, 8.5, -11 + hy); line(c, 12, -15 + hy, 11.5, -11 + hy); });
  c.restore();
  if (L.muzzle) blob(c, 9, -1.5 + hy, 6, 4.2, L.muzzle);
  if (L.eye) { dot(c, 4, -6.5 + hy, 2.6, L.eye); dot(c, 12.5, -6.5 + hy, 2.6, L.eye); dot(c, 4, -6.5 + hy, 1.2); dot(c, 12.5, -6.5 + hy, 1.2); }
  else { dot(c, 4, -6.5 + hy, 1.8); dot(c, 12.5, -6.5 + hy, 1.8); }
  dot(c, 0.5, -2 + hy, 2, 'rgba(255,138,122,.7)'); dot(c, 16, -2 + hy, 2, 'rgba(255,138,122,.7)');
  const dark = L.dark && !L.muzzle || L.points;
  thin(c, dark ? '#fff' : INK, 1.6, () => { c.beginPath(); c.moveTo(6, -2 + hy); c.quadraticCurveTo(7.3, -0.3 + hy, 8.5, -2 + hy); c.quadraticCurveTo(9.8, -0.3 + hy, 11, -2 + hy); c.stroke(); });
  c.restore();
}

/* ───────── enemies: (c, a) with a = animation phase 0..2π ───────── */
const ART = {
  rat(c, a) {
    c.beginPath(); c.moveTo(-9, 3); c.quadraticCurveTo(-18, -3 + sin(a) * 3, -17, 7); inkStroke(c, '#f3b6c0', 2);
    ell(c, 0, 2, 10, 7, '#cfcfdc'); ell(c, 3, -5, 3.6, 3.6, '#f3b6c0'); dot(c, 6, 0, 1.6); dot(c, 10, 2.5, 1.6, '#ff8a7a');
  },
  pigeon(c, a) {
    const hb = sin(a * 2) * 1.5;
    thin(c, '#ff9f43', 2, () => { line(c, -3, 9, -3, 13); line(c, 3, 9, 3, 13); });
    ell(c, -1, 2, 10, 8, '#b6c1e0'); ell(c, -3, 2, 6, 4, '#8f9cc4');
    tri(c, 11 + hb, -9, 17 + hb, -7, 11 + hb, -5, '#ffb347'); ell(c, 7 + hb, -7, 5.5, 5.5, '#b6c1e0'); dot(c, 8 + hb, -8, 1.5);
  },
  bag(c, a) {
    c.rotate(sin(a) * 0.25);
    c.beginPath(); c.moveTo(-8, -6); c.quadraticCurveTo(-12, 8, -6, 10); c.lineTo(6, 10); c.quadraticCurveTo(12, 8, 8, -6);
    c.lineTo(4, -6); c.lineTo(6, -13); c.lineTo(2, -13); c.lineTo(1, -6); c.lineTo(-1, -6); c.lineTo(-2, -13); c.lineTo(-6, -13); c.lineTo(-4, -6); c.closePath();
    c.fillStyle = 'rgba(255,255,255,.92)'; c.fill(); c.stroke(); angry(c, -3, 3, 2);
  },
  cuke(c, a) {
    c.translate(0, -abs(sin(a)) * 4);
    ell(c, 0, 0, 7.5, 13, '#7ccf6b'); thin(c, '#4f9e45', 1.5, () => { line(c, -3, 6, -3, 10); line(c, 3, 5, 3, 9); line(c, 0, -11, 0, -8); });
    angry(c, -2.8, 2.8, -2); thin(c, INK, 1.6, () => line(c, -2, 3, 2, 3));
  },
  crow(c, a) {
    const f = sin(a * 2);
    tri(c, -3, -1, -13, -4 - 9 * f, 3, -4, '#3b3b4a'); ell(c, 0, 1, 9, 7, '#3b3b4a');
    tri(c, 10, -7, 17, -4.5, 10, -2.5, '#ffd84d'); ell(c, 6, -5, 5.2, 5.2, '#3b3b4a'); dot(c, 7, -6, 2, '#fff'); dot(c, 7.5, -6, 1);
  },
  dog(c, a) {
    const st = sin(a * 2) * 2.5;
    tri(c, -15, 0, -22, -8 + st, -13, 5, '#c98f5a');
    ell(c, -9 + st, 14, 4, 3.5, '#c98f5a'); ell(c, 5 - st, 14, 4, 3.5, '#c98f5a');
    ell(c, -2, 4, 15, 11, '#c98f5a'); ell(c, 9, -6, 10, 9, '#c98f5a'); ell(c, 2, -7, 4, 7.5, '#8a5a36');
    ell(c, 15.5, -3, 5.2, 4.2, '#f1d3b0'); dot(c, 19, -4.5, 2); angry(c, 8, 13, -9); ell(c, 15, 2, 2, 2.8, '#ff8a7a');
  },
  roomba(c, a) {
    ell(c, 0, 0, 15, 15, '#4a4f63'); ell(c, 0, 0, 9, 9, '#6a7088');
    dot(c, cos(a) * 12, sin(a) * 12, 2.2, '#7dff9a'); c.fillStyle = '#ff6b6b'; c.fillRect(-5.5, -3, 4, 3); c.fillRect(1.5, -3, 4, 3);
  },
  raccoon(c, a) {
    const st = sin(a * 2) * 2;
    ell(c, -15, 0 + st * 0.5, 5, 9, '#9a98a6', 0.5); thin(c, '#4a4a5c', 2.5, () => { line(c, -18, -3, -12, -1); line(c, -17, 3, -12, 4); });
    ell(c, -7 + st, 13, 3.6, 3, '#4a4a5c'); ell(c, 4 - st, 13, 3.6, 3, '#4a4a5c');
    ell(c, -2, 4, 13, 10, '#9a98a6'); tri(c, 2, -11, 3, -18, 8, -13, '#9a98a6'); tri(c, 11, -13, 15, -18, 16, -10, '#9a98a6');
    ell(c, 9, -6, 9.5, 8, '#c9c7d2'); blob(c, 9.5, -6.5, 8.5, 3.2, '#4a4a5c'); dot(c, 6, -6.5, 1.6, '#fff'); dot(c, 13, -6.5, 1.6, '#fff'); dot(c, 17, -3, 1.8);
  },
  dust(c, a) {
    c.save(); c.rotate(a); c.beginPath();
    for (let i = 0; i < 16; i++) { const q = i / 16 * TAU, r = i % 2 ? 6.2 : 9.5; c.lineTo(cos(q) * r, sin(q) * r); }
    c.closePath(); c.fillStyle = '#aaa5b8'; c.fill(); c.stroke(); c.restore(); angry(c, -2.5, 2.5, 0, 0.9);
  },
  /* market */
  fly(c, a) {
    const f = 0.4 + abs(sin(a * 3)) * 0.6;
    ell(c, -4, -5, 3, 6 * f, 'rgba(255,255,255,.85)', -0.5); ell(c, 3, -5, 3, 6 * f, 'rgba(255,255,255,.85)', 0.5);
    ell(c, 0, 1, 5.5, 4.5, '#4a4a5c'); dot(c, 3, 0, 1.8, '#ff6b6b'); dot(c, 5, 2, 1.4, '#ff6b6b');
  },
  chili(c, a) {
    c.translate(0, -abs(sin(a)) * 3); c.rotate(0.25);
    c.beginPath(); c.moveTo(-5, -8); c.quadraticCurveTo(-7, 6, 2, 12); c.quadraticCurveTo(7, 4, 5, -8); c.closePath(); c.fillStyle = '#ff5a4d'; c.fill(); c.stroke();
    tri(c, -4, -8, 0, -14, 4, -8, '#6fcf6f'); angry(c, -2, 3, -2, 0.9);
  },
  chick(c, a) {
    const b = sin(a * 2);
    thin(c, '#ff9f43', 2, () => { line(c, -3, 9, -3 + b, 13); line(c, 3, 9, 3 - b, 13); });
    ell(c, 0, 1, 9.5, 9, '#ffe066'); ell(c, -4, 3, 4, 3, '#ffd23f'); tri(c, 8, -2, 14, 0, 8, 2, '#ff9f43'); dot(c, 4, -3, 1.7); tri(c, -2, -8, 0, -12, 2, -8, '#ffd23f');
  },
  crab(c, a) {
    const s = sin(a * 2) * 2;
    thin(c, INK, 2, () => { for (const k of [-1, 1]) { line(c, k * 8, 6, k * 14, 10 + s * k); line(c, k * 6, 8, k * 10, 13 - s * k); } });
    ell(c, -13, -5 + s, 4.6, 4.6, '#ff7b5a'); ell(c, 13, -5 - s, 4.6, 4.6, '#ff7b5a');
    ell(c, 0, 2, 11, 8, '#ff7b5a'); thin(c, INK, 2, () => { line(c, -3, -5, -3, -10); line(c, 3, -5, 3, -10); });
    dot(c, -3, -10.5, 2); dot(c, 3, -10.5, 2); thin(c, INK, 1.6, () => line(c, -3, 4, 3, 4));
  },
  squid(c, a) {
    const s = sin(a * 2);
    thin(c, INK, 2, () => { for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 3, 6); c.quadraticCurveTo(i * 3 + s * 2, 11, i * 4, 14 + abs(s) * 2); c.stroke(); } });
    tri(c, 0, -15, -9, 0, 9, 0, '#ffb3c7'); ell(c, 0, 3, 7.5, 6, '#ffb3c7'); angry(c, -3, 3, 3, 0.9);
  },
  tofu(c, a) {
    c.scale(1 + sin(a) * 0.05, 1 - sin(a) * 0.05);
    box(c, -11, -9, 22, 20, 4, '#fff8e6'); thin(c, '#e3d9bd', 1.5, () => line(c, -8, 7, 8, 7)); angry(c, -4, 4, 0); thin(c, INK, 1.6, () => line(c, -2, 5, 2, 5));
  },
  onion(c, a) {
    c.translate(0, -abs(sin(a)) * 2.5);
    thin(c, '#6fcf6f', 3, () => { line(c, 0, -9, -3, -16); line(c, 0, -9, 3, -15); });
    c.beginPath(); c.moveTo(0, -11); c.bezierCurveTo(-18, -4, -12, 13, 0, 13); c.bezierCurveTo(12, 13, 18, -4, 0, -11); c.fillStyle = '#d9a6e8'; c.fill(); c.stroke();
    thin(c, '#b77fcb', 1.4, () => { c.beginPath(); c.arc(0, 2, 7, 1.9, 4.2); c.stroke(); c.beginPath(); c.arc(0, 2, 7, -1.1, 1.2); c.stroke(); });
    angry(c, -3.5, 3.5, 1); dot(c, -5, 5, 1.3, '#7cc4ff');
  },
  puffer(c, a) {
    const k = 1 + sin(a) * 0.06; c.scale(k, k);
    for (let i = 0; i < 10; i++) { const q = i / 10 * TAU; tri(c, cos(q - 0.15) * 12, sin(q - 0.15) * 12, cos(q) * 18, sin(q) * 18, cos(q + 0.15) * 12, sin(q + 0.15) * 12, '#ffe9a8'); }
    ell(c, 0, 0, 13, 13, '#ffe9a8'); blob(c, 0, 5, 9, 6, '#fff'); angry(c, -4, 5, -3); ell(c, 1, 4, 2.5, 2, '#ff8a7a');
  },
  /* park */
  bee(c, a) {
    const f = 0.4 + abs(sin(a * 3)) * 0.6;
    ell(c, -2, -7, 3.5, 6 * f, 'rgba(255,255,255,.85)', -0.4); ell(c, 3, -7, 3.5, 6 * f, 'rgba(255,255,255,.85)', 0.4);
    tri(c, -8, -1, -12, 1, -8, 3, '#4a4a5c'); ell(c, 0, 1, 8, 6.5, '#ffd84d'); thin(c, INK, 2.4, () => { line(c, -3, -4.5, -3, 6.5); line(c, 1, -5, 1, 7); }); dot(c, 5, 0, 1.6);
  },
  squirrel(c, a) {
    const s = sin(a * 2);
    ell(c, -10, -5 + s, 6, 10, '#a8683a', -0.3); ell(c, -3 + s, 10, 3, 2.6, '#c9824a'); ell(c, 4 - s, 10, 3, 2.6, '#c9824a');
    ell(c, 0, 3, 8, 7.5, '#c9824a'); tri(c, 3, -9, 5, -14, 8, -9, '#c9824a'); ell(c, 6, -5, 6, 5.5, '#c9824a'); blob(c, 8, -3, 3.5, 2.6, '#f4d9a8'); dot(c, 6, -6, 1.6); dot(c, 11.5, -4, 1.3);
  },
  frog(c, a) {
    c.translate(0, -abs(sin(a)) * 5);
    ell(c, -8, 7, 4.5, 3, '#5fb357'); ell(c, 8, 7, 4.5, 3, '#5fb357'); ell(c, 0, 3, 11, 8, '#7ccf6b');
    ell(c, -5, -5, 4, 4, '#fff'); ell(c, 5, -5, 4, 4, '#fff'); dot(c, -4.5, -5, 1.8); dot(c, 5.5, -5, 1.8); thin(c, INK, 1.7, () => { c.beginPath(); c.arc(0, 2, 6, 0.3, 2.84); c.stroke(); });
  },
  mole(c, a) {
    const s = sin(a * 2) * 1.5;
    ell(c, 0, 10, 13, 4, '#6b4b3a'); ell(c, 0, 2, 10, 9.5, '#8a6a55'); ell(c, -9, 4 + s, 3.5, 2.6, '#f3b6c0'); ell(c, 9, 4 - s, 3.5, 2.6, '#f3b6c0');
    ell(c, 2, 1, 3.4, 2.8, '#f3b6c0'); thin(c, INK, 1.7, () => { line(c, -4, -3, -1, -2); line(c, 5, -2, 8, -3); });
  },
  hedgehog(c, a) {
    const s = sin(a * 2);
    c.beginPath(); for (let i = 0; i <= 9; i++) { const q = Math.PI + i / 9 * Math.PI * 1.15 - 0.3; c.lineTo(-2 + cos(q) * (i % 2 ? 9 : 14), 2 + sin(q) * (i % 2 ? 8 : 13)); }
    c.lineTo(8, 8); c.lineTo(-10, 9); c.closePath(); c.fillStyle = '#7a5a48'; c.fill(); c.stroke();
    ell(c, 5, 5, 8, 5.5, '#f1d3b0'); dot(c, 13, 4.5, 1.8); dot(c, 8, 3, 1.5); ell(c, -4 + s, 11, 2.6, 2, '#f1d3b0'); ell(c, 4 - s, 11, 2.6, 2, '#f1d3b0');
  },
  goose(c, a) {
    const s = sin(a * 2);
    thin(c, '#ff9f43', 2.4, () => { line(c, -4, 11, -4 + s * 2, 16); line(c, 3, 11, 3 - s * 2, 16); });
    ell(c, -2, 4, 12, 9, '#fff'); ell(c, -5, 4, 7, 5, '#e6e9f2');
    c.beginPath(); c.moveTo(6, 1); c.quadraticCurveTo(7, -8, 9 + s, -14); inkStroke(c, '#fff', 4.5);
    tri(c, 13 + s, -17, 20 + s, -14.5, 13 + s, -12, '#ff9f43'); ell(c, 10 + s, -15, 5, 4.5, '#fff'); angry(c, 9 + s, 12.5 + s, -15.5, 0.75);
  },
  snail(c, a) {
    const s = sin(a) * 1.5;
    ell(c, 3 + s, 9, 14, 4.5, '#f4e3c3'); thin(c, INK, 2, () => { line(c, 13 + s, 7, 15 + s, 0); line(c, 16 + s, 8, 19 + s, 2); }); dot(c, 15 + s, -0.5, 1.8); dot(c, 19 + s, 1.5, 1.8);
    ell(c, -2, -1, 10.5, 10.5, '#e0a070'); thin(c, '#a86a3c', 1.8, () => { c.beginPath(); c.arc(-2, -1, 6.5, 0.4, 5.2); c.stroke(); c.beginPath(); c.arc(-1.5, -1, 3, 1, 5.6); c.stroke(); });
  },
  mantis(c, a) {
    const s = sin(a * 2);
    thin(c, INK, 2, () => { line(c, -3, 6, -8, 13 + s); line(c, 1, 7, 2, 14 - s); });
    ell(c, -3, 2, 5, 11, '#8fe08a', 0.5); c.beginPath(); c.moveTo(2, -4); c.lineTo(9, -9 + s * 2); c.lineTo(14, -2 + s * 2); inkStroke(c, '#6fcf6f', 2.5);
    tri(c, 0, -9, 8, -13, 5, -4, '#8fe08a'); dot(c, 2, -10, 2); dot(c, 7, -11, 2);
  },
  /* roof */
  moth(c, a) {
    const f = 0.35 + abs(sin(a * 2)) * 0.65;
    ell(c, -7 * f, -2, 7 * f, 8, '#e9dcc6'); ell(c, 7 * f, -2, 7 * f, 8, '#e9dcc6'); dot(c, -6 * f, -2, 2, '#b9a48c'); dot(c, 6 * f, -2, 2, '#b9a48c');
    ell(c, 0, 0, 3.5, 7.5, '#b9a48c'); thin(c, INK, 1.5, () => { line(c, -1, -7, -4, -12); line(c, 1, -7, 4, -12); });
  },
  bat(c, a) {
    const f = sin(a * 2);
    tri(c, -5, 0, -18, -7 * f - 2, -11, 6, '#6a5a8c'); tri(c, 5, 0, 18, -7 * f - 2, 11, 6, '#6a5a8c');
    tri(c, -5, -5, -4, -11, -1, -6, '#6a5a8c'); tri(c, 5, -5, 4, -11, 1, -6, '#6a5a8c');
    ell(c, 0, 0, 6.5, 6.5, '#6a5a8c'); dot(c, -2.5, -1, 1.5, '#fff'); dot(c, 2.5, -1, 1.5, '#fff'); tri(c, -1.5, 3, -0.5, 6, 0.5, 3, '#fff');
  },
  spider(c, a) {
    const s = sin(a * 2) * 2;
    thin(c, INK, 2, () => { for (const k of [-1, 1]) for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(k * 5, i * 2 - 1); c.lineTo(k * 12, i * 4 - 8 + (i % 2 ? s : -s)); c.lineTo(k * 15, i * 5 - 3 + (i % 2 ? s : -s)); c.stroke(); } });
    ell(c, 0, 3, 8, 7.5, '#4a4a5c'); ell(c, 0, -6, 5, 4.2, '#4a4a5c'); dot(c, -2, -6.5, 1.5, '#ff6b6b'); dot(c, 2, -6.5, 1.5, '#ff6b6b');
  },
  drone(c, a) {
    c.translate(0, sin(a) * 1.5); const f = abs(sin(a * 3));
    thin(c, INK, 2.2, () => { line(c, -6, -2, -12, -7); line(c, 6, -2, 12, -7); });
    ell(c, -12, -8, 3 + 5 * f, 1.8, 'rgba(255,255,255,.8)'); ell(c, 12, -8, 3 + 5 * (1 - f), 1.8, 'rgba(255,255,255,.8)');
    box(c, -9, -4, 18, 10, 4, '#cfd6e6'); ell(c, 0, 2, 3.5, 3.5, '#4a4f63'); dot(c, 0, 2, 1.6, '#ff6b6b');
  },
  weasel(c, a) {
    const s = sin(a * 2) * 2.5;
    c.beginPath(); c.moveTo(-14, 4); c.quadraticCurveTo(-22, 2 + s, -22, -5); inkStroke(c, '#b9844f', 3.5);
    ell(c, -9 + s, 10, 3, 2.5, '#b9844f'); ell(c, 6 - s, 10, 3, 2.5, '#b9844f');
    ell(c, -2, 4, 14, 6, '#d9a66b'); blob(c, -1, 7, 10, 2.4, '#fff3dc'); tri(c, 8, -5, 9, -9, 12, -5, '#d9a66b'); ell(c, 12, -1, 6, 5, '#d9a66b'); dot(c, 13, -2, 1.5); dot(c, 17.5, 0, 1.4);
  },
  owl(c, a) {
    const s = sin(a * 2);
    ell(c, -10, 3, 4, 9 + s, '#7a5f44', 0.3); ell(c, 10, 3, 4, 9 + s, '#7a5f44', -0.3);
    tri(c, -8, -9, -7, -16, -2, -11, '#9a7b5a'); tri(c, 8, -9, 7, -16, 2, -11, '#9a7b5a');
    ell(c, 0, 2, 11, 13, '#9a7b5a'); blob(c, 0, 7, 7, 7, '#e8d3b0');
    ell(c, -4.5, -4, 4.6, 4.6, '#ffd84d'); ell(c, 4.5, -4, 4.6, 4.6, '#ffd84d'); dot(c, -4.5, -4, 2); dot(c, 4.5, -4, 2); tri(c, -1.8, 0, 0, 4, 1.8, 0, '#ff9f43');
  },
  /* dashers (drawn facing +x) */
  scooter(c) {
    thin(c, 'rgba(255,255,255,.7)', 2, () => { line(c, -32, -4, -20, -4); line(c, -36, 4, -22, 4); });
    c.beginPath(); c.moveTo(-12, 8); c.lineTo(10, 8); c.lineTo(14, -15); inkStroke(c, '#5fd3b3', 4);
    c.beginPath(); c.moveTo(9, -15); c.lineTo(19, -15); inkStroke(c, '#4a4f63', 3);
    ell(c, -12, 10, 4.5, 4.5, '#4a4f63'); ell(c, 12, 10, 4.5, 4.5, '#4a4f63');
  },
  cart(c, a) {
    thin(c, 'rgba(255,255,255,.7)', 2, () => { line(c, -36, -2, -24, -2); line(c, -38, 6, -26, 6); });
    c.beginPath(); c.moveTo(-14, -4); c.lineTo(-22, -12); inkStroke(c, '#4a4f63', 3);
    box(c, -14, -8, 28, 15, 2, '#d9a66b'); ell(c, -4, -9, 5, 4, '#7ccf6b'); ell(c, 5, -9, 4.5, 4, '#ff7b5a');
    ell(c, -8, 11, 5, 5, '#4a4f63'); ell(c, 8, 11, 5, 5, '#4a4f63'); dot(c, -8 + cos(a) * 2, 11 + sin(a) * 2, 1.2, '#fff');
  },
  mower(c, a) {
    thin(c, 'rgba(255,255,255,.7)', 2, () => { line(c, -36, -2, -24, -2); line(c, -38, 6, -26, 6); });
    c.beginPath(); c.moveTo(-10, -2); c.lineTo(-22, -16); inkStroke(c, '#4a4f63', 3);
    box(c, -13, -4, 26, 12, 3, '#ff6b6b'); box(c, -4, -9, 10, 6, 2, '#4a4f63');
    thin(c, '#e6e9f2', 2.5, () => line(c, 13, 0 + sin(a * 3) * 5, 19, 6 - sin(a * 3) * 5));
    ell(c, -9, 10, 4.5, 4.5, '#4a4f63'); ell(c, 9, 10, 4.5, 4.5, '#4a4f63');
  },
  firework(c, a) {
    const f = abs(sin(a * 3));
    dot(c, -17 - f * 4, 0, 3 + f * 2, '#ffd84d'); dot(c, -22 - f * 3, -3, 2, '#ff9f43'); dot(c, -22, 4, 1.6, '#fff');
    box(c, -12, -5, 20, 10, 2, '#ff6b6b'); thin(c, '#fff', 2, () => { line(c, -6, -5, -6, 5); line(c, 1, -5, 1, 5); }); tri(c, 8, -6.5, 17, 0, 8, 6.5, '#ffd84d');
  },
  /* props */
  trash(c) {
    tri(c, -4, -9, 0, -17, 4, -9, '#eef3ff'); ell(c, 0, 3, 13, 11, '#eef3ff'); thin(c, '#b9bfd0', 1.5, () => { line(c, -5, -2, -3, 8); line(c, 4, -3, 6, 6); });
  },
  crate(c) {
    box(c, -12, -11, 24, 22, 2, '#d9a66b'); thin(c, '#a8743f', 2, () => { line(c, -12, -4, 12, -4); line(c, -12, 4, 12, 4); line(c, -5, -11, -5, 11); line(c, 5, -11, 5, 11); });
  },
  pot(c) {
    ell(c, -4, -9, 5, 7, '#6fcf6f', -0.4); ell(c, 4, -10, 5, 7, '#8fe08a', 0.4);
    c.beginPath(); c.moveTo(-10, -3); c.lineTo(10, -3); c.lineTo(7, 11); c.lineTo(-7, 11); c.closePath(); c.fillStyle = '#e08a5a'; c.fill(); c.stroke(); box(c, -11, -6, 22, 5, 1.5, '#ee9d6e');
  },
  /* boss */
  vacuum(c, a) {
    ell(c, -22, 38, 9, 9, '#3a3a46'); ell(c, 22, 38, 9, 9, '#3a3a46');
    c.beginPath(); c.arc(0, -22, 18, Math.PI, 0); inkStroke(c, '#4a4f63', 5);
    c.beginPath(); c.moveTo(28, -4); c.lineTo(62, -15); c.lineTo(62, 25); c.lineTo(28, 14); c.closePath(); c.fillStyle = '#4a4f63'; c.fill(); c.stroke();
    ell(c, 0, 5, 40, 36, '#ff6b6b'); ell(c, -2, 17, 22, 13, '#ffe9a8');
    thin(c, '#c9a85a', 2, () => { for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-2 + cos(a + i * 2.1) * 9, 17 + sin(a + i * 2.1) * 5, 3, 0, 4); c.stroke(); } });
    c.lineWidth = 3; ell(c, -12, -12, 7, 7, '#fff'); ell(c, 12, -12, 7, 7, '#fff'); dot(c, -10, -11, 3); dot(c, 14, -11, 3);
    thin(c, INK, 4, () => { line(c, -22, -24, -5, -18); line(c, 22, -24, 5, -18); }); c.lineWidth = 2.5;
  },
};

/* ───────── icons (fit inside ±16) ───────── */
function icon(c, id) {
  pen(c);
  switch (id) {
    case 'claw': for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-3 + i * 9, -13); c.quadraticCurveTo(7 + i * 9, 0, -5 + i * 9, 13); inkStroke(c, '#fff', 3.5); } break;
    case 'hairball': ell(c, 0, 0, 11, 11, '#b08a6a'); thin(c, INK, 1.6, () => { c.beginPath(); c.arc(-2, -1, 5, 0.5, 3.6); c.stroke(); c.beginPath(); c.arc(3, 3, 4, 3.4, 6); c.stroke(); }); break;
    case 'fishbone': c.beginPath(); c.moveTo(-8, 0); c.lineTo(8, 0); c.moveTo(-3, -6); c.lineTo(-3, 6); c.moveTo(2, -5); c.lineTo(2, 5); c.moveTo(6, -3.5); c.lineTo(6, 3.5); c.moveTo(-8, 0); c.lineTo(-14, -6); c.moveTo(-8, 0); c.lineTo(-14, 6); inkStroke(c, '#fff', 2.5); tri(c, 8, -5, 15, 0, 8, 5, '#fff'); break;
    case 'yarn': ell(c, 0, 0, 11, 11, '#ff8fb1'); thin(c, INK, 1.6, () => { c.beginPath(); c.arc(-7, -7, 12, 0.2, 1.4); c.stroke(); c.beginPath(); c.arc(7, -8, 12, 1.7, 2.9); c.stroke(); c.beginPath(); c.arc(0, 12, 11, 4, 5.4); c.stroke(); }); break;
    case 'meow': for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-9, 0, 6 + i * 7, -0.9, 0.9); inkStroke(c, '#ffd84d', 3); } break;
    case 'tuna': c.beginPath(); c.moveTo(-11, -4); c.lineTo(-11, 5); c.ellipse(0, 5, 11, 5, 0, Math.PI, 0, true); c.lineTo(11, -4); c.closePath(); c.fillStyle = '#4fb7c9'; c.fill(); c.stroke(); ell(c, 0, -4, 11, 5, '#d8dce8'); dot(c, 0, -4, 2, '#9aa3b8'); break;
    case 'purr': for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(0, 0, 8 + i * 5, 0.6 + i, 2.6 + i); inkStroke(c, '#5fd3b3', 2.5); c.beginPath(); c.arc(0, 0, 8 + i * 5, 3.8 + i, 5.6 + i); inkStroke(c, '#5fd3b3', 2.5); } c.beginPath(); c.moveTo(0, 5); c.bezierCurveTo(-8, -1, -5, -7, 0, -3); c.bezierCurveTo(5, -7, 8, -1, 0, 5); c.fillStyle = '#ff8a7a'; c.fill(); c.stroke(); break;
    case 'spill': ell(c, 0, 6, 13, 6.5, '#fff'); c.beginPath(); c.moveTo(0, -13); c.bezierCurveTo(-7, -4, -5, 2, 0, 2); c.bezierCurveTo(5, 2, 7, -4, 0, -13); c.fillStyle = '#fff'; c.fill(); c.stroke(); dot(c, 6, 7, 2, '#dfe6f5'); break;
    case 'bowl': c.beginPath(); c.moveTo(-13, -2); c.bezierCurveTo(-12, 13, 12, 13, 13, -2); c.closePath(); c.fillStyle = '#7cc4ff'; c.fill(); c.stroke(); ell(c, 0, -2, 13, 4.5, '#d19a5b'); dot(c, -4, -2.5, 1.6, '#a8743f'); dot(c, 3, -1.5, 1.6, '#a8743f'); break;
    case 'static': c.beginPath(); c.moveTo(3, -14); c.lineTo(-8, 2); c.lineTo(-1, 2); c.lineTo(-4, 14); c.lineTo(8, -3); c.lineTo(1, -3); c.closePath(); c.fillStyle = '#ffd84d'; c.fill(); c.stroke(); break;
    case 'laser': c.beginPath(); c.moveTo(-13, 12); c.lineTo(-2, 1); inkStroke(c, '#9aa3b8', 4); thin(c, '#ff6b6b', 2, () => { for (let i = 0; i < 8; i++) { const q = i / 8 * TAU; line(c, 6 + cos(q) * 6, -6 + sin(q) * 6, 6 + cos(q) * 10, -6 + sin(q) * 10); } }); ell(c, 6, -6, 4.5, 4.5, '#ff6b6b'); break;
    case 'ball': ell(c, 0, 0, 11, 11, '#ff6b6b'); thin(c, '#fff', 3, () => { c.beginPath(); c.arc(-3, -14, 14, 0.6, 2.2); c.stroke(); }); dot(c, 4, 4, 2, '#ffd84d'); break;
    case 'kitten': tri(c, -9, -4, -8, -13, -2, -8, '#fff'); tri(c, 9, -4, 8, -13, 2, -8, '#fff'); ell(c, 0, 1, 11, 10, '#fff'); dot(c, -4, 0, 1.8); dot(c, 4, 0, 1.8); dot(c, -7, 4, 1.8, 'rgba(255,138,122,.7)'); dot(c, 7, 4, 1.8, 'rgba(255,138,122,.7)'); thin(c, INK, 1.5, () => { c.beginPath(); c.moveTo(-2.5, 4); c.quadraticCurveTo(-1.2, 5.6, 0, 4); c.quadraticCurveTo(1.2, 5.6, 2.5, 4); c.stroke(); }); break;
    case 'tailwhip': c.beginPath(); c.moveTo(-14, 8); c.bezierCurveTo(-6, -12, 4, 10, 12, -8); inkStroke(c, '#ffb44a', 4); thin(c, INK, 2, () => { line(c, 10, -14, 13, -11); line(c, 15, -6, 11, -5); line(c, 6, -11, 8, -8); }); break;
    case 'sardine': tri(c, -8, 0, -15, -5, -15, 5, '#ff9f43'); ell(c, 2, 0, 11, 5, '#9fb7d9'); blob(c, 2, 2, 8, 2.4, '#e6eefc'); dot(c, 8, -1, 1.5); break;
    case 'boxtrap': box(c, -12, -6, 24, 17, 1.5, '#d9a66b'); tri(c, -12, -6, -16, -12, -1, -6, '#e8bd88'); tri(c, 12, -6, 16, -12, 1, -6, '#e8bd88'); thin(c, '#ff6b6b', 3, () => line(c, 0, -1, 0, 5)); dot(c, 0, 8.5, 1.7, '#ff6b6b'); break;
    case 'catnip': thin(c, INK, 2.5, () => line(c, 0, 13, 0, 0)); ell(c, -4, -5, 5, 9, '#6fcf6f', -0.6); ell(c, 4, -5, 5, 9, '#8fe08a', 0.6); break;
    case 'whisker': dot(c, 0, 0, 3, '#ff8a7a'); thin(c, INK, 2.2, () => { for (const s of [-1, 1]) { line(c, s * 5, -1, s * 15, -6); line(c, s * 5, 1, s * 15, 1); line(c, s * 5, 3, s * 15, 8); } }); break;
    case 'paw': ell(c, 0, 5, 7.5, 6, '#ff9fb0'); ell(c, -9, -3, 3.4, 4, '#ff9fb0'); ell(c, -3, -8, 3.4, 4, '#ff9fb0'); ell(c, 3.5, -8, 3.4, 4, '#ff9fb0'); ell(c, 9.5, -3, 3.4, 4, '#ff9fb0'); break;
    case 'bell': ell(c, 0, 1, 10, 10, '#ffd84d'); thin(c, INK, 2, () => { line(c, -9, 0, 9, 0); line(c, 0, 5, 0, 10); }); dot(c, 0, 5, 2.2); ell(c, 0, -10, 3, 2.5, '#ffd84d'); break;
    case 'belly': c.beginPath(); c.moveTo(0, 12); c.bezierCurveTo(-18, 0, -12, -14, 0, -5); c.bezierCurveTo(12, -14, 18, 0, 0, 12); c.fillStyle = '#ff8a7a'; c.fill(); c.stroke(); break;
    case 'tail': c.beginPath(); c.moveTo(-10, 12); c.bezierCurveTo(10, 14, 14, -2, 2, -4); c.bezierCurveTo(-6, -5, -4, -13, 6, -13); inkStroke(c, '#ffb44a', 5); break;
    case 'collar': c.beginPath(); c.ellipse(0, -2, 11, 8, 0, 0, TAU); inkStroke(c, '#c9824a', 4); ell(c, 0, 8, 4.5, 4.5, '#ffd84d'); break;
    case 'snack': c.save(); c.rotate(-0.6); box(c, -5, -12, 10, 22, 1, '#ffc94d'); tri(c, -5, 10, 0, 16, 5, 10, '#ff8a7a'); c.fillStyle = '#ff8a7a'; c.fillRect(-4, -4, 8, 6); c.restore(); break;
    case 'feather': c.save(); c.rotate(0.6); ell(c, 0, -2, 5.5, 12, '#7cc4ff'); thin(c, INK, 1.8, () => { line(c, 0, -13, 0, 15); line(c, 0, -2, -4, -6); line(c, 0, 3, 4, -1); }); c.restore(); break;
    case 'cushion': box(c, -13, -7, 26, 16, 6, '#b79cff'); dot(c, 0, 1, 2); thin(c, INK, 1.6, () => { line(c, 5, -13, 10, -13); line(c, 10, -13, 5, -9); line(c, 5, -9, 10, -9); }); break;
    case 'mirror': thin(c, INK, 6, () => line(c, 0, 6, 0, 14)); thin(c, '#ffd84d', 3, () => line(c, 0, 6, 0, 14)); ell(c, 0, -4, 9.5, 11, '#ffd84d'); ell(c, 0, -4, 6.5, 8, '#cfeaff'); thin(c, '#fff', 2, () => line(c, -3, -8, 1, -4)); break;
    case 'clover': thin(c, INK, 2.5, () => line(c, 0, 4, 4, 14)); for (const [x, y] of [[-5, -5], [5, -5], [-5, 4], [5, 4]]) ell(c, x, y, 5.5, 5, '#6fcf6f'); break;
    case 'crown': c.beginPath(); c.moveTo(-12, 9); c.lineTo(-14, -6); c.lineTo(-6, 1); c.lineTo(0, -11); c.lineTo(6, 1); c.lineTo(14, -6); c.lineTo(12, 9); c.closePath(); c.fillStyle = '#ffd84d'; c.fill(); c.stroke(); dot(c, 0, 4, 2, '#ff6b6b'); break;
    case 'piggy': tri(c, -6, -8, -3, -14, 1, -9, '#ff9fb0'); ell(c, 0, 1, 13, 10, '#ff9fb0'); ell(c, 10, 2, 4.5, 3.6, '#ffb9c6'); dot(c, 9, 2, 0.9); dot(c, 11.5, 2, 0.9); dot(c, 3, -3, 1.6); thin(c, INK, 2.2, () => line(c, -6, -7, 0, -7)); break;
    case 'ninelives': c.beginPath(); c.moveTo(0, 13); c.bezierCurveTo(-20, 0, -13, -15, 0, -5); c.bezierCurveTo(13, -15, 20, 0, 0, 13); c.fillStyle = '#ff8a7a'; c.fill(); c.stroke(); c.fillStyle = '#fff'; c.font = '15px Jua, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('9', 0, 1); break;
    case 'glare': c.beginPath(); c.moveTo(-14, 2); c.quadraticCurveTo(0, -12, 14, 2); c.quadraticCurveTo(0, 12, -14, 2); c.fillStyle = '#fff'; c.fill(); c.stroke(); ell(c, 0, 1, 5.5, 5.5, '#ffd84d'); ell(c, 0, 1, 1.2, 4.5, INK); thin(c, INK, 3, () => line(c, -13, -9, 6, -11)); break;
    case 'churu': icon(c, 'snack'); break;
    case 'coin': ell(c, 0, 0, 10, 10, '#ffd84d'); thin(c, INK, 1.6, () => { c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.stroke(); }); break;
    case 'bag': tri(c, -5, -8, 0, -14, 5, -8, '#c9824a'); c.beginPath(); c.moveTo(-4, -8); c.bezierCurveTo(-18, 2, -12, 13, 0, 13); c.bezierCurveTo(12, 13, 18, 2, 4, -8); c.closePath(); c.fillStyle = '#c9824a'; c.fill(); c.stroke(); ell(c, 0, 4, 4.5, 4.5, '#ffd84d'); break;
    case 'hiss': c.beginPath(); for (let i = 0; i < 14; i++) { const q = i / 14 * TAU, r = i % 2 ? 8 : 14; c.lineTo(cos(q) * r, sin(q) * r); } c.closePath(); c.fillStyle = '#ff6b6b'; c.fill(); c.stroke(); thin(c, '#fff', 3, () => line(c, 0, -5, 0, 1)); dot(c, 0, 5.5, 1.8, '#fff'); break;
    case 'clock': ell(c, -8, -10, 3.5, 3.5, '#ffd84d'); ell(c, 8, -10, 3.5, 3.5, '#ffd84d'); ell(c, 0, 2, 11, 11, '#fff'); thin(c, INK, 2, () => { line(c, 0, 2, 0, -5); line(c, 0, 2, 5, 4); }); break;
    case 'skjump': c.beginPath(); c.moveTo(-13, 12); c.quadraticCurveTo(-6, -18, 11, -6); inkStroke(c, '#ffd84d', 3.4); tri(c, 6, -12, 15, -3, 6, -2, '#ffd84d');
      ell(c, -9, 9, 4.4, 3.6, '#ff9fb0'); ell(c, -14.4, 4.6, 1.8, 2.1, '#ff9fb0'); ell(c, -11, 2.4, 1.8, 2.1, '#ff9fb0'); ell(c, -6.6, 2.6, 1.8, 2.1, '#ff9fb0'); break;
    case 'skhiss': thin(c, '#ff8a7a', 2, () => { for (let i = 0; i < 8; i++) { const q = i / 8 * TAU + 0.2; line(c, cos(q) * 12, sin(q) * 11, cos(q) * 16, sin(q) * 15); } });
      c.beginPath(); c.ellipse(0, 1, 10, 8, 0, 0, TAU); c.fillStyle = '#c0394a'; c.fill(); c.stroke(); dot(c, 0, 4.6, 3.6, '#ff8a9a');
      tri(c, -6.4, -5.6, -4, 1.6, -2, -5.4, '#fff'); tri(c, 2, -5.4, 4, 1.6, 6.4, -5.6, '#fff'); break;
    case 'skhide': tri(c, -9, -3, -6, -13, -1.4, -4, '#ffb44a'); tri(c, 1.4, -4, 6, -13, 9, -3, '#ffb44a'); ell(c, 0, -2, 9.4, 6.4, '#ffb44a'); dot(c, -3.4, -2.6, 1.5); dot(c, 3.4, -2.6, 1.5);
      box(c, -13, 1, 26, 13, 1.5, '#d9a66b'); tri(c, -13, 1, -17, -4, -2, 1, '#e8bd88'); tri(c, 13, 1, 17, -4, 2, 1, '#e8bd88'); break;
    case 'scratcher': c.beginPath(); c.moveTo(-15, 12); c.lineTo(15, 12); c.lineTo(10, -6); c.lineTo(-10, -6); c.closePath(); c.fillStyle = '#d9a66b'; c.fill(); c.stroke();
      thin(c, '#a8743f', 1.2, () => { for (let x = -8; x <= 8; x += 4) line(c, x, -4, x * 1.3, 10); }); break;
    case 'tower': box(c, -12, 11, 24, 5, 2, '#c9b49a'); box(c, -2.5, -13, 5, 25, 1.5, '#e8d4b4'); box(c, -12, 0, 24, 4, 2, '#c9b49a'); box(c, -9, -15, 18, 4, 2, '#c9b49a');
      thin(c, INK, 1, () => line(c, 7, -11, 7, -5)); ell(c, 7, -3.5, 2.2, 2.2, '#ff8a7a'); break;
    case 'house': c.beginPath(); c.moveTo(-15, -2); c.lineTo(0, -15); c.lineTo(15, -2); c.closePath(); c.fillStyle = '#c58f52'; c.fill(); c.stroke();
      box(c, -12, -3, 24, 17, 1.5, '#d9a66b'); c.beginPath(); c.arc(0, 8, 6, Math.PI, 0); c.lineTo(6, 14); c.lineTo(-6, 14); c.closePath(); c.fillStyle = '#5a4636'; c.fill(); c.stroke(); break;
    case 'box': box(c, -12, -6, 24, 17, 1.5, '#d9a66b'); tri(c, -12, -6, -16, -12, -1, -6, '#e8bd88'); tri(c, 12, -6, 16, -12, 1, -6, '#e8bd88'); c.fillStyle = '#f4e3c3'; c.fillRect(-3, -5, 6, 15); break;
  }
}

/* ───────── ground ───────── */
function hash(x, y) { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; }
function scatter(x0, y0, x1, y1, T, fn) {
  for (let ix = Math.floor(x0 / T); ix <= Math.floor(x1 / T); ix++) for (let iy = Math.floor(y0 / T); iy <= Math.floor(y1 / T); iy++) { const h = hash(ix, iy); fn(ix * T + (h % (T - 40)) + 20, iy * T + ((h >>> 8) % (T - 40)) + 20, h); }
}
const BAND = 720;
function bands(y0, y1, half, fn) { for (let k = Math.floor((y0 - half) / BAND); k <= Math.ceil((y1 + half) / BAND); k++) fn(k * BAND, k); }
/* Ground decorations avoid small round blobs, which read as pickups. */
const GROUND = {
  alley(c, x0, y0, x1, y1) {
    c.fillStyle = '#7d859c'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    scatter(x0, y0, x1, y1, 180, (px, py, h) => {
      const k = h % 9;
      if (k === 0) { pen(c); ell(c, px, py, 20, 20, '#6a7188'); thin(c, '#596078', 2, () => { line(c, px - 12, py, px + 12, py); line(c, px, py - 12, px, py + 12); }); }
      else if (k === 1) blob(c, px, py, 34, 18, '#747c93', h % 6);
      else if (k === 2) thin(c, '#656c84', 2, () => { c.beginPath(); c.moveTo(px - 16, py - 6); c.lineTo(px - 4, py + 2); c.lineTo(px + 4, py - 5); c.lineTo(px + 18, py + 7); c.stroke(); });
    });
    bands(y0, y1, 64, (y, k) => {
      c.fillStyle = '#ffd84d'; const ly = y + BAND / 2 - 4; if (ly > y0 - 10 && ly < y1 + 10) for (let x = Math.floor(x0 / 130) * 130; x < x1; x += 130) c.fillRect(x, ly, 70, 8);
      for (let ix = Math.floor(x0 / 900); ix <= Math.floor(x1 / 900); ix++) { if (hash(ix, k) % 3) continue; c.fillStyle = '#f4f6fb'; for (let yy = y + 86; yy < y + BAND - 94; yy += 34) c.fillRect(ix * 900 + 300, yy, 120, 16); }
      if (y + 64 < y0 || y - 64 > y1) return;
      c.fillStyle = '#d6dae6'; c.fillRect(x0, y - 64, x1 - x0, 128);
      c.strokeStyle = '#b9bfd0'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y);
      for (let x = Math.floor(x0 / 64) * 64; x < x1 + 64; x += 64) { c.moveTo(x, y - 64); c.lineTo(x, y); c.moveTo(x + 32, y); c.lineTo(x + 32, y + 64); }
      c.stroke(); thin(c, 'rgba(59,52,66,.5)', 2, () => { line(c, x0, y - 64, x1, y - 64); line(c, x0, y + 64, x1, y + 64); });
    });
  },
  market(c, x0, y0, x1, y1) {
    c.fillStyle = '#c9b396'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    c.strokeStyle = '#b8a184'; c.lineWidth = 2; c.beginPath();
    for (let y = Math.floor(y0 / 48) * 48; y < y1 + 48; y += 48) { c.moveTo(x0, y); c.lineTo(x1, y); const off = (Math.round(y / 48) & 1) * 48; for (let x = Math.floor(x0 / 96) * 96 + off; x < x1 + 96; x += 96) { c.moveTo(x, y); c.lineTo(x, y + 48); } }
    c.stroke();
    scatter(x0, y0, x1, y1, 200, (px, py, h) => {
      const k = h % 8;
      if (k === 1) blob(c, px, py, 30, 15, '#bca587', h % 6);
      else if (k === 2) thin(c, '#f4f6fb', 2.5, () => { c.beginPath(); c.ellipse(px, py, 12, 6, 0, 0, TAU); c.stroke(); line(c, px + 12, py, px + 19, py - 5); line(c, px + 12, py, px + 19, py + 5); });
    });
    bands(y0, y1, 50, y => {
      if (y + 50 < y0 || y - 50 > y1) return;
      for (let x = Math.floor(x0 / 80) * 80; x < x1; x += 80) { c.fillStyle = (Math.round(x / 80) & 1) ? '#ff8a7a' : '#fff6ea'; c.fillRect(x, y - 44, 80, 88); }
      thin(c, 'rgba(59,52,66,.5)', 2, () => { line(c, x0, y - 44, x1, y - 44); line(c, x0, y + 44, x1, y + 44); });
    });
  },
  park(c, x0, y0, x1, y1) {
    c.fillStyle = '#8fd07c'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    scatter(x0, y0, x1, y1, 170, (px, py, h) => {
      const k = h % 8;
      if (k < 2) blob(c, px, py, 36 + (h % 20), 20, '#84c671', h % 6);
      else if (k === 2 || k === 3) { const col = ['#ffffff', '#ffd84d', '#ff9fb0'][(h >>> 5) % 3]; for (let i = 0; i < 5; i++) dot(c, px + cos(i * 1.257) * 4.5, py + sin(i * 1.257) * 4.5, 3, col); dot(c, px, py, 2.4, '#ffb347'); }
      else if (k === 4) thin(c, '#6fb25e', 2, () => { line(c, px - 5, py + 5, px - 7, py - 4); line(c, px, py + 5, px, py - 7); line(c, px + 5, py + 5, px + 7, py - 4); });
    });
    bands(y0, y1, 56, y => {
      if (y + 56 < y0 || y - 56 > y1) return;
      c.fillStyle = '#e6d3a8'; c.fillRect(x0, y - 50, x1 - x0, 100);
      thin(c, '#cdb888', 3, () => { line(c, x0, y - 50, x1, y - 50); line(c, x0, y + 50, x1, y + 50); });
      for (let x = Math.floor(x0 / 90) * 90; x < x1 + 90; x += 90) { const h = hash(x, Math.round(y)); dot(c, x + (h % 60), y - 30 + ((h >>> 6) % 60), 3.5, '#d2be90'); }
    });
  },
  roof(c, x0, y0, x1, y1) {
    c.fillStyle = '#5a6090'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    c.strokeStyle = '#505688'; c.lineWidth = 2; c.beginPath();
    for (let y = Math.floor(y0 / 60) * 60; y < y1 + 60; y += 60) { c.moveTo(x0, y); c.lineTo(x1, y); }
    for (let x = Math.floor(x0 / 120) * 120; x < x1 + 120; x += 120) { c.moveTo(x, y0); c.lineTo(x, y1); }
    c.stroke();
    scatter(x0, y0, x1, y1, 210, (px, py, h) => {
      const k = h % 9;
      if (k === 0) { pen(c, 1.4); box(c, px - 18, py - 14, 36, 28, 3, '#8088b3'); thin(c, '#5a6090', 2, () => { for (let i = -8; i <= 8; i += 8) line(c, px - 12, py + i, px + 12, py + i); }); }
      else if (k === 1) { blob(c, px, py, 32, 16, '#6c73a6', h % 6); c.beginPath(); c.arc(px, py, 6, 0.6, 3.8); c.strokeStyle = '#ffe9a8'; c.lineWidth = 3; c.stroke(); }
      else if (k === 2) blob(c, px, py, 26, 13, '#525889', h % 6);
    });
    bands(y0, y1, 40, y => {
      if (y + 40 < y0 || y - 40 > y1) return;
      c.fillStyle = '#7b82b3'; c.fillRect(x0, y - 34, x1 - x0, 68);
      thin(c, '#6a71a3', 2, () => { for (let x = Math.floor(x0 / 44) * 44; x < x1 + 44; x += 44) line(c, x, y - 34, x, y + 34); });
      thin(c, 'rgba(59,52,66,.5)', 2, () => { line(c, x0, y - 34, x1, y - 34); line(c, x0, y + 34, x1, y + 34); });
    });
  },
};

GN.art = { INK, setPen, pen, ell, blob, tri, dot, line, box, inkStroke, thin, crown, drawCat, ART, icon, GROUND };
})();

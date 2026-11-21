/* 길냥이 서바이벌 — character art: thin outlines, cel shading, more detail.
   Same coordinate space as art.js. install() swaps these drawings into the game. */
(() => {
'use strict';
const GN = window.GN, TAU = Math.PI * 2, sin = Math.sin, cos = Math.cos, abs = Math.abs;
const DARK = '#2a2330', PINK = '#f2b3bf', ORG = '#f08a3c';
const ST = { lw: 1.2, ink: '#3b3442', tint: false };   // tint: outline takes a darker shade of each fill

const shadeCache = {};
function shade(hex, k) {
  const key = hex + k; if (shadeCache[key]) return shadeCache[key];
  let r, g, b;
  if (hex[0] === '#') { let h = hex.slice(1); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255; }
  else { const m = /^rgb\((\d+),(\d+),(\d+)\)$/.exec(hex); if (!m) return hex; r = +m[1]; g = +m[2]; b = +m[3]; }
  const f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  r = f(r); g = f(g); b = f(b); if (k < 0) b = Math.min(255, b + Math.round(-k * 34));   // shadows lean violet
  return shadeCache[key] = `rgb(${r},${g},${b})`;
}
function ol(c, fill, col) { c.lineWidth = ST.lw; c.strokeStyle = col || (ST.tint ? shade(fill, -0.45) : ST.ink); c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
/* shaded ellipse: darker crescent bottom right, soft highlight top left */
function E(c, x, y, rx, ry, fill, rot = 0, flat = false) {
  c.save(); c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU);
  if (flat) { c.fillStyle = fill; c.fill(); }
  else {
    c.fillStyle = shade(fill, -0.17); c.fill(); c.clip();
    c.beginPath(); c.ellipse(x - rx * 0.1, y - ry * 0.2, rx, ry, rot, 0, TAU); c.fillStyle = fill; c.fill();
    c.globalAlpha = 0.36; c.beginPath(); c.ellipse(x - rx * 0.3, y - ry * 0.45, rx * 0.36, ry * 0.2, rot - 0.3, 0, TAU); c.fillStyle = shade(fill, 0.3); c.fill(); c.globalAlpha = 1;
  }
  c.restore(); c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); ol(c, fill);
}
/* shaded free shape: path() must begin its own path */
function S(c, path, fill, inner) {
  c.save(); path(); c.fillStyle = shade(fill, -0.17); c.fill(); c.clip();
  c.save(); c.translate(-0.8, -1.5); path(); c.fillStyle = fill; c.fill(); c.restore();
  if (inner) inner(); c.restore(); path(); ol(c, fill);
}
function B(c, x, y, rx, ry, fill, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fillStyle = fill; c.fill(); }
function poly(c, fill, ...p) { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); c.fillStyle = fill; c.fill(); ol(c, fill); }
function flat(c, fill, ...p) { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); c.fillStyle = fill; c.fill(); }
function L(c, col, w, ...p) { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
function limb(c, col, w, ...p) { L(c, ST.tint ? shade(col, -0.45) : ST.ink, w + ST.lw * 2, ...p); L(c, col, w, ...p); }
function tube(c, fill, w) { c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = w + ST.lw * 2; c.strokeStyle = ST.tint ? shade(fill, -0.45) : ST.ink; c.stroke(); c.lineWidth = w; c.strokeStyle = fill; c.stroke(); }
function clipE(c, x, y, rx, ry, rot, fn) { c.save(); c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.clip(); fn(); c.restore(); }
function eye(c, x, y, r, iris) {
  if (iris) { B(c, x, y, r, r * 1.15, iris); c.beginPath(); c.ellipse(x, y, r, r * 1.15, 0, 0, TAU); c.lineWidth = 0.9; c.strokeStyle = DARK; c.stroke(); B(c, x + r * 0.08, y, r * 0.5, r * 0.85, DARK); }
  else B(c, x, y, r * 0.85, r, DARK);
  B(c, x - r * 0.3, y - r * 0.4, r * 0.34, r * 0.34, '#fff');
}
function brows(c, x1, x2, y, s = 1) { L(c, DARK, 1.3 * s, x1 - 2.6 * s, y - 1.6 * s, x1 + 2 * s, y); L(c, DARK, 1.3 * s, x2 + 2.6 * s, y - 1.6 * s, x2 - 2 * s, y); }
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function speed(c) { L(c, 'rgba(255,255,255,.7)', 1.2, -32, -4, -20, -4); L(c, 'rgba(255,255,255,.7)', 1.2, -36, 4, -22, 4); }
function birdLegs(c, x1, x2, y, st, len = 4.6) { for (const [x, dx] of [[x1, st], [x2, -st]]) { L(c, ORG, 1.3, x, y, x + dx, y + len); L(c, ORG, 1, x + dx - 2.2, y + len + 0.8, x + dx, y + len, x + dx + 2.6, y + len + 0.8); } }
function wheel(c, x, y, r, a) { E(c, x, y, r, r, '#3d3d49'); B(c, x, y, r * 0.42, r * 0.42, '#c9cde0'); if (a !== undefined) L(c, '#3d3d49', 0.8, x + cos(a) * r * 0.4, y + sin(a) * r * 0.4, x - cos(a) * r * 0.4, y - sin(a) * r * 0.4); }

/* ───────── cat ───────── */
const LOOK2 = {
  cheese: { fur: '#f6a94a', belly: '#fff4e0', muzzle: '#fff4e0', socks: '#fff4e0', ear: '#f6a94a', stripes: '#d7802b', eye: '#8ccf5a', tnr: true },
  tux: { fur: '#484852', belly: '#ffffff', muzzle: '#ffffff', socks: '#ffffff', ear: '#484852', eye: '#f4c542', dark: true },
  calico: { fur: '#fffaf2', ear: '#f6a94a', patches: true, eye: '#d9a13a', tip: '#484852' },
  mackerel: { fur: '#a9b0be', belly: '#f3f5fa', muzzle: '#f3f5fa', socks: '#f3f5fa', ear: '#a9b0be', stripes: '#646b7e', eye: '#9ed36a', tnr: true },
  russian: { fur: '#8fa3c4', ear: '#8fa3c4', eye: '#6fd08a' },
  fatty: { fur: '#f1d5a0', belly: '#fffaf0', muzzle: '#fffaf0', socks: '#fffaf0', ear: '#f1d5a0', stripes: '#dbb775', eye: '#7cc4ff', fat: 1.28 },
  black: { fur: '#3f3f4d', ear: '#3f3f4d', eye: '#ffd447', dark: true },
  siam: { fur: '#f3e6cf', ear: '#6b4b3a', points: '#6b4b3a', eye: '#6fb8ff' },
  snow: { fur: '#ffffff', ear: '#ffffff', eye: '#7cc4ff', eye2: '#ffd447' },
  sphynx: { fur: '#f2c1b6', ear: '#f2c1b6', bald: true, eye: '#8fd0c0' },
  kit: { fur: '#d9c2a3', belly: '#ffffff', muzzle: '#ffffff', socks: '#ffffff', ear: '#d9c2a3', eye: '#8ccf5a', small: 0.8 },
  gold: { fur: '#ffd447', belly: '#fff6c9', muzzle: '#fff6c9', socks: '#fff6c9', ear: '#ffd447', stripes: '#e0ad1c', eye: '#f08a3c' },
};
function leg(c, x, y, col, sock) {
  rr(c, x - 2.5, y - 4.5, 5, 7, 2.3); c.fillStyle = col; c.fill(); ol(c, col);
  E(c, x + 0.6, y + 2.7, 3.3, 2.1, sock || col, 0, true);
  L(c, 'rgba(42,35,48,.45)', 0.6, x - 0.2, y + 2.6, x - 0.2, y + 4.2); L(c, 'rgba(42,35,48,.45)', 0.6, x + 1.6, y + 2.6, x + 1.6, y + 4.2);
}
function drawCat(c, K, t, moving) {
  const k = K.small || 1, fat = K.fat || 1; c.save(); c.scale(k, k);
  const fur = K.fur, bob = moving ? sin(t * 14) * 1.2 : sin(t * 3) * 0.5, st = moving ? sin(t * 14) * 3.2 : 0, hy = bob;
  const legCol = K.points || fur, far = shade(legCol, -0.22), tw = sin(t * (moving ? 9 : 4)) * 3;
  const tailCol = K.points || (K.patches ? '#484852' : fur), by = 3 + bob * 0.3, bry = 8.6 * (1 + (fat - 1) * 0.5);
  // tail
  c.beginPath(); c.moveTo(-11 * fat, 4); c.bezierCurveTo(-21 * fat, 6, -25 * fat, -4 + tw, -19 * fat, -13 + tw * 0.5); tube(c, tailCol, K.bald ? 2.2 : 4);
  if (K.stripes) { L(c, K.stripes, 1.4, -16.5 * fat, 2.8, -17.5 * fat, 6.6); L(c, K.stripes, 1.4, -20.4 * fat, -1 + tw * 0.5, -23.8 * fat, 0.6 + tw * 0.5); L(c, K.stripes, 1.4, -19.8 * fat, -7.5 + tw * 0.6, -23 * fat, -8.4 + tw * 0.6); }
  if (K.tip) B(c, -19 * fat, -13 + tw * 0.5, 2, 2, K.tip);
  // far legs
  leg(c, -9 - st, 8, far, K.socks ? shade(K.socks, -0.14) : null); leg(c, 4.5 + st, 8, far, K.socks ? shade(K.socks, -0.14) : null);
  // body
  E(c, -3, by, 12 * fat, bry, fur);
  clipE(c, -3, by, 12 * fat - 0.6, bry - 0.6, 0, () => {
    if (K.belly) B(c, -1, by + 7.5, 10 * fat, 4.6, K.belly);
    if (K.patches) { B(c, -10, by - 4, 6.5, 5.5, '#484852', 0.4); B(c, 1, by - 6, 5.5, 4, '#f6a94a'); B(c, -3, by + 7, 4, 3, '#f6a94a'); }
    if (K.stripes) { L(c, K.stripes, 1.7, -10.5, by - 9, -9.6, by - 2.6); L(c, K.stripes, 1.7, -6.4, by - 10, -6, by - 3.6); L(c, K.stripes, 1.7, -2.2, by - 10, -2.2, by - 4.4); }
    if (K.bald) { L(c, shade(fur, -0.2), 0.8, -9, by - 3, -6, by - 1); L(c, shade(fur, -0.2), 0.8, -4, by - 4, -1, by - 2); L(c, shade(fur, -0.2), 0.8, -8, by + 2, -4, by + 3); }
  });
  // chest fluff
  if (K.belly) flat(c, K.belly, 3.5, by - 3, 8.6, by + 0.4, 6.2, by + 1.6, 8.4, by + 4.2, 5, by + 5.2, 2.4, by + 2);
  // near legs
  leg(c, -6 + st, 9, legCol, K.socks); leg(c, 6.5 - st, 9, legCol, K.socks);
  // ears (a clipped far ear marks a neutered street cat)
  const earL = K.patches ? '#484852' : K.ear;
  if (K.tnr) poly(c, earL, -3, -10 + hy, -1.8, -17.8 + hy, 1.4, -19 + hy, 6, -14 + hy); else poly(c, earL, -3, -10 + hy, -1, -21 + hy, 6, -14 + hy);
  flat(c, '#ffb3bd', -1.3, -12 + hy, -0.6, -17 + hy, 3.4, -14 + hy);
  poly(c, K.ear, 9, -14 + hy, 15.5, -21 + hy, 17, -9.5 + hy); flat(c, '#ffb3bd', 11, -13.6 + hy, 15, -18.6 + hy, 15.8, -11.5 + hy);
  // cheek tuft, head
  if (!K.bald) poly(c, fur, 17.2, -5 + hy, 20.6, -2 + hy, 16.4, -0.4 + hy);
  E(c, 7, -5.5 + hy, 11, 9.6, fur);
  clipE(c, 7, -5.5 + hy, 10.4, 9, 0, () => {
    if (K.patches) { B(c, 0, -12 + hy, 6.5, 6.5, '#484852'); B(c, 15, -12 + hy, 6.5, 6.5, '#f6a94a'); }
    if (K.points) B(c, 8.5, -2.5 + hy, 7.5, 6.5, K.points);
    if (K.muzzle) B(c, 8.6, 1 + hy, 7.6, 5.4, K.muzzle);
    if (K.stripes) { L(c, K.stripes, 1.4, 5.2, -15 + hy, 5.8, -11.8 + hy); L(c, K.stripes, 1.4, 8.6, -15.6 + hy, 8.6, -11.8 + hy); L(c, K.stripes, 1.4, 12, -15 + hy, 11.4, -11.8 + hy); L(c, K.stripes, 1.2, -3, -6.4 + hy, -0.2, -5.4 + hy); L(c, K.stripes, 1.2, 19.6, -6.4 + hy, 17, -5.4 + hy); }
    if (K.bald) { L(c, shade(fur, -0.2), 0.8, 4.6, -13 + hy, 7.4, -12.2 + hy); L(c, shade(fur, -0.2), 0.8, 9.6, -12.2 + hy, 12.6, -13 + hy); L(c, shade(fur, -0.2), 0.8, 6, -10.8 + hy, 11, -10.8 + hy); }
  });
  // muzzle, nose, mouth
  const mz = K.muzzle || (K.points ? shade(K.points, 0.16) : shade(fur, K.dark ? 0.14 : 0.35));
  B(c, 6.4, -1.5 + hy, 2.9, 2.3, mz); B(c, 10.8, -1.5 + hy, 2.9, 2.3, mz);
  flat(c, '#f28a94', 7.5, -4.4 + hy, 9.7, -4.4 + hy, 8.6, -3 + hy);
  c.beginPath(); c.moveTo(8.6, -3 + hy); c.lineTo(8.6, -2.2 + hy); c.quadraticCurveTo(7.4, -0.6 + hy, 6, -1.7 + hy); c.moveTo(8.6, -2.2 + hy); c.quadraticCurveTo(9.8, -0.6 + hy, 11.2, -1.7 + hy);
  c.strokeStyle = (K.dark && !K.muzzle) || K.points ? '#d6d3e0' : DARK; c.lineWidth = 0.9; c.lineCap = 'round'; c.stroke();
  // eyes, lids, blush, whiskers
  const iris = K.eye || '#9ed36a';
  eye(c, 3.6, -7 + hy, 2.5, iris); eye(c, 12.8, -7 + hy, 2.5, K.eye2 || iris);
  c.beginPath(); c.arc(3.6, -6.6 + hy, 3, Math.PI * 1.12, Math.PI * 1.88); c.moveTo(12.8 - 3 * 0.93, -6.6 + hy - 1.1); c.arc(12.8, -6.6 + hy, 3, Math.PI * 1.12, Math.PI * 1.88); c.strokeStyle = DARK; c.lineWidth = 1.1; c.stroke();
  B(c, 0.4, -2.4 + hy, 2, 1.3, 'rgba(255,110,125,.4)'); B(c, 16.6, -2.4 + hy, 2, 1.3, 'rgba(255,110,125,.4)');
  const wc = K.dark || K.points ? 'rgba(255,255,255,.85)' : 'rgba(42,35,48,.5)';
  L(c, wc, 0.6, 1.2, -2.6 + hy, -3.6, -3.8 + hy); L(c, wc, 0.6, 1, -1.8 + hy, -4, -1.7 + hy); L(c, wc, 0.6, 1.4, -1 + hy, -3.2, 0.2 + hy);
  L(c, wc, 0.6, 16.2, -2.6 + hy, 23.4, -4.2 + hy); L(c, wc, 0.6, 16.4, -1.8 + hy, 24, -1.6 + hy); L(c, wc, 0.6, 16, -1 + hy, 22.8, 0.8 + hy);
  c.restore();
}

/* ───────── enemies: (c, a) with a = animation phase 0..2π ───────── */
function dleg(c, x, y, col) {
  rr(c, x - 2.8, y - 6, 5.6, 8.5, 2.6); c.fillStyle = col; c.fill(); ol(c, col); E(c, x + 0.8, y + 2.8, 4, 2.3, col, 0, true);
  L(c, 'rgba(42,35,48,.45)', 0.6, x, y + 2.6, x, y + 4.4); L(c, 'rgba(42,35,48,.45)', 0.6, x + 2, y + 2.6, x + 2, y + 4.4);
}
const ART2 = {
  /* ── 골목길 ── */
  rat(c, a) {
    const w = sin(a) * 3, fur = '#c6c6d5';
    c.beginPath(); c.moveTo(-9, 3); c.bezierCurveTo(-15, 4.5, -20, -4 + w, -24, 2 + w); tube(c, PINK, 1.6);
    L(c, shade(PINK, -0.3), 0.6, -12.6, 2.6, -13, 4.4); L(c, shade(PINK, -0.3), 0.6, -15.4, 2.2, -16.2, 3.8);
    E(c, 6.6, -5.2, 3.4, 3.6, shade(fur, -0.12)); B(c, 6.6, -5.2, 2, 2.2, PINK);
    E(c, -5, 8.8, 3.6, 1.6, PINK, 0, true);
    E(c, -1, 2.5, 10.5, 7, fur);
    clipE(c, -1, 2.5, 10, 6.5, 0, () => B(c, 0.5, 8.6, 8.5, 3.2, '#ebebf4'));
    c.beginPath(); c.arc(-4.4, 4.4, 5.2, -2.4, 0.3); c.strokeStyle = shade(fur, -0.22); c.lineWidth = 0.8; c.stroke();
    L(c, shade(fur, -0.22), 0.7, -5, -3.2, -3.8, -1.6); L(c, shade(fur, -0.22), 0.7, -1.4, -3.8, -0.4, -2.2);
    E(c, 7.4, 1, 6.4, 4.7, fur, 0.25);
    E(c, 2.6, -5.6, 4, 4.2, fur); B(c, 2.9, -5.3, 2.5, 2.7, PINK);
    B(c, 13.2, 2.6, 1.4, 1.2, '#e86a7a'); eye(c, 8.2, -0.4, 1.6);
    L(c, 'rgba(42,35,48,.5)', 0.5, 11.8, 2.8, 16.4, 0.6); L(c, 'rgba(42,35,48,.5)', 0.5, 12, 3.4, 17, 3.4); L(c, 'rgba(42,35,48,.5)', 0.5, 11.6, 4, 15.8, 5.6);
    L(c, DARK, 0.7, 9.4, 4.4, 11.6, 4.9);
    E(c, 5.4, 8.8, 2.5, 1.4, PINK, 0, true);
  },
  pigeon(c, a) {
    const hb = sin(a * 2) * 1.5, body = '#b9c4e2';
    birdLegs(c, -3, 3, 8, sin(a * 2) * 1.4);
    poly(c, '#7f8bb3', -8, 1, -17.5, 3.4, -16.5, 7.4, -8, 6.6); L(c, shade('#7f8bb3', -0.3), 0.7, -12, 3.6, -16.6, 5.2);
    E(c, -1, 2, 10.5, 8, body);
    E(c, -3.2, 2.6, 7.2, 4.8, '#96a3ca', 0.15);
    L(c, '#4f5878', 1.4, -6.4, -0.6, -4.8, 5.6); L(c, '#4f5878', 1.4, -2.8, -1.2, -1.4, 6.2); L(c, shade('#96a3ca', -0.3), 0.7, -10, 3, -7.4, 5.4);
    B(c, 5.6, -2.6, 4.4, 3, '#7fd0a8', -0.5); B(c, 6.8, -1.2, 3.4, 1.7, '#b59cf0', -0.5);
    E(c, 7 + hb, -7, 5.4, 5.2, '#aab6d8');
    poly(c, '#6b6f82', 11.6 + hb, -8.2, 17.2 + hb, -6.6, 11.8 + hb, -5); B(c, 12.5 + hb, -7.7, 1.4, 1, '#fff');
    B(c, 8.4 + hb, -7.8, 2, 2, '#f2913a'); B(c, 8.4 + hb, -7.8, 1.1, 1.1, DARK); B(c, 8 + hb, -8.3, 0.45, 0.45, '#fff');
  },
  bag(c, a) {
    c.rotate(sin(a) * 0.22);
    const path = () => { c.beginPath(); c.moveTo(-8, -6); c.bezierCurveTo(-13.5, 2, -10, 10, -5, 10.6); c.lineTo(5, 10.6); c.bezierCurveTo(10, 10, 13.5, 2, 8, -6); c.lineTo(5.2, -6); c.lineTo(6.6, -14); c.lineTo(2.6, -14); c.lineTo(1.6, -7.2); c.lineTo(-1.6, -7.2); c.lineTo(-2.6, -14); c.lineTo(-6.6, -14); c.lineTo(-5.2, -6); c.closePath(); };
    c.save(); path(); c.fillStyle = 'rgba(248,250,255,.92)'; c.fill(); c.clip();
    B(c, 6.5, 8, 9, 6.5, 'rgba(160,178,220,.55)'); B(c, -5.6, -1, 1.7, 6, 'rgba(255,255,255,.95)', 0.2); B(c, 3, -10, 3, 5, 'rgba(160,178,220,.4)'); c.restore();
    path(); ol(c, '#f4f6fb', ST.tint ? '#8f9bb8' : ST.ink);
    L(c, '#aab6d0', 0.7, -3, -6, -4.2, -1); L(c, '#aab6d0', 0.7, 3.2, -6, 5.2, 0); L(c, '#aab6d0', 0.7, -7, 5.6, -2.6, 8.2); L(c, '#aab6d0', 0.7, 4, 7.6, 7.6, 4);
    eye(c, -3, 2, 1.6); eye(c, 3.4, 2, 1.6); brows(c, -3, 3.4, -0.8, 0.9); L(c, DARK, 0.9, -2, 6.2, -0.6, 5.2, 0.8, 6.2, 2.2, 5.2);
  },
  cuke(c, a) {
    const hop = abs(sin(a)); c.translate(0, -hop * 4);
    const g = '#7fcf68', dk = '#5aa74d';
    limb(c, dk, 1.5, -6.6, 1, -10.4, 3.4 - hop * 3); limb(c, dk, 1.5, 6.6, 1, 10.4, 3.4 - hop * 3);
    E(c, 0, 0, 7.6, 13.2, g);
    clipE(c, 0, 0, 7.2, 12.8, 0, () => { B(c, -2.8, -1, 1.5, 9, '#a9e290'); B(c, 0, -13, 5.4, 2.8, dk); B(c, 0, 13, 5.4, 2.6, dk); });
    for (const [x, y] of [[-4.6, -6.5], [4.2, -8], [5.2, 3.4], [-5, 5.6], [1.4, 9.4], [3, -3.4]]) B(c, x, y, 0.8, 0.8, dk);
    E(c, 0, -13.6, 1.7, 1.2, '#8a6a45', 0, true);
    eye(c, -2.8, -2, 1.7); eye(c, 2.8, -2, 1.7); brows(c, -2.8, 2.8, -4.8, 0.9);
    c.beginPath(); c.moveTo(-2.6, 4.2); c.quadraticCurveTo(0, 2.2, 2.6, 4.2); c.strokeStyle = DARK; c.lineWidth = 1; c.stroke();
  },
  crow(c, a) {
    const f = sin(a * 2), bk = '#3d3d4c';
    poly(c, '#32323f', -6, 1.4, -14, 3.6, -13.4, 7, -6, 6); L(c, '#5d6388', 0.7, -8.6, 3.8, -12.8, 4.8);
    for (const x of [-1.2, 2.6]) { L(c, '#55586a', 1.2, x, 7, x + 0.4, 12); L(c, '#55586a', 0.9, x - 1.8, 12.8, x + 0.4, 12, x + 2.6, 12.8); }
    E(c, 0, 1, 9.5, 7.2, bk);
    c.globalAlpha = 0.7; B(c, -1.5, -2.6, 5, 1.5, '#5d6388', -0.2); c.globalAlpha = 1;
    c.beginPath(); c.moveTo(3.4, -3); c.lineTo(-8, -6 - 9 * f); c.lineTo(-14.5, -5 - 9 * f); c.lineTo(-11, -2.4 - 7 * f); c.lineTo(-13.4, 0.2 - 6 * f); c.lineTo(-9.2, 0.6 - 4 * f); c.lineTo(-10.4, 3.2 - 2 * f); c.lineTo(-3, 2.4); c.closePath(); c.fillStyle = '#34343f'; c.fill(); ol(c, '#34343f');
    L(c, '#5d6388', 0.7, 1, -2.4, -8, -4.6 - 8 * f); L(c, '#5d6388', 0.7, -1, -0.6, -8.6, -1 - 5 * f);
    E(c, 6, -5, 5.2, 5, bk);
    L(c, '#5d6388', 0.7, 3.4, -1.6, 4.4, 0.4); L(c, '#5d6388', 0.7, 5.6, -1, 6, 0.8);
    poly(c, '#5a5d70', 9.6, -7.4, 17.8, -4.6, 10, -2.2); L(c, DARK, 0.7, 10.6, -4.8, 15.4, -4.7); B(c, 11.2, -6.2, 1.6, 0.6, '#8a8ea6', 0.3);
    B(c, 7.2, -6, 2.1, 2.1, '#fff'); B(c, 7.7, -6, 1.15, 1.15, DARK); B(c, 7.2, -6.5, 0.4, 0.4, '#fff'); L(c, DARK, 1.1, 5, -8.6, 9, -7.4);
  },
  dog(c, a) {
    const st = sin(a * 2) * 2.6, fur = '#dba561', far = shade(fur, -0.2), cream = '#f6e3c4';
    c.beginPath(); c.moveTo(-14, 1); c.bezierCurveTo(-23, -1, -24, -13 + st * 0.5, -16, -12.5 + st * 0.5); tube(c, fur, 4.2); B(c, -16.4, -12.4 + st * 0.5, 2.1, 2.1, cream);
    dleg(c, -10.5 - st, 10.5, far); dleg(c, 5.5 + st, 10.5, far);
    E(c, -2, 4, 15, 10.5, fur);
    clipE(c, -2, 4, 14.4, 10, 0, () => { B(c, 0, 13.4, 12, 5, cream); B(c, -7.5, -2, 5.5, 4, '#c2843f', 0.2); });
    dleg(c, -7 + st, 12, fur); dleg(c, 8 - st, 12, fur);
    c.beginPath(); c.ellipse(4.6, 1, 2.2, 6.4, 0.55, 0, TAU); c.fillStyle = '#e5484d'; c.fill(); ol(c, '#e5484d'); E(c, 6.6, 6.6, 1.9, 1.9, '#ffd84d', 0, true);
    poly(c, shade(fur, -0.25), 12.6, -13.6, 17.4, -14, 15.6, -8);
    E(c, 9.5, -6, 10, 9, fur);
    poly(c, '#b9763a', 0.4, -11.4, 5.6, -14, 3.6, -5, -1.8, -3.2); L(c, shade('#b9763a', -0.25), 0.7, 1.6, -10.4, 1.2, -5.2);
    E(c, 16.2, -2.4, 5.6, 4.5, cream);
    B(c, 20.2, -4.6, 2.2, 1.8, DARK); B(c, 19.6, -5.2, 0.6, 0.45, '#fff');
    L(c, DARK, 0.9, 20.2, -2.8, 19.8, -0.6, 16, 0.6); E(c, 16.6, 2.4, 2, 2.8, '#f58a94', 0, true); L(c, shade('#f58a94', -0.25), 0.6, 16.6, 1.2, 16.6, 3.8);
    eye(c, 9.6, -8.2, 1.8); eye(c, 14.2, -8.6, 1.6); L(c, DARK, 1.4, 6.6, -12, 10.8, -10.6); L(c, DARK, 1.4, 16, -12, 13.2, -10.8);
    L(c, shade(fur, -0.22), 0.7, 1.6, -2, 3.4, -0.6); L(c, shade(fur, -0.22), 0.7, 2, 0.6, 3.8, 1.6);
  },
  roomba(c, a) {
    const g = '#4d5266', s = sin(a * 2) * 2;
    for (const k of [-1, 1]) { L(c, '#c9cde0', 0.8, k * 12, 9, k * 16.5, 12 + s * k); L(c, '#c9cde0', 0.8, k * 11, 10.6, k * 14, 14.6 - s * k); L(c, '#c9cde0', 0.8, k * 12.6, 7.6, k * 17.4, 8.6 + s * k); }
    E(c, 0, 0, 15, 15, g);
    c.beginPath(); c.arc(0, 0, 12.6, Math.PI * 0.12, Math.PI * 0.88); c.strokeStyle = shade(g, -0.35); c.lineWidth = 1; c.stroke();
    E(c, 0, -1, 9, 9, '#6d7390'); L(c, shade('#6d7390', -0.3), 0.8, -8.4, 0.6, 8.4, 0.6);
    B(c, 0, 4.4, 1.7, 1.7, '#c9cde0'); B(c, cos(a) * 12.2, sin(a) * 12.2, 1.8, 1.8, '#7dff9a');
    flat(c, '#ff5a5a', -6.4, -5.2, -2, -3.8, -2, -1.6, -6.4, -2.4); flat(c, '#ff5a5a', 6.4, -5.2, 2, -3.8, 2, -1.6, 6.4, -2.4);
    B(c, -4.8, -4, 0.6, 0.5, '#ffd0d0'); B(c, 3.6, -3.4, 0.6, 0.5, '#ffd0d0');
  },
  raccoon(c, a) {
    const st = sin(a * 2) * 2, fur = '#9c9aa9', dk = '#4a4a5c', lt = '#cfcdd9';
    c.save(); c.translate(-14.5, 0.5 + st * 0.5); c.rotate(0.5); E(c, 0, 0, 5, 9.5, fur);
    clipE(c, 0, 0, 4.5, 9, 0, () => { c.fillStyle = dk; for (const y of [-7, -2.6, 1.8, 6.2]) c.fillRect(-6, y, 12, 2.2); }); c.restore();
    leg(c, -8 - st, 10, shade(dk, -0.15)); leg(c, 4 + st, 10, shade(dk, -0.15));
    E(c, -2, 4, 13, 10, fur); clipE(c, -2, 4, 12.4, 9.4, 0, () => B(c, 0, 12.4, 10, 4.4, lt));
    leg(c, -5 + st, 11, dk); leg(c, 7 - st, 11, dk);
    poly(c, fur, 1, -10, 2.4, -18, 8, -13); flat(c, dk, 2.8, -12, 3.2, -16, 6, -13.2);
    poly(c, fur, 11, -13, 15.6, -18, 16.6, -10); flat(c, dk, 12.6, -12.6, 15, -16, 15.6, -11.6);
    E(c, 9, -6, 10, 8.4, lt);
    clipE(c, 9, -6, 9.4, 7.8, 0, () => { B(c, 3.6, -6.4, 5.2, 3.2, dk, -0.25); B(c, 14.4, -6.4, 5.2, 3.2, dk, 0.25); B(c, 9, -12.6, 3, 5, fur); });
    for (const x of [5, 13.2]) { B(c, x, -6.4, 1.7, 1.7, '#fff'); B(c, x + 0.3, -6.4, 0.95, 0.95, DARK); }
    E(c, 9.6, -1.6, 4, 3, '#f4f3f8', 0, true); B(c, 9.6, -3, 1.6, 1.2, DARK); L(c, DARK, 0.8, 9.6, -1.8, 9.6, -0.8, 8, 0); L(c, DARK, 0.8, 9.6, -0.8, 11.2, 0);
    L(c, 'rgba(42,35,48,.5)', 0.5, 12.6, -1.6, 18, -2.6); L(c, 'rgba(42,35,48,.5)', 0.5, 12.6, -0.8, 18.2, 0);
  },
  dust(c, a) {
    const col = '#aaa5b8';
    c.save(); c.rotate(a); c.beginPath(); for (let i = 0; i < 18; i++) { const q = i / 18 * TAU, r = i % 2 ? 6.4 : 9.8; c.lineTo(cos(q) * r, sin(q) * r); } c.closePath(); c.fillStyle = col; c.fill(); ol(c, col); c.restore();
    c.globalAlpha = 0.6; B(c, -2.4, -3, 3.6, 2.2, '#cbc7d6', -0.4); B(c, 2.6, 3.4, 4, 2.4, '#8f8a9e', -0.4); c.globalAlpha = 1;
    L(c, '#8a8598', 0.8, -5.4, 3, -3.4, 4.6); L(c, '#8a8598', 0.8, 4, -4.6, 5.6, -3); B(c, -0.6, 5.2, 0.9, 0.7, '#f2c14e'); B(c, 4.6, 0.6, 0.7, 0.6, '#f58a94');
    eye(c, -2.6, 0, 1.5); eye(c, 2.6, 0, 1.5); brows(c, -2.6, 2.6, -2.6, 0.8);
  },
  /* ── 재래시장 ── */
  fly(c, a) {
    const f = 0.4 + abs(sin(a * 3)) * 0.6;
    L(c, DARK, 0.7, -2, 4, -4, 7.2); L(c, DARK, 0.7, 0.6, 4.6, 0.6, 7.6); L(c, DARK, 0.7, 3, 4, 5.4, 6.8);
    c.globalAlpha = 0.82; E(c, -4, -5, 3, 6 * f, '#eef3ff', -0.5, true); E(c, 3, -5, 3, 6 * f, '#eef3ff', 0.5, true); c.globalAlpha = 1;
    E(c, -1, 1.5, 5.5, 4.2, '#4d4d5e'); clipE(c, -1, 1.5, 5, 3.8, 0, () => { L(c, '#7a7a8e', 0.9, -3.4, -3, -3.4, 6); L(c, '#7a7a8e', 0.9, -0.8, -3, -0.8, 6); });
    E(c, 4, 0, 3.4, 3.2, '#3d3d49'); B(c, 5, -1, 1.9, 2.1, '#e5484d'); B(c, 4.5, -1.7, 0.55, 0.55, '#fff');
  },
  chili(c, a) {
    c.translate(0, -abs(sin(a)) * 3); c.rotate(0.25);
    S(c, () => { c.beginPath(); c.moveTo(-5, -8); c.bezierCurveTo(-8.6, 2, -3, 10, 3, 12.6); c.bezierCurveTo(7.4, 6, 7, -2, 5, -8); c.closePath(); }, '#f0483e', () => B(c, -2.8, -2, 1.1, 5, '#ff9a92', 0.15));
    c.beginPath(); c.moveTo(0, -9); c.quadraticCurveTo(0.4, -12.6, 3.2, -14.4); tube(c, '#5aa74d', 1.6);
    poly(c, '#6fbf5f', -5.6, -8, -2.6, -10.4, 0, -8.6, 2.6, -10.6, 5.6, -8, 2.4, -6.6, 0, -5.4, -2.4, -6.6);
    eye(c, -2, -1.2, 1.5); eye(c, 3, -1.2, 1.5); brows(c, -2, 3, -3.8, 0.85); L(c, DARK, 0.9, -1.4, 3.4, 0.4, 2.6, 2.4, 3.4);
  },
  chick(c, a) {
    const b = sin(a * 2), y = '#ffe066', dk = '#f5cf3a';
    birdLegs(c, -3, 3, 9, b, 4);
    poly(c, dk, -8, 0, -12.6, -2.6, -9, 3.6);
    E(c, 0, 1, 9.6, 9, y); E(c, -3.6, 3.2, 4.4, 3.2, dk, 0.2); L(c, shade(dk, -0.25), 0.6, -6.4, 3.6, -2, 4.6);
    L(c, dk, 1.6, -1, -8, -2.2, -11.6); L(c, dk, 1.6, 0.6, -8.2, 0.8, -12.4); L(c, dk, 1.6, 2.2, -8, 3.8, -11);
    poly(c, ORG, 8, -2.4, 14, -0.2, 8, 1.8); L(c, shade(ORG, -0.3), 0.6, 8.4, -0.3, 12.8, -0.2);
    eye(c, 4.2, -3, 1.8); L(c, DARK, 1.2, 1.8, -6.2, 6, -5); B(c, 5.6, 0.6, 1.6, 1, 'rgba(255,110,125,.45)');
  },
  crab(c, a) {
    const s = sin(a * 2) * 2, sh = '#f26b4c';
    for (const k of [-1, 1]) for (let i = 0; i < 3; i++) { const w = s * k * (i % 2 ? 1 : -1); limb(c, sh, 1.4, k * (7 + i * 1.4), 5 + i * 1.5, k * (13 + i), 7 + i * 2.2 + w, k * (15 + i), 11 + i * 1.8 + w); }
    for (const k of [-1, 1]) {
      const y = s * k; limb(c, sh, 2, k * 9, -1, k * 12.6, -5 + y);
      poly(c, sh, k * 11, -9.4 + y, k * 17.4, -12.4 + y, k * 15.6, -7.6 + y); poly(c, sh, k * 12, -6 + y, k * 18.4, -7 + y, k * 15, -3.4 + y); E(c, k * 12.6, -6.4 + y, 2.6, 2.6, sh, 0, true);
    }
    E(c, 0, 2, 11.4, 8, sh);
    clipE(c, 0, 2, 11, 7.6, 0, () => { B(c, 0, 9.6, 9, 3, '#ffd9c2'); B(c, -5, -1, 1.3, 1, '#ff9f85'); B(c, 4.4, -2, 1.2, 0.9, '#ff9f85'); B(c, 0, 0.4, 1, 0.8, '#ff9f85'); });
    for (const x of [-3.2, 3.2]) { limb(c, sh, 1.2, x, -5, x * 1.06, -10); E(c, x * 1.06, -11.2, 2.1, 2.1, '#ffffff', 0, true); B(c, x * 1.06 + 0.3, -11, 1, 1.2, DARK); L(c, DARK, 1, x * 1.06 + 2.2 * Math.sign(x), -13.8, x * 1.06 - 1.6 * Math.sign(x), -12.6); }
    L(c, DARK, 0.9, -3, 4.8, -1, 3.8, 1, 4.8, 3, 3.8);
  },
  squid(c, a) {
    const s = sin(a * 2), pk = '#ffb3c7', dk = '#ff9db8';
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 2.6, 6); c.quadraticCurveTo(i * 3 + s * 2, 10.6, i * 3.8, 14 + abs(s) * 2); tube(c, i % 2 ? dk : pk, 1.5); }
    poly(c, dk, -6, -9, -12.4, -6, -7, -2); poly(c, dk, 6, -9, 12.4, -6, 7, -2);
    S(c, () => { c.beginPath(); c.moveTo(0, -16.4); c.quadraticCurveTo(-9.6, -8, -7.6, 2); c.lineTo(7.6, 2); c.quadraticCurveTo(9.6, -8, 0, -16.4); c.closePath(); }, pk, () => { B(c, -3.6, -6, 1.1, 4, '#ffdbe6', 0.2); B(c, 2.6, -10, 1, 0.8, '#ff8fae'); B(c, 3.6, -4.6, 0.9, 0.7, '#ff8fae'); B(c, -1, -11.6, 0.8, 0.7, '#ff8fae'); });
    E(c, 0, 3.6, 7.4, 5.4, pk);
    eye(c, -3, 3.4, 1.9, '#ffffff'); eye(c, 3, 3.4, 1.9, '#ffffff'); brows(c, -3, 3, 0.6, 0.8);
  },
  tofu(c, a) {
    c.scale(1 + sin(a) * 0.05, 1 - sin(a) * 0.05);
    poly(c, '#fffdf5', -10.6, -8.6, -7.4, -12.4, 13, -12.4, 10.8, -8.6); poly(c, '#eadcb8', 10.8, -8.6, 13, -12.4, 13, 7.4, 10.8, 11);
    B(c, -1, -10.5, 1.6, 0.9, '#7fcf68'); B(c, 3.6, -10.6, 1.4, 0.8, '#8fe08a'); B(c, 7, -10.2, 1.2, 0.7, '#7fcf68');
    S(c, () => rr(c, -11, -9, 22, 20, 3), '#fff8e6', () => { c.fillStyle = '#f1e6c8'; c.fillRect(-12, 6.4, 24, 6); B(c, -6, -5.4, 3, 1.4, '#ffffff'); });
    flat(c, '#8a5a36', -8, -9, -3, -9, -3.4, -5.6, -4.8, -3.8, -6.4, -5.6); B(c, -5.6, -8.4, 0.8, 0.4, '#b98458');
    eye(c, -4, 0.4, 1.7); eye(c, 4, 0.4, 1.7); brows(c, -4, 4, -2.4); L(c, DARK, 0.9, -2, 5.4, 2, 5.4);
    B(c, -7, 3.6, 1.6, 1, 'rgba(255,110,125,.35)'); B(c, 7, 3.6, 1.6, 1, 'rgba(255,110,125,.35)');
  },
  onion(c, a) {
    c.translate(0, -abs(sin(a)) * 2.5); const p = '#d9a6e8', ln = '#b77fcb';
    c.beginPath(); c.moveTo(-0.6, -9); c.quadraticCurveTo(-2.4, -13, -5, -17); tube(c, '#6fbf5f', 1.8);
    c.beginPath(); c.moveTo(0.6, -9); c.quadraticCurveTo(1.6, -13, 4, -16); tube(c, '#8fe08a', 1.8);
    L(c, '#c9a85a', 0.7, -2, 13, -3, 15.8); L(c, '#c9a85a', 0.7, 0, 13.2, 0, 16.2); L(c, '#c9a85a', 0.7, 2, 13, 3, 15.8);
    S(c, () => { c.beginPath(); c.moveTo(0, -11.4); c.bezierCurveTo(-18, -4, -12, 13.4, 0, 13.4); c.bezierCurveTo(12, 13.4, 18, -4, 0, -11.4); c.closePath(); }, p, () => {
      c.strokeStyle = ln; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, -11); c.bezierCurveTo(-9.6, -3, -7.4, 10, -2, 13); c.moveTo(0, -11); c.bezierCurveTo(9.6, -3, 7.4, 10, 2, 13); c.moveTo(0, -11); c.lineTo(0, -6); c.stroke();
      B(c, -6.4, -1, 1.5, 4.6, '#f1d6f8', 0.2);
    });
    eye(c, -3.6, 1, 1.8); eye(c, 3.6, 1, 1.8); brows(c, -3.6, 3.6, -1.6); B(c, -5.8, 4.6, 0.9, 1.5, '#8fd0ff'); L(c, DARK, 0.9, -2, 6.8, -0.6, 5.8, 0.8, 6.8, 2, 5.8);
  },
  puffer(c, a) {
    const k = 1 + sin(a) * 0.06; c.scale(k, k); const y = '#ffe08a', fin = '#f5b84a';
    poly(c, fin, -12, -1, -19.4, -5.4, -17, 0, -19.4, 5.4);
    for (let i = 0; i < 12; i++) { const q = i / 12 * TAU + 0.26; poly(c, '#fff1c4', cos(q - 0.12) * 12.4, sin(q - 0.12) * 12.4, cos(q) * 17, sin(q) * 17, cos(q + 0.12) * 12.4, sin(q + 0.12) * 12.4); }
    E(c, 0, 0, 13, 13, y);
    clipE(c, 0, 0, 12.5, 12.5, 0, () => { B(c, 1, 8, 11, 7.6, '#fffaf0'); for (const [x, yy] of [[-5, -7], [-1, -9.6], [4, -8.4], [-8.4, -3], [8, -5.4]]) B(c, x, yy, 1.5, 1.1, '#e0a030'); });
    eye(c, -3.4, -3, 2.1, '#ffffff'); eye(c, 5.4, -3, 2.1, '#ffffff'); brows(c, -3.4, 5.4, -6.2);
    E(c, 1.6, 4.2, 2.7, 2, '#ff8a7a', 0, true); L(c, shade('#ff8a7a', -0.35), 0.6, -0.6, 4.2, 3.8, 4.2);
  },
  /* ── 공원 ── */
  bee(c, a) {
    const f = 0.4 + abs(sin(a * 3)) * 0.6, y = '#ffd447';
    L(c, DARK, 0.7, -2, 7, -2.6, 9.8); L(c, DARK, 0.7, 1.6, 7.2, 1.6, 10);
    c.globalAlpha = 0.82; E(c, -2, -7, 3.6, 6 * f, '#eef6ff', -0.4, true); E(c, 3, -7, 3.6, 6 * f, '#eef6ff', 0.4, true); c.globalAlpha = 1;
    poly(c, '#4a4a5c', -7.8, -0.6, -12.6, 1, -7.8, 2.6);
    E(c, 0, 1, 8.2, 6.6, y); clipE(c, 0, 1, 7.8, 6.2, 0, () => { c.fillStyle = '#3d3d49'; c.fillRect(-5, -6, 2.4, 14); c.fillRect(-0.8, -6, 2.4, 14); });
    E(c, 6, 0.6, 3.7, 3.9, '#f2b632');
    L(c, DARK, 0.8, 6.4, -2.8, 8.2, -6.4); L(c, DARK, 0.8, 8, -2.2, 10.6, -5.4); B(c, 8.4, -6.8, 0.9, 0.9, DARK); B(c, 10.8, -5.8, 0.9, 0.9, DARK);
    eye(c, 7, 0.2, 1.5); L(c, DARK, 1, 5, -2, 8.6, -1.2);
  },
  squirrel(c, a) {
    const s = sin(a * 2), fur = '#c9824a', dk = '#a8683a', cream = '#f4d9a8';
    c.save(); c.rotate(s * 0.05);
    S(c, () => { c.beginPath(); c.moveTo(-5, 7); c.bezierCurveTo(-18, 9, -20, -8, -12, -14.4); c.bezierCurveTo(-6, -17.4, -2.6, -10, -8, -7); c.bezierCurveTo(-11, -3, -9, 2, -5, 3); c.closePath(); }, dk, () => B(c, -12.4, -4, 2.6, 8, '#c98a55', -0.2));
    c.restore();
    E(c, -3 + s, 10.4, 3, 2.3, shade(fur, -0.2), 0, true); E(c, 4 - s, 10.4, 3, 2.3, shade(fur, -0.2), 0, true);
    E(c, 0, 3, 8, 7.6, fur); clipE(c, 0, 3, 7.6, 7.2, 0, () => B(c, 2.6, 5.4, 4.6, 6, cream));
    E(c, 8.6, 3.6, 2.1, 2.5, '#b9763a', 0, true); B(c, 8.6, 1.9, 2.4, 1.2, '#7a4a24'); E(c, 6, 4, 2, 1.6, fur, 0, true);
    poly(c, fur, 2.4, -9, 4.4, -14.6, 8, -9.4); flat(c, PINK, 3.8, -10, 4.8, -13, 6.8, -10);
    E(c, 6, -5, 6.2, 5.6, fur); clipE(c, 6, -5, 5.8, 5.2, 0, () => B(c, 9, -2.4, 4, 3, cream));
    eye(c, 6.4, -6, 1.7); B(c, 11.8, -4.2, 1, 0.8, DARK); L(c, DARK, 1.1, 4.4, -8.6, 8.4, -7.6); L(c, 'rgba(42,35,48,.5)', 0.5, 10.6, -3.4, 14.6, -3);
  },
  frog(c, a) {
    const hop = abs(sin(a)); c.translate(0, -hop * 5); const g = '#7fcf68', dk = '#5aa74d';
    for (const k of [-1, 1]) { E(c, k * 8.6, 6.4, 5, 3.4, dk, k * 0.3); poly(c, dk, k * 12, 9, k * 15.4, 11.8, k * 9.6, 10.8); }
    E(c, 0, 3, 11.4, 8.2, g);
    clipE(c, 0, 3, 11, 7.8, 0, () => { B(c, 0, 9.4, 9, 4.4, '#e6f5c8'); B(c, -5.4, -0.6, 1.6, 1.2, dk); B(c, 4.4, 0.4, 1.4, 1, dk); B(c, -1, -3, 1.2, 0.9, dk); });
    E(c, -5, -5, 4.2, 4.2, g); E(c, 5, -5, 4.2, 4.2, g); eye(c, -5, -5.2, 2.6, '#ffe066'); eye(c, 5, -5.2, 2.6, '#ffe066');
    L(c, DARK, 1.1, -8.4, -8.8, -3.4, -7.6); L(c, DARK, 1.1, 8.4, -8.8, 3.4, -7.6);
    c.beginPath(); c.moveTo(-7, 3.4); c.quadraticCurveTo(0, 7.4, 7, 3.4); c.strokeStyle = DARK; c.lineWidth = 0.9; c.stroke(); B(c, -1.4, 0.6, 0.5, 0.4, DARK); B(c, 1.4, 0.6, 0.5, 0.4, DARK);
    E(c, -4.6, 10.6, 2.6, 1.4, dk, 0, true); E(c, 4.6, 10.6, 2.6, 1.4, dk, 0, true);
  },
  mole(c, a) {
    const s = sin(a * 2) * 1.5, fur = '#8a6a55';
    E(c, 0, 10, 13.4, 4.2, '#6b4b3a'); B(c, -8, 8.4, 1.6, 1.2, '#8a6a55'); B(c, 7, 9, 1.4, 1, '#8a6a55'); B(c, 3, 11.8, 1.2, 0.8, '#4f3628');
    E(c, 0, 2, 10, 9.6, fur); clipE(c, 0, 2, 9.6, 9.2, 0, () => B(c, 0, 8.4, 7, 4, '#a88670'));
    for (const k of [-1, 1]) { const y = 4 + s * k; E(c, k * 9, y, 3.6, 2.8, PINK); limb(c, '#ffffff', 0.9, k * 10.6, y - 1.4, k * 12.8, y - 2.4); limb(c, '#ffffff', 0.9, k * 11.4, y, k * 13.8, y); limb(c, '#ffffff', 0.9, k * 10.6, y + 1.4, k * 12.8, y + 2.6); }
    E(c, 1.5, 1.6, 4.4, 3.4, '#b8937c', 0, true); E(c, 3, 0.6, 2.4, 2, '#f28a94', 0, true);
    L(c, DARK, 1, -4.4, -2.6, -1.6, -2); L(c, DARK, 1, 5.8, -2, 8.2, -2.6);
    S(c, () => { c.beginPath(); c.moveTo(-7.4, -4.6); c.bezierCurveTo(-7.4, -13.4, 7.4, -13.4, 7.4, -4.6); c.closePath(); }, '#ffd447', () => B(c, -3.4, -9.6, 2.4, 1.2, '#fff3b0', -0.4));
    L(c, ST.ink, 2.6, -8.6, -4.6, 8.6, -4.6); L(c, '#f2b632', 1.4, -8.6, -4.6, 8.6, -4.6); E(c, 0, -8.4, 1.9, 1.9, '#fff8c9', 0, true);
    L(c, 'rgba(42,35,48,.5)', 0.5, 5.4, 2, 9.6, 1.4); L(c, 'rgba(42,35,48,.5)', 0.5, 5.4, 2.8, 9.4, 3.4);
  },
  hedgehog(c, a) {
    const s = sin(a * 2), sp = '#7a5a48', sk = '#f4d9b4';
    S(c, () => { c.beginPath(); for (let i = 0; i <= 11; i++) { const q = Math.PI * 0.95 + i / 11 * Math.PI * 1.22; c.lineTo(-2 + cos(q) * (i % 2 ? 9.4 : 14.4), 2 + sin(q) * (i % 2 ? 8.4 : 13.4)); } c.lineTo(9, 8); c.lineTo(-10, 9.4); c.closePath(); }, sp, () => {
      for (const [x, y] of [[-7, -2], [-3, -5], [1, -5.4], [-5, 2.6], [-1, -0.6], [3, -1.6], [-8.6, 3.6]]) L(c, '#a88670', 0.8, x, y, x - 1.4, y - 2.6);
    });
    E(c, -4 + s, 11, 2.8, 2, '#e8c39a', 0, true); E(c, 4 - s, 11, 2.8, 2, '#e8c39a', 0, true);
    E(c, 5.6, 5, 8, 5.6, sk); E(c, 2.6, 0.8, 2.2, 2.2, '#e8c39a', 0, true);
    B(c, 13.2, 4.4, 1.5, 1.3, DARK); eye(c, 8.4, 3, 1.6); L(c, DARK, 1, 6.4, 0.8, 10, 1.6); B(c, 7, 6.6, 1.6, 1, 'rgba(255,110,125,.4)'); L(c, DARK, 0.7, 11, 6.6, 12.6, 6.2);
  },
  goose(c, a) {
    const s = sin(a * 2), w = '#ffffff';
    for (const [x, dx] of [[-4, s * 2], [3, -s * 2]]) { L(c, ST.ink, 2.8, x, 11, x + dx, 15.6); L(c, ORG, 1.6, x, 11, x + dx, 15.6); poly(c, ORG, x + dx - 2.8, 17.2, x + dx, 15, x + dx + 3.4, 17.2); }
    poly(c, '#e6e9f2', -12, 0, -17.4, -3, -13, 4.4);
    E(c, -2, 4, 12.4, 9, w); E(c, -4.6, 4.4, 7.4, 5, '#e6e9f2', 0.1);
    L(c, '#b9bfd0', 0.7, -9.4, 3.4, -2, 4.6); L(c, '#b9bfd0', 0.7, -8.8, 5.6, -2.4, 6.6); L(c, '#b9bfd0', 0.7, -7, 7.6, -3, 8.2);
    c.beginPath(); c.moveTo(6, 1); c.quadraticCurveTo(7.4, -8, 9 + s, -14); tube(c, w, 4.6);
    E(c, 10.4 + s, -15, 5, 4.4, w);
    poly(c, ORG, 13.6 + s, -17, 20.6 + s, -14.6, 13.6 + s, -12.2); L(c, DARK, 0.6, 14 + s, -14.5, 19.6 + s, -14.6); B(c, 13.8 + s, -17.2, 1.4, 1.1, ORG);
    eye(c, 10 + s, -15.4, 1.5); L(c, DARK, 1.2, 7.8 + s, -18, 12 + s, -16.8);
  },
  snail(c, a) {
    const s = sin(a) * 1.5, sk = '#f4e3c3', sh = '#e0a070';
    c.globalAlpha = 0.5; B(c, -14, 13.4, 5, 1.2, '#dff3ff'); c.globalAlpha = 1;
    S(c, () => { c.beginPath(); c.moveTo(-10, 9.6); c.quadraticCurveTo(-12.6, 13.4, -6, 13.4); c.lineTo(15 + s, 13.4); c.quadraticCurveTo(19.6 + s, 12.6, 17.8 + s, 8); c.quadraticCurveTo(16 + s, 5, 12.6 + s, 7.4); c.lineTo(4, 8); c.closePath(); }, sk);
    for (const [x, ty] of [[13.6, 0.4], [16.6, 2]]) { limb(c, sk, 1.3, x + s, 7.2, x + 1.4 + s, ty); E(c, x + 1.4 + s, ty - 1, 1.9, 1.9, '#ffffff', 0, true); B(c, x + 1.8 + s, ty - 1, 0.9, 1, DARK); }
    L(c, DARK, 1, 13 + s, -3.4, 16.6 + s, -2.4); L(c, DARK, 0.8, 14.6 + s, 10.6, 16.8 + s, 10);
    E(c, -2, -1, 10.6, 10.6, sh);
    c.strokeStyle = '#a86a3c'; c.lineWidth = 1.1; c.beginPath(); c.arc(-2, -1, 7, 0.4, 5.4); c.stroke(); c.beginPath(); c.arc(-1.4, -1, 3.6, 1, 5.8); c.stroke(); B(c, -1, -1, 1.2, 1.2, '#a86a3c');
  },
  mantis(c, a) {
    const s = sin(a * 2), g = '#8fe08a', dk = '#5fb357';
    limb(c, dk, 1.2, -3, 6, -7, 9, -9, 13.6 + s); limb(c, dk, 1.2, 0, 7, 3, 10, 2, 14 - s);
    E(c, -4, 3, 4.6, 10.6, g, 0.55); L(c, dk, 0.7, -8.6, 7.4, -1.4, -1.6);
    c.beginPath(); c.moveTo(0, -1); c.lineTo(4, -7); tube(c, g, 3);
    limb(c, g, 2, 2, -4, 8.6, -8 + s * 2, 13.6, -2.4 + s * 2);
    for (let i = 0; i < 3; i++) L(c, DARK, 0.6, 9.6 + i * 1.5, -6.6 + s * 2 + i * 1.7, 10.8 + i * 1.5, -7.4 + s * 2 + i * 1.7);
    L(c, DARK, 0.7, 3, -12.6, 1, -17.6); L(c, DARK, 0.7, 6, -13.6, 8.6, -18);
    poly(c, g, 0.6, -9.4, 8.4, -13.4, 5.4, -5);
    E(c, 1.6, -10.4, 2.2, 2.4, '#ffe066', 0, true); B(c, 2, -10.4, 0.8, 1.1, DARK); E(c, 7.4, -12.2, 2.2, 2.4, '#ffe066', 0, true); B(c, 7.8, -12.2, 0.8, 1.1, DARK);
  },
  /* ── 달빛 옥상 ── */
  moth(c, a) {
    const f = 0.35 + abs(sin(a * 2)) * 0.65, w = '#eadcc4';
    for (const k of [-1, 1]) {
      E(c, k * 5.4 * f, 5, 5 * f, 4.6, '#d9c7a8', k * -0.2); E(c, k * 7 * f, -3, 7.4 * f, 7, w, k * 0.2);
      B(c, k * 7 * f, -3, 2.6 * f, 2.6, '#b9a48c'); B(c, k * 7 * f, -3, 1.2 * f, 1.2, '#4a4a5c'); L(c, '#c9b594', 0.7, k * 2, -5.6, k * 12 * f, -8);
      c.beginPath(); c.moveTo(k * 1, -8.6); c.quadraticCurveTo(k * 3, -12.8, k * 5.8, -12.6); c.strokeStyle = DARK; c.lineWidth = 0.8; c.stroke();
    }
    E(c, 0, 0.6, 3.6, 7.6, '#b9a48c'); clipE(c, 0, 0.6, 3.2, 7.2, 0, () => { L(c, '#8f7a62', 1, -4, 2, 4, 2); L(c, '#8f7a62', 1, -4, 4.8, 4, 4.8); });
    E(c, 0, -7, 2.8, 2.4, '#a8937a', 0, true); B(c, -1.2, -7, 0.7, 0.7, DARK); B(c, 1.2, -7, 0.7, 0.7, DARK);
  },
  bat(c, a) {
    const f = sin(a * 2), p = '#6f5e94', mem = '#8d7bb5';
    for (const k of [-1, 1]) {
      c.beginPath(); c.moveTo(k * 4, -1); c.lineTo(k * 18, -8 * f - 3); c.quadraticCurveTo(k * 15, -f, k * 16.5, 4 - 2 * f); c.quadraticCurveTo(k * 12.6, 2, k * 11.6, 6.4 - f); c.quadraticCurveTo(k * 8, 3.4, k * 5, 5); c.closePath(); c.fillStyle = mem; c.fill(); ol(c, mem);
      L(c, shade(mem, -0.3), 0.7, k * 4.4, -0.6, k * 16.5, 4 - 2 * f); L(c, shade(mem, -0.3), 0.7, k * 4.4, -0.6, k * 11.6, 6.4 - f);
      poly(c, p, k * 5, -5, k * 4.4, -12, k * 1, -6.4); flat(c, PINK, k * 4.2, -6.4, k * 4, -10, k * 2.2, -6.8);
    }
    L(c, DARK, 0.7, -2, 6.4, -2, 8.6); L(c, DARK, 0.7, 2, 6.4, 2, 8.6);
    E(c, 0, 0, 6.6, 6.6, p); clipE(c, 0, 0, 6.2, 6.2, 0, () => B(c, 0, 4.4, 4, 3.4, mem));
    eye(c, -2.6, -1, 1.6, '#ffe066'); eye(c, 2.6, -1, 1.6, '#ffe066'); B(c, 0, 1.4, 1, 0.7, PINK);
    flat(c, '#fff', -1.6, 3, -0.9, 5.4, -0.2, 3); flat(c, '#fff', 0.2, 3, 0.9, 5.4, 1.6, 3); L(c, DARK, 0.7, -2, 3, 2, 3);
  },
  spider(c, a) {
    const s = sin(a * 2) * 2, b = '#4d4d5e';
    L(c, 'rgba(255,255,255,.6)', 0.7, 0, -10, 0, -19);
    for (const k of [-1, 1]) for (let i = 0; i < 4; i++) { const w = i % 2 ? s : -s; limb(c, b, 1.3, k * 5, i * 2 - 1, k * 12, i * 4 - 8 + w, k * 15.5, i * 5 - 2.6 + w); }
    E(c, 0, 3.4, 8, 7.6, b); flat(c, '#e5484d', -2.4, 0.8, 2.4, 0.8, 0, 3.6); flat(c, '#e5484d', -2.4, 6.4, 2.4, 6.4, 0, 3.6);
    E(c, 0, -5.6, 5, 4.2, '#3d3d49');
    for (const [x, y, r] of [[-2, -6, 1.4], [2, -6, 1.4], [-3.8, -7.8, 0.7], [3.8, -7.8, 0.7]]) { B(c, x, y, r, r, '#ff5a5a'); B(c, x - r * 0.3, y - r * 0.3, r * 0.3, r * 0.3, '#fff'); }
    L(c, '#ffffff', 1, -1.2, -2.6, -1.6, -0.6); L(c, '#ffffff', 1, 1.2, -2.6, 1.6, -0.6);
  },
  drone(c, a) {
    c.translate(0, sin(a) * 1.5); const f = abs(sin(a * 3)), w = '#d3d9e8';
    limb(c, '#8b8fa3', 1.6, -6, -2, -12, -7); limb(c, '#8b8fa3', 1.6, 6, -2, 12, -7);
    E(c, -12, -7.4, 1.8, 1.4, '#565b70', 0, true); E(c, 12, -7.4, 1.8, 1.4, '#565b70', 0, true);
    c.globalAlpha = 0.75; E(c, -12, -9, 3 + 5 * f, 1.6, '#ffffff', 0, true); E(c, 12, -9, 3 + 5 * (1 - f), 1.6, '#ffffff', 0, true); c.globalAlpha = 1;
    L(c, DARK, 0.9, -7, 5.6, -8.6, 10, -4, 10); L(c, DARK, 0.9, 7, 5.6, 8.6, 10, 4, 10); L(c, DARK, 0.7, 5, -4.4, 7, -8); B(c, 7, -8.2, 0.8, 0.8, '#ff5a5a');
    S(c, () => rr(c, -9, -4.4, 18, 10.4, 4), w, () => { c.fillStyle = '#b9c0d4'; c.fillRect(-10, 3, 20, 3.4); B(c, -4, -2.6, 3, 0.9, '#ffffff'); });
    L(c, '#ff5a5a', 1.2, -6, -1.4, -2.6, -0.4); L(c, '#ff5a5a', 1.2, 6, -1.4, 2.6, -0.4);
    E(c, 0, 5.6, 3.8, 3.4, '#3d3d49'); B(c, 0, 5.8, 2, 2, '#ff5a5a'); B(c, -0.6, 5.2, 0.6, 0.6, '#fff');
  },
  weasel(c, a) {
    const s = sin(a * 2) * 2.5, fur = '#d9a66b', dk = '#b9844f', cream = '#fff3dc';
    c.beginPath(); c.moveTo(-14, 4); c.quadraticCurveTo(-22, 2 + s, -22.6, -5); tube(c, dk, 3.6); B(c, -22.6, -5.2, 1.9, 1.9, '#4a3a2e');
    E(c, -10 - s, 9.4, 3, 2.2, shade(fur, -0.25), 0, true); E(c, 5 + s, 9.4, 3, 2.2, shade(fur, -0.25), 0, true);
    E(c, -2, 4, 14.4, 6, fur); clipE(c, -2, 4, 14, 5.6, 0, () => B(c, -1, 8.6, 12, 3, cream));
    E(c, -7 + s, 10.4, 3.2, 2.3, dk, 0, true); E(c, 7 - s, 10.4, 3.2, 2.3, dk, 0, true);
    E(c, 9.6, -5.6, 2.4, 2.6, dk); B(c, 9.8, -5.4, 1.3, 1.5, PINK);
    E(c, 12, -1, 6.2, 5, fur); clipE(c, 12, -1, 5.8, 4.6, 0, () => { B(c, 15.4, 1.8, 4.4, 3, cream); B(c, 12.6, -2.4, 3, 2, '#c08d55'); });
    eye(c, 13, -2.2, 1.5); B(c, 17.8, -0.4, 1.2, 1, DARK); L(c, DARK, 1.1, 11, -4.6, 14.6, -3.6); L(c, DARK, 0.7, 15.4, 1.6, 17.4, 1.2);
    L(c, 'rgba(42,35,48,.5)', 0.5, 16.6, 0.4, 20.6, -0.6); L(c, 'rgba(42,35,48,.5)', 0.5, 16.6, 1, 20.8, 1.6);
  },
  owl(c, a) {
    const s = sin(a * 2), br = '#9a7b5a', dk = '#7a5f44';
    for (const k of [-1, 1]) { L(c, ORG, 1.2, k * 3, 14, k * 3, 16.4); L(c, ORG, 1, k * 3 - 1.6, 17, k * 3, 16, k * 3 + 1.6, 17); }
    E(c, -10.4, 3, 4.2, 9 + s, dk, 0.3); E(c, 10.4, 3, 4.2, 9 + s, dk, -0.3);
    L(c, shade(dk, -0.3), 0.7, -11.6, 2, -10.4, 8); L(c, shade(dk, -0.3), 0.7, 11.6, 2, 10.4, 8);
    poly(c, br, -8.4, -8.6, -7.4, -16.4, -2, -11); poly(c, br, 8.4, -8.6, 7.4, -16.4, 2, -11);
    E(c, 0, 2, 11.4, 13.2, br);
    clipE(c, 0, 2, 11, 12.8, 0, () => {
      B(c, 0, 8.6, 7.6, 8, '#ead6b4'); for (const y of [5, 8.4, 11.6]) { L(c, '#b99a6e', 0.8, -3.4, y, -1.9, y + 1.4, -0.4, y); L(c, '#b99a6e', 0.8, 0.4, y, 1.9, y + 1.4, 3.4, y); }
      B(c, -4.6, -4, 5.6, 5.6, '#c9a97e'); B(c, 4.6, -4, 5.6, 5.6, '#c9a97e');
    });
    eye(c, -4.6, -4, 3.5, '#ffd447'); eye(c, 4.6, -4, 3.5, '#ffd447'); L(c, DARK, 1.4, -8.8, -8.8, -1.6, -6.2); L(c, DARK, 1.4, 8.8, -8.8, 1.6, -6.2);
    poly(c, ORG, -1.8, -1, 1.8, -1, 0, 3.4);
  },
  /* ── 돌진하는 것들 (+x를 향해 그림) ── */
  scooter(c) {
    speed(c);
    c.beginPath(); c.arc(-12, 10, 6.4, Math.PI * 1.1, Math.PI * 1.75); c.strokeStyle = ST.ink; c.lineWidth = 2.6; c.stroke(); c.strokeStyle = '#8b8fa3'; c.lineWidth = 1.2; c.stroke();
    c.beginPath(); c.moveTo(-12, 8); c.lineTo(9, 8); tube(c, '#4d5266', 3); L(c, '#8b8fa3', 0.8, -9, 7.4, 5, 7.4);
    c.beginPath(); c.moveTo(10, 8); c.lineTo(14, -15); tube(c, '#5fd3b3', 3); L(c, '#b8f0df', 0.8, 10.6, 5, 13.4, -11);
    c.beginPath(); c.moveTo(9, -15.4); c.lineTo(19, -15.4); tube(c, '#3d3d49', 2.4); E(c, 15.6, -10.4, 1.8, 1.8, '#fff8c9', 0, true);
    wheel(c, -12, 10, 4.6); wheel(c, 12, 10, 4.6);
  },
  cart(c, a) {
    speed(c);
    c.beginPath(); c.moveTo(-14, -4); c.lineTo(-22, -12); tube(c, '#565b70', 2.4);
    E(c, -6, -9, 5, 4.2, '#7fcf68'); L(c, '#5aa74d', 0.7, -8.6, -9, -3.4, -9); E(c, 3, -10, 4.6, 4, '#f26b4c'); E(c, 9.4, -8.4, 3.6, 3.4, '#ffd447');
    S(c, () => rr(c, -14, -8, 28, 15, 2), '#d9a66b', () => { L(c, '#a8743f', 0.8, -14, -3, 14, -3); L(c, '#a8743f', 0.8, -14, 2, 14, 2); for (const x of [-11.6, 11.6]) for (const y of [-5.6, -0.4, 4.6]) B(c, x, y, 0.6, 0.6, '#6b4b3a'); });
    wheel(c, -8, 11, 5, a); wheel(c, 8, 11, 5, a + 1);
  },
  mower(c, a) {
    speed(c); const sp = sin(a * 3) * 5;
    c.beginPath(); c.moveTo(-10, -2); c.lineTo(-22, -16); tube(c, '#565b70', 2.4); L(c, ST.ink, 4.4, -20.6, -14.4, -23.6, -17.8); L(c, '#3d3d49', 2.4, -20.6, -14.4, -23.6, -17.8);
    poly(c, '#3d3d49', 13, -3, 19.4, -1, 19.4, 9, 13, 8); L(c, '#e6e9f2', 1.4, 16, 3.4 + sp, 21.6, 3.4 - sp);
    B(c, 23.4, -4 + sp * 0.4, 1, 0.6, '#7fcf68'); B(c, 25.6, 2 - sp * 0.3, 0.9, 0.5, '#8fe08a'); B(c, 22.6, 7, 0.8, 0.5, '#7fcf68');
    S(c, () => rr(c, -13, -4, 26, 12, 3), '#f0605f', () => { c.fillStyle = '#ffffff'; c.fillRect(-14, 1, 28, 1.6); B(c, -7, -2, 4, 1, '#ff9c96'); });
    S(c, () => rr(c, -5, -10, 11, 7, 2), '#565b70'); E(c, 0.5, -10.6, 2, 1.2, '#ffd447', 0, true); L(c, '#8b8fa3', 0.8, -3, -7, 4, -7);
    wheel(c, -9, 10, 4.6, a); wheel(c, 9, 10, 4.6, a + 1);
  },
  firework(c, a) {
    const f = abs(sin(a * 3));
    B(c, -17 - f * 4, 0, 3 + f * 2, 2.4 + f, '#ffd447'); B(c, -22 - f * 3, -3, 2, 1.6, ORG); B(c, -23, 4, 1.4, 1.2, '#ffffff'); B(c, -27 - f * 2, 0.6, 1.2, 1, '#ff8a7a');
    L(c, '#b9844f', 1.2, -12, 2.6, -22, 6.4); L(c, DARK, 0.8, -12, -1, -15, -3);
    S(c, () => rr(c, -12, -5, 20, 10, 2), '#f0605f', () => { c.fillStyle = '#ffffff'; for (const x of [-8.6, -2.6]) c.fillRect(x, -6, 2.4, 12); B(c, -5, -3.4, 5, 0.9, '#ff9c96'); });
    S(c, () => { c.beginPath(); c.moveTo(8, -6.6); c.lineTo(17.6, 0); c.lineTo(8, 6.6); c.closePath(); }, '#ffd447', () => B(c, 10.4, -2.6, 2, 0.9, '#fff3b0', 0.6));
    eye(c, 3.6, -0.8, 1.4); L(c, DARK, 1.1, 1.6, -3.4, 5.4, -2.4);
  },
  /* ── 부술 수 있는 것 ── */
  trash(c) {
    poly(c, '#f4f6fb', -4, -9, -1.6, -16.4, 0, -11.6, 2, -16.8, 4, -9);
    S(c, () => { c.beginPath(); c.moveTo(-4, -9); c.bezierCurveTo(-14.6, -6, -15.4, 10, -9, 13.4); c.lineTo(9, 13.4); c.bezierCurveTo(15.4, 10, 14.6, -6, 4, -9); c.closePath(); }, '#eef2fb', () => {
      c.fillStyle = '#7cc4ff'; c.fillRect(-5.4, 0.6, 10.8, 1.7); c.fillRect(-3.8, 3.8, 7.6, 1.3); B(c, -7.6, -1, 1.6, 4.6, '#ffffff', 0.2);
      L(c, '#b9c2d8', 0.7, -3, -8, -5, -3); L(c, '#b9c2d8', 0.7, 3, -8, 6, -2); L(c, '#b9c2d8', 0.7, -9, 8, -4, 11);
    });
    L(c, ST.ink, 2.4, -3.6, -9.4, 3.6, -9.4); L(c, '#ffd447', 1.2, -3.6, -9.4, 3.6, -9.4);
  },
  crate(c) {
    S(c, () => rr(c, -12, -11, 24, 22, 2), '#d9a66b', () => { c.fillStyle = '#c58f52'; c.fillRect(-13, -4.8, 26, 1.2); c.fillRect(-13, 3.4, 26, 1.2); L(c, '#b9844f', 2.2, -9.6, -8.6, 9.6, 8.6); });
    c.strokeStyle = '#a8743f'; c.lineWidth = 1.2; c.strokeRect(-9.6, -8.6, 19.2, 17.2);
    for (const x of [-10.6, 10.6]) for (const y of [-9.6, 9.6]) B(c, x, y, 0.7, 0.7, '#6b4b3a');
    c.fillStyle = '#ffffff'; c.fillRect(1.4, -8, 7.6, 6); c.strokeStyle = ST.ink; c.lineWidth = 0.6; c.strokeRect(1.4, -8, 7.6, 6); B(c, 5.2, -5, 1.8, 1.8, '#e5484d'); L(c, '#5aa74d', 0.8, 5.2, -6.8, 6.2, -7.6);
  },
  pot(c) {
    E(c, -4.4, -9, 5, 7.4, '#6fbf5f', -0.4); L(c, '#4f9e45', 0.7, -2.6, -4.4, -6, -13); E(c, 4.4, -10, 5, 7.4, '#8fe08a', 0.4); L(c, '#5aa74d', 0.7, 2.6, -5, 6, -14);
    for (let i = 0; i < 5; i++) B(c, 0 + cos(i * 1.257) * 2.2, -14 + sin(i * 1.257) * 2.2, 1.5, 1.5, '#ff9fb0'); B(c, 0, -14, 1.1, 1.1, '#ffd447');
    S(c, () => { c.beginPath(); c.moveTo(-10, -3); c.lineTo(10, -3); c.lineTo(7, 11); c.lineTo(-7, 11); c.closePath(); }, '#e08a5a', () => B(c, -5, 3, 1.3, 5, '#f2ae88', 0.1));
    S(c, () => rr(c, -11.4, -6.4, 22.8, 5, 1.6), '#ee9d6e'); L(c, shade('#e08a5a', -0.3), 0.7, 3, 0.6, 4.4, 3.4, 3.4, 6);
  },
  /* ── 보스 ── */
  vacuum(c, a) {
    const red = '#f0605f', gr = '#565b70';
    for (const x of [-22, 22]) { E(c, x, 38, 9, 9, '#3d3d49'); B(c, x, 38, 3.6, 3.6, '#8b8fa3'); B(c, x, 38, 1.4, 1.4, '#3d3d49'); }
    c.beginPath(); c.arc(0, -22, 18, Math.PI, 0); tube(c, gr, 5); L(c, '#8b8fa3', 1, -13, -34, -4, -39.4);
    poly(c, gr, 28, -4, 62, -15, 62, 25, 28, 14); flat(c, DARK, 57.5, -13.4, 62, -15, 62, 25, 57.5, 22.4);
    for (const x of [35, 42.5, 50]) L(c, '#3d3d49', 1, x, -6.2 - (x - 28) * 0.3 + 2, x, 14 + (x - 28) * 0.3);
    E(c, 0, 5, 40, 36, red);
    clipE(c, 0, 5, 39.4, 35.4, 0, () => { B(c, 0, 42, 46, 14, shade(red, -0.25)); c.globalAlpha = 0.6; B(c, -17, -19, 11, 4, '#ffb0aa', -0.55); c.globalAlpha = 1; });
    c.beginPath(); c.arc(0, 5, 33.5, 0.3, Math.PI - 0.3); c.strokeStyle = shade(red, -0.3); c.lineWidth = 1; c.stroke();
    for (let i = 0; i < 3; i++) L(c, shade(red, -0.35), 1.5, -34 + i * 1.2, -1 + i * 4.2, -27.5 + i * 1.2, -1 + i * 4.2);
    E(c, 27, -13, 3.2, 3.2, '#7dff9a', 0, true);
    E(c, -2, 17, 22, 13, '#ffeab0');
    clipE(c, -2, 17, 21.4, 12.4, 0, () => {
      for (let i = 0; i < 7; i++) { const q = a + i * 0.9, x = -2 + cos(q) * (5 + i * 2.1), y = 17 + sin(q) * (3 + i * 1.1); B(c, x, y, 1.6 + (i % 3) * 0.5, 1.2, i % 2 ? '#c9a85a' : '#a9a4b5', q); }
      c.globalAlpha = 0.7; B(c, -11, 10.4, 6, 2, '#fff', -0.4); c.globalAlpha = 1;
    });
    for (const x of [-12, 12]) { E(c, x, -12, 7.5, 7.5, '#ffffff', 0, true); B(c, x + 2, -11, 3.3, 3.8, DARK); B(c, x + 0.8, -12.6, 1.1, 1.1, '#fff'); }
    L(c, DARK, 3.4, -22, -24, -5, -18); L(c, DARK, 3.4, 22, -24, 5, -18);
  },
};

/* swap this art into the game: thinner icon lines, new cats, new enemies */
function install() {
  const A = GN.art; if (A.setPen) A.setPen(1.3);
  A.drawCat = drawCat; Object.assign(A.ART, ART2);
  for (const id in LOOK2) if (GN.CATS[id]) GN.CATS[id].look = LOOK2[id];
}

GN.art2 = { ST, shade, drawCat, LOOK2, ART: ART2, install };
})();

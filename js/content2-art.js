/* 길냥이 서바이벌 — drawings for the second content pack: enemies, icons and the four new grounds.
   Same thin-outline, cel-shaded style as art2.js and the same coordinate space. */
(() => {
'use strict';
const GN = window.GN, TAU = Math.PI * 2, sin = Math.sin, cos = Math.cos, abs = Math.abs;
const { E, S, B, poly, flat, L, limb, tube, clipE, eye, brows, rr, speed, birdLegs, wheel, dleg, ol, DARK, PINK, ORG } = GN.art2.h;
const shade = GN.art2.shade;
const face = (c, x1, x2, y, s = 1) => { eye(c, x1, y, 1.5 * s); eye(c, x2, y, 1.5 * s); brows(c, x1, x2, y - 2.6 * s, 0.8 * s); };
function pent(c, x, y, r, col, rot = 0) { c.beginPath(); for (let i = 0; i < 5; i++) { const q = rot + i / 5 * TAU - Math.PI / 2; c.lineTo(x + cos(q) * r, y + sin(q) * r); } c.closePath(); c.fillStyle = col; c.fill(); }
function star(c, r1, r2, n, rot) { c.beginPath(); for (let i = 0; i < n * 2; i++) { const q = rot + i / (n * 2) * TAU - Math.PI / 2, r = i % 2 ? r2 : r1; c.lineTo(cos(q) * r, sin(q) * r); } c.closePath(); }

/* ───────── enemies: (c, a) with a = animation phase 0..2π, facing +x ───────── */
Object.assign(GN.art2.ART, {
  /* 학교 운동장 */
  eraser(c, a) {
    c.translate(0, -abs(sin(a)) * 2.5);
    S(c, () => rr(c, -11, -7, 22, 15, 3), '#ff9fb0', () => { c.fillStyle = '#7cc4ff'; c.fillRect(-12, -8, 9, 17); B(c, 3, -4.5, 5, 1.2, '#ffd0da'); });
    face(c, 2, 7, 0); L(c, DARK, 0.9, 3.4, 4, 6.4, 4);
  },
  pencil(c, a) {
    c.rotate(-0.25 + sin(a) * 0.12);
    S(c, () => rr(c, -12, -4, 18, 8, 1.5), '#ffd447', () => { c.fillStyle = '#f2b632'; c.fillRect(-13, 1, 20, 3); });
    poly(c, '#f4d9b4', 6, -4, 14, 0, 6, 4); flat(c, DARK, 11.4, -1.2, 14, 0, 11.4, 1.2);
    rr(c, -16, -4, 4.4, 8, 1.5); c.fillStyle = '#ff9fb0'; c.fill(); ol(c, '#ff9fb0'); c.fillStyle = '#c9cdd9'; c.fillRect(-12.3, -4, 1.6, 8);
    face(c, -4, 0.4, -0.4, 0.85);
  },
  plane(c, a) {
    c.translate(0, sin(a) * 2); c.rotate(sin(a) * 0.08);
    poly(c, '#f7f9ff', -12, -3, 14, 0, -12, 8); poly(c, '#dfe6f5', -12, -3, 14, 0, -5, 1.5); L(c, '#b9c2d8', 0.8, -12, 3, 14, 0);
    eye(c, 1, 2.2, 1.3); eye(c, 5, 1.6, 1.3);
  },
  soccer(c, a) {
    c.translate(0, -abs(sin(a)) * 4);
    c.save(); c.rotate(a * 0.6); E(c, 0, 0, 11, 11, '#ffffff');
    clipE(c, 0, 0, 10.6, 10.6, 0, () => { pent(c, 0, 0, 4, '#3b3442'); for (let i = 0; i < 5; i++) { const q = i / 5 * TAU - Math.PI / 2; pent(c, cos(q) * 10, sin(q) * 10, 4, '#3b3442', 0.6); } });
    c.restore(); B(c, -2.6, -1, 2.3, 2.3, '#ffffff'); B(c, 3, -1, 2.3, 2.3, '#ffffff'); face(c, -2.6, 3, -1, 0.9);
  },
  recorder(c, a) {
    c.rotate(-0.5 + sin(a) * 0.1);
    S(c, () => rr(c, -14, -3.6, 26, 7.2, 3), '#f4ead8'); poly(c, '#f4ead8', 12, -4.6, 16, -3.2, 16, 3.2, 12, 4.6);
    for (const x of [-9, -5, -1, 3, 7]) B(c, x, 0, 1.1, 1.1, '#6b4b3a');
    c.rotate(0.5); face(c, -2, 3, -7, 0.9); L(c, DARK, 0.8, 4, -11, 8, -14); L(c, DARK, 0.8, 7, -11, 10, -12);
  },
  shoe(c, a) {
    c.translate(0, -abs(sin(a)) * 3);
    S(c, () => { c.beginPath(); c.moveTo(-13, 6); c.quadraticCurveTo(-14, -2, -6, -3); c.lineTo(8, -3); c.quadraticCurveTo(15, -2, 14, 5); c.quadraticCurveTo(14, 9, 8, 9); c.lineTo(-9, 9); c.quadraticCurveTo(-13, 9, -13, 6); c.closePath(); }, '#ffffff');
    S(c, () => rr(c, -4, -6, 13, 8, 3), '#5b8fe0'); L(c, '#ffffff', 1, -1, -3, 6, -3);
    face(c, 0, 5.4, -1.4, 0.85);
  },
  tray(c, a) {
    c.scale(1 + sin(a) * 0.04, 1 - sin(a) * 0.04);
    S(c, () => rr(c, -15, -9, 30, 19, 4), '#cfd6e6', () => { c.fillStyle = '#b6bfd2'; c.fillRect(-12, 1, 7, 7); c.fillRect(-3, 1, 7, 7); c.fillRect(6, 1, 7, 7); c.fillRect(-12, -6, 25, 5); });
    B(c, -8.5, 4.5, 2.5, 2, '#ff8a7a'); B(c, 0.5, 4.5, 2.5, 2, '#8fe08a'); B(c, 9.5, 4.5, 2.5, 2, '#ffd447');
    face(c, -3, 3, -3.6, 0.9);
  },
  duster(c, a) {
    c.translate(0, sin(a * 2) * 1.5);
    S(c, () => rr(c, -12, -6, 24, 7, 2), '#c98f5a'); S(c, () => rr(c, -12, 0, 24, 6, 1.5), '#4a4f63');
    c.globalAlpha = 0.6; for (let i = 0; i < 4; i++) B(c, -16 - i * 3 + sin(a * 3 + i) * 2, 6 + i, 2.6 - i * 0.4, 2 - i * 0.3, '#ffffff'); c.globalAlpha = 1;
    face(c, -2, 4, -2.6, 0.9);
  },
  /* 바닷가 */
  gull(c, a) {
    const f = sin(a * 2);
    poly(c, '#b9bfd0', -2, -2, -14, -6 - 8 * f, -6, 2); E(c, 0, 1, 9, 6.5, '#ffffff'); poly(c, '#9aa3b8', -6, -1, -16, 1, -7, 4);
    E(c, 7, -4, 5, 4.6, '#ffffff'); poly(c, '#ffd447', 11, -5, 17, -3, 11, -2); B(c, 13.6, -3.3, 1, 0.8, '#ff6b6b'); eye(c, 8, -5, 1.3);
    birdLegs(c, -1, 2, 7, sin(a * 2), 3);
  },
  jelly(c, a) {
    const s = sin(a * 2);
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 3, 2); c.quadraticCurveTo(i * 3 + s * 2, 8, i * 3.4, 13 + abs(s) * 2); c.strokeStyle = 'rgba(255,159,200,.8)'; c.lineWidth = 1.4; c.stroke(); }
    c.globalAlpha = 0.9; S(c, () => { c.beginPath(); c.arc(0, 2, 11, Math.PI, 0); c.quadraticCurveTo(0, 6, -11, 2); c.closePath(); }, '#ffb3d6', () => B(c, -4, -5, 3, 1.6, '#ffffff')); c.globalAlpha = 1;
    face(c, -3, 3, -1.6, 0.85);
  },
  starfish(c, a) {
    c.rotate(sin(a) * 0.2); S(c, () => star(c, 13, 5.6, 5, 0), '#ff9f6b', () => { for (const [x, y] of [[0, -8], [6, -2], [-6, -2], [4, 6], [-4, 6]]) B(c, x, y, 0.9, 0.9, '#ffd0b0'); });
    c.rotate(-sin(a) * 0.2); face(c, -2.4, 2.4, 0, 0.85);
  },
  hermit(c, a) {
    const s = sin(a * 2);
    for (const k of [-1, 1]) limb(c, '#ff7b5a', 1.2, k * 4, 6, k * 8, 10 + s * k);
    S(c, () => { c.beginPath(); c.arc(-3, 0, 10, 0, TAU); }, '#e8c49a', () => { c.strokeStyle = '#c99d6a'; c.lineWidth = 1.2; c.beginPath(); c.arc(-3, 0, 6, 0.6, 5.4); c.stroke(); c.beginPath(); c.arc(-3, 0, 2.6, 1, 5.8); c.stroke(); });
    poly(c, '#ff7b5a', 7, -1, 14, -4 + s, 15, 1, 8, 4); limb(c, '#ff7b5a', 1, 6, -4, 7, -10); limb(c, '#ff7b5a', 1, 9, -4, 11, -9);
    eye(c, 7, -11, 1.4); eye(c, 11, -10, 1.4);
  },
  clam(c, a) {
    const o = 0.15 + abs(sin(a)) * 0.35;
    c.save(); c.rotate(-o); S(c, () => { c.beginPath(); c.arc(0, 0, 12, Math.PI, 0); c.closePath(); }, '#c9b2e8', () => { for (let i = -2; i <= 2; i++) L(c, '#a88fd0', 0.9, 0, 0, i * 4.6, -11); }); c.restore();
    E(c, 2, -1, 3, 3, '#ffffff'); S(c, () => { c.beginPath(); c.arc(0, 0, 12, 0, Math.PI); c.closePath(); }, '#b79cdd');
    eye(c, -3, 4, 1.4); eye(c, 3, 4, 1.4); brows(c, -3, 3, 1.6, 0.8);
  },
  urchin(c, a) {
    c.rotate(a * 0.2); c.beginPath(); for (let i = 0; i < 28; i++) { const q = i / 28 * TAU, r = i % 2 ? 9 : 15; c.lineTo(cos(q) * r, sin(q) * r); } c.closePath(); c.fillStyle = '#5a3e7a'; c.fill(); ol(c, '#5a3e7a');
    c.rotate(-a * 0.2); E(c, 0, 0, 9, 9, '#6e4c94'); face(c, -3, 3, 0, 0.9);
  },
  seal(c, a) {
    const s = sin(a * 2) * 2;
    poly(c, '#8f96aa', -14, 4, -20, 0 + s, -20, 8 - s); E(c, -2, 3, 14, 8, '#a9b0c2'); clipE(c, -2, 3, 13.5, 7.5, 0, () => B(c, 0, 9, 11, 3.5, '#d6dae6'));
    poly(c, '#8f96aa', 2, 7, 8, 12 + s, -2, 11); E(c, 9, -3, 7, 6.5, '#a9b0c2');
    eye(c, 9, -5, 1.6); eye(c, 13, -5, 1.4); B(c, 14.6, -1.6, 1.4, 1, DARK);
    L(c, 'rgba(42,35,48,.5)', 0.5, 13, -0.6, 18, -1.8); L(c, 'rgba(42,35,48,.5)', 0.5, 13, 0.4, 18, 1);
  },
  octo(c, a) {
    const s = sin(a * 2);
    for (let i = 0; i < 4; i++) { const x = -8 + i * 5.4; c.beginPath(); c.moveTo(x, 2); c.quadraticCurveTo(x + s * 3 * (i % 2 ? 1 : -1), 9, x + (i - 1.5) * 2, 14); tube(c, '#c06fc4', 2.6); }
    S(c, () => { c.beginPath(); c.ellipse(0, -4, 11, 10, 0, 0, TAU); }, '#d685da', () => { B(c, -4, -9, 3, 1.6, '#f0b8f2'); for (const [x, y] of [[4, -9], [7, -4], [-6, -2]]) B(c, x, y, 1, 0.9, '#b45cb8'); });
    face(c, -3, 3, -2, 0.9);
  },
  /* 지하철역 */
  roach(c, a) {
    const s = sin(a * 3) * 1.5;
    for (const k of [-1, 1]) for (let i = 0; i < 3; i++) limb(c, '#5a3a24', 0.8, -4 + i * 4, k * 4, -6 + i * 4 + s * k, k * 9);
    E(c, -1, 0, 9, 5.6, '#7a4a2e'); L(c, '#5a3a24', 0.8, -8, 0, 5, 0); E(c, 8, 0, 3.4, 3.2, '#5a3a24');
    L(c, DARK, 0.7, 10, -2, 16, -7 + s); L(c, DARK, 0.7, 10, 2, 16, 6 - s); eye(c, 9, -1.4, 1, '#ffffff');
  },
  cup(c, a) {
    c.translate(0, -abs(sin(a)) * 3);
    L(c, ST_RED, 1.6, 3, -11, 7, -18);
    S(c, () => { c.beginPath(); c.moveTo(-8, -10); c.lineTo(8, -10); c.lineTo(6, 10); c.lineTo(-6, 10); c.closePath(); }, '#ffffff', () => { c.fillStyle = '#c9a27a'; c.fillRect(-9, -2, 18, 7); });
    rr(c, -9, -12, 18, 3, 1.4); c.fillStyle = '#f4f6fb'; c.fill(); ol(c, '#f4f6fb'); face(c, -2.4, 2.4, -5.6, 0.85);
  },
  flyer(c, a) {
    c.rotate(sin(a) * 0.3);
    S(c, () => { c.beginPath(); c.moveTo(-9, -11); c.lineTo(9, -11); c.quadraticCurveTo(7, 0, 9, 11); c.lineTo(-9, 11); c.quadraticCurveTo(-7, 0, -9, -11); c.closePath(); }, '#fff6d6', () => { c.fillStyle = '#ff8a7a'; c.fillRect(-9, -11, 18, 5); for (let y = 2; y < 10; y += 3) L(c, '#c9c2a8', 1, -6, y, 6, y); });
    face(c, -3, 3, -1.6, 0.85);
  },
  umbrella(c, a) {
    c.translate(0, -abs(sin(a)) * 3);
    L(c, DARK, 1.6, 0, -2, 0, 10); c.beginPath(); c.arc(-2.6, 10, 2.6, 0, Math.PI); c.strokeStyle = DARK; c.lineWidth = 1.6; c.stroke();
    S(c, () => { c.beginPath(); c.arc(0, -2, 13, Math.PI, 0); for (let i = 0; i < 4; i++) c.quadraticCurveTo(13 - i * 6.5 - 3.25, 1, 13 - (i + 1) * 6.5, -2); c.closePath(); }, '#5b8fe0', () => { L(c, '#7aa8f0', 1, 0, -15, -6.5, -2); L(c, '#7aa8f0', 1, 0, -15, 6.5, -2); });
    face(c, -3, 3, -7, 0.85);
  },
  news(c, a) {
    c.rotate(a * 0.15); S(c, () => { c.beginPath(); for (let i = 0; i < 12; i++) { const q = i / 12 * TAU, r = i % 2 ? 9.5 : 12; c.lineTo(cos(q) * r, sin(q) * r); } c.closePath(); }, '#e9e6dc', () => { for (let i = -2; i <= 2; i++) L(c, '#b8b3a3', 0.9, -8, i * 3.4, 8, i * 3.4 + 1); });
    c.rotate(-a * 0.15); face(c, -3, 3, -1, 0.9);
  },
  suitcase(c, a) {
    c.translate(0, sin(a * 2) * 1);
    L(c, DARK, 1.8, -4, -12, -4, -16, 4, -16, 4, -12);
    S(c, () => rr(c, -11, -12, 22, 22, 4), '#ff7b8a', () => { L(c, '#d65f6e', 1.2, -5, -12, -5, 10); L(c, '#d65f6e', 1.2, 5, -12, 5, 10); });
    wheel(c, -7, 12, 2.6, a * 3); wheel(c, 7, 12, 2.6, a * 3); face(c, -3, 3, -3, 0.95);
  },
  gate(c, a) {
    const s = sin(a * 2);
    limb(c, '#9aa3b8', 2, -12, -2, -18, -6 + s * 3); limb(c, '#9aa3b8', 2, 12, -2, 18, -6 - s * 3);
    S(c, () => rr(c, -12, -12, 24, 24, 3), '#cfd6e6', () => { c.fillStyle = '#b6bfd2'; c.fillRect(-12, 6, 24, 6); });
    rr(c, -8, -8, 16, 9, 2); c.fillStyle = '#2a2f40'; c.fill(); ol(c, '#2a2f40');
    flat(c, '#ff5a5a', -5.6, -5.6, -1.6, -4.4, -1.6, -2.4, -5.6, -3); flat(c, '#ff5a5a', 5.6, -5.6, 1.6, -4.4, 1.6, -2.4, 5.6, -3);
    B(c, 0, 8.6, 2, 1.2, '#7dff9a');
  },
  mop(c, a) {
    const s = sin(a * 3);
    L(c, '#c98f5a', 2.2, -2, -16, 0, 2); L(c, DARK, 0.6, -2, -16, 0, 2);
    rr(c, -5, 0, 10, 4, 1.5); c.fillStyle = '#4a4f63'; c.fill(); ol(c, '#4a4f63');
    for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(i * 1.4, 4); c.quadraticCurveTo(i * 2 + s * 2, 9, i * 2.6 + s * 3, 14); tube(c, '#d6dae6', 1.6); }
    face(c, -3, 3, 8, 0.85);
  },
  /* 눈 덮인 마을 */
  snowball(c, a) {
    c.translate(0, -abs(sin(a)) * 2.5); E(c, 0, 0, 10.5, 10, '#f4f8ff'); clipE(c, 0, 0, 10, 9.5, 0, () => B(c, 3, 5, 9, 5, '#d6e6f8')); face(c, -3, 3, -1, 0.9);
  },
  mitten(c, a) {
    c.rotate(sin(a) * 0.2);
    S(c, () => { c.beginPath(); c.moveTo(-7, 10); c.lineTo(-8, -4); c.quadraticCurveTo(-8, -12, 0, -12); c.quadraticCurveTo(8, -12, 8, -4); c.lineTo(7, 10); c.closePath(); }, '#e5484d', () => { c.fillStyle = '#ffffff'; for (let x = -6; x <= 6; x += 4) c.fillRect(x, -3, 2, 2); });
    E(c, 9, 0, 3.6, 5, '#e5484d'); S(c, () => rr(c, -8, 8, 16, 5, 2), '#ffffff'); face(c, -2.6, 2.6, -6, 0.85);
  },
  icicle(c, a) {
    c.translate(0, sin(a * 2) * 1.5);
    S(c, () => { c.beginPath(); c.moveTo(-8, -10); c.lineTo(8, -10); c.lineTo(0, 14); c.closePath(); }, '#bfe6ff', () => B(c, -3, -4, 1.4, 6, '#ffffff', 0.15));
    rr(c, -10, -13, 20, 4, 2); c.fillStyle = '#ffffff'; c.fill(); ol(c, '#ffffff'); face(c, -2.6, 2.6, -5, 0.8);
  },
  bunny(c, a) {
    const h = abs(sin(a)) * 4; c.translate(0, -h);
    E(c, -9, 3, 3.4, 3, '#ffffff'); E(c, -2, 3, 9, 7, '#ffffff');
    E(c, 3, -10, 2.4, 7, '#ffffff', -0.2); B(c, 3, -10, 1.1, 5, PINK, -0.2); E(c, 7.4, -10, 2.4, 7, '#ffffff', 0.25); B(c, 7.4, -10, 1.1, 5, PINK, 0.25);
    E(c, 6, -2, 6.4, 5.6, '#ffffff'); eye(c, 8, -3, 1.5, '#ff7b8a'); B(c, 11.6, -1, 1, 0.8, '#f28a94');
  },
  penguin(c, a) {
    const s = sin(a * 2);
    E(c, -3, 11, 3, 1.6, ORG, 0, true); E(c, 3, 11, 3, 1.6, ORG, 0, true);
    E(c, 0, 1, 9, 11, '#3b3f50'); clipE(c, 0, 1, 8.5, 10.5, 0, () => B(c, 2, 4, 6.4, 8.6, '#ffffff'));
    poly(c, '#3b3f50', -8, -2, -13, 6 + s * 2, -7, 5); poly(c, ORG, 7, -5, 12, -3.6, 7, -2.4);
    eye(c, 2, -5, 1.3); eye(c, 5.6, -5, 1.3);
  },
  snowman(c, a) {
    c.translate(0, sin(a) * 1);
    E(c, 0, 6, 10.5, 9, '#f4f8ff'); E(c, 0, -8, 7.5, 7, '#f4f8ff');
    L(c, '#8a5a36', 1.4, -8, 2, -15, -4); L(c, '#8a5a36', 1.4, 8, 2, 15, -4);
    S(c, () => rr(c, -6, -20, 12, 6, 1), '#3b3442'); rr(c, -8.4, -15, 16.8, 2.4, 1); c.fillStyle = '#3b3442'; c.fill();
    poly(c, ORG, 1, -8, 9, -7, 1, -6); face(c, -3, 2, -10, 0.85);
    for (const y of [2, 6, 10]) B(c, 0, y, 1.1, 1.1, '#3b3442');
  },
  fox(c, a) {
    const s = sin(a * 2) * 2.4;
    c.beginPath(); c.moveTo(-12, 2); c.bezierCurveTo(-20, 0, -24, -8 + s, -18, -10 + s); tube(c, '#ffffff', 6);
    dleg(c, -8 - s, 10, '#e6ebf5'); dleg(c, 5 + s, 10, '#e6ebf5'); E(c, -2, 3, 12, 7, '#ffffff'); dleg(c, -5 + s, 11, '#ffffff'); dleg(c, 7 - s, 11, '#ffffff');
    poly(c, '#ffffff', 4, -8, 6, -16, 10, -9); poly(c, '#ffffff', 10, -9, 14, -16, 15, -7); E(c, 10, -4, 7, 6, '#ffffff'); poly(c, '#ffffff', 14, -4, 21, -1, 14, 1);
    B(c, 20.4, -1, 1.2, 1, DARK); eye(c, 10, -5, 1.5, '#7cc4ff'); eye(c, 14, -5.4, 1.3, '#7cc4ff');
  },
  yeti(c, a) {
    const s = sin(a * 2) * 2;
    for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * 10, -2); c.quadraticCurveTo(k * 16, 4 + s * k, k * 14, 12); tube(c, '#eef3fb', 5); }
    E(c, -5, 13, 4.6, 2.6, '#d6e6f8', 0, true); E(c, 5, 13, 4.6, 2.6, '#d6e6f8', 0, true);
    S(c, () => { c.beginPath(); for (let i = 0; i < 16; i++) { const q = i / 16 * TAU, r = i % 2 ? 13 : 15; c.lineTo(cos(q) * r * 0.9, sin(q) * r); } c.closePath(); }, '#eef3fb');
    E(c, 0, -4, 7.5, 6.5, '#8fb8e0'); face(c, -3, 3, -5, 0.9); flat(c, '#ffffff', -3, -0.6, -1.6, 2, -0.2, -0.6); flat(c, '#ffffff', 0.2, -0.6, 1.6, 2, 3, -0.6);
  },
  /* dashers */
  bike(c, a) {
    speed(c);
    wheel(c, -10, 8, 7, a * 4); wheel(c, 11, 8, 7, a * 4);
    c.beginPath(); c.moveTo(-10, 8); c.lineTo(-2, -4); c.lineTo(9, -4); c.lineTo(11, 8); c.moveTo(-2, -4); c.lineTo(2, 8); c.lineTo(-10, 8); tube(c, '#ff6b6b', 2.2);
    L(c, DARK, 2, -4, -8, 0, -8); L(c, DARK, 2, 8, -4, 10, -10, 14, -10);
  },
  jetski(c, a) {
    speed(c); c.translate(0, sin(a * 3) * 1);
    c.globalAlpha = 0.8; for (let i = 0; i < 3; i++) B(c, -18 - i * 5, 8 + sin(a * 4 + i) * 1.5, 4 - i, 2, '#ffffff'); c.globalAlpha = 1;
    S(c, () => { c.beginPath(); c.moveTo(-16, 2); c.lineTo(14, 2); c.quadraticCurveTo(20, 4, 16, 9); c.lineTo(-14, 9); c.closePath(); }, '#ffd447');
    S(c, () => rr(c, -10, -4, 16, 7, 3), '#3b3f50'); L(c, DARK, 2, 6, -4, 10, -10);
  },
  trolley(c, a) {
    speed(c);
    S(c, () => { c.beginPath(); c.moveTo(-14, -10); c.lineTo(12, -10); c.lineTo(9, 5); c.lineTo(-11, 5); c.closePath(); }, '#cfd6e6', () => { for (let x = -10; x <= 8; x += 4) L(c, '#9aa3b8', 0.9, x, -10, x * 0.85, 5); L(c, '#9aa3b8', 0.9, -13, -3, 11, -3); });
    L(c, DARK, 1.8, -14, -10, -19, -15); wheel(c, -8, 10, 3, a * 4); wheel(c, 7, 10, 3, a * 4);
  },
  sled(c, a) {
    speed(c);
    c.beginPath(); c.moveTo(-16, 9); c.lineTo(12, 9); c.quadraticCurveTo(18, 9, 17, 3); tube(c, '#c9cdd9', 2);
    S(c, () => rr(c, -14, -2, 26, 7, 2), '#c0392b', () => { L(c, '#e86a5a', 1, -10, -2, -10, 5); L(c, '#e86a5a', 1, 0, -2, 0, 5); });
    L(c, DARK, 1.2, -10, 5, -10, 9); L(c, DARK, 1.2, 6, 5, 6, 9);
  },
});
const ST_RED = '#ff6b6b';

/* ───────── icons (fit inside ±16), drawn with the base art helpers ───────── */
const A = GN.art;
const ICON2 = {
  // weapons
  fork(c) { c.beginPath(); c.moveTo(0, 14); c.lineTo(0, -3); A.inkStroke(c, '#cfd6e6', 3); for (const x of [-5, 0, 5]) { c.beginPath(); c.moveTo(x, -3); c.lineTo(x, -14); A.inkStroke(c, '#cfd6e6', 1.8); } c.beginPath(); c.moveTo(-5, -4); c.quadraticCurveTo(0, 2, 5, -4); A.inkStroke(c, '#cfd6e6', 2.4); },
  slipper(c) { A.ell(c, 0, 0, 8, 14, '#7cc4ff', 0.5); A.box(c, -8, -6, 15, 6, 3, '#ffd84d'); },
  marbles(c) { for (const [x, y, col] of [[-6, 4, '#7cc4ff'], [6, 4, '#ff8fb1'], [0, -6, '#8fe08a']]) { A.ell(c, x, y, 6, 6, col); A.dot(c, x - 2, y - 2, 1.6, '#ffffff'); } },
  hotpack(c) { A.box(c, -9, -10, 18, 22, 4, '#ff9f43'); A.box(c, -5, -4, 10, 8, 2, '#ffd0a0'); A.thin(c, '#ff6b6b', 1.8, () => { for (const x of [-5, 0, 5]) { c.beginPath(); c.moveTo(x, -12); c.quadraticCurveTo(x + 3, -14, x, -16); c.stroke(); } }); },
  catnipcloud(c) { A.ell(c, -6, 3, 8, 7, '#bdeeb0'); A.ell(c, 5, 2, 9, 8, '#bdeeb0'); A.ell(c, -1, -5, 7, 6, '#d4f5c9'); A.ell(c, 2, 2, 3, 5, '#6fcf6f', 0.6); },
  flowerpot(c) { c.beginPath(); c.moveTo(-9, -2); c.lineTo(9, -2); c.lineTo(6, 13); c.lineTo(-6, 13); c.closePath(); c.fillStyle = '#e08a5a'; c.fill(); c.stroke(); A.ell(c, -4, -8, 4, 7, '#6fcf6f', -0.4); A.ell(c, 4, -9, 4, 7, '#8fe08a', 0.4); A.dot(c, 0, -13, 3, '#ff9fb0'); },
  rubber(c) { c.beginPath(); c.ellipse(0, 0, 12, 7, 0.5, 0, TAU); A.inkStroke(c, '#ffcf5a', 3); c.beginPath(); c.ellipse(0, 0, 7, 12, 0.3, 0, TAU); A.inkStroke(c, '#ff8fb1', 2.4); },
  bubble(c) { A.ell(c, -2, 1, 11, 11, 'rgba(190,230,255,.9)'); A.thin(c, '#ffffff', 2, () => { c.beginPath(); c.arc(-2, 1, 7.5, 3.6, 4.6); c.stroke(); }); A.ell(c, 10, -9, 4, 4, 'rgba(190,230,255,.9)'); },
  newspaper(c) { c.save(); c.rotate(-0.6); A.box(c, -5, -15, 10, 30, 4, '#f4f1e8'); A.thin(c, '#b8b3a3', 1.2, () => { for (let y = -10; y <= 10; y += 4) A.line(c, -3, y, 3, y); }); c.restore(); },
  roar(c) { for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-10, 0, 5 + i * 7, -0.95, 0.95); A.inkStroke(c, '#ff8a7a', 3.2); } },
  camera(c) { A.box(c, -6, -12, 8, 5, 1, '#4a4f63'); A.box(c, -14, -8, 28, 19, 3, '#4a4f63'); A.ell(c, 0, 1.5, 7, 7, '#9fd0ff'); A.dot(c, -2, -0.5, 2, '#ffffff'); A.ell(c, 9, -4, 2.4, 2.4, '#ffd84d'); },
  flashlight(c) { c.save(); c.rotate(-0.5); A.box(c, -15, -4, 16, 8, 2, '#4a4f63'); A.box(c, 1, -6, 5, 12, 1.5, '#9aa3b8'); c.restore(); c.save(); c.rotate(-0.5); c.beginPath(); c.moveTo(6, -6); c.lineTo(17, -12); c.lineTo(17, 12); c.lineTo(6, 6); c.closePath(); c.fillStyle = 'rgba(255,216,77,.75)'; c.fill(); c.restore(); },
  mousetoy(c) { A.ell(c, -1, 3, 11, 7, '#b9bfd0'); A.ell(c, 9, 0, 4, 4, '#b9bfd0'); A.dot(c, 10, -1, 1.3); A.thin(c, A.INK || '#3b3442', 1.6, () => { A.line(c, -6, -3, -9, -10); }); A.ell(c, -9, -12, 4, 2.4, '#ffd84d'); A.thin(c, '#ff9fb0', 1.6, () => { c.beginPath(); c.moveTo(-12, 4); c.quadraticCurveTo(-17, 2, -16, 9); c.stroke(); }); },
  cans(c) { A.box(c, -8, -12, 16, 24, 3, '#cfd6e6'); c.fillStyle = '#e5484d'; c.fillRect(-7, -4, 14, 8); A.ell(c, 0, -12, 8, 2.6, '#e6ebf5'); },
  bubblewrap(c) { A.box(c, -13, -11, 26, 22, 3, '#e8f6ff'); for (let x = -7; x <= 7; x += 7) for (let y = -5; y <= 5; y += 10) A.ell(c, x, y, 3, 3, '#cfeaff'); },
  shadowclaw(c) { for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-3 + i * 9, -13); c.quadraticCurveTo(7 + i * 9, 0, -5 + i * 9, 13); A.inkStroke(c, '#9d8cdc', 3.5); } },
  // passives
  fang(c) { c.beginPath(); c.moveTo(-9, -10); c.quadraticCurveTo(0, -6, 9, -10); c.quadraticCurveTo(6, 4, 0, 14); c.quadraticCurveTo(-6, 4, -9, -10); c.fillStyle = '#ffffff'; c.fill(); c.stroke(); },
  hunter(c) { A.ell(c, 0, 0, 11, 11, '#ffffff'); A.ell(c, 0, 0, 6, 6, '#ff8a7a'); A.thin(c, '#3b3442', 1.6, () => { A.line(c, -15, 0, -8, 0); A.line(c, 8, 0, 15, 0); A.line(c, 0, -15, 0, -8); A.line(c, 0, 8, 0, 15); }); },
  warmFur(c) { c.beginPath(); c.moveTo(0, 12); c.bezierCurveTo(-18, 0, -12, -14, 0, -5); c.bezierCurveTo(12, -14, 18, 0, 0, 12); c.fillStyle = '#ffb36b'; c.fill(); c.stroke(); A.thin(c, '#ff6b6b', 1.6, () => { c.beginPath(); c.moveTo(-3, -9); c.quadraticCurveTo(0, -12, -3, -15); c.stroke(); c.beginPath(); c.moveTo(3, -9); c.quadraticCurveTo(6, -12, 3, -15); c.stroke(); }); },
  heavyPaw(c) { A.ell(c, 0, 4, 9, 7, '#9aa3b8'); for (const [x, y] of [[-10, -4], [-4, -10], [4, -10], [10, -4]]) A.ell(c, x, y, 4, 4.6, '#9aa3b8'); },
  windBell(c) { A.ell(c, 0, 1, 10, 10, '#9fd0ff'); A.thin(c, '#3b3442', 2, () => { A.line(c, -9, 0, 9, 0); A.line(c, 0, 5, 0, 10); }); A.dot(c, 0, 5, 2.2); A.thin(c, '#ffffff', 1.6, () => { c.beginPath(); c.moveTo(-15, -10); c.quadraticCurveTo(-10, -14, -5, -11); c.stroke(); }); },
  thornScarf(c) { A.box(c, -13, -5, 26, 9, 4, '#7c6bb5'); for (let x = -10; x <= 10; x += 5) A.tri(c, x - 2, -5, x, -11, x + 2, -5, '#ffffff'); A.box(c, 4, 2, 6, 12, 2, '#7c6bb5'); },
  bossBadge(c) { A.ell(c, 0, 0, 12, 12, '#ffd84d'); c.save(); c.beginPath(); for (let i = 0; i < 10; i++) { const q = i / 10 * TAU - Math.PI / 2, r = i % 2 ? 3.4 : 7.5; c.lineTo(cos(q) * r, sin(q) * r); } c.closePath(); c.fillStyle = '#ff8a7a'; c.fill(); c.stroke(); c.restore(); },
  rescueVest(c) { c.beginPath(); c.moveTo(-12, -10); c.lineTo(-5, -12); c.lineTo(0, -6); c.lineTo(5, -12); c.lineTo(12, -10); c.lineTo(11, 13); c.lineTo(-11, 13); c.closePath(); c.fillStyle = '#ff9f43'; c.fill(); c.stroke(); c.fillStyle = '#ffffff'; c.fillRect(-11, 2, 22, 4); },
  leaderScarf(c) { A.box(c, -13, -6, 26, 9, 4, '#e5484d'); A.box(c, 3, 0, 7, 14, 2, '#e5484d'); A.thin(c, '#ffffff', 1.4, () => { A.line(c, 4, 10, 9, 10); }); },
  stretch(c) { A.thin(c, '#3b3442', 1.2, () => {}); c.beginPath(); for (let i = 0; i <= 24; i++) { const x = -13 + i * 26 / 24, y = sin(i * 1.05) * 6; i ? c.lineTo(x, y) : c.moveTo(x, y); } A.inkStroke(c, '#5fd3b3', 3); },
  coinLuck(c) { A.ell(c, -3, 3, 10, 10, '#ffd84d'); A.thin(c, '#3b3442', 1.4, () => { c.beginPath(); c.arc(-3, 3, 6, 0, TAU); c.stroke(); }); for (const [x, y] of [[8, -10], [12, -6], [8, -2], [4, -6]]) A.ell(c, x, y, 3, 3, '#6fcf6f'); },
  shieldFur(c) { c.beginPath(); c.moveTo(0, -14); c.lineTo(12, -9); c.quadraticCurveTo(12, 6, 0, 14); c.quadraticCurveTo(-12, 6, -12, -9); c.closePath(); c.fillStyle = '#d9c2a3'; c.fill(); c.stroke(); A.thin(c, '#b8a080', 1.4, () => { A.line(c, -5, -4, 5, -4); A.line(c, -6, 1, 6, 1); A.line(c, -4, 6, 4, 6); }); },
  nightOwl(c) { c.beginPath(); c.arc(0, 0, 12, 0.6, 5.7); c.arc(5, -2, 9, 5.2, 1.0, true); c.closePath(); c.fillStyle = '#ffd84d'; c.fill(); c.stroke(); A.dot(c, -8, 2, 1.4); },
  napPillow(c) { A.box(c, -14, -7, 28, 15, 7, '#cfeaff'); A.thin(c, '#3b3442', 1.4, () => { A.line(c, 5, -13, 10, -13); A.line(c, 10, -13, 5, -9); A.line(c, 5, -9, 10, -9); }); },
  awl(c) { c.save(); c.rotate(0.7); A.box(c, -3, -14, 6, 10, 2, '#c98f5a'); c.beginPath(); c.moveTo(-1.6, -4); c.lineTo(0, 15); c.lineTo(1.6, -4); c.closePath(); c.fillStyle = '#cfd6e6'; c.fill(); c.stroke(); c.restore(); },
  dashShoes(c) { c.beginPath(); c.moveTo(-10, 6); c.lineTo(-10, -6); c.quadraticCurveTo(-4, -8, 0, -2); c.lineTo(12, 2); c.quadraticCurveTo(14, 8, 10, 9); c.lineTo(-10, 9); c.closePath(); c.fillStyle = '#ff6b6b'; c.fill(); c.stroke(); c.fillStyle = '#ffffff'; c.fillRect(-10, 5, 22, 3); A.thin(c, '#9fd0ff', 1.8, () => { A.line(c, -16, -4, -12, -4); A.line(c, -17, 1, -13, 1); }); },
  // skills
  skpurr(c) { c.beginPath(); c.moveTo(0, 11); c.bezierCurveTo(-16, 0, -11, -13, 0, -4); c.bezierCurveTo(11, -13, 16, 0, 0, 11); c.fillStyle = '#ff8a9a'; c.fill(); c.stroke(); for (const k of [-1, 1]) { c.beginPath(); c.arc(0, 0, 15, k > 0 ? -0.6 : Math.PI - 0.6, k > 0 ? 0.6 : Math.PI + 0.6); A.inkStroke(c, '#5fd3b3', 2); } },
  skfrenzy(c) { A.ell(c, -3, 2, 6, 11, '#6fcf6f', -0.5); A.ell(c, 4, 1, 6, 11, '#8fe08a', 0.5); A.thin(c, '#ffd84d', 2.2, () => { for (const [x, y] of [[-13, -10], [13, -10], [0, -15]]) { A.line(c, x - 3, y, x + 3, y); A.line(c, x, y - 3, x, y + 3); } }); },
  skcall(c) { c.beginPath(); c.moveTo(-12, -4); c.lineTo(-4, -4); c.lineTo(8, -12); c.lineTo(8, 12); c.lineTo(-4, 4); c.lineTo(-12, 4); c.closePath(); c.fillStyle = '#ffd84d'; c.fill(); c.stroke(); A.thin(c, '#3b3442', 1.8, () => { c.beginPath(); c.arc(8, 0, 6, -0.7, 0.7); c.stroke(); c.beginPath(); c.arc(8, 0, 10, -0.7, 0.7); c.stroke(); }); },
  // yard furniture
  hammock(c) { A.thin(c, '#8a5a36', 2.4, () => { A.line(c, -14, -12, -14, 14); A.line(c, 14, -12, 14, 14); }); c.beginPath(); c.moveTo(-14, -6); c.quadraticCurveTo(0, 12, 14, -6); c.quadraticCurveTo(0, 4, -14, -6); c.fillStyle = '#ff9f43'; c.fill(); c.stroke(); },
  cabin(c) { c.beginPath(); c.moveTo(-15, -1); c.lineTo(0, -14); c.lineTo(15, -1); c.closePath(); c.fillStyle = '#8a5a36'; c.fill(); c.stroke(); A.box(c, -12, -2, 24, 15, 1.5, '#c98f5a'); A.thin(c, '#8a5a36', 1.2, () => { A.line(c, -12, 3, 12, 3); A.line(c, -12, 8, 12, 8); }); c.beginPath(); c.arc(0, 8, 5, Math.PI, 0); c.lineTo(5, 13); c.lineTo(-5, 13); c.closePath(); c.fillStyle = '#5a4636'; c.fill(); c.stroke(); },
  fountain(c) { A.ell(c, 0, 8, 14, 5, '#cfd6e6'); A.ell(c, 0, 7, 11, 3, '#9fd8ff'); A.box(c, -2, -4, 4, 11, 1, '#cfd6e6'); A.thin(c, '#7cc4ff', 1.8, () => { c.beginPath(); c.moveTo(0, -5); c.quadraticCurveTo(-8, -14, -10, 4); c.stroke(); c.beginPath(); c.moveTo(0, -5); c.quadraticCurveTo(8, -14, 10, 4); c.stroke(); }); },
  feeder(c) { A.box(c, -8, -14, 16, 18, 3, '#cfeaff'); A.ell(c, 0, -6, 5, 5, '#d19a5b'); A.box(c, -12, 4, 24, 9, 3, '#7cc4ff'); },
  tunnel(c) { c.beginPath(); c.ellipse(4, 0, 12, 10, 0, 0, TAU); c.fillStyle = '#b79cff'; c.fill(); c.stroke(); A.ell(c, -6, 0, 6, 9, '#5a4a7a'); A.thin(c, '#9a80e0', 1.4, () => { for (const x of [2, 8]) { c.beginPath(); c.ellipse(x, 0, 2, 9.4, 0, -1.4, 1.4); c.stroke(); } }); },
  flowerbed(c) { A.box(c, -14, 4, 28, 9, 2, '#a8743f'); for (const [x, col] of [[-8, '#ff9fb0'], [0, '#ffd84d'], [8, '#ffffff']]) { A.thin(c, '#5fa851', 1.6, () => A.line(c, x, 4, x, -4)); for (let i = 0; i < 5; i++) A.dot(c, x + cos(i * 1.257) * 3, -6 + sin(i * 1.257) * 3, 2.2, col); A.dot(c, x, -6, 1.6, '#ff9f43'); } },
  parasol(c) { A.thin(c, '#3b3442', 2, () => A.line(c, 0, -6, 2, 14)); c.beginPath(); c.moveTo(-15, -2); c.quadraticCurveTo(0, -18, 15, -2); c.closePath(); c.fillStyle = '#ff8a7a'; c.fill(); c.stroke(); c.save(); c.clip(); c.fillStyle = '#ffffff'; c.fillRect(-6, -16, 4, 16); c.fillRect(4, -16, 4, 16); c.restore(); },
};
const baseIcon = A.icon;
A.icon = (c, id) => { if (ICON2[id]) { A.pen(c); ICON2[id](c); } else baseIcon(c, id); };

/* ───────── four new grounds ───────── */
function hash(x, y) { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; }
function scatter(x0, y0, x1, y1, T, fn) { for (let ix = Math.floor(x0 / T); ix <= Math.floor(x1 / T); ix++) for (let iy = Math.floor(y0 / T); iy <= Math.floor(y1 / T); iy++) { const h = hash(ix, iy); fn(ix * T + (h % (T - 40)) + 20, iy * T + ((h >>> 8) % (T - 40)) + 20, h); } }
const BAND = 720;
function bands(y0, y1, half, fn) { for (let k = Math.floor((y0 - half) / BAND); k <= Math.ceil((y1 + half) / BAND); k++) fn(k * BAND, k); }
const blob = (c, x, y, rx, ry, col, rot = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fillStyle = col; c.fill(); };
const ln = (c, col, w, x1, y1, x2, y2) => { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col; c.lineWidth = w; c.stroke(); };
Object.assign(A.GROUND, {
  school(c, x0, y0, x1, y1) {
    c.fillStyle = '#d4b089'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    scatter(x0, y0, x1, y1, 170, (px, py, h) => { const k = h % 7; if (k === 0) blob(c, px, py, 30, 14, '#c9a47d', h % 6); else if (k === 1) { blob(c, px, py, 2.4, 2, '#b8936c'); blob(c, px + 7, py + 3, 1.8, 1.5, '#b8936c'); } else if (k === 2) { blob(c, px, py, 4, 2.4, '#c39c74', 0.3); blob(c, px + 9, py - 6, 4, 2.4, '#c39c74', 0.3); } });
    bands(y0, y1, 60, y => { if (y + 60 < y0 || y - 60 > y1) return; c.fillStyle = '#c97b5a'; c.fillRect(x0, y - 54, x1 - x0, 108); for (const k of [-54, -18, 18, 54]) ln(c, '#ffffff', 2.5, x0, y + k, x1, y + k); });
  },
  beach(c, x0, y0, x1, y1) {
    c.fillStyle = '#efd9a8'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    scatter(x0, y0, x1, y1, 180, (px, py, h) => { const k = h % 8; if (k === 0) blob(c, px, py, 28, 12, '#e6cd97', h % 6); else if (k === 1) { c.beginPath(); c.arc(px, py, 5, Math.PI, 0); c.fillStyle = '#f7c6c0'; c.fill(); } else if (k === 2) { blob(c, px, py, 2.6, 1.6, '#d9bf8a'); blob(c, px + 6, py + 10, 2.6, 1.6, '#d9bf8a'); blob(c, px + 1, py + 20, 2.6, 1.6, '#d9bf8a'); } });
    bands(y0, y1, 70, (y, k) => { if (y + 70 < y0 || y - 70 > y1) return; c.fillStyle = '#9fd8e8'; c.fillRect(x0, y - 40, x1 - x0, 80); c.fillStyle = '#e3c890'; c.fillRect(x0, y + 40, x1 - x0, 22);
      c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.beginPath(); for (let x = Math.floor(x0 / 40) * 40; x < x1 + 40; x += 40) { c.moveTo(x, y + 40); c.quadraticCurveTo(x + 10, y + 32, x + 20, y + 40); c.quadraticCurveTo(x + 30, y + 48, x + 40, y + 40); } c.stroke();
      c.globalAlpha = 0.5; for (let x = Math.floor(x0 / 90) * 90; x < x1 + 90; x += 90) ln(c, '#ffffff', 2, x + (hash(x, k) % 40), y - 14, x + (hash(x, k) % 40) + 26, y - 14); c.globalAlpha = 1; });
  },
  subway(c, x0, y0, x1, y1) {
    c.fillStyle = '#c9cdd6'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    c.strokeStyle = '#b9bec9'; c.lineWidth = 2; c.beginPath(); for (let x = Math.floor(x0 / 60) * 60; x < x1 + 60; x += 60) { c.moveTo(x, y0); c.lineTo(x, y1); } for (let y = Math.floor(y0 / 60) * 60; y < y1 + 60; y += 60) { c.moveTo(x0, y); c.lineTo(x1, y); } c.stroke();
    scatter(x0, y0, x1, y1, 200, (px, py, h) => { const k = h % 9; if (k === 0) blob(c, px, py, 22, 10, '#bfc4ce', h % 6); else if (k === 1) { c.fillStyle = '#f4f6fb'; c.fillRect(px, py, 14, 9); } });
    bands(y0, y1, 40, y => { if (y + 40 < y0 || y - 40 > y1) return; c.fillStyle = '#f2c94c'; c.fillRect(x0, y - 30, x1 - x0, 30); c.fillStyle = '#d9ae2e'; for (let x = Math.floor(x0 / 12) * 12; x < x1; x += 12) for (const dy of [-24, -14, -4]) { c.beginPath(); c.arc(x + 6, y + dy + 0.5, 2, 0, TAU); c.fill(); } ln(c, '#ffffff', 4, x0, y + 6, x1, y + 6); });
  },
  snow(c, x0, y0, x1, y1) {
    c.fillStyle = '#eef3fb'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    scatter(x0, y0, x1, y1, 170, (px, py, h) => { const k = h % 7; if (k < 2) blob(c, px, py, 34, 16, '#dfe8f5', h % 6); else if (k === 2) { for (let i = 0; i < 3; i++) { blob(c, px + i * 9, py + (i % 2) * 6, 2.4, 3.4, '#c9d6ea'); } } else if (k === 3) { blob(c, px, py, 3, 3, '#ffffff'); } });
    bands(y0, y1, 50, y => { if (y + 50 < y0 || y - 50 > y1) return; c.fillStyle = '#d3e3f4'; c.fillRect(x0, y - 44, x1 - x0, 88); for (const k of [-16, 16]) ln(c, '#bcd1ea', 6, x0, y + k, x1, y + k); });
  },
});
})();

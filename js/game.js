/* 길냥이 서바이벌 — engine and screens */
(() => {
'use strict';
const GN = window.GN, { CATS, WEAPONS, PASSIVES, ENEMIES, STAGES, SHOP, ACHS, RUN_LEN, MAXW, MAXP, WMAX } = GN;
if (GN.art2) GN.art2.install();   // thin-line detailed characters
const { INK, pen, ell, dot, line, icon, drawCat, ART, GROUND } = GN.art;
const $ = s => document.querySelector(s);
const TAU = Math.PI * 2;
const rand = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const pick = a => a[(Math.random() * a.length) | 0];
const fmtTime = t => { t = Math.floor(t); return String((t / 60) | 0).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); };
const num = n => Math.floor(n).toLocaleString('ko-KR');
const COL = { salmon: '#ff8a7a', mint: '#5fd3b3', butter: '#ffd84d' };
const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const SPAWN_MUL = 1.2;   // overall enemy count: spawn rate, swarms, dashers, boss minions and the on-screen cap
const MAX_ENEMIES = Math.round(380 * SPAWN_MUL);
/* scale a small whole count by SPAWN_MUL, rounding up or down at random so the average comes out right */
const moreEnemies = k => Math.floor(k * SPAWN_MUL + Math.random());
const xpNeed = l => l < 20 ? 5 + 10 * (l - 1) : l < 40 ? 195 + 13 * (l - 20) : 455 + 16 * (l - 40);

/* ───────── save ───────── */
const SAVE_KEY = 'gilnyang-save-v2';
const save = { coins: 0, shop: {}, cats: ['cheese'], cat: 'cheese', skill: 'jump', stage: 'alley', endless: false, ach: {}, flags: {}, unlockAll: false, mute: false,
  home: { cats: [], adopted: [], furn: {}, companion: null, uid: 0 },
  stats: { kills: 0, coins: 0, boxes: 0, deaths: 0, runs: 0, bossKills: 0, evolved: {}, best: {}, bestLv: {}, clears: {} } };
const SAVE_DEFAULT = JSON.stringify(save);
function resetSave() { const d = JSON.parse(SAVE_DEFAULT); for (const k of Object.keys(save)) delete save[k]; Object.assign(save, d); }
function loadSave(src) {
  try {
    if (src) resetSave();
    const s = src || JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!s) { const o = JSON.parse(localStorage.getItem('gilnyang-save-v1')); if (o && o.coins > 0) { save.coins = o.coins | 0; save.stats.coins = o.coins | 0; } return; }
    for (const k of ['coins', 'cat', 'skill', 'stage', 'endless', 'unlockAll', 'mute']) if (k in s) save[k] = s[k];
    Object.assign(save.shop, s.shop); Object.assign(save.ach, s.ach); Object.assign(save.flags, s.flags);
    if (Array.isArray(s.cats)) save.cats = s.cats.filter(c => CATS[c]);
    if (s.home) { const h = s.home, H = save.home; H.cats = Array.isArray(h.cats) ? h.cats.filter(c => c && CATS[c.breed]) : []; H.adopted = Array.isArray(h.adopted) ? h.adopted.filter(c => c && CATS[c.breed]) : []; Object.assign(H.furn, h.furn || {}); H.companion = h.companion ?? null; H.uid = h.uid | 0; }
    if (s.stats) for (const k in save.stats) if (k in s.stats) { if (typeof save.stats[k] === 'object') Object.assign(save.stats[k], s.stats[k]); else save.stats[k] = s.stats[k]; }
    if (!save.cats.includes('cheese')) save.cats.push('cheese');
    if (!CATS[save.cat] || !save.cats.includes(save.cat)) save.cat = 'cheese';
    if (!STAGES[save.stage]) save.stage = 'alley';
    if (!GN.SKILLS[save.skill]) save.skill = 'jump';
  } catch (e) { /* storage unavailable: play without saving */ }
}
function writeSave(localOnly) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ }
  if (!localOnly && acct.token) { acct.rev++; acct.dirty = true; writeAcct(); clearTimeout(acct.timer); acct.timer = setTimeout(pushSave, 4000); acctLabel(); }
}

/* ───────── account: an id and a password, progress kept on the server (functions/api) ─────────
   A new id makes an account on the spot and takes this device's progress with it; a known id loads that account's progress.
   Every save is mirrored to the server a few seconds later. With no server (the claude.ai preview) the row stays hidden. */
const ACCT_KEY = 'gilnyang-acct';
const acct = { on: false, id: null, token: null, synced: 0, dirty: false, rev: 0, timer: 0, busy: false, state: '' };
function readAcct() { try { const a = JSON.parse(localStorage.getItem(ACCT_KEY)); if (a && a.token) Object.assign(acct, { id: a.id, token: a.token, synced: a.synced | 0, dirty: !!a.dirty }); } catch (e) { /* ignore */ } }
function writeAcct() { try { if (acct.token) localStorage.setItem(ACCT_KEY, JSON.stringify({ id: acct.id, token: acct.token, synced: acct.synced, dirty: acct.dirty })); else localStorage.removeItem(ACCT_KEY); } catch (e) { /* ignore */ } }
async function api(path, opt = {}) {
  const headers = { 'content-type': 'application/json' };
  if (acct.token && !opt.noAuth) headers.authorization = 'Bearer ' + acct.token;
  let r; try { r = await fetch('/api/' + path, { method: opt.method || 'GET', headers, body: opt.body ? JSON.stringify(opt.body) : undefined, keepalive: !!opt.keepalive, cache: 'no-store' }); }
  catch (e) { const err = new Error('서버에 연결할 수 없어요. 인터넷 연결을 확인해 주세요.'); err.status = 0; throw err; }
  let j = null; try { j = await r.json(); } catch (e) { /* not json */ }
  if (!r.ok || !j) { const err = new Error((j && j.error) || '서버에 연결할 수 없어요.'); err.status = r.status; throw err; }
  return j;
}
async function pushSave(keepalive) {
  clearTimeout(acct.timer);
  if (!acct.token || !acct.dirty) return;
  if (acct.busy) { acct.timer = setTimeout(pushSave, 2000); return; }
  acct.busy = true; acct.state = 'saving'; acctLabel(); const rev = acct.rev;
  try {
    const j = await api('save', { method: 'PUT', body: { data: save }, keepalive: keepalive === true });
    acct.synced = j.updated; if (acct.rev === rev) acct.dirty = false; else acct.timer = setTimeout(pushSave, 2000);
    acct.state = ''; writeAcct();
  } catch (e) {
    if (e.status === 401) dropAcct('로그인이 끝났어요. 다시 로그인하면 이어서 저장돼요.');
    else { acct.state = 'offline'; acct.timer = setTimeout(pushSave, 30000); }
  } finally { acct.busy = false; acctLabel(); }
}
function dropAcct(msg) { acct.token = null; acct.id = null; acct.dirty = false; acct.state = ''; clearTimeout(acct.timer); writeAcct(); acctLabel(); if (msg) toast(msg); }
let logoutArm = 0;
function acctLabel() {
  const row = $('#acctRow'); if (!row) return; row.hidden = !acct.on; if (!acct.on) return;
  const name = $('#acctName'), b = $('#btnAcct');
  if (!acct.token) { name.textContent = '로그인하면 다른 기기에서도 이어서 할 수 있어요'; b.textContent = '로그인'; return; }
  const st = acct.state === 'saving' ? '저장 중…' : acct.state === 'offline' ? '연결 끊김 · 나중에 저장' : acct.dirty ? '곧 저장' : '저장됨';
  name.textContent = ''; name.appendChild(el('b', '', acct.id)); name.appendChild(document.createTextNode(` 님 · ${st}`));
  b.textContent = performance.now() < logoutArm ? '정말 로그아웃?' : '로그아웃';
}
async function doLogin(id, pw) {
  const j = await api('login', { method: 'POST', body: { id, pw }, noAuth: true });
  acct.id = j.id; acct.token = j.token; acct.state = '';
  if (j.save) { loadSave(j.save.data); writeSave(true); acct.synced = j.save.updated; acct.dirty = false; }
  else { acct.synced = 0; acct.dirty = true; acct.rev++; }
  writeAcct(); if (acct.dirty) pushSave();
  return j;
}
async function doLogout() {
  if (acct.dirty) await pushSave();
  try { await api('logout', { method: 'POST' }); } catch (e) { /* the token just expires */ }
  dropAcct(); resetSave(); writeSave(true); refreshTitle(); toast('로그아웃했어요. 이 기기는 새 기록으로 시작해요.');
}
async function initAcct() {
  readAcct();
  if (!/^https?:$/.test(location.protocol)) return;               // opened as a file: no server
  try { await api('ping', { noAuth: true }); acct.on = true; } catch (e) { acct.on = false; }
  acctLabel(); if (!acct.on || !acct.token) return;
  try {
    const j = await api('save');
    if (j.save && j.save.updated > acct.synced && !acct.dirty) {     // played on another device since: take that
      loadSave(j.save.data); writeSave(true); acct.synced = j.save.updated; writeAcct();
      if (state === 'title') refreshTitle();
    } else if (!j.save || acct.dirty) { acct.dirty = true; pushSave(); }
  } catch (e) { if (e.status === 401) dropAcct('로그인이 끝났어요. 다시 로그인해 주세요.'); else { acct.state = 'offline'; acctLabel(); } }
}
window.addEventListener('pagehide', () => { if (acct.dirty) pushSave(true); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && acct.dirty) pushSave(true); });
const LOCK = { w: {}, p: {}, stage: {}, cat: {} }, ACH_BY = {};
for (const a of ACHS) { ACH_BY[a.id] = a; if (a.rw.w) LOCK.w[a.rw.w] = a; if (a.rw.p) LOCK.p[a.rw.p] = a; if (a.rw.stage) LOCK.stage[a.rw.stage] = a; }
for (const id in CATS) if (CATS[id].req) LOCK.cat[id] = ACH_BY[CATS[id].req];
const unlocked = (kind, id) => save.unlockAll || !LOCK[kind][id] || !!save.ach[LOCK[kind][id].id];
let devNoShop = false;                          // the practice range can switch permanent upgrades off
const shopLv = id => devNoShop ? 0 : save.shop[id] || 0;

/* ───────── sound ───────── */
let AC = null; const sfxAt = {};
function initAudio() { if (AC) return; try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
function tone(type, f0, f1, dur, vol, delay = 0) {
  const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + 0.02);
}
function sfx(name) {
  if (save.mute || !AC) return;
  const now = performance.now(), gap = { hit: 60, pick: 45, boom: 90, zap: 90, meow: 200 }[name] || 0;
  if (gap && now - (sfxAt[name] || 0) < gap) return; sfxAt[name] = now;
  try {
    if (name === 'hit') tone('square', 260, 120, 0.05, 0.022);
    else if (name === 'pick') tone('sine', 900, 1400, 0.06, 0.035);
    else if (name === 'coin') tone('triangle', 1200, 1800, 0.09, 0.05);
    else if (name === 'hurt') tone('sawtooth', 240, 70, 0.2, 0.07);
    else if (name === 'meow') { tone('sine', 760, 520, 0.22, 0.05); tone('triangle', 1140, 780, 0.22, 0.02); }
    else if (name === 'boom') tone('sawtooth', 140, 40, 0.2, 0.05);
    else if (name === 'zap') tone('square', 1400, 300, 0.09, 0.03);
    else if (name === 'lvl') { tone('triangle', 523, 523, 0.1, 0.06); tone('triangle', 659, 659, 0.1, 0.06, 0.09); tone('triangle', 784, 784, 0.18, 0.06, 0.18); }
    else if (name === 'box') { tone('triangle', 392, 392, 0.1, 0.06); tone('triangle', 587, 587, 0.1, 0.06, 0.1); tone('triangle', 880, 880, 0.25, 0.07, 0.2); }
    else if (name === 'warn') tone('square', 520, 520, 0.12, 0.04);
    else if (name === 'jump') tone('sine', 420, 980, 0.16, 0.06);
    else if (name === 'hiss') { tone('sawtooth', 900, 260, 0.28, 0.05); tone('square', 1500, 700, 0.2, 0.02); }
    else if (name === 'lose') tone('sine', 500, 200, 0.5, 0.08);
    else if (name === 'win') [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.2, 0.07, i * 0.13));
  } catch (e) { /* ignore */ }
}

/* ───────── canvas & sprite caches ───────── */
const cv = $('#game'), ctx = cv.getContext('2d');
let W = 800, H = 600, DPR = 1, ZOOM = 1;
function resize() {
  const r = cv.getBoundingClientRect();
  W = Math.max(200, r.width); H = Math.max(200, r.height);
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ZOOM = clamp(Math.sqrt(W * H) / 900, 0.6, 1.25);
}
window.addEventListener('resize', resize);
const viewR = () => Math.hypot(W, H) / 2 / ZOOM + 36;

const SPS = 2.5, SPF = 6, sprCache = {}, icoCache = {};
function enemySprite(type) {
  let s = sprCache[type]; if (s) return s;
  const T = ENEMIES[type], big = T.big || 1, R = Math.ceil(T.r * 2.3 + 12), sps = T.boss ? 2 : SPS, nf = T.boss ? 3 : SPF, size = Math.round(R * 2 * sps);
  s = { R, n: nf, f: [[], []], w: [[], []] };
  for (let d = 0; d < 2; d++) for (let i = 0; i < nf; i++) {
    const el = document.createElement('canvas'); el.width = el.height = size; const c = el.getContext('2d');
    c.translate(size / 2, size / 2); c.scale((d ? -1 : 1) * sps * big, sps * big); pen(c); c.save(); ART[T.art || type](c, i / nf * TAU); c.restore();
    if (T.crown) { pen(c); c.translate(T.crownX || 0, 0); GN.art.crown(c, T.crown); }
    s.f[d].push(el); if (!s.col) s.col = avgColor(el);
    const wl = document.createElement('canvas'); wl.width = wl.height = size; const wc = wl.getContext('2d');
    wc.drawImage(el, 0, 0); wc.globalCompositeOperation = 'source-atop'; wc.fillStyle = 'rgba(255,255,255,.85)'; wc.fillRect(0, 0, size, size); s.w[d].push(wl);
  }
  return sprCache[type] = s;
}
function shadeIcon(c, size) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop';
  const g = c.createLinearGradient(0, 0, size, size); g.addColorStop(0, 'rgba(255,255,255,.3)'); g.addColorStop(0.42, 'rgba(255,255,255,0)'); g.addColorStop(0.58, 'rgba(48,24,72,0)'); g.addColorStop(1, 'rgba(48,24,72,.24)');
  c.fillStyle = g; c.fillRect(0, 0, size, size); c.restore();
}
function icoSprite(id) {
  let s = icoCache[id]; if (s) return s;
  s = document.createElement('canvas'); s.width = s.height = 96; const c = s.getContext('2d'); c.translate(48, 48); c.scale(2.4, 2.4); icon(c, id); shadeIcon(c, 96);
  return icoCache[id] = s;
}
function drawIco(c, id, x, y, size, rot) {
  const s = icoSprite(id);
  if (rot) { c.save(); c.translate(x, y); c.rotate(rot); c.drawImage(s, -size / 2, -size / 2, size, size); c.restore(); }
  else c.drawImage(s, x - size / 2, y - size / 2, size, size);
}
function mkIcon(id, css = 40) {
  const el = document.createElement('canvas'); el.width = el.height = css * 2; const c = el.getContext('2d');
  c.translate(css, css); c.scale(css * 2 / 40, css * 2 / 40); icon(c, id); shadeIcon(c, css * 2); return el;
}
function mkCat(id, css = 56) {
  const el = document.createElement('canvas'); el.width = el.height = css * 2; const c = el.getContext('2d');
  c.translate(css, css + 6); c.scale(css * 2 / 46, css * 2 / 46); drawCat(c, CATS[id].look, 0, false); return el;
}
function mkEnemy(type, css = 40) {
  const el = document.createElement('canvas'); el.width = el.height = css * 2; const c = el.getContext('2d'), T = ENEMIES[type], k = css * 2 / (T.r * (T.big ? 2.6 : 3.6) + 10);
  c.translate(css, css); c.scale(k * (T.big || 1), k * (T.big || 1)); pen(c); c.save(); ART[T.art || type](c, 0.6); c.restore(); if (T.crown) { pen(c); c.translate(T.crownX || 0, 0); GN.art.crown(c, T.crown); } return el;
}

/* ───────── run state ───────── */
let G = null, state = 'title';
const input = { keys: new Set(), joy: null, auto: null };

function newRun() {
  G = { t: 0, kills: 0, coins: 0, earned: 0, boxes: 0, bossKills: 0, level: 1, xp: 0, need: xpNeed(1), pendingLv: 0, won: false, endT: -1, cleared: false, quit: false, merged: false,
    stageId: save.stage, stage: STAGES[save.stage], endless: !!(save.endless && (save.flags.endless || save.unlockAll)), catId: save.cat,
    rerolls: shopLv('reroll'), skips: shopLv('skip'), banishes: shopLv('banish'), banned: {}, revUsed: 0, revTotal: 0,
    p: { x: 0, y: 0, r: 13, hp: 1, maxHp: 1, fx: 1, fy: 0, face: 1, inv: 0, moving: false, jump: null, hide: 0, weapons: [], passives: [] },
    enemies: [], shots: [], zones: [], picks: [], fx: [], ebul: [], dmgBy: {}, acc: 0, wave: [], waveMin: -1, hi: 0,
    nextElite: 120, nextSwarm: 60, nextDash: 150, nextProp: 6, nextBoss: 600, nextHorde: 300, hordeUntil: 0, bossN: 0, boss: null,
    shake: 0, nums: 0, freeze: 0, achT: 1, newAchs: [], parts: [], hitstop: 0, vig: 0, flashFx: null, fxBudget: 0, trailT: 0,
    squad: [], rescues: [], rescued: [], trail: [], nextRescue: 25, lastScare: -99, rescueCount: 0, rescueTold: false, rescueSpd: 1, compMul: 1,
    sk: { id: save.skill, cd: 0, max: 1 } };
  G.rescueSpd = hasF('plant') ? 1.3 : 1; G.compMul = hasF('toy') ? 1.4 : 1;
  G.squadMax = GN.SQUAD_MAX + shopLv('squadMax'); G.squadBuff = 0; G.frenzy = 0; G.shieldT = 0;
  const comp = save.home.cats.find(c => c.uid === save.home.companion);
  if (comp) { const m = newMember(comp.breed, comp.name, -24, 4); m.companion = true; m.stars = bondStars(comp.bond); G.squad.push(m); }
  addWeapon(CATS[save.cat].weapon); recalc(); G.p.hp = G.p.maxHp;
  if (shopLv('startWeapon')) { const pool = Object.keys(WEAPONS).filter(id => id !== CATS[save.cat].weapon && unlocked('w', id)); if (pool.length) { addWeapon(pick(pool)); recalc(); } }
  const sl = shopLv('startLv'); if (sl) { G.level += sl; G.need = xpNeed(G.level); G.pendingLv += sl; }
}
function addWeapon(id) { G.p.weapons.push({ id, lv: 1, evo: false, t: 0.4, ang: 0, burst: 0, bt: 0, tt: 0, pets: [], S: null }); }
const plv = id => { const s = G.p.passives.find(x => x.id === id); return s ? s.lv : 0; };
function computeW(w) {
  const D = WEAPONS[w.id], p = G.p, s = Object.assign({ dmg: 0, cd: 0, amount: 0, area: 1, speed: 1, dur: 1, pierce: 0 }, D.base);
  let cdm = 1;
  for (let i = 0; i < w.lv - 1; i++) { const u = D.ups[i]; for (const k in u) { if (k === 'cd') cdm += u[k]; else s[k] = (s[k] || 0) + u[k]; } }
  s.cd *= cdm; if (w.evo) Object.assign(s, D.evo.set);
  s.dmg *= (w.evo ? GN.BALE : GN.BAL)[w.id] || 1;
  s.area *= p.area; s.speed *= p.pspeed; s.dur *= p.dur; s.cd *= p.cdMul; if (!D.noAmount) s.amount += p.amount;
  w.S = s;
}
function recalc() {
  const p = G.p, C = CATS[G.catId], m = C.mod, s = shopLv;
  p.might = 1 + (hasF('scratcher') ? 0.05 : 0) + 0.1 * plv('catnip') + 0.05 * s('might') + (m.might || 0) + (C.trait === 'grow' ? Math.min(0.5, Math.floor(G.level / 10) * 0.1) : 0);
  p.armor = plv('collar') + s('armor') + (m.armor || 0);
  p.cdMul = Math.max(0.3, 1 - 0.06 * plv('whisker') - 0.025 * s('cooldown') + (m.cd || 0));
  p.spd = 150 * (1 + 0.08 * plv('paw') + 0.05 * s('move') + (m.move || 0));
  p.area = 1 + 0.1 * plv('tail') + 0.05 * s('area') + (m.area || 0);
  p.pspeed = 1 + 0.1 * plv('feather') + 0.1 * s('pspeed') + (m.pspeed || 0);
  p.dur = 1 + 0.1 * plv('cushion') + 0.15 * s('dur') + (m.dur || 0);
  p.amount = plv('mirror') + s('amount') + (m.amount || 0);
  p.magnet = 70 * (1 + 0.3 * plv('bell') + 0.25 * s('magnet'));
  p.luck = 1 + 0.1 * plv('clover') + 0.1 * s('luck') + (m.luck || 0);
  p.growth = 1 + 0.08 * plv('crown') + 0.03 * s('growth') + (m.growth || 0);
  p.greed = 1 + 0.1 * plv('piggy') + 0.1 * s('greed') + (m.greed || 0);
  p.curse = 1 + 0.1 * plv('glare');
  p.regen = 0.3 * plv('snack') + 0.1 * s('recovery') + (m.regen || 0);
  p.crit = 0.05 * plv('fang') + 0.02 * s('critC') + (m.crit || 0); p.critDmg = 0.25 * plv('hunter') + 0.1 * s('critD');
  p.leech = 0.3 * plv('warmFur') + 0.1 * s('leech'); p.knock = 1 + 0.25 * plv('heavyPaw') + 0.15 * s('knock');
  p.dodge = Math.min(0.5, 0.04 * plv('windBell') + 0.01 * s('dodge')); p.thorns = plv('thornScarf') + s('thorn');
  p.bossDmg = 0.15 * plv('bossBadge') + 0.05 * s('bossDmg');
  p.rescueMul = 1 + 0.2 * plv('rescueVest') + 0.1 * s('rescue') + (hasF('tunnel') ? 0.15 : 0);
  p.squadMul = 1 + 0.15 * plv('leaderScarf') + (hasF('flowerbed') ? 0.1 : 0); p.skillMul = Math.max(0.4, 1 - 0.08 * plv('stretch'));
  p.coinDrop = 1 + 0.3 * plv('coinLuck') + 0.1 * s('coinDrop'); const sh = plv('shieldFur'); p.shieldCd = sh ? 14 - 2 * sh : s('shield') ? 15 : 0;
  p.berserk = plv('nightOwl') ? 0.1 + 0.1 * plv('nightOwl') : 0; p.stillRegen = plv('napPillow'); p.pierce = plv('awl') + s('pierce'); p.momentum = 0.08 * plv('dashShoes');
  p.curse += 0.1 * s('challenge'); p.greed += 0.15 * s('challenge') + (hasF('parasol') ? 0.05 : 0);
  const mh = Math.max(20, Math.round((100 + (m.hp || 0) + (hasF('bowl') ? 10 : 0) + (hasF('fountain') ? 10 : 0)) * (1 + 0.2 * plv('belly') + 0.1 * s('maxhp'))));
  if (mh > p.maxHp) p.hp += mh - p.maxHp; p.maxHp = mh; p.hp = Math.min(p.hp, mh);
  G.revTotal = plv('ninelives') + s('revival');
  for (const w of p.weapons) computeW(w);
}
const wname = w => w.evo ? WEAPONS[w.id].evo.name : WEAPONS[w.id].name;

/* ───────── spatial grid ───────── */
const CELL = 56; let grid = new Map();
const gkey = (cx, cy) => ((cx & 0xffff) << 16) | (cy & 0xffff);
function buildGrid() {
  grid = new Map();
  for (const e of G.enemies) { if (e.dead) continue; const k = gkey(Math.floor(e.x / CELL), Math.floor(e.y / CELL)); let a = grid.get(k); if (!a) grid.set(k, a = []); a.push(e); }
}
function forNear(x, y, r, fn) {
  r += 48;
  const x0 = Math.floor((x - r) / CELL), x1 = Math.floor((x + r) / CELL), y0 = Math.floor((y - r) / CELL), y1 = Math.floor((y + r) / CELL);
  for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) { const a = grid.get(gkey(cx, cy)); if (a) for (let i = 0; i < a.length; i++) if (!a[i].dead) fn(a[i]); }
}
function nearest(x, y, max, skip) {
  let best = null, bd = max * max;
  for (const e of G.enemies) { if (e.dead || e.T.prop || e === skip) continue; const d = (e.x - x) ** 2 + (e.y - y) ** 2; if (d < bd) { bd = d; best = e; } }
  return best;
}
function randTarget(maxD) {
  const p = G.p, L = G.enemies;
  for (let k = 0; k < 8 && L.length; k++) { const e = L[(Math.random() * L.length) | 0]; if (!e.dead && !e.T.prop && Math.hypot(e.x - p.x, e.y - p.y) < maxD) return e; }
  return null;
}

/* ───────── spawning ───────── */
function spawn(type, o = {}) {
  const T = ENEMIES[type], p = G.p, elite = !!o.elite, m = G.t / 60;
  const fixed = !!(T.dash || T.boss || T.prop);
  const hm = (T.prop ? 1 : T.boss ? (o.hpMul || 1) : (1 + m * 0.1 + Math.max(0, m - 30) * 0.25) * p.curse) * (T.prop ? 1 : G.stage.hpMul || 1);
  const a = o.ang ?? rand(TAU), dist = o.dist ?? viewR(), sc = elite ? 1.6 : 1;
  const e = { type, T, x: o.x ?? p.x + Math.cos(a) * dist, y: o.y ?? p.y + Math.sin(a) * dist,
    hp: T.hp * hm * (elite ? 10 + m * 0.6 : 1), spd: T.spd * (elite ? 0.9 : 1) * rand(0.92, 1.08) * (fixed ? 1 : 1 + (p.curse - 1) * 0.5),
    dmg: T.dmg * (elite ? 1.4 : 1) * (1 + Math.min(m, 40) / 30 * 0.5), r: T.r * sc, xp: T.xp * (elite ? 10 : 1), elite, sc, flash: 0, hitT: 0, kx: 0, ky: 0, slow: 0, stun: 0,
    yarnT: 0, boneT: 0, ballT: 0, petT: 0, seed: Math.random(), dead: false, face: 1, heavy: elite || fixed, fixed, vx: 0, vy: 0, life: 0, mode: 'chase', mt: 4, ms: 0, final: false };
  e.maxHp = e.hp; G.enemies.push(e); return e;
}
function banner(text) { const b = $('#banner'); b.textContent = text; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); }
let toastTimer = 0;
function toast(text) { const b = $('#toast'); b.textContent = text; b.hidden = false; b.classList.toggle('top', state !== 'play'); clearTimeout(toastTimer); toastTimer = setTimeout(() => { b.hidden = true; }, 3200); }
function buildWave(m) {
  const R = G.stage.roster, n = R.length, mm = Math.min(m, 29), f = mm / 30 * n, hi = Math.min(n - 1, Math.floor(f));
  const w = [[R[hi], 0.55]]; if (hi > 0) w.push([R[hi - 1], 0.35]); if (hi > 1) w.push([R[hi - 2], 0.15]);
  if (hi + 1 < n && f % 1 > 0.6) w.push([R[hi + 1], 0.12]);
  G.wave = w; G.hi = hi;
}
function waveType() { let r = rand(G.wave.reduce((s, x) => s + x[1], 0)); for (const x of G.wave) { r -= x[1]; if (r <= 0) return x[0]; } return G.wave[0][0]; }
function spawnUpdate(dt) {
  if (G.dev && !G.dev.mobs) return;
  const t = G.t, p = G.p, m = Math.floor(t / 60), R = G.stage.roster;
  if (m !== G.waveMin) { G.waveMin = m; buildWave(m); }
  const bossAlive = G.boss && !G.boss.dead;
  const rate = (1.3 + Math.min(m, 45) * 0.5) * SPAWN_MUL * p.curse * (t < G.hordeUntil ? 2.2 : 1) * (bossAlive ? 0.55 : 1);
  G.acc += rate * dt;
  while (G.acc >= 1) { G.acc--; if (G.enemies.length < MAX_ENEMIES) spawn(t < G.hordeUntil ? R[Math.max(0, G.hi - 2)] : waveType()); }
  if (t >= G.nextSwarm) {
    G.nextSwarm += 90; const type = R[Math.max(0, G.hi - 1)], n = Math.round(Math.min(40, 12 + m * 2) * SPAWN_MUL);
    for (let i = 0; i < n; i++) if (G.enemies.length < MAX_ENEMIES) spawn(type, { ang: i / n * TAU, dist: viewR() * 0.95 });
    banner(ENEMIES[type].name + ' 떼가 몰려온다!'); sfx('warn');
  }
  if (t >= G.nextHorde) { G.nextHorde += 300; G.hordeUntil = t + 20; banner(ENEMIES[R[Math.max(0, G.hi - 2)]].name + ' 대이동!'); sfx('warn'); }
  if (t >= G.nextElite) {
    G.nextElite += 120; if (!bossAlive) { const type = R[G.hi]; spawn(type, { elite: true }); banner('골목대장 ' + ENEMIES[type].name + ' 등장!'); sfx('warn'); }
  }
  if (t >= G.nextDash) {
    G.nextDash += 24; const n = moreEnemies(1 + Math.min(4, Math.floor(m / 7))); sfx('warn');
    for (let i = 0; i < n; i++) { const a = rand(TAU), d = viewR() + 60; G.fx.push({ type: 'warn', x: p.x - Math.cos(a) * d, y: p.y - Math.sin(a) * d, ang: a, len: d * 2, t: 0, life: 1 + i * 0.3 }); }
  }
  if (t >= G.nextBoss) {
    G.nextBoss += 600; G.bossN++; const n = G.bossN, mul = n === 1 ? 1 : n === 2 ? 2.6 : 5 * Math.pow(1.6, n - 3);
    const b = spawn(G.stage.boss, { hpMul: mul }); b.final = n === 3 && !G.endless; G.boss = b;
    banner(ENEMIES[G.stage.boss].name + ' 등장!'); sfx('warn');
  }
  if (t >= G.nextProp) { G.nextProp += rand(14, 22); spawn(G.stage.prop, { dist: viewR() * rand(0.5, 0.9) }); }
}

/* ───────── combat ───────── */
function addNum(x, y, n, crit) { if (G.nums > 50) return; G.nums++; G.fx.push({ type: 'num', x: x + rand(-6, 6), y, n, crit, t: 0, life: 0.55 }); }
function hurt(e, base, src, kx = 0, ky = 0, crit = false) {
  if (e.dead) return false;
  if (CUR.id && src === CUR.kind) src = CUR.id;
  const P = G.p; if (!crit && P.crit && src !== 'squad' && Math.random() < P.crit) crit = true;
  const dmg = Math.max(1, Math.round(base * P.might * rand(0.9, 1.1) * (crit ? 2 + P.critDmg : 1) * (e.elite || e.T.boss ? 1 + P.bossDmg : 1) * (P.berserk && P.hp < P.maxHp * 0.5 ? 1 + P.berserk : 1)));
  e.hp -= dmg; e.flash = 0.09; e.hitT = 0.14; fxHit(e, kx, ky, crit); G.dmgBy[src] = (G.dmgBy[src] || 0) + Math.min(dmg, e.hp + dmg);
  if (G.dev && e === G.boss) G.dev.bossBy[src] = (G.dev.bossBy[src] || 0) + Math.min(dmg, e.hp + dmg);
  if (!e.heavy) { e.kx += kx * P.knock; e.ky += ky * P.knock; }
  addNum(e.x, e.y - e.r, dmg, crit); sfx('hit');
  if (e.hp <= 0) { kill(e); return true; }
  return false;
}
function boom(x, y, r, dmg, src, o = {}) {
  forNear(x, y, r, e => { const dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy) || 1; if (d < r + e.r) { const k = hurt(e, dmg, src, dx / d * 150, dy / d * 150); if (o.stun && !e.T.boss) e.stun = o.stun; if (k && o.coin && Math.random() < o.coin) drop('coin', e.x, e.y, 1); } });
  G.fx.push({ type: 'ring', x, y, r, t: 0, life: 0.3, col: o.col || COL.butter }); sfx('boom');
  glow(x, y, r * 1.1, o.col || COL.butter, 0.22, 0.55); sparks(x, y, 8, '#ffd36b', 0, Math.PI, r * 5); smoke(x, y, 3, r * 0.35);
}
function drop(type, x, y, val = 1) {
  if (type === 'xp' && G.picks.length > 420) { const k = G.picks.find(q => q.type === 'xp'); if (k) { k.val += val; return; } }
  G.picks.push({ type, x: x + rand(-6, 6), y: y + rand(-6, 6), val, pull: false, sp: 0, dead: false, seed: rand(TAU) });
}
function kill(e) {
  e.dead = true; const T = e.T, p = G.p;
  fxKill(e);
  if (T.prop) { const r = Math.random(); drop(r < 0.4 ? 'churu' : r < 0.65 ? 'bag' : r < 0.8 ? 'bell' : r < 0.9 ? 'hiss' : 'clock', e.x, e.y, 10); return; }
  G.kills++; if (p.leech) p.hp = Math.min(p.maxHp, p.hp + p.leech);
  if (T.boss && G.dev) { G.dev.killT = G.t; G.won = true; G.endT = G.t + 1.5; G.shake = 16; sfx('boom'); banner(T.name + ' 격파!'); for (const o of G.enemies) if (!o.dead && o !== e) o.dead = true; return; }
  if (T.boss) {
    G.bossKills++; G.shake = 16; sfx('boom'); drop('box', e.x, e.y); drop('bag', e.x + 20, e.y, 50); drop('churu', e.x - 20, e.y);
    if (G.bossN >= 3 && !G.cleared) { G.cleared = true; save.stats.clears[G.stageId] = (save.stats.clears[G.stageId] || 0) + 1; }
    if (e.final) { G.won = true; G.endT = G.t + 1.8; for (const o of G.enemies) if (!o.dead && o !== e) o.dead = true; }
    else banner(T.name + ' 격파!');
    return;
  }
  if (e.xp > 0) drop('xp', e.x, e.y, e.xp);
  if (e.elite) { drop('box', e.x, e.y); return; }
  if (p.coinDrop > 1 && Math.random() < 0.06 * (p.coinDrop - 1)) drop('coin', e.x + 6, e.y, 1);
  const r = Math.random() / p.luck;
  if (r < 0.06) drop('coin', e.x, e.y, 1); else if (r < 0.064) drop('churu', e.x, e.y); else if (r < 0.066) drop('bag', e.x, e.y, 10);
  else if (r < 0.0675) drop('bell', e.x, e.y); else if (r < 0.0683) drop('hiss', e.x, e.y); else if (r < 0.069) drop('clock', e.x, e.y);
}
function hurtPlayer(d) {
  const p = G.p; if (p.inv > 0 || G.endT >= 0 || p.jump || p.hide > 0) return;
  if (G.dev) { G.dev.hits++; G.dev.taken += Math.max(1, d - p.armor); if (G.dev.god) { p.inv = 0.55; G.vig = 0.6; return; } }
  if (p.dodge && Math.random() < p.dodge) { p.inv = 0.25; addNum(p.x, p.y - 22, '피함'); return; }
  if (p.shieldCd && G.shieldT <= 0) { G.shieldT = p.shieldCd; p.inv = 0.5; G.fx.push({ type: 'ring', x: p.x, y: p.y, r: 34, t: 0, life: 0.35, col: '#9fd0ff' }); sfx('box'); return; }
  if (p.thorns) forNear(p.x, p.y, 80, e => { if (!e.T.prop && Math.hypot(e.x - p.x, e.y - p.y) < 80 + e.r) hurt(e, 8 * p.thorns * (1 + G.level * 0.03), 'thorns'); });
  p.hp -= Math.max(1, d - p.armor); p.inv = 0.55; G.shake = 9; sfx('hurt'); padRumble(140, 0.55); G.vig = 1; hitStop(0.035);
  if (G.squad.length && G.t - G.lastScare > 12 && Math.random() < 0.5) scareOne();
  if (p.hp > 0) return;
  if (G.revUsed < G.revTotal) {
    G.revUsed++; p.hp = p.maxHp * 0.5; p.inv = 2.5; banner('아홉 목숨! 다시 일어났다'); sfx('box');
    forNear(p.x, p.y, 240, e => { if (Math.hypot(e.x - p.x, e.y - p.y) < 240) hurt(e, e.heavy ? 150 : 9999, 'hiss'); });
    G.fx.push({ type: 'ring', x: p.x, y: p.y, r: 240, t: 0, life: 0.5, col: COL.salmon });
  } else { p.hp = 0; G.endT = G.t + 1.0; G.won = false; sfx('lose'); }
}
const angDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

/* ───────── weapons ───────── */
function slash(ang, range, dmg, full, src = 'claw') {
  const p = G.p;
  forNear(p.x, p.y, range, e => {
    const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
    if (d < range + e.r && (full || d < 26 || angDiff(Math.atan2(dy, dx), ang) < 1.15)) hurt(e, dmg, src, dx / d * 130, dy / d * 130);
  });
  G.fx.push({ type: 'slash', x: p.x, y: p.y, ang, r: range, full, t: 0, life: 0.2 });
}
function fireHair(w, S, off) {
  const p = G.p, tg = nearest(p.x, p.y, 520);
  const a = (tg ? Math.atan2(tg.y - p.y, tg.x - p.x) : Math.atan2(p.fy, p.fx)) + off + rand(-0.07, 0.07) * (S.rapid ? 2.5 : 1), sp = 390 * S.speed;
  G.shots.push({ kind: 'hair', x: p.x, y: p.y - 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: S.rapid ? 9 : 7, dmg: S.dmg, pierce: S.pierce, life: 1.5, hit: [], dead: false });
}
function strike(x, y, S, chain, from) {
  const r = 34 * S.area;
  G.fx.push({ type: 'bolt', x1: from ? from.x : x + rand(-30, 30), y1: from ? from.y : y - 320, x2: x, y2: y, seed: rand(100), t: 0, life: 0.16 });
  let first = null;
  forNear(x, y, r, e => { if (Math.hypot(e.x - x, e.y - y) < r + e.r) { if (!first) first = e; hurt(e, from ? S.dmg * 0.6 : S.dmg, 'static'); if (S.blind && !e.T.boss) e.stun = Math.max(e.stun, S.blind); } });
  sfx('zap'); glow(x, y, 30, '#fff6a8', 0.18, 0.9); sparks(x, y, 4, COL.butter, -Math.PI / 2, 1.4, 300);
  if (chain > 0) { const nx = nearest(x, y, 150, first); if (nx) strike(nx.x, nx.y, S, chain - 1, { x, y }); }
}
const FIRE = {
  claw(w, S) {
    const p = G.p, range = 80 * S.area, tg = S.aim ? nearest(p.x, p.y, range + 120) : null, face = tg ? Math.atan2(tg.y - p.y, tg.x - p.x) : Math.atan2(p.fy, p.fx);
    const n = Math.max(1, S.amount), full = S.full || n >= 5;
    if (full) slash(face, range, S.dmg, true); else for (let i = 0; i < n; i++) slash(face + i * TAU / n, range, S.dmg, false);
    if (S.echo) G.fx.push({ type: 'echo', t: 0, life: S.echo, ang: face + 0.4, range, dmg: S.dmg * 0.6, full, n, src: w.id });
  },
  hairball(w, S) {
    if (S.rapid) { for (let i = 0; i < S.amount; i++) fireHair(w, S, (i - (S.amount - 1) / 2) * 0.22); }
    else if (S.fan) { for (let i = 0; i < S.amount; i++) fireHair(w, S, (i - (S.amount - 1) / 2) * S.fan); }
    else { fireHair(w, S, 0); w.burst = S.amount - 1; w.bt = 0.09; }
  },
  fishbone(w, S) {
    const p = G.p, tg = nearest(p.x, p.y, 420), base = tg ? Math.atan2(tg.y - p.y, tg.x - p.x) : Math.atan2(p.fy, p.fx);
    for (let i = 0; i < S.amount; i++) G.shots.push({ kind: 'bone', x: p.x, y: p.y, ang: base + (i - (S.amount - 1) / 2) * 0.5, sp: 470 * S.speed, back: false, r: 13 * S.area, dmg: S.dmg, rot: 0, life: 5, dead: false, smack: S.smack });
  },
  meow(w, S) {
    const p = G.p, R = 115 * S.area;
    forNear(p.x, p.y, R, e => { const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1; if (d < R + e.r) { const k = S.pull ? -Math.min(220, d * 2.2) : 280; hurt(e, S.dmg, 'meow', dx / d * k, dy / d * k); if (S.stun && !e.T.boss) e.stun = S.stun; } });
    G.fx.push({ type: 'ring', x: p.x, y: p.y, r: R, t: 0, life: 0.35, col: COL.butter }); sfx('meow');
  },
  tuna(w, S) {
    const p = G.p, vr = viewR() * 0.8;
    for (let i = 0; i < S.amount; i++) { const tg = randTarget(vr); G.fx.push({ type: 'can', x: tg ? tg.x : p.x + rand(-160, 160), y: tg ? tg.y : p.y + rand(-160, 160), t: -i * 0.1, life: 0.5, r: 55 * S.area, dmg: S.dmg, coin: S.coin, patch: S.patch }); }
  },
  purr(w, S) {
    const p = G.p, R = auraR(S); let any = false;
    forNear(p.x, p.y, R, e => { const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1; if (d < R + e.r) { any = true; hurt(e, S.dmg, 'purr', dx / d * 30, dy / d * 30); } });
    if (any && S.heal) p.hp = Math.min(p.maxHp, p.hp + S.heal);
  },
  spill(w, S) {
    const p = G.p;
    for (let i = 0; i < S.amount; i++) { const tg = randTarget(280); const da = rand(TAU), dv = S.confuse ? 26 : 0; G.zones.push({ kind: 'puddle', x: tg ? tg.x : p.x + rand(-150, 150), y: tg ? tg.y : p.y + rand(-150, 150), r: 46 * S.area, life: 3 * S.dur, max: 3 * S.dur, tick: 0.15, dmg: S.dmg, slow: S.slow, confuse: S.confuse, vx: Math.cos(da) * dv, vy: Math.sin(da) * dv, seed: rand(TAU), dead: false }); }
  },
  bowl(w, S) {
    const p = G.p, n = S.amount;
    for (let i = 0; i < n; i++) G.shots.push({ kind: 'lob', x: p.x, y: p.y - 6, vx: (i - (n - 1) / 2) * 75 + p.face * 70 + rand(-20, 20), vy: -440 * Math.sqrt(S.speed), r: 12 * S.area, dmg: S.dmg, pierce: S.pierce, hit: [], rot: 0, life: 3, dead: false, bounce: S.bounce });
  },
  static(w, S) {
    const vr = viewR() * 0.8, p = G.p;
    if (S.blind) { const near = G.enemies.filter(e => !e.dead && !e.T.prop && Math.hypot(e.x - p.x, e.y - p.y) < 320).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)); for (let i = 0; i < S.amount && i < near.length; i++) strike(near[i].x, near[i].y, S, S.chain || 0, null); return; }
    for (let i = 0; i < S.amount; i++) { const tg = randTarget(vr); if (tg) strike(tg.x, tg.y, S, S.chain || 0, null); }
  },
  ball(w, S) {
    const p = G.p;
    for (let i = 0; i < S.amount; i++) { const a = rand(TAU), sp = 330 * S.speed; G.shots.push({ kind: 'ball', x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 10 * S.area, dmg: S.dmg, life: 4 * S.dur, rot: 0, dead: false, rico: S.rico }); }
  },
  twister(w, S) {
    const p = G.p, base = Math.random() * TAU;
    for (let i = 0; i < S.amount; i++) {
      const a = base + i / S.amount * TAU;
      G.zones.push({ kind: 'twister', x: p.x + Math.cos(a) * 24, y: p.y + Math.sin(a) * 24, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150, sp: 95 * S.speed, r: 40 * S.area, life: 3.2 * S.dur, max: 3.2 * S.dur, tick: 0.1, dmg: S.dmg, wob: rand(TAU), spin: Math.random() < 0.5 ? -1 : 1, tg: null, dead: false });
    }
    sfx('meow');
  },
  tailwhip(w, S) {
    const p = G.p, wd = 130 * S.area, hh = 24 * S.area;
    if (S.vertical) {
      for (let i = 0; i < S.amount; i++) {
        const dir = i % 2 === 0 ? -1 : 1, cx = p.x + (Math.floor(i / 2) * 36 * S.area) * p.face, cy = p.y - 4 + dir * wd / 2;
        forNear(cx, cy, wd / 2, e => { if (Math.abs(e.x - cx) < hh + e.r && Math.abs(e.y - cy) < wd / 2 + e.r) hurt(e, S.dmg, 'tailwhip', 0, dir * 170, !!S.crit && Math.random() < S.crit); });
        G.fx.push({ type: 'whip', x: cx, y: p.y - 4, dir, w: wd, h: hh, t: -i * 0.05, life: 0.22, vert: true });
      }
      return;
    }
    for (let i = 0; i < S.amount; i++) {
      const dir = (i % 2 === 0 ? p.face : -p.face), cy = p.y - 4 - Math.floor(i / 2) * 36 * S.area, cx = p.x + dir * wd / 2;
      forNear(cx, cy, wd / 2, e => { if (Math.abs(e.x - cx) < wd / 2 + e.r && Math.abs(e.y - cy) < hh + e.r) hurt(e, S.dmg, 'tailwhip', dir * 170, 0, !!S.crit && Math.random() < S.crit); });
      G.fx.push({ type: 'whip', x: p.x, y: cy, dir, w: wd, h: hh, t: -i * 0.05, life: 0.22 });
    }
  },
  sardine(w, S) {
    const p = G.p, vr = viewR() * 0.8;
    for (let i = 0; i < S.amount; i++) { const a = -Math.PI / 2 + rand(-1.2, 1.2); G.shots.push({ kind: 'homing', x: p.x, y: p.y, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, sp: 310 * S.speed, tg: randTarget(vr), r: 8, boom: 40 * S.area, dmg: S.dmg, life: 4, dead: false, trap: S.trap }); }
  },
  boxtrap(w, S) {
    const p = G.p; let mines = G.zones.filter(z => z.kind === 'mine' && !z.dead);
    for (let i = 0; i < S.amount; i++) {
      if (mines.length >= 14) { mines[0].dead = true; mines.shift(); }
      const a = S.ring ? (G.t * 0.7 + i / S.amount * TAU) : rand(TAU), d = S.ring ? 85 : rand(50, 120), z = { kind: 'mine', chain: S.ring, x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, r: 14, boom: 62 * S.area, life: 10 * S.dur, max: 10 * S.dur, arm: 0.35, dmg: S.dmg, stun: S.stun, dead: false };
      G.zones.push(z); mines.push(z);
    }
  },
};
const beamL = S => 170 * S.area * (S.aim ? 1.5 : 1);
const beamA = (w, S, i) => S.aim ? w.ang + (i - (S.amount - 1) / 2) * 0.32 : w.ang + i / S.amount * TAU;
const orbitR = S => 74 * S.area * (S.pulse ? 0.55 + 0.6 * Math.abs(Math.sin(G.t * 2.2)) : 1);
const auraR = S => 62 * S.area * (S.still && !G.p.moving ? S.still : 1);
const TICK = {
  yarn(w, S, dt) {
    const p = G.p, R = orbitR(S), br = 10 * Math.sqrt(S.area); w.ang += 3 * S.speed * dt;
    for (let i = 0; i < S.amount; i++) {
      const a = w.ang + i / S.amount * TAU, bx = p.x + Math.cos(a) * R, by = p.y + Math.sin(a) * R;
      forNear(bx, by, br, e => { if (e.yarnT > G.t) return; const dx = e.x - bx, dy = e.y - by; if (dx * dx + dy * dy < (br + e.r) ** 2) { e.yarnT = G.t + 0.45; const ex = e.x - p.x, ey = e.y - p.y, d = Math.hypot(ex, ey) || 1; hurt(e, S.dmg, 'yarn', ex / d * 110, ey / d * 110); } });
    }
  },
  laser(w, S, dt) {
    const p = G.p, L = beamL(S);
    if (S.aim) { const tg = nearest(p.x, p.y, beamL(S) + 40), ta = tg ? Math.atan2(tg.y - p.y, tg.x - p.x) : Math.atan2(p.fy, p.fx); w.ang += Math.atan2(Math.sin(ta - w.ang), Math.cos(ta - w.ang)) * Math.min(1, 10 * dt); } else w.ang += 2.2 * S.speed * dt; w.tt -= dt; if (w.tt > 0) return; w.tt = Math.max(0.08, S.cd);
    for (let i = 0; i < S.amount; i++) {
      const a = beamA(w, S, i), ux = Math.cos(a), uy = Math.sin(a);
      forNear(p.x + ux * L / 2, p.y + uy * L / 2, L / 2, e => { const dx = e.x - p.x, dy = e.y - p.y, al = dx * ux + dy * uy; if (al < -e.r || al > L + e.r) return; if (Math.abs(dx * uy - dy * ux) < (S.aim ? 16 : 9) + e.r) hurt(e, S.dmg, 'laser'); });
    }
  },
  kitten(w, S, dt) {
    const p = G.p, n = S.amount, sp = 250 * S.speed, reach = 12 * S.area;
    while (w.pets.length < n) w.pets.push({ x: p.x + rand(-20, 20), y: p.y + rand(-20, 20), tg: null, st: 0, face: 1 });
    w.pets.length = n;
    w.pets.forEach((k, i) => {
      k.st -= dt; if (k.st <= 0 || (k.tg && k.tg.dead)) { k.st = 0.3; k.tg = null; let bd = 1e9; for (const e of G.enemies) { if (e.dead || e.T.prop || Math.hypot(e.x - p.x, e.y - p.y) > 300) continue; const d = (e.x - k.x) ** 2 + (e.y - k.y) ** 2 + (e.petT > G.t ? 40000 : 0); if (d < bd) { bd = d; k.tg = e; } } }
      let tx, ty; if (k.tg) { tx = k.tg.x; ty = k.tg.y; } else { const a = G.t * 1.5 + i / n * TAU; tx = p.x + Math.cos(a) * 40; ty = p.y + Math.sin(a) * 40; }
      const dx = tx - k.x, dy = ty - k.y, d = Math.hypot(dx, dy) || 1, step = Math.min(d, sp * dt);
      k.x += dx / d * step; k.y += dy / d * step; if (Math.abs(dx) > 2) k.face = dx > 0 ? 1 : -1;
      if (k.tg && d < reach + k.tg.r && k.tg.petT <= G.t) {
        k.tg.petT = G.t + 0.5;
        if (S.pop) { boom(k.tg.x, k.tg.y, 30 * S.area, S.dmg, w.id, { col: '#ffd84d' }); k.x = p.x + rand(-14, 14); k.y = p.y + rand(-14, 14); k.st = 0.7; k.tg = null; }
        else hurt(k.tg, S.dmg, 'kitten', dx / d * 90, dy / d * 90);
      }
    });
  },
};
/* new weapons borrow an older weapon's behaviour (kind); CUR lets hurt() credit the real weapon */
const CUR = { id: null, kind: null, D: null };
function tagNew(ns, nz, nf) {
  const id = CUR.id, D = CUR.D, own = !!D.kind;
  for (let i = ns; i < G.shots.length; i++) { const t = G.shots[i]; if (!t.src) t.src = id; if (own && !t.ico) t.ico = id; if (D.boomCol && !t.col) t.col = D.boomCol; if (G.p.pierce && t.pierce != null && t.pierce < 900 && !t.pierced) { t.pierce += G.p.pierce; t.pierced = true; } }
  for (let i = nz; i < G.zones.length; i++) { const z = G.zones[i]; if (!z.src) z.src = id; if (own) z.ico = id; if (D.zcol) z.col = D.zcol; if (D.boomCol) z.bcol = D.boomCol; }
  for (let i = nf; i < G.fx.length; i++) { const f = G.fx[i]; if (f.type === 'can') { f.src = id; if (own) f.ico = id; if (D.boomCol) f.col = D.boomCol; } else if (f.type === 'ring' && D.ringCol) f.col = D.ringCol; }
}
function weaponsUpdate(dt) {
  const p = G.p, wspd = (1 + (p.moving ? p.momentum : 0)) * (G.frenzy > 0 ? 2 : 1);
  for (const w of p.weapons) {
    const S = w.S, D = WEAPONS[w.id], K = D.kind || w.id; CUR.id = w.id; CUR.kind = K; CUR.D = D;
    const ns = G.shots.length, nz = G.zones.length, nf = G.fx.length;
    if (TICK[K]) { TICK[K](w, S, dt * wspd); tagNew(ns, nz, nf); continue; }
    if (w.burst > 0) { w.bt -= dt; if (w.bt <= 0) { fireHair(w, S, 0); w.burst--; w.bt = 0.09; } }
    w.t -= dt * wspd; if (w.t <= 0) { w.t += Math.max(0.05, S.cd); if (w.t < 0) w.t = 0; FIRE[K](w, S); }
    tagNew(ns, nz, nf);
  }
}
function shotsUpdate(dt) {
  const p = G.p, hw = W / 2 / ZOOM, hh = H / 2 / ZOOM;
  for (const s of G.shots) {
    s.life -= dt; if (s.life <= 0) { if (s.kind === 'homing') boom(s.x, s.y, s.boom, s.dmg, s.src || 'sardine', { col: s.col, stun: s.trap }); s.dead = true; continue; }
    if (s.kind === 'hair') {
      s.x += s.vx * dt; s.y += s.vy * dt;
      forNear(s.x, s.y, s.r, e => { if (s.dead || s.hit.includes(e)) return; const dx = e.x - s.x, dy = e.y - s.y; if (dx * dx + dy * dy < (s.r + e.r) ** 2) { s.hit.push(e); hurt(e, s.dmg, s.src || 'hairball', s.vx * 0.3, s.vy * 0.3); if (--s.pierce <= 0) s.dead = true; } });
    } else if (s.kind === 'bone') {
      s.rot += dt * 15; let dx, dy;
      if (!s.back) { dx = Math.cos(s.ang); dy = Math.sin(s.ang); s.sp -= 560 * dt; if (s.sp <= 0) { s.back = true; s.sp = 0; } }
      else { const ex = p.x - s.x, ey = p.y - s.y, d = Math.hypot(ex, ey) || 1; dx = ex / d; dy = ey / d; s.sp = Math.min(600, s.sp + 760 * dt); if (d < 20) { s.dead = true; continue; } }
      s.x += dx * s.sp * dt; s.y += dy * s.sp * dt;
      forNear(s.x, s.y, s.r, e => { if (e.boneT > G.t) return; const ex = e.x - s.x, ey = e.y - s.y; if (ex * ex + ey * ey < (s.r + e.r) ** 2) { e.boneT = G.t + 0.35; hurt(e, s.dmg, s.src || 'fishbone', dx * (s.smack ? 260 : 70), dy * (s.smack ? 260 : 70)); if (s.smack && !e.T.boss) e.stun = Math.max(e.stun, 0.35); } });
    } else if (s.kind === 'lob') {
      s.vy += 780 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.rot += dt * 9;
      forNear(s.x, s.y, s.r, e => { if (s.dead || s.hit.includes(e)) return; const dx = e.x - s.x, dy = e.y - s.y; if (dx * dx + dy * dy < (s.r + e.r) ** 2) { s.hit.push(e); hurt(e, s.dmg, s.src || 'bowl', s.vx * 0.3, 60); if (s.bounce) { s.vx = -s.vx * 0.8 + rand(-60, 60); s.vy = -Math.abs(s.vy) * 0.7 - 120; } if (--s.pierce <= 0) s.dead = true; } });
    } else if (s.kind === 'ball') {
      s.x += s.vx * dt; s.y += s.vy * dt; s.rot += dt * 8;
      if (s.x < p.x - hw && s.vx < 0 || s.x > p.x + hw && s.vx > 0) s.vx = -s.vx;
      if (s.y < p.y - hh && s.vy < 0 || s.y > p.y + hh && s.vy > 0) s.vy = -s.vy;
      forNear(s.x, s.y, s.r, e => { if (e.ballT > G.t) return; const dx = e.x - s.x, dy = e.y - s.y; if (dx * dx + dy * dy < (s.r + e.r) ** 2) { e.ballT = G.t + 0.4; hurt(e, s.dmg, s.src || 'ball', s.vx * 0.25, s.vy * 0.25); if (s.rico) { const nx = nearest(s.x, s.y, 260, e); if (nx) { const sp = Math.hypot(s.vx, s.vy), a = Math.atan2(nx.y - s.y, nx.x - s.x); s.vx = Math.cos(a) * sp; s.vy = Math.sin(a) * sp; } } } });
    } else if (s.kind === 'homing') {
      if (!s.tg || s.tg.dead) s.tg = nearest(s.x, s.y, 500);
      if (s.tg) { const dx = s.tg.x - s.x, dy = s.tg.y - s.y, d = Math.hypot(dx, dy) || 1, k = Math.min(1, 7 * dt); s.vx += (dx / d * s.sp - s.vx) * k; s.vy += (dy / d * s.sp - s.vy) * k; }
      s.x += s.vx * dt; s.y += s.vy * dt; let hit = false;
      forNear(s.x, s.y, s.r, e => { if (hit) return; const dx = e.x - s.x, dy = e.y - s.y; if (dx * dx + dy * dy < (s.r + e.r) ** 2) hit = true; });
      if (hit) { boom(s.x, s.y, s.boom, s.dmg, s.src || 'sardine', { col: s.col, stun: s.trap }); s.dead = true; }
    }
  }
}
/* spilled milk: a glossy, uneven puddle with a few splash drops around it */
function drawMilk(c, z, gt) {
  const k = Math.min(1, (z.max - z.life) / 0.25, z.life / 0.4), R = z.r * (0.55 + 0.45 * Math.min(1, (z.max - z.life) / 0.35)), s = z.seed || (z.x * 0.013 + z.y * 0.007), N = 9;
  const rad = i => R * (0.86 + 0.1 * Math.sin(s * 3 + i * 1.9) + 0.05 * Math.sin(s * 7 + i * 3.3));
  const blob = (sc, dy) => {   // a smooth closed curve through uneven points: curve to each point's midpoint with the point as control
    const P = []; for (let i = 0; i < N; i++) { const a = i / N * TAU, r = rad(i) * sc; P.push([z.x + Math.cos(a) * r, z.y + dy + Math.sin(a) * r * 0.7]); }
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], m0 = mid(P[N - 1], P[0]);
    c.beginPath(); c.moveTo(m0[0], m0[1]); for (let i = 0; i < N; i++) { const q = P[i], m = mid(q, P[(i + 1) % N]); c.quadraticCurveTo(q[0], q[1], m[0], m[1]); } c.closePath();
  };
  c.globalAlpha = 0.9 * k; pen(c, 1.2); blob(1, 0); c.fillStyle = z.slow ? '#e9f4ff' : '#ffffff'; c.fill(); c.stroke();
  c.globalAlpha = 0.55 * k; blob(0.72, -R * 0.06); c.fillStyle = z.slow ? '#d7e9fb' : '#eef4fa'; c.fill();
  c.globalAlpha = 0.9 * k; c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(z.x - R * 0.35, z.y - R * 0.22, R * 0.22, R * 0.08, -0.25, 0, TAU); c.fill();
  for (let i = 0; i < 4; i++) { const a = s * 5 + i * 1.6, d = R * (1.08 + 0.12 * Math.sin(s + i)), x = z.x + Math.cos(a) * d, y = z.y + Math.sin(a) * d * 0.7, rr = R * (0.07 + 0.03 * Math.sin(s * 2 + i)); c.globalAlpha = 0.9 * k; pen(c, 1); ell(c, x, y, rr, rr * 0.8, z.slow ? '#e9f4ff' : '#ffffff'); }
  if (z.tick > 0.3) { c.globalAlpha = 0.35 * k; c.strokeStyle = '#cfdcea'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(z.x, z.y, R * (1 - (z.tick - 0.3) * 3), R * 0.7 * (1 - (z.tick - 0.3) * 3), 0, 0, TAU); c.stroke(); }
  c.globalAlpha = 1;
}
/* catnip cloud: a low, puffy green cloud drifting along the ground, with dizzy swirls and leaves rising from it */
function drawCatnipCloud(c, z, gt) {
  const k = Math.min(1, (z.max - z.life) / 0.3, z.life / 0.5), R = z.r * k, s = z.seed || 0;
  const puffs = [[0, 0, 0.5]]; for (let j = 0; j < 7; j++) { const a = j / 7 * TAU + s; puffs.push([Math.cos(a) * 0.55, Math.sin(a) * 0.36, 0.36 + 0.06 * Math.sin(gt * 2.2 + j * 1.3 + s)]); }
  const path = (grow, dy, sc) => { c.beginPath(); for (const [px, py, pr] of puffs) { const x = z.x + px * R, y = z.y + py * R + dy, r = pr * R * sc + grow; c.moveTo(x + r, y); c.ellipse(x, y, r, r * 0.8, 0, 0, TAU); } };
  c.globalAlpha = 0.2 * k; c.fillStyle = '#2a2733'; c.beginPath(); c.ellipse(z.x, z.y + R * 0.3, R * 0.95, R * 0.35, 0, 0, TAU); c.fill();
  c.globalAlpha = 0.92 * k;
  path(1.6, 0, 1); c.fillStyle = '#5f9e50'; c.fill();                 // outline: one fill so the inner seams vanish
  path(0, 0, 1); c.fillStyle = '#b7e3a6'; c.fill();
  path(0, -R * 0.09, 0.82); c.fillStyle = '#d8f4cb'; c.fill();       // lighter tops
  c.globalAlpha = 0.85 * k; c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(z.x - R * 0.3, z.y - R * 0.28, R * 0.16, R * 0.08, -0.3, 0, TAU); c.fill();
  c.strokeStyle = '#5f9e50'; c.lineWidth = 1.6; c.lineCap = 'round';
  for (let j = 0; j < 2; j++) {                                        // dizzy swirls
    const cx = z.x + (j ? R * 0.28 : -R * 0.12), cy = z.y + (j ? R * 0.02 : R * 0.08), rot = gt * (j ? -4 : 4);
    c.beginPath(); for (let t = 0; t <= 1; t += 0.06) { const a = rot + t * TAU * 1.6, rr = R * 0.03 + t * R * 0.13; const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.7; if (!t) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
  }
  for (let j = 0; j < 3; j++) {                                        // leaves floating up
    const h = (gt * 0.5 + j / 3 + s) % 1, x = z.x + Math.sin(gt * 1.5 + j * 2.1) * R * 0.4, y = z.y - R * 0.2 - h * R * 0.9;
    c.globalAlpha = k * Math.min(1, (1 - h) * 3, h * 6); c.save(); c.translate(x, y); c.rotate(Math.sin(gt * 3 + j) * 0.8);
    c.fillStyle = '#6fcf6f'; c.strokeStyle = '#3f7d36'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, 0, 3.2, 6, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.moveTo(0, -5); c.lineTo(0, 5); c.stroke(); c.restore();
  }
  c.globalAlpha = 1;
}
/* a newspaper twister: wind rings widening upward, sheets of paper circling them (back half dimmed, front half on top) */
function drawTwister(c, z, gt) {
  const k = Math.min(1, (z.max - z.life) / 0.25, z.life / 0.4), R = z.r * k, Hh = z.r * 2 * k, sp = gt * 5 * z.spin, lean = Math.sin(z.wob) * R * 0.18;
  const lvl = h => ({ x: z.x + lean * h, y: z.y - 4 - h * Hh, w: R * (0.22 + 0.85 * h) });
  const sheet = (j, front) => {
    const h = (j * 0.381 + gt * 0.45) % 1, L = lvl(h), a = sp + j * 2.39, s = Math.sin(a); if ((s > 0) !== front) return;
    c.save(); c.globalAlpha = (front ? 1 : 0.5) * k * Math.min(1, (1 - h) * 5); c.translate(L.x + Math.cos(a) * L.w, L.y + s * L.w * 0.3); c.rotate(a * 0.8 + j); c.scale(0.7 + 0.3 * Math.abs(Math.cos(a)), 1);
    c.fillStyle = '#f4f1e8'; c.strokeStyle = '#3b3442'; c.lineWidth = 1; c.beginPath(); c.rect(-5, -6.5, 10, 13); c.fill(); c.stroke();
    c.strokeStyle = '#b8b3a3'; c.beginPath(); c.moveTo(-3, -3); c.lineTo(3, -3); c.moveTo(-3, 0); c.lineTo(3, 0); c.moveTo(-3, 3); c.lineTo(1, 3); c.stroke(); c.restore();
  };
  const N = 9 + Math.round(z.r / 12);
  for (let j = 0; j < N; j++) sheet(j, false);
  c.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const h = i / 5, L = lvl(h), a0 = sp * 0.8 + i * 1.1;
    c.globalAlpha = (0.35 + 0.35 * h) * k; c.strokeStyle = '#9fb3cf'; c.lineWidth = 2.5 + h * 2;
    c.beginPath(); c.ellipse(L.x, L.y, L.w, L.w * 0.3, 0, a0, a0 + Math.PI * 1.25); c.stroke();
    c.globalAlpha = (0.3 + 0.3 * h) * k; c.strokeStyle = '#ffffff'; c.lineWidth = 1.4;
    c.beginPath(); c.ellipse(L.x, L.y, L.w * 0.92, L.w * 0.27, 0, a0 + 0.4, a0 + Math.PI * 0.9); c.stroke();
  }
  for (let j = 0; j < N; j++) sheet(j, true);
  c.globalAlpha = 1;
}
function zonesUpdate(dt) {
  for (const z of G.zones) {
    if (z.dead) continue; z.life -= dt; if (z.life <= 0) { z.dead = true; continue; }
    if (z.kind === 'puddle') {
      if (z.vx) { z.x += z.vx * dt; z.y += z.vy * dt; }     // catnip clouds drift with the wind
      z.tick -= dt; if (z.tick > 0) continue; z.tick = 0.4;
      forNear(z.x, z.y, z.r, e => { if (Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.r) { hurt(e, z.dmg, z.src || 'spill'); if (z.slow) e.slow = 0.8; if (z.confuse && !e.T.boss) e.confuse = 0.9; } });
    } else if (z.kind === 'twister') {
      const p = G.p;
      if (!z.tg || z.tg.dead || Math.random() < dt * 0.5) z.tg = randTarget(300);
      let ax = z.tg ? z.tg.x - z.x : 0, ay = z.tg ? z.tg.y - z.y : 0; const am = Math.hypot(ax, ay) || 1; ax /= am; ay /= am;
      const pd = Math.hypot(p.x - z.x, p.y - z.y) || 1; if (pd > 280) { ax += (p.x - z.x) / pd * 1.5; ay += (p.y - z.y) / pd * 1.5; }   // stay near the cat
      else if (pd < 150) { ax -= (p.x - z.x) / pd * 2.5; ay -= (p.y - z.y) / pd * 2.5; }   // but never drag the crowd onto it
      z.wob += dt * 2.4; ax += Math.cos(z.wob) * 0.7; ay += Math.sin(z.wob * 1.3) * 0.7;
      const m = Math.hypot(ax, ay) || 1, kk = Math.min(1, 2 * dt); z.vx += (ax / m * z.sp - z.vx) * kk; z.vy += (ay / m * z.sp - z.vy) * kk;
      z.x += z.vx * dt; z.y += z.vy * dt;
      const RR = z.r * 1.7;
      forNear(z.x, z.y, RR, e => {
        if (e.T.prop || e.T.boss || e.heavy) return;
        const dx = z.x - e.x, dy = z.y - e.y, d = Math.hypot(dx, dy) || 1; if (d > RR + e.r) return;
        const pull = Math.min(Math.max(0, d - 8), 120 * dt), swirl = 90 * dt * z.spin;
        e.x += dx / d * pull - dy / d * swirl; e.y += dy / d * pull + dx / d * swirl;
      });
      z.tick -= dt; if (z.tick > 0) continue; z.tick = 0.5;
      forNear(z.x, z.y, z.r, e => { if (Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.r) hurt(e, z.dmg, z.src || 'newspaper'); });
      if (Math.random() < 0.7) part({ k: 'chip', x: z.x + rand(-z.r, z.r) * 0.6, y: z.y, z: rand(10, z.r * 1.5), vx: rand(-90, 90), vy: rand(-40, 40), vz: rand(60, 160), rot: rand(TAU), vr: rand(-12, 12), sz: rand(5, 8), col: '#f4f1e8', life: 0.9 });
    } else {
      z.arm -= dt; if (z.arm > 0) continue; let hit = false;
      forNear(z.x, z.y, z.r, e => { if (!hit && !e.T.prop && Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.r) hit = true; });
      if (z.go) hit = true;
      if (hit) { z.dead = true; boom(z.x, z.y, z.boom, z.dmg, z.src || 'boxtrap', { stun: z.stun, col: z.bcol || '#d9a66b' }); if (z.chain) for (const o of G.zones) if (o.kind === 'mine' && !o.dead && o !== z && Math.hypot(o.x - z.x, o.y - z.y) < 95) { o.go = true; o.arm = Math.min(o.arm, 0.08); } }
    }
  }
}

/* ───────── street cats: rescue and squad ───────── */
const ALLY = GN.ALLY, RESCUE_R = 58;
/* Korean particle after a name: jo('보리', '가', '이') -> '보리가' */
function jo(word, noFinal, withFinal) { const c = word.charCodeAt(word.length - 1) - 0xac00; return word + (c >= 0 && c <= 11171 && c % 28 ? withFinal : noFinal); }
function pickName() {
  const used = new Set([...G.squad, ...G.rescues, ...G.rescued, ...save.home.cats].map(x => x.name));
  const free = GN.NAMES.filter(n => !used.has(n)); return pick(free.length ? free : GN.NAMES);
}
function newMember(breed, name, x, y) { return { breed, name, x, y, face: 1, moving: false, t: rand(0.2, 0.6), stars: 1, companion: false, mode: 'follow', tg: null, seed: Math.random() }; }
function spawnRescue(o = {}) {
  const p = G.p, a = o.ang ?? rand(TAU), d = o.dist ?? rand(360, 560);
  G.rescues.push({ x: o.x ?? p.x + Math.cos(a) * d, y: o.y ?? p.y + Math.sin(a) * d, breed: o.breed || pick(Object.keys(CATS)), name: o.name || pickName(),
    prog: 0, need: o.need || 3, scared: !!o.scared, member: o.member || null, seed: Math.random(), dead: false });
  if (!G.rescueTold) { G.rescueTold = true; banner('갇힌 길고양이 발견! 곁에 머물러 구해주세요'); }
}
function rescueDone(r) {
  const p = G.p; r.dead = true; sfx('meow'); sfx('box'); padRumble(90, 0.3);
  G.fx.push({ type: 'ring', x: r.x, y: r.y, r: RESCUE_R, t: 0, life: 0.45, col: COL.mint });
  if (r.member) { r.member.x = r.x; r.member.y = r.y; r.member.mode = 'follow'; G.squad.push(r.member); banner(jo(r.name, '가', '이') + ' 돌아왔다!'); return; }
  G.rescueCount++;
  if (G.squad.length < G.squadMax) {
    const m = newMember(r.breed, r.name, r.x, r.y); G.squad.push(m); G.rescued.push({ breed: r.breed, name: r.name, member: m });
    banner(jo(r.name, '를', '을') + ' 구했다! 무리에 들어왔다');
  } else {
    G.rescued.push({ breed: r.breed, name: r.name, member: null });
    p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.25); for (let i = 0; i < 4; i++) drop('xp', r.x + rand(-20, 20), r.y + rand(-20, 20), 10);
    banner(jo(r.name, '를', '을') + ' 구했다! 아지트로 먼저 보냈다');
  }
}
/* a hit can make the last cat in line bolt and hide nearby; it has to be fetched again */
function scareOne() {
  const m = [...G.squad].reverse().find(x => !x.companion); if (!m) return;
  G.lastScare = G.t; G.squad.splice(G.squad.indexOf(m), 1);
  const a = rand(TAU); spawnRescue({ x: m.x + Math.cos(a) * 130, y: m.y + Math.sin(a) * 130, breed: m.breed, name: m.name, scared: true, need: 1.2, member: m });
  toast(jo(m.name, '가', '이') + ' 놀라서 숨었어요! 가까이 가서 다시 데려오세요');
}
function rescuesUpdate(dt) {
  const p = G.p;
  if (G.t >= G.nextRescue) { G.nextRescue = G.t + GN.RESCUE_EVERY; if (G.rescues.filter(r => !r.scared).length < 2) spawnRescue(); }
  for (const r of G.rescues) {
    const d = Math.hypot(r.x - p.x, r.y - p.y);
    if (d > 1700) { const a = rand(TAU), k = rand(360, 560); r.x = p.x + Math.cos(a) * k; r.y = p.y + Math.sin(a) * k; r.prog = 0; }
    if (d < RESCUE_R) { r.prog += dt * G.rescueSpd * G.p.rescueMul; if (r.prog >= r.need) rescueDone(r); }
    else r.prog = Math.max(0, r.prog - dt * 0.7);
  }
  G.rescues = G.rescues.filter(r => !r.dead);
}
const allyDmg = (m, base) => base * (1 + G.level * 0.035) * (1 + 0.5 * (m.stars - 1)) * (m.companion ? G.compMul : 1) * G.p.squadMul * (G.squadBuff > 0 ? 1.5 : 1);
function allyNear(m, R) { let best = null, bd = R * R; forNear(m.x, m.y, R, e => { if (e.T.prop) return; const d = (e.x - m.x) ** 2 + (e.y - m.y) ** 2; if (d < bd) { bd = d; best = e; } }); return best; }
function allyAct(m, dt) {
  const A = ALLY[m.breed], p = G.p; m.t -= dt;
  if (m.mode === 'go') {
    const e = m.tg; if (!e || e.dead || Math.hypot(e.x - p.x, e.y - p.y) > 280) { m.mode = 'follow'; return; }
    const dx = e.x - m.x, dy = e.y - m.y, d = Math.hypot(dx, dy) || 1, s = Math.min(d, 340 * dt); m.x += dx / d * s; m.y += dy / d * s; m.face = dx > 0 ? 1 : -1; m.moving = true;
    if (d < e.r + 10) { hurt(e, allyDmg(m, A.dmg), 'squad', dx / d * 90, dy / d * 90); m.mode = 'follow'; m.t = A.cd; }
    return;
  }
  if (m.t > 0) return;
  switch (A.kind) {
    case 'swipe': {
      const R = 44; if (!allyNear(m, R + 14)) { m.t = 0.15; return; }
      forNear(m.x, m.y, R, e => { const dx = e.x - m.x, dy = e.y - m.y, d = Math.hypot(dx, dy) || 1; if (d < R + e.r) hurt(e, allyDmg(m, A.dmg), 'squad', dx / d * 110, dy / d * 110); });
      G.fx.push({ type: 'slash', x: m.x, y: m.y, ang: 0, r: R, full: true, t: 0, life: 0.18 }); break;
    }
    case 'shot': {
      const e = allyNear(m, 360); if (!e) { m.t = 0.2; return; }
      const a = Math.atan2(e.y - m.y, e.x - m.x);
      G.shots.push({ kind: 'hair', x: m.x, y: m.y - 4, vx: Math.cos(a) * 380, vy: Math.sin(a) * 380, r: 6, dmg: allyDmg(m, A.dmg), pierce: A.pierce || 1, life: 1.4, hit: [], dead: false, src: 'squad', ico: A.ico }); break;
    }
    case 'pounce': { const e = allyNear(m, 170); if (!e) { m.t = 0.2; return; } m.mode = 'go'; m.tg = e; return; }
    case 'chill': forNear(m.x, m.y, 72, e => { if (Math.hypot(e.x - m.x, e.y - m.y) < 72 + e.r && !e.T.prop) { e.slow = 0.7; hurt(e, allyDmg(m, A.dmg), 'squad'); } }); break;
    case 'tank': forNear(m.x, m.y, 40, e => { const dx = e.x - m.x, dy = e.y - m.y, d = Math.hypot(dx, dy) || 1; if (d < 30 + e.r && !e.T.prop) hurt(e, allyDmg(m, A.dmg), 'squad', dx / d * 260, dy / d * 260); }); break;
    case 'zap': { const e = allyNear(m, 260); if (!e) { m.t = 0.25; return; } G.fx.push({ type: 'bolt', x1: m.x, y1: m.y - 10, x2: e.x, y2: e.y, seed: rand(100), t: 0, life: 0.16 }); hurt(e, allyDmg(m, A.dmg), 'squad'); sfx('zap'); break; }
    case 'beam': { const e = allyNear(m, 150); if (!e) { m.t = 0.15; return; } G.fx.push({ type: 'beam', x1: m.x, y1: m.y - 6, x2: e.x, y2: e.y, t: 0, life: 0.12 }); hurt(e, allyDmg(m, A.dmg), 'squad'); break; }
    case 'heal': if (p.hp < p.maxHp) { p.hp = Math.min(p.maxHp, p.hp + A.dmg * (1 + 0.5 * (m.stars - 1))); G.fx.push({ type: 'ring', x: p.x, y: p.y, r: 30, t: 0, life: 0.35, col: COL.mint }); } break;
    case 'magnet': for (const q of G.picks) if ((q.type === 'xp' || q.type === 'coin') && Math.hypot(q.x - m.x, q.y - m.y) < 260) q.pull = true; gainCoins(m.stars); break;
  }
  m.t = A.cd;
}
/* the squad walks in single file along the player's recent path */
function squadUpdate(dt) {
  const p = G.p, T = G.trail;
  if (!T.length || Math.hypot(T[0].x - p.x, T[0].y - p.y) > 6) { T.unshift({ x: p.x, y: p.y }); if (T.length > 64) T.pop(); }
  G.squad.forEach((m, i) => {
    allyAct(m, dt); if (m.mode === 'go') return;
    const k = (i + 1) * 4, tp = T[Math.min(k, T.length - 1)] || p, behind = T.length > k ? 0 : (k - T.length + 1) * 6;
    const tx = tp.x - p.fx * behind, ty = tp.y - p.fy * behind, dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy);
    if (d > 500) { m.x = tx; m.y = ty; return; }
    if (d > 1.5) { const s = Math.min(d, Math.max(p.spd * 1.1, d * 6) * dt); m.x += dx / d * s; m.y += dy / d * s; if (Math.abs(dx) > 0.4) m.face = dx > 0 ? 1 : -1; m.moving = d > 3; } else m.moving = false;
  });
}
function snowflake(c, x, y, r) { c.save(); c.translate(x, y); c.strokeStyle = '#5fa8e6'; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; c.moveTo(Math.cos(a) * r, Math.sin(a) * r); c.lineTo(-Math.cos(a) * r, -Math.sin(a) * r); } c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = 0.9; c.stroke(); c.restore(); }
function drawSquadCat(c, m, gt, scale) { c.save(); c.translate(m.x, m.y); c.scale(m.face * scale, scale); drawCat(c, CATS[m.breed].look, gt + m.seed * 3, m.moving); c.restore(); }
function drawRescue(c, r, gt) {
  c.save(); c.setLineDash([6, 6]); c.lineDashOffset = -gt * 20; c.strokeStyle = r.scared ? 'rgba(255,138,122,.9)' : 'rgba(255,255,255,.85)'; c.lineWidth = 2; c.beginPath(); c.arc(r.x, r.y, RESCUE_R, 0, TAU); c.stroke(); c.restore();
  if (r.scared) { drawSquadCat(c, { x: r.x + Math.sin(gt * 40) * 1.2, y: r.y, face: Math.sin(r.seed * 9) > 0 ? 1 : -1, breed: r.breed, moving: false, seed: r.seed }, gt, 0.72); }
  else { drawSquadCat(c, { x: r.x - 2, y: r.y - 8, face: 1, breed: r.breed, moving: false, seed: r.seed }, gt, 0.82); drawIco(c, 'box', r.x, r.y + 9, 46); }
  const by = r.y - 38 + Math.sin(gt * 5 + r.seed * 6) * 2, txt = r.scared ? '무서워!' : '도와줘!';
  c.font = '12px Jua, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText(txt).width + 14;
  c.fillStyle = '#fff'; c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.roundRect ? c.roundRect(r.x - w / 2, by - 10, w, 20, 8) : c.rect(r.x - w / 2, by - 10, w, 20); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(r.x - 4, by + 9.5); c.lineTo(r.x, by + 15); c.lineTo(r.x + 4, by + 9.5); c.fill(); c.stroke();
  c.fillStyle = INK; c.fillText(txt, r.x, by + 0.5); c.textBaseline = 'alphabetic';
  if (r.prog > 0) { c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.arc(r.x, r.y - 2, 30, -Math.PI / 2, -Math.PI / 2 + TAU * r.prog / r.need); c.stroke(); c.strokeStyle = COL.mint; c.lineWidth = 4; c.stroke(); }
}
/* bubbles at the screen edge point toward cats waiting off screen */
function drawRescueArrows(c, camx, camy, gt) {
  for (const r of G.rescues) {
    const sx = (r.x - camx) * ZOOM + W / 2, sy = (r.y - camy) * ZOOM + H / 2;
    if (sx > 0 && sx < W && sy > 0 && sy < H) continue;
    const x = clamp(sx, 34, W - 34), y = clamp(sy, 130, H - 70), a = Math.atan2(sy - y, sx - x), pulse = 1 + Math.sin(gt * 6) * 0.06;
    c.save(); c.translate(x, y); c.scale(pulse, pulse);
    c.fillStyle = r.scared ? COL.salmon : COL.butter; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath(); c.moveTo(Math.cos(a) * 31, Math.sin(a) * 31); c.lineTo(Math.cos(a + 0.45) * 20, Math.sin(a + 0.45) * 20); c.lineTo(Math.cos(a - 0.45) * 20, Math.sin(a - 0.45) * 20); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.arc(0, 0, 21, 0, TAU); c.fillStyle = '#fff'; c.fill(); c.stroke();
    c.beginPath(); c.arc(0, 0, 19.5, 0, TAU); c.clip(); c.translate(-2, 6); c.scale(0.68, 0.68); drawCat(c, CATS[r.breed].look, gt, false);
    c.restore();
  }
}

/* ───────── active skill ───────── */
const SKILLS = GN.SKILLS;
function skillKey() { return PAD.on ? 'A' : (window.matchMedia && matchMedia('(pointer: coarse)').matches) ? '' : 'Space'; }
function useSkill() {
  if (state !== 'play' || !G || G.endT >= 0) return;
  const S = G.sk, p = G.p;
  if (S.cd > 0 || p.jump || p.hide > 0) { const b = $('#btnSkill'); b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); return; }
  S.max = SKILLS[S.id].cd * (1 - 0.08 * shopLv('skillcd')) * p.skillMul; S.cd = S.max; padRumble(60, 0.25);
  const lvl = 1 + G.level * 0.03, pw = 1 + 0.1 * shopLv('skillPow');
  if (S.id === 'jump') {
    const m = getMove(), d = Math.hypot(m.x, m.y), dx = d > 0.1 ? m.x / d : p.fx, dy = d > 0.1 ? m.y / d : p.fy;
    p.jump = { t: 0, dur: 0.34, vx: dx * 470 * pw, vy: dy * 470 * pw }; if (Math.abs(dx) > 0.15) p.face = dx > 0 ? 1 : -1; sfx('jump');
  } else if (S.id === 'hiss') {
    const R = 170 * pw; buildGrid();
    forNear(p.x, p.y, R, e => { if (e.T.prop) return; const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1; if (d > R + e.r) return; hurt(e, 6 * lvl, 'skill', dx / d * 520, dy / d * 520); if (!e.T.boss) e.stun = 1.3; });
    for (const b of G.ebul) if (Math.hypot(b.x - p.x, b.y - p.y) < 220) b.dead = true;
    G.fx.push({ type: 'ring', x: p.x, y: p.y, r: R, t: 0, life: 0.4, col: COL.salmon }, { type: 'shout', x: p.x, y: p.y, text: '하악!', t: 0, life: 0.7 });
    G.shake = 6; sfx('hiss');
  } else if (S.id === 'purr') {
    p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.25 * pw); G.squadBuff = 6 * pw; sfx('meow');
    G.fx.push({ type: 'ring', x: p.x, y: p.y, r: 70, t: 0, life: 0.5, col: COL.mint }, { type: 'shout', x: p.x, y: p.y, text: '골골~', t: 0, life: 0.8 }); glow(p.x, p.y, 60, COL.mint, 0.5, 0.8);
  } else if (S.id === 'frenzy') {
    G.frenzy = 5 * pw; sfx('lvl'); screenFlash('#bdeeb0', 0.22); G.fx.push({ type: 'shout', x: p.x, y: p.y, text: '폭주!', t: 0, life: 0.8 });
  } else if (S.id === 'call') {
    for (const r of G.rescues) if (r.scared && !r.dead) rescueDone(r);
    buildGrid(); for (const m of G.squad) { const e = allyNear(m, 420); if (e) { m.mode = 'go'; m.tg = e; } }
    G.squadBuff = Math.max(G.squadBuff, 3 * pw); sfx('meow'); G.fx.push({ type: 'ring', x: p.x, y: p.y, r: 120, t: 0, life: 0.45, col: COL.butter }, { type: 'shout', x: p.x, y: p.y, text: '모여라!', t: 0, life: 0.8 });
  } else {
    p.hide = 2.5 * pw; sfx('box');
  }
}
function skillUpdate(dt) {
  const p = G.p; G.sk.cd = Math.max(0, G.sk.cd - dt); if (G.squadBuff > 0) G.squadBuff -= dt; if (G.frenzy > 0) G.frenzy -= dt; if (G.shieldT > 0) G.shieldT -= dt;
  if (p.hide > 0) { p.hide -= dt; p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.08 * dt); if (p.hide <= 0) G.fx.push({ type: 'ring', x: p.x, y: p.y, r: 40, t: 0, life: 0.3, col: COL.mint }); }
}
function landJump() {
  const p = G.p, R = 72, lvl = 1 + G.level * 0.03;
  forNear(p.x, p.y, R, e => { if (e.T.prop) return; const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1; if (d < R + e.r) hurt(e, 8 * lvl, 'skill', dx / d * 240, dy / d * 240); });
  G.fx.push({ type: 'ring', x: p.x, y: p.y + 8, r: R, t: 0, life: 0.3, col: '#ffffff' });
  for (let i = 0; i < 6; i++) { const a = rand(TAU), s = rand(40, 110); G.fx.push({ type: 'puff', x: p.x, y: p.y + 10, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.4, t: 0, life: rand(0.25, 0.4), r: rand(3, 5) }); }
}
function drawSkillIcon() { const cv2 = $('#skillIco'), c = cv2.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 96, 96); c.translate(48, 48); c.scale(2.4, 2.4); icon(c, SKILLS[G.sk.id].icon); }

/* ───────── enemies ───────── */
function bullet(x, y, a, sp, dmg) { G.ebul.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 7, dmg, life: 6, dead: false }); }
function bossUpdate(e, dt, dx, dy, d) {
  const p = G.p, T = e.T; e.mt -= dt;
  switch (e.mode) {
    case 'chase': e.x += dx * e.spd * dt; e.y += dy * e.spd * dt;
      if (e.mt <= 0) { e.mode = pick(T.abil); e.ms = 0; e.mt = { suck: 2.6, charge: 1.5, ring: 1.2, aimed: 1.5, summon: 0.6 }[e.mode]; if (e.mode === 'charge') { e.vx = dx; e.vy = dy; } sfx('warn'); }
      return;
    case 'suck': if (d < 560 && d > 30 && !p.jump && !(p.hide > 0)) { p.x -= dx * 105 * dt; p.y -= dy * 105 * dt; } break;
    case 'charge': if (e.mt < 0.8) { e.x += e.vx * 430 * dt; e.y += e.vy * 430 * dt; } else { e.vx = dx; e.vy = dy; } break;
    case 'ring': if (e.ms === 0 && e.mt < 0.9) { e.ms = 1; for (let i = 0; i < 14; i++) bullet(e.x, e.y, i / 14 * TAU, 150, e.dmg * 0.6); } else if (e.ms === 1 && e.mt < 0.4) { e.ms = 2; for (let i = 0; i < 14; i++) bullet(e.x, e.y, (i + 0.5) / 14 * TAU, 150, e.dmg * 0.6); } break;
    case 'aimed': { const k = Math.floor((1.5 - e.mt) / 0.45); if (k > e.ms - 1 && e.ms < 3) { e.ms++; const a = Math.atan2(dy, dx); for (let i = -2; i <= 2; i++) bullet(e.x, e.y, a + i * 0.2, 190, e.dmg * 0.6); } break; }
    case 'summon': if (e.ms === 0) { e.ms = 1; for (let i = 0, k = moreEnemies(7); i < k; i++) if (G.enemies.length < MAX_ENEMIES) { const a = rand(TAU); spawn(T.minion, { x: e.x + Math.cos(a) * 70, y: e.y + Math.sin(a) * 70 }); } } break;
  }
  if (e.mt <= 0) { e.mode = 'chase'; e.mt = rand(3.2, 5); }
}
function enemiesUpdate(dt) {
  const p = G.p, vr = viewR(), kdecay = Math.exp(-9 * dt), frozen = G.freeze > 0;
  for (const e of G.enemies) {
    if (e.dead) continue;
    e.flash -= dt; e.slow -= dt; e.hitT -= dt; if (e.confuse > 0) e.confuse -= dt;
    let dx = p.x - e.x, dy = p.y - e.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const T = e.T;
    if (e.confuse > 0) { dx = -dx; dy = -dy; }
    if (p.hide > 0 && !T.boss && !T.dash && !T.prop) { const wa = e.seed * TAU + G.t * 0.5; dx = Math.cos(wa) * 0.6 - dx * 0.4; dy = Math.sin(wa) * 0.6 - dy * 0.4; }
    if (T.prop) { if (d > vr * 2.4) e.dead = true; continue; }
    if (frozen) continue;
    if (e.stun > 0) { e.stun -= dt; e.x += e.kx * dt; e.y += e.ky * dt; e.kx *= kdecay; e.ky *= kdecay; continue; }
    if (T.dash) { e.x += e.vx * dt; e.y += e.vy * dt; e.life -= dt; if (e.life <= 0) e.dead = true; }
    else if (T.boss) { bossUpdate(e, dt, dx, dy, d); e.face = dx >= 0 ? 1 : -1; }
    else {
      const sp = e.spd * (e.slow > 0 ? 0.45 : 1); let vx = dx * sp, vy = dy * sp;
      if (T.mv === 'wobble') { const w = Math.sin(G.t * 5 + e.seed * TAU) * 60; vx += -dy * w; vy += dx * w; }
      else if (T.mv === 'burst') { const b = 0.5 + 0.95 * Math.max(0, Math.sin(G.t * 2.2 + e.seed * TAU)); vx *= b; vy *= b; }
      else if (T.mv === 'zig') { const w = Math.sign(Math.sin(G.t * 1.6 + e.seed * TAU)) * sp * 0.8; vx = vx * 0.7 - dy * w; vy = vy * 0.7 + dx * w; }
      e.x += (vx + e.kx) * dt; e.y += (vy + e.ky) * dt; e.kx *= kdecay; e.ky *= kdecay; e.face = dx >= 0 ? 1 : -1;
      if (d > vr * 2.2) { const a = rand(TAU); e.x = p.x + Math.cos(a) * vr; e.y = p.y + Math.sin(a) * vr; }
    }
    if (e.dmg > 0 && d < e.r + p.r - 3) hurtPlayer(e.dmg);
  }
  if (frozen) return;
  for (const cell of grid.values()) {
    const n = cell.length; if (n < 2) continue;
    for (let i = 0; i < n; i++) { const a = cell[i]; if (a.fixed || a.dead) continue;
      for (let j = i + 1; j < n; j++) { const b = cell[j]; if (b.fixed || b.dead) continue;
        const ex = b.x - a.x, ey = b.y - a.y, dd = Math.hypot(ex, ey), min = (a.r + b.r) * 0.85;
        if (dd < min && dd > 0.01) { const k = (min - dd) / dd * 0.25; a.x -= ex * k; a.y -= ey * k; b.x += ex * k; b.y += ey * k; } } }
  }
  for (const b of G.ebul) {
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; if (b.life <= 0) { b.dead = true; continue; }
    if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + p.r - 3) { b.dead = true; hurtPlayer(b.dmg); }
  }
}

/* ───────── pickups & fx ───────── */
function gainCoins(n) { const v = n * G.p.greed * GN.COIN_MUL; G.coins += v; G.earned += v; }
function collect(k) {
  const p = G.p;
  switch (k.type) {
    case 'xp': G.xp += k.val * p.growth; sfx('pick'); break;
    case 'coin': case 'bag': gainCoins(k.val); sfx('coin'); break;
    case 'churu': p.hp = Math.min(p.maxHp, p.hp + 30 * (1 + 0.2 * shopLv('healItem'))); sfx('coin'); G.fx.push({ type: 'ring', x: p.x, y: p.y, r: 40, t: 0, life: 0.35, col: COL.mint }); break;
    case 'bell': for (const q of G.picks) if (q.type === 'xp' || q.type === 'coin' || q.type === 'bag') q.pull = true; sfx('coin'); break;
    case 'hiss': { screenFlash('#ffffff', 0.6); const vr = viewR(); for (const e of G.enemies) { if (e.dead || e.T.prop || Math.hypot(e.x - p.x, e.y - p.y) > vr) continue; hurt(e, e.heavy ? 300 : 99999, 'hiss'); }
      G.fx.push({ type: 'ring', x: p.x, y: p.y, r: vr, t: 0, life: 0.5, col: COL.salmon }); G.shake = 10; sfx('boom'); break; }
    case 'clock': G.freeze = 6; banner('모두 멈춰!'); sfx('box'); break;
    case 'box': G.boxes++; openBox(); break;
  }
}
function picksUpdate(dt) {
  const p = G.p;
  for (const k of G.picks) {
    const dx = p.x - k.x, dy = p.y - k.y, d = Math.hypot(dx, dy) || 1;
    if (d < 17) { k.dead = true; collect(k); continue; }
    if (!k.pull && d < ((k.type === 'xp' || k.type === 'coin' || k.type === 'bag') ? p.magnet : 44)) { k.pull = true; k.sp = -150; }
    if (k.pull) { k.sp = Math.min(k.sp + 1100 * dt, 680); k.x += dx / d * k.sp * dt; k.y += dy / d * k.sp * dt; }
  }
  while (G.xp >= G.need) { G.xp -= G.need; G.level++; G.need = xpNeed(G.level); G.pendingLv++; glow(p.x, p.y, 80, COL.butter, 0.5, 0.9); sparks(p.x, p.y, 12, COL.butter, -Math.PI / 2, 1.2, 380); G.fx.push({ type: 'ring', x: p.x, y: p.y, r: 90, t: 0, life: 0.5, col: COL.butter }); }
}
function fxUpdate(dt) {
  for (const f of G.fx) {
    f.t += dt;
    if (f.type === 'puff') { f.x += f.vx * dt; f.y += f.vy * dt; }
    else if (f.type === 'num') f.y -= 40 * dt;
    if (f.t >= f.life) {
      f.dead = true;
      if (f.type === 'num') G.nums--;
      else if (f.type === 'echo') { if (f.full) slash(f.ang, f.range, f.dmg, true, f.src); else for (let i = 0; i < f.n; i++) slash(f.ang + i * TAU / f.n, f.range, f.dmg, false, f.src); }
      else if (f.type === 'can') { boom(f.x, f.y, f.r, f.dmg, f.src || 'tuna', { coin: f.coin, col: f.col || '#4fb7c9' }); if (f.patch) G.zones.push({ kind: 'puddle', x: f.x, y: f.y, r: f.r * 0.6, life: 2.5, max: 2.5, tick: 0.2, dmg: f.dmg * 0.08, slow: 1, col: '#c9a77a', src: f.src, dead: false }); }
      else if (f.type === 'warn') { const T = ENEMIES[G.stage.dasher], e = spawn(G.stage.dasher, { x: f.x, y: f.y }); e.vx = Math.cos(f.ang) * T.spd; e.vy = Math.sin(f.ang) * T.spd; e.life = f.len / T.spd + 0.3; }
    }
  }
}

/* ───────── vfx: particles, glow, hit-stop and screen flashes ─────────
   One rule for every effect: no ink outlines, a white-hot core and a coloured glow drawn additively. */
const PART_MAX = 520, glowCache = {};
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function glowSprite(col) {
  let s = glowCache[col]; if (s) return s;
  s = document.createElement('canvas'); s.width = s.height = 64; const c = s.getContext('2d'), g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, rgba(col, 1)); g.addColorStop(0.3, rgba(col, 0.55)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(0, 0, 64, 64);
  return glowCache[col] = s;
}
function part(o) { if (G.parts.length < PART_MAX) G.parts.push(Object.assign({ t: 0, vx: 0, vy: 0, z: 0, vz: 0, drag: 4 }, o)); }
function sparks(x, y, n, col, ang, spread, sp = 260) { for (let i = 0; i < n; i++) { const a = ang + rand(-spread, spread), s = rand(0.5, 1) * sp; part({ k: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.14, 0.3), col, w: rand(2.2, 3.4), drag: 7 }); } }
function glow(x, y, r, col, life = 0.22, a = 0.9) { part({ k: 'glow', x, y, r, col, life, a }); }
function chips(x, y, n, col, sp = 150) { for (let i = 0; i < n; i++) { const a = rand(TAU), s = rand(0.35, 1) * sp; part({ k: 'chip', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, z: 4, vz: rand(90, 220), life: rand(0.45, 0.75), col, sz: rand(2.2, 4.2), rot: rand(TAU), vr: rand(-12, 12), drag: 2.2 }); } }
function smoke(x, y, n, r = 10) { for (let i = 0; i < n; i++) { const a = rand(TAU), s = rand(15, 60); part({ k: 'smoke', x: x + rand(-4, 4), y: y + rand(-4, 4), vx: Math.cos(a) * s, vy: Math.sin(a) * s - 10, r: r * rand(0.6, 1.1), life: rand(0.35, 0.6), drag: 3 }); } }
function hitStop(s) { if (!REDUCED) G.hitstop = Math.max(G.hitstop, s); }
function screenFlash(col, a) { if (!REDUCED) G.flashFx = { col, a: Math.max(a, G.flashFx ? G.flashFx.a : 0) }; }
/* sparks fly out of the side that was hit; a hard cap per frame keeps big crowds cheap */
function fxHit(e, kx, ky, crit) {
  if (G.fxBudget-- <= 0) return;
  const a = Math.hypot(kx, ky) > 1 ? Math.atan2(ky, kx) : rand(TAU), hx = e.x - Math.cos(a) * e.r * 0.5, hy = e.y - Math.sin(a) * e.r * 0.5;
  sparks(hx, hy, crit ? 5 : 3, crit ? '#ffc53d' : '#ffe7a3', a, 0.7, crit ? 360 : 260); glow(hx, hy, crit ? 22 : 13, crit ? COL.butter : '#fff2d6', 0.12, 0.7);
}
/* a defeated enemy breaks into chips of its own body colour */
function fxKill(e) {
  const col = enemySprite(e.type).col, big = e.elite || e.T.boss;
  chips(e.x, e.y, big ? 18 : e.T.prop ? 7 : 5, col, big ? 260 : 150); smoke(e.x, e.y, big ? 6 : 2, e.r * 0.7);
  glow(e.x, e.y, e.r * (big ? 4 : 2.2), big ? COL.butter : '#ffffff', big ? 0.35 : 0.18, big ? 1 : 0.6);
  if (big) { sparks(e.x, e.y, 16, COL.butter, 0, Math.PI, 420); G.fx.push({ type: 'ring', x: e.x, y: e.y, r: e.r * 4, t: 0, life: 0.4, col: COL.butter }); hitStop(e.T.boss ? 0.14 : 0.06); screenFlash('#ffffff', e.T.boss ? 0.55 : 0.18); }
}
const TRAIL = { hairball: '#ffe2bd', fishbone: '#dff1ff', bone: '#dff1ff', lob: '#cfe9ff', ball: '#ffb3b3', homing: '#ffd27a' };
function partsUpdate(dt) {
  G.trailT += dt;
  if (G.trailT > 0.03) { G.trailT = 0; for (const s of G.shots) { if (G.parts.length > PART_MAX - 80) break; const col = TRAIL[s.kind === 'hair' ? (s.ico || 'hairball') : s.kind]; if (col) part({ k: 'glow', x: s.x, y: s.y, r: s.r * 1.8, col, life: 0.2, a: 0.45 }); } }
  for (const q of G.parts) {
    q.t += dt; const k = Math.exp(-q.drag * dt); q.vx *= k; q.vy *= k; q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.k === 'chip') { q.vz -= 620 * dt; q.z += q.vz * dt; q.rot += q.vr * dt; if (q.z < 0) { q.z = 0; q.vz *= -0.35; q.vr *= 0.5; q.vx *= 0.6; q.vy *= 0.6; } }
  }
  G.parts = G.parts.filter(q => q.t < q.life);
  if (G.vig > 0) G.vig = Math.max(0, G.vig - dt * 2.6);
  if (G.flashFx) { G.flashFx.a -= dt * 2.4; if (G.flashFx.a <= 0) G.flashFx = null; }
}
function drawParts(c, inView) {
  for (const q of G.parts) {
    if ((q.k !== 'chip' && q.k !== 'smoke') || !inView(q.x, q.y, 30)) continue; const f = q.t / q.life;
    if (q.k === 'chip') { c.globalAlpha = f > 0.7 ? (1 - f) / 0.3 : 1; c.save(); c.translate(q.x, q.y - q.z); c.rotate(q.rot); c.fillStyle = q.col; c.fillRect(-q.sz / 2, -q.sz * 0.35, q.sz, q.sz * 0.7); c.restore(); }
    else { c.globalAlpha = 0.35 * (1 - f); c.fillStyle = '#ece8f2'; c.beginPath(); c.arc(q.x, q.y, q.r * (0.6 + f * 0.9), 0, TAU); c.fill(); }
  }
  c.globalAlpha = 1;
  for (const q of G.parts) {
    if (q.k !== 'spark' || !inView(q.x, q.y, 40)) continue; const f = q.t / q.life;
    c.globalAlpha = 1 - f; c.strokeStyle = q.col; c.lineWidth = q.w * (1 - f * 0.5); c.lineCap = 'round'; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x - q.vx * 0.035, q.y - q.vy * 0.035); c.stroke();
  }
  c.globalAlpha = 1; c.globalCompositeOperation = 'lighter';
  for (const q of G.parts) {
    if (q.k !== 'glow' || !inView(q.x, q.y, 40)) continue; const f = q.t / q.life;
    if (false) { c.globalAlpha = 1 - f; c.strokeStyle = q.col; c.lineWidth = q.w * (1 - f * 0.5); c.lineCap = 'round'; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x - q.vx * 0.035, q.y - q.vy * 0.035); c.stroke(); }
    else { const r = q.r * (0.7 + f * 0.6); c.globalAlpha = q.a * (1 - f); c.drawImage(glowSprite(q.col), q.x - r, q.y - r, r * 2, r * 2); }
  }
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
}
/* a slash is a tapered crescent: wide in the middle, sharp at both tips */
function crescent(c, r, a0, a1, w, full) {
  c.beginPath();
  if (full) { c.arc(0, 0, r, 0, TAU); c.arc(0, 0, Math.max(1, r - w), TAU, 0, true); return; }
  c.arc(0, 0, r, a0, a1); c.arc(-w * 0.55, 0, Math.max(1, r - w * 0.6), a1, a0, true); c.closePath();
}
function avgColor(src) {
  const t = document.createElement('canvas'); t.width = t.height = 8; const c = t.getContext('2d'); c.drawImage(src, 0, 0, 8, 8);
  const d = c.getImageData(0, 0, 8, 8).data; let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 180 || d[i] + d[i + 1] + d[i + 2] < 170) continue; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  return n ? '#' + [r, g, b].map(v => Math.round(v / n).toString(16).padStart(2, '0')).join('') : '#ffffff';
}

/* ───────── achievements ───────── */
function achQ() {
  const S = save.stats, g = (G && !G.merged) ? G : null, gg = G;
  return { kills: S.kills + (g ? g.kills : 0), coins: S.coins + (g ? g.earned : 0), boxes: S.boxes + (g ? g.boxes : 0), bossKills: S.bossKills + (g ? g.bossKills : 0),
    deaths: S.deaths, t: gg ? gg.t : 0, level: gg ? gg.level : 0, stage: gg ? gg.stageId : null, nW: gg ? gg.p.weapons.length : 0,
    wlv: id => { const w = gg && gg.p.weapons.find(x => x.id === id); return w ? w.lv : 0; },
    nEvo: Object.keys(S.evolved).length, clears: S.clears, cats: save.cats.length,
    rescues: (S.rescues || 0) + (g ? g.rescueCount : 0), squad: gg ? gg.squad.length : 0,
    adopted: save.home.adopted.length, furn: Object.keys(save.home.furn).length, bond: Math.max(0, ...save.home.cats.map(c => c.bond)),
    home: save.home.cats.length, runs: S.runs, shopLv: Object.values(save.shop).reduce((a, b) => a + b, 0), played: Object.keys(S.best).length };
}
function rewardText(a) {
  const out = [], r = a.rw;
  if (r.w) out.push('무기 ' + WEAPONS[r.w].name); if (r.p) out.push('장신구 ' + PASSIVES[r.p].name); if (r.stage) out.push('스테이지 ' + STAGES[r.stage].name);
  for (const id in CATS) if (CATS[id].req === a.id) out.push('고양이 ' + CATS[id].name);
  if (r.coins) out.push('동전 ' + r.coins); if (r.flag === 'endless') out.push('무한 모드');
  return out.join(', ');
}
function checkAchs() {
  if (G && G.dev) return;                        // practice runs never count
  const q = achQ(); let any = false;
  for (const a of ACHS) {
    if (save.ach[a.id]) continue; let ok = false; try { ok = a.test(q); } catch (e) { ok = false; }
    if (!ok) continue;
    save.ach[a.id] = true; any = true; if (a.rw.coins) save.coins += a.rw.coins; if (a.rw.flag) save.flags[a.rw.flag] = true;
    if (G && state !== 'title') G.newAchs.push(a); toast('업적 달성: ' + a.name + ' (' + rewardText(a) + ')');
  }
  if (any) writeSave();
}

/* ───────── main update ───────── */
function getMove() {
  if (input.auto) return input.auto;
  let x = 0, y = 0; const k = input.keys;
  if (k.has('ArrowLeft') || k.has('KeyA')) x--; if (k.has('ArrowRight') || k.has('KeyD')) x++;
  if (k.has('ArrowUp') || k.has('KeyW')) y--; if (k.has('ArrowDown') || k.has('KeyS')) y++;
  if (x || y) { const d = Math.hypot(x, y); return { x: x / d, y: y / d }; }
  if (input.pad) return input.pad;
  const j = input.joy; if (j) { const dx = j.x - j.ox, dy = j.y - j.oy, d = Math.hypot(dx, dy); if (d > 6) { const m = Math.min(1, d / 46); return { x: dx / d * m, y: dy / d * m }; } }
  return { x: 0, y: 0 };
}
function update(dt) {
  const p = G.p; G.t += dt; G.fxBudget = 28;
  if (G.endT >= 0) { fxUpdate(dt); partsUpdate(dt); G.shake *= Math.exp(-6 * dt); if (G.t >= G.endT) finish(); return; }
  const m = getMove(); p.moving = !!(m.x || m.y) && !p.jump && !(p.hide > 0);
  if (p.jump) { const J = p.jump; J.t += dt; p.x += J.vx * dt; p.y += J.vy * dt; if (J.t >= J.dur) { p.jump = null; landJump(); } }
  else if (p.moving) { p.x += m.x * p.spd * dt; p.y += m.y * p.spd * dt; const d = Math.hypot(m.x, m.y); p.fx = m.x / d; p.fy = m.y / d; if (Math.abs(m.x) > 0.15) p.face = m.x > 0 ? 1 : -1; }
  p.inv -= dt; if (p.regen) p.hp = Math.min(p.maxHp, p.hp + p.regen * dt); if (p.stillRegen && !p.moving) p.hp = Math.min(p.maxHp, p.hp + p.stillRegen * dt);
  G.shake *= Math.exp(-6 * dt); if (G.freeze > 0) G.freeze -= dt;
  spawnUpdate(dt); buildGrid(); enemiesUpdate(dt); weaponsUpdate(dt); CUR.id = null; skillUpdate(dt); squadUpdate(dt); rescuesUpdate(dt); shotsUpdate(dt); zonesUpdate(dt); picksUpdate(dt); fxUpdate(dt); partsUpdate(dt);
  G.enemies = G.enemies.filter(e => !e.dead); G.shots = G.shots.filter(s => !s.dead); G.zones = G.zones.filter(z => !z.dead);
  G.picks = G.picks.filter(k => !k.dead); G.fx = G.fx.filter(f => !f.dead); G.ebul = G.ebul.filter(b => !b.dead);
  G.achT -= dt; if (G.achT <= 0) { G.achT = 1; checkAchs(); }
  if (G.pendingLv > 0 && state === 'play' && G.endT < 0) openLevelUp();
}

/* ───────── render ───────── */
const RAINBOW = ['#ff6b6b', '#ffd84d', '#5fd3b3', '#7cc4ff', '#b79cff'];
function drawPick(c, k, t) {
  const y = k.y + Math.sin(t * 4 + k.seed) * 1.5;
  if (k.type === 'xp') { pen(c, 1.3); if (k.val >= 20) ell(c, k.x, y, 7, 7, COL.butter); else if (k.val >= 3) { GN.art.tri(c, k.x - 4, y, k.x - 9, y - 4, k.x - 9, y + 4, COL.mint); ell(c, k.x + 1, y, 6, 4, COL.mint); } else ell(c, k.x, y, 4, 4, '#d19a5b'); }
  else drawIco(c, k.type, k.x, y, k.type === 'coin' ? 26 : 34);
}
function render(now) {
  const c = ctx, t = now / 1000, inRun = G && state !== 'title' && state !== 'menu';
  let camx, camy;
  if (!inRun) { camx = t * 24; camy = 220; }
  else { const sh = REDUCED ? 0 : G.shake; camx = G.p.x + rand(-sh, sh); camy = G.p.y + rand(-sh, sh); }
  const hw = W / 2 / ZOOM, hh = H / 2 / ZOOM;
  c.setTransform(DPR * ZOOM, 0, 0, DPR * ZOOM, DPR * (W / 2 - camx * ZOOM), DPR * (H / 2 - camy * ZOOM));
  GROUND[inRun ? G.stageId : save.stage](c, camx - hw - 2, camy - hh - 2, camx + hw + 2, camy + hh + 2);
  if (!inRun) return;
  const p = G.p, gt = G.t, inView = (x, y, m) => x > camx - hw - m && x < camx + hw + m && y > camy - hh - m && y < camy + hh + m;

  for (const z of G.zones) {
    if (!inView(z.x, z.y, 120)) continue;
    if (z.kind === 'puddle' && z.confuse) drawCatnipCloud(c, z, gt);
    else if (z.kind === 'puddle' && !z.col) drawMilk(c, z, gt);
    else if (z.kind === 'puddle') { const k = Math.min(1, (z.max - z.life) / 0.2, z.life / 0.3); c.globalAlpha = (z.col ? 0.5 : 0.8) * k; pen(c, 1.2); ell(c, z.x, z.y, z.r * k, z.r * k * 0.72, z.col || (z.slow ? '#e9f4ff' : '#ffffff')); c.globalAlpha = 1; }
    else if (z.kind === 'twister') { const k = Math.min(1, (z.max - z.life) / 0.25, z.life / 0.4); c.fillStyle = 'rgba(42,39,51,.18)'; c.beginPath(); c.ellipse(z.x, z.y, z.r * 0.75 * k, z.r * 0.26 * k, 0, 0, TAU); c.fill(); }
    else drawIco(c, z.ico || 'boxtrap', z.x, z.y, 34);
  }
  for (const f of G.fx) {
    if (f.type === 'warn') { const a = 0.25 + 0.25 * Math.sin(f.t * 22); c.save(); c.translate(f.x, f.y); c.rotate(f.ang); c.fillStyle = `rgba(255,107,107,${a})`; c.fillRect(0, -17, f.len, 34); c.restore(); }
    else if (f.type === 'can' && f.t > 0) { const q = f.t / f.life; c.fillStyle = 'rgba(42,39,51,.22)'; c.beginPath(); c.ellipse(f.x, f.y, f.r * q, f.r * q * 0.7, 0, 0, TAU); c.fill(); }
  }
  for (const k of G.picks) if (inView(k.x, k.y, 20)) drawPick(c, k, gt);
  for (const r of G.rescues) if (inView(r.x, r.y, 70)) drawRescue(c, r, gt);

  c.fillStyle = 'rgba(42,39,51,.2)';
  for (const e of G.enemies) if (inView(e.x, e.y, 80)) { c.beginPath(); c.ellipse(e.x, e.y + e.r * 0.85, e.r * 0.9, e.r * 0.35, 0, 0, TAU); c.fill(); }
  { const js = p.jump ? 1 - Math.sin(Math.PI * p.jump.t / p.jump.dur) * 0.45 : 1; c.beginPath(); c.ellipse(p.x, p.y + 13, 13 * js, 4.5 * js, 0, 0, TAU); c.fill(); }
  for (const m of G.squad) { c.beginPath(); c.ellipse(m.x, m.y + 9.5, 9.5, 3.4, 0, 0, TAU); c.fill(); }

  if (G.frenzy > 0) { c.globalAlpha = 0.5 + 0.3 * Math.sin(gt * 14); c.strokeStyle = '#7fdc6a'; c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, 26, 0, TAU); c.stroke(); c.globalAlpha = 1; }
  for (const w of p.weapons) {
    const S = w.S;
    const K = WEAPONS[w.id].kind || w.id, AC = WEAPONS[w.id].aura || COL.mint;
    if (K === 'purr') { const R = auraR(S); c.globalAlpha = 0.16 + 0.05 * Math.sin(gt * 6); dot(c, p.x, p.y, R, AC); c.globalAlpha = 0.6; c.strokeStyle = AC; c.lineWidth = 2.5; c.beginPath(); c.arc(p.x, p.y, R, 0, TAU); c.stroke(); c.globalAlpha = 1; }
    else if (K === 'laser') { const L = beamL(S); c.lineCap = 'round'; for (let i = 0; i < S.amount; i++) { const a = beamA(w, S, i), x2 = p.x + Math.cos(a) * L, y2 = p.y + Math.sin(a) * L, col = S.rainbow ? RAINBOW[i % 5] : (WEAPONS[w.id].beamCol || '#ff6b6b'); c.globalAlpha = 0.55; c.strokeStyle = col; c.lineWidth = 9; line(c, p.x, p.y, x2, y2); c.globalAlpha = 1; c.strokeStyle = '#fff'; c.lineWidth = 2.5; line(c, p.x, p.y, x2, y2); dot(c, x2, y2, 6, col); } }
  }

  const list = G.enemies; list.sort((a, b) => a.y - b.y);
  let catDrawn = false;
  const drawPlayer = () => {
    catDrawn = true; if (p.inv > 0 && Math.floor(gt * 20) % 2 && G.endT < 0) return;
    if (p.hide > 0) { c.save(); c.translate(p.x - 2, p.y - 9); c.scale(p.face, 1); drawCat(c, CATS[G.catId].look, gt, false); c.restore(); drawIco(c, 'box', p.x, p.y + 8, 56);
      c.globalAlpha = 0.5 + 0.3 * Math.sin(gt * 8); c.strokeStyle = COL.mint; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 30, 0, TAU); c.stroke(); c.globalAlpha = 1; return; }
    c.save(); c.translate(p.x, p.y - (p.jump ? Math.sin(Math.PI * p.jump.t / p.jump.dur) * 34 : 0)); c.scale(p.face, 1);
    if (G.endT >= 0 && !G.won) c.rotate(Math.min(1, (1 - (G.endT - gt))) * 1.5);
    drawCat(c, CATS[G.catId].look, gt, p.moving); c.restore();
  };
  for (const e of list) {
    if (!catDrawn && e.y > p.y) drawPlayer();
    if (!inView(e.x, e.y, 110)) continue;
    const T = e.T, sp = enemySprite(e.type), fr = (((gt * T.anim + e.seed) % 1) * sp.n) | 0, R = sp.R * e.sc;
    if (e.slow > 0 && !T.prop) { c.lineWidth = 2; c.strokeStyle = 'rgba(154,209,255,.9)'; c.beginPath(); c.ellipse(e.x, e.y + e.r * 0.85, e.r * 1.05, e.r * 0.42, 0, 0, TAU); c.stroke(); }
    if (e.elite) { c.lineWidth = 3; c.strokeStyle = COL.butter; c.beginPath(); c.ellipse(e.x, e.y + e.r * 0.85, e.r * 1.2, e.r * 0.5, 0, 0, TAU); c.stroke(); }
    if (T.dash) { c.save(); c.translate(e.x, e.y); c.rotate(Math.atan2(e.vy, e.vx)); if (e.vx < 0) c.scale(1, -1); c.drawImage(sp.f[0][fr], -R, -R, R * 2, R * 2); c.restore(); }
    else { const im = (e.flash > 0 ? sp.w : sp.f)[e.face < 0 ? 1 : 0][fr];
      if (e.hitT > 0) { const k = e.hitT / 0.14, sx = 1 + 0.22 * k, sy = 1 - 0.18 * k, fy = e.y + e.r * 0.85; c.drawImage(im, e.x - R * sx, fy - (fy - e.y + R) * sy, R * 2 * sx, R * 2 * sy); }
      else c.drawImage(im, e.x - R, e.y - R, R * 2, R * 2); }
    if (T.boss && e.mode === 'suck') { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; const a = Math.atan2(p.y - e.y, p.x - e.x); for (let i = 0; i < 5; i++) { const o = (gt * 2.5 + i / 5) % 1, d0 = 80 + (1 - o) * 220, off = (i - 2) * 0.16; line(c, e.x + Math.cos(a + off) * d0, e.y + Math.sin(a + off) * d0, e.x + Math.cos(a + off) * (d0 - 26), e.y + Math.sin(a + off) * (d0 - 26)); } }
    if (T.boss && e.mode === 'charge' && e.mt >= 0.8) { c.fillStyle = 'rgba(255,107,107,.3)'; c.save(); c.translate(e.x, e.y); c.rotate(Math.atan2(e.vy, e.vx)); c.fillRect(0, -e.r * 0.7, 360, e.r * 1.4); c.restore(); }
    if (e.elite) { const w = e.r * 2; c.fillStyle = INK; c.fillRect(e.x - w / 2 - 2, e.y - e.r - 16, w + 4, 8); c.fillStyle = COL.salmon; c.fillRect(e.x - w / 2, e.y - e.r - 14, w * clamp(e.hp / e.maxHp, 0, 1), 4); }
  }
  if (!catDrawn) drawPlayer();
  for (const m of G.squad) if (inView(m.x, m.y, 40)) {
    drawSquadCat(c, m, gt, 0.72);
    if (ALLY[m.breed].kind === 'chill') for (let i = 0; i < 3; i++) { const a = gt * 1.8 + i * TAU / 3 + m.seed * 6; snowflake(c, m.x + Math.cos(a) * 17, m.y - 4 + Math.sin(a) * 8, 3.2); }
  }

  for (const w of p.weapons) {
    const S = w.S;
    const K = WEAPONS[w.id].kind || w.id;
    if (K === 'yarn') { const R = orbitR(S), sz = 36 * Math.sqrt(S.area); for (let i = 0; i < S.amount; i++) { const a = w.ang + i / S.amount * TAU; drawIco(c, w.id, p.x + Math.cos(a) * R, p.y + Math.sin(a) * R, sz, a * 2); } }
    else if (K === 'kitten') for (const k of w.pets) { c.save(); c.translate(k.x, k.y); c.scale(k.face, 1); c.drawImage(icoSprite(w.id), -13, -13, 26, 26); c.restore(); }
  }
  drawParts(c, inView);
  for (const s of G.shots) {
    if (s.kind === 'hair') drawIco(c, s.ico || 'hairball', s.x, s.y, s.r * (s.ico === 'fishbone' ? 4.4 : 3.6), s.ico === 'fishbone' ? Math.atan2(s.vy, s.vx) : gt * 10);
    else if (s.kind === 'bone') drawIco(c, s.ico || 'fishbone', s.x, s.y, s.r * 3.2, s.rot);
    else if (s.kind === 'lob') drawIco(c, s.ico || 'bowl', s.x, s.y, s.r * 3.2, s.rot);
    else if (s.kind === 'ball') drawIco(c, s.ico || 'ball', s.x, s.y, s.r * 3.6, s.rot);
    else drawIco(c, s.ico || 'sardine', s.x, s.y, 34, Math.atan2(s.vy, s.vx));
  }
  for (const z of G.zones) if (z.kind === 'twister' && !z.dead && inView(z.x, z.y, 140)) drawTwister(c, z, gt);
  c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.6; for (const b of G.ebul) c.drawImage(glowSprite('#ff5a5a'), b.x - 18, b.y - 18, 36, 36); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  pen(c, 1.3);
  for (const b of G.ebul) ell(c, b.x, b.y, b.r, b.r, COL.salmon);
  for (const f of G.fx) {
    if (f.t < 0) continue; const q = clamp(f.t / f.life, 0, 1);
    if (f.type === 'slash') {
      const e = 1 - (1 - q) ** 3, rr = f.r * (0.6 + 0.4 * e), w = f.r * 0.3 * (1 - q * 0.6), a0 = f.full ? 0 : -1.15, a1 = f.full ? TAU : 1.15;
      c.save(); c.translate(f.x, f.y); c.rotate(f.ang + (f.full ? q * 1.4 : (e - 0.5) * 0.5));
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5 * (1 - q); c.fillStyle = '#ff9d8c'; crescent(c, rr + 5, a0, a1, w + 8, f.full); c.fill();
      const gr = c.createRadialGradient(0, 0, Math.max(1, rr - w), 0, 0, rr); gr.addColorStop(0, 'rgba(255,120,104,.95)'); gr.addColorStop(0.55, '#ffd9cf'); gr.addColorStop(1, '#ffffff');
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1 - q * q; c.fillStyle = gr; crescent(c, rr, a0, a1, w, f.full); c.fill();
      c.restore(); c.globalAlpha = 1;
    } else if (f.type === 'whip') {
      c.save(); c.translate(f.x, f.y); if (f.vert) c.rotate(Math.PI / 2); c.scale(f.dir, 1); const path = k => { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(f.w * 0.5, -f.h * 1.5 * k, f.w, 0); c.quadraticCurveTo(f.w * 0.5, -f.h * 0.2 * k, 0, 0); };
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5 * (1 - q); c.fillStyle = '#ffb36b'; path(1.25); c.fill();
      const gw = c.createLinearGradient(0, -f.h * 1.2, 0, 0); gw.addColorStop(0, '#ffffff'); gw.addColorStop(1, 'rgba(255,150,80,.95)');
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1 - q * q; c.fillStyle = gw; path(1); c.fill(); c.restore(); c.globalAlpha = 1;
    } else if (f.type === 'ring') {
      const r = f.r * (0.3 + 0.7 * (1 - (1 - q) ** 3));
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5 * (1 - q); c.strokeStyle = f.col; c.lineWidth = 14 * (1 - q) + 3; c.beginPath(); c.arc(f.x, f.y, r, 0, TAU); c.stroke();
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 0.75 * (1 - q); c.lineWidth = 6 * (1 - q) + 2; c.stroke();
      c.globalAlpha = 0.95 * (1 - q); c.strokeStyle = '#ffffff'; c.lineWidth = 2.2 * (1 - q) + 1; c.stroke(); c.globalAlpha = 1;
    } else if (f.type === 'bolt') {
      c.beginPath(); c.moveTo(f.x1, f.y1);
      for (let i = 1; i < 6; i++) { const k = i / 6; c.lineTo(f.x1 + (f.x2 - f.x1) * k + Math.sin(f.seed + i * 12.9) * 14, f.y1 + (f.y2 - f.y1) * k + Math.cos(f.seed + i * 7.3) * 8); }
      c.lineTo(f.x2, f.y2); c.lineJoin = 'round'; c.lineCap = 'round';
      c.globalCompositeOperation = 'lighter'; c.strokeStyle = COL.butter; c.globalAlpha = 0.35 * (1 - q); c.lineWidth = 14; c.stroke(); c.globalAlpha = 0.8 * (1 - q); c.lineWidth = 6; c.stroke();
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1 - q * 0.5; c.strokeStyle = '#ffffff'; c.lineWidth = 2.4; c.stroke(); c.globalAlpha = 1;
    } else if (f.type === 'beam') {
      c.lineCap = 'round'; c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.6 * (1 - q); c.strokeStyle = '#ff5a5a'; c.lineWidth = 10; line(c, f.x1, f.y1, f.x2, f.y2);
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1 - q; c.strokeStyle = '#ffffff'; c.lineWidth = 2.2; line(c, f.x1, f.y1, f.x2, f.y2); c.globalAlpha = 1;
    } else if (f.type === 'shout') {
      c.save(); c.globalAlpha = 1 - q * q; c.font = (24 + q * 10) + 'px Jua, sans-serif'; c.textAlign = 'center'; c.lineJoin = 'round'; c.lineWidth = 6; c.strokeStyle = INK; c.strokeText(f.text, f.x, f.y - 36 - q * 24); c.fillStyle = COL.butter; c.fillText(f.text, f.x, f.y - 36 - q * 24); c.restore();
    } else if (f.type === 'puff') { c.globalAlpha = 1 - q; dot(c, f.x, f.y, f.r * (1 - q * 0.5), '#fff'); c.globalAlpha = 1; }
    else if (f.type === 'can') drawIco(c, f.ico || 'tuna', f.x, f.y - (1 - q) * 260, 38, q * 5);
  }
  c.textAlign = 'center'; c.lineJoin = 'round'; c.textBaseline = 'alphabetic';
  for (const f of G.fx) if (f.type === 'num') { const pop = 1 + 0.6 * Math.max(0, 1 - f.t / 0.1); c.save(); c.translate(f.x, f.y); c.scale(pop, pop); c.font = (f.crit ? 21 : 15) + 'px Jua, sans-serif'; c.globalAlpha = 1 - (f.t / f.life) ** 2; c.lineWidth = 4; c.strokeStyle = INK; c.strokeText(f.n, 0, 0); c.fillStyle = f.crit ? COL.butter : '#fff'; c.fillText(f.n, 0, 0); c.restore(); }
  c.globalAlpha = 1;

  c.fillStyle = INK; c.fillRect(p.x - 20, p.y + 21, 40, 8); c.fillStyle = '#fff'; c.fillRect(p.x - 18, p.y + 23, 36, 4);
  c.fillStyle = COL.salmon; c.fillRect(p.x - 18, p.y + 23, 36 * clamp(p.hp / p.maxHp, 0, 1), 4);

  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (G.freeze > 0) { c.fillStyle = 'rgba(124,196,255,.14)'; c.fillRect(0, 0, W, H); }
  if (G.vig > 0 && !REDUCED) { const g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.32, W / 2, H / 2, Math.max(W, H) * 0.72); g.addColorStop(0, 'rgba(255,60,80,0)'); g.addColorStop(1, `rgba(255,60,80,${0.5 * G.vig})`); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  if (G.flashFx) { c.globalAlpha = clamp(G.flashFx.a, 0, 1); c.fillStyle = G.flashFx.col; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
  drawRescueArrows(c, camx, camy, gt);
  if (G.boss && !G.boss.dead) {
    const bw = Math.min(420, W - 32), bx = (W - bw) / 2, by = H - 46, nm = G.boss.T.name;
    c.fillStyle = INK; c.fillRect(bx - 3, by - 3, bw + 6, 20); c.fillStyle = '#fff'; c.fillRect(bx, by, bw, 14);
    c.fillStyle = '#ff6b6b'; c.fillRect(bx, by, bw * clamp(G.boss.hp / G.boss.maxHp, 0, 1), 14);
    c.font = '15px Jua, sans-serif'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = INK; c.strokeText(nm, W / 2, by - 8); c.fillStyle = '#fff'; c.fillText(nm, W / 2, by - 8);
  }
  const j = input.joy;
  if (j && state === 'play') {
    c.globalAlpha = 0.5; c.lineWidth = 3; c.strokeStyle = INK; c.fillStyle = '#fff'; c.beginPath(); c.arc(j.ox, j.oy, 46, 0, TAU); c.fill(); c.stroke();
    const dx = j.x - j.ox, dy = j.y - j.oy, d = Math.hypot(dx, dy) || 1, m = Math.min(46, d);
    c.globalAlpha = 0.9; c.fillStyle = COL.butter; c.beginPath(); c.arc(j.ox + dx / d * m, j.oy + dy / d * m, 20, 0, TAU); c.fill(); c.stroke(); c.globalAlpha = 1;
  }
}

/* ───────── HUD ───────── */
const hudCache = {};
function setText(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
function updateHud() {
  setText('#timer', fmtTime(G.t)); setText('#kills', '처치 ' + num(G.kills)); setText('#coins', '동전 ' + num(G.coins)); setText('#lvl', 'Lv ' + G.level); setText('#squadPill', `무리 ${G.squad.length}/${G.squadMax}`);
  const w = Math.round(G.xp / G.need * 100) + '%'; if (hudCache.xp !== w) { hudCache.xp = w; $('#xpfill').style.width = w; }
  const S = G.sk, pr = S.cd > 0 ? (S.cd / S.max).toFixed(3) : '0';
  if (hudCache.skp !== pr) { hudCache.skp = pr; const b = $('#btnSkill'); b.style.setProperty('--p', pr); b.classList.toggle('ready', S.cd <= 0); }
  setText('#skillCd', S.cd > 0 ? String(Math.ceil(S.cd)) : ''); const k = skillKey(); setText('#skillLabel', SKILLS[S.id].name + (k ? ' · ' + k : ''));
}
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
const ROLE = { atk: '공격', def: '방어', buf: '강화', util: '보조', risk: '도전', ally: '동료', comp: '함께 나감' };
const roleChip = r => el('span', 'role ' + r, ROLE[r]);
function nameEl(name, role) { const n = el('div', 'nm'); n.appendChild(document.createTextNode(name)); if (role) n.appendChild(roleChip(role)); return n; }
function renderSlots() {
  const fill = (box, items, max, cls) => {
    box.textContent = '';
    for (const it of items) { const d = el('div', 'slot ' + cls + (it.evo ? ' evo' : '')); d.appendChild(mkIcon(it.id, 24)); d.appendChild(el('b', '', it.evo ? '★' : it.lv)); box.appendChild(d); }
    for (let i = items.length; i < max; i++) box.appendChild(el('div', 'slot ' + cls));
  };
  fill($('#slots'), G.p.weapons, MAXW, ''); fill($('#slotsP'), G.p.passives, MAXP, 'p');
}

/* ───────── the hideout and adoption ───────── */
const FURN = GN.FURN;
const hasF = id => !!save.home.furn[id];
const homeCap = () => GN.HOME_CAP + (hasF('tower') ? 3 : 0) + (hasF('house') ? 3 : 0) + (hasF('hammock') ? 3 : 0) + (hasF('cabin') ? 3 : 0);
const snackCost = () => hasF('feeder') ? Math.round(GN.SNACK_COST / 2) : GN.SNACK_COST;
/* the first twelve cats live indoors, the rest in the yard */
const LIVING = 12; let homeRoom = 'in';
const roomCats = () => homeRoom === 'in' ? save.home.cats.slice(0, LIVING) : save.home.cats.slice(LIVING);
function pickCat(uid) { homeSel = uid; const i = save.home.cats.findIndex(c => c.uid === uid); if (i >= 0) homeRoom = i >= LIVING ? 'out' : 'in'; }
const bondStars = b => b >= 4 ? 3 : b >= 2 ? 2 : 1;
let homeTab = 'c', homeSel = null;
/* after a run: rescued cats move in, everyone who stayed home gets closer */
function settleHome() {
  const H = save.home, out = { home: 0, mom: 0, lost: 0, ready: [], bumped: 0 };
  if (G.t >= 60) for (const c of H.cats) {
    const b0 = c.bond; c.bond = Math.min(GN.BOND_MAX, c.bond + 1 + (hasF('cushion') ? 1 : 0) + (c.uid === H.companion ? 1 : 0));
    if (c.bond > b0) out.bumped++; if (b0 < GN.BOND_MAX && c.bond >= GN.BOND_MAX) out.ready.push(c.name);
  }
  for (const r of G.rescued) {
    if (r.member && !G.squad.includes(r.member)) { r.status = 'lost'; out.lost++; }
    else if (H.cats.length < homeCap()) { H.cats.push({ uid: ++H.uid, breed: r.breed, name: r.name, bond: 0, fed: -1 }); r.status = 'home'; out.home++; }
    else { r.status = 'mom'; out.mom++; save.coins += GN.MOM_COIN; }
  }
  return out;
}
function homeNote(o) {
  const parts = [];
  if (o.home) parts.push(`${o.home}마리가 아지트에 새로 들어왔어요.`);
  if (o.bumped) parts.push(`아지트 고양이 ${o.bumped}마리와 더 친해졌어요.`);
  if (o.ready.length) parts.push(`${o.ready.join(', ')} 입양 준비를 마쳤어요!`);
  if (o.mom) parts.push(`아지트가 가득 차서 ${o.mom}마리는 동네 캣맘에게 맡겼어요 (동전 +${o.mom * GN.MOM_COIN}).`);
  if (o.lost) parts.push(`${o.lost}마리는 놀라서 숨은 채 길을 잃었어요.`);
  return parts.join(' ');
}
function openHome() { state = 'menu'; refreshHome(); show('#ovHome'); }
function refreshHome() {
  const H = save.home, cap = homeCap(), comp = H.cats.find(c => c.uid === H.companion);
  for (const k of ['c', 'f', 'a']) $('#tabH' + k.toUpperCase()).classList.toggle('sel', homeTab === k);
  const nIn = Math.min(LIVING, H.cats.length); $('#roomIn').textContent = `거실 ${nIn}`; $('#roomOut').textContent = `마당 ${H.cats.length - nIn}`;
  $('#roomIn').classList.toggle('sel', homeRoom === 'in'); $('#roomOut').classList.toggle('sel', homeRoom === 'out');
  $('#homeSub').textContent = `고양이 ${H.cats.length}/${cap} · 입양 보낸 고양이 ${H.adopted.length}마리 · 함께 나갈 고양이: ${comp ? comp.name : '없음'}`;
  $('#wallet4').textContent = num(save.coins);
  const box = $('#homeList'); box.textContent = '';
  const btn = (text, cls, fn, dis) => { const b = el('button', 'btn small ' + (cls || ''), text); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); return b; };
  if (homeTab === 'c') {
    if (!H.cats.length) { box.appendChild(el('p', 'sub', '아직 아지트에 고양이가 없어요. 골목에서 갇힌 길고양이를 구하면 판이 끝난 뒤 여기로 와요.')); return; }
    for (const cat of H.cats) {
      const r = el('div', 'item homecat' + (cat.uid === homeSel ? ' picked' : '')); r.dataset.uid = cat.uid; r.appendChild(mkCat(cat.breed, 28));
      const m = el('div'); m.appendChild(nameEl(cat.name, cat.uid === H.companion ? 'comp' : null));
      m.appendChild(el('div', 'ds', `${CATS[cat.breed].name} · ${ALLY[cat.breed].desc}`));
      const hearts = el('div', 'pips hearts'); hearts.setAttribute('aria-label', `친밀도 ${cat.bond}/${GN.BOND_MAX}`); for (let i = 0; i < GN.BOND_MAX; i++) hearts.appendChild(el('i', i < cat.bond ? 'on' : '')); m.appendChild(hearts);
      m.appendChild(el('div', 'ev', `함께 나가면 ${'★'.repeat(bondStars(cat.bond))}`)); r.appendChild(m);
      const acts = el('div', 'acts'), fed = cat.fed === save.stats.runs, full = cat.bond >= GN.BOND_MAX;
      if (full) acts.appendChild(btn('입양 보내기', 'adopt', () => openAdopt(cat)));
      else acts.appendChild(btn(fed ? '간식 먹음' : `간식 · 동전 ${snackCost()}`, '', () => {
        if (save.coins < snackCost() || cat.fed === save.stats.runs) return;
        save.coins -= snackCost(); cat.bond = Math.min(GN.BOND_MAX, cat.bond + 1); cat.fed = save.stats.runs; pickCat(cat.uid); GN.room.pop(cat.uid); initAudio(); sfx('coin'); writeSave(); checkAchs(); refreshHome();
      }, fed || save.coins < snackCost()));
      acts.appendChild(btn(cat.uid === H.companion ? '함께 나감' : '함께 나가기', cat.uid === H.companion ? 'sel' : '', () => { H.companion = H.companion === cat.uid ? null : cat.uid; pickCat(cat.uid); writeSave(); refreshHome(); }));
      r.appendChild(acts); box.appendChild(r);
    }
  } else if (homeTab === 'f') {
    for (const id of Object.keys(FURN)) {
      const F = FURN[id], own = hasF(id), r = el('div', 'item'); r.appendChild(mkIcon(F.icon, 40));
      const m = el('div'); m.appendChild(el('div', 'nm', F.name)); m.appendChild(el('div', 'ds', F.desc)); m.appendChild(el('div', 'ev', F.room === 'out' ? '마당' : '거실')); r.appendChild(m);
      r.appendChild(own ? el('span', 'state ok', '들여놓음') : btn(`동전 ${num(F.cost)}`, '', () => { if (save.coins < F.cost || hasF(id)) return; save.coins -= F.cost; save.home.furn[id] = 1; initAudio(); sfx('box'); writeSave(); checkAchs(); refreshHome(); }, save.coins < F.cost));
      box.appendChild(r);
    }
  } else {
    if (!H.adopted.length) { box.appendChild(el('p', 'sub', '아직 입양 보낸 고양이가 없어요. 친밀도 다섯 칸이 차면 동네 가족에게 입양을 보낼 수 있어요.')); return; }
    const grid = el('div', 'catgrid'); box.appendChild(grid);
    for (const a of [...H.adopted].reverse()) { const card = el('div', 'catcell ok'); card.appendChild(mkCat(a.breed, 28)); card.appendChild(el('b', '', a.name)); card.appendChild(el('span', '', `${a.family}네 가족`)); grid.appendChild(card); }
  }
}
/* adoption: ask first, then celebrate */
let adoptCat = null, adoptFam = '', adoptDone = false;
function openAdopt(cat) {
  adoptCat = cat; adoptFam = pick(GN.FAMILIES); adoptDone = false;
  $('#adoptTitle').textContent = '입양 보낼까요?';
  $('#adoptText').textContent = `${jo(cat.name, '를', '을')} ${adoptFam}네 가족에게 보낼까요? 입양 보낸 고양이는 앨범에 남고, 더는 함께 나갈 수 없어요.`;
  $('#btnAdoptOk').textContent = '입양 보내기'; $('#btnAdoptNo').hidden = false; show('#ovAdopt');
}
function confirmAdopt() {
  const H = save.home, cat = adoptCat; if (!cat) return;
  if (adoptDone) { adoptCat = null; homeTab = 'a'; openHome(); return; }
  H.cats = H.cats.filter(c => c.uid !== cat.uid); if (H.companion === cat.uid) H.companion = null;
  H.adopted.push({ breed: cat.breed, name: cat.name, family: adoptFam, run: save.stats.runs });
  save.coins += GN.ADOPT_REWARD; adoptDone = true; writeSave(); checkAchs(); initAudio(); sfx('win');
  $('#adoptTitle').textContent = '새 가족이 생겼어요!';
  $('#adoptText').textContent = `${jo(cat.name, '가', '이')} ${adoptFam}네 가족이 되었어요. 고마움의 표시로 동전 ${GN.ADOPT_REWARD}개를 받았어요.`;
  $('#btnAdoptOk').textContent = `잘 가, ${cat.name}!`; $('#btnAdoptNo').hidden = true; padDefault();
}
function fitCanvas(cv2) {
  const r = cv2.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(r.width * d), h = Math.round(r.height * d);
  if (w && (cv2.width !== w || cv2.height !== h)) { cv2.width = w; cv2.height = h; } return { w: r.width, h: r.height, d };
}
let roomLast = 0;
function drawHomeCanvases(now) {
  const t = now / 1000, dt = Math.min(0.05, (now - roomLast) / 1000); roomLast = now;
  if (!$('#ovHome').hidden) {
    const cv2 = $('#roomCv'), { w, h, d } = fitCanvas(cv2); if (!w) return; const c = cv2.getContext('2d');
    c.setTransform(d * w / GN.room.VW, 0, 0, d * h / GN.room.VH, 0, 0); GN.room.draw(c, roomCats(), save.home.furn, t, homeSel, dt, homeRoom);
  }
  if (!$('#ovAdopt').hidden && adoptCat) {
    const cv2 = $('#adoptCv'), { w, h, d } = fitCanvas(cv2); if (!w) return; const c = cv2.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0); GN.room.portrait(c, w, h, adoptCat.breed, t, adoptDone);
  }
}

/* ───────── overlays ───────── */
const OV = ['#ovTitle', '#ovLogin', '#ovDevGate', '#ovDev', '#ovPrep', '#ovShop', '#ovBook', '#ovAch', '#ovHome', '#ovAdopt', '#ovLevel', '#ovBox', '#ovPause', '#ovEnd'];
function show(id) {
  for (const o of OV) $(o).hidden = o !== id; input.joy = null; input.keys.clear();
  if (id) { PAD.lockT = performance.now() + 220; PAD.fresh = true; if (PAD.on) padDefault(); }
}
function muteLabel() { const mt = save.mute ? '소리 꺼짐' : '소리 켜짐'; $('#btnMute').textContent = mt; $('#btnMute2').textContent = mt; }
function refreshTitle() {
  $('#wallet').textContent = num(save.coins); muteLabel(); acctLabel(); $('#btnDev').hidden = !DEV.on;
  const done = ACHS.filter(a => save.ach[a.id]).length, best = Math.max(0, ...Object.values(save.stats.best));
  $('#best').textContent = `최고 기록 ${fmtTime(best)} · 업적 ${done}/${ACHS.length}`;
  const ready = save.home.cats.filter(c => c.bond >= GN.BOND_MAX).length; $('#btnHideout').textContent = ready ? `아지트 · 입양 준비 ${ready}` : '아지트';
}
function toTitle() { state = 'title'; G = null; setHud(false); refreshTitle(); show('#ovTitle'); }

function refreshPrep() {
  const box = $('#cats'); box.textContent = '';
  for (const id of Object.keys(CATS)) {
    const owned = save.cats.includes(id), b = el('button', 'catcard' + (save.cat === id ? ' sel' : '') + (owned ? '' : ' locked')); b.type = 'button';
    b.appendChild(mkCat(id)); b.appendChild(el('strong', '', CATS[id].name)); b.setAttribute('aria-pressed', save.cat === id);
    b.addEventListener('click', () => { prepCat = id; if (owned) { save.cat = id; writeSave(); } refreshPrep(); });
    if (prepCat === id && save.cat !== id) b.classList.add('peek');
    box.appendChild(b);
  }
  const id = prepCat, C = CATS[id], owned = save.cats.includes(id), info = $('#catInfo'); info.textContent = '';
  const tx = el('div'); tx.appendChild(el('div', 'nm', C.name)); tx.appendChild(el('div', 'ds', C.desc + ' · 시작 무기: ' + WEAPONS[C.weapon].name)); info.appendChild(tx);
  if (!owned) {
    if (!unlocked('cat', id)) info.appendChild(el('span', 'cond', '조건: ' + LOCK.cat[id].desc));
    else { const b = el('button', 'btn small', `동전 ${C.cost}에 데려오기`); b.type = 'button'; b.disabled = save.coins < C.cost;
      b.addEventListener('click', () => { if (save.coins < C.cost) return; save.coins -= C.cost; save.cats.push(id); save.cat = id; initAudio(); sfx('box'); writeSave(); checkAchs(); refreshPrep(); }); info.appendChild(b); }
  }
  const kb = $('#skills'); kb.textContent = '';
  for (const sid of Object.keys(SKILLS)) { const K = SKILLS[sid], b = el('button', 'skillpick' + (save.skill === sid ? ' sel' : '')); b.type = 'button'; b.setAttribute('aria-pressed', save.skill === sid); b.appendChild(mkIcon(K.icon, 30)); const t = el('span'); t.appendChild(el('strong', '', K.name)); t.appendChild(el('small', '', `쿨다운 ${K.cd}초`)); b.appendChild(t); b.addEventListener('click', () => { save.skill = sid; writeSave(); refreshPrep(); }); kb.appendChild(b); }
  $('#skillDesc').textContent = SKILLS[save.skill].desc;
  const sb = $('#stages'); sb.textContent = '';
  for (const sid of Object.keys(STAGES)) {
    const S = STAGES[sid], ok = unlocked('stage', sid), b = el('button', 'stagebtn' + (save.stage === sid ? ' sel' : '')); b.type = 'button'; b.disabled = !ok;
    b.appendChild(el('strong', '', S.name)); b.appendChild(el('small', '', ok ? (save.stats.best[sid] ? '최고 ' + fmtTime(save.stats.best[sid]) + (save.stats.clears[sid] ? ' · 클리어' : '') : S.desc) : '조건: ' + LOCK.stage[sid].desc));
    b.addEventListener('click', () => { save.stage = sid; writeSave(); refreshPrep(); }); sb.appendChild(b);
  }
  const cp = save.home.cats.find(c => c.uid === save.home.companion), cl = $('#compLine');
  cl.hidden = !save.home.cats.length; cl.textContent = cp ? `함께 나갈 고양이: ${cp.name} (${CATS[cp.breed].name}, ${'★'.repeat(bondStars(cp.bond))}) · 아지트에서 바꿀 수 있어요` : '아지트에서 고양이 한 마리를 골라 함께 나갈 수 있어요';
  const eb = $('#btnEndless'), canEndless = save.flags.endless || save.unlockAll; eb.hidden = !canEndless; eb.textContent = save.endless ? '무한 모드: 켜짐' : '무한 모드: 꺼짐';
  $('#wallet3').textContent = num(save.coins);
}
let prepCat = 'cheese';
function refreshShop() {
  $('#wallet2').textContent = num(save.coins); const box = $('#shopList'); box.textContent = '';
  for (const id of Object.keys(SHOP)) {
    const S = SHOP[id], lv = shopLv(id), row = el('div', 'item'), cost = S.cost * (lv + 1);
    row.appendChild(mkIcon(S.icon, 40));
    const mid = el('div'); mid.appendChild(el('div', 'nm', S.name)); mid.appendChild(el('div', 'ds', S.desc));
    const pips = el('div', 'pips'); for (let i = 0; i < S.max; i++) pips.appendChild(el('i', i < lv ? 'on' : '')); mid.appendChild(pips); row.appendChild(mid);
    const b = el('button', 'btn small', lv >= S.max ? '최대' : `동전 ${num(cost)}`); b.type = 'button'; b.disabled = lv >= S.max || save.coins < cost;
    b.addEventListener('click', () => { if (save.coins < cost) return; save.coins -= cost; save.shop[id] = lv + 1; writeSave(); initAudio(); sfx('coin'); refreshShop(); });
    row.appendChild(b); box.appendChild(row);
  }
}
function refundShop() {
  let back = 0; for (const id in save.shop) { const S = SHOP[id]; if (!S) continue; for (let i = 0; i < save.shop[id]; i++) back += S.cost * (i + 1); }
  save.coins += back; save.shop = {}; writeSave(); refreshShop();
}
let bookTab = 'w';
function refreshBook() {
  for (const k of ['w', 'p', 'e']) $('#tab' + k.toUpperCase()).classList.toggle('sel', bookTab === k);
  const box = $('#bookList'); box.textContent = '';
  const row = (ic, name, desc, extra, locked, role) => { const r = el('div', 'item' + (locked ? ' lockrow' : '')); r.appendChild(ic); const m = el('div'); m.appendChild(nameEl(name, role)); m.appendChild(el('div', 'ds', desc)); if (extra) m.appendChild(el('div', 'ev', extra)); r.appendChild(m); box.appendChild(r); };
  if (bookTab === 'w') for (const id of Object.keys(WEAPONS)) { const D = WEAPONS[id], ok = unlocked('w', id); row(mkIcon(id, 40), D.name, ok ? D.desc : '조건: ' + LOCK.w[id].desc, `진화: ${PASSIVES[D.evo.needs].name} → ${D.evo.name}` + (save.stats.evolved[id] ? ' (달성)' : ''), !ok, D.role); }
  else if (bookTab === 'p') for (const id of Object.keys(PASSIVES)) { const D = PASSIVES[id], ok = unlocked('p', id), use = Object.keys(WEAPONS).find(k => WEAPONS[k].evo.needs === id); row(mkIcon(id, 40), D.name, ok ? `${D.desc} (최대 Lv ${D.max})` : '조건: ' + LOCK.p[id].desc, use ? `${WEAPONS[use].name} 진화 재료` : '', !ok, D.role); }
  else for (const sid of Object.keys(STAGES)) { const S = STAGES[sid]; box.appendChild(el('div', 'grouphead', S.name)); for (const t of [...S.roster, S.dasher, S.boss]) { const T = ENEMIES[t]; row(mkEnemy(t, 40), T.name, T.boss ? '10분마다 나타나는 보스' : T.dash ? '화면을 가로질러 돌진한다' : `체력 ${T.hp} · 속도 ${T.spd}`, '', false); } }
}
function refreshAch() {
  const done = ACHS.filter(a => save.ach[a.id]).length; $('#achCount').textContent = `${done} / ${ACHS.length} 달성`;
  const box = $('#achList'); box.textContent = '';
  for (const a of ACHS) { const ok = !!save.ach[a.id], r = el('div', 'item ach' + (ok ? ' done' : '')); r.appendChild(el('span', 'check', ok ? '완료' : '미완')); const m = el('div'); m.appendChild(el('div', 'nm', a.name)); m.appendChild(el('div', 'ds', a.desc)); m.appendChild(el('div', 'ev', '보상: ' + rewardText(a))); r.appendChild(m); box.appendChild(r); }
  $('#btnUnlockAll').textContent = save.unlockAll ? '전부 해금: 켜짐 (테스트용)' : '전부 해금: 꺼짐 (테스트용)';
}

/* level up */
let curChoices = [], banMode = false;
const UP_TXT = { dmg: v => `피해 +${v}`, amount: v => `개수 +${v}`, pierce: v => `관통 +${v}`, area: v => `범위 +${Math.round(v * 100)}%`, cd: v => `쿨다운 ${Math.round(v * 100)}%`, speed: v => `속도 +${Math.round(v * 100)}%`, dur: v => `지속시간 +${Math.round(v * 100)}%` };
const upText = u => Object.keys(u).map(k => UP_TXT[k](u[k])).join(', ');
function rollChoices() {
  const p = G.p, pool = [];
  for (const id of Object.keys(WEAPONS)) { if (G.banned[id] || !unlocked('w', id)) continue; const w = p.weapons.find(x => x.id === id); if (w) { if (!w.evo && w.lv < WMAX) pool.push({ kind: 'w', id, wt: 3 }); } else if (p.weapons.length < MAXW) pool.push({ kind: 'w', id, wt: 2 }); }
  for (const id of Object.keys(PASSIVES)) { if (G.banned[id] || !unlocked('p', id)) continue; const s = p.passives.find(x => x.id === id); if (s) { if (s.lv < PASSIVES[id].max) pool.push({ kind: 'p', id, wt: 3 }); } else if (p.passives.length < MAXP) pool.push({ kind: 'p', id, wt: 2 }); }
  const n = 3 + (Math.random() < Math.min(0.6, (p.luck - 1) * 0.6) ? 1 : 0), out = [];
  while (out.length < n && pool.length) { let r = rand(pool.reduce((s, c) => s + c.wt, 0)), i = 0; for (; i < pool.length - 1; i++) { r -= pool[i].wt; if (r <= 0) break; } out.push(pool.splice(i, 1)[0]); }
  if (!out.length) out.push({ kind: 'heal' }, { kind: 'coin' });
  return out;
}
function choiceInfo(ch) {
  const p = G.p;
  if (ch.kind === 'w') { const w = p.weapons.find(x => x.id === ch.id), D = WEAPONS[ch.id];
    return { icon: ch.id, name: D.name, role: D.role, tag: w ? `Lv ${w.lv} → ${w.lv + 1}` : '새 무기', isNew: !w, desc: w ? upText(D.ups[w.lv - 1]) : D.desc, ev: `진화 재료: ${PASSIVES[D.evo.needs].name}` }; }
  if (ch.kind === 'p') { const s = p.passives.find(x => x.id === ch.id), P = PASSIVES[ch.id], use = Object.keys(WEAPONS).find(k => WEAPONS[k].evo.needs === ch.id);
    return { icon: ch.id, name: P.name, role: P.role, tag: s ? `Lv ${s.lv} → ${s.lv + 1}` : '새 장신구', isNew: !s, desc: P.desc, ev: use ? `${WEAPONS[use].name} 진화에 필요` : '' }; }
  if (ch.kind === 'heal') return { icon: 'churu', name: '츄르 한 봉', tag: '간식', desc: '체력 40 회복', ev: '' };
  return { icon: 'coin', name: '동전 주머니', tag: '용돈', desc: `동전 +${Math.round(25 * G.p.greed * GN.COIN_MUL)}`, ev: '' };
}
function openLevelUp(keep) {
  state = 'levelup'; if (!keep) { curChoices = rollChoices(); banMode = false; sfx('lvl'); }
  $('#lvTitle').textContent = banMode ? '이번 판에서 뺄 것을 고르세요' : `레벨 ${G.level - G.pendingLv + 1} 달성!`;
  const box = $('#choices'); box.textContent = '';
  curChoices.forEach((ch, i) => {
    const I = choiceInfo(ch), b = el('button', 'choice' + (banMode ? ' ban' : '')); b.type = 'button'; b.appendChild(mkIcon(I.icon, 52));
    const d = el('div'), nm = el('div', 'nm'); nm.appendChild(document.createTextNode(I.name)); if (I.role) nm.appendChild(roleChip(I.role)); nm.appendChild(el('span', 'tag' + (I.isNew ? ' new' : ''), I.tag)); d.appendChild(nm);
    d.appendChild(el('div', 'ds', I.desc)); if (I.ev) d.appendChild(el('div', 'ev', I.ev)); b.appendChild(d);
    b.addEventListener('click', () => pickChoice(i)); box.appendChild(b);
  });
  const filler = curChoices[0].kind === 'heal' || curChoices[0].kind === 'coin';
  const rr = $('#btnReroll'); rr.textContent = `다시 뽑기 ${G.rerolls}`; rr.disabled = G.rerolls <= 0 || filler;
  const sk = $('#btnSkip'); sk.textContent = `건너뛰기 ${G.skips}`; sk.disabled = G.skips <= 0;
  const bn = $('#btnBanish'); bn.textContent = banMode ? '취소' : `제외 ${G.banishes}`; bn.disabled = (!banMode && G.banishes <= 0) || filler;
  show('#ovLevel');
}
function nextLevelOrResume() { G.pendingLv--; if (G.pendingLv > 0) openLevelUp(); else resume(); }
function pickChoice(i) {
  const ch = curChoices[i]; if (!ch || state !== 'levelup') return; const p = G.p;
  if (banMode) { if (ch.kind !== 'w' && ch.kind !== 'p') return; G.banned[ch.id] = true; G.banishes--; banMode = false; curChoices.splice(i, 1); if (!curChoices.length) curChoices = rollChoices(); openLevelUp(true); return; }
  if (ch.kind === 'w') { const w = p.weapons.find(x => x.id === ch.id); if (w) w.lv++; else addWeapon(ch.id); }
  else if (ch.kind === 'p') { const s = p.passives.find(x => x.id === ch.id); if (s) s.lv++; else p.passives.push({ id: ch.id, lv: 1 }); }
  else if (ch.kind === 'heal') p.hp = Math.min(p.maxHp, p.hp + 40);
  else gainCoins(25);
  recalc(); renderSlots(); nextLevelOrResume();
}

/* chest */
function openBox() {
  state = 'box'; const p = G.p, items = [];
  const bl = 1 + 0.25 * shopLv('boxLuck'), r = Math.random(), n = r < 0.04 * p.luck * bl ? 5 : r < 0.26 * p.luck * bl ? 3 : 1;
  for (let i = 0; i < n; i++) {
    const evo = p.weapons.find(w => !w.evo && w.lv >= WMAX && plv(WEAPONS[w.id].evo.needs) > 0);
    if (evo) { evo.evo = true; evo.t = 0; save.stats.evolved[evo.id] = true; items.push({ icon: evo.id, name: WEAPONS[evo.id].evo.name, desc: '진화! ' + WEAPONS[evo.id].evo.desc, evo: true }); continue; }
    const ups = [...p.weapons.filter(w => !w.evo && w.lv < WMAX).map(w => ({ w })), ...p.passives.filter(s => s.lv < PASSIVES[s.id].max).map(s => ({ s }))];
    if (ups.length) { const u = pick(ups); if (u.w) { u.w.lv++; items.push({ icon: u.w.id, name: WEAPONS[u.w.id].name, desc: `Lv ${u.w.lv}로 강화` }); } else { u.s.lv++; items.push({ icon: u.s.id, name: PASSIVES[u.s.id].name, desc: `Lv ${u.s.lv}로 강화` }); } }
    else { p.hp = p.maxHp; items.push({ icon: 'churu', name: '츄르 잔치', desc: '체력을 모두 회복' }); break; }
  }
  const bonus = Math.floor(rand(20, 50) * n); gainCoins(bonus);
  recalc(); renderSlots(); sfx('box'); checkAchs();
  $('#boxTitle').textContent = items.some(x => x.evo) ? '무기 진화!' : n >= 5 ? '대박 상자!' : n >= 3 ? '묵직한 택배 상자!' : '택배 상자 발견!';
  const box = $('#boxItems'); box.textContent = '';
  for (const it of items) { const rw = el('div', 'item' + (it.evo ? ' evorow' : '')); rw.appendChild(mkIcon(it.icon, 40)); const m = el('div'); m.appendChild(el('div', 'nm', it.name)); m.appendChild(el('div', 'ds', it.desc)); rw.appendChild(m); box.appendChild(rw); }
  $('#boxText').textContent = `동전 +${num(bonus * p.greed * GN.COIN_MUL)}`;
  show('#ovBox');
}

/* pause, end */
function buildRows(box) {
  box.textContent = '';
  const row = (ic, name, desc, lv, max, evo, role) => { const r = el('div', 'item'); r.appendChild(mkIcon(ic, 40)); const m = el('div'); m.appendChild(nameEl(name, role)); m.appendChild(el('div', 'ds', desc)); r.appendChild(m); r.appendChild(el('span', 'num', evo ? '진화' : `Lv ${lv}/${max}`)); box.appendChild(r); };
  for (const w of G.p.weapons) row(w.id, wname(w), w.evo ? WEAPONS[w.id].evo.desc : WEAPONS[w.id].desc, w.lv, WMAX, w.evo, WEAPONS[w.id].role);
  for (const s of G.p.passives) row(s.id, PASSIVES[s.id].name, PASSIVES[s.id].desc, s.lv, PASSIVES[s.id].max, false, PASSIVES[s.id].role);
  for (const m of G.squad) { const r = el('div', 'item'); r.appendChild(mkCat(m.breed, 28)); const d = el('div'); d.appendChild(nameEl(m.name, 'ally')); d.appendChild(el('div', 'ds', `${CATS[m.breed].name} · ${ALLY[m.breed].desc}`)); r.appendChild(d); r.appendChild(el('span', 'num', m.stars > 1 ? '★'.repeat(m.stars) : '')); box.appendChild(r); }
}
function pause() {
  if (state !== 'play') return; state = 'pause'; const p = G.p, pc = v => Math.round(v * 100) + '%';
  const sg = $('#statGrid'); sg.textContent = '';
  for (const [l, v] of [['체력', `${Math.ceil(p.hp)}/${p.maxHp}`], ['공격력', pc(p.might)], ['방어', p.armor], ['재생', p.regen.toFixed(1)], ['쿨다운', pc(p.cdMul)], ['범위', pc(p.area)], ['투사체 속도', pc(p.pspeed)], ['지속시간', pc(p.dur)], ['개수', '+' + p.amount], ['이동속도', pc(p.spd / 150)], ['행운', pc(p.luck)], ['부활', G.revTotal - G.revUsed]]) { const d = el('div'); d.appendChild(el('span', '', l)); d.appendChild(el('b', '', v)); sg.appendChild(d); }
  buildRows($('#buildList')); muteLabel(); show('#ovPause');
}
function resume() { state = 'play'; show(null); last = performance.now(); const a = document.activeElement; if (a && a !== document.body && a.blur) a.blur(); }
function finish() {
  if (G.dev) { devFinish(); return; }
  state = 'over'; const won = G.won, S = save.stats, gain = Math.floor(G.coins) + (won ? 200 : 0), sid = G.stageId;
  S.best[sid] = Math.max(S.best[sid] || 0, G.t); S.bestLv[sid] = Math.max(S.bestLv[sid] || 0, G.level); S.runs++;
  if (!won && !G.quit) S.deaths++;
  const settled = settleHome();
  checkAchs();
  S.kills += G.kills; S.coins += G.earned; S.boxes += G.boxes; S.bossKills += G.bossKills; S.rescues = (S.rescues || 0) + G.rescueCount; G.merged = true;
  save.coins += gain; writeSave(); if (won) sfx('win');
  $('#endTitle').textContent = won ? `${G.stage.name}의 왕이 되었다!` : G.cleared ? '무한 모드 종료' : '골목은 험하다';
  $('#endSub').textContent = won ? `30분을 버티고 ${ENEMIES[G.stage.boss].name}을 물리쳤습니다. 클리어 보너스 동전 200개를 받았습니다.` : `${G.stage.name}에서 ${fmtTime(G.t)}까지 버텼습니다. 모은 동전으로 단련하고 다시 도전하세요.`;
  const facts = $('#endFacts'); facts.textContent = '';
  for (const [v, l] of [[fmtTime(G.t), '버틴 시간'], [num(G.kills), '처치'], [G.level, '레벨'], ['+' + num(gain), '동전']]) { const d = el('div'); d.appendChild(el('b', '', v)); d.appendChild(el('span', '', l)); facts.appendChild(d); }
  const ea = $('#endAch'); ea.textContent = '';
  for (const a of G.newAchs) { const r = el('div', 'item ach done'); r.appendChild(el('span', 'check', '달성')); const m = el('div'); m.appendChild(el('div', 'nm', a.name)); m.appendChild(el('div', 'ev', '보상: ' + rewardText(a))); r.appendChild(m); ea.appendChild(r); }
  const dm = $('#endDmg'); dm.textContent = '';
  const rows = Object.entries(G.dmgBy).filter(([k]) => WEAPONS[k] || k === 'squad').sort((a, b) => b[1] - a[1]), top = rows.length ? rows[0][1] : 1;
  for (const [id, v] of rows) { if (id === 'squad') { const r = el('div', 'item'); r.appendChild(mkCat(G.rescued[0] ? G.rescued[0].breed : 'cheese', 28)); const m = el('div'); m.appendChild(el('div', 'nm', '고양이 무리')); const bar = el('div', 'bar'), fill = el('i'); fill.style.width = Math.max(3, v / top * 100) + '%'; bar.appendChild(fill); m.appendChild(bar); r.appendChild(m); r.appendChild(el('span', 'num', num(v))); dm.appendChild(r); continue; }
    const w = G.p.weapons.find(x => x.id === id), r = el('div', 'item'); r.appendChild(mkIcon(id, 40)); const m = el('div'); m.appendChild(el('div', 'nm', w ? wname(w) : WEAPONS[id].name)); const bar = el('div', 'bar'), fill = el('i'); fill.style.width = Math.max(3, v / top * 100) + '%'; bar.appendChild(fill); m.appendChild(bar); r.appendChild(m); r.appendChild(el('span', 'num', num(v))); dm.appendChild(r); }
  renderRescued($('#endCats')); $('#endHome').textContent = homeNote(settled);
  setHud(false); show('#ovEnd');
}
/* end screen: every cat rescued this run and where it ended up */
function rescuedStatus(r) { return r.status === 'home' ? ['아지트로', 'ok'] : r.status === 'mom' ? ['캣맘에게', 'mom'] : ['길을 잃음', 'lost']; }
function renderRescued(box) {
  box.textContent = ''; if (!G.rescued.length) return;
  box.appendChild(el('div', 'grouphead', `구한 길고양이 ${G.rescued.length}마리`));
  const grid = el('div', 'catgrid'); box.appendChild(grid);
  for (const r of G.rescued) { const [st, cls] = rescuedStatus(r), card = el('div', 'catcell ' + cls); card.appendChild(mkCat(r.breed, 28)); card.appendChild(el('b', '', r.name)); card.appendChild(el('span', '', st)); card.title = CATS[r.breed].name; grid.appendChild(card); }
}
function setHud(on) { $('#hud').hidden = !on; $('#skillWrap').hidden = !on; }
function startRun() {
  if (!save.cats.includes(save.cat)) save.cat = 'cheese'; if (!unlocked('stage', save.stage)) save.stage = 'alley';
  initAudio(); if (AC && AC.state === 'suspended') AC.resume();
  newRun(); renderSlots(); for (const k in hudCache) delete hudCache[k]; drawSkillIcon(); setHud(true); updateHud(); resume();
}
/* ───────── developer mode: a boss practice range ─────────
   Opened by tapping the title five times (or #dev in the address) and entering the developer passcode once per device.
   Only the passcode's SHA-256 is in the code. The practice run never touches coins, records or achievements. */
const DEV_HASH = '72e05755c901137040bae84f76ec7349baf97e1057c54dc8a044617465907265', DEV_KEY = 'gilnyang-dev', DEV_CFG = 'gilnyang-dev-cfg';
const BOSSES = Object.keys(ENEMIES).filter(id => ENEMIES[id].boss);
const bossStage = id => Object.keys(STAGES).find(s => STAGES[s].boss === id) || 'alley';
const DEV = { on: false, taps: [], last: null, cfg: { cat: 'cheese', skill: 'jump', boss: BOSSES[0], phase: 1, god: true, mobs: false, shop: false, w: { claw: 8 }, e: {}, p: {} } };
try { DEV.on = localStorage.getItem(DEV_KEY) === DEV_HASH; const c = JSON.parse(localStorage.getItem(DEV_CFG)); if (c) Object.assign(DEV.cfg, c); } catch (e) { /* storage blocked */ }
const dbtn = (text, cls, fn, dis) => { const b = el('button', 'btn ' + cls, text); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); return b; };
function devSaveCfg() { try { localStorage.setItem(DEV_CFG, JSON.stringify(DEV.cfg)); } catch (e) { /* ignore */ } }
async function sha256(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
function devGate() { if (DEV.on) { openDev(); return; } $('#devPass').value = ''; $('#devGateErr').hidden = true; show('#ovDevGate'); setTimeout(() => $('#devPass').focus(), 50); }
function devCount(kind) { const C = DEV.cfg; return Object.values(kind === 'w' ? C.w : C.p).filter(v => v > 0).length; }
function openDev() { state = 'menu'; G = null; setHud(false); refreshDev(); show('#ovDev'); }
function refreshDev() {
  const C = DEV.cfg;
  if (!CATS[C.cat]) C.cat = 'cheese'; if (!GN.SKILLS[C.skill]) C.skill = 'jump'; if (!ENEMIES[C.boss]) C.boss = BOSSES[0];
  const fillSel = (sel, items, val) => { const s = $(sel); if (!s.options.length) for (const [v, t] of items) { const o = el('option', '', t); o.value = v; s.appendChild(o); } s.value = val; };
  fillSel('#devCat', Object.keys(CATS).map(id => [id, CATS[id].name]), C.cat);
  fillSel('#devSkill', Object.keys(GN.SKILLS).map(id => [id, GN.SKILLS[id].name]), C.skill);
  fillSel('#devBoss', BOSSES.map(id => [id, `${ENEMIES[id].name} · ${STAGES[bossStage(id)].name}`]), C.boss);
  $('#devPhase').value = String(C.phase);
  const tog = (id, on, label) => { const b = $(id); b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); b.textContent = `${label}: ${on ? '켬' : '끔'}`; };
  tog('#devGod', C.god, '무적'); tog('#devMobs', C.mobs, '잡몹'); tog('#devShop', C.shop, '단련 적용');
  const box = $('#devList'), top = box.scrollTop; box.textContent = '';
  const nW = devCount('w'), nP = devCount('p');
  box.appendChild(el('div', 'grouphead', `무기 ${nW}/${MAXW}`));
  for (const id of Object.keys(WEAPONS)) {
    const D = WEAPONS[id], lv = C.w[id] || 0, evo = !!C.e[id] && lv >= WMAX, r = el('div', 'devrow' + (lv ? ' on' : ''));
    r.appendChild(mkIcon(id, 34)); const t = el('div'); t.appendChild(el('div', 'nm', evo ? D.evo.name : D.name)); t.appendChild(el('small', '', D.evo ? `진화: ${D.evo.name} (${PASSIVES[D.evo.needs] ? PASSIVES[D.evo.needs].name : D.evo.needs} 필요)` : D.desc)); r.appendChild(t);
    const ctl = el('div', 'devctl');
    ctl.appendChild(dbtn('−', 'small', () => { C.w[id] = Math.max(0, lv - 1); if (C.w[id] < WMAX) delete C.e[id]; devSaveCfg(); refreshDev(); }, lv <= 0));
    ctl.appendChild(el('b', '', lv ? (evo ? '진화' : 'Lv ' + lv) : '-'));
    ctl.appendChild(dbtn('+', 'small', () => { C.w[id] = lv + 1; devSaveCfg(); refreshDev(); }, lv >= WMAX || (!lv && nW >= MAXW)));
    if (D.evo) ctl.appendChild(dbtn('진화', 'small' + (evo ? ' sel' : ''), () => { if (evo) delete C.e[id]; else C.e[id] = true; devSaveCfg(); refreshDev(); }, lv < WMAX));
    r.appendChild(ctl); box.appendChild(r);
  }
  box.appendChild(el('div', 'grouphead', `장신구 ${nP}/${MAXP}`));
  for (const id of Object.keys(PASSIVES)) {
    const P = PASSIVES[id], lv = C.p[id] || 0, r = el('div', 'devrow' + (lv ? ' on' : ''));
    r.appendChild(mkIcon(id, 34)); const t = el('div'); t.appendChild(el('div', 'nm', P.name)); t.appendChild(el('small', '', P.desc)); r.appendChild(t);
    const ctl = el('div', 'devctl');
    ctl.appendChild(dbtn('−', 'small', () => { C.p[id] = Math.max(0, lv - 1); devSaveCfg(); refreshDev(); }, lv <= 0));
    ctl.appendChild(el('b', '', lv ? `${lv}/${P.max}` : '-'));
    ctl.appendChild(dbtn('+', 'small', () => { C.p[id] = lv + 1; devSaveCfg(); refreshDev(); }, lv >= P.max || (!lv && nP >= MAXP)));
    r.appendChild(ctl); box.appendChild(r);
  }
  box.scrollTop = top;
  const res = $('#devRes'), L = DEV.last; res.hidden = !L; res.textContent = '';
  if (L) {
    res.appendChild(el('strong', '', L.won ? `${L.boss} 격파 · ${fmtTime(L.time)}` : L.dead ? `쓰러짐 · ${fmtTime(L.time)} 버팀` : `그만둠 · ${fmtTime(L.time)}`));
    res.appendChild(el('div', '', `보스 체력 ${L.won ? 0 : Math.round(L.hpLeft * 100)}% 남음 · 보스 최대 체력 ${num(Math.round(L.maxHp))} · 초당 피해 ${num(Math.round(L.dps))}`));
    res.appendChild(el('div', '', `맞은 횟수 ${L.hits} · 받은 피해 ${num(Math.round(L.taken))}${L.god ? ' (무적이라 실제로는 안 깎임)' : ''} · 최대 체력 ${L.maxPHp}`));
    if (L.dmg.length) res.appendChild(el('div', 'grouphead', '보스에게 준 피해'));
    for (const [id, v] of L.dmg.slice(0, 8)) { const nm = WEAPONS[id] ? WEAPONS[id].name : id === 'squad' ? '무리 고양이' : id === 'thorns' ? '가시 목도리' : id; const row = el('div'); row.appendChild(el('div', '', `${nm} · ${num(Math.round(v))} (${Math.round(v / L.total * 100)}%)`)); const b = el('div', 'bar'); const i = el('i'); i.style.width = (v / L.dmg[0][1] * 100) + '%'; b.appendChild(i); row.appendChild(b); res.appendChild(row); }
  }
}
function startDev() {
  const C = DEV.cfg, keep = { cat: save.cat, skill: save.skill, stage: save.stage, endless: save.endless, comp: save.home.companion };
  initAudio(); if (AC && AC.state === 'suspended') AC.resume();
  save.cat = C.cat; save.skill = C.skill; save.stage = bossStage(C.boss); save.endless = false; save.home.companion = null;
  devNoShop = !C.shop;
  try { newRun(); } finally { save.cat = keep.cat; save.skill = keep.skill; save.stage = keep.stage; save.endless = keep.endless; save.home.companion = keep.comp; }
  const p = G.p, T0 = [600, 1200, 1800][C.phase - 1];
  G.dev = { god: C.god, mobs: C.mobs, shop: C.shop, hits: 0, taken: 0, start: T0, killT: 0, bossBy: {} };
  p.weapons.length = 0; p.passives.length = 0; G.squad = [];
  for (const id of Object.keys(C.w)) if (C.w[id] > 0 && WEAPONS[id]) p.weapons.push({ id, lv: Math.min(WMAX, C.w[id]), evo: !!C.e[id] && C.w[id] >= WMAX && !!WEAPONS[id].evo, t: 0.4, ang: 0, burst: 0, bt: 0, tt: 0, pets: [], S: null });
  for (const id of Object.keys(C.p)) if (C.p[id] > 0 && PASSIVES[id]) p.passives.push({ id, lv: Math.min(PASSIVES[id].max, C.p[id]) });
  recalc(); p.hp = p.maxHp;
  G.need = Infinity; G.pendingLv = 0; G.t = T0; G.waveMin = -1;
  G.nextBoss = G.nextElite = G.nextProp = G.nextRescue = G.nextHorde = 1e9; G.nextSwarm = T0 + 45; G.nextDash = C.mobs ? T0 + 20 : 1e9;
  G.bossN = C.phase; const b = spawn(C.boss, { hpMul: [1, 2.6, 5][C.phase - 1], dist: 340 }); b.final = false; G.boss = b;
  renderSlots(); for (const k in hudCache) delete hudCache[k]; drawSkillIcon(); setHud(true); updateHud(); resume();
  banner(ENEMIES[C.boss].name + ' 등장!'); sfx('warn');
}
function devFinish() {
  devNoShop = false;
  const D = G.dev, b = G.boss, end = D.killT || G.t, time = Math.max(0.1, end - D.start);
  const dmg = Object.entries(D.bossBy).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]), total = dmg.reduce((a, [, v]) => a + v, 0) || 1;
  const bossDmg = b ? b.maxHp - Math.max(0, b.hp) : 0;
  DEV.last = { won: G.won, dead: !G.won && !G.quit, boss: b ? b.T.name : '', time, hpLeft: b ? Math.max(0, b.hp) / b.maxHp : 0, maxHp: b ? b.maxHp : 0, dps: bossDmg / time, hits: D.hits, taken: D.taken, god: D.god, maxPHp: G.p.maxHp, dmg, total };
  if (G.won) sfx('win');
  openDev(); $('#devList').scrollTop = 0; $('#ovDev .panel').scrollIntoView && $('#ovDev').scrollTo(0, 0);
}
function toggleMute() { save.mute = !save.mute; writeSave(); muteLabel(); }

/* ───────── input ───────── */
window.addEventListener('keydown', e => {
  if (e.repeat) return;
  if (state === 'play') { if (e.code === 'Escape' || e.code === 'KeyP') { pause(); return; } if (e.code === 'Space' || e.code === 'KeyJ' || e.code === 'KeyK') { e.preventDefault(); useSkill(); return; } if (e.code.startsWith('Arrow')) e.preventDefault(); input.keys.add(e.code); }
  else if (state === 'pause') { if (e.code === 'Escape' || e.code === 'KeyP') resume(); }
  else if (state === 'levelup') { const n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Numpad1: 0, Numpad2: 1, Numpad3: 2, Numpad4: 3 }[e.code]; if (n !== undefined) pickChoice(n); }
});
window.addEventListener('keyup', e => input.keys.delete(e.code));
window.addEventListener('blur', () => { input.keys.clear(); input.joy = null; });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
const cpos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
cv.addEventListener('pointerdown', e => { if (state !== 'play') return; const q = cpos(e); input.joy = { id: e.pointerId, ox: q.x, oy: q.y, x: q.x, y: q.y }; try { cv.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } e.preventDefault(); });
cv.addEventListener('pointermove', e => { const j = input.joy; if (!j || j.id !== e.pointerId) return; const q = cpos(e); j.x = q.x; j.y = q.y; });
const joyEnd = e => { if (input.joy && input.joy.id === e.pointerId) input.joy = null; };
cv.addEventListener('pointerup', joyEnd); cv.addEventListener('pointercancel', joyEnd);
cv.addEventListener('contextmenu', e => e.preventDefault());

/* ───────── gamepad ─────────
   Standard mapping: left stick or d-pad moves; in menus they move focus between buttons.
   A selects, B goes back, Start pauses, LB/RB switch tabs in the collection, right stick scrolls lists. */
const PAD = { on: false, prev: [], idx: 0, dirKey: '', dirT: 0, lockT: 0, fresh: false, dead: 0.22 };
function pads() { try { return navigator.getGamepads ? [...navigator.getGamepads()].filter(p => p && p.connected !== false) : []; } catch (e) { return []; } }
function padRumble(ms, mag) {
  if (!PAD.on) return;
  try { const v = pads()[0] && pads()[0].vibrationActuator; if (v && v.playEffect) v.playEffect('dual-rumble', { duration: ms, strongMagnitude: mag, weakMagnitude: mag * 0.6 }).catch(() => {}); } catch (e) { /* no rumble */ }
}
function setPadMode(on) { if (PAD.on === on) return; PAD.on = on; document.body.classList.toggle('pad', on); }
function curOverlay() { for (const o of OV) { const e = $(o); if (!e.hidden) return e; } return null; }
function focusables(ov) { return ov ? [...ov.querySelectorAll('button')].filter(b => !b.disabled && b.offsetParent !== null) : []; }
function padFocus(el) { if (!el) return; el.focus(); PAD.idx = focusables(curOverlay()).indexOf(el); }
const PAD_DEFAULT = { ovTitle: '#btnPlay', ovPrep: '#btnStart', ovShop: '#shopList button', ovBook: '#tabW', ovAch: '#btnAchBack', ovHome: '#homeList button', ovAdopt: '#btnAdoptOk', ovLevel: '#choices .choice', ovBox: '#btnBox', ovPause: '#btnResume', ovEnd: '#btnAgain' };
const PAD_BACK = { ovLogin: '#btnLoginBack', ovDevGate: '#btnDevGateBack', ovDev: '#btnDevBack', ovHome: '#btnHomeBack', ovAdopt: '#btnAdoptNo', ovPrep: '#btnPrepBack', ovShop: '#btnShopBack', ovBook: '#btnBookBack', ovAch: '#btnAchBack', ovPause: '#btnResume', ovBox: '#btnBox', ovEnd: '#btnHome' };
const PAD_START = { ovTitle: '#btnPlay', ovPrep: '#btnStart', ovPause: '#btnResume', ovBox: '#btnBox', ovEnd: '#btnAgain' };
function padDefault() {
  const ov = curOverlay(), list = focusables(ov); if (!list.length) return;
  const want = PAD_DEFAULT[ov.id] && [...ov.querySelectorAll(PAD_DEFAULT[ov.id])].find(b => list.includes(b));
  padFocus(want || list[0]);
}
function padPress(sel) { const b = sel && $(sel); if (b && !b.disabled && b.offsetParent !== null) b.click(); }
function padScroller(ov) { return [...ov.querySelectorAll('.scroll')].find(s => s.offsetParent !== null && s.scrollHeight > s.clientHeight + 2) || ov; }
/* move focus to the nearest button in the pressed direction; scroll the list when there is none */
function padNavigate(dx, dy) {
  const ov = curOverlay(), list = focusables(ov); if (!list.length) return;
  const cur = list.includes(document.activeElement) ? document.activeElement : null;
  if (!cur) { padDefault(); return; }
  const r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let best = null, bs = Infinity;
  for (const b of list) {
    if (b === cur) continue;
    const q = b.getBoundingClientRect(), x = q.left + q.width / 2 - cx, y = q.top + q.height / 2 - cy;
    const along = x * dx + y * dy, across = Math.abs(x * dy - y * dx);
    if (along <= 4) continue;
    const sc = along + across * 2.2; if (sc < bs) { bs = sc; best = b; }
  }
  if (best) { padFocus(best); sfx('pick'); }
  else if (dy) padScroller(ov).scrollBy({ top: dy * 140, behavior: REDUCED ? 'auto' : 'smooth' });
}
function pollPad(now) {
  const gp = pads()[0];
  if (!gp) { input.pad = null; PAD.prev = []; return; }
  const btn = i => { const b = gp.buttons[i]; return !!(b && (b.pressed || b.value > 0.5)); };
  const down = i => btn(i) && !PAD.prev[i];
  let ax = gp.axes[0] || 0, ay = gp.axes[1] || 0; const m = Math.hypot(ax, ay);
  if (m < PAD.dead) ax = ay = 0; else { const k = Math.min(1, (m - PAD.dead) / (1 - PAD.dead)) / m; ax *= k; ay *= k; }
  const hx = (btn(15) ? 1 : 0) - (btn(14) ? 1 : 0), hy = (btn(13) ? 1 : 0) - (btn(12) ? 1 : 0);
  const active = ax || ay || hx || hy || gp.buttons.some((b, i) => i < 16 && b && b.pressed);
  if (active && !PAD.on) { setPadMode(true); if (state !== 'play' && !curOverlay().contains(document.activeElement)) padDefault(); }
  if (state === 'play') {
    input.pad = (hx || hy) ? { x: hx / Math.hypot(hx, hy), y: hy / Math.hypot(hx, hy) } : (ax || ay) ? { x: ax, y: ay } : null;
    if (down(9) || down(8)) pause();
    else if (down(0) || down(2) || down(5) || down(7)) useSkill();
  } else {
    input.pad = null;
    const ov = curOverlay();
    if (ov && PAD.on) {
      if (!ov.contains(document.activeElement)) { const l = focusables(ov); if (l.length) padFocus(l[clamp(PAD.idx, 0, l.length - 1)]); }
      const dir = (hx || hy) ? [hx && !hy ? hx : 0, hy] : (Math.abs(ax) > 0.5 || Math.abs(ay) > 0.5) ? (Math.abs(ax) > Math.abs(ay) ? [Math.sign(ax), 0] : [0, Math.sign(ay)]) : null;
      const key = dir ? dir.join(',') : '';
      if (PAD.fresh) { PAD.fresh = false; PAD.dirKey = key; PAD.dirT = now + 380; }
      else if (key !== PAD.dirKey) { PAD.dirKey = key; PAD.dirT = now + 380; if (dir) padNavigate(dir[0], dir[1]); }
      else if (dir && now >= PAD.dirT) { PAD.dirT = now + 110; padNavigate(dir[0], dir[1]); }
      const ry = gp.axes[3] || 0; if (Math.abs(ry) > 0.25) padScroller(ov).scrollBy({ top: ry * 16 });
      if (now >= PAD.lockT) {
        if (down(0)) { const a = document.activeElement; if (a && a.tagName === 'BUTTON' && ov.contains(a)) a.click(); else padDefault(); }
        else if (down(1)) { if (ov.id === 'ovLevel') { if (banMode) padPress('#btnBanish'); } else padPress(PAD_BACK[ov.id]); }
        else if (down(9)) padPress(PAD_START[ov.id]);
        else if (ov.id === 'ovHome' && (down(4) || down(5))) { const t = ['c', 'f', 'a']; homeTab = t[(t.indexOf(homeTab) + (down(5) ? 1 : 2)) % 3]; refreshHome(); padFocus($('#tabH' + homeTab.toUpperCase())); }
        else if (ov.id === 'ovBook' && (down(4) || down(5))) { const t = ['w', 'p', 'e']; bookTab = t[(t.indexOf(bookTab) + (down(5) ? 1 : 2)) % 3]; refreshBook(); padFocus($('#tab' + bookTab.toUpperCase())); }
      }
    }
  }
  PAD.prev = gp.buttons.map(b => !!(b && (b.pressed || b.value > 0.5)));
}
window.addEventListener('gamepadconnected', () => toast('게임패드 연결됨 · 스틱 이동, A 선택, B 뒤로, Start 일시정지'));
window.addEventListener('gamepaddisconnected', () => { input.pad = null; if (PAD.on && state === 'play') pause(); toast('게임패드 연결이 끊겼습니다'); });
window.addEventListener('pointerdown', () => setPadMode(false), true);
window.addEventListener('keydown', () => setPadMode(false), true);

const on = (id, fn) => $(id).addEventListener('click', fn);
$('#btnSkill').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); initAudio(); useSkill(); });
on('#btnPlay', () => { state = 'menu'; prepCat = save.cat; refreshPrep(); show('#ovPrep'); });
on('#btnAcct', () => {
  if (!acct.token) { $('#loginErr').hidden = true; $('#loginPw').value = ''; show('#ovLogin'); setTimeout(() => $('#loginId').focus(), 50); return; }
  if (performance.now() < logoutArm) { logoutArm = 0; doLogout(); return; }
  logoutArm = performance.now() + 3000; acctLabel(); setTimeout(acctLabel, 3100);
});
on('#btnLoginBack', toTitle);
document.querySelector('#ovTitle h1').addEventListener('click', () => {
  const now = performance.now(); DEV.taps = DEV.taps.filter(t => now - t < 2500); DEV.taps.push(now);
  if (DEV.taps.length >= 5) { DEV.taps = []; devGate(); }
});
on('#btnDev', devGate); on('#btnDevGateBack', toTitle); on('#btnDevBack', toTitle);
$('#devGateForm').addEventListener('submit', async e => {
  e.preventDefault(); const err = $('#devGateErr');
  let ok = false; try { ok = await sha256($('#devPass').value) === DEV_HASH; } catch (x) { err.textContent = '이 브라우저에서는 확인할 수 없어요 (https 주소에서 열어 주세요).'; err.hidden = false; return; }
  if (!ok) { err.textContent = '암호가 달라요.'; err.hidden = false; return; }
  DEV.on = true; try { localStorage.setItem(DEV_KEY, DEV_HASH); } catch (x) { /* this session only */ } refreshTitle(); openDev();
});
for (const [id, key] of [['#devCat', 'cat'], ['#devSkill', 'skill'], ['#devBoss', 'boss']]) $(id).addEventListener('change', e => { DEV.cfg[key] = e.target.value; devSaveCfg(); });
$('#devPhase').addEventListener('change', e => { DEV.cfg.phase = +e.target.value; devSaveCfg(); });
for (const [id, key] of [['#devGod', 'god'], ['#devMobs', 'mobs'], ['#devShop', 'shop']]) on(id, () => { DEV.cfg[key] = !DEV.cfg[key]; devSaveCfg(); refreshDev(); });
on('#devAll8', () => { for (const id in DEV.cfg.w) if (DEV.cfg.w[id] > 0) DEV.cfg.w[id] = WMAX; devSaveCfg(); refreshDev(); });
on('#devClear', () => { DEV.cfg.w = {}; DEV.cfg.e = {}; DEV.cfg.p = {}; devSaveCfg(); refreshDev(); });
on('#btnDevGo', () => { if (!devCount('w')) { toast('무기를 하나 이상 골라 주세요.'); return; } startDev(); });
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault(); const go = $('#btnLoginGo'), err = $('#loginErr'); if (go.disabled) return;
  const id = $('#loginId').value.trim(), pw = $('#loginPw').value;
  if (!/^[0-9A-Za-z가-힣_]{2,16}$/.test(id)) { err.textContent = '아이디는 한글·영문·숫자·_ 로 2~16자예요.'; err.hidden = false; return; }
  if (pw.length < 4) { err.textContent = '비밀번호는 4자 이상이에요.'; err.hidden = false; return; }
  go.disabled = true; go.textContent = '확인 중…'; err.hidden = true;
  try { const j = await doLogin(id, pw); $('#loginPw').value = ''; toTitle(); toast(j.created ? `새 계정 '${j.id}'을 만들었어요. 지금 기록이 저장돼요.` : `'${j.id}' 계정의 기록을 불러왔어요.`); }
  catch (x) { err.textContent = x.message; err.hidden = false; }
  finally { go.disabled = false; go.textContent = '들어가기'; }
});
on('#btnPrepBack', toTitle); on('#btnStart', startRun);
on('#btnEndless', () => { save.endless = !save.endless; writeSave(); refreshPrep(); });
on('#btnShop', () => { state = 'menu'; refreshShop(); show('#ovShop'); }); on('#btnShopBack', toTitle); on('#btnRefund', refundShop);
on('#btnBook', () => { state = 'menu'; refreshBook(); show('#ovBook'); }); on('#btnBookBack', toTitle);
on('#btnHideout', () => { homeSel = null; openHome(); }); on('#btnHomeBack', toTitle);
for (const k of ['c', 'f', 'a']) on('#tabH' + k.toUpperCase(), () => { homeTab = k; refreshHome(); });
on('#btnAdoptOk', confirmAdopt); on('#roomIn', () => { homeRoom = 'in'; refreshHome(); }); on('#roomOut', () => { homeRoom = 'out'; refreshHome(); }); on('#btnAdoptNo', () => { adoptCat = null; openHome(); });
$('#roomCv').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(), uid = GN.room.hit(roomCats(), save.home.furn, (e.clientX - r.left) / r.width * GN.room.VW, (e.clientY - r.top) / r.height * GN.room.VH, homeRoom);
  if (uid == null) return; homeSel = uid; homeTab = 'c'; GN.room.pop(uid); refreshHome(); const row = document.querySelector(`#homeList [data-uid="${uid}"]`); if (row) row.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' }); });
for (const k of ['w', 'p', 'e']) on('#tab' + k.toUpperCase(), () => { bookTab = k; refreshBook(); });
on('#btnAch', () => { state = 'menu'; refreshAch(); show('#ovAch'); }); on('#btnAchBack', toTitle);
on('#btnUnlockAll', () => { save.unlockAll = !save.unlockAll; writeSave(); refreshAch(); });
on('#btnMute', toggleMute); on('#btnMute2', toggleMute);
on('#btnPause', pause); on('#btnResume', resume);
on('#btnQuit', () => { G.won = false; G.quit = true; finish(); });
on('#btnReroll', () => { if (G.rerolls <= 0 || state !== 'levelup') return; G.rerolls--; curChoices = rollChoices(); banMode = false; openLevelUp(true); });
on('#btnSkip', () => { if (G.skips <= 0 || state !== 'levelup') return; G.skips--; banMode = false; nextLevelOrResume(); });
on('#btnBanish', () => { if (state !== 'levelup') return; if (!banMode && G.banishes <= 0) return; banMode = !banMode; openLevelUp(true); });
on('#btnBox', () => { if (state !== 'box') return; if (G.pendingLv > 0) openLevelUp(); else resume(); });
on('#btnAgain', startRun); on('#btnHome', toTitle);

/* ───────── loop ───────── */
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, Math.max(0, (now - last) / 1000)); last = now;
  pollPad(now);
  if (state === 'play' && G) { if (G.hitstop > 0) G.hitstop -= dt; else update(dt); if (G && state !== 'over') updateHud(); }
  render(now);
  drawHomeCanvases(now);
  requestAnimationFrame(frame);
}
function start() {
  loadSave(); resize(); toTitle(); initAcct();
  if (location.hash === '#dev') devGate();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { for (const k in icoCache) delete icoCache[k]; }).catch(() => {});
  requestAnimationFrame(frame);
}
// test hook: lets an automated check step the simulation without waiting in real time
window.__gilnyang = { state: () => state, run: () => G, save, step: dt => { if (state === 'play' && G) update(dt); }, pick: pickChoice, choices: () => curChoices, move: (x, y) => { input.auto = (x || y) ? { x, y } : null; }, start: startRun, spawnRescue: o => spawnRescue(o), scare: () => scareOne(), skill: () => useSkill(), openHome: () => openHome(), settle: () => settleHome(), recalc: () => recalc(), write: () => writeSave() };
if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(start); else start();
})();

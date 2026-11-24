/* 길냥이 서바이벌 account API (Cloudflare Pages Function, D1 database bound as DB)

   POST /api/login  {id, pw}   a new id creates the account, a known id checks the password
   GET  /api/save              the account's saved progress (Authorization: Bearer <token>)
   PUT  /api/save   {data}     replace the account's saved progress
   POST /api/logout            forget this device's token
   GET  /api/ping              is the server ready

   There is no e-mail and no password reset: a forgotten password means the account is gone.
   Passwords are stored only as salted PBKDF2-SHA256 hashes. */

const ITER = 100000;                       // the most PBKDF2 iterations Workers allow
const TOKEN_DAYS = 180;
const MAX_SAVE = 256 * 1024;               // bytes of save JSON
const MAX_FAILS = 8, LOCK_MS = 5 * 60 * 1000;
const ID_RE = /^[0-9a-z가-힣_]{2,16}$/;

let ready = null;
function schema(db) {
  if (!ready) ready = db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL, created INTEGER NOT NULL, fails INTEGER NOT NULL DEFAULT 0, lock_until INTEGER NOT NULL DEFAULT 0)'),
    db.prepare('CREATE TABLE IF NOT EXISTS saves (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS tokens (token TEXT PRIMARY KEY, id TEXT NOT NULL, expires INTEGER NOT NULL)'),
  ]).catch(e => { ready = null; throw e; });
  return ready;
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (status, msg) => json({ error: msg }, status);
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const unhex = s => new Uint8Array(s.match(/../g).map(h => parseInt(h, 16)));

async function hashPw(pw, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, key, 256));
}
function same(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }

async function readJson(req) { try { return await req.json(); } catch (e) { return null; } }

async function userOf(req, db) {
  const m = /^Bearer ([0-9a-f]{64})$/.exec(req.headers.get('authorization') || '');
  if (!m) return null;
  const row = await db.prepare('SELECT id, expires FROM tokens WHERE token = ?').bind(m[1]).first();
  if (!row || row.expires < Date.now()) return null;
  return { id: row.id, token: m[1] };
}

async function login(req, db) {
  const b = await readJson(req);
  const id = String(b?.id ?? '').trim().toLowerCase(), pw = String(b?.pw ?? '');
  if (!ID_RE.test(id)) return fail(400, '아이디는 한글·영문·숫자·_ 로 2~16자예요.');
  if (pw.length < 4 || pw.length > 64) return fail(400, '비밀번호는 4~64자예요.');
  const now = Date.now();
  let u = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first(), created = false;
  if (!u) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const res = await db.prepare('INSERT OR IGNORE INTO users (id, salt, hash, created) VALUES (?, ?, ?, ?)').bind(id, hex(salt), await hashPw(pw, salt), now).run();
    if (!res.meta.changes) return fail(409, '방금 다른 사람이 같은 아이디를 만들었어요. 다시 시도해 주세요.');
    created = true;
  } else {
    if (u.lock_until > now) return fail(429, `비밀번호를 여러 번 틀렸어요. ${Math.ceil((u.lock_until - now) / 60000)}분 뒤에 다시 시도해 주세요.`);
    if (!same(await hashPw(pw, unhex(u.salt)), u.hash)) {
      const fails = u.fails + 1;
      await db.prepare('UPDATE users SET fails = ?, lock_until = ? WHERE id = ?').bind(fails >= MAX_FAILS ? 0 : fails, fails >= MAX_FAILS ? now + LOCK_MS : 0, id).run();
      return fail(401, '이미 있는 아이디인데 비밀번호가 달라요.');
    }
    if (u.fails) await db.prepare('UPDATE users SET fails = 0 WHERE id = ?').bind(id).run();
  }
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  await db.batch([
    db.prepare('DELETE FROM tokens WHERE expires < ?').bind(now),
    db.prepare('INSERT INTO tokens (token, id, expires) VALUES (?, ?, ?)').bind(token, id, now + TOKEN_DAYS * 864e5),
  ]);
  const s = created ? null : await db.prepare('SELECT data, updated FROM saves WHERE id = ?').bind(id).first();
  return json({ id, token, created, save: s ? { data: JSON.parse(s.data), updated: s.updated } : null });
}

export async function onRequest({ request: req, env, params }) {
  const route = (params.route || []).join('/'), method = req.method;
  if (!env.DB) return fail(503, '서버 저장소(D1)가 아직 연결되지 않았어요.');
  const db = env.DB;
  try {
    await schema(db);
    if (route === 'ping') return json({ ok: true });
    if (route === 'login' && method === 'POST') return await login(req, db);
    const u = await userOf(req, db);
    if (!u) return fail(401, '다시 로그인해 주세요.');
    if (route === 'logout' && method === 'POST') { await db.prepare('DELETE FROM tokens WHERE token = ?').bind(u.token).run(); return json({ ok: true }); }
    if (route === 'save' && method === 'GET') {
      const s = await db.prepare('SELECT data, updated FROM saves WHERE id = ?').bind(u.id).first();
      return json({ id: u.id, save: s ? { data: JSON.parse(s.data), updated: s.updated } : null });
    }
    if (route === 'save' && method === 'PUT') {
      const text = await req.text();
      if (text.length > MAX_SAVE) return fail(413, '저장 데이터가 너무 커요.');
      let b; try { b = JSON.parse(text); } catch (e) { return fail(400, '잘못된 저장 데이터예요.'); }
      if (!b || typeof b.data !== 'object' || Array.isArray(b.data)) return fail(400, '잘못된 저장 데이터예요.');
      const now = Date.now();
      await db.prepare('INSERT INTO saves (id, data, updated) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated = excluded.updated').bind(u.id, JSON.stringify(b.data), now).run();
      return json({ updated: now });
    }
    return fail(404, '없는 주소예요.');
  } catch (e) {
    return fail(500, '서버 오류가 났어요. 잠시 뒤에 다시 시도해 주세요.');
  }
}

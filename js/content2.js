/* 길냥이 서바이벌 — second content pack: twice the cats, maps, weapons, passives, upgrades, skills and hideout.
   Loaded after data.js and art2.js, before game.js. New weapons reuse an existing weapon's behaviour through `kind`. */
(() => {
'use strict';
const GN = window.GN;

/* ───────── 12 more cats ───────── */
const L = GN.art2.LOOK2;
Object.assign(L, {
  persian: { fur: '#f7efe6', belly: '#ffffff', muzzle: '#ffffff', ear: '#f7efe6', eye: '#e8a33d', fluff: true, fat: 1.15 },
  scottish: { fur: '#c9ccd6', belly: '#f3f5fa', muzzle: '#f3f5fa', ear: '#c9ccd6', stripes: '#9aa0b0', eye: '#f4c542', fold: true },
  bengal: { fur: '#e7b66a', belly: '#fff1d6', muzzle: '#fff1d6', ear: '#e7b66a', spots: '#7a4a24', eye: '#8ccf5a' },
  ragdoll: { fur: '#f6eee4', ear: '#8a6f5c', points: '#8a6f5c', socks: '#ffffff', eye: '#6fb8ff', fluff: true },
  mainecoon: { fur: '#a8774e', belly: '#f1e3cf', muzzle: '#f1e3cf', ear: '#a8774e', stripes: '#6b4a2e', eye: '#d9a13a', fluff: true, fat: 1.12 },
  abyssinian: { fur: '#c9854e', belly: '#f0c89a', muzzle: '#f0c89a', ear: '#c9854e', stripes: '#a8693a', eye: '#9ed36a' },
  munchkin: { fur: '#e9d3b5', belly: '#ffffff', muzzle: '#ffffff', socks: '#ffffff', ear: '#e9d3b5', eye: '#7cc4ff', short: true },
  tortie: { fur: '#3f3a40', ear: '#3f3a40', spots: '#e08a3c', eye: '#f4c542', dark: true },
  silver: { fur: '#cfd3dc', belly: '#f6f7fb', muzzle: '#f6f7fb', ear: '#cfd3dc', stripes: '#6f7586', eye: '#8ccf5a' },
  cream: { fur: '#f5dfb8', belly: '#ffffff', muzzle: '#ffffff', socks: '#ffffff', ear: '#f5dfb8', stripes: '#e2c28f', eye: '#e8a33d' },
  norwegian: { fur: '#8f7a66', belly: '#ffffff', muzzle: '#ffffff', ear: '#8f7a66', stripes: '#5e4c3e', eye: '#9ed36a', fluff: true },
  bombay: { fur: '#2f2c36', ear: '#2f2c36', eye: '#e88f2a', dark: true },
});
const CAT = (name, desc, weapon, cost, mod, req) => Object.assign({ name, desc, weapon, cost, mod }, req ? { req } : {});
Object.assign(GN.CATS, {
  persian: CAT('페르시안', '최대 체력 +30, 체력 재생 +0.3', 'hotpack', 700, { hp: 30, regen: 0.3 }, 'adopt3'),
  scottish: CAT('스코티시폴드', '방어 +1, 범위 +5%', 'roar', 600, { armor: 1, area: 0.05 }),
  bengal: CAT('벵갈', '이동속도 +10%, 공격력 +5%', 'slipper', 800, { move: 0.1, might: 0.05 }),
  ragdoll: CAT('랙돌', '체력 재생 +0.4, 범위 +10%', 'bubble', 800, { regen: 0.4, area: 0.1 }),
  mainecoon: CAT('메인쿤', '최대 체력 +40, 공격력 +10%, 이동속도 -5%', 'newspaper', 900, { hp: 40, might: 0.1, move: -0.05 }, 'kills10000'),
  abyssinian: CAT('아비시니안', '투사체 속도 +20%, 쿨다운 -5%', 'fork', 700, { pspeed: 0.2, cd: -0.05 }),
  munchkin: CAT('먼치킨', '이동속도 +20%, 최대 체력 -20', 'rubber', 900, { move: 0.2, hp: -20 }, 'lv60'),
  tortie: CAT('카오스냥', '행운 +20%, 동전 +20%', 'flowerpot', 700, { luck: 0.2, greed: 0.2 }),
  silver: CAT('실버태비', '쿨다운 -8%', 'camera', 800, { cd: -0.08 }),
  cream: CAT('크림이', '경험치 +10%', 'marbles', 600, { growth: 0.1 }),
  norwegian: CAT('노르웨이숲', '방어 +1, 최대 체력 +30', 'catnipcloud', 1000, { armor: 1, hp: 30 }, 'toSnow'),
  bombay: CAT('봄베이', '공격력 +15%, 치명타 +5%', 'flashlight', 1000, { might: 0.15, crit: 0.05 }, 'clearSchool'),
});
for (const id in L) if (GN.CATS[id]) GN.CATS[id].look = L[id];

Object.assign(GN.ALLY, {
  persian: { kind: 'heal', dmg: 2, cd: 3, desc: '주인공의 체력을 자주 조금씩 회복한다' },
  scottish: { kind: 'chill', dmg: 3, cd: 0.5, desc: '곁에 온 적을 느리게 만든다' },
  bengal: { kind: 'pounce', dmg: 11, cd: 0.7, desc: '빠르게 달려들어 세게 문다' },
  ragdoll: { kind: 'magnet', dmg: 0, cd: 2.5, desc: '사료를 끌어오고 동전을 줍는다' },
  mainecoon: { kind: 'tank', dmg: 7, cd: 0.4, desc: '큰 몸으로 적을 밀어낸다' },
  abyssinian: { kind: 'shot', dmg: 9, cd: 0.9, pierce: 2, ico: 'fork', desc: '적을 뚫는 포크를 던진다' },
  munchkin: { kind: 'pounce', dmg: 5, cd: 0.3, desc: '짧은 다리로 쉴 새 없이 달려든다' },
  tortie: { kind: 'zap', dmg: 13, cd: 1.8, desc: '가까운 적에게 번개를 떨어뜨린다' },
  silver: { kind: 'beam', dmg: 7, cd: 0.35, desc: '가까운 적을 빛으로 지진다' },
  cream: { kind: 'swipe', dmg: 10, cd: 1.0, desc: '가까운 적을 할퀸다' },
  norwegian: { kind: 'chill', dmg: 4, cd: 0.45, desc: '찬 바람으로 적을 느리게 만든다' },
  bombay: { kind: 'shot', dmg: 12, cd: 1.2, ico: 'hairball', desc: '가까운 적에게 헤어볼을 세게 뱉는다' },
});

/* ───────── 16 more weapons (each borrows the behaviour named by kind) ───────── */
const WPN = (name, kind, desc, base, ups, evo, extra) => Object.assign({ name, role: 'atk', kind, desc, base, ups, evo }, extra || {});
Object.assign(GN.WEAPONS, {
  fork: WPN('포크 표창', 'hairball', '빠르게 날아가 적을 뚫는 포크', { dmg: 7, cd: 0.7, amount: 1, pierce: 2 },
    [{ amount: 1 }, { dmg: 3 }, { pierce: 1 }, { cd: -0.1 }, { amount: 1 }, { dmg: 4 }, { amount: 1, pierce: 1 }],
    { name: '은빛 포크 소나기', needs: 'fang', desc: '포크를 쉬지 않고 쏟아낸다', set: { cd: 0.12, amount: 2, dmg: 18, pierce: 5, rapid: 1 } }),
  slipper: WPN('슬리퍼 부메랑', 'fishbone', '크게 휘어 돌아오는 슬리퍼', { dmg: 18, cd: 2.8, amount: 1 },
    [{ dmg: 6 }, { area: 0.2 }, { amount: 1 }, { dmg: 8 }, { speed: 0.2 }, { amount: 1 }, { dmg: 10, area: 0.2 }],
    { name: '무쇠 슬리퍼', needs: 'heavyPaw', desc: '거대한 슬리퍼 셋이 휘돈다', set: { dmg: 70, area: 2.4, cd: 1.8, amount: 3 } }),
  marbles: WPN('회전 구슬', 'yarn', '알록달록한 구슬이 주위를 돈다', { dmg: 5, cd: 0, amount: 3 },
    [{ amount: 1 }, { dmg: 3 }, { speed: 0.3 }, { amount: 1 }, { dmg: 4, area: 0.15 }, { amount: 1 }, { dmg: 5 }],
    { name: '구슬 은하', needs: 'dashShoes', desc: '구슬 열 개가 넓고 빠르게 돈다', set: { dmg: 24, amount: 10, area: 1.8, speed: 1.9 } }),
  hotpack: WPN('핫팩 열기 오라', 'purr', '가까이 온 적을 뜨겁게 데운다', { dmg: 3, cd: 0.4 },
    [{ area: 0.15 }, { dmg: 2 }, { area: 0.2 }, { dmg: 2 }, { cd: -0.1 }, { area: 0.2, dmg: 2 }, { dmg: 3 }],
    { name: '난로 오라', needs: 'warmFur', desc: '범위가 넓어지고 체력을 회복한다', set: { dmg: 12, area: 2.3, cd: 0.3, heal: 0.4 } }, { aura: '#ff9f43' }),
  catnipcloud: WPN('캣닢 구름 장판', 'spill', '적을 어지럽히는 초록 구름을 깐다', { dmg: 5, cd: 3.0, amount: 1 },
    [{ amount: 1 }, { dmg: 3, dur: 0.2 }, { area: 0.25 }, { amount: 1 }, { dmg: 4 }, { dur: 0.3 }, { amount: 1, area: 0.2 }],
    { name: '캣닢 폭풍', needs: 'nightOwl', desc: '넓은 구름이 적을 느리게 만든다', set: { dmg: 18, area: 2.1, dur: 2.2, slow: 1, amount: 4 } }, { zcol: '#bdeeb0' }),
  flowerpot: WPN('화분 폭격', 'tuna', '창가에서 화분이 떨어진다', { dmg: 26, cd: 3.0, amount: 1 },
    [{ amount: 1 }, { dmg: 10 }, { area: 0.25 }, { amount: 1 }, { cd: -0.15 }, { dmg: 12 }, { amount: 1 }],
    { name: '화분 폭격대', needs: 'coinLuck', desc: '화분 여섯 개가 터지고 동전이 나온다', set: { dmg: 75, area: 2.0, coin: 0.12, amount: 6 } }, { boomCol: '#e08a5a' }),
  rubber: WPN('튕기는 고무줄', 'ball', '화면 끝에서 튕기는 고무줄', { dmg: 8, cd: 2.4, amount: 2 },
    [{ dmg: 3, speed: 0.2 }, { amount: 1 }, { dur: 0.3 }, { dmg: 4 }, { amount: 1 }, { dmg: 5, area: 0.2 }, { amount: 2 }],
    { name: '끝없는 고무줄', needs: 'awl', desc: '고무줄 여덟 개가 오래 튕긴다', set: { dmg: 28, area: 1.6, dur: 2.2, amount: 8 } }),
  bubble: WPN('비눗방울 유도탄', 'sardine', '적을 따라가 터지는 비눗방울', { dmg: 12, cd: 2.0, amount: 2 },
    [{ dmg: 5 }, { amount: 1 }, { area: 0.25 }, { dmg: 6 }, { amount: 1 }, { cd: -0.15 }, { amount: 1, dmg: 5 }],
    { name: '거품 폭풍', needs: 'windBell', desc: '커다란 거품이 연달아 터진다', set: { dmg: 46, area: 2.0, cd: 1.2, amount: 6 } }, { boomCol: '#9fd8ff' }),
  newspaper: WPN('신문지 휘두르기', 'tailwhip', '둘둘 만 신문지로 후려친다', { dmg: 15, cd: 1.6, amount: 1 },
    [{ dmg: 6 }, { amount: 1 }, { area: 0.2 }, { dmg: 6 }, { cd: -0.15 }, { area: 0.15, dmg: 6 }, { amount: 1 }],
    { name: '신문 뭉치 대포', needs: 'bossBadge', desc: '사방을 후려치고 가끔 두 배로 아프다', set: { dmg: 50, area: 1.9, cd: 1.0, crit: 0.35, amount: 4 } }),
  roar: WPN('으르렁 충격파', 'meow', '낮게 울려 주변 적을 밀어낸다', { dmg: 10, cd: 3.6 },
    [{ area: 0.2 }, { dmg: 7 }, { cd: -0.15 }, { area: 0.2 }, { dmg: 9 }, { cd: -0.15 }, { dmg: 12, area: 0.2 }],
    { name: '맹수의 포효', needs: 'thornScarf', desc: '아주 넓게 울려 적을 오래 굳힌다', set: { dmg: 55, area: 2.5, cd: 2.2, stun: 1.5 } }, { ringCol: '#ff8a7a' }),
  camera: WPN('카메라 플래시', 'static', '번쩍이는 플래시가 적을 놀래킨다', { dmg: 14, cd: 2.6, amount: 2 },
    [{ amount: 1 }, { dmg: 7 }, { area: 0.3 }, { amount: 1 }, { dmg: 9 }, { cd: -0.15 }, { amount: 2 }],
    { name: '연속 촬영', needs: 'shieldFur', desc: '플래시가 주변 적에게 번져 나간다', set: { dmg: 46, area: 1.7, chain: 4, amount: 7 } }),
  flashlight: WPN('손전등 광선', 'laser', '빙빙 도는 손전등 빛이 적을 태운다', { dmg: 6, cd: 0.3, amount: 1 },
    [{ dmg: 2 }, { area: 0.25 }, { dmg: 3 }, { amount: 1 }, { speed: 0.3 }, { area: 0.2, dmg: 2 }, { amount: 1 }],
    { name: '서치라이트', needs: 'napPillow', desc: '세 줄기 빛이 길게 뻗는다', set: { dmg: 20, amount: 3, area: 2.3 } }, { beamCol: '#ffd84d' }),
  mousetoy: WPN('태엽 쥐 장난감', 'kitten', '태엽 쥐가 적에게 달려가 부딪힌다', { dmg: 6, cd: 0, amount: 2 },
    [{ dmg: 3 }, { amount: 1 }, { speed: 0.25 }, { dmg: 4 }, { amount: 1 }, { dmg: 5, area: 0.2 }, { amount: 1 }],
    { name: '태엽 쥐 대행진', needs: 'rescueVest', desc: '여덟 마리가 몰려다닌다', set: { dmg: 22, amount: 8, speed: 1.8 } }),
  cans: WPN('깡통 차기', 'bowl', '위로 찬 깡통이 떨어지며 뚫는다', { dmg: 16, cd: 2.4, amount: 2, pierce: 2 },
    [{ amount: 1 }, { dmg: 8 }, { pierce: 2 }, { amount: 1 }, { dmg: 10, area: 0.15 }, { cd: -0.15 }, { amount: 1 }],
    { name: '깡통 폭포', needs: 'leaderScarf', desc: '깡통이 쏟아져 모든 적을 뚫는다', set: { dmg: 58, pierce: 999, area: 1.6, amount: 7 } }),
  bubblewrap: WPN('뽁뽁이 덫', 'boxtrap', '밟으면 터지는 뽁뽁이를 깐다', { dmg: 22, cd: 2.0, amount: 2 },
    [{ dmg: 8 }, { amount: 1 }, { area: 0.2 }, { dmg: 10 }, { cd: -0.15 }, { amount: 1, area: 0.2 }, { dmg: 12 }],
    { name: '뽁뽁이 지뢰밭', needs: 'stretch', desc: '크게 터지고 적을 굳힌다', set: { dmg: 70, area: 1.9, stun: 1.2, amount: 5 } }, { boomCol: '#bfe6ff' }),
  shadowclaw: WPN('그림자 발톱', 'claw', '양옆을 동시에 할퀴는 그림자 발톱', { dmg: 13, cd: 1.3, amount: 2 },
    [{ dmg: 5 }, { area: 0.2 }, { amount: 1 }, { dmg: 6 }, { cd: -0.12 }, { dmg: 8, area: 0.1 }, { amount: 1 }],
    { name: '그림자 난무', needs: 'hunter', desc: '사방을 쉴 새 없이 할퀸다', set: { full: 1, cd: 0.45, dmg: 40, area: 2.1 } }),
});

/* ───────── 16 more passives ───────── */
const PAS = (name, role, desc, max = 5) => ({ name, role, desc, max });
Object.assign(GN.PASSIVES, {
  fang: PAS('날카로운 송곳니', 'buf', '치명타 확률 +5%'),
  hunter: PAS('사냥꾼의 본능', 'buf', '치명타 피해 +25%'),
  warmFur: PAS('따뜻한 털', 'def', '적을 처치하면 체력 0.3 회복'),
  heavyPaw: PAS('묵직한 앞발', 'buf', '적을 밀어내는 힘 +25%'),
  windBell: PAS('바람 방울', 'def', '공격을 피할 확률 +4%'),
  thornScarf: PAS('가시 목도리', 'def', '맞으면 주변 적에게 가시 피해'),
  bossBadge: PAS('대왕 사냥 배지', 'buf', '보스·골목대장에게 주는 피해 +15%'),
  rescueVest: PAS('구조대 조끼', 'util', '길고양이를 20% 더 빨리 구한다'),
  leaderScarf: PAS('대장 스카프', 'buf', '무리 고양이의 공격력 +15%'),
  stretch: PAS('기지개 체조', 'util', '기술 쿨다운 -8%'),
  coinLuck: PAS('행운 동전 지갑', 'util', '적이 동전을 떨어뜨릴 확률 +30%'),
  shieldFur: PAS('털뭉치 방패', 'def', '12초마다 피해 한 번을 막는다 (Lv마다 2초 빨라짐)', 3),
  nightOwl: PAS('야행성', 'risk', '체력이 절반 이하일 때 공격력 +20%'),
  napPillow: PAS('낮잠 베개', 'def', '멈춰 있으면 초당 체력 1 회복'),
  awl: PAS('뾰족한 송곳', 'buf', '투사체 관통 +1', 2),
  dashShoes: PAS('질주 운동화', 'buf', '움직이는 동안 공격이 8% 빨라진다'),
});

/* ───────── 4 more maps, 32 enemies, 4 dashers, 4 bosses ───────── */
const TIER_HP = [8, 14, 26, 44, 70, 105, 150, 210], TIER_XP = [1, 1, 2, 2, 3, 4, 5, 6];
const E = (name, tier, o = {}) => Object.assign({ name, tier, hp: TIER_HP[tier - 1], xp: TIER_XP[tier - 1], dmg: 5 + tier * 1.6, spd: 62, r: 11, anim: 1.4 }, o);
const BOSS = (name, art, big, crown, abil, minion, o = {}) => E(name, 8, Object.assign({ hp: 3200, spd: 70, dmg: 24, r: 42, xp: 0, boss: true, art, big, crown, abil, minion }, o));
Object.assign(GN.ENEMIES, {
  // 학교 운동장
  eraser: E('지우개', 1, { spd: 60, r: 10 }), pencil: E('연필', 2, { spd: 80, mv: 'burst' }), plane: E('종이비행기', 3, { spd: 100, mv: 'wobble', anim: 0.8 }),
  soccer: E('축구공', 4, { spd: 70, r: 12, mv: 'zig' }), recorder: E('리코더', 5, { spd: 74 }), shoe: E('실내화', 6, { spd: 92, r: 13 }),
  tray: E('급식판', 7, { spd: 48, r: 14, hp: 230 }), duster: E('칠판지우개', 8, { spd: 112, r: 12 }),
  bike: E('자전거', 5, { spd: 340, r: 16, dmg: 18, dash: true }),
  dodgeball: BOSS('대왕 피구공', 'soccer', 3.4, -16, ['charge', 'ring', 'summon'], 'soccer'),
  // 바닷가
  gull: E('갈매기', 1, { spd: 96, r: 10, mv: 'wobble', anim: 2 }), jelly: E('해파리', 2, { spd: 60, mv: 'wobble', anim: 1 }), starfish: E('불가사리', 3, { spd: 70, r: 11 }),
  hermit: E('소라게', 4, { spd: 66, r: 12, hp: 60 }), clam: E('조개', 5, { spd: 50, r: 13, hp: 120 }), urchin: E('성게', 6, { spd: 58, r: 12, dmg: 18 }),
  seal: E('물범', 7, { spd: 76, r: 15 }), octo: E('문어', 8, { spd: 88, r: 14 }),
  jetski: E('제트스키', 5, { spd: 360, r: 16, dmg: 20, dash: true }),
  kraken: BOSS('대왕 문어', 'octo', 3.1, -18, ['aimed', 'ring', 'summon'], 'jelly'),
  // 지하철역
  roach: E('바퀴벌레', 1, { spd: 104, r: 9 }), cup: E('종이컵', 2, { spd: 70, r: 10 }), flyer: E('전단지', 3, { spd: 96, mv: 'wobble', anim: 1 }),
  umbrella: E('우산', 4, { spd: 72, r: 12, mv: 'zig' }), news: E('신문 뭉치', 5, { spd: 80 }), suitcase: E('캐리어', 6, { spd: 54, r: 15, hp: 160 }),
  gate: E('개찰구 로봇', 7, { spd: 70, r: 14 }), mop: E('대걸레', 8, { spd: 106, r: 13 }),
  trolley: E('쇼핑 카트', 5, { spd: 330, r: 17, dmg: 20, dash: true }),
  turnstile: BOSS('개찰구 대왕', 'gate', 3.0, -20, ['charge', 'aimed', 'summon', 'ring'], 'roach'),
  // 눈 덮인 마을
  snowball: E('눈덩이', 1, { spd: 64, r: 10 }), mitten: E('장갑', 2, { spd: 76, mv: 'wobble', anim: 1 }), icicle: E('고드름', 3, { spd: 104, mv: 'burst', r: 10 }),
  bunny: E('눈토끼', 4, { spd: 108, r: 11, mv: 'burst' }), penguin: E('펭귄', 5, { spd: 74, r: 13, mv: 'zig' }), snowman: E('눈사람', 6, { spd: 46, r: 15, hp: 180 }),
  fox: E('북극여우', 7, { spd: 120, r: 13 }), yeti: E('설인', 8, { spd: 70, r: 16, hp: 280 }),
  sled: E('썰매', 5, { spd: 350, r: 16, dmg: 20, dash: true }),
  bigsnowman: BOSS('대왕 눈사람', 'snowman', 3.0, -30, ['ring', 'summon', 'charge'], 'snowball'),
});
Object.assign(GN.STAGES, {
  school: { name: '학교 운동장', desc: '방과 후 운동장의 물건들이 살아 움직인다', roster: ['eraser', 'pencil', 'plane', 'soccer', 'recorder', 'shoe', 'tray', 'duster'], dasher: 'bike', boss: 'dodgeball', prop: 'crate', hpMul: 1.15 },
  beach: { name: '바닷가', desc: '모래사장에는 집게와 가시가 숨어 있다', roster: ['gull', 'jelly', 'starfish', 'hermit', 'clam', 'urchin', 'seal', 'octo'], dasher: 'jetski', boss: 'kraken', prop: 'pot', hpMul: 1.3 },
  subway: { name: '지하철역', desc: '막차가 끊긴 역에서 잡동사니가 몰려온다', roster: ['roach', 'cup', 'flyer', 'umbrella', 'news', 'suitcase', 'gate', 'mop'], dasher: 'trolley', boss: 'turnstile', prop: 'trash', hpMul: 1.45 },
  snow: { name: '눈 덮인 마을', desc: '하얀 골목에서 차가운 것들이 덤빈다', roster: ['snowball', 'mitten', 'icicle', 'bunny', 'penguin', 'snowman', 'fox', 'yeti'], dasher: 'sled', boss: 'bigsnowman', prop: 'crate', hpMul: 1.6 },
});

/* ───────── 18 more permanent upgrades ───────── */
Object.assign(GN.SHOP, {
  critC: { name: '날카로운 감각', desc: '치명타 확률 +2%', max: 5, cost: 150, icon: 'fang' },
  critD: { name: '급소 노리기', desc: '치명타 피해 +10%', max: 5, cost: 150, icon: 'hunter' },
  leech: { name: '든든한 저녁밥', desc: '적을 처치하면 체력 0.1 회복', max: 3, cost: 300, icon: 'warmFur' },
  knock: { name: '묵직한 펀치', desc: '넉백 +15%', max: 2, cost: 150, icon: 'heavyPaw' },
  dodge: { name: '날쌘 몸놀림', desc: '회피 +1%', max: 5, cost: 200, icon: 'windBell' },
  thorn: { name: '가시 돋친 털', desc: '맞으면 주변 적에게 가시 피해', max: 3, cost: 250, icon: 'thornScarf' },
  bossDmg: { name: '대왕 사냥법', desc: '보스·골목대장 피해 +5%', max: 5, cost: 200, icon: 'bossBadge' },
  rescue: { name: '구조 훈련', desc: '구출 속도 +10%', max: 3, cost: 150, icon: 'rescueVest' },
  squadMax: { name: '무리 대장', desc: '함께 다니는 고양이 최대 +1', max: 2, cost: 1200, icon: 'leaderScarf' },
  skillPow: { name: '기술 연마', desc: '기술 효과 +10%', max: 3, cost: 300, icon: 'stretch' },
  coinDrop: { name: '동전 냄새', desc: '동전이 떨어질 확률 +10%', max: 3, cost: 200, icon: 'coinLuck' },
  healItem: { name: '츄르 사랑', desc: '츄르 회복량 +20%', max: 3, cost: 100, icon: 'snack' },
  shield: { name: '털뭉치 갑옷', desc: '15초마다 피해 한 번을 막는다', max: 1, cost: 1500, icon: 'shieldFur' },
  pierce: { name: '관통 연습', desc: '투사체 관통 +1', max: 1, cost: 1500, icon: 'awl' },
  startLv: { name: '준비운동', desc: '시작할 때 레벨 +1', max: 3, cost: 400, icon: 'crown' },
  startWeapon: { name: '두 번째 무기', desc: '무작위 무기 하나를 들고 시작', max: 1, cost: 2500, icon: 'cans' },
  boxLuck: { name: '택배 기사 친구', desc: '상자에서 아이템이 여러 개 나올 확률 +', max: 3, cost: 300, icon: 'box' },
  challenge: { name: '도전 정신', desc: '적 +10%, 동전 +15%', max: 5, cost: 200, icon: 'glare' },
});

/* ───────── 3 more skills ───────── */
Object.assign(GN.SKILLS, {
  purr: { name: '골골송', cd: 18, icon: 'skpurr', desc: '체력 25%를 회복하고, 6초 동안 무리 고양이의 공격력이 50% 오른다' },
  frenzy: { name: '캣닢 폭주', cd: 20, icon: 'skfrenzy', desc: '5초 동안 모든 무기가 두 배로 빨라진다' },
  call: { name: '고양이 소집', cd: 12, icon: 'skcall', desc: '무리 전원이 가까운 적에게 달려들고, 놀라서 숨은 고양이도 바로 돌아온다' },
});

/* ───────── hideout: twice the room (a yard), twice the furniture ───────── */
GN.HOME_CAP = 12;
for (const id in GN.FURN) GN.FURN[id].room = 'in';
Object.assign(GN.FURN, {
  hammock: { name: '나무 해먹', desc: '아지트 자리 +3', cost: 600, icon: 'hammock', room: 'out' },
  cabin: { name: '통나무 고양이집', desc: '아지트 자리 +3', cost: 900, icon: 'cabin', room: 'out' },
  fountain: { name: '정원 분수', desc: '모든 판에서 최대 체력 +10', cost: 350, icon: 'fountain', room: 'out' },
  feeder: { name: '자동 급식기', desc: '간식값이 절반이 된다', cost: 400, icon: 'feeder', room: 'out' },
  tunnel: { name: '고양이 터널', desc: '판에서 길고양이를 15% 더 빨리 구한다', cost: 450, icon: 'tunnel', room: 'out' },
  flowerbed: { name: '꽃밭', desc: '무리 고양이의 공격력 +10%', cost: 500, icon: 'flowerbed', room: 'out' },
  parasol: { name: '파라솔 그늘', desc: '동전 +5%', cost: 550, icon: 'parasol', room: 'out' },
});
GN.FAMILIES.push('서점 주인 언니', '태권도 관장님', '쌍둥이 자매', '목수 아저씨', '간호사 선생님', '피아노 선생님', '과일가게 부부', '우체부 아저씨', '도서관 사서님', '이웃집 할아버지', '소방관 아저씨', '제빵사 형');
GN.NAMES.push('찹쌀', '꿀떡', '수수', '보노', '나리', '하루', '두리', '뭉치', '코코', '설탕', '팥죽', '젤리', '바둑', '오디', '모카', '살구', '앵두', '곶감', '가을', '겨울',
  '봄이', '여름', '은비', '금비', '복실', '만두', '깍두기', '단비', '구슬', '별님', '달님', '포도', '귤이', '로또', '해피', '마카롱', '소금', '후추통', '라라', '똘이');

/* ───────── 40 more achievements ───────── */
const A = (id, name, desc, rw, test) => ({ id, name, desc, rw, test });
GN.ACHS.push(
  A('toSchool', '방과 후 산책', '달빛 옥상에서 레벨 50 달성', { stage: 'school' }, q => q.stage === 'roof' && q.level >= 50),
  A('toBeach', '바다 보러 가자', '학교 운동장에서 레벨 50 달성', { stage: 'beach' }, q => q.stage === 'school' && q.level >= 50),
  A('toSubway', '막차를 놓쳤다', '바닷가에서 레벨 55 달성', { stage: 'subway' }, q => q.stage === 'beach' && q.level >= 55),
  A('toSnow', '첫눈 오는 날', '지하철역에서 레벨 60 달성', { stage: 'snow' }, q => q.stage === 'subway' && q.level >= 60),
  A('clearSchool', '운동장의 왕', '학교 운동장 클리어', { coins: 1000 }, q => q.clears.school > 0),
  A('clearBeach', '바닷가의 왕', '바닷가 클리어', { coins: 1000 }, q => q.clears.beach > 0),
  A('clearSubway', '지하철역의 왕', '지하철역 클리어', { coins: 1200 }, q => q.clears.subway > 0),
  A('clearSnow', '눈 마을의 왕', '눈 덮인 마을 클리어', { coins: 1500 }, q => q.clears.snow > 0),
  A('min25', '버티기 달인', '25분 버티기', { w: 'mousetoy' }, q => q.t >= 1500),
  A('lv60', '훌쩍 큰 고양이', '한 판에서 레벨 60 달성', { w: 'cans' }, q => q.level >= 60),
  A('kills10000', '골목 청소부', '누적 10,000마리 처치', { w: 'bubblewrap' }, q => q.kills >= 10000),
  A('evo10', '진화 전문가', '서로 다른 무기 10종 진화시키기', { w: 'shadowclaw' }, q => q.nEvo >= 10),
  A('boxes30', '택배 단골', '택배 상자 30개 열기', { w: 'flowerpot' }, q => q.boxes >= 30),
  A('rescue60', '구조 영웅', '길고양이 누적 60마리 구하기', { w: 'camera' }, q => q.rescues >= 60),
  A('boss10', '대왕 전문 사냥꾼', '보스 누적 10마리 물리치기', { w: 'flashlight' }, q => q.bossKills >= 10),
  A('coins10000', '알부자', '누적 동전 10,000개 모으기', { w: 'catnipcloud' }, q => q.coins >= 10000),
  A('deaths10', '넘어져도 괜찮아', '10번 쓰러지기', { p: 'windBell' }, q => q.deaths >= 10),
  A('rescue100', '골목 구조대', '길고양이 누적 100마리 구하기', { p: 'rescueVest' }, q => q.rescues >= 100),
  A('adopt3', '세 가족', '고양이 세 마리를 입양 보내기', { p: 'warmFur' }, q => q.adopted >= 3),
  A('cats18', '고양이 동창회', '고양이 18마리 모으기', { p: 'leaderScarf' }, q => q.cats >= 18),
  A('kills30000', '동네의 전설', '누적 30,000마리 처치', { p: 'bossBadge' }, q => q.kills >= 30000),
  A('lv70', '밤에 더 강하다', '한 판에서 레벨 70 달성', { p: 'nightOwl' }, q => q.level >= 70),
  A('boxes60', '상자 수집가', '택배 상자 60개 열기', { p: 'shieldFur' }, q => q.boxes >= 60),
  A('coins20000', '동전 부자', '누적 동전 20,000개 모으기', { p: 'coinLuck' }, q => q.coins >= 20000),
  A('cats24', '고양이 왕국', '고양이 24마리 모두 모으기', { coins: 3000 }, q => q.cats >= 24),
  A('adopt10', '열 가족', '고양이 열 마리를 입양 보내기', { coins: 2000 }, q => q.adopted >= 10),
  A('furnAll2', '꿈의 아지트', '거실과 마당 가구 14개 모두 들이기', { coins: 1500 }, q => q.furn >= 14),
  A('home18', '북적이는 아지트', '아지트 고양이 18마리 함께 지내기', { coins: 800 }, q => q.home >= 18),
  A('evo32', '진화 대백과', '무기 32종을 모두 진화시키기', { coins: 5000 }, q => q.nEvo >= 32),
  A('kills100000', '전설의 사냥꾼', '누적 100,000마리 처치', { coins: 3000 }, q => q.kills >= 100000),
  A('lv100', '백 레벨 고양이', '한 판에서 레벨 100 달성', { coins: 2000 }, q => q.level >= 100),
  A('rescue200', '구조 대장군', '길고양이 누적 200마리 구하기', { coins: 2000 }, q => q.rescues >= 200),
  A('boss30', '대왕 킬러', '보스 누적 30마리 물리치기', { coins: 2000 }, q => q.bossKills >= 30),
  A('clear8', '여덟 동네의 왕', '여덟 스테이지 모두 클리어', { coins: 5000 }, q => Object.keys(q.clears).filter(k => q.clears[k] > 0).length >= 8),
  A('shop50', '꾸준한 단련', '단련하기를 50단계 올리기', { coins: 1000 }, q => q.shopLv >= 50),
  A('endless40', '끝나지 않는 밤', '한 판에서 40분 버티기', { coins: 2000 }, q => q.t >= 2400),
  A('runs50', '골목 단골', '50판 플레이하기', { coins: 1000 }, q => q.runs >= 50),
  A('runs100', '골목 터줏대감', '100판 플레이하기', { coins: 2000 }, q => q.runs >= 100),
  A('boxes100', '택배 왕', '택배 상자 100개 열기', { coins: 1500 }, q => q.boxes >= 100),
  A('played8', '동네 한 바퀴', '여덟 스테이지 모두 가 보기', { coins: 1000 }, q => q.played >= 8),
);
})();

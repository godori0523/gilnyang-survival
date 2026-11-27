/* 길냥이 서바이벌 — content tables */
window.GN = window.GN || {};
(() => {
'use strict';
const GN = window.GN;
GN.RUN_LEN = 1800;   // 30 minutes
GN.MAXW = 6; GN.MAXP = 6; GN.WMAX = 8;

/* ───────── cats ───────── */
GN.CATS = {
  cheese: { name: '치즈', desc: '10레벨마다 공격력 +10% (최대 +50%)', weapon: 'claw', cost: 0, mod: {}, trait: 'grow',
    look: { fur: '#ffb44a', belly: '#fff3dc', muzzle: '#fff3dc', ear: '#ffb44a', stripes: '#e8902a' } },
  tux: { name: '턱시도', desc: '쿨다운 -10%', weapon: 'hairball', cost: 100, mod: { cd: -0.1 },
    look: { fur: '#4a4a5c', belly: '#ffffff', muzzle: '#ffffff', ear: '#4a4a5c', dark: true } },
  calico: { name: '삼색이', desc: '이동속도 +15%', weapon: 'yarn', cost: 200, mod: { move: 0.15 },
    look: { fur: '#ffffff', ear: '#ffb44a', patches: true } },
  mackerel: { name: '고등어', desc: '투사체 속도 +20%, 공격력 +5%', weapon: 'fishbone', cost: 300, mod: { pspeed: 0.2, might: 0.05 },
    look: { fur: '#aab0bd', belly: '#f1f3f9', muzzle: '#f1f3f9', ear: '#aab0bd', stripes: '#6c7284' } },
  russian: { name: '러시안블루', desc: '지속시간 +20%', weapon: 'spill', cost: 400, mod: { dur: 0.2 },
    look: { fur: '#8fa3c4', ear: '#8fa3c4', eye: '#7ddc7a' } },
  fatty: { name: '뚱냥이', desc: '최대 체력 +50, 방어 +1, 이동속도 -10%', weapon: 'purr', cost: 500, req: 'lv20', mod: { hp: 50, armor: 1, move: -0.1 },
    look: { fur: '#f4d9a8', belly: '#ffffff', muzzle: '#ffffff', ear: '#f4d9a8', fat: 1.28 } },
  black: { name: '까망이', desc: '행운 +30%', weapon: 'static', cost: 500, req: 'min5', mod: { luck: 0.3 },
    look: { fur: '#3a3a48', ear: '#3a3a48', eye: '#ffd84d', dark: true } },
  siam: { name: '샴', desc: '공격 범위 +15%', weapon: 'laser', cost: 600, req: 'min10', mod: { area: 0.15 },
    look: { fur: '#f3e6cf', ear: '#6b4b3a', points: '#6b4b3a', eye: '#7cc4ff' } },
  snow: { name: '흰둥이', desc: '체력 재생 +0.5, 최대 체력 +20', weapon: 'kitten', cost: 600, req: 'kills1000', mod: { regen: 0.5, hp: 20 },
    look: { fur: '#ffffff', ear: '#ffffff', eye: '#7cc4ff' } },
  sphynx: { name: '스핑크스', desc: '공격력 +25%, 최대 체력 -25', weapon: 'tailwhip', cost: 800, req: 'clawmax', mod: { might: 0.25, hp: -25 },
    look: { fur: '#f2c1b6', ear: '#f2c1b6', bald: true } },
  kit: { name: '꼬맹이', desc: '투사체 개수 +1, 최대 체력 -30', weapon: 'ball', cost: 1000, req: 'lv10', mod: { amount: 1, hp: -30 },
    look: { fur: '#d9c2a3', belly: '#fff', muzzle: '#fff', ear: '#d9c2a3', small: 0.8 } },
  gold: { name: '황금냥', desc: '동전 +50%, 경험치 +10%', weapon: 'tuna', cost: 1500, req: 'coins5000', mod: { greed: 0.5, growth: 0.1 },
    look: { fur: '#ffd84d', belly: '#fff6c9', muzzle: '#fff6c9', ear: '#ffd84d', stripes: '#e0b020' } },
};

/* ───────── active skill: one button, picked before a run ───────── */
GN.SKILLS = {
  jump: { name: '냥점프', cd: 4, icon: 'skjump', desc: '움직이는 쪽으로 높이 뛰어 피한다. 뛰는 동안 맞지 않고, 착지할 때 주변 적을 밀친다' },
  hiss: { name: '하악!', cd: 9, icon: 'skhiss', desc: '주변 적을 크게 밀쳐내고 잠시 굳게 만든다. 가까이 날아오던 탄도 사라진다' },
  hide: { name: '상자 숨기', cd: 15, icon: 'skhide', desc: '상자에 숨어 2.5초 동안 맞지 않고 체력을 회복한다. 적은 흩어지지만 그동안 움직일 수 없다' },
};

/* ───────── street cats you can rescue during a run ─────────
   kind decides how a cat helps once it joins the squad; dmg grows with the run's level. */
GN.ALLY = {
  cheese: { kind: 'swipe', dmg: 9, cd: 0.9, desc: '가까운 적을 할퀸다' },
  tux: { kind: 'shot', dmg: 8, cd: 1.0, desc: '가까운 적에게 헤어볼을 뱉는다', ico: 'hairball' },
  calico: { kind: 'pounce', dmg: 9, cd: 0.6, desc: '적에게 달려들어 깨문다' },
  mackerel: { kind: 'shot', dmg: 11, cd: 1.6, pierce: 3, desc: '적을 뚫는 생선뼈를 던진다', ico: 'fishbone' },
  russian: { kind: 'chill', dmg: 3, cd: 0.5, desc: '곁에 온 적을 느리게 만든다' },
  fatty: { kind: 'tank', dmg: 4, cd: 0.4, desc: '몸으로 적을 밀어낸다' },
  black: { kind: 'zap', dmg: 15, cd: 2.0, desc: '가까운 적에게 번개를 떨어뜨린다' },
  siam: { kind: 'beam', dmg: 6, cd: 0.35, desc: '가까운 적을 레이저로 지진다' },
  snow: { kind: 'heal', dmg: 3, cd: 4, desc: '주인공의 체력을 조금씩 회복한다' },
  sphynx: { kind: 'swipe', dmg: 17, cd: 1.3, desc: '가까운 적을 세게 할퀸다' },
  kit: { kind: 'pounce', dmg: 6, cd: 0.35, desc: '재빠르게 적에게 달려든다' },
  gold: { kind: 'magnet', dmg: 0, cd: 3, desc: '사료를 끌어오고 동전을 줍는다' },
};
GN.SQUAD_MAX = 6;
GN.RESCUE_EVERY = 40;   // seconds between trapped cats
GN.NAMES = ['나비', '보리', '콩이', '두부', '호떡', '감자', '모찌', '까미', '루루', '별이', '구름', '율무', '단추', '쿠키', '망고', '토리', '초코', '밤이', '꼬미', '레오',
  '양말', '호두', '자두', '마루', '치치', '깨비', '봉구', '순이', '달이', '몽실', '솜이', '후추', '라떼', '사월', '삼순', '도토리', '짱아', '미미', '방울', '누룽지'];

/* ───────── the hideout ─────────
   Rescued cats live here between runs. Furniture shows up in the room and gives a small bonus in every run. */
GN.HOME_CAP = 6;
GN.BOND_MAX = 5;
GN.ADOPT_REWARD = 200;
GN.SNACK_COST = 30;
GN.FURN = {
  bowl: { name: '도자기 밥그릇', desc: '모든 판에서 최대 체력 +10', cost: 200, icon: 'bowl' },
  cushion: { name: '폭신한 방석', desc: '판이 끝날 때 아지트 고양이 친밀도가 1 더 오른다', cost: 300, icon: 'cushion' },
  plant: { name: '창가 캣그라스', desc: '판에서 길고양이를 30% 더 빨리 구한다', cost: 350, icon: 'catnip' },
  scratcher: { name: '골판지 스크래처', desc: '모든 판에서 공격력 +5%', cost: 400, icon: 'scratcher' },
  tower: { name: '캣타워', desc: '아지트 자리 +3', cost: 500, icon: 'tower' },
  toy: { name: '낚싯대 장난감', desc: '함께 나간 고양이의 공격력 +40%', cost: 600, icon: 'feather' },
  house: { name: '숨숨집', desc: '아지트 자리 +3', cost: 800, icon: 'house' },
};
GN.FAMILIES = ['빵집 사장님', '옆집 할머니', '신혼부부', '대학생 언니', '초등학생 남매', '꽃집 아저씨', '동네 작가 선생님', '경비 아저씨', '수의사 선생님', '편의점 알바생', '은퇴한 선생님 부부', '카페 사장님'];

/* ───────── weapons ─────────
   base: level 1 numbers. ups: what each of the 7 later levels adds
   (dmg/amount/pierce add; area/speed/dur add to a multiplier; cd is a fraction of the base cooldown).
   evo.set: values that replace the level 8 numbers once evolved. */
GN.WEAPONS = {
  claw: { name: '냥냥펀치 할퀴기', role: 'atk', desc: '바라보는 쪽을 할퀸다', base: { dmg: 10, cd: 1.1, amount: 1 },
    ups: [{ dmg: 5 }, { amount: 1 }, { area: 0.2 }, { dmg: 5 }, { cd: -0.1 }, { dmg: 8, area: 0.1 }, { amount: 1 }],
    evo: { name: '폭풍 할퀴기', needs: 'tail', desc: '사방을 빠르게 할퀸다', set: { full: 1, cd: 0.55, dmg: 36, area: 1.9 } } },
  hairball: { name: '헤어볼 표창', role: 'atk', desc: '가까운 적에게 헤어볼을 뱉는다', base: { dmg: 8, cd: 1.0, amount: 1, pierce: 1 },
    ups: [{ amount: 1 }, { dmg: 4 }, { pierce: 1 }, { amount: 1 }, { dmg: 5, cd: -0.1 }, { pierce: 1 }, { amount: 1, dmg: 5 }],
    evo: { name: '털뭉치 폭풍', needs: 'whisker', desc: '헤어볼을 쉬지 않고 쏜다', set: { cd: 0.14, amount: 1, dmg: 20, pierce: 4, rapid: 1 } } },
  fishbone: { name: '생선뼈 부메랑', role: 'atk', desc: '적을 모두 뚫고 돌아오는 부메랑', base: { dmg: 14, cd: 2.4, amount: 1 },
    ups: [{ dmg: 6 }, { amount: 1 }, { area: 0.25 }, { dmg: 8 }, { amount: 1 }, { speed: 0.25, dmg: 6 }, { amount: 1 }],
    evo: { name: '고래뼈 부메랑', needs: 'feather', desc: '커다란 뼈가 더 자주 날아간다', set: { dmg: 72, area: 1.6, cd: 1.6 } } },
  yarn: { name: '회전 털실 공', role: 'atk', desc: '털실 공이 주위를 돈다', base: { dmg: 6, cd: 0, amount: 2 },
    ups: [{ amount: 1 }, { dmg: 4 }, { speed: 0.3 }, { amount: 1 }, { dmg: 5, area: 0.15 }, { amount: 1 }, { dmg: 6 }],
    evo: { name: '털실 회오리', needs: 'paw', desc: '털실 8개가 넓고 빠르게 돈다', set: { dmg: 26, amount: 8, area: 1.6, speed: 1.7 } } },
  meow: { name: '야옹 충격파', role: 'atk', desc: '주변 적을 밀쳐내는 울음소리', base: { dmg: 8, cd: 3.2 },
    ups: [{ area: 0.2 }, { dmg: 6 }, { cd: -0.15 }, { area: 0.2 }, { dmg: 8 }, { cd: -0.15 }, { dmg: 10, area: 0.2 }],
    evo: { name: '사자후 충격파', needs: 'crown', desc: '넓게 울려 퍼지고 적을 잠시 굳힌다', set: { dmg: 45, area: 2.3, cd: 2.0, stun: 1.2 } } },
  tuna: { name: '참치캔 폭격', role: 'atk', desc: '하늘에서 참치캔이 떨어진다', base: { dmg: 22, cd: 2.6, amount: 1 },
    ups: [{ amount: 1 }, { dmg: 10 }, { area: 0.25 }, { amount: 1 }, { cd: -0.15 }, { dmg: 12 }, { amount: 1 }],
    evo: { name: '황금 참치캔 폭격', needs: 'piggy', desc: '더 크게 터지고 가끔 동전이 나온다', set: { dmg: 70, area: 1.9, coin: 0.08 } } },
  purr: { name: '가르릉 진동 오라', role: 'atk', desc: '가까이 온 적이 계속 피해를 입는다', base: { dmg: 4, cd: 0.5 }, noAmount: true,
    ups: [{ area: 0.2 }, { dmg: 2 }, { area: 0.2 }, { dmg: 2 }, { cd: -0.1 }, { area: 0.2, dmg: 2 }, { dmg: 3 }],
    evo: { name: '골골송 치유 오라', needs: 'belly', desc: '범위가 넓어지고 체력을 회복한다', set: { dmg: 14, area: 2.1, heal: 0.5 } } },
  spill: { name: '엎지른 우유 장판', role: 'atk', desc: '바닥에 남아 피해를 주는 웅덩이', base: { dmg: 6, cd: 3.4, amount: 1 },
    ups: [{ amount: 1 }, { dmg: 3, dur: 0.2 }, { area: 0.2 }, { amount: 1 }, { dmg: 4 }, { dur: 0.3, area: 0.2 }, { amount: 1 }],
    evo: { name: '우유 홍수 장판', needs: 'cushion', desc: '크고 오래가며 적을 느리게 한다', set: { dmg: 20, area: 1.9, dur: 2, slow: 1 } } },
  bowl: { name: '밥그릇 던지기', role: 'atk', desc: '위로 던진 밥그릇이 떨어지며 뚫는다', base: { dmg: 20, cd: 2.8, amount: 1, pierce: 3 },
    ups: [{ amount: 1 }, { dmg: 10 }, { pierce: 2 }, { amount: 1 }, { dmg: 12, area: 0.15 }, { cd: -0.15 }, { amount: 1 }],
    evo: { name: '무쇠 솥뚜껑 던지기', needs: 'catnip', desc: '커다란 솥뚜껑이 모든 적을 뚫는다', set: { dmg: 65, pierce: 999, area: 1.7 } } },
  static: { name: '정전기 번개', role: 'atk', desc: '아무 적에게나 번개가 친다', base: { dmg: 16, cd: 3.0, amount: 2 },
    ups: [{ amount: 1 }, { dmg: 8 }, { area: 0.3 }, { amount: 1 }, { dmg: 10 }, { cd: -0.15 }, { amount: 2 }],
    evo: { name: '연쇄 번개', needs: 'mirror', desc: '번개가 주변 적에게 옮겨 붙는다', set: { dmg: 50, area: 1.6, chain: 3 } } },
  laser: { name: '레이저 포인터 광선', role: 'atk', desc: '빙빙 도는 레이저가 적을 태운다', base: { dmg: 5, cd: 0.25, amount: 1 },
    ups: [{ dmg: 2 }, { area: 0.2 }, { amount: 1 }, { dmg: 3 }, { speed: 0.3 }, { area: 0.2, dmg: 2 }, { amount: 1 }],
    evo: { name: '무지개 레이저 광선', needs: 'clover', desc: '다섯 줄기 레이저가 길게 뻗는다', set: { dmg: 18, amount: 5, area: 1.8, rainbow: 1 } } },
  ball: { name: '튕기는 탱탱볼', role: 'atk', desc: '화면 끝에서 튕기며 적을 친다', base: { dmg: 9, cd: 3.0, amount: 1 },
    ups: [{ dmg: 4, speed: 0.2 }, { amount: 1 }, { dur: 0.3 }, { dmg: 5, area: 0.2 }, { amount: 1 }, { dmg: 6 }, { amount: 1, dur: 0.2 }],
    evo: { name: '튕기는 강철 방울', needs: 'bell', desc: '크고 묵직한 방울이 오래 튕긴다', set: { dmg: 32, area: 1.8, dur: 2 } } },
  kitten: { name: '아기 고양이 지원군', role: 'atk', desc: '아기 고양이가 적에게 달려든다', base: { dmg: 7, cd: 0, amount: 1 },
    ups: [{ dmg: 3 }, { amount: 1 }, { speed: 0.25 }, { dmg: 4 }, { amount: 1 }, { dmg: 5, area: 0.2 }, { amount: 1 }],
    evo: { name: '고양이 군단', needs: 'snack', desc: '일곱 마리가 빠르게 몰려다닌다', set: { dmg: 24, amount: 7, speed: 1.7 } } },
  tailwhip: { name: '꼬리 채찍', role: 'atk', desc: '좌우로 길게 후려친다', base: { dmg: 12, cd: 1.35, amount: 1 },
    ups: [{ amount: 1 }, { dmg: 5 }, { area: 0.15 }, { dmg: 5 }, { area: 0.15, cd: -0.1 }, { dmg: 6 }, { amount: 1 }],
    evo: { name: '용꼬리 채찍', needs: 'collar', desc: '더 길고 빠르며 가끔 두 배로 아프다', set: { dmg: 42, area: 1.7, cd: 0.9, crit: 0.3 } } },
  sardine: { name: '멸치 미사일', role: 'atk', desc: '적을 쫓아가 터지는 멸치', base: { dmg: 14, cd: 2.2, amount: 1 },
    ups: [{ dmg: 6 }, { amount: 1 }, { area: 0.25 }, { dmg: 7 }, { amount: 1 }, { cd: -0.15, dmg: 5 }, { amount: 1 }],
    evo: { name: '상어 미사일', needs: 'ninelives', desc: '훨씬 크게 터진다', set: { dmg: 55, area: 1.9, cd: 1.5 } } },
  boxtrap: { name: '택배 상자 덫', role: 'atk', desc: '적이 밟으면 터지는 상자를 놓는다', base: { dmg: 28, cd: 2.4, amount: 1 },
    ups: [{ dmg: 10 }, { amount: 1 }, { area: 0.2 }, { dmg: 12 }, { cd: -0.15 }, { amount: 1, area: 0.2 }, { dmg: 15 }],
    evo: { name: '선물 상자 지뢰밭', needs: 'glare', desc: '크게 터지고 적을 잠시 굳힌다', set: { dmg: 85, area: 1.8, stun: 1 } } },
};

/* ───────── passives ───────── */
GN.PASSIVES = {
  catnip: { name: '힘솟는 캣닢', role: 'buf', desc: '공격력 +10%', max: 5 },
  whisker: { name: '재빠른 수염', role: 'buf', desc: '쿨다운 -6%', max: 5 },
  paw: { name: '날쌘 젤리 발바닥', role: 'util', desc: '이동속도 +8%', max: 5 },
  bell: { name: '자석 방울', role: 'util', desc: '줍는 범위 +30%', max: 5 },
  belly: { name: '든든한 뱃살', role: 'def', desc: '최대 체력 +20%', max: 5 },
  tail: { name: '길게 뻗는 꼬리', role: 'buf', desc: '공격 범위 +10%', max: 5 },
  collar: { name: '튼튼한 가죽 목걸이', role: 'def', desc: '방어 +1', max: 5 },
  snack: { name: '회복 츄르', role: 'def', desc: '초당 체력 재생 +0.3', max: 5 },
  feather: { name: '쌩쌩 깃털', role: 'buf', desc: '투사체 속도 +10%', max: 5 },
  cushion: { name: '오래가는 낮잠 방석', role: 'buf', desc: '효과 지속시간 +10%', max: 5 },
  mirror: { name: '분신 거울', role: 'buf', desc: '투사체 개수 +1', max: 2 },
  clover: { name: '행운의 네잎클로버', role: 'util', desc: '행운 +10%', max: 5 },
  crown: { name: '성장의 왕관', role: 'util', desc: '경험치 +8%', max: 5 },
  piggy: { name: '동전 불리는 저금통', role: 'util', desc: '동전 +10%', max: 5 },
  ninelives: { name: '부활의 아홉 목숨', role: 'def', desc: '쓰러져도 한 번 다시 일어난다', max: 2 },
  glare: { name: '도발하는 눈빛', role: 'risk', desc: '적이 10% 더 많고 강해진다 (경험치도 늘어난다)', max: 5 },
};

/* ───────── enemies ───────── */
const TIER_HP = [8, 14, 26, 44, 70, 105, 150, 210], TIER_XP = [1, 1, 2, 2, 3, 4, 5, 6];
const E = (name, tier, o = {}) => Object.assign({ name, tier, hp: TIER_HP[tier - 1], xp: TIER_XP[tier - 1], dmg: 5 + tier * 1.6, spd: 62, r: 11, anim: 1.4 }, o);
GN.ENEMIES = {
  // 골목길
  rat: E('쥐', 1, { spd: 58, r: 10 }),
  pigeon: E('비둘기', 2, { spd: 70 }),
  bag: E('비닐봉지', 3, { spd: 98, r: 10, hp: 16, mv: 'wobble' }),
  cuke: E('오이', 4, { spd: 44, r: 12, hp: 60 }),
  crow: E('까마귀', 5, { spd: 118, mv: 'burst' }),
  dog: E('동네 강아지', 6, { spd: 64, r: 17 }),
  roomba: E('로봇청소기', 7, { spd: 84, r: 15, anim: 0.6 }),
  raccoon: E('너구리', 8, { spd: 90, r: 14 }),
  dust: E('먼지뭉치', 3, { spd: 95, r: 9, anim: 0.5 }),
  // 재래시장
  fly: E('파리', 1, { spd: 92, r: 7, hp: 5, mv: 'wobble', anim: 3 }),
  chili: E('고추', 2, { spd: 88, r: 9 }),
  chick: E('병아리', 3, { spd: 72, r: 10 }),
  crab: E('꽃게', 4, { spd: 66, r: 12, mv: 'zig' }),
  squid: E('오징어', 5, { spd: 96, r: 11, mv: 'burst' }),
  tofu: E('두부', 6, { spd: 46, r: 13, hp: 140 }),
  onion: E('양파', 7, { spd: 70, r: 13 }),
  puffer: E('복어', 8, { spd: 78, r: 15 }),
  // 공원
  bee: E('꿀벌', 1, { spd: 86, r: 8, hp: 6, mv: 'wobble', anim: 3 }),
  squirrel: E('다람쥐', 2, { spd: 96, r: 10 }),
  frog: E('개구리', 3, { spd: 92, r: 11, mv: 'burst' }),
  mole: E('두더지', 4, { spd: 60, r: 11 }),
  hedgehog: E('고슴도치', 5, { spd: 66, r: 12, dmg: 16 }),
  goose: E('거위', 6, { spd: 82, r: 14 }),
  snail: E('달팽이', 7, { spd: 36, r: 13, hp: 260, anim: 0.7 }),
  mantis: E('사마귀', 8, { spd: 112, r: 12 }),
  // 달빛 옥상
  moth: E('나방', 1, { spd: 84, r: 9, hp: 7, mv: 'wobble', anim: 2.4 }),
  bat: E('박쥐', 2, { spd: 100, r: 10, mv: 'wobble', anim: 2.2 }),
  spider: E('거미', 3, { spd: 74, r: 10 }),
  nightcrow: E('밤까마귀', 4, { spd: 112, mv: 'burst', art: 'crow' }),
  drone: E('드론', 5, { spd: 88, r: 12, anim: 2.5 }),
  weasel: E('족제비', 6, { spd: 116, r: 12 }),
  owl: E('올빼미', 7, { spd: 78, r: 13 }),
  alleycat: E('도둑 너구리', 8, { spd: 98, r: 14, art: 'raccoon' }),
  // 돌진하는 것들
  scooter: E('전동 킥보드', 5, { spd: 340, r: 15, dmg: 18, dash: true }),
  cart: E('손수레', 5, { spd: 300, r: 17, dmg: 18, dash: true }),
  mower: E('잔디깎이', 5, { spd: 320, r: 16, dmg: 20, dash: true }),
  firework: E('폭죽', 5, { spd: 380, r: 12, dmg: 18, dash: true, anim: 3 }),
  // 부술 수 있는 것
  trash: E('쓰레기봉투', 1, { hp: 14, spd: 0, dmg: 0, r: 13, xp: 0, prop: true }),
  crate: E('나무 상자', 1, { hp: 14, spd: 0, dmg: 0, r: 13, xp: 0, prop: true }),
  pot: E('화분', 1, { hp: 14, spd: 0, dmg: 0, r: 12, xp: 0, prop: true }),
  // 보스
  vacuum: E('청소기 대왕', 8, { hp: 3200, spd: 66, dmg: 24, r: 44, xp: 0, boss: true, abil: ['suck', 'summon', 'ring'], minion: 'dust', anim: 1 }),
  kingcrab: E('대왕 꽃게', 8, { hp: 3200, spd: 70, dmg: 24, r: 42, xp: 0, boss: true, art: 'crab', big: 3.4, crown: -16, abil: ['charge', 'ring', 'summon'], minion: 'crab' }),
  goosebig: E('거위 대장', 8, { hp: 3200, spd: 74, dmg: 24, r: 40, xp: 0, boss: true, art: 'goose', big: 2.8, crown: -20, crownX: 10, abil: ['charge', 'summon', 'aimed'], minion: 'bee' }),
  owlking: E('부엉이 대왕', 8, { hp: 3200, spd: 72, dmg: 24, r: 42, xp: 0, boss: true, art: 'owl', big: 3.1, crown: -17, abil: ['aimed', 'ring', 'summon', 'charge'], minion: 'bat' }),
};

/* ───────── stages ───────── */
GN.STAGES = {
  alley: { name: '골목길', desc: '쥐와 비둘기가 사는 익숙한 동네', roster: ['rat', 'pigeon', 'bag', 'cuke', 'crow', 'dog', 'roomba', 'raccoon'], dasher: 'scooter', boss: 'vacuum', prop: 'trash' },
  market: { name: '재래시장', desc: '좌판 사이로 먹을 것들이 덤벼든다', roster: ['fly', 'chili', 'chick', 'crab', 'squid', 'tofu', 'onion', 'puffer'], dasher: 'cart', boss: 'kingcrab', prop: 'crate' },
  park: { name: '공원', desc: '풀밭의 주인들은 고양이를 반기지 않는다', roster: ['bee', 'squirrel', 'frog', 'mole', 'hedgehog', 'goose', 'snail', 'mantis'], dasher: 'mower', boss: 'goosebig', prop: 'pot' },
  roof: { name: '달빛 옥상', desc: '밤의 옥상에는 날개 달린 것들이 많다', roster: ['moth', 'bat', 'spider', 'nightcrow', 'drone', 'weasel', 'owl', 'alleycat'], dasher: 'firework', boss: 'owlking', prop: 'pot' },
};

/* ───────── permanent upgrades ───────── */
GN.SHOP = {
  might: { name: '날카로운 발톱', desc: '공격력 +5%', max: 5, cost: 80, icon: 'claw' },
  armor: { name: '두꺼운 털', desc: '방어 +1', max: 3, cost: 240, icon: 'collar' },
  maxhp: { name: '튼튼한 몸', desc: '최대 체력 +10%', max: 3, cost: 80, icon: 'belly' },
  recovery: { name: '꿀잠', desc: '초당 체력 재생 +0.1', max: 5, cost: 80, icon: 'snack' },
  cooldown: { name: '날랜 손놀림', desc: '쿨다운 -2.5%', max: 2, cost: 360, icon: 'whisker' },
  area: { name: '기지개', desc: '공격 범위 +5%', max: 2, cost: 120, icon: 'tail' },
  pspeed: { name: '세게 던지기', desc: '투사체 속도 +10%', max: 2, cost: 120, icon: 'feather' },
  dur: { name: '끈기', desc: '지속시간 +15%', max: 2, cost: 120, icon: 'cushion' },
  amount: { name: '분신술', desc: '투사체 개수 +1', max: 1, cost: 2000, icon: 'mirror' },
  move: { name: '빠른 발', desc: '이동속도 +5%', max: 2, cost: 120, icon: 'paw' },
  magnet: { name: '밝은 눈', desc: '줍는 범위 +25%', max: 2, cost: 120, icon: 'bell' },
  luck: { name: '행운의 수염', desc: '행운 +10%', max: 3, cost: 240, icon: 'clover' },
  growth: { name: '눈치', desc: '경험치 +3%', max: 5, cost: 360, icon: 'crown' },
  greed: { name: '알뜰함', desc: '동전 +10%', max: 5, cost: 80, icon: 'piggy' },
  revival: { name: '예비 목숨', desc: '쓰러져도 한 번 다시 일어난다', max: 1, cost: 1200, icon: 'ninelives' },
  skillcd: { name: '날렵함', desc: '기술 쿨다운 -8%', max: 3, cost: 300, icon: 'skjump' },
  reroll: { name: '다시 뽑기', desc: '판마다 다시 뽑기 +1', max: 3, cost: 400, icon: 'hairball' },
  skip: { name: '건너뛰기', desc: '판마다 건너뛰기 +1', max: 2, cost: 200, icon: 'ball' },
  banish: { name: '제외하기', desc: '판마다 제외 +1', max: 2, cost: 200, icon: 'hiss' },
};

/* ───────── achievements ─────────
   rw: w = weapon, p = passive, stage, coins, flag. test(q) gets live totals. */
const A = (id, name, desc, rw, test) => ({ id, name, desc, rw, test });
GN.ACHS = [
  A('lv5', '첫걸음', '한 판에서 레벨 5 달성', { w: 'bowl' }, q => q.level >= 5),
  A('min5', '골목 신입', '5분 버티기', { w: 'static' }, q => q.t >= 300),
  A('min10', '동네 터줏대감', '10분 버티기', { w: 'laser' }, q => q.t >= 600),
  A('lv10', '쑥쑥 자라는 중', '한 판에서 레벨 10 달성', { w: 'ball' }, q => q.level >= 10),
  A('kills1000', '쥐잡이', '누적 1,000마리 처치', { w: 'kitten' }, q => q.kills >= 1000),
  A('clawmax', '발톱 장인', '냥냥펀치 할퀴기를 Lv 8까지 올리기', { w: 'tailwhip' }, q => q.wlv('claw') >= 8),
  A('kills5000', '골목의 공포', '누적 5,000마리 처치', { w: 'sardine' }, q => q.kills >= 5000),
  A('boxes5', '상자는 못 참지', '택배 상자 5개 열기', { w: 'boxtrap' }, q => q.boxes >= 5),
  A('fish4', '생선 애호가', '생선뼈 부메랑을 Lv 4까지 올리기', { p: 'feather' }, q => q.wlv('fishbone') >= 4),
  A('min15', '낮잠은 사치', '15분 버티기', { p: 'cushion' }, q => q.t >= 900),
  A('six', '욕심쟁이', '무기 6개를 한꺼번에 들기', { p: 'mirror' }, q => q.nW >= 6),
  A('coins500', '용돈 모으기', '누적 동전 500개 모으기', { p: 'clover' }, q => q.coins >= 500),
  A('lv20', '골목대장', '한 판에서 레벨 20 달성', { p: 'crown' }, q => q.level >= 20),
  A('coins2000', '저축왕', '누적 동전 2,000개 모으기', { p: 'piggy' }, q => q.coins >= 2000),
  A('deaths3', '칠전팔기', '3번 쓰러지기', { p: 'ninelives' }, q => q.deaths >= 3),
  A('min20', '눈빛만 봐도', '20분 버티기', { p: 'glare' }, q => q.t >= 1200),
  A('toMarket', '시장 구경', '골목길에서 레벨 20 달성', { stage: 'market' }, q => q.stage === 'alley' && q.level >= 20),
  A('toPark', '산책 나가기', '재래시장에서 레벨 30 달성', { stage: 'park' }, q => q.stage === 'market' && q.level >= 30),
  A('toRoof', '높은 곳이 좋아', '공원에서 레벨 40 달성', { stage: 'roof' }, q => q.stage === 'park' && q.level >= 40),
  A('coins5000', '부자 고양이', '누적 동전 5,000개 모으기', { coins: 300 }, q => q.coins >= 5000),
  A('evo1', '첫 진화', '무기 하나 진화시키기', { coins: 200 }, q => q.nEvo >= 1),
  A('evo5', '진화 수집가', '서로 다른 무기 5종 진화시키기', { coins: 500 }, q => q.nEvo >= 5),
  A('evo16', '진화 박사', '무기 16종을 모두 진화시키기', { coins: 3000 }, q => q.nEvo >= 16),
  A('boss1', '대왕 사냥', '보스 처음 물리치기', { coins: 300 }, q => q.bossKills >= 1),
  A('clearAlley', '골목의 왕', '골목길에서 30분 버티고 보스 물리치기', { coins: 500, flag: 'endless' }, q => q.clears.alley > 0),
  A('clearMarket', '시장의 왕', '재래시장 클리어', { coins: 500, flag: 'endless' }, q => q.clears.market > 0),
  A('clearPark', '공원의 왕', '공원 클리어', { coins: 500, flag: 'endless' }, q => q.clears.park > 0),
  A('clearRoof', '달빛의 왕', '달빛 옥상 클리어', { coins: 1000, flag: 'endless' }, q => q.clears.roof > 0),
  A('lv50', '무럭무럭', '한 판에서 레벨 50 달성', { coins: 300 }, q => q.level >= 50),
  A('lv80', '전설의 길냥이', '한 판에서 레벨 80 달성', { coins: 1000 }, q => q.level >= 80),
  A('kills20000', '동네 평정', '누적 20,000마리 처치', { coins: 1000 }, q => q.kills >= 20000),
  A('rescue1', '첫 구출', '갇힌 길고양이 한 마리 구하기', { coins: 100 }, q => q.rescues >= 1),
  A('squad6', '골목 무리', '한 판에서 고양이 6마리와 함께 다니기', { coins: 300 }, q => q.squad >= 6),
  A('rescue30', '구조 대장', '길고양이 누적 30마리 구하기', { coins: 600 }, q => q.rescues >= 30),
  A('bond5', '단짝', '아지트 고양이 한 마리의 친밀도를 끝까지 채우기', { coins: 200 }, q => q.bond >= 5 || q.adopted >= 1),
  A('adopt1', '첫 입양', '아지트 고양이를 처음으로 입양 보내기', { coins: 300 }, q => q.adopted >= 1),
  A('adopt5', '다섯 가족', '고양이 다섯 마리를 입양 보내기', { coins: 1000 }, q => q.adopted >= 5),
  A('furnAll', '아늑한 아지트', '아지트 가구를 모두 들이기', { coins: 500 }, q => q.furn >= 7),
  A('cats6', '고양이 모임', '고양이 6마리 모으기', { coins: 300 }, q => q.cats >= 6),
  A('cats12', '고양이 대가족', '고양이 12마리 모으기', { coins: 2000 }, q => q.cats >= 12),
];
})();

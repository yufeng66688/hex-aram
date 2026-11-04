/* ============================================================
   地图：嚎哭深渊 · 单线冰桥
   世界坐标 6000×1000，出生点两端，中央窄桥。
   ============================================================ */
import { WORLD } from './data.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const LAYOUT = {
  blue: {
    fountain: { x: 214, y: 500 },
    nexus: { x: 470, y: 500 },
    inhib: { x: 792, y: 500 },
    towers: [{ x: 1264, y: 500 }, { x: 1986, y: 500 }],
    spawn: { x: 600, y: 500 },
  },
  red: {
    fountain: { x: 5786, y: 500 },
    nexus: { x: 5530, y: 500 },
    inhib: { x: 5208, y: 500 },
    towers: [{ x: 4736, y: 500 }, { x: 4014, y: 500 }],
    spawn: { x: 5400, y: 500 },
  },
  relics: [{ x: 2560, y: 392 }, { x: 3440, y: 608 }],
};

// 草丛（嚎哭深渊沿路草位，圆形判定）
export const BRUSHES = [
  { x: 1120, y: 306, r: 96 }, { x: 1120, y: 694, r: 96 },
  { x: 1760, y: 306, r: 88 }, { x: 1760, y: 694, r: 88 },
  { x: 2560, y: 360, r: 92 }, { x: 3440, y: 640, r: 92 },
  { x: 4240, y: 306, r: 88 }, { x: 4240, y: 694, r: 88 },
  { x: 4880, y: 306, r: 96 }, { x: 4880, y: 694, r: 96 },
];

export function inBrush(x, y) {
  for (const b of BRUSHES) {
    const dx = x - b.x, dy = y - b.y;
    if (dx * dx + dy * dy <= b.r * b.r) return b;
  }
  return null;
}

export const LANE = {
  top: WORLD.laneTop,
  bot: WORLD.laneBot,
  bridgeTop: 372, bridgeBot: 628,
  bridgeStart: 2180, bridgeEnd: 3820,
};

/** 把点限制在可行走带内（含中央窄桥） */
export function clampToLane(x, y) {
  const cx = Math.max(120, Math.min(WORLD.w - 120, x));
  let top = LANE.top, bot = LANE.bot;
  if (cx > LANE.bridgeStart && cx < LANE.bridgeEnd) {
    const t = Math.min((cx - LANE.bridgeStart) / 260, (LANE.bridgeEnd - cx) / 260, 1);
    top = LANE.top + (LANE.bridgeTop - LANE.top) * t;
    bot = LANE.bot + (LANE.bridgeBot - LANE.bot) * t;
  }
  return { x: cx, y: Math.max(top + 18, Math.min(bot - 18, y)) };
}

/* ---------------- 背景绘制 ---------------- */
function diamond(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.moveTo(x, y - ry); ctx.lineTo(x + rx, y); ctx.lineTo(x, y + ry); ctx.lineTo(x - rx, y);
  ctx.closePath();
}

export function buildBackground() {
  const c = document.createElement('canvas');
  c.width = WORLD.w; c.height = WORLD.h;
  const g = c.getContext('2d');
  const rnd = mulberry32(20261104);

  // 深渊底
  const abyss = g.createLinearGradient(0, 0, 0, WORLD.h);
  abyss.addColorStop(0, '#04090c');
  abyss.addColorStop(.18, '#071218');
  abyss.addColorStop(.5, '#050d12');
  abyss.addColorStop(.82, '#071218');
  abyss.addColorStop(1, '#04090c');
  g.fillStyle = abyss; g.fillRect(0, 0, WORLD.w, WORLD.h);

  // 远端雾气
  for (let i = 0; i < 60; i++) {
    const x = rnd() * WORLD.w, y = rnd() * WORLD.h;
    const r = 120 + rnd() * 320;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(70,224,255,.045)');
    grd.addColorStop(1, 'rgba(70,224,255,0)');
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }

  // 雪原（桥两侧）
  g.fillStyle = '#0d1e26';
  g.fillRect(0, 0, WORLD.w, LANE.top + 40);
  g.fillRect(0, LANE.bot - 40, WORLD.w, WORLD.h - LANE.bot + 40);

  // 冰桥主体
  const bridge = g.createLinearGradient(0, LANE.top, 0, LANE.bot);
  bridge.addColorStop(0, '#16323d');
  bridge.addColorStop(.12, '#1e4552');
  bridge.addColorStop(.5, '#2a6376');
  bridge.addColorStop(.88, '#1e4552');
  bridge.addColorStop(1, '#16323d');
  g.fillStyle = bridge;
  g.fillRect(0, LANE.top, WORLD.w, LANE.bot - LANE.top);

  // 中央更亮的冰面
  const mid = g.createLinearGradient(0, 380, 0, 620);
  mid.addColorStop(0, 'rgba(120,210,235,.05)');
  mid.addColorStop(.5, 'rgba(150,235,255,.16)');
  mid.addColorStop(1, 'rgba(120,210,235,.05)');
  g.fillStyle = mid; g.fillRect(0, 380, WORLD.w, 240);

  // 冰裂纹
  g.lineCap = 'round';
  for (let i = 0; i < 260; i++) {
    const x = rnd() * WORLD.w;
    const y = LANE.top + 30 + rnd() * (LANE.bot - LANE.top - 60);
    const len = 30 + rnd() * 150;
    const a = rnd() * Math.PI * 2;
    g.strokeStyle = `rgba(190,240,255,${.03 + rnd() * .07})`;
    g.lineWidth = .6 + rnd() * 1.8;
    g.beginPath(); g.moveTo(x, y);
    let px = x, py = y, ang = a;
    for (let k = 0; k < 3; k++) {
      ang += (rnd() - .5) * 1.2;
      px += Math.cos(ang) * len / 3; py += Math.sin(ang) * len / 3;
      g.lineTo(px, py);
    }
    g.stroke();
  }

  // 桥面石板缝
  for (let x = 0; x < WORLD.w; x += 96) {
    g.strokeStyle = 'rgba(6,18,24,.35)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, LANE.top + 14); g.lineTo(x + 20, LANE.bot - 14); g.stroke();
  }
  // 菱形冰砖
  for (let i = 0; i < 900; i++) {
    const x = rnd() * WORLD.w;
    const y = LANE.top + 24 + rnd() * (LANE.bot - LANE.top - 48);
    const s2 = 14 + rnd() * 26;
    g.globalAlpha = .02 + rnd() * .05;
    g.fillStyle = rnd() > .5 ? '#bff0ff' : '#0a1a22';
    g.beginPath();
    g.moveTo(x, y - s2 * .5); g.lineTo(x + s2, y); g.lineTo(x, y + s2 * .5); g.lineTo(x - s2, y);
    g.closePath(); g.fill();
  }
  g.globalAlpha = 1;
  // 内侧雪堆
  for (let i = 0; i < 120; i++) {
    const x = rnd() * WORLD.w;
    const top = rnd() > .5;
    const y = top ? LANE.top + 30 + rnd() * 40 : LANE.bot - 30 - rnd() * 40;
    const rr2 = 12 + rnd() * 46;
    const grd = g.createRadialGradient(x, y, 1, x, y, rr2);
    grd.addColorStop(0, 'rgba(210,240,250,.13)');
    grd.addColorStop(1, 'rgba(210,240,250,0)');
    g.fillStyle = grd;
    g.beginPath(); g.ellipse(x, y, rr2, rr2 * .42, 0, 0, 7); g.fill();
  }

  // 边缘护栏 / 石台
  const rail = (yy, flip) => {
    g.fillStyle = '#0a171d';
    g.fillRect(0, yy - 16, WORLD.w, 32);
    for (let x = 40; x < WORLD.w; x += 150) {
      const h = 26 + rnd() * 12;
      g.fillStyle = '#132831';
      g.fillRect(x, yy - h / 2, 46, h);
      g.fillStyle = 'rgba(150,220,240,.08)';
      g.fillRect(x, yy - h / 2, 46, 5);
      g.fillStyle = '#0b1a20';
      g.fillRect(x + 6, yy - h / 2 + 6, 34, h - 12);
    }
    if (flip) { /* noop */ }
  };
  rail(LANE.top + 16, false);
  rail(LANE.bot - 16, true);

  // 装饰：冰柱、骨头、灯笼
  for (let i = 0; i < 40; i++) {
    const x = 120 + rnd() * (WORLD.w - 240);
    const side = rnd() < .5;
    const y = side ? LANE.top - 20 - rnd() * 90 : LANE.bot + 20 + rnd() * 90;
    const h = 30 + rnd() * 90;
    g.fillStyle = 'rgba(160,220,240,.13)';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10, y - h); g.lineTo(x + 20, y); g.closePath(); g.fill();
    g.fillStyle = 'rgba(220,245,255,.10)';
    g.beginPath(); g.moveTo(x + 4, y); g.lineTo(x + 10, y - h * .9); g.lineTo(x + 13, y); g.closePath(); g.fill();
  }

  // 海克斯符文圈（中央与两侧）
  const runeCircle = (x, y, r, color) => {
    g.save(); g.translate(x, y);
    g.strokeStyle = color; g.lineWidth = 2;
    g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
    g.globalAlpha = .5;
    g.beginPath(); g.arc(0, 0, r * .78, 0, 7); g.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x1 = Math.cos(a) * r * .78, y1 = Math.sin(a) * r * .78;
      const x2 = Math.cos(a) * r, y2 = Math.sin(a) * r;
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    }
    g.globalAlpha = .22;
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(a) * r * .55, py = Math.sin(a) * r * .55;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.closePath(); g.stroke();
    g.restore();
  };
  runeCircle(3000, 500, 150, 'rgba(70,224,255,.30)');
  runeCircle(2300, 500, 90, 'rgba(200,169,106,.20)');
  runeCircle(3700, 500, 90, 'rgba(200,169,106,.20)');

  // 双方基地平台
  const platform = (cx, team) => {
    const col = team === 'blue' ? '#3aa0ff' : '#ff4d5e';
    g.save();
    g.translate(cx, 500);
    // 椭圆石台
    const grd = g.createRadialGradient(0, 0, 40, 0, 0, 420);
    grd.addColorStop(0, team === 'blue' ? 'rgba(58,160,255,.22)' : 'rgba(255,77,94,.20)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.beginPath(); g.ellipse(0, 0, 430, 300, 0, 0, 7); g.fill();
    g.strokeStyle = col; g.globalAlpha = .35; g.lineWidth = 3;
    g.beginPath(); g.ellipse(0, 0, 330, 210, 0, 0, 7); g.stroke();
    g.globalAlpha = .18;
    g.beginPath(); g.ellipse(0, 0, 250, 160, 0, 0, 7); g.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.globalAlpha = .5;
      g.beginPath();
      g.moveTo(Math.cos(a) * 250, Math.sin(a) * 160);
      g.lineTo(Math.cos(a) * 330, Math.sin(a) * 210);
      g.stroke();
    }
    g.restore();
  };
  platform(430, 'blue');
  platform(5570, 'red');

  // 小兵路径淡痕
  g.strokeStyle = 'rgba(200,240,255,.05)'; g.lineWidth = 26; g.lineCap = 'round';
  g.beginPath(); g.moveTo(520, 500); g.bezierCurveTo(1800, 470, 4200, 530, 5480, 500); g.stroke();

  // 雪边渐层
  const snowTop = g.createLinearGradient(0, LANE.top - 60, 0, LANE.top + 10);
  snowTop.addColorStop(0, 'rgba(8,18,24,.9)');
  snowTop.addColorStop(1, 'rgba(20,48,58,0)');
  g.fillStyle = snowTop; g.fillRect(0, LANE.top - 60, WORLD.w, 70);
  const snowBot = g.createLinearGradient(0, LANE.bot - 10, 0, LANE.bot + 60);
  snowBot.addColorStop(0, 'rgba(20,48,58,0)');
  snowBot.addColorStop(1, 'rgba(8,18,24,.9)');
  g.fillStyle = snowBot; g.fillRect(0, LANE.bot - 10, WORLD.w, 70);

  return c;
}

export function buildMinimapBackground() {
  const w = 300, h = 74;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, w, 0);
  grd.addColorStop(0, 'rgba(58,160,255,.16)');
  grd.addColorStop(.5, 'rgba(70,224,255,.10)');
  grd.addColorStop(1, 'rgba(255,77,94,.16)');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(70,224,255,.28)'; g.lineWidth = 1;
  g.strokeRect(.5, .5, w - 1, h - 1);
  // 桥
  g.fillStyle = 'rgba(140,225,255,.12)';
  g.fillRect(w * (LAYOUT.blue.nexus.x / WORLD.w), h * .3, w * ((LAYOUT.red.nexus.x - LAYOUT.blue.nexus.x) / WORLD.w), h * .4);
  // 中线
  g.strokeStyle = 'rgba(200,169,106,.25)';
  g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
  return c;
}

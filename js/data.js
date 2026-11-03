/* ============================================================
   HEX ARAM · 数据层
   英雄 / 技能 / 装备 / 海克斯强化 / 小兵与建筑
   所有数值单位：距离 px，时间 s，速度 px/s
   ============================================================ */

export const WORLD = {
  w: 6000, h: 1000,
  laneTop: 268, laneBot: 732, mid: 500,
  blueFountain: { x: 210, y: 500 },
  redFountain: { x: 5790, y: 500 },
};

export const TEAM = {
  blue: { id: 'blue', name: '蓝方', color: '#3aa0ff', glow: 'rgba(58,160,255,.55)' },
  red: { id: 'red', name: '红方', color: '#ff4d5e', glow: 'rgba(255,77,94,.55)' },
};

export const GAME = {
  startGold: 1500,
  goldPerSec: 5.4,
  xpShareRadius: 1600,
  respawnBase: 6,
  respawnPerLevel: 1.9,
  waveInterval: 25,
  firstWave: 14,
  towerRange: 820,
  fountainRange: 700,
  snowballRange: 1250,
  flashRange: 420,
  maxLevel: 18,
};

/* 升级所需经验（累计） */
export const XP_TABLE = (() => {
  const t = [0];
  let need = 280;
  for (let i = 1; i <= GAME.maxLevel; i++) { t.push(t[i - 1] + need); need *= 1.19; }
  return t;
})();

/* ---------- 小兵 ---------- */
export const MINIONS = {
  melee: { hp: 400, hpG: 20, ad: 26, adG: 1.6, range: 105, ms: 158, r: 15, gold: 22, xp: 34, atkSpeed: 1.25, armor: 12, mr: 0, color: '#c6d6dd' },
  caster: { hp: 270, hpG: 13, ad: 24, adG: 1.8, range: 340, ms: 148, r: 13, gold: 16, xp: 28, atkSpeed: 1.05, armor: 0, mr: 10, color: '#9fb4ff' },
  cannon: { hp: 820, hpG: 40, ad: 48, adG: 2.8, range: 380, ms: 142, r: 19, gold: 65, xp: 64, atkSpeed: 0.75, armor: 24, mr: 20, color: '#ffd27a' },
  super: { hp: 1600, hpG: 90, ad: 60, adG: 3.5, range: 130, ms: 165, r: 22, gold: 90, xp: 90, atkSpeed: 1.0, armor: 40, mr: 30, color: '#ffb04d' },
};

/* ---------- 建筑 ---------- */
export const STRUCTURES = {
  tower: { hp: 2000, armor: 60, mr: 60, range: 820, atkSpeed: 0.83, dmg: 170, dmgG: 6, r: 62, gold: 150, xp: 120 },
  inhib: { hp: 2400, armor: 50, mr: 50, r: 70, gold: 200, xp: 100 },
  nexus: { hp: 3600, armor: 30, mr: 30, r: 96, gold: 300, xp: 200 },
};

/* ---------- 装备 ---------- */
export const ITEMS = [
  { id: 'longsword', name: '长剑', cost: 350, glyph: '⚔', c1: '#9fb3bd', c2: '#4a5f69', stats: { ad: 12 }, desc: '+12 攻击力' },
  { id: 'tome', name: '增幅典籍', cost: 435, glyph: '✦', c1: '#b78aff', c2: '#5c3aa8', stats: { ap: 25 }, desc: '+25 法术强度' },
  { id: 'ruby', name: '红水晶', cost: 400, glyph: '♥', c1: '#ff8b8b', c2: '#a02d3a', stats: { hp: 180 }, desc: '+180 生命值' },
  { id: 'chain', name: '锁子甲', cost: 800, glyph: '▣', c1: '#a8c0c8', c2: '#4d6670', stats: { armor: 40 }, desc: '+40 护甲' },
  { id: 'cloak', name: '负极斗篷', cost: 720, glyph: '◈', c1: '#8fd0ff', c2: '#2b5d8a', stats: { mr: 40 }, desc: '+40 魔抗' },
  { id: 'boots', name: '狂战士胫甲', cost: 1100, glyph: '➤', c1: '#d8b978', c2: '#7a5f26', stats: { ms: 55, as: 0.25 }, desc: '+55 移速 · +25% 攻速' },
  { id: 'sorc', name: '法师之靴', cost: 1100, glyph: '☄', c1: '#b78aff', c2: '#4a2a8a', stats: { ms: 45, pen: 15 }, desc: '+45 移速 · +15 法穿' },
  { id: 'mercury', name: '水银之靴', cost: 1200, glyph: '⌁', c1: '#9fe8ff', c2: '#2f6f8a', stats: { ms: 45, mr: 25, tenacity: 0.3 }, desc: '+45 移速 · +25 魔抗 · 韧性' },
  { id: 'zhonya', name: '中娅沙漏', cost: 2600, glyph: '⌛', c1: '#ffd27a', c2: '#7a5a1c', stats: { ap: 65, armor: 45 }, desc: '+65 法强 · +45 护甲' },
  { id: 'deathcap', name: '灭世者的死亡之帽', cost: 3400, glyph: '☠', c1: '#c9a6ff', c2: '#3d1f7a', stats: { ap: 120, apPct: 0.3 }, desc: '+120 法强 · 法强提高 30%' },
  { id: 'infinity', name: '无尽之刃', cost: 3300, glyph: '✧', c1: '#ffd27a', c2: '#8a5a10', stats: { ad: 70, crit: 0.35, critDmg: 0.4 }, desc: '+70 攻击力 · 暴击率 · 暴击伤害' },
  { id: 'botrk', name: '破败王者之刃', cost: 3200, glyph: '🗡', c1: '#9fe0b0', c2: '#2f6b45', stats: { ad: 40, as: 0.3, lifesteal: 0.12 }, desc: '+40 攻击力 · +30% 攻速 · 12% 吸血' },
  { id: 'luden', name: '卢登的回声', cost: 3000, glyph: '◎', c1: '#9fd8ff', c2: '#2b5d8a', stats: { ap: 90, mp: 300, haste: 20 }, desc: '+90 法强 · +300 法力 · +20 技能急速' },
  { id: 'sunfire', name: '日炎圣盾', cost: 2800, glyph: '☀', c1: '#ffb066', c2: '#8a3f10', stats: { hp: 450, armor: 50 }, desc: '+450 生命 · +50 护甲 · 灼烧光环' },
  { id: 'spirit', name: '振奋盔甲', cost: 2700, glyph: '✚', c1: '#9fe8c0', c2: '#2f7a5a', stats: { hp: 400, mr: 55, healPct: 0.25 }, desc: '+400 生命 · +55 魔抗 · 治疗增强' },
  { id: 'gargoyle', name: '石像鬼石板甲', cost: 3000, glyph: '▤', c1: '#b9c6cc', c2: '#4a5a63', stats: { hp: 500, armor: 40, mr: 40 }, desc: '+500 生命 · +40 护甲 · +40 魔抗' },
  { id: 'ie2', name: '疾射火炮', cost: 2600, glyph: '➹', c1: '#ffd7a0', c2: '#8a6420', stats: { as: 0.35, crit: 0.2, range: 90 }, desc: '+35% 攻速 · 暴击 · +90 射程' },
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

/* ---------- 海克斯强化 ---------- */
export const AUGMENTS = [
  // 银色
  { id: 'might', name: '力量增幅', rarity: 'silver', icon: '⚔', desc: '攻击力提高 18%。', mods: { adPct: 0.18 } },
  { id: 'arcane', name: '秘法洪流', rarity: 'silver', icon: '✦', desc: '获得 45 法术强度。', mods: { ap: 45 } },
  { id: 'swift', name: '疾风步', rarity: 'silver', icon: '➤', desc: '移动速度提高 12%。', mods: { msPct: 0.12 } },
  { id: 'hands', name: '迅捷之手', rarity: 'silver', icon: '⚡', desc: '攻击速度提高 25%。', mods: { asPct: 0.25 } },
  { id: 'giant', name: '巨人腰带', rarity: 'silver', icon: '♥', desc: '最大生命值提高 350。', mods: { hp: 350 } },
  { id: 'thorns', name: '荆棘之甲', rarity: 'silver', icon: '✹', desc: '+45 护甲；受到普攻时反弹 25 伤害。', mods: { armor: 45 }, hooks: ['thorns'] },
  { id: 'dragon', name: '龙鳞', rarity: 'silver', icon: '◈', desc: '+45 魔抗；受到的魔法伤害降低 8%。', mods: { mr: 45, magicTakenPct: -0.08 } },
  { id: 'vamp', name: '吸血本能', rarity: 'silver', icon: '🩸', desc: '获得 12% 生命偷取。', mods: { lifesteal: 0.12 } },
  // 金色
  { id: 'cold', name: '冷血', rarity: 'gold', icon: '❄', desc: '对生命值低于 40% 的目标造成的伤害提高 25%。', hooks: ['cold'] },
  { id: 'spellvamp', name: '技能吸血', rarity: 'gold', icon: '✧', desc: '技能伤害的 15% 转化为治疗。', mods: { spellvamp: 0.15 } },
  { id: 'exec', name: '处决者', rarity: 'gold', icon: '☠', desc: '普攻对生命低于 12% 的目标直接斩杀（20 秒冷却）。', hooks: ['execute'] },
  { id: 'ember', name: '余烬', rarity: 'gold', icon: '🔥', desc: '技能命中点燃目标 3 秒，每秒造成 2.5% 最大生命魔法伤害。', hooks: ['ember'] },
  { id: 'overclock', name: '超频', rarity: 'gold', icon: '⟳', desc: '技能急速 +35。', mods: { haste: 35 } },
  { id: 'sunder', name: '破甲', rarity: 'gold', icon: '➹', desc: '攻击无视目标 30% 护甲与魔抗。', mods: { penPct: 0.3 } },
  // 棱彩
  { id: 'bulwark', name: '护盾猛击', rarity: 'prismatic', icon: '⛨', desc: '获得护盾时，伤害提高 30%，持续 3 秒。', hooks: ['shieldPower'] },
  { id: 'echo', name: '回响施法', rarity: 'prismatic', icon: '◎', desc: '技能有 45% 概率再次触发一次 45% 效果的施法。', hooks: ['echo'] },
  { id: 'unyield', name: '不屈', rarity: 'prismatic', icon: '✚', desc: '受到致命伤害时免疫死亡 1.5 秒（45 秒冷却）。', hooks: ['unyield'] },
  { id: 'colossus', name: '巨像', rarity: 'prismatic', icon: '▣', desc: '最大生命值提高 25%，并获得 30 韧性。', mods: { hpPct: 0.25, tenacity: 0.3 }, hooks: ['colossus'] },
  { id: 'chrono', name: '时间扭曲', rarity: 'prismatic', icon: '⌛', desc: '终极技能冷却降低 40%；施放终极技能后 3 秒内移速 +50%。', mods: { ultCdr: 0.4 }, hooks: ['chrono'] },
  { id: 'hexcore', name: '海克斯核心', rarity: 'prismatic', icon: '◈', desc: '每 10 秒获得一层海克斯能量：下一次技能伤害 +60%。', hooks: ['hexcore'] },
];

export const AUGMENT_BY_ID = Object.fromEntries(AUGMENTS.map(a => [a.id, a]));
export const RARITY_LABEL = { silver: '银色', gold: '金色', prismatic: '棱彩' };

/* ---------- 英雄 ---------- */
/* 技能 type：
   line / cone / circle / targeted / dash / buff / beam / wall / nova / field  */
export const CHAMPIONS = [
  {
    id: 'ashe', name: '艾希', title: '寒冰射手', role: '射手', tip: '远程消耗与开团，靠普攻和 W 拉扯。',
    palette: { body: '#8fc7e8', trim: '#2f5d7a', hair: '#e8f4ff', weapon: 'bow', skin: '#f3d3b8' },
    stats: { hp: 640, hpG: 96, mp: 300, mpG: 40, ad: 61, adG: 3.2, armor: 26, armorG: 4.2, mr: 30, mrG: 1.4, as: 0.66, asG: 0.035, range: 600, ms: 325, hpRegen: 3.4, mpRegen: 6.5 },
    abilities: [
      { name: '游侠专注', type: 'buff', cd: [16, 14, 12, 10, 8], cost: [40, 40, 40, 40, 40], dur: 5, buff: { as: 0.5 }, desc: '5 秒内攻速提高 50%。' },
      { name: '万箭齐发', type: 'cone', cd: [12, 10.5, 9, 7.5, 6], cost: [60, 65, 70, 75, 80], range: 880, angle: 46, dmg: [30, 50, 70, 90, 110], ratio: 0.95, dmgType: 'phys', cc: { type: 'slow', amt: 0.28, dur: 1.6 }, color: '#9fe0ff', desc: '锥形箭雨，造成物理伤害并减速 28%。' },
      { name: '鹰击长空', type: 'buff', cd: [22, 20, 18, 16, 14], cost: [50, 50, 50, 50, 50], dur: 4, radius: 700, aura: { as: 0.25 }, desc: '全队（700 范围内）攻速提高 25%，持续 4 秒。' },
      { name: '魔法水晶箭', type: 'line', cd: [90, 80, 70], cost: [100, 100, 100], range: 3000, width: 46, speed: 1150, dmg: [220, 350, 480], ratio: 1.0, dmgType: 'magic', cc: { type: 'stun', dur: 2.0 }, color: '#bfe9ff', pierce: false, ult: true, desc: '全图冰箭，命中造成魔法伤害并眩晕 2 秒。' },
    ],
  },
  {
    id: 'ziggs', name: '吉格斯', title: '爆破鬼才', role: '法师', tip: '超远消耗与清线，W 自保位移。',
    palette: { body: '#ffcf7a', trim: '#7a4a12', hair: '#f2f2f2', weapon: 'bomb', skin: '#e8b98f' },
    stats: { hp: 610, hpG: 88, mp: 420, mpG: 52, ad: 54, adG: 2.6, armor: 22, armorG: 3.6, mr: 30, mrG: 1.2, as: 0.64, asG: 0.02, range: 550, ms: 325, hpRegen: 3.2, mpRegen: 8 },
    abilities: [
      { name: '弹跳炸弹', type: 'line', cd: [6, 5.5, 5, 4.5, 4], cost: [50, 55, 60, 65, 70], range: 900, width: 44, speed: 900, dmg: [75, 120, 165, 210, 255], ratio: 0.65, dmgType: 'magic', explode: 150, color: '#ffcf7a', desc: '投掷炸弹，命中或到终点后爆炸。' },
      { name: '定点爆破', type: 'dash', cd: [16, 14, 12, 10, 8], cost: [60, 60, 60, 60, 60], range: 360, radius: 150, dmg: [60, 95, 130, 165, 200], ratio: 0.5, dmgType: 'magic', color: '#ff9a4a', desc: '向目标方向弹射，落地造成范围伤害。' },
      { name: '海克斯雷区', type: 'field', cd: [16, 15, 14, 13, 12], cost: [70, 75, 80, 85, 90], range: 800, radius: 190, dur: 4, tick: 0.5, dmg: [18, 26, 34, 42, 50], ratio: 0.16, dmgType: 'magic', cc: { type: 'slow', amt: 0.3, dur: 0.6 }, color: '#ffb04a', desc: '布雷区持续 4 秒，减速并造成伤害。' },
      { name: '巨型炸弹', type: 'circle', cd: [75, 65, 55], cost: [100, 100, 100], range: 2200, radius: 300, delay: 0.65, dmg: [260, 400, 540], ratio: 0.9, dmgType: 'magic', color: '#ff7a3a', ult: true, desc: '超远距离大范围轰炸。' },
    ],
  },
  {
    id: 'lux', name: '拉克丝', title: '光辉女郎', role: '法师', tip: 'Q 束缚开人，E 消耗，R 收割。',
    palette: { body: '#ffe9a8', trim: '#8a6a1c', hair: '#fff1c4', weapon: 'staff', skin: '#f6d7bd' },
    stats: { hp: 600, hpG: 86, mp: 480, mpG: 55, ad: 54, adG: 2.6, armor: 22, armorG: 3.6, mr: 30, mrG: 1.2, as: 0.62, asG: 0.018, range: 550, ms: 330, hpRegen: 3.2, mpRegen: 8.5 },
    abilities: [
      { name: '光之束缚', type: 'line', cd: [11, 10, 9, 8, 7], cost: [50, 55, 60, 65, 70], range: 1000, width: 48, speed: 1000, dmg: [70, 115, 160, 205, 250], ratio: 0.65, dmgType: 'magic', cc: { type: 'root', dur: 2 }, pierce: 2, color: '#ffe9a8', desc: '命中并束缚最多 2 个敌人 2 秒。' },
      { name: '曲光屏障', type: 'buff', cd: [14, 13, 12, 11, 10], cost: [60, 65, 70, 75, 80], dur: 3, shield: [60, 90, 120, 150, 180], ratio: 0.35, ally: true, radius: 650, color: '#ffe9a8', desc: '为自己与附近队友提供护盾。' },
      { name: '透光奇点', type: 'circle', cd: [10, 9.5, 9, 8.5, 8], cost: [60, 65, 70, 75, 80], range: 900, radius: 200, delay: 0.15, dmg: [60, 105, 150, 195, 240], ratio: 0.6, dmgType: 'magic', cc: { type: 'slow', amt: 0.32, dur: 1.4 }, color: '#ffd77a', desc: '范围伤害并减速。' },
      { name: '终极闪光', type: 'beam', cd: [70, 60, 50], cost: [100, 100, 100], range: 3000, width: 130, dmg: [300, 450, 600], ratio: 1.0, dmgType: 'magic', color: '#fff1c4', ult: true, desc: '瞬间贯穿一条直线，造成大量魔法伤害。' },
    ],
  },
  {
    id: 'jax', name: '贾克斯', title: '武器大师', role: '战士', tip: '近战缠斗，E 反打，R 抗性。',
    palette: { body: '#b8a27a', trim: '#5a4a2a', hair: '#3a3020', weapon: 'lamp', skin: '#c99a72' },
    stats: { hp: 690, hpG: 104, mp: 340, mpG: 42, ad: 65, adG: 3.6, armor: 30, armorG: 4.4, mr: 32, mrG: 1.6, as: 0.68, asG: 0.032, range: 150, ms: 340, hpRegen: 4.2, mpRegen: 7 },
    abilities: [
      { name: '跳斩', type: 'dash', cd: [9, 8, 7, 6, 5], cost: [45, 50, 55, 60, 65], range: 480, radius: 120, dmg: [65, 105, 145, 185, 225], ratio: 0.6, ratioType: 'ad', dmgType: 'phys', targetEnemy: true, color: '#ffd27a', desc: '跃向目标区域（优先敌方英雄），造成物理伤害。' },
      { name: '蓄力一击', type: 'empower', cd: [6, 5.5, 5, 4.5, 4], cost: [40, 40, 40, 40, 40], dmg: [60, 100, 140, 180, 220], ratio: 0.6, dmgType: 'magic', dur: 6, color: '#c9a6ff', desc: '6 秒内下次普攻附带额外魔法伤害。' },
      { name: '反击风暴', type: 'buff', cd: [16, 14, 12, 10, 8], cost: [50, 55, 60, 65, 70], dur: 2, dodge: true, dmgReduce: 0.3, radius: 260, endDmg: [60, 100, 140, 180, 220], ratio: 0.6, cc: { type: 'stun', dur: 1 }, color: '#8fd0ff', desc: '2 秒内闪避普攻并减伤，结束时眩晕周围敌人。' },
      { name: '武器精通', type: 'buff', cd: [70, 60, 50], cost: [80, 80, 80], dur: 8, buff: { armor: 40, mr: 40 }, color: '#ffd27a', ult: true, desc: '8 秒内护甲与魔抗提高 40。' },
    ],
  },
  {
    id: 'alistar', name: '阿利斯塔', title: '牛头酋长', role: '坦克', tip: '开团与保护，R 免伤。',
    palette: { body: '#8a6a52', trim: '#4a2f1e', hair: '#e8d9c0', weapon: 'fists', skin: '#a8805e' },
    stats: { hp: 780, hpG: 118, mp: 320, mpG: 45, ad: 62, adG: 3.4, armor: 34, armorG: 4.8, mr: 34, mrG: 1.8, as: 0.64, asG: 0.022, range: 130, ms: 335, hpRegen: 5, mpRegen: 6 },
    abilities: [
      { name: '大地粉碎', type: 'nova', cd: [12, 11, 10, 9, 8], cost: [55, 60, 65, 70, 75], radius: 320, dmg: [60, 100, 140, 180, 220], ratio: 0.5, dmgType: 'magic', cc: { type: 'knockup', dur: 1 }, color: '#d9b878', desc: '击飞周围敌人 1 秒。' },
      { name: '野蛮冲撞', type: 'dash', cd: [13, 12, 11, 10, 9], cost: [50, 55, 60, 65, 70], range: 620, radius: 140, dmg: [55, 95, 135, 175, 215], ratio: 0.5, dmgType: 'magic', cc: { type: 'slow', amt: 0.4, dur: 1.2 }, targetEnemy: true, color: '#ffd27a', desc: '冲向目标，造成伤害并减速。' },
      { name: '践踏', type: 'field', cd: [14, 13, 12, 11, 10], cost: [50, 55, 60, 65, 70], radius: 240, dur: 4, tick: 0.5, dmg: [22, 30, 38, 46, 54], ratio: 0.15, dmgType: 'magic', self: true, color: '#e8d9c0', desc: '践踏大地，持续伤害周围敌人。' },
      { name: '坚定意志', type: 'buff', cd: [75, 65, 55], cost: [100, 100, 100], dur: 7, dmgReduce: 0.7, cleanse: true, color: '#ffd27a', ult: true, desc: '7 秒内减伤 70% 并解除控制。' },
    ],
  },
  {
    id: 'yasuo', name: '亚索', title: '疾风剑豪', role: '战士', tip: '风墙挡技能，EQ 连招，近身收割。',
    palette: { body: '#3f5d7a', trim: '#1f3040', hair: '#2a2a2a', weapon: 'katana', skin: '#e8c3a0' },
    stats: { hp: 690, hpG: 100, mp: 100, mpG: 0, ad: 67, adG: 3.6, armor: 28, armorG: 4.2, mr: 32, mrG: 1.5, as: 0.72, asG: 0.028, range: 160, ms: 350, hpRegen: 4, mpRegen: 0 },
    abilities: [
      { name: '斩钢闪', type: 'line', cd: [4, 3.7, 3.4, 3.1, 2.8], cost: [0, 0, 0, 0, 0], range: 520, width: 70, speed: 1400, dmg: [20, 40, 60, 80, 100], ratio: 1.0, ratioType: 'ad', dmgType: 'phys', color: '#bfe9ff', desc: '短距离剑气，造成物理伤害。' },
      { name: '风墙', type: 'wall', cd: [20, 18, 16, 14, 12], cost: [0, 0, 0, 0, 0], range: 380, width: 520, dur: 4, color: '#bfe9ff', desc: '在身前生成风墙，阻挡飞行道具 4 秒。' },
      { name: '踏前斩', type: 'dash', cd: [6, 5.5, 5, 4.5, 4], cost: [0, 0, 0, 0, 0], range: 460, radius: 110, dmg: [50, 70, 90, 110, 130], ratio: 0.2, dmgType: 'magic', color: '#9fe0ff', desc: '向目标方向突进并造成伤害。' },
      { name: '狂风绝息斩', type: 'targeted', cd: [70, 60, 50], cost: [0, 0, 0, 0, 0], range: 520, dmg: [220, 360, 500], ratio: 1.5, dmgType: 'phys', cc: { type: 'stun', dur: 0.8 }, airborneBonus: 0.5, color: '#bfe9ff', ult: true, desc: '对目标造成大量物理伤害；若目标浮空则伤害 +50%。' },
    ],
  },
  {
    id: 'ahri', name: '阿狸', title: '九尾妖狐', role: '法师', tip: 'Q 往返消耗，E 魅惑开团，R 位移。',
    palette: { body: '#ff9ec4', trim: '#8a2f5a', hair: '#f6d7e8', weapon: 'orb', skin: '#f3d3b8' },
    stats: { hp: 620, hpG: 90, mp: 400, mpG: 50, ad: 55, adG: 2.8, armor: 24, armorG: 3.8, mr: 30, mrG: 1.3, as: 0.64, asG: 0.02, range: 550, ms: 330, hpRegen: 3.4, mpRegen: 8 },
    abilities: [
      { name: '欺诈宝珠', type: 'line', cd: [8, 7.5, 7, 6.5, 6], cost: [55, 60, 65, 70, 75], range: 900, width: 46, speed: 1050, dmg: [60, 95, 130, 165, 200], ratio: 0.55, dmgType: 'magic', return: true, color: '#9fd8ff', desc: '宝珠飞出并返回，各造成一次伤害。' },
      { name: '妖异狐火', type: 'nova', cd: [9, 8, 7, 6, 5], cost: [45, 50, 55, 60, 65], radius: 640, bolts: 3, boltDelay: 0.18, dmg: [45, 70, 95, 120, 145], ratio: 0.3, dmgType: 'magic', color: '#ff9ec4', desc: '释放 3 团狐火追踪附近敌人。' },
      { name: '魅惑妖术', type: 'line', cd: [14, 13, 12, 11, 10], cost: [60, 65, 70, 75, 80], range: 950, width: 52, speed: 1150, dmg: [60, 95, 130, 165, 200], ratio: 0.5, dmgType: 'magic', cc: { type: 'charm', dur: 1.6 }, color: '#ffb0d0', pierce: false, desc: '命中魅惑 1.6 秒，使目标走向阿狸。' },
      { name: '灵魄突袭', type: 'dash', cd: [80, 70, 60], cost: [100, 100, 100], range: 520, radius: 200, dmg: [150, 240, 330], ratio: 0.5, dmgType: 'magic', color: '#ffd0e8', ult: true, desc: '向前突袭并对沿途敌人造成伤害。' },
    ],
  },
  {
    id: 'sion', name: '赛恩', title: '亡灵战神', role: '坦克', tip: 'Q 蓄力控制，W 护盾爆裂，R 冲锋开团。',
    palette: { body: '#6f7f6a', trim: '#2f3a2a', hair: '#c8c8b0', weapon: 'axe', skin: '#9aa88a' },
    stats: { hp: 820, hpG: 124, mp: 340, mpG: 40, ad: 68, adG: 3.8, armor: 34, armorG: 4.6, mr: 32, mrG: 1.6, as: 0.62, asG: 0.02, range: 175, ms: 330, hpRegen: 5.2, mpRegen: 6 },
    abilities: [
      { name: '残虐猛击', type: 'cone', cd: [10, 9, 8, 7, 6], cost: [45, 50, 55, 60, 65], range: 520, angle: 70, dmg: [90, 140, 190, 240, 290], ratio: 0.9, ratioType: 'ad', dmgType: 'phys', cc: { type: 'stun', dur: 1.1 }, color: '#ffb04a', desc: '挥出巨斧，眩晕锥形范围内敌人。' },
      { name: '灵魂熔炉', type: 'buff', cd: [12, 11, 10, 9, 8], cost: [50, 55, 60, 65, 70], dur: 3, shield: [80, 125, 170, 215, 260], ratio: 0.45, endDmg: [60, 100, 140, 180, 220], radius: 240, color: '#9fe0b0', desc: '获得护盾，结束时爆裂造成范围伤害。' },
      { name: '杀手怒吼', type: 'line', cd: [12, 11, 10, 9, 8], cost: [50, 55, 60, 65, 70], range: 900, width: 60, speed: 1100, dmg: [50, 85, 120, 155, 190], ratio: 0.5, dmgType: 'magic', cc: { type: 'slow', amt: 0.4, dur: 1.5 }, color: '#9fe0b0', desc: '怒吼冲击波，减速 40%。' },
      { name: '无坚不摧', type: 'dash', cd: [90, 75, 60], cost: [100, 100, 100], range: 1400, radius: 180, dmg: [300, 450, 600], ratio: 1.2, ratioType: 'ad', dmgType: 'phys', cc: { type: 'knockup', dur: 0.9 }, color: '#ff9a4a', ult: true, desc: '冲锋并撞飞路径上的敌人。' },
    ],
  },
  {
    id: 'sona', name: '娑娜', title: '琴瑟仙女', role: '辅助', tip: '光环治疗与加速，R 群体眩晕。',
    palette: { body: '#a6e0ff', trim: '#2f6f8a', hair: '#e8f4ff', weapon: 'harp', skin: '#f6d7bd' },
    stats: { hp: 590, hpG: 82, mp: 420, mpG: 55, ad: 52, adG: 2.4, armor: 22, armorG: 3.4, mr: 30, mrG: 1.2, as: 0.62, asG: 0.018, range: 550, ms: 330, hpRegen: 3, mpRegen: 9 },
    abilities: [
      { name: '英勇赞美诗', type: 'nova', cd: [8, 7.5, 7, 6.5, 6], cost: [50, 55, 60, 65, 70], radius: 620, dmg: [50, 80, 110, 140, 170], ratio: 0.45, dmgType: 'magic', color: '#9fd8ff', desc: '对周围敌人造成魔法伤害。' },
      { name: '坚毅咏叹调', type: 'buff', cd: [11, 10, 9, 8, 7], cost: [60, 65, 70, 75, 80], dur: 2, heal: [60, 90, 120, 150, 180], ratio: 0.3, shield: [40, 60, 80, 100, 120], ally: true, radius: 700, color: '#9fe8c0', desc: '治疗并为自己与附近队友提供护盾。' },
      { name: '迅捷奏鸣曲', type: 'buff', cd: [12, 11, 10, 9, 8], cost: [45, 50, 55, 60, 65], dur: 4, aura: { ms: 0.3 }, ally: true, radius: 700, color: '#ffd27a', desc: '全队移速提高 30%，持续 4 秒。' },
      { name: '狂舞终乐章', type: 'line', cd: [90, 75, 60], cost: [100, 100, 100], range: 900, width: 220, speed: 1400, dmg: [150, 240, 330], ratio: 0.5, dmgType: 'magic', cc: { type: 'stun', dur: 1.4 }, pierce: true, color: '#ffd0e8', ult: true, desc: '一道音波，眩晕所有命中敌人。' },
    ],
  },
  {
    id: 'wukong', name: '孙悟空', title: '齐天大圣', role: '战士', tip: 'EQ 突进，W 分身，R 击飞全场。',
    palette: { body: '#c98a4a', trim: '#6a3a16', hair: '#3a2a1a', weapon: 'staff', skin: '#e8c3a0' },
    stats: { hp: 700, hpG: 106, mp: 320, mpG: 40, ad: 66, adG: 3.5, armor: 30, armorG: 4.4, mr: 32, mrG: 1.5, as: 0.66, asG: 0.03, range: 165, ms: 340, hpRegen: 4.4, mpRegen: 6.5 },
    abilities: [
      { name: '粉碎打击', type: 'empower', cd: [7, 6.5, 6, 5.5, 5], cost: [40, 40, 40, 40, 40], dmg: [50, 80, 110, 140, 170], ratio: 0.5, dmgType: 'phys', shred: 0.3, dur: 3, color: '#ffd27a', desc: '下次普攻造成额外伤害并削减 30% 护甲。' },
      { name: '真假猴王', type: 'buff', cd: [18, 16, 14, 12, 10], cost: [50, 50, 50, 50, 50], dur: 1.4, stealth: true, buff: { ms: 0.4 }, color: '#c9a6ff', desc: '短暂隐形并提高 40% 移速。' },
      { name: '腾云突击', type: 'dash', cd: [10, 9, 8, 7, 6], cost: [45, 50, 55, 60, 65], range: 600, radius: 170, dmg: [70, 110, 150, 190, 230], ratio: 0.6, dmgType: 'phys', targetEnemy: true, color: '#ffd27a', desc: '冲向目标并造成范围伤害。' },
      { name: '大闹天宫', type: 'nova', cd: [90, 75, 60], cost: [100, 100, 100], radius: 360, dmg: [150, 240, 330], ratio: 1.0, ratioType: 'ad', dmgType: 'phys', cc: { type: 'knockup', dur: 0.8 }, spin: 1.2, color: '#ffcf7a', ult: true, desc: '旋转金箍棒，击飞周围敌人。' },
    ],
  },
];

export const CHAMP_BY_ID = Object.fromEntries(CHAMPIONS.map(c => [c.id, c]));

/* 名字池（AI 与队友） */
export const SUMMONER_NAMES = [
  '海克斯打工人', '深渊摸鱼王', '雪球投手', '不补刀就送', '符文收藏家', '嚎哭深渊常客',
  '五杀预订', '中路是我家', '强化卡欧皇', '冰桥守门员', '贴脸就秒', '键盘侠本侠',
  '一血先生', '塔下艺术家', '闪现撞墙', '挂机去看海', '手速一米八', '只玩大乱斗'
];

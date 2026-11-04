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
import { KITS } from './kits.js';
import { KITS2 } from './kits2.js';
import { KITS3 } from './kits3.js';
import { KITS4 } from './kits4.js';
import { KITS5 } from './kits5.js';
const KIT_ALL = [...KITS, ...KITS2, ...KITS3, ...KITS4, ...KITS5];

const ROLE_CN = { Marksman: '射手', Mage: '法师', Tank: '坦克', Fighter: '战士', Assassin: '刺客', Support: '辅助' };
const PALETTE = {
  Marksman: { body: '#7fb3c8', trim: '#33586b', hair: '#dff2ff', skin: '#f3d3b8', weapon: 'bow' },
  Mage: { body: '#8e7fc0', trim: '#3c2f66', hair: '#e6dbff', skin: '#f0cdb0', weapon: 'staff' },
  Tank: { body: '#9a8f74', trim: '#4a4030', hair: '#d8cfb8', skin: '#d9b48e', weapon: 'axe' },
  Fighter: { body: '#b8835a', trim: '#5a3620', hair: '#3a2a1a', skin: '#e8c3a0', weapon: 'sword' },
  Assassin: { body: '#7a4a5a', trim: '#361a26', hair: '#2a1a22', skin: '#e0b89c', weapon: 'katana' },
  Support: { body: '#7fb8a0', trim: '#2f5a48', hair: '#e6fff2', skin: '#f1d2b6', weapon: 'harp' },
};

export const CHAMPIONS = KIT_ALL.map((c) => {
  const tag = (c.tags || []).find(t => PALETTE[t]) || 'Fighter';
  const ab = c.abilities.map((a, i) => ({
    ...a,
    color: a.color || (a.dmgType === 'phys' ? '#ffd27a' : a.dmgType === 'true' ? '#ff8080' : '#c9a6ff'),
    ratios: a.ratios || [],
    ratio: a.ratios?.[0]?.coeff || 0,
    ratioType: a.ratios?.[0]?.stat === 'ad' ? 'ad' : 'ap',
    ult: i === 3,
  }));
  return {
    id: c.id, name: c.name, title: c.title,
    role: ROLE_CN[tag] || tag,
    tip: `${c.title} · ${(c.tags || []).map(t => ROLE_CN[t] || t).join(' / ')}`,
    palette: PALETTE[tag],
    icon: c.icon || `./assets/champions/${c.id}.png`,
    stats: c.stats,
    abilities: ab,
  };
});

export const CHAMP_BY_ID = Object.fromEntries(CHAMPIONS.map(c => [c.id, c]));

/* 名字池（AI 与队友） */
export const SUMMONER_NAMES = [
  '海克斯打工人', '深渊摸鱼王', '雪球投手', '不补刀就送', '符文收藏家', '嚎哭深渊常客',
  '五杀预订', '中路是我家', '强化卡欧皇', '冰桥守门员', '贴脸就秒', '键盘侠本侠',
  '一血先生', '塔下艺术家', '闪现撞墙', '挂机去看海', '手速一米八', '只玩大乱斗'
];

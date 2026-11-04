// 第二批英雄：技能级数据（官方 16.21.1 数值口径）
export const KITS2 = [
  {
    id: 'Brand', name: '复仇焰魂', title: '布兰德', tags: ['Mage'],
    stats: { hp: 590, hpG: 102, mp: 469, mpG: 21, ad: 57, adG: 0, armor: 23, armorG: 4.2, mr: 30, mrG: 1.3, as: 0.681, asG: 2.0, range: 550, ms: 330, hpRegen: 5.5, mpRegen: 10.5 },
    abilities: [
      { key: 'Q', name: '火焰烙印', type: 'line', cd: [8, 7.5, 7, 6.5, 6], cost: [50, 50, 50, 50, 50], range: 1050, width: 80, speed: 1300, dmg: [80, 120, 160, 200, 240], ratios: [{ stat: 'ap', coeff: 0.55 }], dmgType: 'magic', cc: { type: 'stun', dur: 1.75 }, color: '#ff8a3a', icon: './assets/spells/BrandQ.png', desc: '火球命中造成魔法伤害并眩晕 1.75 秒。' },
      { key: 'W', name: '烈焰之柱', type: 'circle', cd: [10.5, 10, 9.5, 9, 8.5], cost: [60, 70, 80, 90, 100], range: 900, radius: 250, delay: 0.55, dmg: [75, 120, 165, 210, 255], ratios: [{ stat: 'ap', coeff: 0.7 }], dmgType: 'magic', color: '#ff6a2a', icon: './assets/spells/BrandW.png', desc: '延迟 0.55 秒喷发火柱。' },
      { key: 'E', name: '烈火燃烧', type: 'targeted', cd: [13, 12, 11, 10, 9], cost: [50, 55, 60, 65, 70], range: 625, dmg: [60, 90, 120, 150, 180], ratios: [{ stat: 'ap', coeff: 0.6 }], dmgType: 'magic', color: '#ffa04a', icon: './assets/spells/BrandE.png', desc: '点燃目标，造成魔法伤害。' },
      { key: 'R', name: '烈焰风暴', type: 'nova', cd: [100, 90, 80], cost: [100, 100, 100], range: 750, radius: 340, dmg: [200, 325, 450], ratios: [{ stat: 'ap', coeff: 0.5 }], dmgType: 'magic', ult: true, color: '#ff5a1a', icon: './assets/spells/BrandR.png', desc: '烈焰在敌群中弹跳，造成大范围魔法伤害。' },
    ],
  },
  {
    id: 'Ezreal', name: '探险家', title: '伊泽瑞尔', tags: ['Marksman', 'Mage'],
    stats: { hp: 600, hpG: 102, mp: 375, mpG: 70, ad: 60, adG: 0, armor: 24, armorG: 4.2, mr: 30, mrG: 1.3, as: 0.625, asG: 2.5, range: 550, ms: 325, hpRegen: 4, mpRegen: 8.5 },
    abilities: [
      { key: 'Q', name: '秘术射击', type: 'line', cd: [5.75, 5.5, 5.25, 5, 4.75], cost: [28, 31, 34, 37, 40], range: 1200, width: 80, speed: 2000, dmg: [20, 45, 70, 95, 120], ratios: [{ stat: 'ad', coeff: 1.3 }, { stat: 'ap', coeff: 0.4 }], dmgType: 'phys', color: '#8fe0ff', icon: './assets/spells/EzrealQ.png', desc: '发射能量弹，命中造成物理伤害。' },
      { key: 'W', name: '精华跃动', type: 'line', cd: [8, 8, 8, 8, 8], cost: [50, 50, 50, 50, 50], range: 1200, width: 90, speed: 1700, dmg: [80, 135, 190, 245, 300], ratios: [{ stat: 'ap', coeff: 0.9 }], dmgType: 'magic', color: '#ffe9a8', icon: './assets/spells/EzrealW.png', desc: '发射光球，命中造成魔法伤害。' },
      { key: 'E', name: '奥术跃迁', type: 'dash', cd: [26, 23, 20, 17, 14], cost: [60, 60, 60, 60, 60], range: 450, radius: 0, dmg: [80, 130, 180, 230, 280], ratios: [{ stat: 'ad', coeff: 0.5 }, { stat: 'ap', coeff: 0.75 }], dmgType: 'magic', color: '#9fe0ff', icon: './assets/spells/EzrealE.png', desc: '闪现一段距离并发射能量弹。' },
      { key: 'R', name: '精准弹幕', type: 'beam', cd: [120, 105, 90], cost: [100, 100, 100], range: 3000, width: 160, dmg: [350, 500, 650], ratios: [{ stat: 'ad', coeff: 1.0 }, { stat: 'ap', coeff: 0.9 }], dmgType: 'magic', ult: true, color: '#ffe9a8', icon: './assets/spells/EzrealR.png', desc: '全图能量弹幕，贯穿路径上的敌人。' },
    ],
  },
  {
    id: 'Morgana', name: '堕落天使', title: '莫甘娜', tags: ['Mage', 'Support'],
    stats: { hp: 630, hpG: 104, mp: 340, mpG: 60, ad: 56, adG: 0, armor: 25, armorG: 4.2, mr: 30, mrG: 1.3, as: 0.625, asG: 2.0, range: 450, ms: 335, hpRegen: 5.5, mpRegen: 9 },
    abilities: [
      { key: 'Q', name: '暗之禁锢', type: 'line', cd: [11, 10.5, 10, 9.5, 9], cost: [50, 55, 60, 65, 70], range: 1300, width: 90, speed: 1200, dmg: [80, 135, 190, 245, 300], ratios: [{ stat: 'ap', coeff: 0.9 }], dmgType: 'magic', cc: { type: 'root', dur: 2.5 }, color: '#c9a6ff', icon: './assets/spells/MorganaQ.png', desc: '暗影束缚，禁锢目标 2.5 秒。' },
      { key: 'W', name: '折磨之影', type: 'field', cd: [12, 12, 12, 12, 12], cost: [70, 80, 90, 100, 110], range: 900, radius: 280, dur: 5, tick: 0.5, dmg: [22, 32, 42, 52, 62], ratios: [{ stat: 'ap', coeff: 0.17 }], dmgType: 'magic', color: '#9f7aff', icon: './assets/spells/MorganaW.png', desc: '黑水灼烧 5 秒。' },
      { key: 'E', name: '黑暗之盾', type: 'buff', cd: [26, 23, 20, 17, 14], cost: [60, 60, 60, 60, 60], range: 800, radius: 800, dur: 5, shield: [100, 155, 210, 265, 320], ratios: [{ stat: 'ap', coeff: 0.7 }], ally: true, ccImmune: true, color: '#c9a6ff', icon: './assets/spells/MorganaE.png', desc: '为友军提供护盾并免疫控制 5 秒。' },
      { key: 'R', name: '灵魂镣铐', type: 'nova', cd: [120, 110, 100], cost: [100, 100, 100], radius: 625, dmg: [175, 250, 325], ratios: [{ stat: 'ap', coeff: 0.8 }], dmgType: 'magic', cc: { type: 'stun', dur: 1.5 }, ult: true, color: '#a06bff', icon: './assets/spells/MorganaR.png', desc: '镣铐灼烧附近敌人并眩晕 1.5 秒。' },
    ],
  },
  {
    id: 'Blitzcrank', name: '蒸汽机器人', title: '布里茨', tags: ['Tank', 'Support'],
    stats: { hp: 633, hpG: 109, mp: 267, mpG: 40, ad: 62, adG: 0, armor: 40, armorG: 4.7, mr: 32, mrG: 2.05, as: 0.625, asG: 1.5, range: 125, ms: 325, hpRegen: 8.5, mpRegen: 8.5 },
    abilities: [
      { key: 'Q', name: '火箭抓取', type: 'line', cd: [20, 19, 18, 17, 16], cost: [100, 100, 100, 100, 100], range: 1050, width: 90, speed: 1800, dmg: [80, 130, 180, 230, 280], ratios: [{ stat: 'ap', coeff: 1.0 }], dmgType: 'magic', cc: { type: 'stun', dur: 0.5 }, pull: 120, color: '#8fe0ff', icon: './assets/spells/RocketGrab.png', desc: '钩中第一个敌人，拉到自己面前并眩晕 0.5 秒。' },
      { key: 'W', name: '过载运转', type: 'buff', cd: [15, 15, 15, 15, 15], cost: [0, 0, 0, 0, 0], dur: 4, ms: 0.6, as: 0.3, color: '#ffd27a', icon: './assets/spells/Overdrive.png', desc: '4 秒内移速 +60%、攻速 +30%。' },
      { key: 'E', name: '能量铁拳', type: 'empower', cd: [7, 7, 7, 7, 7], cost: [0, 0, 0, 0, 0], dmg: [60, 90, 120, 150, 180], ratios: [{ stat: 'ad', coeff: 0.5 }], dmgType: 'phys', cc: { type: 'knockup', dur: 1 }, dur: 6, color: '#ffd27a', icon: './assets/spells/PowerFist.png', desc: '下次普攻击飞目标 1 秒。' },
      { key: 'R', name: '静电场', type: 'nova', cd: [60, 45, 30], cost: [100, 100, 100], radius: 600, dmg: [275, 400, 525], ratios: [{ stat: 'ap', coeff: 1.0 }], dmgType: 'magic', cc: { type: 'silence', dur: 0.5 }, ult: true, color: '#9fe0ff', icon: './assets/spells/StaticField.png', desc: '范围爆发并沉默 0.5 秒。' },
    ],
  },
  {
    id: 'Malphite', name: '熔岩巨兽', title: '墨菲特', tags: ['Tank', 'Mage'],
    stats: { hp: 665, hpG: 110, mp: 280, mpG: 40, ad: 62, adG: 0, armor: 37, armorG: 5.0, mr: 32, mrG: 2.05, as: 0.736, asG: 3.0, range: 125, ms: 335, hpRegen: 8.5, mpRegen: 8 },
    abilities: [
      { key: 'Q', name: '地震碎片', type: 'line', cd: [8, 8, 8, 8, 8], cost: [70, 75, 80, 85, 90], range: 625, width: 90, speed: 1400, dmg: [70, 120, 170, 220, 270], ratios: [{ stat: 'ap', coeff: 0.6 }], dmgType: 'magic', cc: { type: 'slow', amt: 0.3, dur: 2.5 }, color: '#c98a4a', icon: './assets/spells/SeismicShard.png', desc: '碎裂岩石，减速 30%。' },
      { key: 'W', name: '花岗岩护盾', type: 'buff', cd: [12, 12, 12, 12, 12], cost: [30, 30, 30, 30, 30], dur: 6, shield: [60, 90, 120, 150, 180], ratios: [{ stat: 'maxHp', coeff: 0.1 }], buff: { armor: 30 }, color: '#ffd27a', icon: './assets/spells/Obduracy.png', desc: '获得护盾与护甲提升。' },
      { key: 'E', name: '大地震颤', type: 'nova', cd: [10, 10, 10, 10, 10], cost: [50, 55, 60, 65, 70], radius: 400, dmg: [60, 95, 130, 165, 200], ratios: [{ stat: 'ap', coeff: 0.6 }], dmgType: 'magic', cc: { type: 'slow', amt: 0.3, dur: 2 }, color: '#c98a4a', icon: './assets/spells/Landslide.png', desc: '震击地面，造成伤害并减速攻速。' },
      { key: 'R', name: '势不可挡', type: 'dash', cd: [130, 105, 80], cost: [100, 100, 100], range: 1000, radius: 300, dmg: [200, 300, 400], ratios: [{ stat: 'ap', coeff: 0.9 }], dmgType: 'magic', cc: { type: 'knockup', dur: 1.5 }, ult: true, color: '#ffb04a', icon: './assets/spells/UFSlash.png', desc: '冲锋撞飞路径上的敌人 1.5 秒。' },
    ],
  },
  {
    id: 'Amumu', name: '殇之木乃伊', title: '阿木木', tags: ['Tank', 'Mage'],
    stats: { hp: 685, hpG: 108, mp: 285, mpG: 40, ad: 53, adG: 0, armor: 33, armorG: 4.7, mr: 32, mrG: 2.05, as: 0.736, asG: 2.0, range: 125, ms: 335, hpRegen: 9, mpRegen: 8.5 },
    abilities: [
      { key: 'Q', name: '绷带牵引', type: 'line', cd: [16, 14, 12, 10, 8], cost: [60, 65, 70, 75, 80], range: 1100, width: 80, speed: 1600, dmg: [80, 130, 180, 230, 280], ratios: [{ stat: 'ap', coeff: 0.7 }], dmgType: 'magic', cc: { type: 'stun', dur: 1 }, pull: 120, color: '#c9b98a', icon: './assets/spells/BandageToss.png', desc: '绷带命中并拉向目标，眩晕 1 秒。' },
      { key: 'W', name: '绝望光环', type: 'field', cd: [1, 1, 1, 1, 1], cost: [8, 8, 8, 8, 8], radius: 300, dur: 3, tick: 0.5, self: true, dmg: [10, 15, 20, 25, 30], ratios: [{ stat: 'maxHp', coeff: 0.012 }], dmgType: 'magic', color: '#c9b98a', icon: './assets/spells/AuraofDespair.png', desc: '持续灼烧周围敌人（按最大生命）。' },
      { key: 'E', name: '愤怒之痛', type: 'nova', cd: [9, 8, 7, 6, 5], cost: [35, 35, 35, 35, 35], radius: 350, dmg: [75, 100, 125, 150, 175], ratios: [{ stat: 'ap', coeff: 0.5 }], dmgType: 'magic', color: '#d9c99a', icon: './assets/spells/Tantrum.png', desc: '范围伤害，被攻击时缩短冷却。' },
      { key: 'R', name: '木乃伊之咒', type: 'nova', cd: [150, 130, 110], cost: [100, 100, 100], radius: 550, dmg: [150, 250, 350], ratios: [{ stat: 'ap', coeff: 0.8 }], dmgType: 'magic', cc: { type: 'root', dur: 2 }, ult: true, color: '#ffd27a', icon: './assets/spells/CurseoftheSadMummy.png', desc: '大范围缠绕，禁锢 2 秒。' },
    ],
  },
  {
    id: 'Veigar', name: '邪恶小法师', title: '维迦', tags: ['Mage'],
    stats: { hp: 570, hpG: 90, mp: 490, mpG: 26, ad: 52, adG: 0, armor: 21, armorG: 4.2, mr: 30, mrG: 1.3, as: 0.625, asG: 2.2, range: 550, ms: 340, hpRegen: 5.5, mpRegen: 8 },
    abilities: [
      { key: 'Q', name: '暗黑祭祀', type: 'line', cd: [6, 6, 6, 6, 6], cost: [40, 45, 50, 55, 60], range: 950, width: 80, speed: 1600, dmg: [80, 120, 160, 200, 240], ratios: [{ stat: 'ap', coeff: 0.6 }], dmgType: 'magic', color: '#c9a6ff', icon: './assets/spells/VeigarBalefulStrike.png', desc: '黑暗法球，命中造成魔法伤害。' },
      { key: 'W', name: '黑暗物质', type: 'circle', cd: [10, 9.5, 9, 8.5, 8], cost: [60, 65, 70, 75, 80], range: 900, radius: 240, delay: 1.1, dmg: [100, 150, 200, 250, 300], ratios: [{ stat: 'ap', coeff: 1.0 }], dmgType: 'magic', color: '#a06bff', icon: './assets/spells/VeigarDarkMatter.png', desc: '延迟 1.1 秒坠落黑暗物质。' },
      { key: 'E', name: '扭曲空间', type: 'circle', cd: [18, 17, 16, 15, 14], cost: [70, 75, 80, 85, 90], range: 700, radius: 320, delay: 0.35, dmg: [80, 120, 160, 200, 240], ratios: [{ stat: 'ap', coeff: 0.6 }], dmgType: 'magic', cc: { type: 'stun', dur: 1.5 }, color: '#9f7aff', icon: './assets/spells/VeigarEventHorizon.png', desc: '空间边界眩晕 1.5 秒。' },
      { key: 'R', name: '能量爆裂', type: 'targeted', cd: [120, 100, 80], cost: [100, 100, 100], range: 650, dmg: [175, 250, 325], ratios: [{ stat: 'ap', coeff: 0.75 }], dmgType: 'magic', ult: true, color: '#c9a6ff', icon: './assets/spells/VeigarR.png', desc: '对目标造成大量魔法伤害。' },
    ],
  },
  {
    id: 'Karthus', name: '死亡颂唱者', title: '卡尔萨斯', tags: ['Mage'],
    stats: { hp: 610, hpG: 100, mp: 467, mpG: 30, ad: 46, adG: 0, armor: 21, armorG: 4.2, mr: 30, mrG: 1.3, as: 0.625, asG: 2.1, range: 450, ms: 335, hpRegen: 6.5, mpRegen: 8 },
    abilities: [
      { key: 'Q', name: '荒芜', type: 'circle', cd: [1, 1, 1, 1, 1], cost: [20, 22, 24, 26, 28], range: 875, radius: 160, delay: 0.5, dmg: [45, 65, 85, 105, 125], ratios: [{ stat: 'ap', coeff: 0.35 }], dmgType: 'magic', color: '#a06bff', icon: './assets/spells/KarthusLayWasteA1.png', desc: '0.5 秒延迟的荒芜爆炸。' },
      { key: 'W', name: '痛苦之墙', type: 'line', cd: [15, 15, 15, 15, 15], cost: [100, 100, 100, 100, 100], range: 1000, width: 110, speed: 1000, dmg: [], ratios: [], dmgType: 'magic', cc: { type: 'slow', amt: 0.7, dur: 3 }, color: '#8f7aff', icon: './assets/spells/KarthusWallOfPain.png', desc: '痛苦之墙减速 70%，持续 3 秒。' },
      { key: 'E', name: '亵渎', type: 'field', cd: [1, 1, 1, 1, 1], cost: [10, 10, 10, 10, 10], radius: 300, dur: 3, tick: 0.25, self: true, dmg: [20, 30, 40, 50, 60], ratios: [{ stat: 'ap', coeff: 0.2 }], dmgType: 'magic', color: '#b08aff', icon: './assets/spells/KarthusDefile.png', desc: '持续灼烧周围敌人。' },
      { key: 'R', name: '安魂曲', type: 'global', cd: [200, 180, 160], cost: [100, 100, 100], range: 3000, dmg: [250, 400, 550], ratios: [{ stat: 'ap', coeff: 0.6 }], dmgType: 'magic', ult: true, color: '#c9a6ff', icon: './assets/spells/KarthusFallenOne.png', desc: '全图所有敌方英雄受到魔法伤害。' },
    ],
  },
];

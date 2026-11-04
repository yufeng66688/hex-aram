// 第五批英雄：技能级数据（官方 16.21.1 数值口径）
export const KITS5 = [
  {
    id: 'Tristana', name: '麦林炮手', title: '崔丝塔娜', tags: ['Marksman', 'Assassin'],
    stats: { hp: 640, hpG: 102, mp: 300, mpG: 32, ad: 60, adG: 0, armor: 30, armorG: 4, mr: 33, mrG: 1.1, as: 0.656, asG: 1.5, range: 550, ms: 325, hpRegen: 4, mpRegen: 7.2 },
    abilities: [
      { key: 'Q', name: '急速射击', type: 'buff', cd: [20, 19, 18, 17, 16], cost: [0, 0, 0, 0, 0], dur: 7, as: 0.6, color: '#9fe0ff', icon: './assets/spells/TristanaQ.png', desc: '7 秒内攻速大幅提升。' },
      { key: 'W', name: '火箭跳跃', type: 'dash', cd: [20, 18, 16, 14, 12], cost: [60, 60, 60, 60, 60], range: 900, radius: 250, dmg: [70, 115, 160, 205, 250], ratios: [{ stat: 'ap', coeff: 0.5 }], dmgType: 'magic', color: '#ffd27a', icon: './assets/spells/TristanaW.png', desc: '跃向目标区域并造成范围魔法伤害。' },
      { key: 'E', name: '爆炸火花', type: 'targeted', cd: [16, 15, 14, 13, 12], cost: [50, 55, 60, 65, 70], range: 550, dmg: [60, 90, 120, 150, 180], ratios: [{ stat: 'ad', coeff: 0.5 }, { stat: 'ap', coeff: 0.5 }], dmgType: 'phys', color: '#ffb04a', icon: './assets/spells/TristanaE.png', desc: '在目标身上放置炸弹。' },
      { key: 'R', name: '毁灭射击', type: 'targeted', cd: [100, 85, 70], cost: [100, 100, 100], range: 550, dmg: [300, 400, 500], ratios: [{ stat: 'ap', coeff: 1.0 }], dmgType: 'magic', cc: { type: 'knockup', dur: 0.6 }, knockback: 500, ult: true, color: '#ffe9a8', icon: './assets/spells/TristanaR.png', desc: '轰飞目标并造成魔法伤害。' },
    ],
  },
  {
    id: 'Lucian', name: '圣枪游侠', title: '卢锡安', tags: ['Marksman'],
    stats: { hp: 641, hpG: 100, mp: 320, mpG: 43, ad: 60, adG: 0, armor: 28, armorG: 4.2, mr: 33, mrG: 1.1, as: 0.638, asG: 2.5, range: 500, ms: 335, hpRegen: 3.75, mpRegen: 7 },
    abilities: [
      { key: 'Q', name: '透体圣光', type: 'line', cd: [9, 8, 7, 6, 5], cost: [50, 55, 60, 65, 70], range: 900, width: 100, speed: 2400, dmg: [95, 150, 205, 260, 315], ratios: [{ stat: 'ad', coeff: 0.75 }, { stat: 'ap', coeff: 0.4 }], dmgType: 'phys', color: '#ffe9a8', icon: './assets/spells/LucianQ.png', desc: '圣光弹，造成物理伤害。' },
      { key: 'W', name: '热诚烈弹', type: 'line', cd: [14, 13, 12, 11, 10], cost: [60, 60, 60, 60, 60], range: 900, width: 100, speed: 1700, dmg: [75, 110, 145, 180, 215], ratios: [{ stat: 'ap', coeff: 0.9 }], dmgType: 'magic', color: '#ffd27a', icon: './assets/spells/LucianW.png', desc: '十字光弹，造成魔法伤害。' },
      { key: 'E', name: '冷酷追击', type: 'dash', cd: [18, 16, 14, 12, 10], cost: [40, 40, 40, 40, 40], range: 400, color: '#9fe0ff', icon: './assets/spells/LucianE.png', desc: '冲刺一段距离。' },
      { key: 'R', name: '圣枪洗礼', type: 'beam', cd: [110, 90, 70], cost: [100, 100, 100], range: 1400, width: 160, dmg: [200, 300, 400], ratios: [{ stat: 'ad', coeff: 0.5 }, { stat: 'ap', coeff: 0.5 }], dmgType: 'phys', ult: true, color: '#ffe9a8', icon: './assets/spells/LucianR.png', desc: '圣光弹幕，贯穿路径。' },
    ],
  },
  {
    id: 'Fizz', name: '潮汐海灵', title: '菲兹', tags: ['Assassin', 'Fighter'],
    stats: { hp: 640, hpG: 106, mp: 317, mpG: 52, ad: 58, adG: 0, armor: 26, armorG: 4.6, mr: 32, mrG: 2.05, as: 0.658, asG: 3.1, range: 175, ms: 335, hpRegen: 8, mpRegen: 6 },
    abilities: [
      { key: 'Q', name: '淘气打击', type: 'dash', cd: [8, 7.5, 7, 6.5, 6], cost: [50, 55, 60, 65, 70], range: 550, dmg: [70, 110, 150, 190, 230], ratios: [{ stat: 'ap', coeff: 0.55 }], dmgType: 'magic', targetEnemy: true, color: '#8fe0ff', icon: './assets/spells/FizzQ.png', desc: '穿过目标造成魔法伤害。' },
      { key: 'W', name: '海石三叉戟', type: 'empower', cd: [7, 7, 7, 7, 7], cost: [30, 30, 30, 30, 30], dmg: [50, 75, 100, 125, 150], ratios: [{ stat: 'ap', coeff: 0.5 }], dmgType: 'magic', dur: 5, color: '#9fe8c0', icon: './assets/spells/FizzW.png', desc: '下次普攻附加魔法伤害。' },
      { key: 'E', name: '古灵/精怪', type: 'dash', cd: [16, 14, 12, 10, 8], cost: [75, 75, 75, 75, 75], range: 400, radius: 220, dmg: [70, 120, 170, 220, 270], ratios: [{ stat: 'ap', coeff: 0.75 }], dmgType: 'magic', color: '#9fe8ff', icon: './assets/spells/FizzE.png', desc: '跃起并砸落，造成范围伤害。' },
      { key: 'R', name: '巨鲨强袭', type: 'line', cd: [100, 85, 70], cost: [100, 100, 100], range: 1300, width: 160, speed: 1300, dmg: [200, 325, 450], ratios: [{ stat: 'ap', coeff: 0.8 }], dmgType: 'magic', cc: { type: 'knockup', dur: 1 }, ult: true, color: '#8fe0ff', icon: './assets/spells/FizzR.png', desc: '巨鲨出击，击飞 1 秒。' },
    ],
  },
  {
    id: 'Zed', name: '影流之主', title: '劫', tags: ['Assassin'],
    stats: { hp: 654, hpG: 99, mp: 200, mpG: 0, ad: 63, adG: 0, armor: 32, armorG: 4.7, mr: 29, mrG: 2.05, as: 0.651, asG: 3.3, range: 125, ms: 345, hpRegen: 7, mpRegen: 50 },
    abilities: [
      { key: 'Q', name: '影奥义！诸刃', type: 'line', cd: [6, 6, 6, 6, 6], cost: [75, 70, 65, 60, 55], range: 900, width: 100, speed: 2400, dmg: [80, 115, 150, 185, 220], ratios: [{ stat: 'ad', coeff: 1.0 }], dmgType: 'phys', pierce: true, color: '#c94a5a', icon: './assets/spells/ZedQ.png', desc: '手里剑，造成物理伤害。' },
      { key: 'W', name: '影奥义！分身', type: 'dash', cd: [20, 19, 18, 17, 16], cost: [40, 40, 40, 40, 40], range: 600, color: '#9f6aff', icon: './assets/spells/ZedW.png', desc: '突进一段距离（影分身）。' },
      { key: 'E', name: '影奥义！鬼斩', type: 'nova', cd: [5, 5, 5, 5, 5], cost: [50, 50, 50, 50, 50], radius: 300, dmg: [70, 95, 120, 145, 170], ratios: [{ stat: 'ad', coeff: 0.8 }], dmgType: 'phys', color: '#c94a5a', icon: './assets/spells/ZedE.png', desc: '影斩周围敌人。' },
      { key: 'R', name: '影奥义！瞬狱影杀阵', type: 'targeted', cd: [120, 100, 80], cost: [0, 0, 0], range: 650, dmg: [150, 225, 300], ratios: [{ stat: 'ad', coeff: 1.0 }], dmgType: 'phys', executeBelow: 0.3, ult: true, color: '#ff4a5a', icon: './assets/spells/ZedR.png', desc: '标记目标，低血时处决。' },
    ],
  },
  {
    id: 'Talon', name: '刀锋之影', title: '泰隆', tags: ['Assassin'],
    stats: { hp: 658, hpG: 109, mp: 400, mpG: 37, ad: 68, adG: 0, armor: 30, armorG: 4.7, mr: 36, mrG: 2.05, as: 0.625, asG: 2.9, range: 125, ms: 335, hpRegen: 8.5, mpRegen: 7.6 },
    abilities: [
      { key: 'Q', name: '诺克萨斯式外交', type: 'dash', cd: [8, 7.5, 7, 6.5, 6], cost: [30, 30, 30, 30, 30], range: 575, dmg: [65, 90, 115, 140, 165], ratios: [{ stat: 'ad', coeff: 1.0 }], dmgType: 'phys', targetEnemy: true, color: '#c94a5a', icon: './assets/spells/TalonQ.png', desc: '突进斩击目标。' },
      { key: 'W', name: '斩草除根', type: 'line', cd: [9, 9, 9, 9, 9], cost: [55, 60, 65, 70, 75], range: 900, width: 120, speed: 1600, dmg: [50, 65, 80, 95, 110], ratios: [{ stat: 'ad', coeff: 0.4 }], dmgType: 'phys', cc: { type: 'slow', amt: 0.4, dur: 1 }, return3: true, color: '#ff7a5a', icon: './assets/spells/TalonW.png', desc: '飞刃往返，减速 40%。' },
      { key: 'E', name: '刺客之道', type: 'dash', cd: [20, 18, 16, 14, 12], cost: [0, 0, 0, 0, 0], range: 700, color: '#9f6aff', icon: './assets/spells/TalonE.png', desc: '翻越地形。' },
      { key: 'R', name: '暗影突袭', type: 'nova', cd: [100, 80, 60], cost: [100, 100, 100], radius: 500, dmg: [90, 135, 180], ratios: [{ stat: 'ad', coeff: 0.8 }], dmgType: 'phys', stealth: true, dur: 2.5, ult: true, color: '#c94a5a', icon: './assets/spells/TalonR.png', desc: '刃环爆发并隐身 2.5 秒。' },
    ],
  },
  {
    id: 'Thresh', name: '魂锁典狱长', title: '锤石', tags: ['Support', 'Tank'],
    stats: { hp: 620, hpG: 120, mp: 274, mpG: 44, ad: 56, adG: 0, armor: 33, armorG: 0, mr: 30, mrG: 1.55, as: 0.625, asG: 3.5, range: 450, ms: 330, hpRegen: 7, mpRegen: 6 },
    abilities: [
      { key: 'Q', name: '死亡判决', type: 'line', cd: [20, 19, 18, 17, 16], cost: [70, 70, 70, 70, 70], range: 1100, width: 90, speed: 1700, dmg: [100, 150, 200, 250, 300], ratios: [{ stat: 'ap', coeff: 0.5 }], dmgType: 'magic', cc: { type: 'stun', dur: 0.5 }, pull: 120, color: '#7fe0c0', icon: './assets/spells/ThreshQ.png', desc: '钩中并拉拽目标，眩晕 0.5 秒。' },
      { key: 'W', name: '魂引之灯', type: 'buff', cd: [22, 21, 20, 19, 18], cost: [50, 55, 60, 65, 70], dur: 4, shield: [60, 90, 120, 150, 180], ratios: [{ stat: 'ap', coeff: 0.5 }], ally: true, radius: 700, color: '#7fe0c0', icon: './assets/spells/ThreshW.png', desc: '为友军提供护盾。' },
      { key: 'E', name: '厄运钟摆', type: 'line', cd: [9, 9, 9, 9, 9], cost: [60, 65, 70, 75, 80], range: 500, width: 220, speed: 2600, dmg: [65, 95, 125, 155, 185], ratios: [{ stat: 'ap', coeff: 0.4 }], dmgType: 'magic', cc: { type: 'knockup', dur: 0.5 }, color: '#9fe0d0', icon: './assets/spells/ThreshE.png', desc: '横扫击飞。' },
      { key: 'R', name: '幽冥监牢', type: 'nova', cd: [150, 120, 90], cost: [100, 100, 100], radius: 450, dmg: [250, 400, 550], ratios: [{ stat: 'ap', coeff: 1.0 }], dmgType: 'magic', cc: { type: 'slow', amt: 0.99, dur: 2 }, ult: true, color: '#7fe0c0', icon: './assets/spells/ThreshRPenta.png', desc: '幽冥监牢，减速 99%。' },
    ],
  },
  {
    id: 'TwistedFate', name: '卡牌大师', title: '崔斯特', tags: ['Mage', 'Marksman'],
    stats: { hp: 604, hpG: 108, mp: 333, mpG: 39, ad: 52, adG: 0, armor: 24, armorG: 4.35, mr: 30, mrG: 1.3, as: 0.625, asG: 2.5, range: 525, ms: 330, hpRegen: 5.5, mpRegen: 8 },
    abilities: [
      { key: 'Q', name: '万能牌', type: 'line', cd: [6, 6, 6, 6, 6], cost: [60, 70, 80, 90, 100], range: 1450, width: 120, speed: 2000, dmg: [60, 105, 150, 195, 240], ratios: [{ stat: 'ad', coeff: 0.6 }, { stat: 'ap', coeff: 0.5 }], dmgType: 'magic', pierce: true, color: '#ffd27a', icon: './assets/spells/WildCards.png', desc: '三张卡牌，贯穿敌人。' },
      { key: 'W', name: '选牌', type: 'targeted', cd: [8, 7.5, 7, 6.5, 6], cost: [50, 55, 60, 65, 70], range: 600, dmg: [50, 75, 100, 125, 150], ratios: [{ stat: 'ap', coeff: 0.5 }], dmgType: 'magic', cc: { type: 'stun', dur: 1.5 }, color: '#ffd27a', icon: './assets/spells/PickACard.png', desc: '黄牌眩晕 1.5 秒。' },
      { key: 'E', name: '卡牌骗术', type: 'buff', cd: [10, 10, 10, 10, 10], cost: [0, 0, 0, 0, 0], dur: 5, as: 0.3, color: '#ffe9a8', icon: './assets/spells/CardmasterStack.png', desc: '5 秒内攻速提升。' },
      { key: 'R', name: '命运', type: 'dash', cd: [180, 150, 120], cost: [100, 100, 100], range: 2500, color: '#ffd27a', icon: './assets/spells/Destiny.png', desc: '传送到远处。' },
    ],
  },
  {
    id: 'Evelynn', name: '痛苦之拥', title: '伊芙琳', tags: ['Assassin', 'Mage'],
    stats: { hp: 642, hpG: 98, mp: 315, mpG: 42, ad: 61, adG: 0, armor: 37, armorG: 4.7, mr: 32, mrG: 2.05, as: 0.667, asG: 2.1, range: 125, ms: 335, hpRegen: 8.5, mpRegen: 8.11 },
    abilities: [
      { key: 'Q', name: '憎恨之刺', type: 'line', cd: [1.5, 1.5, 1.5, 1.5, 1.5], cost: [40, 45, 50, 55, 60], range: 800, width: 80, speed: 2600, dmg: [45, 60, 75, 90, 105], ratios: [{ stat: 'ap', coeff: 0.45 }], dmgType: 'magic', color: '#ff6ab0', icon: './assets/spells/EvelynnQ.png', desc: '荆棘之刺。' },
      { key: 'W', name: '欲望红尘', type: 'targeted', cd: [12, 11, 10, 9, 8], cost: [60, 65, 70, 75, 80], range: 700, dmg: [60, 90, 120, 150, 180], ratios: [{ stat: 'ap', coeff: 0.5 }], dmgType: 'magic', cc: { type: 'charm', dur: 1.5 }, color: '#ff8ac0', icon: './assets/spells/EvelynnW.png', desc: '魅惑目标 1.5 秒。' },
      { key: 'E', name: '鞭笞', type: 'dash', cd: [8, 8, 8, 8, 8], cost: [40, 45, 50, 55, 60], range: 400, dmg: [70, 100, 130, 160, 190], ratios: [{ stat: 'ad', coeff: 0.5 }, { stat: 'ap', coeff: 0.5 }], dmgType: 'magic', color: '#ff6ab0', icon: './assets/spells/EvelynnE.png', desc: '鞭笞目标造成魔法伤害。' },
      { key: 'R', name: '最终抚慰', type: 'nova', cd: [120, 100, 80], cost: [100, 100, 100], radius: 500, dmg: [200, 300, 400], ratios: [{ stat: 'ap', coeff: 0.75 }], dmgType: 'magic', executeBelow: 0.3, ult: true, color: '#ff4a8a', icon: './assets/spells/EvelynnR.png', desc: '处决低血敌人。' },
    ],
  },
];

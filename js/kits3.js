// 第三批英雄：技能级数据（官方 16.21.1 数值口径）
export const KITS3 = [
  {
    id: 'Garen', name: '德玛西亚之力', title: '盖伦', tags: ['Fighter', 'Tank'],
    stats: { hp: 690, hpG: 98, mp: 0, mpG: 0, ad: 69, adG: 0, armor: 38, armorG: 4.2, mr: 32, mrG: 1.55, as: 0.625, asG: 3.65, range: 175, ms: 340, hpRegen: 8, mpRegen: 0 },
    abilities: [
      { key: 'Q', name: '致命打击', type: 'empower', cd: [8, 8, 8, 8, 8], cost: [0, 0, 0, 0, 0], dmg: [30, 60, 90, 120, 150], ratios: [{ stat: 'ad', coeff: 1.4 }], dmgType: 'phys', cc: { type: 'silence', dur: 1.5 }, dur: 4, color: '#ffd27a', icon: './assets/spells/GarenQ.png', desc: '下次普攻造成额外伤害并沉默 1.5 秒。' },
      { key: 'W', name: '勇气', type: 'buff', cd: [18, 17, 16, 15, 14], cost: [0, 0, 0, 0, 0], dur: 3, shield: [60, 90, 120, 150, 180], ratios: [{ stat: 'maxHp', coeff: 0.08 }], buff: { armor: 20, mr: 20 }, color: '#ffd27a', icon: './assets/spells/GarenW.png', desc: '获得护盾与双抗。' },
      { key: 'E', name: '审判', type: 'nova', cd: [9, 8, 7, 6, 5], cost: [0, 0, 0, 0, 0], radius: 325, dmg: [90, 130, 170, 210, 250], ratios: [{ stat: 'ad', coeff: 1.0 }], dmgType: 'phys', color: '#ffd27a', icon: './assets/spells/GarenE.png', desc: '旋转巨剑，对周围敌人造成物理伤害。' },
      { key: 'R', name: '德玛西亚正义', type: 'targeted', cd: [120, 100, 80], cost: [0, 0, 0], range: 400, dmg: [175, 350, 525], ratios: [], dmgType: 'true', executeBelow: 0.3, ult: true, color: '#ffe9a8', icon: './assets/spells/GarenR.png', desc: '真实伤害；目标生命低于 30% 时额外斩杀。' },
    ],
  },
  {
    id: 'Darius', name: '诺克萨斯之手', title: '德莱厄斯', tags: ['Fighter', 'Tank'],
    stats: { hp: 652, hpG: 114, mp: 263, mpG: 58, ad: 64, adG: 0, armor: 37, armorG: 5.2, mr: 32, mrG: 2.05, as: 0.625, asG: 1, range: 175, ms: 340, hpRegen: 10, mpRegen: 6.6 },
    abilities: [
      { key: 'Q', name: '大杀四方', type: 'nova', cd: [9, 8, 7, 6, 5], cost: [30, 30, 30, 30, 30], radius: 425, dmg: [50, 80, 110, 140, 170], ratios: [{ stat: 'ad', coeff: 1.0 }], dmgType: 'phys', heal: [20, 30, 40, 50, 60], color: '#ff9a4a', icon: './assets/spells/DariusCleave.png', desc: '斧刃横扫，命中回复生命。' },
      { key: 'W', name: '致残打击', type: 'empower', cd: [5, 5, 5, 5, 5], cost: [30, 30, 30, 30, 30], dmg: [40, 60, 80, 100, 120], ratios: [{ stat: 'ad', coeff: 0.5 }], dmgType: 'phys', cc: { type: 'slow', amt: 0.9, dur: 1 }, dur: 6, color: '#ff8a3a', icon: './assets/spells/DariusNoxianTacticsONH.png', desc: '下次普攻重击并减速 90%。' },
      { key: 'E', name: '无情铁手', type: 'targeted', cd: [24, 22, 20, 18, 16], cost: [45, 45, 45, 45, 45], range: 550, dmg: [], ratios: [], cc: { type: 'slow', amt: 0.4, dur: 1 }, pull: 120, color: '#ffb066', icon: './assets/spells/DariusAxeGrabCone.png', desc: '把目标拉到身前并减速。' },
      { key: 'R', name: '诺克萨斯断头台', type: 'targeted', cd: [120, 100, 80], cost: [100, 100, 100], range: 460, dmg: [125, 250, 375], ratios: [{ stat: 'ad', coeff: 0.75 }], dmgType: 'true', executeBelow: 0.25, ult: true, color: '#ff5a2a', icon: './assets/spells/DariusExecute.png', desc: '真实伤害；目标低于 25% 生命时额外斩杀。' },
    ],
  },
  {
    id: 'Leona', name: '曙光女神', title: '蕾欧娜', tags: ['Tank', 'Support'],
    stats: { hp: 646, hpG: 101, mp: 302, mpG: 40, ad: 60, adG: 0, armor: 43, armorG: 4.8, mr: 32, mrG: 2.05, as: 0.625, asG: 2.9, range: 125, ms: 335, hpRegen: 8.5, mpRegen: 6 },
    abilities: [
      { key: 'Q', name: '破晓之盾', type: 'empower', cd: [5, 5, 5, 5, 5], cost: [45, 50, 55, 60, 65], dmg: [10, 35, 60, 85, 110], ratios: [{ stat: 'ap', coeff: 0.3 }], dmgType: 'magic', cc: { type: 'stun', dur: 1 }, dur: 6, color: '#ffd27a', icon: './assets/spells/LeonaShieldOfDaybreak.png', desc: '下次普攻眩晕 1 秒。' },
      { key: 'W', name: '日蚀', type: 'buff', cd: [14, 13, 12, 11, 10], cost: [60, 60, 60, 60, 60], dur: 3, shield: [45, 70, 95, 120, 145], ratios: [{ stat: 'ap', coeff: 0.2 }], buff: { armor: 20, mr: 20 }, endDmg: [40, 60, 80, 100, 120], radius: 300, color: '#ffd27a', icon: './assets/spells/LeonaSolarBarrier.png', desc: '获得护盾与双抗，结束时爆裂。' },
      { key: 'E', name: '天顶之刃', type: 'dash', cd: [13, 12, 11, 10, 9], cost: [60, 60, 60, 60, 60], range: 700, radius: 0, dmg: [50, 90, 130, 170, 210], ratios: [{ stat: 'ap', coeff: 0.4 }], dmgType: 'magic', cc: { type: 'root', dur: 1 }, targetEnemy: true, color: '#ffe9a8', icon: './assets/spells/LeonaZenithBlade.png', desc: '突进并禁锢目标 1 秒。' },
      { key: 'R', name: '太阳耀斑', type: 'circle', cd: [90, 80, 70], cost: [100, 100, 100], range: 900, radius: 300, delay: 0.5, dmg: [100, 175, 250], ratios: [{ stat: 'ap', coeff: 0.8 }], dmgType: 'magic', cc: { type: 'stun', dur: 1.5 }, ult: true, color: '#ffd27a', icon: './assets/spells/LeonaSolarFlare.png', desc: '召唤太阳耀斑，眩晕 1.5 秒。' },
    ],
  },
  {
    id: 'Nami', name: '唤潮鲛姬', title: '娜美', tags: ['Support', 'Mage'],
    stats: { hp: 560, hpG: 88, mp: 365, mpG: 43, ad: 54, adG: 0, armor: 29, armorG: 5.2, mr: 30, mrG: 1.3, as: 0.644, asG: 2.61, range: 550, ms: 335, hpRegen: 5.5, mpRegen: 11.5 },
    abilities: [
      { key: 'Q', name: '碧波之牢', type: 'circle', cd: [12, 11, 10, 9, 8], cost: [60, 65, 70, 75, 80], range: 850, radius: 180, delay: 0.35, dmg: [75, 120, 165, 210, 255], ratios: [{ stat: 'ap', coeff: 0.5 }], dmgType: 'magic', cc: { type: 'stun', dur: 1.5 }, color: '#8fe0ff', icon: './assets/spells/NamiQ.png', desc: '水泡眩晕 1.5 秒。' },
      { key: 'W', name: '冲击之潮', type: 'buff', cd: [11, 11, 11, 11, 11], cost: [70, 80, 90, 100, 110], dur: 0, heal: [55, 90, 125, 160, 195], ratios: [{ stat: 'ap', coeff: 0.3 }], ally: true, radius: 700, color: '#9fe8ff', icon: './assets/spells/NamiW.png', desc: '治疗自己与附近友军。' },
      { key: 'E', name: '潮汐之涌', type: 'empower', cd: [11, 11, 11, 11, 11], cost: [55, 60, 65, 70, 75], dmg: [20, 35, 50, 65, 80], ratios: [{ stat: 'ap', coeff: 0.2 }], dmgType: 'magic', cc: { type: 'slow', amt: 0.3, dur: 1.5 }, dur: 6, color: '#9fe8ff', icon: './assets/spells/NamiE.png', desc: '强化普攻并减速。' },
      { key: 'R', name: '怒涛之啸', type: 'line', cd: [120, 100, 80], cost: [100, 100, 100], range: 1200, width: 260, speed: 900, dmg: [150, 250, 350], ratios: [{ stat: 'ap', coeff: 0.6 }], dmgType: 'magic', cc: { type: 'knockup', dur: 0.75 }, pierce: true, ult: true, color: '#bfe9ff', icon: './assets/spells/NamiR.png', desc: '巨浪击飞路径上的敌人。' },
    ],
  },
  {
    id: 'Jinx', name: '暴走萝莉', title: '金克丝', tags: ['Marksman'],
    stats: { hp: 610, hpG: 105, mp: 260, mpG: 50, ad: 59, adG: 0, armor: 26, armorG: 4.2, mr: 33, mrG: 1.1, as: 0.625, asG: 1, range: 525, ms: 325, hpRegen: 3.75, mpRegen: 6.7 },
    abilities: [
      { key: 'Q', name: '枪炮交响曲', type: 'buff', cd: [8, 8, 8, 8, 8], cost: [0, 0, 0, 0, 0], dur: 6, as: 0.3, rangeBonus: 75, color: '#ff9ec4', icon: './assets/spells/JinxQ.png', desc: '6 秒内攻速 +30%、射程 +75。' },
      { key: 'W', name: '震荡电磁波', type: 'line', cd: [8, 7, 6, 5, 4], cost: [50, 55, 60, 65, 70], range: 1450, width: 80, speed: 2200, dmg: [60, 95, 130, 165, 200], ratios: [{ stat: 'ad', coeff: 1.4 }], dmgType: 'phys', cc: { type: 'slow', amt: 0.3, dur: 1.5 }, color: '#ff9ec4', icon: './assets/spells/JinxW.png', desc: '电磁波减速 30%。' },
      { key: 'E', name: '嚼火者手雷', type: 'field', cd: [16, 15, 14, 13, 12], cost: [70, 75, 80, 85, 90], range: 900, radius: 220, dur: 2.5, tick: 0.5, dmg: [70, 110, 150, 190, 230], ratios: [{ stat: 'ap', coeff: 0.7 }], dmgType: 'magic', cc: { type: 'root', dur: 1.5 }, color: '#ffb0c8', icon: './assets/spells/JinxE.png', desc: '手雷陷阱，禁锢 1.5 秒。' },
      { key: 'R', name: '超究极死神飞弹', type: 'line', cd: [85, 65, 45], cost: [100, 100, 100], range: 3000, width: 120, speed: 1500, dmg: [300, 450, 600], ratios: [{ stat: 'ad', coeff: 1.5 }], dmgType: 'phys', executeBelow: 0.25, pierce: false, ult: true, color: '#ff7aa8', icon: './assets/spells/JinxR.png', desc: '全图飞弹；目标低血量时额外斩杀。' },
    ],
  },
  {
    id: 'Caitlyn', name: '皮城女警', title: '凯特琳', tags: ['Marksman'],
    stats: { hp: 580, hpG: 107, mp: 315, mpG: 40, ad: 62, adG: 0, armor: 27, armorG: 4.7, mr: 33, mrG: 1.1, as: 0.681, asG: 4, range: 650, ms: 325, hpRegen: 3.5, mpRegen: 7.4 },
    abilities: [
      { key: 'Q', name: '皮城和平使者', type: 'line', cd: [10, 9, 8, 7, 6], cost: [50, 60, 70, 80, 90], range: 1250, width: 90, speed: 2200, dmg: [50, 90, 130, 170, 210], ratios: [{ stat: 'ad', coeff: 1.3 }], dmgType: 'phys', color: '#8fe0ff', icon: './assets/spells/CaitlynQ.png', desc: '穿透子弹，造成物理伤害。' },
      { key: 'W', name: '约德尔诱捕器', type: 'circle', cd: [12, 11, 10, 9, 8], cost: [20, 20, 20, 20, 20], range: 800, radius: 150, delay: 0.2, dmg: [40, 80, 120, 160, 200], ratios: [{ stat: 'ap', coeff: 0.4 }], dmgType: 'magic', cc: { type: 'root', dur: 1.5 }, color: '#8fe0ff', icon: './assets/spells/CaitlynW.png', desc: '陷阱禁锢 1.5 秒。' },
      { key: 'E', name: '90口径绳网', type: 'dash', cd: [16, 14, 12, 10, 8], cost: [75, 75, 75, 75, 75], range: 400, dmg: [70, 110, 150, 190, 230], ratios: [{ stat: 'ap', coeff: 0.8 }], dmgType: 'magic', cc: { type: 'slow', amt: 0.5, dur: 1 }, color: '#9fe0ff', icon: './assets/spells/CaitlynE.png', desc: '后撤并撒网减速。' },
      { key: 'R', name: '让子弹飞', type: 'targeted', cd: [90, 75, 60], cost: [100, 100, 100], range: 2000, dmg: [300, 500, 700], ratios: [{ stat: 'ad', coeff: 2.0 }], dmgType: 'phys', ult: true, color: '#ffe9a8', icon: './assets/spells/CaitlynR.png', desc: '超远距离狙击。' },
    ],
  },
  {
    id: 'Xerath', name: '远古巫灵', title: '泽拉斯', tags: ['Mage'],
    stats: { hp: 575, hpG: 106, mp: 400, mpG: 22, ad: 55, adG: 0, armor: 22, armorG: 4.7, mr: 30, mrG: 1.3, as: 0.658, asG: 1.36, range: 525, ms: 340, hpRegen: 5.5, mpRegen: 6.85 },
    abilities: [
      { key: 'Q', name: '奥能脉冲', type: 'line', cd: [9, 8, 7, 6, 5], cost: [70, 80, 90, 100, 110], range: 1400, width: 100, speed: 2400, dmg: [70, 110, 150, 190, 230], ratios: [{ stat: 'ap', coeff: 0.85 }], dmgType: 'magic', color: '#b08aff', icon: './assets/spells/XerathArcanopulseChargeUp.png', desc: '奥能光束，造成魔法伤害。' },
      { key: 'W', name: '毁灭之眼', type: 'circle', cd: [14, 13, 12, 11, 10], cost: [80, 90, 100, 110, 120], range: 1000, radius: 240, delay: 0.4, dmg: [60, 95, 130, 165, 200], ratios: [{ stat: 'ap', coeff: 0.6 }], dmgType: 'magic', cc: { type: 'slow', amt: 0.3, dur: 2 }, color: '#c9a6ff', icon: './assets/spells/XerathArcaneBarrage2.png', desc: '毁灭之眼，减速 30%。' },
      { key: 'E', name: '冲击法球', type: 'line', cd: [13, 12.5, 12, 11.5, 11], cost: [60, 65, 70, 75, 80], range: 1100, width: 90, speed: 2000, dmg: [70, 100, 130, 160, 190], ratios: [{ stat: 'ap', coeff: 0.45 }], dmgType: 'magic', cc: { type: 'stun', dur: 1.5 }, color: '#c9a6ff', icon: './assets/spells/XerathMageSpear.png', desc: '法球眩晕 1.5 秒。' },
      { key: 'R', name: '秘奥侵蚀', type: 'circle', cd: [120, 100, 80], cost: [100, 100, 100], range: 2200, radius: 320, delay: 0.5, dmg: [450, 600, 750], ratios: [{ stat: 'ap', coeff: 1.2 }], dmgType: 'magic', ult: true, color: '#b08aff', icon: './assets/spells/XerathLocusOfPower2.png', desc: '超远距离奥能轰击。' },
    ],
  },
  {
    id: 'Velkoz', name: '虚空之眼', title: '维克兹', tags: ['Mage'],
    stats: { hp: 590, hpG: 102, mp: 469, mpG: 21, ad: 55, adG: 0, armor: 22, armorG: 4.7, mr: 30, mrG: 1.3, as: 0.643, asG: 1.59, range: 525, ms: 340, hpRegen: 5.5, mpRegen: 8 },
    abilities: [
      { key: 'Q', name: '等离子裂变', type: 'line', cd: [7, 6.5, 6, 5.5, 5], cost: [50, 55, 60, 65, 70], range: 1050, width: 80, speed: 1600, dmg: [80, 120, 160, 200, 240], ratios: [{ stat: 'ap', coeff: 0.6 }], dmgType: 'magic', color: '#b08aff', icon: './assets/spells/VelkozQ.png', desc: '等离子射线。' },
      { key: 'W', name: '虚空裂隙', type: 'line', cd: [10, 9.5, 9, 8.5, 8], cost: [50, 55, 60, 65, 70], range: 1000, width: 120, speed: 1400, dmg: [75, 120, 165, 210, 255], ratios: [{ stat: 'ap', coeff: 0.25 }], dmgType: 'magic', color: '#9f7aff', icon: './assets/spells/VelkozW.png', desc: '虚空裂隙，造成魔法伤害。' },
      { key: 'E', name: '构造分解', type: 'circle', cd: [12, 11.5, 11, 10.5, 10], cost: [60, 70, 80, 90, 100], range: 800, radius: 200, delay: 0.35, dmg: [70, 100, 130, 160, 190], ratios: [{ stat: 'ap', coeff: 0.3 }], dmgType: 'magic', cc: { type: 'knockup', dur: 0.75 }, color: '#c9a6ff', icon: './assets/spells/VelkozE.png', desc: '击飞目标 0.75 秒。' },
      { key: 'R', name: '生命形态瓦解射线', type: 'beam', cd: [120, 100, 80], cost: [100, 100, 100], range: 1550, width: 200, dmg: [450, 700, 950], ratios: [{ stat: 'ap', coeff: 1.25 }], dmgType: 'magic', ult: true, color: '#d7a6ff', icon: './assets/spells/VelkozR.png', desc: '持续瓦解射线。' },
    ],
  },
];

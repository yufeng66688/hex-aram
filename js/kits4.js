// 第四批英雄：技能级数据（官方 16.21.1 数值口径）
export const KITS4 = [
  {
    id: 'Annie', name: '黑暗之女', title: '安妮', tags: ['Mage'],
    stats: { hp: 560, hpG: 96, mp: 418, mpG: 25, ad: 50, adG: 0, armor: 23, armorG: 4, mr: 30, mrG: 1.3, as: 0.61, asG: 1.36, range: 625, ms: 335, hpRegen: 5.5, mpRegen: 8 },
    abilities: [
      { key: 'Q', name: '瓦解', type: 'targeted', cd: [4, 4, 4, 4, 4], cost: [60, 65, 70, 75, 80], range: 625, dmg: [80, 115, 150, 185, 220], ratios: [{ stat: 'ap', coeff: 0.8 }], dmgType: 'magic', color: '#ff9a4a', icon: './assets/spells/AnnieQ.png', desc: '火球，造成魔法伤害。' },
      { key: 'W', name: '焚烧', type: 'cone', cd: [8, 7.5, 7, 6.5, 6], cost: [70, 80, 90, 100, 110], range: 600, angle: 50, dmg: [70, 115, 160, 205, 250], ratios: [{ stat: 'ap', coeff: 0.85 }], dmgType: 'magic', color: '#ff6a2a', icon: './assets/spells/AnnieW.png', desc: '锥形火焰。' },
      { key: 'E', name: '熔岩护盾', type: 'buff', cd: [14, 13, 12, 11, 10], cost: [40, 40, 40, 40, 40], dur: 3, shield: [60, 90, 120, 150, 180], ratios: [{ stat: 'ap', coeff: 0.4 }], ms: 0.2, color: '#ffb04a', icon: './assets/spells/AnnieE.png', desc: '获得护盾与移速。' },
      { key: 'R', name: '提伯斯之怒', type: 'nova', cd: [120, 100, 80], cost: [100, 100, 100], radius: 600, dmg: [150, 275, 400], ratios: [{ stat: 'ap', coeff: 0.65 }], dmgType: 'magic', cc: { type: 'stun', dur: 1.25 }, ult: true, color: '#ff7a3a', icon: './assets/spells/AnnieR.png', desc: '召唤提伯斯，范围眩晕 1.25 秒。' },
    ],
  },
  {
    id: 'Katarina', name: '不祥之刃', title: '卡特琳娜', tags: ['Assassin', 'Mage'],
    stats: { hp: 672, hpG: 108, mp: 0, mpG: 0, ad: 58, adG: 0, armor: 32, armorG: 4.7, mr: 32, mrG: 2.05, as: 0.658, asG: 2.74, range: 125, ms: 335, hpRegen: 7.5, mpRegen: 0 },
    abilities: [
      { key: 'Q', name: '弹跳之刃', type: 'targeted', cd: [11, 10, 9, 8, 7], cost: [0, 0, 0, 0, 0], range: 625, dmg: [75, 115, 155, 195, 235], ratios: [{ stat: 'ap', coeff: 0.3 }], dmgType: 'magic', color: '#ff5a8a', icon: './assets/spells/KatarinaQ.png', desc: '投掷匕首，造成魔法伤害。' },
      { key: 'W', name: '备战', type: 'nova', cd: [15, 14, 13, 12, 11], cost: [0, 0, 0, 0, 0], radius: 350, dmg: [40, 70, 100, 130, 160], ratios: [{ stat: 'ad', coeff: 0.6 }, { stat: 'ap', coeff: 0.3 }], dmgType: 'phys', color: '#ff7aa8', icon: './assets/spells/KatarinaW.png', desc: '旋转匕首，造成物理伤害。' },
      { key: 'E', name: '瞬步', type: 'dash', cd: [14, 13, 12, 11, 10], cost: [0, 0, 0, 0, 0], range: 725, dmg: [30, 55, 80, 105, 130], ratios: [{ stat: 'ap', coeff: 0.4 }], dmgType: 'magic', color: '#ff9ec4', icon: './assets/spells/KatarinaEWrapper.png', desc: '瞬移到目标附近。' },
      { key: 'R', name: '死亡莲华', type: 'field', cd: [90, 75, 60], cost: [0, 0, 0], radius: 550, dur: 3, tick: 0.25, self: true, dmg: [25, 38, 50], ratios: [{ stat: 'ad', coeff: 0.19 }, { stat: 'ap', coeff: 0.11 }], dmgType: 'phys', ult: true, color: '#ff4d7a', icon: './assets/spells/KatarinaR.png', desc: '3 秒刃舞，持续伤害附近敌人。' },
    ],
  },
  {
    id: 'Akali', name: '离群之刺', title: '阿卡丽', tags: ['Assassin', 'Fighter'],
    stats: { hp: 600, hpG: 119, mp: 200, mpG: 0, ad: 62, adG: 0, armor: 23, armorG: 4.7, mr: 37, mrG: 2.05, as: 0.625, asG: 3.2, range: 125, ms: 345, hpRegen: 9, mpRegen: 50 },
    abilities: [
      { key: 'Q', name: '我流奥义！寒影', type: 'line', cd: [1.5, 1.5, 1.5, 1.5, 1.5], cost: [130, 130, 130, 130, 130], range: 550, width: 100, speed: 2200, dmg: [45, 70, 95, 120, 145], ratios: [{ stat: 'ad', coeff: 0.6 }, { stat: 'ap', coeff: 0.6 }], dmgType: 'magic', color: '#8fe0ff', icon: './assets/spells/AkaliQ.png', desc: '苦无斩击。' },
      { key: 'W', name: '我流奥义！霞阵', type: 'buff', cd: [20, 19, 18, 17, 16], cost: [0, 0, 0, 0, 0], dur: 4, stealth: true, ms: 0.4, color: '#7fd0c0', icon: './assets/spells/AkaliW.png', desc: '进入霞阵，隐形并加速 4 秒。' },
      { key: 'E', name: '我流奥义！隼舞', type: 'dash', cd: [16, 14.5, 13, 11.5, 10], cost: [30, 30, 30, 30, 30], range: 700, dmg: [60, 90, 120, 150, 180], ratios: [{ stat: 'ad', coeff: 0.4 }], dmgType: 'phys', color: '#9fe0ff', icon: './assets/spells/AkaliE.png', desc: '后空翻并掷出苦无。' },
      { key: 'R', name: '我流秘奥义！表里杀缭乱', type: 'dash', cd: [120, 90, 60], cost: [100, 100, 100], range: 675, dmg: [110, 165, 220], ratios: [{ stat: 'ap', coeff: 0.3 }], dmgType: 'magic', executeBelow: 0.3, ult: true, color: '#ff9ec4', icon: './assets/spells/AkaliR.png', desc: '突进斩杀，低血目标额外处决。' },
    ],
  },
  {
    id: 'Riven', name: '放逐之刃', title: '锐雯', tags: ['Fighter', 'Assassin'],
    stats: { hp: 630, hpG: 100, mp: 0, mpG: 0, ad: 64, adG: 0, armor: 33, armorG: 4.4, mr: 32, mrG: 2.05, as: 0.625, asG: 3.5, range: 125, ms: 340, hpRegen: 8.5, mpRegen: 0 },
    abilities: [
      { key: 'Q', name: '折翼之舞', type: 'line', cd: [13, 13, 13, 13, 13], cost: [0, 0, 0, 0, 0], range: 300, width: 120, speed: 2600, dmg: [15, 35, 55, 75, 95], ratios: [{ stat: 'ad', coeff: 0.6 }], dmgType: 'phys', color: '#9fe0ff', icon: './assets/spells/RivenTriCleave.png', desc: '三段斩击，第三段击飞。' },
      { key: 'W', name: '震魂怒吼', type: 'nova', cd: [11, 10, 9, 8, 7], cost: [0, 0, 0, 0, 0], radius: 260, dmg: [50, 80, 110, 140, 170], ratios: [{ stat: 'ad', coeff: 1.0 }], dmgType: 'phys', cc: { type: 'stun', dur: 0.75 }, color: '#ffd27a', icon: './assets/spells/RivenMartyr.png', desc: '怒吼眩晕 0.75 秒。' },
      { key: 'E', name: '勇往直前', type: 'dash', cd: [10, 9, 8, 7, 6], cost: [0, 0, 0, 0, 0], range: 250, shield: [60, 75, 90, 105, 120], ratios: [{ stat: 'ad', coeff: 1.0 }], dmgType: 'phys', color: '#bfe9ff', icon: './assets/spells/RivenFeint.png', desc: '突进并获得护盾。' },
      { key: 'R', name: '放逐之锋', type: 'cone', cd: [120, 90, 60], cost: [0, 0, 0], range: 600, angle: 45, dmg: [100, 175, 250], ratios: [{ stat: 'ad', coeff: 0.6 }], dmgType: 'phys', ult: true, color: '#bfe9ff', icon: './assets/spells/RivenFengShuiEngine.png', desc: '释放剑气，造成大量物理伤害。' },
    ],
  },
  {
    id: 'Vayne', name: '暗夜猎手', title: '薇恩', tags: ['Marksman', 'Assassin'],
    stats: { hp: 580, hpG: 98, mp: 232, mpG: 35, ad: 60, adG: 0, armor: 23, armorG: 4.6, mr: 33, mrG: 1.1, as: 0.658, asG: 2.8, range: 550, ms: 330, hpRegen: 5.5, mpRegen: 7 },
    abilities: [
      { key: 'Q', name: '闪避突袭', type: 'dash', cd: [4, 4, 4, 4, 4], cost: [30, 30, 30, 30, 30], range: 300, dmg: [], ratios: [], color: '#c9a6ff', icon: './assets/spells/VayneTumble.png', desc: '翻滚一段距离。' },
      { key: 'W', name: '圣银弩箭', type: 'buff', cd: [1, 1, 1, 1, 1], cost: [0, 0, 0, 0, 0], dur: 0, color: '#c9a6ff', icon: './assets/spells/VayneSilveredBolts.png', desc: '被动：每第三次普攻造成真实伤害。' },
      { key: 'E', name: '恶魔审判', type: 'line', cd: [16, 14, 12, 10, 8], cost: [90, 90, 90, 90, 90], range: 550, width: 100, speed: 2400, dmg: [50, 85, 120, 155, 190], ratios: [{ stat: 'ad', coeff: 0.5 }], dmgType: 'phys', cc: { type: 'knockup', dur: 0.5 }, color: '#c9a6ff', icon: './assets/spells/VayneCondemn.png', desc: '击退并造成物理伤害。' },
      { key: 'R', name: '终极时刻', type: 'buff', cd: [100, 85, 70], cost: [80, 80, 80], dur: 8, ad: 30, ms: 0.2, color: '#c9a6ff', icon: './assets/spells/VayneInquisition.png', desc: '8 秒内攻击力与移速提升。' },
    ],
  },
  {
    id: 'Draven', name: '荣耀行刑官', title: '德莱文', tags: ['Marksman'],
    stats: { hp: 675, hpG: 104, mp: 361, mpG: 39, ad: 64, adG: 0, armor: 29, armorG: 4.5, mr: 33, mrG: 1.1, as: 0.679, asG: 2.7, range: 550, ms: 330, hpRegen: 3.75, mpRegen: 8.05 },
    abilities: [
      { key: 'Q', name: '旋转飞斧', type: 'empower', cd: [12, 11, 10, 9, 8], cost: [45, 45, 45, 45, 45], dmg: [35, 45, 55, 65, 75], ratios: [{ stat: 'ad', coeff: 0.85 }], dmgType: 'phys', dur: 6, color: '#ffb04a', icon: './assets/spells/DravenSpinning.png', desc: '下次普攻附加旋转飞斧伤害。' },
      { key: 'W', name: '血性冲刺', type: 'buff', cd: [12, 12, 12, 12, 12], cost: [40, 40, 40, 40, 40], dur: 3, ms: 0.5, as: 0.3, color: '#ffd27a', icon: './assets/spells/DravenFury.png', desc: '3 秒内移速与攻速提升。' },
      { key: 'E', name: '开道利斧', type: 'line', cd: [18, 17, 16, 15, 14], cost: [70, 70, 70, 70, 70], range: 1050, width: 120, speed: 1600, dmg: [75, 110, 145, 180, 215], ratios: [{ stat: 'ad', coeff: 0.5 }], dmgType: 'phys', cc: { type: 'knockup', dur: 0.5 }, color: '#ffb04a', icon: './assets/spells/DravenDoubleShot.png', desc: '掷出利斧，击退并减速。' },
      { key: 'R', name: '冷血追命', type: 'line', cd: [100, 80, 60], cost: [100, 100, 100], range: 3000, width: 140, speed: 2000, dmg: [175, 275, 375], ratios: [{ stat: 'ad', coeff: 1.0 }], dmgType: 'phys', pierce: true, ult: true, color: '#ff9a4a', icon: './assets/spells/DravenRCast.png', desc: '全图飞斧，贯穿敌人。' },
    ],
  },
  {
    id: 'Aatrox', name: '暗裔剑魔', title: '亚托克斯', tags: ['Fighter', 'Tank'],
    stats: { hp: 650, hpG: 114, mp: 0, mpG: 0, ad: 60, adG: 0, armor: 38, armorG: 4.8, mr: 32, mrG: 2.05, as: 0.651, asG: 2.5, range: 175, ms: 345, hpRegen: 3, mpRegen: 0 },
    abilities: [
      { key: 'Q', name: '暗裔利刃', type: 'cone', cd: [14, 12, 10, 8, 6], cost: [0, 0, 0, 0, 0], range: 500, angle: 60, dmg: [70, 110, 150, 190, 230], ratios: [{ stat: 'ad', coeff: 0.6 }], dmgType: 'phys', cc: { type: 'knockup', dur: 0.5 }, color: '#ff5a4a', icon: './assets/spells/AatroxQ.png', desc: '巨剑下劈，击飞 0.5 秒。' },
      { key: 'W', name: '恶火束链', type: 'targeted', cd: [18, 17, 16, 15, 14], cost: [0, 0, 0, 0, 0], range: 825, dmg: [50, 80, 110, 140, 170], ratios: [{ stat: 'ap', coeff: 0.4 }], dmgType: 'magic', cc: { type: 'slow', amt: 0.4, dur: 1.5 }, pull: 120, color: '#ff7a5a', icon: './assets/spells/AatroxW.png', desc: '锁链拉拽并减速。' },
      { key: 'E', name: '暗影冲决', type: 'dash', cd: [9, 8, 7, 6, 5], cost: [0, 0, 0, 0, 0], range: 400, dmg: [40, 60, 80, 100, 120], ratios: [{ stat: 'ad', coeff: 0.4 }], dmgType: 'phys', color: '#c94a4a', icon: './assets/spells/AatroxE.png', desc: '向前突进。' },
      { key: 'R', name: '大灭', type: 'buff', cd: [120, 100, 80], cost: [0, 0, 0], dur: 10, ad: 40, heal: [100, 150, 200], ms: 0.3, ult: true, color: '#ff4a3a', icon: './assets/spells/AatroxR.png', desc: '10 秒内攻击力、移速提升并回复生命。' },
    ],
  },
  {
    id: 'Kaisa', name: '虚空之女', title: '卡莎', tags: ['Marksman', 'Mage'],
    stats: { hp: 640, hpG: 102, mp: 345, mpG: 40, ad: 59, adG: 0, armor: 25, armorG: 4.2, mr: 33, mrG: 1.1, as: 0.644, asG: 1.8, range: 525, ms: 335, hpRegen: 4, mpRegen: 8.2 },
    abilities: [
      { key: 'Q', name: '艾卡西亚暴雨', type: 'nova', cd: [8, 7.5, 7, 6.5, 6], cost: [55, 55, 55, 55, 55], radius: 600, bolts: 6, dmg: [60, 90, 120, 150, 180], ratios: [{ stat: 'ad', coeff: 0.3 }, { stat: 'ap', coeff: 0.2 }], dmgType: 'magic', color: '#b08aff', icon: './assets/spells/KaisaQ.png', desc: '6 枚导弹轰击附近敌人。' },
      { key: 'W', name: '虚空索敌', type: 'line', cd: [14, 13, 12, 11, 10], cost: [55, 60, 65, 70, 75], range: 1300, width: 90, speed: 2000, dmg: [70, 110, 150, 190, 230], ratios: [{ stat: 'ad', coeff: 0.6 }, { stat: 'ap', coeff: 0.6 }], dmgType: 'magic', color: '#c9a6ff', icon: './assets/spells/KaisaW.png', desc: '虚空能量，造成魔法伤害。' },
      { key: 'E', name: '极限超载', type: 'dash', cd: [12, 11.5, 11, 10.5, 10], cost: [30, 30, 30, 30, 30], range: 400, as: 0.4, dur: 4, color: '#9fe0ff', icon: './assets/spells/KaisaE.png', desc: '突进并短暂提升攻速。' },
      { key: 'R', name: '猎手本能', type: 'dash', cd: [120, 100, 80], cost: [100, 100, 100], range: 900, shield: [75, 125, 175], ratios: [{ stat: 'ap', coeff: 0.5 }], dmgType: 'magic', ult: true, color: '#c9a6ff', icon: './assets/spells/KaisaR.png', desc: '突进并获得护盾。' },
    ],
  },
];

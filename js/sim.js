/* ============================================================
   模拟核心：单位 / 技能 / 普攻 / 兵线 / 建筑 / 经济 / 强化
   纯逻辑，不接触 DOM 与画面。
   ============================================================ */
import {
  WORLD, TEAM, GAME, XP_TABLE, MINIONS, STRUCTURES, ITEM_BY_ID, AUGMENT_BY_ID,
} from './data.js';
import { LAYOUT, clampToLane, mulberry32, inBrush } from './map.js';

let NEXT_ID = 1;
const TAU = Math.PI * 2;

export const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }
export function angleDiff(a, b) { let d = ((b - a + Math.PI) % TAU) - Math.PI; return d < -Math.PI ? d + TAU : d; }

export function statValue(champ, stat) {
  const st = champ.stats || champ;
  switch (stat) {
    case 'ad': return st.ad || 0;
    case 'bonusAd': return Math.max(0, (st.ad || 0) - (champ.def?.stats?.ad || 0));
    case 'maxHp': return champ.maxHp || 0;
    case 'bonusHp': return Math.max(0, (champ.maxHp || 0) - (champ.def?.stats?.hp || 0));
    case 'armor': return st.armor || 0;
    case 'mr': return st.mr || 0;
    default: return st.ap || 0;
  }
}

export function abilityAmount(champ, ab, rank, field = 'dmg') {
  const arr = ab[field];
  let v = 0;
  if (Array.isArray(arr) && arr.length) v += arr[Math.min(rank - 1, arr.length - 1)] || 0;
  else if (field === 'dmg') v += 0;
  if (field === 'dmg' || field === 'shield' || field === 'heal') {
    for (const r of ab.ratios || []) v += (r.coeff || 0) * statValue(champ, r.stat);
    if (ab.ratio && !(ab.ratios || []).length) {
      v += ab.ratio * statValue(champ, ab.ratioType === 'ad' ? 'ad' : ab.ratioType === 'maxHp' ? 'maxHp' : 'ap');
    }
  }
  return v;
}

/* ------------------------------------------------------------ */
class Unit {
  constructor(game, kind, team, x, y, r) {
    this.id = NEXT_ID++;
    this.game = game;
    this.kind = kind;
    this.team = team;
    this.x = x; this.y = y;
    this.r = r;
    this.alive = true;
    this.hp = 1; this.maxHp = 1;
    this.shield = 0;
    this.buffs = [];
    this.facing = team === 'blue' ? 0 : Math.PI;
    this.flash = 0;
    this.hitTimer = 0;
    this.inBrush = null;
    this.hidden = false;
    this.revealT = 0;
  }
  get aliveEnemy() { return this.alive; }
  addBuff(b) {
    const exist = this.buffs.find(x => x.id === b.id && x.source === b.source);
    if (exist) { exist.t = Math.max(exist.t, b.t); exist.stacks = Math.min((exist.stacks || 1) + 1, b.maxStacks || 1); return exist; }
    b.maxStacks = b.maxStacks || 1; b.stacks = 1;
    this.buffs.push(b);
    return b;
  }
  hasBuff(type) { return this.buffs.some(b => b[type]); }
  ccState() {
    let stun = 0, root = 0, charm = null, slow = 0, silence = 0, knockup = 0, stealth = 0, dmgReduce = 0, asBuff = 0, msBuff = 0, shred = 0, taunt = null;
    for (const b of this.buffs) {
      if (b.stun) stun = Math.max(stun, b.t);
      if (b.root) root = Math.max(root, b.t);
      if (b.knockup) knockup = Math.max(knockup, b.t);
      if (b.silence) silence = Math.max(silence, b.t);
      if (b.slow) slow = Math.max(slow, b.slow);
      if (b.charm) charm = b;
      if (b.stealth) stealth = Math.max(stealth, b.t);
      if (b.dmgReduce) dmgReduce = Math.max(dmgReduce, b.dmgReduce);
      if (b.as) asBuff += b.as;
      if (b.ms) msBuff += b.ms;
      if (b.shred) shred = Math.max(shred, b.shred);
    }
    return { stun, root, charm, slow, silence, knockup: Math.max(stun, knockup), stealth, dmgReduce, asBuff, msBuff, shred };
  }
  cleanse() { this.buffs = this.buffs.filter(b => !(b.stun || b.root || b.slow || b.charm || b.silence || b.knockup || b.taunt)); }
  updateBuffs(dt) {
    for (const b of this.buffs) {
      b.t -= dt;
      if (b.dot) {
        b.dotAcc = (b.dotAcc || 0) + dt;
        if (b.dotAcc >= (b.dotTick || 0.5)) {
          b.dotAcc -= (b.dotTick || 0.5);
          this.game.damage(b.source, this, b.dot, 'magic', { silent: true, isDot: true });
        }
      }
    }
    const expired = this.buffs.filter(b => b.t <= 0);
    for (const b of expired) {
      if (b.onExpire) b.onExpire(this, b);
    }
    this.buffs = this.buffs.filter(b => b.t > 0);
    if (this.flash > 0) this.flash -= dt;
    if (this.hitTimer > 0) this.hitTimer -= dt;
  }
}

/* ---------------- 英雄 ---------------- */
export class Champion extends Unit {
  constructor(game, def, team, x, y, opts = {}) {
    super(game, 'champion', team, x, y, 26);
    this.def = def;
    this.name = opts.name || def.name;
    this.title = def.title;
    this.level = 1;
    this.xp = 0;
    this.gold = GAME.startGold;
    this.items = [];
    this.augments = [];
    this.ranks = [1, 0, 0, 0];
    this.cds = [0, 0, 0, 0];
    this.spellCd = { d: 0, f: 0 };
    this.snowball = null;
    this.autoCd = 0;
    this.moveTarget = null;
    this.attackTarget = null;
    this.orderKind = 'idle';
    this.casting = null;
    this.dash = null;
    this.empower = null;
    this.kills = 0; this.deaths = 0; this.assists = 0;
    this.cs = 0; this.damageDone = 0; this.damageTaken = 0;
    this.respawnT = 0;
    this.killerTimers = new Map();
    this.dead = false;
    this.stats = null;
    this.hpRegenAcc = 0; this.mpRegenAcc = 0;
    this.isBot = false;
    this.ai = null;
    this.recall = 0;
    this.relicPulse = 0;
    this.isPlayer = !!opts.isPlayer;
    this.buyQueue = [];
    this.augTier = 0;
    this.augRerolls = 1;
    this.pendingAugments = false;
    this.ultEmpowered = 0;
    this.hexCore = 0;
    this.lastAbilityHit = 0;
    this.dmgReduceBuff = 0;
    this.pstate = { flow: 0, shortFuse: 8, jaxStacks: 0, jaxT: 0, casts: 0, essence: 0, chord: false, qStacks: 0, ahriCharges: 0, ahriWindow: 0, alistarStacks: 0, maxHpBonus: 0 };
    this.recalc();
    this.hp = this.maxHp; this.mana = this.maxMana;
  }

  recalc() {
    const d = this.def.stats, L = this.level;
    const s = {
      maxHp: d.hp + d.hpG * (L - 1),
      maxMana: d.mp + d.mpG * (L - 1),
      baseAd: d.ad + d.adG * (L - 1),
      ad: 0, ap: 0,
      baseArmor: d.armor + d.armorG * (L - 1),
      baseMr: d.mr + d.mrG * (L - 1),
      armor: 0, mr: 0,
      asPct: d.asG * (L - 1),
      baseAs: d.as,
      range: d.range,
      ms: d.ms,
      haste: 0, crit: 0, critDmg: 0, lifesteal: 0, spellvamp: 0,
      pen: 0, penPct: 0, tenacity: 0, healPct: 0, ultCdr: 0,
      dmgDealtPct: 0, dmgTakenPct: 0, magicTakenPct: 0, hpPct: 0,
    };
    const add = (st) => {
      if (!st) return;
      s.maxHp += st.hp || 0;
      s.maxMana += st.mp || 0;
      s.ad += st.ad || 0;
      s.ap += st.ap || 0;
      s.armor += st.armor || 0;
      s.mr += st.mr || 0;
      s.asPct += st.as || 0;
      s.ms += st.ms || 0;
      s.range += st.range || 0;
      s.haste += st.haste || 0;
      s.crit += st.crit || 0;
      s.critDmg += st.critDmg || 0;
      s.lifesteal += st.lifesteal || 0;
      s.spellvamp += st.spellvamp || 0;
      s.pen += st.pen || 0;
      s.penPct += st.penPct || 0;
      s.tenacity += st.tenacity || 0;
      s.healPct += st.healPct || 0;
      s.ultCdr += st.ultCdr || 0;
      s.dmgDealtPct += st.dmgDealtPct || 0;
      s.dmgTakenPct += st.dmgTakenPct || 0;
      s.magicTakenPct += st.magicTakenPct || 0;
      s.hpPct += st.hpPct || 0;
      s.apPct = (s.apPct || 0) + (st.apPct || 0);
      s.adPct = (s.adPct || 0) + (st.adPct || 0);
      s.msPct = (s.msPct || 0) + (st.msPct || 0);
    };
    for (const id of this.items) add(ITEM_BY_ID[id] && ITEM_BY_ID[id].stats);
    for (const id of this.augments) {
      const a = AUGMENT_BY_ID[id];
      if (a && a.mods) add(a.mods);
    }
    for (const b of this.buffs) {
      if (b.shield) { /* shield handled separately */ }
      if (b.as) s.asPct += b.as;
      if (b.ms) s.ms += 0;
      if (b.armorBuff) s.armor += b.armorBuff;
      if (b.mrBuff) s.mr += b.mrBuff;
    }
    const cc = this.ccState();
    s.maxHp += this.pstate?.maxHpBonus || 0;
    if (this.def?.id === 'Wukong' && this.game) {
      let n = 0;
      for (const e of this.game.units) {
        if (e.alive && e.kind === 'champion' && e.team !== this.team && dist(e.x, e.y, this.x, this.y) < 800) n++;
      }
      s.armor += Math.min(8, n) * 4;
      s.mr += Math.min(8, n) * 4;
    }
    if (this.def?.id === 'Jax' && this.pstate) s.asPct += 0.03 * this.pstate.jaxStacks;
    s.maxHp = Math.round(s.maxHp * (1 + s.hpPct));
    s.ad = (s.baseAd + s.ad) * (1 + (s.adPct || 0));
    s.ap = s.ap * (1 + (s.apPct || 0));
    s.armor = s.baseArmor + s.armor;
    s.mr = s.baseMr + s.mr;
    s.as = clamp(s.baseAs * (1 + s.asPct + cc.asBuff), 0.2, 2.5);
    s.ms = (s.ms) * (1 + (s.msPct || 0) + cc.msBuff) * (cc.slow ? (1 - cc.slow) : 1);
    s.range = s.range;
    this.stats = s;
    this.maxHp = s.maxHp;
    this.maxMana = s.maxMana;
    this.hp = Math.min(this.hp, this.maxHp);
    this.mana = Math.min(this.mana, this.maxMana);
  }

  get rankOf() {
    return (slot) => {
      if (slot === 3) return this.level >= 16 ? 3 : this.level >= 11 ? 2 : this.level >= 6 ? 1 : 0;
      const r = 1 + Math.floor((this.level - 1) / 3);
      return clamp(r, 1, 5);
    };
  }

  abilityReady(slot) {
    const ab = this.def.abilities[slot];
    if (!ab) return false;
    const rank = this.abilityRank(slot);
    if (rank <= 0) return false;
    if (this.cds[slot] > 0) return false;
    if (this.ccState().silence) return false;
    if (this.mana < ab.cost[Math.min(rank - 1, ab.cost.length - 1)]) return false;
    return true;
  }
  abilityRank(slot) {
    if (slot === 3) return this.level >= 16 ? 3 : this.level >= 11 ? 2 : this.level >= 6 ? 1 : 0;
    return clamp(1 + Math.floor((this.level - 1) / 3), 1, 5);
  }
  abilityCost(slot) {
    const ab = this.def.abilities[slot];
    const r = this.abilityRank(slot);
    return ab.cost[Math.min(r - 1, ab.cost.length - 1)];
  }

  addXp(n) {
    if (this.level >= GAME.maxLevel) return;
    this.xp += n * 1.35;
    while (this.level < GAME.maxLevel && this.xp >= (XP_TABLE[this.level] - XP_TABLE[this.level - 1])) {
      this.xp -= (XP_TABLE[this.level] - XP_TABLE[this.level - 1]);
      this.level++;
      this.recalc();
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.12);
      this.mana = Math.min(this.maxMana, this.mana + this.maxMana * 0.1);
      this.game.fx('levelup', { x: this.x, y: this.y, champ: this });
      this.game.emit('levelup', this);
      this.game.audio('levelup');
      this.game.checkAugment(this);
    }
  }

  addItem(id) {
    if (this.items.length >= 6) return false;
    const it = ITEM_BY_ID[id];
    if (!it || this.gold < it.cost) return false;
    this.gold -= it.cost;
    this.items.push(id);
    this.recalc();
    this.game.emit('shop', this);
    return true;
  }
  sellItem(idx) {
    const id = this.items[idx];
    if (!id) return;
    const it = ITEM_BY_ID[id];
    this.items.splice(idx, 1);
    this.gold += Math.floor(it.cost * 0.7);
    this.recalc();
    this.game.emit('shop', this);
  }

  update(dt) {
    if (!this.alive) {
      this.respawnT -= dt;
      if (this.respawnT <= 0) this.respawn();
      return;
    }
    this.updateBuffs(dt);
    this.recalc();
    const s = this.stats;
    const cc = this.ccState();

    // 冷却
    for (let i = 0; i < 4; i++) if (this.cds[i] > 0) this.cds[i] = Math.max(0, this.cds[i] - dt);
    this.spellCd.d = Math.max(0, this.spellCd.d - dt);
    this.spellCd.f = Math.max(0, this.spellCd.f - dt);
    this.autoCd = Math.max(0, this.autoCd - dt);
    this.ultEmpowered = Math.max(0, this.ultEmpowered - dt);

    // 回复
    const d = this.def.stats;
    this.hpRegenAcc += (d.hpRegen + this.maxHp * 0.002) * dt;
    this.mpRegenAcc += (d.mpRegen + this.maxMana * 0.012) * dt;
    if (this.hpRegenAcc > 1) { const v = Math.floor(this.hpRegenAcc); this.hpRegenAcc -= v; this.hp = Math.min(this.maxHp, this.hp + v); }
    if (this.mpRegenAcc > 1) { const v = Math.floor(this.mpRegenAcc); this.mpRegenAcc -= v; this.mana = Math.min(this.maxMana, this.mana + v); }

    // 泉水
    const f = LAYOUT[this.team].fountain;
    if (dist(this.x, this.y, f.x, f.y) < 420) {
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.22 * dt);
      this.mana = Math.min(this.maxMana, this.mana + this.maxMana * 0.22 * dt);
    }

    // 死亡免疫（不屈）
    if (this.hp <= 0 && this.hasHook('unyield') && (this.unyieldCd || 0) <= 0) {
      this.hp = 1;
      this.unyieldCd = 45;
      this.addBuff({ id: 'unyield', source: this, t: 1.5, dmgReduce: 0.99, untargetable: true });
      this.game.fx('shieldbreak', { x: this.x, y: this.y, color: '#c9a6ff' });
      this.game.emit('announce', { text: '不屈触发', color: '#c9a6ff' });
    }
    if (this.unyieldCd > 0) this.unyieldCd -= dt;

    // 被动计时
    const ps = this.pstate;
    if (ps) {
      const id = this.def.id;
      if (id === 'Yasuo') ps.flow = Math.min(100, ps.flow + dt * 2.2);
      if (id === 'Ziggs') ps.shortFuse = Math.max(0, ps.shortFuse - dt);
      if (id === 'Jax') { ps.jaxT = Math.max(0, ps.jaxT - dt); if (ps.jaxT <= 0) ps.jaxStacks = 0; }
      if (ps.ahriWindow > 0) { ps.ahriWindow -= dt; if (ps.ahriWindow <= 0) ps.ahriCharges = 0; }
      if (ps.shieldCd > 0) ps.shieldCd -= dt;
    }

    // 施法前摇
    if (this.casting) {
      this.casting.t -= dt;
      if (this.casting.t <= 0) {
        const c = this.casting; this.casting = null;
        this.game.resolveCast(this, c);
      }
      return;
    }

    // 突进
    if (this.dash) {
      const dsh = this.dash;
      dsh.t += dt;
      const k = Math.min(1, dsh.t / dsh.dur);
      this.x = lerp(dsh.x0, dsh.x1, k);
      this.y = lerp(dsh.y0, dsh.y1, k);
      this.facing = dsh.ang;
      if (dsh.dmg > 0) {
        for (const e of this.game.hostiles(this)) {
          if (!e.alive) continue;
          if (dist(this.x, this.y, e.x, e.y) < this.r + e.r + 30 && !dsh.hit.has(e.id)) {
            dsh.hit.add(e.id);
            this.game.damage(this, e, dsh.dmg, dsh.dmgType || 'magic', { ability: true });
            if (dsh.cc) this.game.applyCC(this, e, dsh.cc);
          }
        }
      }
      if (k >= 1) {
        this.dash = null;
        if (dsh.onEnd) dsh.onEnd();
      }
      return;
    }

    // 移动 / 攻击指令
    if (cc.stun || cc.root || cc.knockup) {
      this.moveTarget = null;
    }
    if (cc.charm) {
      const src = cc.charm.source;
      if (src && src.alive) {
        const a = angleTo(this.x, this.y, src.x, src.y);
        this.facing = a;
        const step = s.ms * 0.7 * dt;
        const p = clampToLane(this.x + Math.cos(a) * step, this.y + Math.sin(a) * step);
        this.x = p.x; this.y = p.y;
      }
      return;
    }

    if (this.attackTarget) this.doAttack(dt);
    else if (this.moveTarget) this.doMove(dt);

    // 自动攻击附近的敌人（无指令时）
    if (!this.noAuto && !this.attackTarget && !this.moveTarget) {
      const t = this.game.findAutoTarget(this);
      if (t) this.attackTarget = t;
    }

    this.separate();
  }

  doMove(dt) {
    const mt = this.moveTarget;
    if (!mt) return;
    const s = this.stats;
    const d = dist(this.x, this.y, mt.x, mt.y);
    if (d < 8) { this.moveTarget = null; this.orderKind = 'idle'; return; }
    const a = angleTo(this.x, this.y, mt.x, mt.y);
    this.facing = a;
    const step = s.ms * dt;
    const nx = this.x + Math.cos(a) * Math.min(step, d);
    const ny = this.y + Math.sin(a) * Math.min(step, d);
    const p = clampToLane(nx, ny);
    this.x = p.x; this.y = p.y;
    // 攻击范围内的敌人：边走边打
    const t = this.game.findAutoTarget(this);
    if (t && !this.attackTarget && this.orderKind === 'attackmove') {
      this.attackTarget = t;
      this.moveTarget = null;
    }
  }

  doAttack(dt) {
    const t = this.attackTarget;
    if (!t || !t.alive || !this.alive) { this.attackTarget = null; return; }
    const s = this.stats;
    const d = dist(this.x, this.y, t.x, t.y);
    const reach = s.range + t.r + this.r * 0.5;
    if (d > reach) {
      this.moveTarget = { x: t.x, y: t.y };
      this.orderKind = 'chase';
      this.doMove(dt);
      if (dist(this.x, this.y, t.x, t.y) <= reach) { this.moveTarget = null; }
      return;
    }
    this.moveTarget = null;
    this.facing = angleTo(this.x, this.y, t.x, t.y);
    if (this.autoCd > 0) return;
    const cc = this.ccState();
    if (cc.stun || cc.silence || cc.knockup) return;
    this.autoCd = 1 / s.as;
    this.game.championAttack(this, t);
  }

  separate() {
    this.game.separate(this);
  }

  respawn() {
    const f = LAYOUT[this.team].fountain;
    this.alive = true;
    this.dead = false;
    this.hp = this.maxHp;
    this.mana = this.maxMana;
    this.buffs = [];
    this.shield = 0;
    this.x = f.x + (Math.random() - 0.5) * 80;
    this.y = f.y + (Math.random() - 0.5) * 80;
    this.attackTarget = null; this.moveTarget = null;
    this.cds = this.cds.map(() => 0);
    this.game.fx('respawn', { x: this.x, y: this.y, champ: this });
    this.game.emit('respawn', this);
  }

  hasHook(h) { return this.augments.some(id => (AUGMENT_BY_ID[id]?.hooks || []).includes(h)); }

  passiveOnHit(target, dmg) {
    const id = this.def.id, g = this.game;
    if (id === 'Ashe') g.applyCC(this, target, { type: 'slow', amt: 0.2, dur: 2 });
    if (id === 'Lux' && target.buffs.some(b => b.id === 'illumination')) {
      const bonus = 25 + this.level * 8 + this.stats.ap * 0.35;
      g.damage(this, target, bonus, 'magic', { ability: true });
      target.buffs = target.buffs.filter(b => b.id !== 'illumination');
      g.fx('illum', { x: target.x, y: target.y });
    }
    if (id === 'Ziggs' && this.pstate.shortFuse <= 0) {
      const bonus = 20 + this.level * 6 + this.stats.ap * 0.5;
      g.damage(this, target, bonus, 'magic', { ability: true });
      this.pstate.shortFuse = 12;
      g.fx('shortfuse', { x: target.x, y: target.y });
    }
    if (id === 'Jax') {
      this.pstate.jaxStacks = Math.min(8, this.pstate.jaxStacks + 1);
      this.pstate.jaxT = 2.5;
      this.recalc();
    }
    if (id === 'Sona' && this.pstate.chord) {
      const bonus = 20 + this.level * 4 + this.stats.ap * 0.2;
      g.damage(this, target, bonus, 'magic', { ability: true });
      this.pstate.chord = false;
      g.fx('chord', { x: target.x, y: target.y });
    }
  }

  passiveOnAbilityHit(target) {
    const id = this.def.id, g = this.game;
    if (id === 'Lux') target.addBuff({ id: 'illumination', source: this, t: 6 });
    if (id === 'Ahri') {
      this.pstate.essence++;
      if (this.pstate.essence >= 9) {
        this.pstate.essence = 0;
        const heal = 30 + this.stats.ap * 0.35;
        this.hp = Math.min(this.maxHp, this.hp + heal);
        g.float(this.x, this.y - 50, '+' + Math.round(heal), '#4fe08a', 14);
      }
    }
  }

  passiveOnKill(target) {
    if (this.def.id !== 'Sion') return;
    const gain = target.kind === 'champion' ? 15 : target.kind === 'minion' ? (target.mtype === 'cannon' || target.mtype === 'super' ? 15 : 4) : 0;
    if (gain) { this.pstate.maxHpBonus += gain; this.recalc(); this.hp += gain; }
  }

  passiveOnCast() {
    const id = this.def.id;
    if (id === 'Alistar') {
      this.pstate.alistarStacks++;
      if (this.pstate.alistarStacks >= 7) {
        this.pstate.alistarStacks = 0;
        const heal = 25 + this.level * 6;
        this.hp = Math.min(this.maxHp, this.hp + heal);
        for (const a of this.game.allies(this)) if (dist(a.x, a.y, this.x, this.y) < 600) a.hp = Math.min(a.maxHp, a.hp + heal);
        this.game.fx('heal', { x: this.x, y: this.y });
      }
    }
    if (id === 'Sona') { this.pstate.casts++; if (this.pstate.casts % 3 === 0) this.pstate.chord = true; }
  }
}

/* ---------------- 小兵 ---------------- */
export class Minion extends Unit {
  constructor(game, team, type, wave) {
    const def = MINIONS[type];
    const spawn = LAYOUT[team].spawn;
    const jitter = (Math.random() - 0.5) * 150;
    super(game, 'minion', team, spawn.x + (team === 'blue' ? -30 : 30), spawn.y + jitter, def.r);
    this.def = def;
    this.mtype = type;
    this.maxHp = def.hp + def.hpG * wave;
    this.hp = this.maxHp;
    this.ad = def.ad + def.adG * wave;
    this.armor = def.armor; this.mr = def.mr;
    this.ms = def.ms;
    this.range = def.range;
    this.atkSpeed = def.atkSpeed;
    this.autoCd = Math.random() * 0.5;
    this.laneY = 500 + (Math.random() - 0.5) * 260;
    this.super = type === 'super';
    this.gold = def.gold; this.xp = def.xp;
    this.target = null;
  }
  update(dt) {
    if (!this.alive) return;
    this.updateBuffs(dt);
    this.autoCd = Math.max(0, this.autoCd - dt);
    const cc = this.ccState();
    if (cc.stun || cc.root || cc.knockup) return;

    const t = this.acquire();
    if (t) {
      this.target = t;
      const d = dist(this.x, this.y, t.x, t.y);
      if (d <= this.range + t.r) {
        this.facing = angleTo(this.x, this.y, t.x, t.y);
        if (this.autoCd <= 0) {
          this.autoCd = 1 / this.atkSpeed;
          this.game.minionAttack(this, t);
        }
      } else {
        this.walk(dt, t.x, t.y);
      }
    } else {
      this.target = null;
      const enemy = LAYOUT[this.team === 'blue' ? 'red' : 'blue'];
      const goalX = enemy.nexus.x;
      this.walk(dt, goalX, this.laneY);
    }
    this.separate();
  }
  walk(dt, gx, gy) {
    const a = angleTo(this.x, this.y, gx, gy);
    this.facing = a;
    const step = this.ms * dt;
    const p = clampToLane(this.x + Math.cos(a) * step, this.y + Math.sin(a) * step);
    this.x = p.x; this.y = p.y;
  }
  acquire() {
    let best = null, bestScore = Infinity;
    for (const e of this.game.units) {
      if (!e.alive || e.team === this.team || e.kind === 'nexus' || e.hidden) continue;
      if (e.kind === 'tower' || e.kind === 'inhib') {
        const d = dist(this.x, this.y, e.x, e.y) - e.r;
        if (d < 520 && d < bestScore) { best = e; bestScore = d; }
        continue;
      }
      const d = dist(this.x, this.y, e.x, e.y);
      const aggro = e.kind === 'champion' ? 1.35 : 1.0;
      const score = d * aggro;
      if (d < 470 && score < bestScore) { best = e; bestScore = score; }
    }
    return best;
  }
  separate() { this.game.separate(this); }
}

/* ---------------- 建筑 ---------------- */
export class Structure extends Unit {
  constructor(game, team, type, x, y) {
    const def = STRUCTURES[type];
    super(game, type, team, x, y, def.r);
    this.def = def;
    this.maxHp = def.hp; this.hp = def.hp;
    this.armor = def.armor || 0; this.mr = def.mr || 0;
    this.autoCd = 0;
    this.target = null;
    this.rampTarget = null; this.ramp = 0;
    this.spin = Math.random() * TAU;
    this.crystal = 0;
    this.isStructure = true;
    this.barrier = false;
  }
  update(dt) {
    if (!this.alive) return;
    this.updateBuffs(dt);
    if (this.kind !== 'tower') return;
    this.spin += dt * 0.35;
    this.autoCd = Math.max(0, this.autoCd - dt);
    if (this.barrier) return;
    if (!this.target || !this.target.alive || dist(this.x, this.y, this.target.x, this.target.y) > this.def.range + 60) {
      this.target = this.pickTarget();
    }
    if (!this.target) return;
    if (this.autoCd <= 0) {
      this.autoCd = 1 / this.def.atkSpeed;
      if (this.rampTarget === this.target) this.ramp = Math.min(this.ramp + 1, 4); else { this.rampTarget = this.target; this.ramp = 0; }
      const dmg = this.def.dmg + this.def.dmgG * this.game.time / 60 + this.ramp * 45;
      this.game.towerAttack(this, this.target, dmg);
    }
  }
  pickTarget() {
    let minion = null, md = Infinity;
    let champ = null, cd = Infinity;
    for (const e of this.game.units) {
      if (!e.alive || e.team === this.team || e.hidden) continue;
      const d = dist(this.x, this.y, e.x, e.y);
      if (d > this.def.range + e.r) continue;
      if (e.kind === 'minion') { if (d < md) { md = d; minion = e; } }
      else if (e.kind === 'champion') { if (d < cd) { cd = d; champ = e; } }
    }
    return minion || champ;
  }
}

/* ---------------- 飞行物 ---------------- */
export class Projectile {
  constructor(game, o) {
    this.game = game;
    this.id = NEXT_ID++;
    Object.assign(this, {
      x: 0, y: 0, vx: 0, vy: 0, r: 10, team: 'blue', owner: null,
      dmg: 0, dmgType: 'magic', range: 900, traveled: 0, pierce: 0,
      hit: new Set(), cc: null, color: '#9fe0ff', kind: 'skillshot',
      target: null, speed: 900, onHit: null, onEnd: null,
      slowResist: false, source: null, width: 20, explode: 0, visual: 'orb',
      returning: false, returnPhase: false, dead: false, homing: false, return3: false, pull: 0,
      trail: [], crit: false, ability: true,
    }, o);
    this.startX = this.x; this.startY = this.y;
  }
  update(dt) {
    if (this.dead) return;
    if (this.homing && this.target) {
      if (!this.target.alive) { this.dead = true; return; }
      const a = angleTo(this.x, this.y, this.target.x, this.target.y);
      this.vx = Math.cos(a) * this.speed; this.vy = Math.sin(a) * this.speed;
    }
    const dx = this.vx * dt, dy = this.vy * dt;
    this.x += dx; this.y += dy;
    this.traveled += Math.hypot(dx, dy);
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();

    // 撞墙（风墙）
    for (const w of this.game.walls) {
      if (w.team === this.team || w.t <= 0) continue;
      if (Math.abs(this.x - w.x) < w.width / 2 && Math.abs(this.y - w.y) < 42) {
        this.dead = true;
        this.game.fx('wallblock', { x: this.x, y: this.y });
        return;
      }
    }

    const R = this.r;
    for (const e of this.game.units) {
      if (!e.alive || e.team === this.team) continue;
      if (this.hit.has(e.id)) continue;
      if (e.kind === 'nexus') continue;
      if (dist(this.x, this.y, e.x, e.y) < R + e.r) {
        this.hit.add(e.id);
        this.applyHit(e);
        if (this.pierce > 0) this.pierce--;
        else { this.dead = true; }
        if (this.dead) return;
      }
    }
    if (this.return3 && !this.returning && this.traveled > this.range) {
      this.returning = true;
      this.hit.clear();
      const ow = this.owner;
      const a = angleTo(this.x, this.y, ow.x, ow.y);
      const sp = Math.hypot(this.vx, this.vy) || 1000;
      this.vx = Math.cos(a) * sp; this.vy = Math.sin(a) * sp;
      this.traveled = 0;
      this.range = dist(this.x, this.y, ow.x, ow.y) + 60;
      this.pierce = 99;
      return;
    }
    if (this.returning && this.owner && dist(this.x, this.y, this.owner.x, this.owner.y) < 46) {
      this.dead = true;
      return;
    }
    if (!this.returning && this.traveled > this.range) {
      this.dead = true;
      if (this.explode) this.game.aoeDamage(this.owner, this.x, this.y, this.explode, this.dmg * 0.7, this.dmgType, { ability: true, fx: this.color });
    }
  }
  applyHit(e) {
    const g = this.game;
    if (this.pull && this.owner) {
      const ow = this.owner;
      const ang = angleTo(ow.x, ow.y, e.x, e.y);
      const p2 = clampToLane(ow.x + Math.cos(ang) * this.pull, ow.y + Math.sin(ang) * this.pull);
      e.x = p2.x; e.y = p2.y;
      g.fx('pull', { x: p2.x, y: p2.y });
    }
    if (this.onHit) this.onHit(e, this);
    if (this.dmg > 0) g.damage(this.source || this.owner, e, this.dmg, this.dmgType, { ability: this.ability, crit: this.crit });
    if (this.cc) g.applyCC(this.source || this.owner, e, this.cc);
    if (this.explode) g.aoeDamage(this.owner, this.x, this.y, this.explode, this.dmg * 0.6, this.dmgType, { ability: true, fx: this.color });
    g.fx('hit', { x: this.x, y: this.y, color: this.color });
  }
}

/* ---------------- Game ---------------- */
export class Game {
  constructor(opts = {}) {
    this.rng = mulberry32(opts.seed || Date.now());
    this.units = [];
    this.champions = [];
    this.projectiles = [];
    this.fields = [];
    this.walls = [];
    this.aoeQueue = [];
    this.fxQueue = [];
    this.floaters = [];
    this.time = 0;
    this.state = 'playing';
    this.score = { blue: 0, red: 0 };
    this.waveIndex = 0;
    this.waveTimer = GAME.firstWave;
    this.relicTimer = 25;
    this.relics = [];
    this.winner = null;
    this.events = [];
    this.difficulty = opts.difficulty || 'normal';
    this.onEvent = opts.onEvent || (() => {});
    this.audioCb = opts.audio || (() => {});
    this.shake = 0;
    this.player = null;
    this.killFeed = [];
    this.lastKill = { blue: 0, red: 0 };
    this.streaks = {};
    this.started = false;
    this.buildBase();
  }

  emit(type, payload) { this.onEvent(type, payload); }
  audio(name, x, y) { this.audioCb(name, x, y); }
  fx(kind, data) { this.fxQueue.push({ kind, data, t: 0, life: data.life || 0.6 }); }
  float(x, y, text, color, size = 13) {
    if (text === '+0' || text === '0') return;
    if (this.floaters.length > 46) this.floaters.shift();
    this.floaters.push({ x, y, text, color, size, t: 0, life: 0.55, vy: -48 });
  }

  buildBase() {
    for (const team of ['blue', 'red']) {
      const L = LAYOUT[team];
      const add = (type, x, y) => {
        const s = new Structure(this, team, type, x, y);
        this.units.push(s); return s;
      };
      add('nexus', L.nexus.x, L.nexus.y);
      add('inhib', L.inhib.x, L.inhib.y);
      for (const t of L.towers) add('tower', t.x, t.y);
    }
  }

  addChampions(playerDefId) {
    const names = this.pickNames();
    const pool = [...(this.optsPool || [])];
    for (const team of ['blue', 'red']) {
      for (let i = 0; i < 5; i++) {
        const def = pool.shift();
        const isPlayer = team === 'blue' && i === 0;
        const f = LAYOUT[team].fountain;
        const c = new Champion(this, def, team,
          f.x + (i - 2) * 46, f.y + (i % 2 ? 40 : -40),
          { name: isPlayer ? '你' : names[team][i], isPlayer });
        this.units.push(c);
        this.champions.push(c);
        if (isPlayer) this.player = c;
      }
    }
  }

  pickNames() {
    return { blue: ['你', '海克斯打工人', '深渊摸鱼王', '雪球投手', '符文收藏家'], red: ['不补刀就送', '嚎哭深渊常客', '五杀预订', '强化卡欧皇', '一血先生'] };
  }

  start() { this.started = true; this.emit('start', {}); }

  hostiles(u) { return this.units.filter(e => e.alive && e.team !== u.team && e.kind !== 'nexus'); }
  allies(u) { return this.units.filter(e => e.alive && e !== u && e.team === u.team && e.kind === 'champion'); }

  findAutoTarget(champ) {
    const reach = champ.stats.range + 60;
    let best = null, bs = Infinity;
    for (const e of this.units) {
      if (!e.alive || e.team === champ.team || e.hidden) continue;
      if (e.kind === 'minion' || e.kind === 'champion') {
        const d = dist(champ.x, champ.y, e.x, e.y) - e.r;
        const minionBias = e.kind === 'minion' ? 0.6 : 1;
        const s = d * minionBias;
        if (d < reach && s < bs) { bs = s; best = e; }
      }
    }
    return best;
  }

  separate(u) {
    for (const o of this.units) {
      if (o === u || !o.alive) continue;
      if (o.kind === 'tower' || o.kind === 'inhib' || o.kind === 'nexus') {
        const d = dist(u.x, u.y, o.x, o.y);
        const min = u.r + o.r * 0.85;
        if (d < min && d > 0.001) {
          const a = angleTo(o.x, o.y, u.x, u.y);
          const p = clampToLane(o.x + Math.cos(a) * min, o.y + Math.sin(a) * min);
          u.x = p.x; u.y = p.y;
        }
        continue;
      }
      if (o.kind === 'minion' && u.kind === 'minion') continue;
      const d = dist(u.x, u.y, o.x, o.y);
      const min = (u.r + o.r) * 0.78;
      if (d < min && d > 0.001) {
        const push = (min - d) * 0.5;
        const a = angleTo(o.x, o.y, u.x, u.y);
        const p = clampToLane(u.x + Math.cos(a) * push, u.y + Math.sin(a) * push);
        u.x = p.x; u.y = p.y;
      }
    }
  }

  /* ---------- 攻击 ---------- */
  championAttack(champ, target) {
    const s = champ.stats;
    let dmg = s.ad;
    for (const b of champ.buffs) if (b.adMult) dmg *= 1 + b.adMult;
    if (target.buffs && target.buffs.some(b => b.dodge)) {
      this.float(target.x, target.y - 48, '闪避', '#9fe0ff', 13);
      return;
    }
    const crit = Math.random() < s.crit;
    if (crit) dmg *= 1.75 + s.critDmg;
    if (champ.empower) {
      dmg += champ.empower.dmg;
      if (champ.empower.shred) this.applyCC(champ, target, { type: 'shred', amt: champ.empower.shred, dur: champ.empower.dur || 3 });
      this.fx('hit', { x: target.x, y: target.y, color: champ.empower.color || '#c9a6ff' });
      if (champ.empower.dmgType === 'magic') {
        this.damage(champ, target, champ.empower.dmg, 'magic', { ability: false });
        dmg -= champ.empower.dmg;
      }
      champ.empower = null;
    }
    const melee = s.range < 240;
    if (melee) {
      this.damage(champ, target, dmg, 'phys', { basic: true, crit });
      champ.passiveOnHit(target, dmg);
      this.fx('slash', { x: target.x, y: target.y, ang: champ.facing, color: s.ad > 100 ? '#ffd27a' : '#dfeef4' });
      this.audio('hit', target.x, target.y);
    } else {
      const p = new Projectile(this, {
        x: champ.x + Math.cos(champ.facing) * 24,
        y: champ.y + Math.sin(champ.facing) * 24 - 14,
        target, homing: true, speed: 1600, r: 8, team: champ.team, owner: champ, source: champ,
        dmg, dmgType: 'phys', range: 5000, color: '#ffe7a8', kind: 'auto', basic: true, crit,
        visual: 'bolt', ability: false,
      });
      p.onHit = (e) => {
        this.damage(champ, e, p.dmg, 'phys', { basic: true, crit });
        champ.passiveOnHit(e, p.dmg);
        if (champ.hasHook('execute') && e.hp / e.maxHp < 0.12 && (champ.execCd || 0) <= 0) {
          champ.execCd = 20;
          this.damage(champ, e, 99999, 'true', { silentExec: true });
          this.fx('execute', { x: e.x, y: e.y });
        }
        this.audio('hit', e.x, e.y);
      };
      this.projectiles.push(p);
      this.fx('muzzle', { x: champ.x, y: champ.y - 16, ang: champ.facing, color: '#ffe7a8' });
      this.audio('shoot', champ.x, champ.y);
    }
    if (s.lifesteal > 0) {
      const heal = dmg * s.lifesteal;
      champ.hp = Math.min(champ.maxHp, champ.hp + heal);
      this.float(champ.x, champ.y - 40, '+' + Math.round(heal), '#4fe08a', 12);
    }
    this.emit('attack', { champ, target });
  }

  minionAttack(m, t) {
    if (m.range < 200) {
      this.damage(m, t, m.ad, 'phys');
      this.fx('slash', { x: t.x, y: t.y, ang: m.facing, color: '#dfeef4' });
    } else {
      this.projectiles.push(new Projectile(this, {
        x: m.x, y: m.y - 10, target: t, homing: true, speed: 900, r: 7,
        team: m.team, owner: m, source: m, dmg: m.ad, dmgType: 'phys', range: 1200,
        color: m.mtype === 'caster' ? '#9fb4ff' : '#ffd27a', visual: 'orb', ability: false,
      }));
    }
  }

  towerAttack(tower, target, dmg) {
    this.projectiles.push(new Projectile(this, {
      x: tower.x, y: tower.y - 90, target, homing: true, speed: 1200, r: 11,
      team: tower.team, owner: tower, source: tower, dmg, dmgType: 'phys',
      range: 1600, color: tower.team === 'blue' ? '#7fd0ff' : '#ff8a94', visual: 'tower',
      ability: false,
    }));
    this.audio('tower', tower.x, tower.y);
  }

  /* ---------- 伤害 ---------- */
  damage(source, target, amount, type = 'magic', opts = {}) {
    if (!target || !target.alive || amount <= 0) return 0;
    if (target.hasBuff && target.hasBuff('untargetable') && !opts.silentExec) return 0;
    let mult = 1;
    if (type === 'phys') {
      const armor = Math.max(0, (target.armor || 0) * (1 - (source?.stats?.penPct || source?.penPct || 0)) - (source?.stats?.pen || 0));
      mult = 100 / (100 + armor);
    } else if (type === 'magic') {
      const mr = Math.max(0, (target.mr || 0) * (1 - (source?.stats?.penPct || 0)) - (source?.stats?.pen || 0));
      mult = 100 / (100 + mr);
    }
    let dmg = amount * mult;
    if (!Number.isFinite(dmg)) { console.warn('NaN damage', source && source.name, target && target.name, amount, type); dmg = 0; }

    if (source && source.kind === 'champion') {
      const st = source.stats;
      dmg *= 1 + (st.dmgDealtPct || 0);
      if (target.kind === 'champion') {
        if (source.hasHook('cold') && target.hp / target.maxHp < 0.4) dmg *= 1.25;
        if (source.ultEmpowered > 0) dmg *= 1.0;
        if (source.hexCore > 0) dmg *= 1 + 0.6 * source.hexCore;
      }
      if (opts.ability && source.hasHook('ember')) {
        target.addBuff({ id: 'ember', source, t: 3, dot: Math.max(8, target.maxHp * 0.025), dotTick: 0.5 });
      }
    }
    if (target.kind === 'champion') {
      const cc = target.ccState();
      dmg *= 1 - Math.min(0.85, cc.dmgReduce || 0);
      dmg *= 1 + (target.stats.dmgTakenPct || 0);
      if (type === 'magic') dmg *= 1 + (target.stats.magicTakenPct || 0);
      if (target.hasHook('unyield') && target.hp - dmg <= 0) { /* handled in update */ }
      if (dmg >= target.hp && target.hasHook('unyield') && (target.unyieldCd || 0) <= 0) {
        target.unyieldCd = 45;
        target.hp = 1;
        target.addBuff({ id: 'unyield2', source: target, t: 1.5, dmgReduce: 0.99 });
        this.fx('shieldbreak', { x: target.x, y: target.y, color: '#c9a6ff' });
        this.emit('announce', { text: '不屈', color: '#c9a6ff' });
        return 0;
      }
    }

    // 护盾
    if (target.shield > 0) {
      const absorbed = Math.min(target.shield, dmg);
      target.shield -= absorbed;
      dmg -= absorbed;
      if (absorbed > 0) this.float(target.x, target.y - 52, '-' + Math.round(absorbed), '#9fe0ff', 13);
      if (target.shield <= 0) this.fx('shieldbreak', { x: target.x, y: target.y, color: '#9fe0ff' });
    }
    if (dmg <= 0) return 0;

    if (source && source.kind === 'champion') source.revealT = Math.max(source.revealT || 0, 1.5);
    target.hp -= dmg;
    if (!Number.isFinite(target.hp)) target.hp = 1;
    target.flash = 0.12;
    target.hitTimer = 0.4;
    if (source && source.kind === 'champion') { source.damageDone += dmg; source.killerTimers.set(target.id, this.time); }
    if (target.kind === 'champion') target.damageTaken += dmg;

    if (!opts.silent) {
      const col = opts.isDot ? '#ffb06a' : (opts.basic ? (opts.crit ? '#ffd166' : '#ffffff') : (type === 'magic' ? '#c9a6ff' : '#ff9f9f'));
      this.float(target.x + (Math.random() - .5) * 20, target.y - target.r - 16, String(Math.round(dmg)), col, opts.crit ? 18 : 13);
    }
    if (source && source.kind === 'champion' && opts.ability) {
      source.passiveOnAbilityHit(target);
      const sv = source.stats.spellvamp;
      if (sv > 0) {
        const heal = dmg * sv;
        source.hp = Math.min(source.maxHp, source.hp + heal);
        this.float(source.x, source.y - 44, '+' + Math.round(heal), '#4fe08a', 12);
      }
      source.lastAbilityHit = this.time;
    }
    if (target.kind === 'champion' && source && source.kind === 'champion' && target.def.id === 'Yasuo' && target.pstate) {
      const ps = target.pstate;
      if ((ps.shieldCd || 0) <= 0 && ps.flow > 1) {
        const sh = target.maxHp * Math.min(1, ps.flow / 100);
        target.shield += sh; ps.flow = 0; ps.shieldCd = 6;
        this.float(target.x, target.y - 60, '护盾', '#9fe0ff', 13);
      }
    }
    if (target.kind === 'champion' && source && source.kind === 'champion' && opts.basic && target.hasHook('thorns')) {
      this.damage(target, source, 25, 'true', { silent: true });
    }
    if (target.hp <= 0) this.kill(target, source, opts);
    return dmg;
  }

  kill(target, source, opts = {}) {
    if (!target.alive) return;
    target.alive = false;
    target.dead = true;
    target.hp = 0;
    if (target.kind === 'champion') {
      target.deaths++;
      target.respawnT = GAME.respawnBase + GAME.respawnPerLevel * target.level;
      target.buffs = [];
      target.attackTarget = null; target.moveTarget = null; target.dash = null; target.casting = null;
      const killer = source && source.kind === 'champion' ? source : null;
      if (killer && killer.team !== target.team) {
        killer.kills++;
        const bounty = 300 + Math.min(300, target.kills * 25);
        killer.gold += bounty;
        this.float(killer.x, killer.y - 60, '+' + bounty, '#ffd166', 18);
        killer.addXp(120);
        // 助攻
        for (const c of this.champions) {
          if (c !== killer && c.team === killer.team && c.alive && c.killerTimers.get(target.id) > this.time - 8) {
            c.assists++;
            c.gold += 150;
            c.addXp(60);
          }
        }
        this.score[killer.team]++;
        this.emit('kill', { killer, victim: target });
        this.killFeed.push({ killer, victim: target, t: 0 });
        this.audio('kill', target.x, target.y);
        // 连杀播报
        const n = killer.kills - (killer.lastStreak || 0);
        killer.lastStreak = killer.kills;
        if (this.time - (this.lastKill[killer.team] || -99) < 12) {
          killer.multi = (killer.multi || 0) + 1;
        } else killer.multi = 1;
        this.lastKill[killer.team] = this.time;
        const multi = ['', '', '双杀', '三杀', '四杀', '五杀'][Math.min(5, killer.multi)];
        if (killer.multi >= 2) this.emit('announce', { text: multi, big: true });
        if (this.time < 40 && this.score.blue + this.score.red === 1) this.emit('announce', { text: '第一滴血', big: true });
        if (killer.hasHook('chrono')) killer.ultEmpowered = Math.max(killer.ultEmpowered, 2);
      }
      if (source && source.kind === 'champion' && source.passiveOnKill) source.passiveOnKill(target);
      this.fx('death', { x: target.x, y: target.y, champ: target });
      this.fx('blood', { x: target.x, y: target.y });
      this.audio('death', target.x, target.y);
      if (target.isPlayer) this.emit('playerDeath', target);
    } else if (target.kind === 'minion') {
      const killer = source && source.kind === 'champion' ? source : null;
      if (killer) {
        killer.gold += target.gold;
        killer.cs++;
        this.float(target.x, target.y - 20, '+' + target.gold, '#ffd166', 13);
      }
      for (const c of this.champions) {
        if (!c.alive) continue;
        if (dist(c.x, c.y, target.x, target.y) < GAME.xpShareRadius) {
          c.addXp(target.xp * (c === killer ? 1.15 : 0.85));
        }
      }
      this.fx('minionDeath', { x: target.x, y: target.y, team: target.team });
    } else {
      // 建筑
      this.fx('structureDeath', { x: target.x, y: target.y, r: target.r });
      this.audio('boom', target.x, target.y);
      const t = TEAM[target.team];
      if (target.kind === 'inhib') {
        this.emit('announce', { text: `${t.name}水晶被摧毁 · 超级兵来袭`, big: true });
        this.superTimer = { team: target.team, t: 90 };
        this.inhibDown = this.inhibDown || {};
        this.inhibDown[target.team] = true;
      }
      if (target.kind === 'nexus') {
        this.winner = target.team === 'blue' ? 'red' : 'blue';
        this.state = 'ended';
        this.emit('gameover', { winner: this.winner });
      }
      if (target.kind === 'tower') {
        const killer = source && source.kind === 'champion' ? source : null;
        for (const c of this.champions) {
          if (c.team === target.team) continue;
          c.gold += 80;
        }
        if (killer) this.float(killer.x, killer.y - 60, '+80', '#ffd166', 15);
        this.emit('announce', { text: `${t.name}防御塔被摧毁`, color: t.color });
      }
    }
    this.emit('unitKilled', target);
  }

  /* ---------- 范围与技能 ---------- */
  aoeDamage(source, x, y, radius, dmg, type, opts = {}) {
    for (const e of this.units) {
      if (!e.alive || e.team === source?.team) continue;
      if (e.kind === 'nexus') continue;
      if (dist(x, y, e.x, e.y) < radius + e.r) {
        this.damage(source, e, dmg, type, { ability: opts.ability !== false });
      }
    }
    if (opts.fx) this.fx('explosion', { x, y, r: radius, color: opts.fx });
  }

  applyCC(source, target, cc) {
    if (!cc || !target) return;
    if (target.buffs && target.buffs.some(b => b.ccImmune)) return;
    if (target.kind === 'champion') {
      const ten = Math.min(0.8, target.stats.tenacity || 0);
      let base = cc.dur;
      if (cc.scaleRange && source) {
        const d = dist(source.x, source.y, target.x, target.y);
        base = Math.min(cc.maxDur || cc.dur, cc.dur + (d / cc.scaleRange) * ((cc.maxDur || cc.dur) - cc.dur));
      }
      const dur = base * (1 - ten);
      if (cc.type === 'slow') {
        target.addBuff({ id: 'slow', source, t: dur, slow: cc.amt });
      } else if (cc.type === 'stun') {
        target.addBuff({ id: 'stun', source, t: dur, stun: true });
        this.fx('stun', { x: target.x, y: target.y });
      } else if (cc.type === 'root') {
        target.addBuff({ id: 'root', source, t: dur, root: true });
        this.fx('root', { x: target.x, y: target.y });
      } else if (cc.type === 'knockup' || cc.type === 'airborne') {
        target.addBuff({ id: 'knockup', source, t: dur, knockup: true });
        target.airborne = dur;
        this.fx('knockup', { x: target.x, y: target.y });
      } else if (cc.type === 'charm') {
        target.addBuff({ id: 'charm', source, t: dur, charm: true });
        this.fx('charm', { x: target.x, y: target.y });
      } else if (cc.type === 'silence') {
        target.addBuff({ id: 'silence', source, t: dur, silence: true });
      } else if (cc.type === 'shred') {
        target.addBuff({ id: 'shred', source, t: dur, shred: cc.amt });
      }
    } else if (cc.type === 'slow' || cc.type === 'stun' || cc.type === 'root') {
      const dur = cc.dur;
      if (cc.type === 'slow') target.addBuff({ id: 'slow', source, t: dur, slow: cc.amt });
      else target.addBuff({ id: 'stun', source, t: dur, stun: true });
    }
  }

  dashUnit(champ, toX, toY, dur, dmg, dmgType, cc, radius, knockback = 0) {
    const from = clampToLane(champ.x, champ.y);
    const to = clampToLane(toX, toY);
    const ang = angleTo(from.x, from.y, to.x, to.y);
    champ.dash = {
      x0: from.x, y0: from.y, x1: to.x, y1: to.y, t: 0, dur, ang,
      dmg, dmgType, cc, hit: new Set(),
      onEnd: () => {
        if (radius) {
          this.aoeDamage(champ, to.x, to.y, radius, dmg, dmgType, { ability: true });
          this.fx('shock', { x: to.x, y: to.y, r: radius, color: '#ffd27a' });
        }
        if (knockback) {
          for (const e of this.hostiles(champ)) {
            if (dist(to.x, to.y, e.x, e.y) < (radius || 200) + e.r) {
              const a2 = angleTo(to.x, to.y, e.x, e.y);
              const p3 = clampToLane(e.x + Math.cos(a2) * knockback, e.y + Math.sin(a2) * knockback);
              e.x = p3.x; e.y = p3.y;
            }
          }
        }
      },
    };
    this.fx('dash', { x: from.x, y: from.y, x2: to.x, y2: to.y, color: '#9fe0ff' });
  }

  /* ---------- 技能释放 ---------- */
  canCast(champ, slot) {
    if (!champ.alive) return { ok: false, reason: 'dead' };
    const ab = champ.def.abilities[slot];
    if (!ab) return { ok: false, reason: 'none' };
    const rank = champ.abilityRank(slot);
    if (rank <= 0) return { ok: false, reason: 'locked' };
    if (champ.cds[slot] > 0) return { ok: false, reason: 'cd' };
    if (champ.ccState().silence) return { ok: false, reason: 'silence' };
    if (champ.mana < champ.abilityCost(slot)) return { ok: false, reason: 'mana' };
    if (champ.casting || champ.dash) return { ok: false, reason: 'busy' };
    return { ok: true, ab, rank };
  }

  cast(champ, slot, aimX, aimY) {
    // 阿狸 R 二/三段
    if (champ.def.id === 'Ahri' && slot === 3 && champ.pstate.ahriCharges > 0 && !champ.casting && !champ.dash) {
      champ.pstate.ahriCharges--;
      const ab2 = champ.def.abilities[3];
      const rank2 = champ.abilityRank(3);
      const aim2 = clampToLane(aimX, aimY);
      const ang2 = angleTo(champ.x, champ.y, aim2.x, aim2.y);
      const amount2 = abilityAmount(champ, ab2, rank2, 'dmg');
      this.dashUnit(champ, champ.x + Math.cos(ang2) * ab2.range, champ.y + Math.sin(ang2) * ab2.range, 0.22, amount2, 'magic', null, ab2.radius || 0);
      return true;
    }
    const chk = this.canCast(champ, slot);
    if (!chk.ok) return false;
    let ab = chk.ab, rank = chk.rank;
    // 亚索 Q：第三段击飞
    if (champ.def.id === 'Yasuo' && slot === 0) {
      champ.pstate.qStacks++;
      if (champ.pstate.qStacks >= 3) {
        champ.pstate.qStacks = 0;
        ab = { ...ab, width: 130, cc: { type: 'knockup', dur: 0.75 }, color: '#bfe9ff' };
      }
    }
    const cost = champ.abilityCost(slot);
    champ.mana -= cost;
    const haste = 1 + (champ.stats.haste || 0) / 100;
    const cd = ab.cd[Math.min(rank - 1, ab.cd.length - 1)];
    const ultCdr = slot === 3 ? (champ.stats.ultCdr || 0) : 0;
    champ.cds[slot] = cd * (1 - ultCdr) / haste;
    const aim = clampToLane(aimX, aimY);
    let dx = aim.x - champ.x, dy = aim.y - champ.y;
    let len = Math.hypot(dx, dy);
    if (len < 1) { dx = Math.cos(champ.facing); dy = Math.sin(champ.facing); len = 1; }
    const nx = dx / len, ny = dy / len;
    champ.facing = Math.atan2(ny, nx);
    const amount = abilityAmount(champ, ab, rank, 'dmg');
    const info = { ab, rank, amount, aim, nx, ny, len, slot };

    champ.revealT = Math.max(champ.revealT || 0, 1.5);
    this.emit('cast', { champ, slot, ab });
    this.audio('cast', champ.x, champ.y);
    champ.passiveOnCast();
    if (champ.def.id === 'Ahri' && slot === 3) { champ.pstate.ahriCharges = 2; champ.pstate.ahriWindow = 10; }
    if (champ.def.id === 'MonkeyKing' && slot === 1) this.spawnClone(champ);
    let castTime = ab.castTime || (ab.type === 'cone' || ab.type === 'beam' ? 0.18 : 0.12);
    if (champ.def.id === 'Sion' && slot === 0) castTime = 0.55;
    champ.casting = { t: castTime, info };
    return true;
  }

  resolveCast(champ, c) {
    const { ab, rank, amount, nx, ny, aim, len } = c.info;
    const team = champ.team;
    const color = ab.color || '#9fe0ff';
    const range = Math.min(ab.range || 800, len);
    switch (ab.type) {
      case 'global': {
        for (const e of this.units) {
          if (!e.alive || e.team === champ.team || e.kind !== 'champion') continue;
          this.damage(champ, e, amount, ab.dmgType || 'magic', { ability: true });
          this.fx('global', { x: e.x, y: e.y, color });
        }
        this.fx('globalwave', { x: champ.x, y: champ.y, color });
        break;
      }
      case 'scout': {
        this.fx('scout', { x: aim.x, y: aim.y, r: ab.radius || 600, color });
        for (const e of this.hostiles(champ)) {
          if (dist(aim.x, aim.y, e.x, e.y) <= (ab.radius || 600)) e.addBuff({ id: 'revealed', source: champ, t: ab.dur || 5 });
        }
        break;
      }
      case 'line': {
        const dir = ab.targetEnemy ? this.nearestEnemyDir(champ, ab.range) : null;
        const ax = dir ? dir.x : champ.x, ay = dir ? dir.y : champ.y;
        const ang = dir ? Math.atan2(dir.y - champ.y, dir.x - champ.x) : Math.atan2(ny, nx);
        const p = new Projectile(this, {
          x: champ.x, y: champ.y - 16,
          vx: Math.cos(ang) * (ab.speed || 1000), vy: Math.sin(ang) * (ab.speed || 1000),
          r: (ab.width || 44) / 2, team, owner: champ, source: champ,
          dmg: amount, dmgType: ab.dmgType || 'magic', range: ab.range || 900,
          pierce: ab.pierce === true ? 99 : (ab.pierce || 0), cc: ab.cc, color,
          explode: ab.explode || 0, visual: 'orb', ability: true, crit: false,
          return3: !!ab.return3, pull: ab.pull || 0,
        });
        this.projectiles.push(p);
        this.fx('castline', { x: champ.x, y: champ.y, ang, color, len: 600 });
        break;
      }
      case 'cone': {
        const a0 = Math.atan2(ny, nx);
        const half = (ab.angle || 45) * Math.PI / 180 / 2;
        for (const e of this.hostiles(champ)) {
          const d = dist(champ.x, champ.y, e.x, e.y);
          if (d > ab.range + e.r) continue;
          const ang = angleTo(champ.x, champ.y, e.x, e.y);
          if (Math.abs(angleDiff(a0, ang)) <= half) {
            this.damage(champ, e, amount, ab.dmgType || 'phys', { ability: true });
            if (ab.cc) this.applyCC(champ, e, ab.cc);
          }
        }
        this.fx('cone', { x: champ.x, y: champ.y, ang: a0, range: ab.range, angle: ab.angle, color });
        break;
      }
      case 'circle': {
        const tx = clampToLane(champ.x + nx * Math.min(len, ab.range), champ.y + ny * Math.min(len, ab.range));
        this.aoeQueue.push({
          x: tx.x, y: tx.y, r: ab.radius, delay: ab.delay || 0.4, t: 0,
          source: champ, dmg: amount, dmgType: ab.dmgType || 'magic', cc: ab.cc, color,
        });
        this.fx('marker', { x: tx.x, y: tx.y, r: ab.radius, color, life: (ab.delay || 0.4) });
        break;
      }
      case 'beam': {
        const a0 = Math.atan2(ny, nx);
        const width = ab.width || 110;
        for (const e of this.hostiles(champ)) {
          const rel = { x: e.x - champ.x, y: e.y - champ.y };
          const proj = rel.x * Math.cos(a0) + rel.y * Math.sin(a0);
          if (proj < 0 || proj > ab.range) continue;
          const perp = Math.abs(-rel.x * Math.sin(a0) + rel.y * Math.cos(a0));
          if (perp < width / 2 + e.r) this.damage(champ, e, amount, ab.dmgType || 'magic', { ability: true });
        }
        this.fx('beam', { x: champ.x, y: champ.y, ang: a0, len: ab.range, width, color, life: 0.35 });
        this.shake = Math.max(this.shake, 6);
        break;
      }
      case 'targeted': {
        let best = null, bd = Infinity;
        for (const e of this.hostiles(champ)) {
          if (e.kind !== 'champion') continue;
          const d = dist(champ.x, champ.y, e.x, e.y);
          if (d < ab.range + e.r && d < bd) { bd = d; best = e; }
        }
        if (best) {
          let dmg2 = amount;
          if (ab.airborneBonus && (best.hasBuff('knockup') || best.hasBuff('stun'))) dmg2 *= 1 + ab.airborneBonus;
          this.damage(champ, best, dmg2, ab.dmgType || 'phys', { ability: true });
          if (ab.cc) this.applyCC(champ, best, ab.cc);
          champ.x = best.x - Math.cos(angleTo(best.x, best.y, champ.x, champ.y)) * 60;
          champ.y = best.y - Math.sin(angleTo(best.x, best.y, champ.x, champ.y)) * 60;
          this.fx('slash', { x: best.x, y: best.y, ang: 0, color });
          this.shake = Math.max(this.shake, 5);
        }
        break;
      }
      case 'dash': {
        let tx = champ.x + nx * ab.range, ty = champ.y + ny * ab.range;
        let hitTarget = null;
        if (ab.targetEnemy) {
          const e = this.nearestEnemyAlong(champ, nx, ny, ab.range);
          if (e) { tx = e.x; ty = e.y; hitTarget = e; }
        }
        if (ab.knockback && hitTarget) {
          const ang = angleTo(champ.x, champ.y, hitTarget.x, hitTarget.y);
          const p2 = clampToLane(hitTarget.x + Math.cos(ang) * ab.knockback, hitTarget.y + Math.sin(ang) * ab.knockback);
          hitTarget.x = p2.x; hitTarget.y = p2.y;
          this.fx('knockback', { x: hitTarget.x, y: hitTarget.y });
        }
        this.dashUnit(champ, tx, ty, 0.22, amount, ab.dmgType, ab.cc, ab.radius || 0, ab.knockback || 0);
        break;
      }
      case 'buff': {
        const targets = ab.ally ? [champ, ...this.allies(champ)] : [champ];
        for (const t of targets) {
          if (ab.radius && ab.ally && dist(t.x, t.y, champ.x, champ.y) > ab.radius) continue;
          if (ab.cleanse) t.cleanse();
          if (ab.shield) {
            let sh = abilityAmount(champ, { ...ab, dmg: ab.shield }, rank, 'shield');
            if (ab.shieldHpPct) sh += champ.maxHp * ab.shieldHpPct;
            t.shield += sh;
            this.fx('shield', { x: t.x, y: t.y, color });
            if (t.hasHook('shieldPower')) t.addBuff({ id: 'shieldpower', source: t, t: 3, dmgBoost: 0.3 });
          }
          if (ab.heal) {
            const hv = abilityAmount(champ, { ...ab, dmg: ab.heal }, rank, 'heal') * (1 + (champ.stats.healPct || 0));
            t.hp = Math.min(t.maxHp, t.hp + hv);
            this.float(t.x, t.y - 50, '+' + Math.round(hv), '#4fe08a', 15);
            this.fx('heal', { x: t.x, y: t.y });
          }
          const buff = {};
          if (ab.dur) buff.t = ab.dur;
          if (ab.buff) { if (ab.buff.as) buff.as = ab.buff.as; if (ab.buff.ms) buff.ms = ab.buff.ms; if (ab.buff.armor) buff.armorBuff = ab.buff.armor; if (ab.buff.mr) buff.mrBuff = ab.buff.mr; }
          if (ab.aura && ab.aura.as) buff.as = (buff.as || 0) + ab.aura.as;
          if (ab.aura && ab.aura.ms) buff.ms = (buff.ms || 0) + ab.aura.ms;
          if (ab.dmgReduce) buff.dmgReduce = ab.dmgReduce;
          if (ab.dodge) buff.dodge = true;
          if (ab.adMult) buff.adMult = (buff.adMult || 0) + ab.adMult;
          if (ab.as) buff.as = (buff.as || 0) + ab.as;
          if (ab.ms) buff.ms = (buff.ms || 0) + ab.ms;
          if (ab.stealth) buff.stealth = true;
          if (ab.ccImmune) buff.ccImmune = true;
          if (buff.t) t.addBuff({ id: 'buff_' + ab.name, label: ab.name, source: champ, ...buff });
          t.recalc();
          this.fx('buff', { x: t.x, y: t.y, color });
        }
        if (ab.endDmg && ab.type === 'buff') {
          const cx = champ.x, cy = champ.y;
          setTimeout(() => {}, 0);
          let endDmg = ab.endDmg ? ab.endDmg[Math.min(rank - 1, ab.endDmg.length - 1)] : 0;
          if (ab.endDmgHpPct) endDmg += champ.maxHp * ab.endDmgHpPct;
          endDmg += (ab.ratios || []).reduce((acc, r) => acc + (r.coeff || 0) * statValue(champ, r.stat), 0);
          this.aoeQueue.push({ x: cx, y: cy, r: ab.radius || 240, delay: ab.dur || 2, t: 0, source: champ, dmg: endDmg, dmgType: 'magic', cc: ab.cc, color });
        }
        break;
      }
      case 'wall': {
        const a0 = Math.atan2(ny, nx);
        this.walls.push({
          x: champ.x + Math.cos(a0) * (ab.range || 380),
          y: champ.y + Math.sin(a0) * (ab.range || 380),
          ang: a0 + Math.PI / 2, width: ab.width || 500, t: ab.dur || 4, team, color,
        });
        this.fx('wall', { x: champ.x + Math.cos(a0) * (ab.range || 380), y: champ.y + Math.sin(a0) * (ab.range || 380), ang: a0 + Math.PI / 2, width: ab.width || 500, color });
        break;
      }
      case 'nova': {
        if (ab.bolts) {
          for (let i = 0; i < ab.bolts; i++) {
            this.aoeQueue.push({ x: champ.x, y: champ.y, r: 40, delay: 0.12 * i, t: 0, source: champ, bolt: true, dmg: amount, dmgType: ab.dmgType || 'magic', color, range: ab.radius });
          }
        } else {
          for (const e of this.hostiles(champ)) {
            if (dist(champ.x, champ.y, e.x, e.y) < ab.radius + e.r) {
              this.damage(champ, e, amount, ab.dmgType || 'magic', { ability: true });
              if (ab.cc) this.applyCC(champ, e, ab.cc);
            }
          }
        }
        this.fx('nova', { x: champ.x, y: champ.y, r: ab.radius, color });
        this.shake = Math.max(this.shake, 3);
        break;
      }
      case 'field': {
        const self = ab.self;
        const tx = self ? champ.x : clampToLane(champ.x + nx * Math.min(len, ab.range), champ.y + ny * Math.min(len, ab.range));
        const ty = self ? champ.y : tx.y || champ.y;
        this.fields.push({
          x: self ? champ.x : tx.x, y: self ? champ.y : tx.y, r: ab.radius, t: ab.dur, source: champ,
          dmg: amount, dmgType: ab.dmgType || 'magic', cc: ab.cc, color, tick: ab.tick || 0.5, acc: 0, follow: self,
        });
        break;
      }
      case 'empower': {
        champ.empower = {
          dmg: amount, dmgType: ab.dmgType || 'phys', shred: ab.shred, dur: ab.dur || 5,
          color, empower: true,
        };
        this.fx('buff', { x: champ.x, y: champ.y, color });
        break;
      }
    }
    // 回响施法
    if (champ.hasHook('echo') && Math.random() < 0.45) {
      setTimeout(() => {}, 0);
      const echoDmg = amount * 0.45;
      this.aoeQueue.push({ x: aim.x, y: aim.y, r: ab.radius || 150, delay: 0.3, t: 0, source: champ, dmg: echoDmg, dmgType: 'magic', color: '#c9a6ff' });
      this.fx('echo', { x: champ.x, y: champ.y });
    }
    if (ab.ult && champ.hasHook('chrono')) champ.addBuff({ id: 'chrono', source: champ, t: 3, ms: 0.5 });
  }

  nearestEnemyDir(champ, range) {
    let best = null, bd = range;
    for (const e of this.hostiles(champ)) {
      if (e.kind === 'nexus') continue;
      const d = dist(champ.x, champ.y, e.x, e.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  nearestEnemyAlong(champ, nx, ny, range) {
    let best = null, bd = range;
    for (const e of this.hostiles(champ)) {
      if (e.kind !== 'champion' && e.kind !== 'minion') continue;
      const rx = e.x - champ.x, ry = e.y - champ.y;
      const proj = rx * nx + ry * ny;
      if (proj < 0 || proj > range) continue;
      const perp = Math.abs(-rx * ny + ry * nx);
      if (perp < 220 && proj < bd) { bd = proj; best = e; }
    }
    return best;
  }

  /* ---------- 召唤师技能 ---------- */
  castSummoner(champ, key, aimX, aimY) {
    if (!champ.alive) return false;
    if (key === 'f') {
      if (champ.spellCd.f > 0) return false;
      const aim = clampToLane(aimX, aimY);
      const a = angleTo(champ.x, champ.y, aim.x, aim.y);
      const p = clampToLane(champ.x + Math.cos(a) * GAME.flashRange, champ.y + Math.sin(a) * GAME.flashRange);
      this.fx('flash', { x0: champ.x, y0: champ.y, x1: p.x, y1: p.y });
      champ.x = p.x; champ.y = p.y;
      champ.spellCd.f = 90;
      this.audio('flash', champ.x, champ.y);
      return true;
    }
    if (key === 'd') {
      // 雪球：已标记则突进
      if (champ.snowball && champ.snowball.target && champ.snowball.target.alive) {
        const t = champ.snowball.target;
        this.dashUnit(champ, t.x, t.y, 0.28, 60 + champ.stats.ad * 0.25, 'phys', { type: 'slow', amt: 0.3, dur: 1 }, 90);
        this.fx('snowhit', { x: t.x, y: t.y });
        champ.snowball = null;
        champ.spellCd.d = 8;
        return true;
      }
      if (champ.spellCd.d > 0) return false;
      const aim = clampToLane(aimX, aimY);
      const a = angleTo(champ.x, champ.y, aim.x, aim.y);
      this.projectiles.push(new Projectile(this, {
        x: champ.x, y: champ.y - 10, vx: Math.cos(a) * 1400, vy: Math.sin(a) * 1400,
        r: 16, team: champ.team, owner: champ, source: champ, dmg: 0, dmgType: 'phys',
        range: GAME.snowballRange, color: '#bfe9ff', visual: 'snowball', ability: false,
        onHit: (e) => {
          if (e.kind !== 'champion') return;
          champ.snowball = { target: e, t: 4 };
          this.fx('snowmark', { x: e.x, y: e.y });
          this.audio('snow', e.x, e.y);
        },
      }));
      champ.spellCd.d = 4;
      return true;
    }
    return false;
  }

  spawnClone(owner) {
    const c = new Minion(this, owner.team, 'melee', 0);
    c.mtype = 'clone';
    c.maxHp = 100; c.hp = 100; c.ad = 0; c.ms = 0; c.range = 0; c.ttl = 4;
    c.x = owner.x; c.y = owner.y; c.laneY = owner.y;
    c.update = function (dt) { this.ttl -= dt; if (this.ttl <= 0) { this.alive = false; } };
    this.units.push(c);
    this.fx('clone', { x: c.x, y: c.y, color: '#c9a6ff' });
  }

  /* ---------- 兵线与遗物 ---------- */
  spawnWave() {
    this.waveIndex++;
    const cannon = this.waveIndex % 3 === 0;
    for (const team of ['blue', 'red']) {
      const types = ['melee', 'melee', 'melee', 'caster', 'caster', 'caster'];
      if (cannon) types.push('cannon');
      if (this.inhibDown && this.inhibDown[team === 'blue' ? 'red' : 'blue']) types.push('super');
      for (const t of types) {
        const m = new Minion(this, team, t, this.waveIndex);
        this.units.push(m);
      }
    }
    this.emit('wave', { index: this.waveIndex });
  }

  spawnRelic() {
    const spot = LAYOUT.relics[Math.floor(this.rng() * LAYOUT.relics.length)];
    this.relics.push({ x: spot.x + (this.rng() - .5) * 120, y: spot.y + (this.rng() - .5) * 120, t: 0, taken: false });
  }

  checkAugment(champ) {
    const tiers = [3, 6, 9, 12, 15];
    if (champ.augTier >= tiers.length) return;
    if (champ.level >= tiers[champ.augTier]) {
      champ.augTier++;
      this.emit('augment', { champ });
    }
  }

  applyAugment(champ, id) {
    if (champ.augments.length >= 5) return;
    champ.augments.push(id);
    champ.recalc();
    const a = AUGMENT_BY_ID[id];
    if (a.mods && a.mods.hp) champ.hp = Math.min(champ.maxHp, champ.hp + a.mods.hp);
    this.emit('augmentPick', { champ, id });
  }

  update(dt) {
    if (this.state !== 'playing') return;
    this.time += dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 26);

    // 波次
    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      this.spawnWave();
      this.waveTimer = GAME.waveInterval;
    }
    // 遗物
    this.relicTimer -= dt;
    if (this.relicTimer <= 0) { this.spawnRelic(); this.relicTimer = 40; }
    for (const r of this.relics) {
      if (r.taken) continue;
      r.t += dt;
      for (const c of this.champions) {
        if (!c.alive) continue;
        if (dist(c.x, c.y, r.x, r.y) < 52) {
          r.taken = true;
          c.hp = Math.min(c.maxHp, c.hp + c.maxHp * 0.2);
          c.mana = Math.min(c.maxMana, c.mana + c.maxMana * 0.2);
          this.float(c.x, c.y - 50, '+20%', '#4fe08a', 18);
          this.fx('relic', { x: r.x, y: r.y });
          this.audio('relic', r.x, r.y);
        }
      }
    }
    this.relics = this.relics.filter(r => !r.taken && r.t < 60);

    // 单位
    for (const u of this.units) u.update(dt);

    // 草丛可见性：草内单位对外隐身，除非同草有敌人或刚出手
    for (const u of this.units) {
      if (!u.alive) continue;
      u.inBrush = inBrush(u.x, u.y);
      if (u.revealT > 0) u.revealT -= dt;
    }
    for (const u of this.units) {
      if (!u.alive) continue;
      u.hidden = false;
      if (u.inBrush) {
        let seen = u.revealT > 0;
        if (!seen) {
          for (const e of this.units) {
            if (!e.alive || e.team === u.team || !e.inBrush) continue;
            if (dist(e.x, e.y, u.x, u.y) < 140) { seen = true; break; }
          }
        }
        u.hidden = !seen;
      }
    }

    // 飞行物
    for (const p of this.projectiles) p.update(dt);
    this.projectiles = this.projectiles.filter(p => !p.dead);

    // 延迟 AOE
    for (const a of this.aoeQueue) {
      a.t += dt;
      if (a.t >= a.delay) {
        if (a.bolt) {
          const t = this.nearestEnemyDir(a.source, a.range || 640);
          if (t) {
            this.damage(a.source, t, a.dmg, a.dmgType, { ability: true });
            this.fx('bolt', { x0: a.source.x, y0: a.source.y, x1: t.x, y1: t.y, color: a.color });
          }
        } else {
          this.aoeDamage(a.source, a.x, a.y, a.r, a.dmg, a.dmgType, { ability: true, fx: a.color });
          if (a.cc) {
            for (const e of this.hostiles(a.source)) {
              if (dist(a.x, a.y, e.x, e.y) < a.r + e.r) this.applyCC(a.source, e, a.cc);
            }
          }
        }
        a.done = true;
      }
    }
    this.aoeQueue = this.aoeQueue.filter(a => !a.done);

    // 地面区域
    for (const f of this.fields) {
      f.t -= dt;
      f.acc += dt;
      if (f.follow && f.source.alive) { f.x = f.source.x; f.y = f.source.y; }
      if (f.acc >= f.tick) {
        f.acc -= f.tick;
        for (const e of this.units) {
          if (!e.alive || e.team === f.source.team) continue;
          if (dist(f.x, f.y, e.x, e.y) < f.r + e.r) {
            this.damage(f.source, e, f.dmg, f.dmgType, { ability: true, silent: true });
            if (f.cc) this.applyCC(f.source, e, f.cc);
          }
        }
      }
    }
    this.fields = this.fields.filter(f => f.t > 0);

    // 风墙
    for (const w of this.walls) w.t -= dt;
    this.walls = this.walls.filter(w => w.t > 0);

    // 轻量清理
    if (this.units.length > 400) this.units = this.units.filter(u => u.alive || (u.kind === 'champion'));

    // 金币 + 大乱斗节奏经验
    for (const c of this.champions) {
      if (!c.alive) continue;
      c.gold += GAME.goldPerSec * dt;
      c.passiveXp = (c.passiveXp || 0) + dt * 4.2;
      if (c.passiveXp >= 1) {
        const v = Math.floor(c.passiveXp); c.passiveXp -= v;
        c.addXp(v);
      }
    }
  }
}

function ratioTypeOf(champ, ab) {
  return ab.ratioType || 'ap';
}

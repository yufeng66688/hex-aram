/* ============================================================
   Bot AI：补刀、消耗、撤退、买装备、开团
   ============================================================ */
import { LAYOUT, clampToLane } from './map.js';
import { ITEMS, ITEM_BY_ID } from './data.js';
import { dist, angleTo } from './sim.js';

const BUILDS = {
  射手: ['boots', 'infinity', 'ie2', 'botrk', 'infinity', 'gargoyle'],
  法师: ['sorc', 'luden', 'deathcap', 'zhonya', 'deathcap', 'spirit'],
  战士: ['boots', 'botrk', 'infinity', 'gargoyle', 'infinity', 'mercury'],
  坦克: ['mercury', 'sunfire', 'gargoyle', 'spirit', 'sunfire', 'gargoyle'],
  辅助: ['mercury', 'luden', 'spirit', 'zhonya', 'deathcap', 'gargoyle'],
};

export class BotAI {
  constructor(champ, game, difficulty = 'normal') {
    this.champ = champ;
    this.game = game;
    this.diff = difficulty;
    this.think = Math.random() * 0.3;
    this.skillCd = 0;
    this.aggression = difficulty === 'hard' ? 1.25 : difficulty === 'easy' ? 0.72 : 1;
    this.reaction = difficulty === 'hard' ? 0.12 : difficulty === 'easy' ? 0.42 : 0.25;
    this.buildIdx = 0;
    this.buyCd = 0;
  }

  tick(dt) {
    const c = this.champ;
    if (!c.alive) { this.shop(); return; }
    this.think -= dt;
    this.skillCd -= dt;
    this.buyCd -= dt;
    if (this.buyCd <= 0) { this.shop(); this.buyCd = 3; }
    if (this.think > 0) return;
    this.think = this.reaction + Math.random() * 0.12;

    const g = this.game;
    const enemies = g.units.filter(e => e.alive && e.team !== c.team && !e.hidden);
    const champs = enemies.filter(e => e.kind === 'champion');
    const minions = enemies.filter(e => e.kind === 'minion');
    const myMinions = g.units.filter(e => e.alive && e.team === c.team && e.kind === 'minion');

    const hpPct = c.hp / c.maxHp;
    const fountain = LAYOUT[c.team].fountain;
    const nearFountain = dist(c.x, c.y, fountain.x, fountain.y) < 700;
    const enemyTowers = enemies.filter(e => e.kind === 'tower');
    const safeTower = enemyTowers.find(t => dist(t.x, t.y, c.x, c.y) < 880 && !myMinions.some(m => dist(m.x, m.y, t.x, t.y) < 760));

    // 撤退
    if (hpPct < 0.32 && !nearFountain) {
      c.attackTarget = null;
      c.orderKind = 'retreat';
      c.moveTarget = { x: fountain.x, y: fountain.y };
      // 撤退时用位移/护盾
      this.useDefensive(champs);
      return;
    }

    // 找目标
    const nearestChamp = this.nearest(champs, 1100);
    const myHpAdv = nearestChamp ? hpPct - nearestChamp.hp / nearestChamp.maxHp : 1;
    const allyNear = g.units.filter(e => e.alive && e.team === c.team && e.kind === 'champion' && e !== c && dist(e.x, e.y, c.x, c.y) < 700).length;
    const enemyNear = champs.filter(e => dist(e.x, e.y, c.x, c.y) < 700).length;

    // 敌塔压制检查：没兵线就退
    if (safeTower) {
      c.attackTarget = null;
      const back = c.team === 'blue' ? -1 : 1;
      c.moveTarget = { x: safeTower.x + back * 760, y: 500 + (Math.random() - .5) * 120 };
      c.orderKind = 'retreat';
      return;
    }

    if (nearestChamp && dist(nearestChamp.x, nearestChamp.y, c.x, c.y) < 760) {
      const canDive = myMinions.filter(m => dist(m.x, m.y, c.x, c.y) < 700).length >= 2;
      const engage = ((myHpAdv > 0.12 && enemyNear <= allyNear + 1) || (allyNear >= 2 && canDive)) && Math.random() < this.aggression;
      if (engage) {
        this.fight(nearestChamp, champs);
        return;
      }
    }

    // 兵线
    c.attackTarget = null;
    if (minions.length) {
      const lowHp = minions.filter(m => m.hp < c.stats.ad * 1.4 && dist(m.x, m.y, c.x, c.y) < c.stats.range + m.r + 40)
        .sort((a, b) => a.hp - b.hp)[0];
      if (lowHp && Math.random() < 0.8) {
        c.attackTarget = lowHp; c.orderKind = 'push'; return;
      }
      const t = this.nearest(minions, 900);
      if (t) {
        const d = dist(c.x, c.y, t.x, t.y);
        if (d < c.stats.range + t.r + 20) {
          c.attackTarget = t;
          c.orderKind = 'push';
          this.useHarass(t, champs);
          return;
        }
        c.moveTarget = { x: t.x, y: t.y };
        c.orderKind = 'push';
        return;
      }
    }
    // 推塔
    const tower = enemies.find(e => (e.kind === 'tower' || e.kind === 'inhib') && e.alive);
    if (tower && myMinions.length >= 2) {
      const d = dist(c.x, c.y, tower.x, tower.y);
      if (d < c.stats.range + tower.r) { c.attackTarget = tower; c.orderKind = 'push'; }
      else { c.moveTarget = { x: tower.x, y: tower.y }; c.orderKind = 'push'; }
      return;
    }
    // 跟兵走
    const front = myMinions.sort((a, b) => (c.team === 'blue' ? b.x - a.x : a.x - b.x))[0];
    if (front) { c.moveTarget = { x: front.x, y: front.y + (Math.random() - .5) * 100 }; c.orderKind = 'push'; }
    else {
      const tgt = c.team === 'blue' ? LAYOUT.red.towers[0] : LAYOUT.blue.towers[0];
      c.moveTarget = { x: tgt.x, y: 500 + (Math.random() - .5) * 120 };
      c.orderKind = 'push';
    }
  }

  nearest(list, maxD) {
    let best = null, bd = maxD;
    for (const e of list) {
      const d = dist(this.champ.x, this.champ.y, e.x, e.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  aimAt(t, lead = 0.14) {
    const c = this.champ;
    const d = dist(c.x, c.y, t.x, t.y);
    const travel = lead * Math.min(1, d / 700);
    return { x: t.x + (Math.random() - .5) * 40 * travel, y: t.y + (Math.random() - .5) * 30 * travel };
  }

  fight(target, champs) {
    const c = this.champ, g = this.game;
    const d = dist(c.x, c.y, target.x, target.y);
    c.attackTarget = target;
    c.orderKind = 'fight';
    if (d > c.stats.range + target.r) { c.moveTarget = { x: target.x, y: target.y }; }
    else c.moveTarget = null;
    this.useOffensive(target, d);
    // 雪球
    if (d > 500 && d < 1100 && c.spellCd.d <= 0 && Math.random() < 0.25) {
      const aim = this.aimAt(target);
      g.castSummoner(c, 'd', aim.x, aim.y);
    }
    if (c.snowball && c.snowball.target) {
      g.castSummoner(c, 'd', target.x, target.y);
    }
  }

  useHarass(minion, champs) {
    const c = this.champ;
    if (c.mana < c.maxMana * 0.45) return;
    const t = champs.find(e => dist(e.x, e.y, c.x, c.y) < 900);
    if (!t) return;
    for (let slot = 0; slot < 3; slot++) {
      const ab = c.def.abilities[slot];
      if (!ab || ab.type === 'buff' || ab.type === 'dash') continue;
      if (c.abilityReady(slot) && Math.random() < 0.35) {
        const aim = this.aimAt(t);
        this.game.cast(c, slot, aim.x, aim.y);
        return;
      }
    }
  }

  useOffensive(target, d) {
    const c = this.champ, g = this.game;
    if (c.mana < 20) return;
    const order = [1, 0, 2, 3];
    for (const slot of order) {
      const ab = c.def.abilities[slot];
      if (!ab) continue;
      const rank = c.abilityRank(slot);
      if (rank <= 0) continue;
      const rng = slot === 3 ? (ab.range || 600) : (ab.range || 600);
      if (d > Math.max(rng, 650) && ab.type !== 'buff' && ab.type !== 'dash') continue;
      if (!c.abilityReady(slot)) continue;
      const aim = this.aimAt(target);
      const useChance = ab.type === 'buff' ? 0.5 : 0.85;
      if (Math.random() > useChance) continue;
      g.cast(c, slot, aim.x, aim.y);
      return;
    }
  }

  useDefensive(champs) {
    const c = this.champ, g = this.game;
    for (const slot of [2, 1, 3]) {
      const ab = c.def.abilities[slot];
      if (!ab) continue;
      if ((ab.type === 'buff' || ab.type === 'dash') && c.abilityReady(slot)) {
        const dir = LAYOUT[c.team].fountain;
        g.cast(c, slot, dir.x, dir.y);
        return;
      }
    }
    if (c.spellCd.f <= 0 && champs.length) {
      const enemy = this.nearest(champs, 500);
      if (enemy) {
        const away = angleTo(enemy.x, enemy.y, c.x, c.y);
        g.castSummoner(c, 'f', c.x + Math.cos(away) * 400, c.y + Math.sin(away) * 400);
      }
    }
  }

  shop() {
    const c = this.champ;
    if (!c.alive && c.gold < 400) return;
    const list = BUILDS[c.def.role] || BUILDS['战士'];
    while (c.items.length < 6) {
      const id = list[c.items.length % list.length];
      const it = ITEM_BY_ID[id];
      if (!it) break;
      if (c.gold >= it.cost) c.addItem(id);
      else break;
    }
  }
}

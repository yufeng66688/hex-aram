/* ============================================================
   渲染：程序化角色 / 建筑 / 特效 / 小地图
   ============================================================ */
import { WORLD, TEAM } from './data.js';
import { LAYOUT, buildBackground, buildMinimapBackground, clampToLane } from './map.js';
import { dist, angleTo, clamp } from './sim.js';

const TEAM_COL = { blue: '#3aa0ff', red: '#ff4d5e' };
const TEAM_GLOW = { blue: 'rgba(58,160,255,.55)', red: 'rgba(255,77,94,.55)' };

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.bg = buildBackground();
    this.miniBg = buildMinimapBackground();
    this.cam = { x: LAYOUT.blue.fountain.x + 300, y: 500, zoom: 1, tx: 0, ty: 0 };
    this.effects = [];
    this.particles = [];
    this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, down: false };
    this.time = 0;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.snow = Array.from({ length: 130 }, () => ({
      x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7,
      s: 0.6 + Math.random() * 1.8, ph: Math.random() * 6.28,
    }));
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.vw = w; this.vh = h;
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
  }

  screenToWorld(sx, sy) {
    const z = this.cam.zoom;
    return {
      x: this.cam.x + (sx - this.vw / 2) / z,
      y: this.cam.y + (sy - this.vh / 2) / z,
    };
  }
  worldToScreen(wx, wy) {
    const z = this.cam.zoom;
    return { x: (wx - this.cam.x) * z + this.vw / 2, y: (wy - this.cam.y) * z + this.vh / 2 };
  }

  updateCamera(dt, player, lock, mouse) {
    const target = player && player.alive ? player : null;
    let tx = this.cam.x, ty = this.cam.y;
    if (lock && target) {
      tx = target.x; ty = target.y;
      this.cam.x += (tx - this.cam.x) * Math.min(1, dt * 9);
      this.cam.y += (ty - this.cam.y) * Math.min(1, dt * 9);
    } else {
      this.cam.x += (this.cam.tx - this.cam.x) * Math.min(1, dt * 10);
      this.cam.y += (this.cam.ty - this.cam.y) * Math.min(1, dt * 10);
      this.cam.tx = clamp(this.cam.tx, this.vw / (2 * this.cam.zoom), WORLD.w - this.vw / (2 * this.cam.zoom));
      this.cam.ty = clamp(this.cam.ty, this.vh / (2 * this.cam.zoom), WORLD.h - this.vh / (2 * this.cam.zoom));
    }
    if (lock && target) {
      this.cam.x = clamp(this.cam.x, this.vw / (2 * this.cam.zoom), WORLD.w - this.vw / (2 * this.cam.zoom));
      this.cam.y = clamp(this.cam.y, this.vh / (2 * this.cam.zoom), WORLD.h - this.vh / (2 * this.cam.zoom));
      this.cam.tx = this.cam.x; this.cam.ty = this.cam.y;
    }
  }

  /* ---------- 特效入口 ---------- */
  spawnFx(kind, d) {
    const fx = { kind, d, t: 0, life: d.life || 0.45 };
    if (kind === 'explosion') fx.life = 0.6;
    if (kind === 'structureDeath') { fx.life = 1.6; this.burst(d.x, d.y, 46, '#ffb04a', 320); }
    if (kind === 'death') { fx.life = 1.1; this.burst(d.x, d.y, 26, '#ff6b6b', 240); }
    if (kind === 'hit') this.burst(d.x, d.y, 5, d.color || '#fff', 130, 0.35);
    if (kind === 'nova') { fx.life = 0.5; this.burst(d.x, d.y, 14, d.color, 260); }
    if (kind === 'snowhit') this.burst(d.x, d.y, 12, '#dff4ff', 200);
    if (kind === 'levelup') { fx.life = 1.1; this.burst(d.x, d.y, 18, '#ffd166', 150); }
    if (kind === 'relic') this.burst(d.x, d.y, 16, '#7ef0c0', 160);
    if (kind === 'echo') this.burst(d.x, d.y, 10, '#c9a6ff', 180);
    this.effects.push(fx);
  }

  burst(x, y, n, color, speed = 200, life = 0.6) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.25 + Math.random() * 0.8);
      this.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6 - 40,
        life, max: life, size: 1.5 + Math.random() * 3, color,
      });
    }
  }

  update(dt) {
    this.time += dt;
    for (const fx of this.effects) { fx.t += dt; }
    this.effects = this.effects.filter(f => f.t < f.life);
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 260 * dt;
      p.vx *= 0.98;
    }
    this.particles = this.particles.filter(p => p.life > 0);
    for (const f of this.snow) {
      f.y += (0.012 + f.z * 0.03) * dt * 60;
      f.x += Math.sin(this.time * 0.6 + f.ph) * 0.00035;
      if (f.y > 1.03) { f.y = -0.03; f.x = Math.random(); }
      if (f.x > 1.02) f.x = -0.02;
      if (f.x < -0.02) f.x = 1.02;
    }
  }

  /* ---------- 主绘制 ---------- */
  draw(game, player, lock, mouse) {
    const ctx = this.ctx;
    const z = this.cam.zoom;
    const shake = game.shake > 0 ? game.shake : 0;
    const sx = (Math.random() - .5) * shake, sy = (Math.random() - .5) * shake;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.vw, this.vh);
    ctx.fillStyle = '#04090c';
    ctx.fillRect(0, 0, this.vw, this.vh);

    ctx.save();
    ctx.translate(this.vw / 2 + sx, this.vh / 2 + sy);
    ctx.scale(z, z);
    ctx.translate(-this.cam.x, -this.cam.y);

    const view = {
      x0: this.cam.x - this.vw / (2 * z) - 120,
      x1: this.cam.x + this.vw / (2 * z) + 120,
      y0: this.cam.y - this.vh / (2 * z) - 120,
      y1: this.cam.y + this.vh / (2 * z) + 160,
    };
    this.drawBackground(ctx, view);
    this.drawProps(ctx, game, view);
    this.drawRelics(ctx, game, view);
    this.drawStructures(ctx, game, view, player);
    this.drawUnits(ctx, game, view, player);
    this.drawWalls(ctx, game);
    this.drawProjectiles(ctx, game);
    this.drawEffects(ctx, game);
    this.drawParticles(ctx);
    this.drawFloaters(ctx, game);
    this.drawAbilityRange(ctx, game, player);
    this.drawCursor(ctx, game, player, mouse);
    ctx.restore();

    this.drawSnow(ctx);
  }

  drawSnow(ctx) {
    for (const f of this.snow) {
      const x = f.x * this.vw + Math.sin(this.time * 0.7 + f.ph) * 14 * f.z;
      const y = f.y * this.vh;
      ctx.globalAlpha = 0.10 + f.z * 0.22;
      ctx.fillStyle = '#dff6ff';
      ctx.beginPath(); ctx.arc(x, y, f.s * f.z, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const vg = ctx.createRadialGradient(this.vw / 2, this.vh / 2, this.vh * 0.45, this.vw / 2, this.vh / 2, this.vh * 0.95);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,4,6,.55)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, this.vw, this.vh);
  }

  drawBackground(ctx, v) {
    const x = Math.max(0, Math.floor(v.x0)), y = Math.max(0, Math.floor(v.y0));
    const w = Math.min(WORLD.w - x, Math.ceil(v.x1 - v.x0)), h = Math.min(WORLD.h - y, Math.ceil(v.y1 - v.y0));
    if (w > 0 && h > 0) ctx.drawImage(this.bg, x, y, w, h, x, y, w, h);
  }

  drawProps(ctx, game, v) {
    // 桥边冰晶柱与断柱（程序化，只画视野内）
    for (let x = Math.floor(v.x0 / 320) * 320; x < v.x1; x += 320) {
      for (let k = 0; k < 2; k++) {
        const id = Math.abs((x * 7 + k * 131) % 997);
        const yy = k === 0 ? 214 - (id % 34) : 786 + (id % 34);
        const h = 46 + (id % 60);
        ctx.save();
        ctx.translate(x + (id % 90), yy);
        ctx.fillStyle = 'rgba(6,14,18,.55)';
        ctx.beginPath(); ctx.ellipse(0, 6, 22, 8, 0, 0, 7); ctx.fill();
        const gd = ctx.createLinearGradient(0, -h, 0, 0);
        gd.addColorStop(0, 'rgba(140,215,240,.20)');
        gd.addColorStop(1, 'rgba(30,70,86,.05)');
        ctx.fillStyle = gd;
        ctx.beginPath();
        ctx.moveTo(-14, 4); ctx.lineTo(-6, -h); ctx.lineTo(7, -h * .82); ctx.lineTo(15, 4);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(170,230,250,.14)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
      }
    }
    // 中央符文地面呼吸光
    if (v.x0 < 3200 && v.x1 > 2800) {
      const a = 0.05 + Math.sin(this.time * 1.3) * 0.03;
      ctx.save();
      ctx.globalAlpha = a;
      const g2 = ctx.createRadialGradient(3000, 500, 20, 3000, 500, 260);
      g2.addColorStop(0, '#46e0ff'); g2.addColorStop(1, 'rgba(70,224,255,0)');
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(3000, 500, 260, 0, 7); ctx.fill();
      ctx.restore();
    }
  }

  drawRelics(ctx, game, v) {
    for (const r of game.relics) {
      if (r.x < v.x0 || r.x > v.x1 || r.y < v.y0 || r.y > v.y1) continue;
      const bob = Math.sin(this.time * 2 + r.x) * 5;
      ctx.save();
      ctx.translate(r.x, r.y + bob);
      const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, 46);
      grd.addColorStop(0, 'rgba(126,240,192,.5)');
      grd.addColorStop(1, 'rgba(126,240,192,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 7); ctx.fill();
      ctx.fillStyle = '#7ef0c0';
      ctx.beginPath();
      ctx.moveTo(0, -18); ctx.lineTo(12, 0); ctx.lineTo(0, 18); ctx.lineTo(-12, 0);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#d8fff0'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
    }
  }

  drawStructures(ctx, game, v, player) {
    for (const u of game.units) {
      if (!u.alive) continue;
      if (u.kind !== 'tower' && u.kind !== 'inhib' && u.kind !== 'nexus') continue;
      if (u.x < v.x0 - 200 || u.x > v.x1 + 200) continue;
      this.drawStructure(ctx, u, game, player);
    }
  }

  drawStructure(ctx, s, game, player) {
    const col = TEAM_COL[s.team];
    const glow = TEAM_GLOW[s.team];
    ctx.save();
    ctx.translate(s.x, s.y);

    // 底座
    ctx.fillStyle = 'rgba(4,10,12,.5)';
    ctx.beginPath(); ctx.ellipse(0, 18, s.r * 1.15, s.r * 0.5, 0, 0, 7); ctx.fill();

    if (s.kind === 'tower') {
      // 三层石台
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = ['#0d1a1f', '#122228', '#16282f'][i];
        ctx.beginPath(); ctx.ellipse(0, 26 - i * 10, 54 - i * 10, 22 - i * 4, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(120,180,200,.14)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 26 - i * 10, 54 - i * 10, 22 - i * 4, 0, 0, 7); ctx.stroke();
      }
      // 塔身（收分）
      const bodyGrad = ctx.createLinearGradient(-30, 0, 30, 0);
      bodyGrad.addColorStop(0, '#0c171b'); bodyGrad.addColorStop(.45, '#1b2f36'); bodyGrad.addColorStop(1, '#091216');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(-32, 18); ctx.lineTo(-22, -96); ctx.lineTo(-10, -112); ctx.lineTo(10, -112); ctx.lineTo(22, -96); ctx.lineTo(32, 18);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(120,190,210,.22)'; ctx.lineWidth = 2; ctx.stroke();
      // 符文槽
      for (let i = 0; i < 4; i++) {
        const y = 4 - i * 26;
        ctx.strokeStyle = glow; ctx.globalAlpha = .55 + Math.sin(this.time * 2 + i) * .15;
        ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(-16, y); ctx.lineTo(16, y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // 顶部托盘
      ctx.fillStyle = '#0e1b20';
      ctx.beginPath(); ctx.ellipse(0, -112, 30, 11, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = col; ctx.globalAlpha = .6; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, -112, 30, 11, 0, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
      // 顶部水晶
      const t = this.time * 1.2 + s.id;
      ctx.save();
      ctx.translate(0, -120);
      const gg = ctx.createRadialGradient(0, 0, 2, 0, 0, 66);
      gg.addColorStop(0, glow); gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, 66, 0, 7); ctx.fill();
      // 光柱
      const beam = ctx.createLinearGradient(0, -120, 0, 10);
      beam.addColorStop(0, glow); beam.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = beam; ctx.globalAlpha = .18;
      ctx.fillRect(-12, -110, 24, 120); ctx.globalAlpha = 1;
      ctx.rotate(Math.sin(t) * 0.12);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, -34); ctx.lineTo(18, 0); ctx.lineTo(0, 34); ctx.lineTo(-18, 0);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#eafcff'; ctx.lineWidth = 1.6; ctx.globalAlpha = .85; ctx.stroke();
      ctx.globalAlpha = .5; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(6, 0); ctx.lineTo(0, 28); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
      // 环
      ctx.strokeStyle = glow; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, -120, 34, 12, 0, 0, 7); ctx.stroke();
    } else if (s.kind === 'inhib') {
      ctx.fillStyle = '#101f24';
      ctx.beginPath(); ctx.ellipse(0, 20, 86, 36, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = col; ctx.globalAlpha = .5; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 20, 86, 36, 0, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
      const pulse = 1 + Math.sin(this.time * 2) * 0.05;
      ctx.save();
      ctx.translate(0, -46); ctx.scale(pulse, pulse);
      const grd = ctx.createRadialGradient(0, 0, 4, 0, 0, 90);
      grd.addColorStop(0, glow); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, -58); ctx.lineTo(28, -6); ctx.lineTo(16, 44); ctx.lineTo(-16, 44); ctx.lineTo(-28, -6);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#e8f8ff'; ctx.globalAlpha = .55; ctx.lineWidth = 2; ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = glow; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 10, 56, 18, 0, 0, 7); ctx.stroke();
      ctx.restore();
    } else {
      // nexus
      ctx.fillStyle = '#0c1a1f';
      ctx.beginPath(); ctx.ellipse(0, 46, 150, 62, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = col; ctx.globalAlpha = .45; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(0, 46, 150, 62, 0, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(0, -70);
      const grd = ctx.createRadialGradient(0, 0, 8, 0, 0, 190);
      grd.addColorStop(0, glow); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(0, 0, 190, 0, 7); ctx.fill();
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate(this.time * (i % 2 ? -0.5 : 0.42) + i);
        ctx.strokeStyle = glow; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(0, 0, 92 + i * 22, 26 + i * 8, 0, 0, 7); ctx.stroke();
        ctx.restore();
      }
      const pulse = 1 + Math.sin(this.time * 1.6) * 0.04;
      ctx.scale(pulse, pulse);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, -120); ctx.lineTo(52, -18); ctx.lineTo(28, 96); ctx.lineTo(-28, 96); ctx.lineTo(-52, -18);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#f0fcff'; ctx.globalAlpha = .6; ctx.lineWidth = 3; ctx.stroke();
      ctx.globalAlpha = .35;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(0, -108); ctx.lineTo(16, -20); ctx.lineTo(0, 82); ctx.lineTo(-8, -20); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // 敌方塔攻击范围提示
    if (s.kind === 'tower' && player && s.team !== player.team && dist(player.x, player.y, s.x, s.y) < 1200) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,90,100,.28)';
      ctx.setLineDash([14, 10]);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.def.range, 0, 7); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 血条
    if (s.hp < s.maxHp) this.bar(ctx, s.x, s.y - (s.kind === 'nexus' ? 210 : s.kind === 'inhib' ? 120 : 168), s.kind === 'tower' ? 76 : 110, s.hp / s.maxHp, s.team);
  }

  drawUnits(ctx, game, v, player) {
    const units = game.units.filter(u => u.alive && (u.kind === 'champion' || u.kind === 'minion'));
    units.sort((a, b) => a.y - b.y);
    for (const u of units) {
      if (u.x < v.x0 - 80 || u.x > v.x1 + 80 || u.y < v.y0 - 100 || u.y > v.y1 + 100) continue;
      if (u.kind === 'champion') this.drawChampion(ctx, u, game, player);
      else this.drawMinion(ctx, u);
    }
  }

  drawChampion(ctx, c, game, player) {
    const pal = c.def.palette;
    const cc = c.ccState();
    const moving = !!(c.moveTarget || c.attackTarget);
    const bob = moving ? Math.sin(this.time * 12 + c.id) * 2.2 : Math.sin(this.time * 2 + c.id) * 0.8;
    const stealth = cc.stealth > 0 && c.team !== player.team;
    ctx.save();
    ctx.globalAlpha = stealth ? 0.35 : 1;
    ctx.translate(c.x, c.y + bob);

    // 影子
    ctx.fillStyle = 'rgba(0,0,0,.42)';
    ctx.beginPath(); ctx.ellipse(0, 8, 22, 9, 0, 0, 7); ctx.fill();

    // 队伍光晕
    const gg = ctx.createRadialGradient(0, -6, 2, 0, -6, 46);
    gg.addColorStop(0, c.team === 'blue' ? 'rgba(58,160,255,.22)' : 'rgba(255,77,94,.2)');
    gg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, -6, 46, 0, 7); ctx.fill();

    // 队伍环
    const ringCol = TEAM_COL[c.team];
    ctx.strokeStyle = ringCol;
    ctx.globalAlpha = stealth ? .2 : .95;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 7, 27, 11.5, 0, 0, 7); ctx.stroke();
    ctx.globalAlpha = stealth ? .12 : .22;
    ctx.fillStyle = ringCol;
    ctx.beginPath(); ctx.ellipse(0, 7, 27, 11.5, 0, 0, 7); ctx.fill();
    ctx.globalAlpha = stealth ? .2 : 1;

    if (c === player) {
      const p = 0.6 + Math.sin(this.time * 4) * 0.25;
      ctx.strokeStyle = `rgba(120,255,200,${p})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 7, 31, 14, 0, 0, 7); ctx.stroke();
    }

    // 朝向单位向量（屏幕空间）
    const fx = Math.cos(c.facing), fy = Math.sin(c.facing) * 0.55;
    const flip = fx < -0.15 ? -1 : 1;

    ctx.save();
    ctx.scale(1.34, 1.34);

    // 队伍色披肩
    ctx.fillStyle = ringCol;
    ctx.globalAlpha = .85;
    ctx.beginPath();
    ctx.moveTo(-11, -19); ctx.quadraticCurveTo(0, -24, 11, -19);
    ctx.lineTo(9, -13); ctx.quadraticCurveTo(0, -17, -9, -13); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;

    // 披风
    ctx.fillStyle = pal.trim;
    ctx.save();
    const sway = Math.sin(this.time * 6 + c.id) * 2;
    ctx.beginPath();
    ctx.moveTo(-11, -18);
    ctx.quadraticCurveTo(-20 + sway, 2, -13 + sway, 15);
    ctx.lineTo(-2, 10);
    ctx.lineTo(9, 14);
    ctx.quadraticCurveTo(17, 0, 12, -18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 腿
    const stride = moving ? Math.sin(this.time * 13 + c.id) * 3.2 : 0;
    ctx.fillStyle = '#151d21';
    rr(ctx, -8, 2 + stride * .15, 6, 12 - stride * .3, 2); ctx.fill();
    rr(ctx, 2, 2 - stride * .15, 6, 12 + stride * .3, 2); ctx.fill();

    // 身体
    const bodyGrad = ctx.createLinearGradient(0, -22, 0, 8);
    bodyGrad.addColorStop(0, pal.body);
    bodyGrad.addColorStop(.7, pal.body);
    bodyGrad.addColorStop(1, pal.trim);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-10, -20); ctx.lineTo(10, -20);
    ctx.lineTo(12, 4); ctx.quadraticCurveTo(0, 8, -12, 4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(4,10,12,.55)'; ctx.lineWidth = 1.2; ctx.stroke();
    // 队伍色肩带
    ctx.strokeStyle = ringCol; ctx.globalAlpha = .9; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(-9, -16); ctx.lineTo(8, -4); ctx.stroke();
    ctx.globalAlpha = 1;

    // 手臂
    ctx.strokeStyle = pal.body; ctx.lineWidth = 4.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(-13, -4 + stride * .4); ctx.stroke();
    ctx.strokeStyle = pal.trim;
    ctx.beginPath(); ctx.moveTo(8, -14); ctx.lineTo(13, -6 - stride * .4); ctx.stroke();

    // 肩甲
    ctx.fillStyle = pal.trim;
    ctx.beginPath(); ctx.ellipse(-10, -17, 5.5, 6, -.25, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, -17, 5.5, 6, .25, 0, 7); ctx.fill();
    ctx.strokeStyle = ringCol; ctx.globalAlpha = .5; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(-10, -17, 5.5, 6, -.25, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(10, -17, 5.5, 6, .25, 0, 7); ctx.stroke();
    ctx.globalAlpha = 1;

    // 头
    ctx.fillStyle = pal.skin;
    ctx.beginPath(); ctx.arc(0, -28, 8, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.stroke();
    // 眼睛（朝向）
    ctx.fillStyle = 'rgba(20,26,30,.9)';
    const ex = flip * 1.8;
    ctx.beginPath(); ctx.arc(ex - 2.6, -29, 1.2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(ex + 2.6, -29, 1.2, 0, 7); ctx.fill();
    // 头发
    ctx.fillStyle = pal.hair;
    ctx.beginPath(); ctx.arc(0, -29.5, 8.2, Math.PI * 1.02, Math.PI * 2.02); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-8, -28); ctx.quadraticCurveTo(-11, -22, -7.5, -20);
    ctx.lineTo(-4, -26); ctx.closePath(); ctx.fill();

    // 头部装饰
    this.drawHeadgear(ctx, c, pal, flip);

    // 武器
    this.drawWeapon(ctx, c, pal, fx, fy, flip);

    // 受击闪白
    if (c.flash > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(.7, c.flash * 4);
      ctx.fillStyle = '#fff';
      rr(ctx, -11, -30, 22, 40, 8); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    // 护盾泡
    if (c.shield > 0) {
      ctx.strokeStyle = 'rgba(150,225,255,.75)'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2 + this.time;
        const px = Math.cos(a) * 24, py = Math.sin(a) * 22 - 12;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = 'rgba(120,210,255,.10)'; ctx.fill();
    }

    // 状态图标
    let iconY = -46;
    if (cc.stun) { this.statusIcon(ctx, '✷', '#ffd166', iconY); iconY -= 14; }
    if (cc.slow) { this.statusIcon(ctx, '❄', '#9fe0ff', iconY); iconY -= 14; }
    if (cc.charm) { this.statusIcon(ctx, '♥', '#ff9ec4', iconY); }

    ctx.restore();
    ctx.restore();

    // 血条
    const w = 66;
    const hy = c.y - 66 + (c.airborne > 0 ? -6 : 0);
    this.bar(ctx, c.x, hy, w, c.hp / c.maxHp, c.team, c.shield / c.maxHp);
    // 等级
    ctx.fillStyle = 'rgba(4,10,12,.85)';
    ctx.fillRect(c.x - w / 2 - 15, hy - 5, 13, 11);
    ctx.strokeStyle = 'rgba(200,169,106,.6)'; ctx.lineWidth = 1;
    ctx.strokeRect(c.x - w / 2 - 15, hy - 5, 13, 11);
    ctx.fillStyle = '#f0d9a2';
    ctx.font = '700 9px ui-monospace,Menlo,monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(c.level), c.x - w / 2 - 8.5, hy + .5);

    // 雪球标记
    if (c.snowball && c.snowball.target) {
      const t = c.snowball.target;
      ctx.strokeStyle = '#bfe9ff'; ctx.lineWidth = 2; ctx.globalAlpha = .8;
      ctx.beginPath(); ctx.ellipse(t.x, t.y + 8, 30, 13, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
    }

    if (c === player) {
      const by = hy - 22 + Math.sin(this.time * 5) * 2;
      ctx.fillStyle = '#8affc4';
      ctx.beginPath(); ctx.moveTo(c.x, by + 7); ctx.lineTo(c.x - 5, by); ctx.lineTo(c.x + 5, by); ctx.closePath(); ctx.fill();
    }

    // 名字标签
    ctx.font = '600 10px system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = c === player ? 'rgba(255,236,180,.95)'
      : c.team === 'blue' ? 'rgba(150,205,255,.8)' : 'rgba(255,140,148,.85)';
    ctx.fillText(c === player ? '你' : c.name, c.x, hy - 11);
  }

  statusIcon(ctx, ch, color, y) {
    ctx.fillStyle = color;
    ctx.font = '700 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(ch, 0, y);
  }

  drawHeadgear(ctx, c, pal, flip) {
    const id = c.def.id;
    ctx.save();
    ctx.translate(0, -27);
    if (id === 'ashe') {
      ctx.fillStyle = pal.trim;
      ctx.beginPath(); ctx.moveTo(-9, 2); ctx.lineTo(0, -12); ctx.lineTo(9, 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#bfe9ff'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-9, 2); ctx.lineTo(0, -12); ctx.lineTo(9, 2); ctx.stroke();
    } else if (id === 'ziggs') {
      ctx.fillStyle = '#3a3a3a';
      ctx.beginPath(); ctx.arc(0, -2, 8.5, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#ffcf7a';
      ctx.beginPath(); ctx.arc(3, 0, 3.4, 0, 7); ctx.fill();
      ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-7, -1); ctx.lineTo(7, -1); ctx.stroke();
    } else if (id === 'lux') {
      ctx.strokeStyle = 'rgba(255,236,160,.9)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -4, 10, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      ctx.fillStyle = '#ffe9a8';
      ctx.beginPath(); ctx.arc(-9, -9, 2, 0, 7); ctx.fill();
    } else if (id === 'jax') {
      ctx.fillStyle = '#6a5a3a';
      ctx.beginPath(); ctx.ellipse(0, -6, 11, 4, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#2a2a22';
      ctx.fillRect(-6, -1, 12, 2);
    } else if (id === 'alistar') {
      ctx.strokeStyle = '#e8d9c0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-7, -4); ctx.quadraticCurveTo(-16, -12, -12, -18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(7, -4); ctx.quadraticCurveTo(16, -12, 12, -18); ctx.stroke();
      ctx.fillStyle = '#c9a06a';
      ctx.beginPath(); ctx.ellipse(0, 1, 4, 3, 0, 0, 7); ctx.fill();
    } else if (id === 'yasuo') {
      ctx.fillStyle = '#1f1f1f';
      ctx.beginPath(); ctx.arc(0, -6, 5, 0, 7); ctx.fill();
      ctx.strokeStyle = '#5f7a8a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-8, -1); ctx.lineTo(8, -3); ctx.stroke();
    } else if (id === 'ahri') {
      ctx.fillStyle = pal.hair;
      ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-11, -17); ctx.lineTo(-3, -8); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(8, -6); ctx.lineTo(11, -17); ctx.lineTo(3, -8); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,158,196,.7)'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(-4 + i * 4, 6);
        ctx.quadraticCurveTo(-18 + i * 8, 18, -8 + i * 6, 26); ctx.stroke();
      }
    } else if (id === 'sion') {
      ctx.fillStyle = '#4a5a4a';
      ctx.beginPath(); ctx.moveTo(-9, 2); ctx.lineTo(-6, -10); ctx.lineTo(6, -10); ctx.lineTo(9, 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c8c8b0';
      ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(-16, -18); ctx.lineTo(-4, -10); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(8, -8); ctx.lineTo(16, -18); ctx.lineTo(4, -10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff7a3a';
      ctx.fillRect(-5, -4, 3, 2); ctx.fillRect(2, -4, 3, 2);
    } else if (id === 'sona') {
      ctx.fillStyle = pal.hair;
      ctx.beginPath(); ctx.moveTo(-9, 0); ctx.quadraticCurveTo(-14, 14, -7, 20); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(160,230,255,.8)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, -3, 11, 0, 7); ctx.stroke();
    } else if (id === 'wukong') {
      ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, -5, 9, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.fillStyle = '#ffd27a';
      ctx.beginPath(); ctx.arc(9, -13, 2.2, 0, 7); ctx.fill();
      ctx.fillStyle = '#e8c3a0';
      ctx.beginPath(); ctx.ellipse(0, 3, 7, 4, 0, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  drawWeapon(ctx, c, pal, fx, fy, flip) {
    const ang = Math.atan2(fy, fx);
    ctx.save();
    ctx.translate(flip * 8, -14);
    ctx.rotate(ang + (flip < 0 ? Math.PI : 0));
    const w = pal.weapon;
    ctx.strokeStyle = '#c9d6dc'; ctx.fillStyle = '#c9d6dc'; ctx.lineWidth = 2.4;
    if (w === 'bow') {
      ctx.beginPath(); ctx.arc(8, 0, 13, -Math.PI * .62, Math.PI * .62); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, -11); ctx.lineTo(12, 11); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(26, 0); ctx.stroke();
    } else if (w === 'staff' || w === 'lamp') {
      ctx.beginPath(); ctx.moveTo(-6, 4); ctx.lineTo(18, -14); ctx.stroke();
      ctx.fillStyle = w === 'lamp' ? '#ffd27a' : '#ffe9a8';
      ctx.beginPath(); ctx.arc(20, -16, 4.2, 0, 7); ctx.fill();
      ctx.globalAlpha = .35; ctx.beginPath(); ctx.arc(20, -16, 9, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    } else if (w === 'katana' || w === 'sword') {
      ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(28, 2); ctx.stroke();
      ctx.strokeStyle = '#f0f4f6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4, -5); ctx.lineTo(26, 1); ctx.stroke();
    } else if (w === 'axe') {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, -4); ctx.stroke();
      ctx.fillStyle = '#b9c6cc';
      ctx.beginPath(); ctx.moveTo(20, -12); ctx.lineTo(30, -3); ctx.lineTo(20, 6); ctx.closePath(); ctx.fill();
    } else if (w === 'orb') {
      ctx.fillStyle = '#ffb0d0';
      ctx.beginPath(); ctx.arc(18, -6, 5, 0, 7); ctx.fill();
      ctx.globalAlpha = .4; ctx.beginPath(); ctx.arc(18, -6, 11, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    } else if (w === 'bomb') {
      ctx.fillStyle = '#ffcf7a';
      ctx.beginPath(); ctx.arc(16, -8, 6, 0, 7); ctx.fill();
      ctx.strokeStyle = '#8a5a10'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(16, -14); ctx.quadraticCurveTo(20, -20, 24, -18); ctx.stroke();
    } else if (w === 'harp') {
      ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(10, -4, 12, -Math.PI * .9, Math.PI * .2); ctx.stroke();
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(2 + i * 4, -12); ctx.lineTo(6 + i * 4, 2); ctx.stroke(); }
    } else if (w === 'staff2') {
      ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(20, -10); ctx.stroke();
      ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.arc(22, -12, 4, 0, 7); ctx.fill();
    } else if (w === 'fists') {
      ctx.fillStyle = '#8a6a52';
      ctx.beginPath(); ctx.arc(16, -4, 5.5, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(16, 6, 5, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  drawMinion(ctx, m) {
    const col = TEAM_COL[m.team];
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.ellipse(0, 5, 12, 5, 0, 0, 7); ctx.fill();
    const bob = Math.sin(this.time * 10 + m.id) * 1.2;
    ctx.translate(0, bob);
    const size = m.mtype === 'cannon' ? 1.35 : m.mtype === 'super' ? 1.5 : 1;
    ctx.scale(size, size);
    // 身体
    ctx.fillStyle = m.mtype === 'caster' ? '#2a3a52' : '#33424a';
    rr(ctx, -8, -18, 16, 20, 5); ctx.fill();
    ctx.fillStyle = col; ctx.globalAlpha = .85;
    rr(ctx, -8, -18, 16, 5, 2); ctx.fill();
    ctx.globalAlpha = 1;
    // 头
    ctx.fillStyle = m.mtype === 'caster' ? '#9fb4ff' : '#c6d6dd';
    ctx.beginPath(); ctx.arc(0, -22, 4.6, 0, 7); ctx.fill();
    // 武器
    if (m.mtype === 'caster') {
      ctx.fillStyle = '#9fb4ff';
      ctx.beginPath(); ctx.arc(9, -12, 3, 0, 7); ctx.fill();
    } else if (m.mtype === 'cannon') {
      ctx.fillStyle = '#ffd27a';
      ctx.fillRect(4, -14, 16, 5);
      ctx.fillStyle = '#8a5a10'; ctx.fillRect(18, -15, 5, 7);
    } else if (m.mtype === 'super') {
      ctx.fillStyle = '#ffb04d';
      ctx.beginPath(); ctx.moveTo(8, -18); ctx.lineTo(22, -10); ctx.lineTo(8, -4); ctx.closePath(); ctx.fill();
    } else {
      ctx.strokeStyle = '#c8d8df'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(5, -4); ctx.lineTo(18, -18); ctx.stroke();
      ctx.fillStyle = '#8fa6ad'; ctx.beginPath(); ctx.arc(19, -19, 3, 0, 7); ctx.fill();
    }
    ctx.restore();
    // 血条
    if (m.hp < m.maxHp) this.bar(ctx, m.x, m.y - 40 * size, 30 * size, m.hp / m.maxHp, m.team, 0, true);
  }

  bar(ctx, x, y, w, pct, team, shieldPct = 0, small = false) {
    const h = small ? 3.5 : 6;
    ctx.fillStyle = 'rgba(2,7,9,.85)';
    ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = team === 'blue' ? '#41d97a' : '#ff4d5e';
    ctx.fillRect(x - w / 2, y, w * clamp(pct, 0, 1), h);
    if (shieldPct > 0) {
      ctx.fillStyle = 'rgba(190,240,255,.9)';
      ctx.fillRect(x - w / 2 + w * clamp(pct, 0, 1), y, w * clamp(shieldPct, 0, 1 - clamp(pct, 0, 1)), h);
    }
    ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1;
    ctx.strokeRect(x - w / 2, y, w, h);
  }

  drawWalls(ctx, game) {
    for (const w of game.walls) {
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.rotate(w.ang);
      ctx.globalAlpha = clamp(w.t / 1.2, 0, 1) * 0.7;
      const grd = ctx.createLinearGradient(0, -w.width / 2, 0, w.width / 2);
      grd.addColorStop(0, 'rgba(150,225,255,0)');
      grd.addColorStop(.5, 'rgba(190,240,255,.55)');
      grd.addColorStop(1, 'rgba(150,225,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(-10, -w.width / 2, 20, w.width);
      ctx.strokeStyle = 'rgba(220,250,255,.5)'; ctx.lineWidth = 1;
      for (let i = -w.width / 2; i < w.width / 2; i += 26) {
        ctx.beginPath(); ctx.moveTo(-10, i); ctx.lineTo(10, i + 14); ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawProjectiles(ctx, game) {
    for (const p of game.projectiles) {
      ctx.save();
      if (p.visual === 'bolt') {
        const a = Math.atan2(p.vy, p.vx);
        ctx.translate(p.x, p.y); ctx.rotate(a);
        ctx.strokeStyle = p.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(6, 0); ctx.stroke();
        ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.arc(7, 0, 2.4, 0, 7); ctx.fill();
      } else if (p.visual === 'snowball') {
        ctx.translate(p.x, p.y);
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 22);
        g.addColorStop(0, 'rgba(230,250,255,.95)'); g.addColorStop(1, 'rgba(160,220,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fill();
        ctx.fillStyle = '#eaf9ff'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill();
      } else {
        const grd = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.r * 3.2);
        grd.addColorStop(0, p.color);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, 7); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.55, 0, 7); ctx.fill();
        if (p.trail.length > 2) {
          ctx.strokeStyle = p.color; ctx.globalAlpha = .5; ctx.lineWidth = p.r * .8;
          ctx.beginPath();
          p.trail.forEach((t, i) => i ? ctx.lineTo(t.x, t.y) : ctx.moveTo(t.x, t.y));
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  drawEffects(ctx, game) {
    for (const fx of this.effects) {
      const k = fx.t / fx.life;
      const d = fx.d;
      ctx.save();
      if (fx.kind === 'hit' || fx.kind === 'muzzle') {
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = d.color || '#fff';
        ctx.beginPath(); ctx.arc(d.x, d.y, 3 + k * 10, 0, 7); ctx.fill();
      } else if (fx.kind === 'slash') {
        ctx.translate(d.x, d.y);
        ctx.rotate(d.ang || 0);
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = d.color || '#fff'; ctx.lineWidth = 5 * (1 - k) + 1;
        ctx.beginPath(); ctx.arc(-6, 0, 26, -0.9, 0.9); ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(-6, 0, 34, -0.7, 0.7); ctx.stroke();
      } else if (fx.kind === 'explosion') {
        const r = d.r * (0.5 + k * 0.7);
        const grd = ctx.createRadialGradient(d.x, d.y, 2, d.x, d.y, r);
        grd.addColorStop(0, `rgba(255,240,200,${(1 - k) * .9})`);
        grd.addColorStop(.4, `rgba(255,160,80,${(1 - k) * .65})`);
        grd.addColorStop(1, 'rgba(255,80,40,0)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, 7); ctx.fill();
        ctx.strokeStyle = `rgba(255,220,160,${1 - k})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * (0.6 + k * 0.6), 0, 7); ctx.stroke();
      } else if (fx.kind === 'cone') {
        const a0 = d.ang - d.angle * Math.PI / 360, a1 = d.ang + d.angle * Math.PI / 360;
        ctx.globalAlpha = (1 - k) * .55;
        const grd = ctx.createRadialGradient(d.x, d.y, 10, d.x, d.y, d.range);
        grd.addColorStop(0, d.color); grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.arc(d.x, d.y, d.range, a0, a1); ctx.closePath(); ctx.fill();
      } else if (fx.kind === 'beam') {
        ctx.globalAlpha = 1 - k;
        ctx.translate(d.x, d.y); ctx.rotate(d.ang);
        const grd = ctx.createLinearGradient(0, 0, d.len, 0);
        grd.addColorStop(0, '#ffffff'); grd.addColorStop(.3, d.color); grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, -d.width / 2, d.len, d.width);
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        ctx.fillRect(0, -d.width / 6, d.len, d.width / 3);
      } else if (fx.kind === 'nova') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = d.color; ctx.lineWidth = 8 * (1 - k) + 1;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * (0.3 + k * 0.9), 0, 7); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * (0.2 + k * 0.85), 0, 7); ctx.stroke();
      } else if (fx.kind === 'marker') {
        const r = d.r;
        ctx.translate(d.x, d.y);
        ctx.strokeStyle = d.color; ctx.globalAlpha = .55 + Math.sin(this.time * 20) * .2;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
        ctx.globalAlpha = .18; ctx.fillStyle = d.color;
        ctx.beginPath(); ctx.arc(0, 0, r * k, 0, 7); ctx.fill();
      } else if (fx.kind === 'shield') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = d.color; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(d.x, d.y - 12, 30 + k * 10, 0, 7); ctx.stroke();
      } else if (fx.kind === 'shieldbreak') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = d.color; ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(d.x + Math.cos(a) * 18, d.y + Math.sin(a) * 10);
          ctx.lineTo(d.x + Math.cos(a) * (32 + k * 20), d.y + Math.sin(a) * (18 + k * 12));
          ctx.stroke();
        }
      } else if (fx.kind === 'heal' || fx.kind === 'buff') {
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = fx.kind === 'heal' ? '#4fe08a' : d.color;
        for (let i = 0; i < 3; i++) {
          const yy = d.y - 10 - k * 40 - i * 12;
          ctx.fillRect(d.x - 12 + i * 10, yy, 2, 8);
          ctx.fillRect(d.x - 15 + i * 10, yy + 3, 8, 2);
        }
      } else if (fx.kind === 'dash') {
        ctx.globalAlpha = (1 - k) * .5;
        ctx.strokeStyle = d.color; ctx.lineWidth = 10 * (1 - k);
        ctx.setLineDash([12, 10]);
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x2, d.y2); ctx.stroke();
        ctx.setLineDash([]);
      } else if (fx.kind === 'flash') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(d.x0, d.y0); ctx.lineTo(d.x1, d.y1); ctx.stroke();
        ctx.fillStyle = 'rgba(255,240,200,.5)';
        ctx.beginPath(); ctx.arc(d.x1, d.y1, 18 * (1 - k), 0, 7); ctx.fill();
      } else if (fx.kind === 'levelup') {
        ctx.globalAlpha = 1 - k;
        const grd = ctx.createLinearGradient(d.x, d.y - 90, d.x, d.y + 10);
        grd.addColorStop(0, 'rgba(255,220,140,0)');
        grd.addColorStop(1, 'rgba(255,220,140,.65)');
        ctx.fillStyle = grd;
        ctx.fillRect(d.x - 16, d.y - 90, 32, 100);
        ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(d.x, d.y + 8, 26 * (1 + k), 10 * (1 + k), 0, 0, 7); ctx.stroke();
      } else if (fx.kind === 'death') {
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = 'rgba(255,70,70,.35)';
        ctx.beginPath(); ctx.arc(d.x, d.y, 30 + k * 40, 0, 7); ctx.fill();
      } else if (fx.kind === 'structureDeath') {
        const r = d.r * (1 + k * 1.6);
        const grd = ctx.createRadialGradient(d.x, d.y, 4, d.x, d.y, r * 2);
        grd.addColorStop(0, `rgba(255,240,190,${1 - k})`);
        grd.addColorStop(.4, `rgba(255,140,60,${(1 - k) * .8})`);
        grd.addColorStop(1, 'rgba(120,30,10,0)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(d.x, d.y, r * 2, 0, 7); ctx.fill();
      } else if (fx.kind === 'relic') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = '#7ef0c0'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(d.x, d.y, 20 + k * 40, 0, 7); ctx.stroke();
      } else if (fx.kind === 'echo') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = '#c9a6ff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(d.x, d.y - 10, 18 + k * 50, 0, 7); ctx.stroke();
      } else if (fx.kind === 'bolt') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = d.color; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(d.x0, d.y0);
        const mx = (d.x0 + d.x1) / 2 + (Math.random() - .5) * 30;
        const my = (d.y0 + d.y1) / 2 + (Math.random() - .5) * 30;
        ctx.quadraticCurveTo(mx, my, d.x1, d.y1); ctx.stroke();
      } else if (fx.kind === 'shock') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = d.color; ctx.lineWidth = 5 * (1 - k) + 1;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * (0.4 + k * 0.8), 0, 7); ctx.stroke();
      } else if (fx.kind === 'execute') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = '#ff4d5e'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(d.x - 30, d.y - 30); ctx.lineTo(d.x + 30, d.y + 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(d.x + 30, d.y - 30); ctx.lineTo(d.x - 30, d.y + 30); ctx.stroke();
      } else if (fx.kind === 'snowmark') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = '#bfe9ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(d.x, d.y, 24 + k * 30, 0, 7); ctx.stroke();
      } else if (fx.kind === 'stun' || fx.kind === 'root' || fx.kind === 'charm' || fx.kind === 'knockup') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = fx.kind === 'charm' ? '#ff9ec4' : '#ffd166'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(d.x, d.y - 40, 14 + k * 8, 0, 7); ctx.stroke();
      } else if (fx.kind === 'respawn') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = '#7ef0c0'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(d.x, d.y, 40 * (1 + k), 16 * (1 + k), 0, 0, 7); ctx.stroke();
      } else if (fx.kind === 'blood') {
        ctx.globalAlpha = (1 - k) * .5;
        ctx.fillStyle = '#7a1a1a';
        ctx.beginPath(); ctx.ellipse(d.x, d.y + 6, 26 * (1 + k), 10, 0, 0, 7); ctx.fill();
      } else if (fx.kind === 'minionDeath') {
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = TEAM_COL[d.team];
        ctx.beginPath(); ctx.arc(d.x, d.y, 8 + k * 12, 0, 7); ctx.fill();
      } else if (fx.kind === 'wall') {
        ctx.globalAlpha = .25 * (1 - k);
        ctx.strokeStyle = d.color; ctx.lineWidth = 2;
        ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.ang);
        ctx.strokeRect(-d.width / 2, -10, d.width, 20);
        ctx.restore();
      } else if (fx.kind === 'wallblock') {
        ctx.globalAlpha = 1 - k; ctx.fillStyle = '#bfe9ff';
        ctx.beginPath(); ctx.arc(d.x, d.y, 6 + k * 10, 0, 7); ctx.fill();
      } else if (fx.kind === 'castline') {
        ctx.globalAlpha = (1 - k) * .35;
        ctx.translate(d.x, d.y); ctx.rotate(d.ang);
        ctx.fillStyle = d.color;
        ctx.fillRect(0, -12, d.len, 24);
      }
      ctx.restore();
    }
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawFloaters(ctx, game) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const f of game.floaters) {
      const k = f.t / f.life;
      ctx.globalAlpha = 1 - k;
      ctx.font = `800 ${f.size}px ui-monospace,Menlo,monospace`;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.7)';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  drawAbilityRange(ctx, game, player) {
    const slot = window.__aram && window.__aram.ui && window.__aram.ui.hoverSlot;
    if (slot == null || slot < 0 || !player || !player.alive) return;
    const ab = player.def.abilities[slot];
    if (!ab) return;
    const rank = player.abilityRank(slot);
    if (rank <= 0) return;
    const r = ab.range || ab.radius || 500;
    ctx.save();
    ctx.strokeStyle = 'rgba(140,240,255,.35)';
    ctx.setLineDash([10, 8]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(player.x, player.y, r, 0, 7); ctx.stroke();
    ctx.setLineDash([]);
    if (ab.radius) {
      ctx.strokeStyle = 'rgba(140,240,255,.18)';
      ctx.beginPath(); ctx.arc(player.x, player.y, ab.radius, 0, 7); ctx.stroke();
    }
    ctx.restore();
  }

  drawCursor(ctx, game, player, mouse) {
    const w = this.screenToWorld(mouse.x, mouse.y);
    let hover = null;
    for (const e of game.units) {
      if (!e.alive || e.team === player.team) continue;
      if (e.kind === 'champion' || e.kind === 'minion') {
        if (dist(w.x, w.y, e.x, e.y) < e.r + 14) { hover = e; break; }
      }
    }
    ctx.save();
    ctx.translate(w.x, w.y);
    ctx.strokeStyle = hover ? 'rgba(255,90,100,.9)' : 'rgba(160,255,220,.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -13); ctx.lineTo(9, 0); ctx.lineTo(0, 13); ctx.lineTo(-9, 0); ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, 7); ctx.fillStyle = ctx.strokeStyle; ctx.fill();
    ctx.restore();
  }

  /* ---------- 小地图 ---------- */
  drawMinimap(canvas, game, player) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const sx = w / WORLD.w, sy = h / WORLD.h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.miniBg, 0, 0, w, h);
    for (const u of game.units) {
      if (!u.alive) continue;
      if (u.kind === 'tower' || u.kind === 'inhib' || u.kind === 'nexus') {
        ctx.fillStyle = u.team === 'blue' ? '#5ab6ff' : '#ff6b78';
        const s = u.kind === 'nexus' ? 7 : u.kind === 'inhib' ? 6 : 4.5;
        ctx.fillRect(u.x * sx - s / 2, u.y * sy - s / 2, s, s);
      }
    }
    for (const u of game.units) {
      if (!u.alive) continue;
      if (u.kind === 'minion') {
        ctx.fillStyle = u.team === 'blue' ? 'rgba(90,182,255,.55)' : 'rgba(255,107,120,.55)';
        ctx.fillRect(u.x * sx - 1, u.y * sy - 1, 2, 2);
      } else if (u.kind === 'champion') {
        ctx.beginPath();
        ctx.arc(u.x * sx, u.y * sy, u === player ? 4 : 3.2, 0, 7);
        ctx.fillStyle = u === player ? '#c9ffe8' : (u.team === 'blue' ? '#5ab6ff' : '#ff6b78');
        ctx.fill();
        if (u === player) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke(); }
      }
    }
    // 视野框
    const vx = (this.cam.x - this.vw / (2 * this.cam.zoom)) * sx;
    const vy = (this.cam.y - this.vh / (2 * this.cam.zoom)) * sy;
    const vw = (this.vw / this.cam.zoom) * sx;
    const vh = (this.vh / this.cam.zoom) * sy;
    ctx.strokeStyle = 'rgba(200,169,106,.75)'; ctx.lineWidth = 1;
    ctx.strokeRect(vx, vy, vw, vh);
  }
}

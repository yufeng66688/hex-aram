/* ============================================================
   UI：HUD / 商店 / 强化卡 / 计分板 / 击杀播报
   ============================================================ */
import { ITEMS, ITEM_BY_ID, AUGMENTS, AUGMENT_BY_ID, RARITY_LABEL, TEAM } from './data.js';

const $ = (id) => document.getElementById(id);

function paintPortrait(canvas, def, team = 'blue') {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const pal = def.palette;
  const col = team === 'blue' ? '#3aa0ff' : '#ff4d5e';
  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#12262c'); bg.addColorStop(1, '#050c0f');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * .5, h * .62, 4, w * .5, h * .62, w * .55);
  glow.addColorStop(0, team === 'blue' ? 'rgba(58,160,255,.35)' : 'rgba(255,77,94,.3)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

  // 阵营底带 + 英雄色调
  ctx.fillStyle = team === 'blue' ? 'rgba(58,160,255,.18)' : 'rgba(255,77,94,.18)';
  ctx.fillRect(0, 0, w, h * .22);
  ctx.globalAlpha = .28;
  ctx.fillStyle = pal.body;
  ctx.fillRect(0, h * .72, w, h * .28);
  ctx.globalAlpha = 1;
  const id = def.id;
  ctx.save();
  ctx.translate(w / 2, h * .52);
  if (id === 'ashe') {
    ctx.fillStyle = pal.trim;
    ctx.beginPath(); ctx.moveTo(-20, 6); ctx.lineTo(0, -22); ctx.lineTo(20, 6); ctx.closePath(); ctx.fill();
  } else if (id === 'ziggs') {
    ctx.fillStyle = 'rgba(40,40,40,.9)';
    ctx.beginPath(); ctx.arc(0, -8, 17, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#ffcf7a';
    ctx.beginPath(); ctx.arc(6, -4, 6, 0, 7); ctx.fill();
  } else if (id === 'lux') {
    ctx.strokeStyle = 'rgba(255,236,160,.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -14, 18, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  } else if (id === 'jax') {
    ctx.fillStyle = '#6a5a3a';
    ctx.beginPath(); ctx.ellipse(0, -16, 22, 6, 0, 0, 7); ctx.fill();
  } else if (id === 'alistar') {
    ctx.strokeStyle = '#e8d9c0'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-12, -8); ctx.quadraticCurveTo(-30, -26, -22, -36); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, -8); ctx.quadraticCurveTo(30, -26, 22, -36); ctx.stroke();
  } else if (id === 'yasuo') {
    ctx.fillStyle = '#1f1f1f';
    ctx.beginPath(); ctx.arc(0, -18, 10, 0, 7); ctx.fill();
  } else if (id === 'ahri') {
    ctx.fillStyle = pal.hair;
    ctx.beginPath(); ctx.moveTo(-14, -10); ctx.lineTo(-20, -34); ctx.lineTo(-6, -16); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(14, -10); ctx.lineTo(20, -34); ctx.lineTo(6, -16); ctx.closePath(); ctx.fill();
  } else if (id === 'sion') {
    ctx.fillStyle = '#4a5a4a';
    ctx.beginPath(); ctx.moveTo(-20, 6); ctx.lineTo(-13, -22); ctx.lineTo(13, -22); ctx.lineTo(20, 6); ctx.closePath(); ctx.fill();
  } else if (id === 'sona') {
    ctx.strokeStyle = 'rgba(160,230,255,.85)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -10, 22, 0, 7); ctx.stroke();
  } else if (id === 'wukong') {
    ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, -14, 18, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.translate(w / 2, h * .82);
  const s = w / 108;
  ctx.scale(s, s);
  // 肩
  ctx.fillStyle = pal.trim;
  ctx.beginPath();
  ctx.moveTo(-42, 8); ctx.quadraticCurveTo(-40, -34, 0, -40);
  ctx.quadraticCurveTo(40, -34, 42, 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = pal.body;
  ctx.beginPath();
  ctx.moveTo(-30, 4); ctx.quadraticCurveTo(-26, -26, 0, -30);
  ctx.quadraticCurveTo(26, -26, 30, 4); ctx.closePath(); ctx.fill();
  // 头
  ctx.fillStyle = pal.skin;
  ctx.beginPath(); ctx.arc(0, -54, 22, 0, 7); ctx.fill();
  // 头发
  ctx.fillStyle = pal.hair;
  ctx.beginPath(); ctx.arc(0, -58, 23, Math.PI * .95, Math.PI * 2.05); ctx.fill();
  ctx.beginPath(); ctx.arc(-14, -56, 12, Math.PI * .8, Math.PI * 1.6); ctx.fill();
  // 眼
  ctx.fillStyle = 'rgba(20,30,36,.9)';
  ctx.beginPath(); ctx.ellipse(-8, -52, 3, 4, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8, -52, 3, 4, 0, 0, 7); ctx.fill();
  // 武器 / 头饰
  const wp = pal.weapon;
  ctx.strokeStyle = '#cfdbe1'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  if (wp === 'bow') {
    ctx.beginPath(); ctx.arc(40, -34, 26, -1.15, 1.15); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(40, -60); ctx.lineTo(40, -8); ctx.stroke();
  } else if (wp === 'staff' || wp === 'lamp' || wp === 'staff2') {
    ctx.beginPath(); ctx.moveTo(30, -6); ctx.lineTo(54, -74); ctx.stroke();
    ctx.fillStyle = wp === 'lamp' ? '#ffd27a' : pal.body;
    ctx.beginPath(); ctx.arc(56, -80, 7, 0, 7); ctx.fill();
  } else if (wp === 'katana' || wp === 'sword') {
    ctx.beginPath(); ctx.moveTo(26, -18); ctx.lineTo(62, -74); ctx.stroke();
  } else if (wp === 'axe') {
    ctx.beginPath(); ctx.moveTo(30, -8); ctx.lineTo(50, -70); ctx.stroke();
    ctx.fillStyle = '#c8d4da';
    ctx.beginPath(); ctx.moveTo(44, -82); ctx.lineTo(66, -66); ctx.lineTo(48, -56); ctx.closePath(); ctx.fill();
  } else if (wp === 'harp') {
    ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(40, -34, 24, -1.3, .9); ctx.stroke();
  } else if (wp === 'bomb') {
    ctx.fillStyle = '#ffcf7a';
    ctx.beginPath(); ctx.arc(46, -30, 9, 0, 7); ctx.fill();
    ctx.strokeStyle = '#8a5a10'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(46, -39); ctx.quadraticCurveTo(52, -50, 58, -46); ctx.stroke();
  } else if (wp === 'fists') {
    ctx.fillStyle = '#a8805e';
    ctx.beginPath(); ctx.arc(34, -24, 9, 0, 7); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(30, -8); ctx.lineTo(52, -70); ctx.stroke();
  }
  ctx.restore();

  // 边框
  ctx.strokeStyle = 'rgba(200,169,106,.7)'; ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fillRect(0, h - 16, w, 16);
  ctx.fillStyle = col;
  ctx.fillRect(0, h - 16, w * .5, 2);
}

function paintAbility(canvas, ab, def, slot) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const c1 = ab.color || def.palette.body;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, c1);
  bg.addColorStop(.55, '#12232a');
  bg.addColorStop(1, '#060d10');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = .5;
  const glow = ctx.createRadialGradient(w * .5, h * .3, 2, w * .5, h * .3, w * .7);
  glow.addColorStop(0, '#ffffff'); glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.globalAlpha = .25;
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, 0); ctx.lineTo(Math.random() * w, h); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,255,255,.96)';
  ctx.fillStyle = 'rgba(255,255,255,.98)';
  ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = 6;
  ctx.lineWidth = w * .085;
  ctx.translate(w / 2, h / 2);
  const t = ab.type;
  if (t === 'line') { ctx.beginPath(); ctx.moveTo(-13, 8); ctx.lineTo(13, -8); ctx.stroke(); ctx.beginPath(); ctx.arc(13, -8, 3, 0, 7); ctx.fill(); }
  else if (t === 'cone') { ctx.beginPath(); ctx.moveTo(-14, 12); ctx.lineTo(14, -4); ctx.lineTo(6, 12); ctx.closePath(); ctx.fill(); }
  else if (t === 'circle' || t === 'field') { ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill(); }
  else if (t === 'buff' || t === 'empower') { ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(12, 0); ctx.lineTo(0, 14); ctx.lineTo(-12, 0); ctx.closePath(); ctx.stroke(); }
  else if (t === 'dash') { ctx.beginPath(); ctx.moveTo(-14, 8); ctx.lineTo(0, -10); ctx.lineTo(14, 8); ctx.stroke(); }
  else if (t === 'beam' || t === 'wall') { ctx.beginPath(); ctx.moveTo(-14, -3); ctx.lineTo(14, -3); ctx.moveTo(-14, 5); ctx.lineTo(14, 5); ctx.stroke(); }
  else if (t === 'nova') { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6); ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14); ctx.stroke(); } }
  else if (t === 'targeted') { ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.moveTo(0, -16); ctx.lineTo(0, 16); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill(); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.shadowBlur = 0;
  // 暗角
  const vg = ctx.createRadialGradient(w / 2, h / 2, w * .42, w / 2, h / 2, w * .85);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.22)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(200,169,106,.35)'; ctx.lineWidth = 1;
  ctx.strokeRect(.5, .5, w - 1, h - 1);
}

function paintItem(canvas, item) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, item.c1); g.addColorStop(1, item.c2 || '#111');
  ctx.fillStyle = '#081114'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = g; ctx.globalAlpha = .9;
  ctx.beginPath();
  ctx.moveTo(w * .5, h * .12); ctx.lineTo(w * .86, h * .5); ctx.lineTo(w * .5, h * .88); ctx.lineTo(w * .14, h * .5);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.font = `700 ${w * .52}px system-ui`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(item.glyph || '◆', w / 2, h * .53);
  ctx.strokeStyle = 'rgba(200,169,106,.45)'; ctx.lineWidth = 1;
  ctx.strokeRect(.5, .5, w - 1, h - 1);
}

export class UI {
  constructor() {
    this.el = {
      hud: $('hud'), start: $('start-screen'), shop: $('shop'), aug: $('augment-modal'),
      sb: $('scoreboard'), pause: $('pause'), end: $('end-screen'), loading: $('loading'),
      framesBlue: $('frames-blue'), framesRed: $('frames-red'),
      killfeed: $('killfeed'), announce: $('announce'), buffbar: $('buffbar'),
      portrait: $('portrait'), pLevel: $('p-level'), pName: $('p-name'),
      hpFill: $('hp-fill'), hpText: $('hp-text'), mpFill: $('mp-fill'), mpText: $('mp-text'),
      statline: $('statline'), items: $('items'), gold: $('gold-text'), kda: $('kda-text'),
      scoreBlue: $('score-blue'), scoreRed: $('score-red'), time: $('game-time'), wave: $('wave-timer'),
      rollCards: $('roll-cards'), rollHint: $('roll-hint'), reroll: $('btn-reroll'),
      rerollCount: $('reroll-count'), startBtn: $('btn-start'),
      shopGrid: $('shop-grid'), shopGold: $('shop-gold'), shopOwned: $('shop-owned'), shopAugs: $('shop-augs'),
      augCards: $('aug-cards'), augTier: $('aug-tier'), augReroll: $('aug-reroll'), augRerollCount: $('aug-reroll-count'),
      sbTables: $('sb-tables'), sbTime: $('sb-time'),
      endTitle: $('end-title'), endSub: $('end-sub'), endStats: $('end-stats'),
      hint: $('hint'), minimap: $('minimap'),
    };
    this.announceTimer = null;
    this.lastHp = 0;
    this.framesInit = false;
    this.frameMap = new Map();
    this.abButtons = [...document.querySelectorAll('.ab')];
    this.spButtons = [...document.querySelectorAll('.sp')];
    this.shopOpen = false;
    this.scoreboardOpen = false;
  }

  hideLoading() { this.el.loading.classList.add('hidden'); }

  showTip(e, champ, slot) {
    const tip = $('tip');
    if (!tip) return;
    const ab = champ.def.abilities[slot];
    if (!ab) return;
    const rank = champ.abilityRank(slot);
    const cd = ab.cd[Math.min(Math.max(rank - 1, 0), ab.cd.length - 1)];
    const cost = ab.cost[Math.min(Math.max(rank - 1, 0), ab.cost.length - 1)];
    tip.innerHTML = `<div class="tname">${ab.name}${rank <= 0 ? '（未解锁）' : ''}</div>
      <div class="tmeta">${rank > 0 ? `等级 ${rank} · 冷却 ${cd}s · 消耗 ${cost}` : '6 级解锁'}</div>
      <div class="tdesc">${ab.desc}</div>`;
    tip.classList.remove('hidden');
    this.moveTip(e);
  }
  moveTip(e) {
    const tip = $('tip');
    if (!tip || tip.classList.contains('hidden')) return;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let x = e.clientX + 14, y = e.clientY - h - 14;
    if (x + w > window.innerWidth - 10) x = e.clientX - w - 14;
    if (y < 10) y = e.clientY + 18;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  hideTip() { const tip = $('tip'); if (tip) tip.classList.add('hidden'); }

  /* ---------- 开始界面 ---------- */
  showStart(rolls, selectedIdx, rerolls, diff, onPick) {
    this.el.start.classList.remove('hidden');
    this.el.rerollCount.textContent = rerolls;
    this.el.reroll.disabled = rerolls <= 0;
    this.el.startBtn.disabled = selectedIdx < 0;
    const wrap = this.el.rollCards;
    wrap.innerHTML = '';
    rolls.forEach((def, i) => {
      const card = document.createElement('div');
      card.className = 'rc' + (i === selectedIdx ? ' sel' : '');
      const cv = document.createElement('img'); cv.className = 'rc-img'; cv.src = def.icon;
      const info = document.createElement('div');
      info.innerHTML = `<div class="rname">${def.name}</div>
        <div class="rtitle">${def.title} · ${def.role}</div>
        <span class="rrole">${def.role}</span>
        <div class="rtip">${def.tip}</div>`;
      card.appendChild(cv); card.appendChild(info);
      card.onclick = () => onPick(i);
      wrap.appendChild(card);
    });
    this.el.rollHint.textContent = selectedIdx >= 0 ? '已选择，进入嚎哭深渊' : '（随机三名，选一个开打）';
    document.querySelectorAll('.diff button').forEach(b => b.classList.toggle('on', b.dataset.diff === diff));
  }

  hideStart() { this.el.start.classList.add('hidden'); }

  /* ---------- HUD ---------- */
  initForGame(game, player) {
    this.el.hud.classList.remove('hidden');
    this.game = game; this.player = player;
    const pctx = this.el.portrait.getContext('2d');
    const pimg = new Image();
    pimg.onload = () => { pctx.clearRect(0, 0, 120, 120); pctx.drawImage(pimg, 0, 0, 120, 120); };
    pimg.src = player.def.icon;
    pctx.fillStyle = '#0a1417'; pctx.fillRect(0, 0, 120, 120);
    this.el.pName.textContent = `${player.def.name} · ${player.name}`;
    // 技能图标
    player.def.abilities.forEach((ab, i) => {
      const btn = this.abButtons[i];
      const img = btn.querySelector('img');
      img.src = ab.icon || '';
      btn.onmouseenter = (e) => this.showTip(e, player, i);
      btn.onmousemove = (e) => this.moveTip(e);
      btn.onmouseleave = () => { this.hideTip(); this.hoverSlot = -1; };
    const oldEnter = btn.onmouseenter;
    btn.onmouseenter = (e) => { this.hoverSlot = i; oldEnter(e); };
    });
    // 召唤师技能
    const d = document.createElement('canvas'); d.width = 64; d.height = 64;
    paintAbility(d, { color: '#bfe9ff', type: 'line' }, player.def, 0);
    this.spButtons[0].querySelector('img').src = d.toDataURL();
    this.spButtons[0].title = '雪球 — 命中后再次按 D 突进';
    const f = document.createElement('canvas'); f.width = 64; f.height = 64;
    paintAbility(f, { color: '#ffe9a8', type: 'dash' }, player.def, 0);
    this.spButtons[1].querySelector('img').src = f.toDataURL();
    this.spButtons[1].title = '闪现 — 向鼠标方向瞬移';
    this.buildItemSlots();
    this.buildFrames(game);
    setTimeout(() => this.el.hint.classList.add('fade'), 12000);
  }

  buildItemSlots() {
    this.el.items.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const s = document.createElement('div');
      s.className = 'slot'; s.dataset.idx = i;
      s.onclick = () => { if (this.game.player && this.shopOpen === false) this.openShop(); };
      this.el.items.appendChild(s);
    }
  }

  buildFrames(game) {
    const make = (team, wrap) => {
      wrap.innerHTML = '';
      for (const c of game.champions.filter(x => x.team === team)) {
        const f = document.createElement('div');
        f.className = 'frame';
        if (team === 'red') f.style.borderRightColor = '#ff4d5e';
        const av = document.createElement('div'); av.className = 'avatar';
        const cv = document.createElement('img'); cv.src = c.def.icon; cv.alt = c.name;
        av.appendChild(cv);
        const body = document.createElement('div');
        body.innerHTML = `<div class="fname"><b>${c.name}</b><span class="lv">1</span></div>
          <div class="fbar"><i style="width:100%"></i></div>
          <div class="fbar mp"><i style="width:100%"></i></div>`;
        f.appendChild(av); f.appendChild(body);
        wrap.appendChild(f);
        this.frameMap.set(c.id, f);
      }
    };
    make('blue', this.el.framesBlue);
    make('red', this.el.framesRed);
  }

  update(game, player) {
    const s = player.stats;
    const hpPct = player.hp / player.maxHp, mpPct = player.mana / player.maxMana;
    this.el.hpFill.style.width = (hpPct * 100) + '%';
    this.el.mpFill.style.width = (mpPct * 100) + '%';
    this.el.hpText.textContent = `${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}${player.shield > 0 ? ` +${Math.round(player.shield)}` : ''}`;
    this.el.mpText.textContent = `${Math.ceil(player.mana)} / ${Math.ceil(player.maxMana)}`;
    this.el.pLevel.textContent = player.level;
    this.el.hpFill.style.background = hpPct < .3 ? 'linear-gradient(180deg,#ff9a9a,#c02a2a)' : '';
    this.el.mpFill.style.width = (mpPct * 100) + '%';
    this.el.gold.textContent = Math.floor(player.gold);
    this.el.kda.textContent = `${player.kills} / ${player.deaths} / ${player.assists}`;
    this.el.scoreBlue.textContent = game.score.blue;
    this.el.scoreRed.textContent = game.score.red;
    const mm = Math.floor(game.time / 60), ss = Math.floor(game.time % 60);
    this.el.time.textContent = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    const wt = Math.max(0, Math.ceil(game.waveTimer));
    this.el.wave.textContent = `下一波 ${wt}`;
    this.el.statline.innerHTML = [
      `攻击 <b>${Math.round(s.ad)}</b>`, `法强 <b>${Math.round(s.ap)}</b>`,
      `护甲 <b>${Math.round(s.armor)}</b>`, `魔抗 <b>${Math.round(s.mr)}</b>`,
      `攻速 <b>${s.as.toFixed(2)}</b>`, `移速 <b>${Math.round(s.ms)}</b>`,
    ].join('');

    // 技能按钮
    player.def.abilities.forEach((ab, i) => {
      const btn = this.abButtons[i];
      const rank = player.abilityRank(i);
      const cd = player.cds[i];
      const maxCd = ab.cd[Math.min(rank - 1, ab.cd.length - 1)] || 1;
      const fill = btn.querySelector('.cd');
      const txt = btn.querySelector('.cdtext');
      btn.classList.toggle('locked', rank <= 0);
      if (cd > 0) {
        fill.style.transform = `scaleY(${Math.min(1, cd / maxCd)})`;
        txt.textContent = cd >= 1 ? Math.ceil(cd) : cd.toFixed(1);
      } else {
        fill.style.transform = 'scaleY(0)';
        txt.textContent = '';
      }
      const cost = player.abilityCost(i);
      btn.classList.toggle('no-mana', player.mana < cost && cd <= 0);
      let rk = btn.querySelector('.rank');
      if (!rk) { rk = document.createElement('span'); rk.className = 'rank'; btn.appendChild(rk); }
      rk.textContent = rank > 0 ? rank : '';
    });
    this.spButtons[0].querySelector('.cd').style.transform = `scaleY(${Math.min(1, player.spellCd.d / 8)})`;
    this.spButtons[1].querySelector('.cd').style.transform = `scaleY(${Math.min(1, player.spellCd.f / 90)})`;

    // 装备
    [...this.el.items.children].forEach((slot, i) => {
      const id = player.items[i];
      slot.innerHTML = '';
      if (id) {
        const it = ITEM_BY_ID[id];
        const cv = document.createElement('canvas'); cv.width = 34; cv.height = 34;
        paintItem(cv, it); slot.appendChild(cv);
        slot.title = `${it.name}\n${it.desc}\n点击卖出（阵亡时）`;
        slot.onclick = () => {
          if (!player.alive) { player.sellItem(i); this.refreshItems(); }
          else this.openShop();
        };
      } else {
        slot.title = '空装备位';
        slot.onclick = () => this.openShop();
      }
      slot.classList.toggle('owned', !!id);
    });

    // 队伍框
    for (const c of game.champions) {
      const f = this.frameMap.get(c.id);
      if (!f) continue;
      const hp = f.querySelector('.fbar i');
      const mp = f.querySelector('.fbar.mp i');
      const lv = f.querySelector('.lv');
      hp.style.width = Math.max(0, c.hp / c.maxHp * 100) + '%';
      if (mp) mp.style.width = Math.max(0, c.mana / c.maxMana * 100) + '%';
      lv.textContent = c.level;
      f.classList.toggle('dead', !c.alive);
    }

    // 阵亡遮罩
    const death = document.getElementById('death-overlay');
    if (death) {
      if (!player.alive) {
        death.classList.remove('hidden');
        document.getElementById('dt-timer').textContent = Math.ceil(Math.max(0, player.respawnT));
      } else death.classList.add('hidden');
    }

    // buff 条
    const buffs = player.buffs.filter(b => b.t > 0.2).slice(0, 8);
    if (player.snowball && player.snowball.target) {
      buffs.unshift({ id: 'snow', label: '雪球突进', t: 1, snow: true });
    }
    if (buffs.length !== this.el.buffbar.children.length) {
      this.el.buffbar.innerHTML = '';
      for (const b of buffs) {
        const d = document.createElement('div');
        d.className = 'buff';
        const label = (b.label || b.id || '').replace('buff_', '');
        d.textContent = label.slice(0, 1);
        d.title = label;
        this.el.buffbar.appendChild(d);
      }
    }
  }

  refreshItems() { /* slots re-render on next update */ }

  /* ---------- 播报 ---------- */
  announce(text, opts = {}) {
    const el = this.el.announce;
    el.textContent = text;
    el.classList.toggle('big', !!opts.big);
    el.style.color = opts.color || '';
    el.classList.add('on');
    clearTimeout(this.announceTimer);
    this.announceTimer = setTimeout(() => el.classList.remove('on'), opts.big ? 1900 : 1300);
  }

  killfeed(killer, victim) {
    const row = document.createElement('div');
    row.className = 'kf';
    row.innerHTML = `<span class="${killer.team === 'blue' ? 'b' : 'r'}">${killer.name}</span>
      <b>⚔</b> <span class="${victim.team === 'blue' ? 'b' : 'r'}">${victim.name}</span>`;
    this.el.killfeed.prepend(row);
    setTimeout(() => row.remove(), 6000);
    while (this.el.killfeed.children.length > 5) this.el.killfeed.lastChild.remove();
  }

  /* ---------- 商店 ---------- */
  openShop() {
    const p = this.game.player;
    if (!p) return;
    if (p.alive) {
      const f = { blue: { x: 214, y: 500 }, red: { x: 5786, y: 500 } }[p.team];
      const near = Math.hypot(p.x - f.x, p.y - f.y) < 560;
      if (!near) { this.announce('阵亡或回到泉水后才能购物'); return; }
    }
    this.shopOpen = true;
    this.el.shop.classList.remove('hidden');
    this.renderShop();
  }
  closeShop() { this.shopOpen = false; this.el.shop.classList.add('hidden'); }
  renderShop() {
    const p = this.game.player;
    this.el.shopGold.textContent = Math.floor(p.gold);
    this.el.shopGrid.innerHTML = '';
    for (const it of ITEMS) {
      const owned = p.items.includes(it.id);
      const card = document.createElement('div');
      card.className = 'item-card' + (p.gold < it.cost || owned || p.items.length >= 6 ? ' cant' : '');
      const cv = document.createElement('canvas'); cv.width = 44; cv.height = 44;
      paintItem(cv, it);
      card.appendChild(cv);
      const info = document.createElement('div');
      info.innerHTML = `<div class="iname">${it.name}</div><div class="icost">◆ ${it.cost}</div><div class="istat">${it.desc}</div>`;
      card.appendChild(info);
      card.onclick = () => {
        if (owned) { this.announce('已拥有该装备'); return; }
        if (p.addItem(it.id)) { this.renderShop(); this.update(this.game, p); }
      };
      this.el.shopGrid.appendChild(card);
    }
    this.el.shopOwned.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const s = document.createElement('div'); s.className = 'oslot';
      const id = p.items[i];
      if (id) {
        const cv = document.createElement('canvas'); cv.width = 42; cv.height = 42;
        paintItem(cv, ITEM_BY_ID[id]); s.appendChild(cv);
        s.title = ITEM_BY_ID[id].name + '（点击卖出）';
        s.onclick = () => { p.sellItem(i); this.renderShop(); };
      }
      this.el.shopOwned.appendChild(s);
    }
    this.el.shopAugs.innerHTML = p.augments.map(id => {
      const a = AUGMENT_BY_ID[id];
      return `<div class="aug-row ${a.rarity}"><b>${a.name}</b> · ${a.desc}</div>`;
    }).join('') || '<div class="tiny">还没有强化符文</div>';
  }

  /* ---------- 强化 ---------- */
  showAugments(list, tier, rerolls) {
    this.el.aug.classList.remove('hidden');
    this.el.augTier.textContent = RARITY_LABEL[tier] || '强化';
    this.el.augTier.className = 'tier-label ' + tier;
    this.el.augRerollCount.textContent = rerolls;
    this.el.augReroll.disabled = rerolls <= 0;
    this.el.augCards.innerHTML = '';
    for (const a of list) {
      const card = document.createElement('div');
      card.className = 'aug-card ' + a.rarity;
      card.innerHTML = `<div class="rar"></div>
        <div class="atop"><div class="aorb">${a.icon || '◈'}</div><div class="ararity">${RARITY_LABEL[a.rarity]}</div></div>
        <div class="aname">${a.name}</div>
        <div class="adesc">${a.desc}</div><div class="apick">选择此强化</div>`;
      card.onclick = () => this.onAugPick && this.onAugPick(a.id);
      this.el.augCards.appendChild(card);
    }
  }
  hideAugments() { this.el.aug.classList.add('hidden'); }

  /* ---------- 计分板 ---------- */
  toggleScoreboard(game) {
    this.scoreboardOpen = !this.scoreboardOpen;
    this.el.sb.classList.toggle('hidden', !this.scoreboardOpen);
    if (!this.scoreboardOpen) return;
    this.renderScoreboard(game);
  }
  renderScoreboard(game) {
    const mm = Math.floor(game.time / 60), ss = Math.floor(game.time % 60);
    this.el.sbTime.textContent = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    const table = (team) => {
      const rows = game.champions.filter(c => c.team === team).map(c => `
        <tr class="${team}">
          <td><div class="who"><img class="sb-avatar" src="${c.def.icon}" alt=""><span>${c.name}</span></div></td>
          <td>${c.level}</td><td>${c.kills}/${c.deaths}/${c.assists}</td><td>${c.cs}</td>
          <td>◆${Math.floor(c.gold)}</td><td>${Math.round(c.damageDone)}</td>
        </tr>`).join('');
      return `<div class="sb-title" style="color:${TEAM[team].color}">${TEAM[team].name}</div>
        <table class="sb-table"><thead><tr><th>英雄</th><th>等级</th><th>KDA</th><th>补刀</th><th>金币</th><th>伤害</th></tr></thead><tbody>${rows}</tbody></table>`;
    };
    this.el.sbTables.innerHTML = table('blue') + table('red');

  }

  /* ---------- 结束 ---------- */
  showEnd(game, winner) {
    this.el.end.classList.remove('hidden');
    const win = winner === 'blue';
    this.el.endTitle.textContent = win ? '胜利' : '失败';
    this.el.endTitle.classList.toggle('lose', !win);
    this.el.endSub.textContent = win ? '蓝方摧毁了敌方水晶' : '红方摧毁了你的水晶';
    const p = game.player;
    const mm = Math.floor(game.time / 60), ss = Math.floor(game.time % 60);
    this.el.endStats.innerHTML = `
      <div class="end-stat"><b>${p.kills}/${p.deaths}/${p.assists}</b><span>KDA</span></div>
      <div class="end-stat"><b>${p.cs}</b><span>补刀</span></div>
      <div class="end-stat"><b>${Math.round(p.damageDone)}</b><span>伤害</span></div>
      <div class="end-stat"><b>${Math.floor(p.gold + p.items.reduce((a, id) => a + ITEM_BY_ID[id].cost, 0))}</b><span>总经济</span></div>
      <div class="end-stat"><b>${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}</b><span>时长</span></div>`;
  }
}

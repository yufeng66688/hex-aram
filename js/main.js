/* ============================================================
   入口：循环 / 输入 / 相机 / 局面装配
   ============================================================ */
import { CHAMPIONS, AUGMENTS, AUGMENT_BY_ID } from './data.js';
import { Game, dist } from './sim.js';
import { BotAI } from './ai.js';
import { Renderer } from './render.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { LAYOUT } from './map.js';

const canvas = document.getElementById('game');
const audio = new Audio();
const ui = new UI();

let game = null;
let renderer = null;
let player = null;
let paused = false;
let lockCam = true;
let running = false;
let lastT = performance.now();
let acc = 0;
let uiAcc = 0;
let miniAcc = 0;
let augOffer = null;
let augTier = 'silver';
let pendingPause = false;

/* ---------- 开局掷骰 ---------- */
let rolls = [];
let selected = -1;
let rerolls = 1;
let difficulty = 'normal';

function rollThree() {
  const pool = [...CHAMPIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  rolls = pool.slice(0, 3);
  selected = -1;
}

function showStart() {
  ui.showStart(rolls, selected, rerolls, difficulty, (i) => { selected = i; showStart(); });
  document.querySelectorAll('.diff button').forEach(b => {
    b.onclick = () => { difficulty = b.dataset.diff; showStart(); };
  });
}

document.getElementById('btn-reroll').onclick = () => {
  if (rerolls <= 0) return;
  rerolls--;
  rollThree();
  showStart();
};
document.getElementById('btn-start').onclick = () => {
  if (selected < 0) return;
  audio.init();
  startGame(rolls[selected]);
};
document.getElementById('btn-again').onclick = () => {
  document.getElementById('end-screen').classList.add('hidden');
  rollThree(); rerolls = 1; showStart();
  document.getElementById('start-screen').classList.remove('hidden');
};
document.getElementById('btn-to-title').onclick = () => location.reload();

/* ---------- 建局 ---------- */
function startGame(playerDef) {
  ui.hideStart();
  ui.hideLoading();
  audio.init();

  const others = CHAMPIONS.filter(c => c.id !== playerDef.id);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const pool = [playerDef, ...others.slice(0, 9)];

  game = new Game({
    difficulty,
    seed: (Math.random() * 1e9) | 0,
    onEvent: handleEvent,
    audio: (name, x, y) => {
      const d = renderer ? Math.hypot((x ?? 0) - renderer.cam.x, (y ?? 0) - renderer.cam.y) : 0;
      audio.play(name, d);
    },
  });
  game.optsPool = pool;
  game.addChampions();
  player = game.player;
  player.name = '你';
  for (const c of game.champions) {
    if (c === player) continue;
    c.isBot = true;
    c.ai = new BotAI(c, game, difficulty);
  }
  // 队友也给个随机强化起点，避免纯白板
  for (const c of game.champions) {
    if (c !== player) game.emit('botAugmentInit', { champ: c });
  }

  renderer = new Renderer(canvas, game);
  renderer.cam.x = player.x + 260;
  renderer.cam.y = player.y;
  renderer.cam.tx = renderer.cam.x;
  renderer.cam.ty = renderer.cam.y;
  ui.initForGame(game, player);
  ui.renderShop = ui.renderShop.bind(ui);

  lockCam = true;
  paused = false;
  running = true;
  acc = 0;
  lastT = performance.now();
  ui.announce('欢迎来到嚎哭深渊', { big: true });
  setTimeout(() => ui.announce('3 级开始获得海克斯强化'), 2400);
  window.__aram = { game, renderer, ui, player, cast: (s, x, y) => tryCast(s, x, y) };
}

/* ---------- 事件 ---------- */
function handleEvent(type, payload) {
  if (type === 'kill') {
    ui.killfeed(payload.killer, payload.victim);
  } else if (type === 'announce') {
    ui.announce(payload.text, payload);
    if (payload.big) audio.play('announce');
  } else if (type === 'gameover') {
    running = false;
    setTimeout(() => ui.showEnd(game, payload.winner), 900);
  } else if (type === 'playerDeath') {
    setTimeout(() => { if (player && !player.alive && !paused) ui.openShop(); }, 700);
    ui.announce('你已阵亡 · 按 B 购物', { color: '#ff9aa2' });
  } else if (type === 'augment') {
    if (payload.champ === player) openAugment(payload.champ);
    else botAugment(payload.champ);
  } else if (type === 'levelup' && payload === player) {
    ui.announce('升级 ' + player.level, { color: '#ffd166' });
  } else if (type === 'wave' && payload.index === 1) {
    ui.announce('小兵出发', { color: '#9fe0ff' });
  }
}

function openAugment(champ) {
  augTier = augTierFor(champ.augTier);
  augOffer = rollAugments(champ, augTier, 3);
  pendingPause = true;
  paused = true;
  ui.showAugments(augOffer, augTier, champ.augRerolls);
  ui.onAugPick = (id) => chooseAugment(id);
  document.getElementById('aug-reroll').onclick = () => {
    if (champ.augRerolls <= 0) return;
    champ.augRerolls--;
    augOffer = rollAugments(champ, augTier, 3);
    ui.showAugments(augOffer, augTier, champ.augRerolls);
  };
}

function augTierFor(n) {
  return n <= 1 ? 'silver' : n === 2 ? 'gold' : n === 3 ? 'prismatic' : n === 4 ? 'gold' : 'prismatic';
}

function rollAugments(champ, tier, n) {
  const owned = new Set(champ.augments);
  const pool = AUGMENTS.filter(a => a.rarity === tier && !owned.has(a.id));
  const out = [];
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

function chooseAugment(id) {
  if (!augOffer) return;
  const a = AUGMENT_BY_ID[id];
  game.applyAugment(player, id);
  ui.hideAugments();
  augOffer = null;
  paused = false;
  ui.announce(`${a.name} · ${RARITY_TEXT[a.rarity] || ''}`, { big: true, color: a.rarity === 'prismatic' ? '#d7a6ff' : a.rarity === 'gold' ? '#f0d9a2' : '#cfe0e6' });
  audio.play('levelup');
}
const RARITY_TEXT = { silver: '银色强化', gold: '金色强化', prismatic: '棱彩强化' };

function botAugment(champ) {
  const tier = augTierFor(champ.augTier);
  const pool = AUGMENTS.filter(a => a.rarity === tier && !champ.augments.includes(a.id));
  if (!pool.length) return;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  game.applyAugment(champ, pick.id);
}

/* ---------- 操作 ---------- */
function screenMouse() {
  return renderer ? renderer.mouse : { x: 0, y: 0 };
}
function aimWorld() {
  if (!renderer) return { x: 0, y: 0 };
  return renderer.screenToWorld(renderer.mouse.x, renderer.mouse.y);
}

function tryCast(slot, wx, wy) {
  if (!player || !game || paused) return;
  const ok = game.cast(player, slot, wx, wy);
  if (!ok) {
    const chk = game.canCast(player, slot);
    if (chk.reason === 'mana') ui.announce('法力不足', { color: '#7fb6ff' });
  }
}

function commandAt(wx, wy, attackOnly = false) {
  if (!player || !game || paused) return;
  let target = null;
  for (const u of game.units) {
    if (!u.alive || u.team === player.team) continue;
    if (u.kind === 'champion' || u.kind === 'minion' || u.kind === 'tower' || u.kind === 'inhib' || u.kind === 'nexus') {
      if (dist(wx, wy, u.x, u.y) < u.r + 26) { target = u; break; }
    }
  }
  if (target) {
    player.attackTarget = target;
    player.moveTarget = null;
    player.orderKind = 'attack';
    player.ai = null;
    audio.play('hit', 0);
    return;
  }
  if (attackOnly) {
    player.orderKind = 'attackmove';
    player.attackTarget = null;
    player.moveTarget = { x: wx, y: wy };
    return;
  }
  player.attackTarget = null;
  player.moveTarget = { x: wx, y: wy };
  player.orderKind = 'move';
}

/* ---------- 输入 ---------- */
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('mousemove', e => {
  if (!renderer) return;
  renderer.mouse.x = e.clientX;
  renderer.mouse.y = e.clientY;
});
canvas.addEventListener('mousedown', e => {
  audio.init();
  if (!renderer) return;
  if (e.button === 2) {
    const w = renderer.screenToWorld(e.clientX, e.clientY);
    commandAt(w.x, w.y);
  } else if (e.button === 1) {
    e.preventDefault();
    dragging = { x: e.clientX, y: e.clientY, cx: renderer.cam.tx, cy: renderer.cam.ty };
    lockCam = false;
  }
});
window.addEventListener('mouseup', e => {
  if (e.button === 1) dragging = null;
});
let dragging = null;
canvas.addEventListener('wheel', e => {
  if (!renderer) return;
  e.preventDefault();
  const z = renderer.cam.zoom * (e.deltaY > 0 ? 0.92 : 1.08);
  renderer.cam.zoom = Math.max(0.62, Math.min(1.6, z));
}, { passive: false });

window.addEventListener('mousemove', e => {
  if (dragging && renderer) {
    renderer.cam.tx = dragging.cx - (e.clientX - dragging.x) / renderer.cam.zoom;
    renderer.cam.ty = dragging.cy - (e.clientY - dragging.y) / renderer.cam.zoom;
    renderer.cam.x = renderer.cam.tx; renderer.cam.y = renderer.cam.ty;
  }
  // 边缘滚动
  if (renderer && !lockCam && running && !paused) {
    const edge = 26, sp = 780;
    if (e.clientX < edge) renderer.cam.tx -= sp * 0.016;
    if (e.clientX > window.innerWidth - edge) renderer.cam.tx += sp * 0.016;
    if (e.clientY < edge) renderer.cam.ty -= sp * 0.016;
    if (e.clientY > window.innerHeight - edge) renderer.cam.ty += sp * 0.016;
  }
});

document.querySelectorAll('.ab').forEach(btn => {
  btn.addEventListener('click', () => {
    const slot = +btn.dataset.slot;
    const w = aimWorld();
    tryCast(slot, w.x, w.y);
  });
});
document.querySelectorAll('.sp').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.spell;
    const w = aimWorld();
    if (player && game) game.castSummoner(player, key, w.x, w.y);
  });
});
document.querySelectorAll('[data-close]').forEach(b => {
  b.onclick = () => {
    if (b.dataset.close === 'shop') ui.closeShop();
  };
});
document.getElementById('btn-resume').onclick = () => { paused = false; document.getElementById('pause').classList.add('hidden'); };
document.getElementById('btn-restart').onclick = () => location.reload();
document.getElementById('btn-quit').onclick = () => location.reload();
document.getElementById('vol').oninput = (e) => audio.setVolume(+e.target.value);

window.addEventListener('keydown', e => {
  if (!game) return;
  const k = e.key.toLowerCase();
  if (k === 'tab') {
    e.preventDefault();
    if (!ui.scoreboardOpen) ui.toggleScoreboard(game);
    return;
  }
  if (k === 'escape') {
    if (ui.shopOpen) { ui.closeShop(); return; }
    if (ui.scoreboardOpen) { ui.toggleScoreboard(game); return; }
    if (paused && pendingPause) return;
    paused = !paused;
    document.getElementById('pause').classList.toggle('hidden', !paused);
    return;
  }
  if (paused) return;
  if (k === 'q' || k === 'w' || k === 'e' || k === 'r') {
    const slot = { q: 0, w: 1, e: 2, r: 3 }[k];
    const w = aimWorld();
    tryCast(slot, w.x, w.y);
  } else if (k === 'd' || k === 'f') {
    const w = aimWorld();
    game.castSummoner(player, k, w.x, w.y);
  } else if (k === 'b') {
    if (ui.shopOpen) ui.closeShop(); else ui.openShop();
  } else if (k === 'y') {
    lockCam = !lockCam;
    if (!lockCam && renderer) { renderer.cam.tx = renderer.cam.x; renderer.cam.ty = renderer.cam.y; }
    ui.announce(lockCam ? '视角已锁定' : '视角已解锁 · 中键拖动', { color: '#9fe0ff' });
  } else if (k === ' ') {
    e.preventDefault();
    if (renderer && player) { renderer.cam.tx = player.x; renderer.cam.ty = player.y; }
  } else if (k === 's') {
    player.moveTarget = null; player.attackTarget = null; player.orderKind = 'idle';
  } else if (k === 'a') {
    const w = aimWorld();
    commandAt(w.x, w.y, true);
  }
});
window.addEventListener('keyup', e => {
  if (e.key === 'Tab' && ui.scoreboardOpen) ui.toggleScoreboard(game);
});

window.addEventListener('resize', () => { if (renderer) renderer.resize(); });

/* ---------- 主循环 ---------- */
function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - lastT) / 1000;
  lastT = now;
  if (!renderer || !game) return;
  dt = Math.min(dt, 0.05);

  if (running && !paused) {
    acc += dt;
    const step = 1 / 60;
    let guard = 0;
    while (acc >= step && guard++ < 4) {
      game.update(step);
      for (const c of game.champions) {
        if (c.ai && c.alive) c.ai.tick(step);
      }
      acc -= step;
    }
    // 飘字
    for (const f of game.floaters) { f.t += dt; f.y += f.vy * dt; }
    game.floaters = game.floaters.filter(f => f.t < f.life);
    // 特效队列
    for (const fx of game.fxQueue) renderer.spawnFx(fx.kind, fx.data);
    game.fxQueue.length = 0;
  }

  renderer.updateCamera(dt, player, lockCam, renderer.mouse);
  renderer.update(dt);
  renderer.draw(game, player, lockCam, renderer.mouse);

  uiAcc += dt;
  if (uiAcc > 0.066) {
    uiAcc = 0;
    ui.update(game, player);
  }
  miniAcc += dt;
  if (miniAcc > 0.05) {
    miniAcc = 0;
    renderer.drawMinimap(ui.el.minimap, game, player);
  }
}

/* ---------- 启动 ---------- */
rollThree();
showStart();
ui.hideLoading();
requestAnimationFrame(frame);
setTimeout(() => { ui.hideLoading(); }, 200);

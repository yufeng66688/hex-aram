/* ============================================================
   3D 渲染层（Three.js / WebGL）
   模拟层不变：世界坐标 (x, y) → 3D (x, 0, y)，y 轴向上。
   ============================================================ */
import * as THREE from '../vendor/three.module.js';
import { WORLD } from './data.js';
import { LAYOUT, buildBackground, buildMinimapBackground, clampToLane } from './map.js';
import { dist, clamp } from './sim.js';

const TEAM_COL = { blue: 0x3aa0ff, red: 0xff4d5e };
const TEAM_CSS = { blue: '#3aa0ff', red: '#ff4d5e' };

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.15, ...opts });
}
function emissive(color, intensity = 1.2) {
  return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.4, metalness: 0.1 });
}

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.28;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#061823');
    this.scene.fog = new THREE.Fog('#061823', 1800, 4200);

    this.camera = new THREE.PerspectiveCamera(42, 1.6, 8, 10000);
    this.cam = {
      x: LAYOUT.blue.fountain.x + 400, y: 500, zoom: 1,
      tx: LAYOUT.blue.fountain.x + 400, ty: 500,
    };
    this.mouse = { x: 0, y: 0 };
    this.ray = new THREE.Raycaster();
    this.ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.pointer = new THREE.Vector2();
    this.time = 0;
    this.unitMeshes = new Map();
    this.structMeshes = new Map();
    this.effects = [];
    this.particles = [];
    this.floatPool = [];
    this.muzzle = [];
    this.shakeT = 0;
    this.overlay = document.createElement('canvas');
    this.overlay.className = 'overlay-canvas';
    canvas.parentElement.appendChild(this.overlay);
    this.octx = this.overlay.getContext('2d');
    this.miniBg = buildMinimapBackground();
    this.tmpV = new THREE.Vector3();
    this.cursor = null;
    this.rangeRing = null;
    this.hoverSlot = -1;
    this.buildWorld();
    this.resize();
  }

  /* ---------------- 世界 ---------------- */
  buildWorld() {
    const s = this.scene;
    s.add(new THREE.HemisphereLight(0xe8f8ff, 0x1b3a46, 1.25));
    const dir = new THREE.DirectionalLight(0xffffff, 1.25);
    dir.position.set(-900, 1200, -400);
    s.add(dir);
    const warm = new THREE.PointLight(0xffb066, 1.1, 1600, 2);
    warm.position.set(3000, 220, 500);
    s.add(warm);

    // 深渊
    const abyss = new THREE.Mesh(new THREE.PlaneGeometry(8000, 2000), new THREE.MeshBasicMaterial({ color: 0x061722, fog: true }));
    abyss.rotation.x = -Math.PI / 2;
    abyss.position.set(WORLD.w / 2, -240, 500);
    s.add(abyss);

    // 雪原（桥两侧）
    const snowCv = document.createElement('canvas');
    snowCv.width = 512; snowCv.height = 512;
    const sctx = snowCv.getContext('2d');
    sctx.fillStyle = '#bcd8e6'; sctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2600; i++) {
      sctx.fillStyle = `rgba(${200 + Math.random() * 55 | 0},${225 + Math.random() * 30 | 0},255,${0.05 + Math.random() * 0.12})`;
      const r = 1 + Math.random() * 6;
      sctx.beginPath(); sctx.arc(Math.random() * 512, Math.random() * 512, r, 0, 7); sctx.fill();
    }
    const snowTex = new THREE.CanvasTexture(snowCv);
    snowTex.wrapS = snowTex.wrapT = THREE.RepeatWrapping;
    snowTex.repeat.set(14, 6);
    snowTex.colorSpace = THREE.SRGBColorSpace;
    const snowFieldMat = new THREE.MeshStandardMaterial({ map: snowTex, color: 0x8fb2c4, roughness: 0.95 });
    const north = new THREE.Mesh(new THREE.PlaneGeometry(WORLD.w + 900, 900), snowFieldMat);
    north.rotation.x = -Math.PI / 2;
    north.position.set(WORLD.w / 2, -6, -200);
    s.add(north);
    const south = new THREE.Mesh(new THREE.PlaneGeometry(WORLD.w + 900, 900), snowFieldMat);
    south.rotation.x = -Math.PI / 2;
    south.position.set(WORLD.w / 2, -6, 1200);
    s.add(south);

    // 雪原石块
    const boulderMat = new THREE.MeshStandardMaterial({ color: 0x6f8d9c, roughness: 1 });
    for (let i = 0; i < 70; i++) {
      const bx = Math.random() * WORLD.w;
      const bz = Math.random() < .5 ? -80 - Math.random() * 380 : 1080 + Math.random() * 380;
      const r = 12 + Math.random() * 34;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), boulderMat);
      rock.position.set(bx, r * .45, bz);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      s.add(rock);
    }

    // 冰桥主体（有厚度）
    const slab = new THREE.Mesh(new THREE.BoxGeometry(WORLD.w, 76, 520), new THREE.MeshStandardMaterial({ color: 0x16323d, roughness: 0.95 }));
    slab.position.set(WORLD.w / 2, -38, 500);
    s.add(slab);

    // 桥面贴图
    const bg = buildBackground();
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 4096; texCanvas.height = 342;
    const tctx = texCanvas.getContext('2d');
    tctx.drawImage(bg, 0, 250, 6000, 500, 0, 0, 4096, 342);
    tctx.globalCompositeOperation = 'lighter';
    tctx.fillStyle = 'rgba(110,190,220,0.28)';
    tctx.fillRect(0, 0, 4096, 342);
    tctx.globalCompositeOperation = 'source-over';
    const tex = new THREE.CanvasTexture(texCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const top = new THREE.Mesh(
      new THREE.PlaneGeometry(WORLD.w, 500),
      new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: true })
    );
    top.rotation.x = -Math.PI / 2;
    top.position.set(WORLD.w / 2, 0.6, 500);
    s.add(top);

    // 桥缘石栏
    const railMat = new THREE.MeshStandardMaterial({ color: 0x1d2f36, roughness: 0.95 });
    const snowMat = new THREE.MeshStandardMaterial({ color: 0x9fbccb, roughness: 0.95 });
    for (const z of [252, 748]) {
      for (let x = 0; x < WORLD.w; x += 240) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(240, 46, 20), railMat);
        wall.position.set(x + 120, 23, z);
        s.add(wall);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(240, 6, 22), snowMat);
        cap.position.set(x + 120, 48, z);
        s.add(cap);
      }
    }

    // 桥缘冰柱
    const iceMat = new THREE.MeshStandardMaterial({ color: 0x9fe0ff, transparent: true, opacity: 0.5, roughness: 0.15, metalness: 0.2 });
    for (let x = 260; x < WORLD.w; x += 460) {
      for (const z of [248, 752]) {
        const h = 70 + (x % 50);
        const c = new THREE.Mesh(new THREE.ConeGeometry(14, h, 5), iceMat);
        c.position.set(x, h / 2 + 6, z);
        s.add(c);
      }
    }

    // 近景冰墙：贴着车道两侧
    const wallRock = new THREE.MeshStandardMaterial({ color: 0x2a4653, roughness: 0.98 });
    const wallSnow = new THREE.MeshStandardMaterial({ color: 0xbfd8e4, roughness: 0.95 });
    for (let x = 0; x < WORLD.w; x += 320) {
      for (const z of [176, 824]) {
        const h = 110 + ((x * 13) % 70);
        const block = new THREE.Mesh(new THREE.BoxGeometry(340, h, 150), wallRock);
        block.position.set(x + 160, h / 2 - 12, z);
        block.rotation.y = (Math.random() - .5) * 0.06;
        s.add(block);
        for (let k = 0; k < 3; k++) {
          const patch = new THREE.Mesh(new THREE.SphereGeometry(8 + Math.random() * 10, 8, 6), wallSnow);
          patch.scale.y = 0.35;
          patch.position.set(x + 60 + k * 90, h - 4, z + (Math.random() - .5) * 40);
          s.add(patch);
        }
        if ((x / 320) % 2 === 0) {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(22, 60 + (x % 40), 5), iceMat);
          spike.position.set(x + 70, h + 20, z);
          s.add(spike);
        }
      }
    }

    // 远处雪崖
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x142830, roughness: 1 });
    for (let x = 0; x < WORLD.w; x += 260) {
      for (const z of [-320, 1320]) {
        const h = 190 + ((x * 7) % 110);
        const w = 280;
        const rock = new THREE.Mesh(new THREE.BoxGeometry(w, h, 320), rockMat);
        rock.position.set(x + 130, h / 2 - 40, z);
        s.add(rock);
        for (let k = 0; k < 2; k++) {
          const patch = new THREE.Mesh(new THREE.SphereGeometry(22 + Math.random() * 18, 8, 6), snowMat);
          patch.scale.y = 0.3;
          patch.position.set(x + 40 + k * 120, h - 40, z + (Math.random() - .5) * 60);
          s.add(patch);
        }
      }
    }

    // 车道装饰：冰晶簇
    const shardMat = new THREE.MeshStandardMaterial({ color: 0x7fd0f0, transparent: true, opacity: 0.7, roughness: 0.2 });
    for (let x = 300; x < WORLD.w; x += 380) {
      for (const z of [286, 714]) {
        const h = 26 + (x % 40);
        const shard = new THREE.Mesh(new THREE.ConeGeometry(9, h, 5), shardMat);
        shard.position.set(x + (z % 7) * 6, h / 2, z);
        s.add(shard);
      }
    }

    // 中央符文环
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x46e0ff, transparent: true, opacity: 0.32, side: THREE.DoubleSide, toneMapped: false });
    for (const [x, r] of [[3000, 260], [2300, 160], [3700, 160]]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r - 6, r, 64), ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 2.2, 500);
      s.add(ring);
    }

    // 火盆
    this.torches = [];
    for (let x = 900; x < WORLD.w; x += 1800) {
      for (const z of [286, 714]) {
        const g = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(4, 6, 64, 6), new THREE.MeshStandardMaterial({ color: 0x2b3b43 }));
        pole.position.y = 32;
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(16, 10, 14, 8), new THREE.MeshStandardMaterial({ color: 0x3a4a52 }));
        bowl.position.y = 68;
        const fire = new THREE.Mesh(new THREE.SphereGeometry(6, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffa040, toneMapped: false }));
        fire.position.y = 78;
        g.add(pole, bowl, fire);
        g.position.set(x, 0, z);
        s.add(g);
        this.torches.push({ fire, base: 1.2 + Math.random() });
      }
    }

    // 基地台
    for (const team of ['blue', 'red']) {
      const L = LAYOUT[team];
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(300, 330, 18, 48), new THREE.MeshStandardMaterial({ color: team === 'blue' ? '#16303f' : '#3a1d22', roughness: 0.9 }));
      disc.position.set(L.fountain.x, 6, 500);
      s.add(disc);
      const ring = new THREE.Mesh(new THREE.RingGeometry(352, 372, 64), new THREE.MeshBasicMaterial({ color: TEAM_COL[team], transparent: true, opacity: 0.55, side: THREE.DoubleSide, toneMapped: false }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(L.fountain.x, 17, 500);
      s.add(ring);
    }

    // 光标
    const cur = new THREE.Mesh(new THREE.RingGeometry(16, 21, 32), new THREE.MeshBasicMaterial({ color: 0x9fffe0, transparent: true, opacity: 0.9, side: THREE.DoubleSide, toneMapped: false }));
    cur.rotation.x = -Math.PI / 2;
    cur.visible = false;
    s.add(cur);
    this.cursor = cur;

    // 技能范围
    const rr = new THREE.Mesh(new THREE.RingGeometry(1, 1.02, 96), new THREE.MeshBasicMaterial({ color: 0x8fefff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, toneMapped: false }));
    rr.rotation.x = -Math.PI / 2;
    rr.visible = false;
    s.add(rr);
    this.rangeRing = rr;

    // 雪
    const n = 700;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = Math.random() * WORLD.w;
      pos[i * 3 + 1] = 40 + Math.random() * 260;
      pos[i * 3 + 2] = Math.random() * WORLD.h;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.snow = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdff6ff, size: 2.4, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }));
    s.add(this.snow);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.vw = w; this.vh = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.overlay.width = Math.floor(w * dpr);
    this.overlay.height = Math.floor(h * dpr);
    this.overlay.style.width = w + 'px';
    this.overlay.style.height = h + 'px';
    this.odpr = dpr;
  }

  screenToWorld(sx, sy) {
    this.pointer.set((sx / this.vw) * 2 - 1, -(sy / this.vh) * 2 + 1);
    this.ray.setFromCamera(this.pointer, this.camera);
    const hit = new THREE.Vector3();
    const ok = this.ray.ray.intersectPlane(this.ground, hit);
    if (!ok) return { x: this.cam.x, y: this.cam.y };
    return { x: clamp(hit.x, 0, WORLD.w), y: clamp(hit.z, 0, WORLD.h) };
  }

  updateCamera(dt, player, lock) {
    const z = this.cam.zoom;
    if (lock && player && player.alive) {
      this.cam.tx = player.x; this.cam.ty = player.y;
      this.cam.x += (this.cam.tx - this.cam.x) * Math.min(1, dt * 8);
      this.cam.y += (this.cam.ty - this.cam.y) * Math.min(1, dt * 8);
    } else {
      this.cam.x += (this.cam.tx - this.cam.x) * Math.min(1, dt * 10);
      this.cam.y += (this.cam.ty - this.cam.y) * Math.min(1, dt * 10);
    }
    this.cam.x = clamp(this.cam.x, 200, WORLD.w - 200);
    this.cam.y = clamp(this.cam.y, 260, WORLD.h - 60);
    const h = 730 / z, d = 700 / z;
    const sx = (Math.random() - .5) * (this.game.shake || 0) * 0.6;
    const sy = (Math.random() - .5) * (this.game.shake || 0) * 0.6;
    this.camera.position.set(this.cam.x + sx, h + sy, this.cam.y + d);
    this.camera.lookAt(this.cam.x, 40, this.cam.y - 40);
  }

  /* ---------------- 单位 ---------------- */
  championMesh(champ) {
    const pal = champ.def.palette || { body: '#8a8f95', trim: '#333', hair: '#ddd', skin: '#e8c3a0', weapon: 'sword' };
    const teamCol = TEAM_COL[champ.team];
    const g = new THREE.Group();
    const bodyG = new THREE.Group();
    g.add(bodyG);

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(26, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.6;
    g.add(shadow);

    const ring = new THREE.Mesh(new THREE.RingGeometry(27, 32, 40), new THREE.MeshBasicMaterial({ color: teamCol, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.8;
    g.add(ring);

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(11, 22, 4, 10), mat(pal.body));
    torso.position.y = 36;
    bodyG.add(torso);
    const limbs = [];
    for (const sx of [-7, 7]) {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(3.4, 14, 3, 6), mat(pal.trim));
      leg.position.set(sx, 14, 0); bodyG.add(leg); limbs.push(leg);
    }
    for (const sx of [-13, 13]) {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(3.2, 14, 3, 6), mat(pal.skin));
      arm.position.set(sx, 38, 0); arm.rotation.z = sx > 0 ? -0.25 : 0.25; bodyG.add(arm);
    }
    const trim = new THREE.Mesh(new THREE.CapsuleGeometry(12, 6, 3, 10), mat(pal.trim));
    trim.position.y = 22; bodyG.add(trim);

    const head = new THREE.Mesh(new THREE.SphereGeometry(9.5, 16, 12), mat(pal.skin));
    head.position.y = 58; bodyG.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(pal.hair));
    hair.position.y = 59.5; bodyG.add(hair);

    const shoulderGeo = new THREE.SphereGeometry(6, 10, 8);
    for (const sx of [-11, 11]) {
      const sh = new THREE.Mesh(shoulderGeo, mat(pal.trim));
      sh.position.set(sx, 46, 0); bodyG.add(sh);
    }

    // 武器
    const weapon = new THREE.Group();
    weapon.position.set(13, 40, 6);
    const w = pal.weapon;
    if (w === 'bow') {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(16, 1.8, 6, 20, Math.PI * 1.1), mat('#c9d6dc'));
      arc.rotation.z = Math.PI / 2; weapon.add(arc);
    } else if (w === 'staff' || w === 'staff2') {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 58, 6), mat('#c9d6dc'));
      rod.rotation.z = 0.4; weapon.add(rod);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 8), emissive(new THREE.Color(pal.body).getHex(), 1.4));
      orb.position.set(11, 26, 0); weapon.add(orb);
    } else if (w === 'katana' || w === 'sword') {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(2.6, 58, 6), mat('#dfeef4', { metalness: .7, roughness: .3 }));
      blade.rotation.z = 0.35; weapon.add(blade);
    } else if (w === 'axe') {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 52, 6), mat('#8a6a4a'));
      rod.rotation.z = 0.3; weapon.add(rod);
      const headA = new THREE.Mesh(new THREE.BoxGeometry(18, 14, 4), mat('#b9c6cc', { metalness: .6 }));
      headA.position.set(8, 24, 0); weapon.add(headA);
    } else if (w === 'harp') {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(13, 1.6, 6, 18, Math.PI), mat('#ffd27a'));
      arc.rotation.z = Math.PI; weapon.add(arc);
    } else {
      const fist = new THREE.Mesh(new THREE.SphereGeometry(6, 10, 8), mat(pal.trim));
      weapon.add(fist);
    }
    weapon.rotation.x = 0.2;
    bodyG.add(weapon);

    // 披风
    const cape = new THREE.Mesh(new THREE.BoxGeometry(20, 34, 3), mat(pal.trim));
    cape.position.set(0, 34, -10); cape.rotation.x = 0.12;
    bodyG.add(cape);

    g.scale.setScalar(1.7);
    g.userData = { bodyG, ring, weapon, torso, head, pal, baseRing: 0.75 };
    return g;
  }

  minionMesh(m) {
    const g = new THREE.Group();
    const col = TEAM_COL[m.team];
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(6, 10, 3, 8), mat(m.mtype === 'caster' ? '#3a4a66' : '#3a4a52'));
    body.position.y = 18; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(4.6, 10, 8), mat(m.mtype === 'caster' ? '#9fb4ff' : '#c6d6dd'));
    head.position.y = 29; g.add(head);
    const ring = new THREE.Mesh(new THREE.RingGeometry(10, 12, 24), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .6, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = .7; g.add(ring);
    const gear = new THREE.Mesh(new THREE.BoxGeometry(3, 16, 3), mat('#c8d8df'));
    gear.position.set(7, 20, 2); gear.rotation.z = -.3; g.add(gear);
    g.scale.setScalar(1.35);
    g.userData = { body, head, ring };
    return g;
  }

  structureMesh(s) {
    const g = new THREE.Group();
    const teamCol = TEAM_COL[s.team];
    if (s.kind === 'tower') {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(52, 62, 24, 10), mat('#22343d'));
      base.position.y = 12; g.add(base);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(24, 38, 170, 10), mat('#2c4a55'));
      shaft.position.y = 100; g.add(shaft);
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(34, 30, 16, 10), mat('#2b444e'));
      collar.position.y = 190; g.add(collar);
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(28, 0), emissive(teamCol, 1.8));
      crystal.position.y = 232; g.add(crystal);
      const ring = new THREE.Mesh(new THREE.RingGeometry(44, 52, 40), new THREE.MeshBasicMaterial({ color: teamCol, transparent: true, opacity: .45, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 1.5; g.add(ring);
      g.userData = { crystal, ring };
    } else if (s.kind === 'inhib') {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(70, 86, 18, 12), mat('#22343d'));
      base.position.y = 9; g.add(base);
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(46, 0), emissive(teamCol, 1.5));
      crystal.position.y = 82; g.add(crystal);
      const ring = new THREE.Mesh(new THREE.RingGeometry(62, 72, 44), new THREE.MeshBasicMaterial({ color: teamCol, transparent: true, opacity: .4, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 19; g.add(ring);
      g.userData = { crystal, ring };
    } else {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(120, 140, 22, 16), mat('#14232a'));
      base.position.y = 11; g.add(base);
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(86, 0), emissive(teamCol, 1.4));
      crystal.position.y = 130; g.add(crystal);
      const inner = new THREE.Mesh(new THREE.OctahedronGeometry(52, 0), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .35 }));
      inner.position.y = 130; g.add(inner);
      const ring = new THREE.Mesh(new THREE.RingGeometry(110, 128, 56), new THREE.MeshBasicMaterial({ color: teamCol, transparent: true, opacity: .22, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 23; g.add(ring);
      g.userData = { crystal, ring, inner };
    }
    return g;
  }

  syncEntities(dt) {
    const g = this.game;
    for (const u of g.units) {
      if (!u.alive) {
        const m = this.unitMeshes.get(u.id);
        if (m) { this.scene.remove(m); this.unitMeshes.delete(u.id); }
        const sm = this.structMeshes.get(u.id);
        if (sm && (u.kind === 'tower' || u.kind === 'inhib' || u.kind === 'nexus')) { this.scene.remove(sm); this.structMeshes.delete(u.id); }
        continue;
      }
      if (u.kind === 'champion' || u.kind === 'minion') {
        let mesh = this.unitMeshes.get(u.id);
        if (!mesh) {
          mesh = u.kind === 'champion' ? this.championMesh(u) : this.minionMesh(u);
          this.scene.add(mesh);
          this.unitMeshes.set(u.id, mesh);
        }
        mesh.position.set(u.x, 0, u.y);
        mesh.rotation.y = Math.PI / 2 - u.facing;
        if (u.kind === 'champion') {
          const bob = Math.sin(this.time * 9 + u.id) * (u.moveTarget || u.attackTarget ? 1.8 : 0.6);
          mesh.userData.bodyG.position.y = bob;
          const targetYaw = Math.PI / 2 - u.facing;
          mesh.userData.bodyG.rotation.y = 0;
          if (u.attackTarget) mesh.userData.bodyG.rotation.x = 0.12;
          else mesh.userData.bodyG.rotation.x *= 0.8;
          const ring = mesh.userData.ring;
          ring.material.opacity = u === g.player ? 0.95 : 0.7;
          ring.scale.setScalar(u === g.player ? 1.05 + Math.sin(this.time * 5) * 0.03 : 1);
        }
      } else if (u.kind === 'tower' || u.kind === 'inhib' || u.kind === 'nexus') {
        let mesh = this.structMeshes.get(u.id);
        if (!mesh) {
          mesh = this.structureMesh(u);
          mesh.position.set(u.x, 0, u.y);
          this.scene.add(mesh);
          this.structMeshes.set(u.id, mesh);
        }
        const pct = Math.max(0, u.hp / u.maxHp);
        mesh.userData.crystal.rotation.y += dt * (u.kind === 'nexus' ? 0.6 : 0.9);
        mesh.userData.crystal.scale.setScalar(0.85 + pct * 0.15);
      }
    }
    // 清理已移除
    for (const [id, mesh] of this.unitMeshes) {
      if (!g.units.some(u => u.id === id && u.alive)) { this.scene.remove(mesh); this.unitMeshes.delete(id); }
    }
    for (const [id, mesh] of this.structMeshes) {
      const u = g.units.find(x => x.id === id);
      if (!u || !u.alive) { this.scene.remove(mesh); this.structMeshes.delete(id); }
    }
  }

  /* ---------------- 特效 ---------------- */
  spawnFx(kind, d) {
    const g = this.scene;
    const add = (obj, life, fn) => {
      if (this.effects.length > 55) {
        const old = this.effects.shift();
        g.remove(old.obj);
      }
      g.add(obj);
      this.effects.push({ obj, t: 0, life, fn });
    };
    if (kind === 'hit' || kind === 'muzzle') {
      if (kind === 'hit' && Math.random() < 0.45) return;
      const m = new THREE.Mesh(new THREE.SphereGeometry(6, 8, 6), new THREE.MeshBasicMaterial({ color: d.color || '#fff', transparent: true, opacity: .9 }));
      m.position.set(d.x, 18, d.y);
      add(m, 0.22, (o, k) => { o.scale.setScalar(1 + k * 2); o.material.opacity = 1 - k; });
    } else if (kind === 'explosion' || kind === 'novaimpact' || kind === 'shock') {
      const r = d.r || 120;
      const ring = new THREE.Mesh(new THREE.RingGeometry(r * 0.2, r * 0.24, 48), new THREE.MeshBasicMaterial({ color: d.color || '#ffb04a', transparent: true, opacity: .8, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(d.x, 3, d.y);
      add(ring, 0.55, (o, k) => { o.scale.setScalar(0.6 + k * 1.6); o.material.opacity = (1 - k) * .8; });
      const fire = new THREE.Mesh(new THREE.SphereGeometry(r * .35, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffb066, transparent: true, opacity: .55 }));
      fire.position.set(d.x, 24, d.y);
      add(fire, 0.45, (o, k) => { o.scale.setScalar(0.6 + k * 1.4); o.material.opacity = (1 - k) * .5; });
    } else if (kind === 'nova' || kind === 'marker' || kind === 'scout') {
      const r = d.r || 200;
      const ring = new THREE.Mesh(new THREE.RingGeometry(r * .985, r, 64), new THREE.MeshBasicMaterial({ color: d.color || '#9fe0ff', transparent: true, opacity: .22, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(d.x, 2.5, d.y);
      add(ring, kind === 'marker' ? 0.6 : 0.45, (o, k) => { o.material.opacity = (1 - k) * .7; o.scale.setScalar(kind === 'marker' ? 1 : 0.4 + k * 1.6); });
    } else if (kind === 'beam') {
      const len = d.len || 800;
      const geo = new THREE.CylinderGeometry(d.width ? d.width * .18 : 18, d.width ? d.width * .18 : 18, len, 8, 1, true);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: d.color || '#fff1c4', transparent: true, opacity: .85 }));
      const ang = d.ang || 0;
      m.position.set(d.x + Math.cos(ang) * len / 2, 26, d.y + Math.sin(ang) * len / 2);
      m.rotation.z = Math.PI / 2;
      m.rotation.y = -ang;
      add(m, 0.32, (o, k) => { o.material.opacity = (1 - k) * .85; });
    } else if (kind === 'slash') {
      const ring = new THREE.Mesh(new THREE.RingGeometry(20, 34, 24, 1, -0.6, 1.2), new THREE.MeshBasicMaterial({ color: d.color || '#fff', transparent: true, opacity: .9, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(d.x, 30, d.y);
      add(ring, 0.25, (o, k) => { o.material.opacity = (1 - k); o.rotation.z += 0.2; });
    } else if (kind === 'heal' || kind === 'buff') {
      const m = new THREE.Mesh(new THREE.TorusGeometry(18, 2.4, 6, 24), new THREE.MeshBasicMaterial({ color: d.color || '#4fe08a', transparent: true, opacity: .85 }));
      m.position.set(d.x, 20, d.y);
      m.rotation.x = Math.PI / 2;
      add(m, 0.6, (o, k) => { o.position.y = 20 + k * 40; o.material.opacity = 1 - k; });
    } else if (kind === 'dash' || kind === 'flash') {
      const len = Math.hypot((d.x2 || d.x1 || d.x) - d.x, (d.y2 || d.y1 || d.y) - d.y) || 100;
      const geo = new THREE.PlaneGeometry(len, 26);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: d.color || '#9fe0ff', transparent: true, opacity: .45, side: THREE.DoubleSide }));
      const ang = Math.atan2((d.y2 || d.y1 || d.y) - d.y, (d.x2 || d.x1 || d.x) - d.x);
      m.position.set((d.x + (d.x2 || d.x1 || d.x)) / 2, 2.2, (d.y + (d.y2 || d.y1 || d.y)) / 2);
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = -ang;
      add(m, 0.35, (o, k) => { o.material.opacity = (1 - k) * .45; });
    } else if (kind === 'levelup' || kind === 'respawn' || kind === 'relic') {
      const m = new THREE.Mesh(new THREE.RingGeometry(14, 20, 32), new THREE.MeshBasicMaterial({ color: d.color || '#ffd166', transparent: true, opacity: .8, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(d.x, 3 + (d.y % 1), d.y);
      add(m, 0.8, (o, k) => { o.scale.setScalar(1 + k * 4); o.material.opacity = (1 - k) * .8; });
    } else {
      // 通用火花
      for (let i = 0; i < 6; i++) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(2.4, 6, 6), new THREE.MeshBasicMaterial({ color: d.color || '#fff', transparent: true, opacity: .9 }));
        m.position.set(d.x, 18, d.y);
        const vx = (Math.random() - .5) * 120, vz = (Math.random() - .5) * 120, vy = 60 + Math.random() * 80;
        add(m, 0.5, (o, k) => {
          o.position.x += vx / 60; o.position.z += vz / 60; o.position.y += vy / 60 - k * 2;
          o.material.opacity = 1 - k;
        });
      }
    }
  }

  update(dt) {
    this.time += dt;
    // 雪
    if (this.snow) {
      const pos = this.snow.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - dt * (10 + (i % 7));
        let x = pos.getX(i) + Math.sin(this.time + i) * dt * 6;
        if (y < 0) y = 240;
        pos.setY(i, y); pos.setX(i, x);
      }
      pos.needsUpdate = true;
    }
    for (const t of this.torches) {
      t.fire.scale.setScalar(0.9 + Math.sin(this.time * 6 + t.base) * .15);
    }
    // 特效生命周期
    for (const e of this.effects) {
      e.t += dt;
      const k = Math.min(1, e.t / e.life);
      try { e.fn(e.obj, k); } catch (err) { }
      if (e.t >= e.life) { this.scene.remove(e.obj); e.obj.geometry?.dispose?.(); e.obj.material?.dispose?.(); }
    }
    this.effects = this.effects.filter(e => e.t < e.life);
  }

  /* ---------------- 投影辅助 ---------------- */
  project(x, y, z) {
    this.tmpV.set(x, y, z).project(this.camera);
    return {
      x: (this.tmpV.x * .5 + .5) * this.vw,
      y: (-this.tmpV.y * .5 + .5) * this.vh,
      z: this.tmpV.z,
    };
  }

  /* ---------------- 主绘制 ---------------- */
  draw(game, player, lock, mouse) {
    this.updateCamera(1 / 60, player, lock);
    this.syncEntities(1 / 60);
    // 投射物
    this.syncProjectiles(game);
    this.syncFields(game);
    // 光标
    const w = this.screenToWorld(mouse.x, mouse.y);
    if (this.cursor) {
      this.cursor.visible = true;
      this.cursor.position.set(w.x, 2.4, w.y);
      let hover = false;
      for (const u of game.units) {
        if (!u.alive || u.team === player.team) continue;
        if (u.kind === 'champion' || u.kind === 'minion') {
          if (dist(w.x, w.y, u.x, u.y) < u.r + 14) { hover = true; break; }
        }
      }
      this.cursor.material.color.set(hover ? 0xff5a64 : 0x9fffe0);
    }
    // 技能范围
    const slot = window.__aram && window.__aram.ui ? window.__aram.ui.hoverSlot : -1;
    if (this.rangeRing && player) {
      const ab = slot >= 0 ? player.def.abilities[slot] : null;
      if (ab && player.alive) {
        const r = ab.range || ab.radius || 500;
        this.rangeRing.visible = true;
        this.rangeRing.position.set(player.x, 2.2, player.y);
        this.rangeRing.scale.set(r, r, 1);
      } else this.rangeRing.visible = false;
    }
    this.renderer.render(this.scene, this.camera);
    this.drawOverlay(game, player);
  }

  syncProjectiles(game) {
    if (!this.projMeshes) this.projMeshes = new Map();
    const seen = new Set();
    for (const p of game.projectiles) {
      seen.add(p.id);
      let m = this.projMeshes.get(p.id);
      if (!m) {
        m = new THREE.Mesh(new THREE.SphereGeometry(p.visual === 'snowball' ? 8 : 5, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color || '#9fe0ff') }));
        m.position.set(p.x, 24, p.y);
        this.scene.add(m);
        this.projMeshes.set(p.id, m);
      }
      m.position.set(p.x, 24, p.y);
    }
    for (const [id, m] of this.projMeshes) {
      if (!seen.has(id)) { this.scene.remove(m); m.geometry.dispose(); m.material.dispose(); this.projMeshes.delete(id); }
    }
  }

  syncFields(game) {
    if (!this.fieldMeshes) this.fieldMeshes = new Map();
    const seen = new Set();
    for (const f of game.fields) {
      const key = f.x.toFixed(0) + ':' + f.y.toFixed(0) + ':' + (f.source?.id || 0);
      seen.add(key);
      let m = this.fieldMeshes.get(key);
      if (!m) {
        m = new THREE.Mesh(new THREE.RingGeometry(f.r * .85, f.r, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(f.color || '#ffb04a'), transparent: true, opacity: .22, side: THREE.DoubleSide }));
        m.rotation.x = -Math.PI / 2;
        this.scene.add(m);
        this.fieldMeshes.set(key, m);
      }
      m.position.set(f.x, 2.2, f.y);
      m.rotation.z = this.time * .4;
    }
    for (const [k, m] of this.fieldMeshes) {
      if (!seen.has(k)) { this.scene.remove(m); m.geometry.dispose(); m.material.dispose(); this.fieldMeshes.delete(k); }
    }
  }

  drawOverlay(game, player) {
    const ctx = this.octx;
    const dpr = this.odpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.vw, this.vh);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const u of game.units) {
      if (!u.alive) continue;
      if (u.kind === 'champion') {
        const p = this.project(u.x, 78, u.y);
        if (p.x < -80 || p.x > this.vw + 80 || p.y < -40 || p.y > this.vh + 40) continue;
        const w = 72, h = 7;
        const hp = Math.max(0, u.hp / u.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,.72)';
        ctx.fillRect(p.x - w / 2 - 1, p.y - h - 1, w + 2, h + 2);
        ctx.fillStyle = u.team === 'blue' ? '#41d97a' : '#ff4d5e';
        ctx.fillRect(p.x - w / 2, p.y - h, w * hp, h);
        if (u.shield > 0) {
          ctx.fillStyle = 'rgba(190,240,255,.9)';
          ctx.fillRect(p.x - w / 2 + w * hp, p.y - h, Math.min(w * (1 - hp), w * u.shield / u.maxHp), h);
        }
        ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1; ctx.strokeRect(p.x - w / 2, p.y - h, w, h);
        // 等级
        ctx.fillStyle = 'rgba(4,10,12,.85)';
        ctx.fillRect(p.x - w / 2 - 17, p.y - h - 3, 15, 12);
        ctx.strokeStyle = 'rgba(200,169,106,.6)'; ctx.strokeRect(p.x - w / 2 - 17, p.y - h - 3, 15, 12);
        ctx.fillStyle = '#f0d9a2'; ctx.font = '700 10px ui-monospace,Menlo,monospace';
        ctx.fillText(String(u.level), p.x - w / 2 - 9.5, p.y - h + 3);
        // 名字
        ctx.font = '600 10px system-ui,sans-serif';
        ctx.fillStyle = u === player ? 'rgba(255,236,180,.95)' : u.team === 'blue' ? 'rgba(150,205,255,.85)' : 'rgba(255,140,148,.9)';
        ctx.fillText(u === player ? '你' : u.name, p.x, p.y - h - 14);
      } else if (u.kind === 'minion') {
        if (u.hp >= u.maxHp) continue;
        const p = this.project(u.x, 40, u.y);
        const w = 26, h = 4;
        ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(p.x - w / 2 - 1, p.y - 1, w + 2, h + 2);
        ctx.fillStyle = u.team === 'blue' ? '#41d97a' : '#ff4d5e';
        ctx.fillRect(p.x - w / 2, p.y, w * Math.max(0, u.hp / u.maxHp), h);
      } else if (u.kind === 'tower' || u.kind === 'inhib' || u.kind === 'nexus') {
        if (u.hp >= u.maxHp) continue;
        const y = u.kind === 'nexus' ? 250 : u.kind === 'inhib' ? 150 : 280;
        const p = this.project(u.x, y, u.y);
        const w = u.kind === 'tower' ? 80 : 110, h = 7;
        ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(p.x - w / 2 - 1, p.y - 1, w + 2, h + 2);
        ctx.fillStyle = u.team === 'blue' ? '#41d97a' : '#ff4d5e';
        ctx.fillRect(p.x - w / 2, p.y, w * Math.max(0, u.hp / u.maxHp), h);
      }
    }

    // 飘字
    for (const f of game.floaters) {
      const p = this.project(f.x, 60, f.y);
      ctx.globalAlpha = Math.max(0, 1 - f.t / f.life);
      ctx.font = `800 ${f.size || 13}px ui-monospace,Menlo,monospace`;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.75)';
      ctx.strokeText(f.text, p.x, p.y - 8);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, p.x, p.y - 8);
    }
    ctx.globalAlpha = 1;
  }

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
    const vw = (this.vw) * sx * 0.6, vh = (this.vh) * sy * 1.4;
    ctx.strokeStyle = 'rgba(200,169,106,.75)'; ctx.lineWidth = 1;
    ctx.strokeRect(this.cam.x * sx - vw / 2, this.cam.y * sy - vh / 2, vw, vh);
  }
}

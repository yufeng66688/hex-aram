/* ============================================================
   音频：全程序化 WebAudio（无外部音源）
   ============================================================ */
export class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.volume = 0.6;
    this.enabled = true;
    this.noise = null;
    this.last = {};
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 1.2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  gate(name, ms) {
    const now = performance.now();
    if (this.last[name] && now - this.last[name] < ms) return false;
    this.last[name] = now;
    return true;
  }

  tone(freq, dur, type = 'sine', gain = 0.2, slideTo = null, delay = 0) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  noiseBurst(dur, filterFreq, gain = 0.2, type = 'bandpass', delay = 0, q = 1) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + delay;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = type; f.frequency.value = filterFreq; f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t); src.stop(t + dur + 0.02);
  }

  play(name, dist = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const att = Math.max(0, Math.min(1, 1 - dist / 1500));
    if (att <= 0.02) return;
    const v = att;
    switch (name) {
      case 'shoot':
        if (!this.gate('shoot', 70)) return;
        this.noiseBurst(0.07, 2400, 0.05 * v, 'bandpass', 0, 2);
        break;
      case 'hit':
        if (!this.gate('hit', 55)) return;
        this.noiseBurst(0.05, 1500, 0.06 * v, 'bandpass', 0, 1.5);
        break;
      case 'cast':
        this.tone(320, 0.16, 'triangle', 0.10 * v, 620);
        this.noiseBurst(0.12, 3000, 0.03 * v);
        break;
      case 'kill':
        this.tone(520, 0.1, 'square', 0.10 * v);
        this.tone(780, 0.16, 'square', 0.09 * v, null, 0.09);
        this.tone(1040, 0.22, 'triangle', 0.08 * v, null, 0.2);
        break;
      case 'death':
        this.tone(300, 0.4, 'sawtooth', 0.09 * v, 90);
        this.noiseBurst(0.3, 600, 0.05 * v, 'lowpass');
        break;
      case 'tower':
        this.tone(160, 0.22, 'sine', 0.14 * v, 70);
        this.noiseBurst(0.14, 500, 0.06 * v, 'lowpass');
        break;
      case 'boom':
        this.tone(90, 0.6, 'sine', 0.22 * v, 40);
        this.noiseBurst(0.5, 900, 0.16 * v, 'lowpass');
        break;
      case 'levelup':
        [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.08 * v, null, i * 0.07));
        break;
      case 'relic':
        this.tone(880, 0.5, 'sine', 0.08 * v, 1320);
        this.tone(1320, 0.4, 'sine', 0.05 * v, null, 0.08);
        break;
      case 'flash':
        this.noiseBurst(0.18, 4200, 0.10 * v, 'highpass');
        this.tone(900, 0.12, 'sine', 0.05 * v, 1800);
        break;
      case 'snow':
        this.noiseBurst(0.12, 1800, 0.06 * v);
        break;
      case 'announce':
        this.tone(196, 0.5, 'triangle', 0.10 * v);
        this.tone(294, 0.6, 'triangle', 0.08 * v, null, 0.05);
        break;
      default:
        this.tone(440, 0.05, 'sine', 0.03 * v);
    }
  }
}

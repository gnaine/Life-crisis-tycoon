// Procedural audio: per-city music loops, SFX, and PA-style voice announcements (Web Audio + speechSynthesis).
const KEY = 'ahq_audio';
const VOICE_LANG = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES', pt: 'pt-BR', de: 'de-DE', ja: 'ja-JP', ko: 'ko-KR' };
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

// chords as midi roots + intervals; pat = 16-step pluck pattern (chord-tone index or -1); kick/hat/shk 16-step
const SONGS = {
  london: { bpm: 92, chords: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]], pat: [0, -1, 2, -1, 1, -1, 3, -1, 2, -1, 1, -1, 0, -1, 2, 3], kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0], hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], wave: 'triangle' },
  lagos: { bpm: 104, chords: [[57, 60, 64, 69], [53, 57, 60, 65], [60, 64, 67, 72], [55, 59, 62, 67]], pat: [0, -1, -1, 2, -1, -1, 1, -1, -1, 3, -1, -1, 2, -1, 1, -1], kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], hat: [0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1], shk: 1, wave: 'square' },
  mumbai: { bpm: 96, chords: [[62, 66, 69, 72], [62, 66, 69, 72], [60, 64, 67, 72], [62, 66, 69, 74]], pat: [0, 1, 2, -1, 3, 2, 1, -1, 0, -1, 2, 3, -1, 2, 1, 0], kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0], hat: [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0], drone: 50, wave: 'sawtooth' },
  seoul: { bpm: 100, chords: [[65, 69, 72, 76], [64, 67, 71, 74], [62, 65, 69, 72], [60, 64, 67, 71]], pat: [0, -1, 3, -1, 2, -1, 3, 1, 0, -1, 3, -1, 2, 1, 3, -1], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1], wave: 'sine', bell: 1 },
  newyork: { bpm: 96, chords: [[62, 65, 69, 72], [55, 59, 62, 65], [60, 64, 67, 71], [57, 60, 64, 67]], pat: [0, -1, 2, -1, 3, 1, -1, 2, 0, -1, 3, -1, 2, 1, -1, 3], kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0], hat: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1], wave: 'triangle', bell: 1 },
  mexico: { bpm: 112, chords: [[60, 64, 67, 72], [65, 69, 72, 77], [67, 71, 74, 79], [60, 64, 67, 72]], pat: [0, -1, 2, 1, 0, -1, 2, 1, 3, -1, 2, 1, 0, -1, 2, -1], kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], hat: [0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1], shk: 1, wave: 'square' },
  cairo: { bpm: 94, chords: [[62, 63, 66, 69], [62, 63, 66, 67], [60, 63, 67, 70], [62, 66, 69, 72]], pat: [0, -1, 1, 2, -1, 1, 0, -1, 2, 3, -1, 2, 1, -1, 0, -1], kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], hat: [0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1], drone: 50, shk: 1, wave: 'triangle' },
  saopaulo: { bpm: 88, chords: [[62, 65, 69, 72], [55, 59, 62, 65], [60, 64, 67, 71], [57, 61, 64, 67]], pat: [0, -1, 2, 1, -1, 2, -1, 1, 0, -1, 2, 1, -1, 2, 3, -1], kick: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1], hat: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1], shk: 1, wave: 'triangle' },
};

// Speech: "$3,500" is read "3 dollars 500" by French voices (comma = decimal). Give the voice plain digits + the currency word.
const CUR = { en: 'dollars', fr: 'dollars', es: 'dólares', pt: 'dólares', de: 'Dollar', ja: 'ドル', ko: '달러' };
function sayNumbers(txt, lang) {
  const plain = (n) => n.replace(/[,.\u202f\u00a0 ](?=\d{3}\b)/g, '');
  return txt
    .replace(/(-)?\$\s?(\d{1,3}(?:[,.\u202f\u00a0 ]\d{3})+|\d+)/g, (m, neg, n) => (neg ? '-' : '') + plain(n) + ' ' + (CUR[lang] || 'dollars'))
    .replace(/(\d{1,3}(?:[,.\u202f\u00a0 ]\d{3})+)\s?\$/g, (m, n) => plain(n) + ' ' + (CUR[lang] || 'dollars'))
    .replace(/\b\d{1,3}(?:,\d{3})+\b/g, (m) => plain(m));
}
export function makeAudio() {
  let st = { music: true, sfx: true, voice: true };
  try { Object.assign(st, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  let ctx = null, master, musicG, sfxG, noiseBuf, city = 'london', timer = null, nextT = 0, step = 0, playing = false, lastSfx = {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

  let unlocked = false;
  function unlockIOS() {
    if (unlocked) return; unlocked = true;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try { // a silent looping <audio> element switches iOS to the "media" channel, which ignores the ring/silent switch
      const n = 4410, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
      w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 44100, true); v.setUint32(28, 88200, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
      const a = new Audio(URL.createObjectURL(new Blob([b], { type: 'audio/wav' }))); a.loop = true; a.setAttribute('playsinline', ''); a.volume = 0.01; const pr = a.play(); if (pr && pr.catch) pr.catch(() => { unlocked = false; });
    } catch (e) {}
  }
  function ensure() {
    unlockIOS();
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      musicG = ctx.createGain(); musicG.gain.value = st.music ? 0.13 : 0; musicG.connect(master);
      sfxG = ctx.createGain(); sfxG.gain.value = st.sfx ? 0.45 : 0; sfxG.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }
  function tone(f, t0, dur, type, g, dest, a = 0.01) {
    const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0);
    gn.gain.setValueAtTime(0.0001, t0); gn.gain.exponentialRampToValueAtTime(g, t0 + a); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(gn); gn.connect(dest); o.start(t0); o.stop(t0 + dur + 0.05); return o;
  }
  function noise(t0, dur, g, dest, hp = 6000) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; const gn = ctx.createGain();
    gn.gain.setValueAtTime(g, t0); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); s.connect(f); f.connect(gn); gn.connect(dest); s.start(t0); s.stop(t0 + dur + 0.02);
  }
  function kick(t0, dest) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(130, t0); o.frequency.exponentialRampToValueAtTime(45, t0 + 0.12); g.gain.setValueAtTime(0.7, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18); o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + 0.2); }

  // ---------- music ----------
  function schedule() {
    if (!ctx || !playing) return;
    const S = SONGS[city] || SONGS.london, sp = 60 / S.bpm / 4;
    while (nextT < ctx.currentTime + 0.25) {
      const bar = Math.floor(step / 16) % S.chords.length, s16 = step % 16, ch = S.chords[bar], t0 = nextT;
      if (s16 === 0) { tone(mtof(ch[0] - 24), t0, sp * 7, 'sine', 0.5, musicG, 0.02); for (const n of ch) tone(mtof(n), t0, sp * 15, 'sine', 0.06, musicG, 0.3); if (S.drone) tone(mtof(S.drone - 12), t0, sp * 16, 'sawtooth', 0.04, musicG, 0.5); }
      if (s16 === 8) tone(mtof(ch[0] - 24 + (bar % 2 ? 7 : 0)), t0, sp * 6, 'sine', 0.4, musicG, 0.02);
      const pi = S.pat[s16]; if (pi >= 0) { const f = mtof(ch[pi] + 12); tone(f, t0, S.bell ? sp * 6 : sp * 2.5, S.wave, S.wave === 'square' || S.wave === 'sawtooth' ? 0.05 : 0.14, musicG); if (S.bell) tone(f * 2, t0, sp * 3, 'sine', 0.04, musicG); }
      if (S.kick[s16]) kick(t0, musicG);
      if (S.hat[s16]) noise(t0, S.shk ? 0.06 : 0.03, S.shk ? 0.12 : 0.08, musicG, S.shk ? 4000 : 7000);
      nextT += sp; step++;
    }
  }
  function startMusic(c) {
    if (c) setCity(c);
    if (!ensure()) return; if (playing) return; playing = true; nextT = ctx.currentTime + 0.1; step = 0;
    timer = setInterval(schedule, 90);
  }
  function stopMusic() { playing = false; clearInterval(timer); timer = null; }
  function setCity(c) { if (c === city) return; city = c; step = 0; }

  // ---------- sfx ----------
  function sfx(name, vol = 1) {
    if (!st.sfx || !ctx || vol <= 0.02) { if (!ctx) ensure(); if (!ctx) return; }
    if (!st.sfx || vol <= 0.02) return; const now = ctx.currentTime;
    if (lastSfx[name] && now - lastSfx[name] < 0.12) return; lastSfx[name] = now; let d = sfxG;
    if (vol < 1) { d = ctx.createGain(); d.gain.value = vol; d.connect(sfxG); }
    switch (name) {
      case 'cash': tone(1318, now, 0.12, 'sine', 0.25, d); tone(1975, now + 0.07, 0.25, 'sine', 0.22, d); break;
      case 'build': kick(now, d); noise(now, 0.15, 0.3, d, 800); tone(523, now + 0.12, 0.2, 'triangle', 0.2, d); tone(784, now + 0.22, 0.3, 'triangle', 0.2, d); break;
      case 'hire': [523, 659, 784, 1046].forEach((f, i) => tone(f, now + i * 0.07, 0.2, 'triangle', 0.2, d)); break;
      case 'bad': { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(330, now); o.frequency.exponentialRampToValueAtTime(110, now + 0.35); g.gain.setValueAtTime(0.12, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4); o.connect(g); g.connect(d); o.start(now); o.stop(now + 0.45); break; }
      case 'star': [523, 659, 784, 1046, 1318].forEach((f, i) => { tone(f, now + i * 0.09, 0.5, 'triangle', 0.22, d); tone(f * 2, now + i * 0.09, 0.3, 'sine', 0.06, d); }); break;
      case 'siren': for (let i = 0; i < 4; i++) tone(i % 2 ? 660 : 880, now + i * 0.28, 0.27, 'square', 0.07, d, 0.02); break;
      case 'click': tone(1600, now, 0.04, 'sine', 0.12, d, 0.002); break;
      case 'door': noise(now, 0.09, 0.22, d, 500); tone(160, now, 0.12, 'sine', 0.25, d, 0.004); tone(1200, now + 0.02, 0.05, 'triangle', 0.05, d, 0.002); break;
      case 'doorShut': tone(110, now, 0.16, 'sine', 0.35, d, 0.003); noise(now, 0.07, 0.25, d, 300); break;
      case 'snore': { // slow in-breath rumble, then a whistly out-breath
        const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(55, now); o.frequency.linearRampToValueAtTime(75, now + 1.0);
        f.type = 'lowpass'; f.frequency.value = 380; g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.25, now + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
        o.connect(f); f.connect(g); g.connect(d); o.start(now); o.stop(now + 1.2); tone(900, now + 1.4, 0.6, 'sine', 0.03, d, 0.2); noise(now + 1.3, 0.7, 0.05, d, 2500); break; }
      case 'flush': { const sN = ctx.createBufferSource(); sN.buffer = noiseBuf; sN.loop = true; const f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'bandpass'; f.frequency.setValueAtTime(600, now); f.frequency.exponentialRampToValueAtTime(2200, now + 0.5); f.frequency.exponentialRampToValueAtTime(400, now + 1.8);
        g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.5, now + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, now + 1.9); sN.connect(f); f.connect(g); g.connect(d); sN.start(now); sN.stop(now + 2); tone(240, now, 0.05, 'square', 0.05, d, 0.002); break; }
      case 'yawn': { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(320, now); o.frequency.exponentialRampToValueAtTime(180, now + 0.9); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.12, now + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, now + 1); o.connect(g); g.connect(d); o.start(now); o.stop(now + 1.05); break; }
      case 'pop': tone(220, now, 0.12, 'sine', 0.3, d); noise(now, 0.08, 0.15, d, 1500); break;
      case 'chime': tone(659, now, 0.9, 'sine', 0.3, d); tone(1318, now, 0.5, 'sine', 0.06, d); tone(523, now + 0.42, 1.1, 'sine', 0.3, d); tone(1046, now + 0.42, 0.6, 'sine', 0.06, d); break;
    }
  }

  // ---------- voice ----------
  let lastSay = 0; const cds = {}; let voices = [];
  const loadVoices = () => { try { voices = speechSynthesis.getVoices() || []; } catch (e) {} };
  if (typeof speechSynthesis !== 'undefined') { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function announce(key, text, lang, cd = 45) {
    if (!st.voice || typeof speechSynthesis === 'undefined') return false;
    const now = performance.now() / 1000; if (cds[key] && now - cds[key] < cd) return false; if (now - lastSay < 6) return false;
    cds[key] = now; lastSay = now;
    const clean = String(text).replace(/<[^>]+>/g, '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}·•]/gu, ' ').replace(/\s+/g, ' ').trim();
    const spoken = sayNumbers(clean, lang);
    if (!clean) return false;
    if (st.sfx && ensure()) sfx('chime');
    setTimeout(() => {
      try {
        const u = new SpeechSynthesisUtterance(spoken), L = VOICE_LANG[lang] || 'en-GB';
        u.lang = L; u.rate = 1.0; u.pitch = 1.05; u.volume = 0.9;
        const v = voices.find((x) => x.lang === L) || voices.find((x) => x.lang && x.lang.slice(0, 2) === L.slice(0, 2)); if (v) u.voice = v;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      } catch (e) {}
    }, st.sfx ? 950 : 0);
    return true;
  }

  function set(k, v) {
    st[k] = v; save(); if (!ensure()) return;
    if (k === 'music') { musicG.gain.value = v ? 0.13 : 0; }
    if (k === 'sfx') sfxG.gain.value = v ? 0.45 : 0;
    if (k === 'voice' && !v) try { speechSynthesis.cancel(); } catch (e) {}
  }
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); });
  return { ensure, sfx, startMusic, stopMusic, setCity, announce, set, get st() { return st; } };
}

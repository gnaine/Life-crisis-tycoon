// Character appearance layer.
// Game logic only talks to an avatar through `root.userData.p` and the pose helpers in game.js.
// When a GLB set is listed in models/manifest.json (and its files load), avatars are built from it;
// otherwise the existing procedural avatar is used as the fallback, per character.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export const CHAR = { status: 'none', man: null, A: { hair: {}, outfit: {}, full: {} }, active: new Set(), errors: [] };
// logical state -> clip name in the GLB (manifest may override), and the state to fall back to if a clip is missing
const DEFAULT_CLIPS = { idle: 'Idle', walk: 'Walk', sit: 'Sit', lie: 'Lie', work: 'StandWork', worksit: 'SitWork', phone: 'Phone', sitphone: 'SitPhone', cheer: 'Cheer', clean: 'Clean' };
const FALLBACK = { sitphone: 'sit', lie: 'sit', worksit: 'sit', work: 'idle', phone: 'idle', cheer: 'idle', clean: 'work', sit: 'idle', walk: 'idle' };
const LOOP_ONCE = new Set(['cheer']);

const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const loadGLB = async (url) => {
  if (url.endsWith('.js')) { const b64 = (await import(/* @vite-ignore */ url)).default; const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); return new Promise((res, rej) => loader.parse(bin.buffer, '', res, rej)); }
  return new Promise((res, rej) => loader.load(url, res, undefined, rej));
};

export async function loadCharacters(url) {
  try {
    const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error('no manifest');
    const man = await r.json(); CHAR.man = man;
    if (!man.enabled || !man.enabled.length) { CHAR.status = 'off'; return false; }
    const dir = url.slice(0, url.lastIndexOf('/') + 1); CHAR.dir = dir; const at = (f) => (/^(https?:)?\//.test(f) ? f : new URL(dir + f, location.href).href);
    if (man.characters) {
      await Promise.all(Object.entries(man.characters).map(([k, f]) => loadGLB(at(f)).then((g) => { CHAR.A.full[k] = g; if (CHAR.onModel) CHAR.onModel(k); }).catch((e) => CHAR.errors.push('char ' + k + ': ' + (e && e.message)))));
      if (Object.keys(CHAR.A.full).length) CHAR.status = 'ready';
      if (!man.base) return CHAR.status === 'ready';
    }
    const base = await loadGLB(at(man.base)); CHAR.A.base = base;
    CHAR.A.clips = (man.anims ? (await loadGLB(at(man.anims))).animations : []).concat(base.animations || []);
    const jobs = [];
    for (const [k, f] of Object.entries(man.hair || {})) jobs.push(loadGLB(at(f)).then((g) => (CHAR.A.hair[k] = g)).catch((e) => CHAR.errors.push('hair ' + k)));
    for (const [k, f] of Object.entries(man.outfits || {})) jobs.push(loadGLB(at(f)).then((g) => (CHAR.A.outfit[k] = g)).catch((e) => CHAR.errors.push('outfit ' + k)));
    for (const [k, f] of Object.entries(man.props || {})) jobs.push(loadGLB(at(f)).then((g) => ((CHAR.A.props = CHAR.A.props || {})[k] = g)).catch((e) => CHAR.errors.push('prop ' + k)));
    await Promise.all(jobs);
    if (!CHAR.A.clips.length) throw new Error('no animations');
    CHAR.status = 'ready'; return true;
  } catch (e) { CHAR.status = 'fallback'; CHAR.errors.push(String(e && e.message || e)); return false; }
}

// kind: 'staff' | 'visitor' | 'manager'; outfitKey: role name, 'casual', or 'mgr_<outfit>'
// load one complete character on demand (visitors: only the current city's pool is fetched)
const pending = new Map();
export function loadFull(key) {
  if (CHAR.A.full[key]) return Promise.resolve(CHAR.A.full[key]);
  if (pending.has(key)) return pending.get(key);
  const f = CHAR.man && CHAR.man.visitors && CHAR.man.visitors[key]; if (!f) return Promise.resolve(null);
  const url = new URL(CHAR.dir + f, location.href).href;
  const shared = key === 'anims' ? Promise.resolve(null) : loadFull('anims');
  const pr = Promise.all([loadGLB(url), shared]).then(([g, sh]) => { if (sh) adaptClips(g, sh); CHAR.A.full[key] = g; if (CHAR.onModel && key !== 'anims') CHAR.onModel(key); return g; }).catch((e) => { CHAR.errors.push('vis ' + key + ': ' + (e && e.message)); return null; });
  pending.set(key, pr); return pr;
}
// shared visitor clips are authored on one skeleton: copy them onto this character, hips height rescaled to its size
function hipsY(root) { let y = null; root.traverse((o) => { if (y == null && o.name === 'Hips') y = o.position.y; }); return y; }
function adaptClips(g, sh) {
  const ty = hipsY(g.scene), sy = hipsY(sh.scene); if (ty == null) return; const k = sy ? ty / sy : 1, have = new Set(g.animations.map((c) => c.name));
  for (const c of sh.animations) { if (have.has(c.name)) continue; const cc = c.clone(); for (const tr of cc.tracks) if (/Hips\.position$/.test(tr.name)) for (let i = 0; i < tr.values.length; i++) tr.values[i] *= k; g.animations.push(cc); }
}
export function canGLB(kind, outfitKey) {
  if (CHAR.status !== 'ready') return false;
  if (!CHAR.man.enabled.includes(kind)) return false;
  if (CHAR.A.full[outfitKey]) return true;
  if (!CHAR.A.base) return false;
  return !!(CHAR.A.outfit[outfitKey] || (kind !== 'staff' && CHAR.A.outfit.casual));
}

function boneMap(obj) { const m = {}; obj.traverse((o) => { if (o.isBone) m[o.name] = o; }); return m; }
function recolor(obj, look, slots) {
  obj.traverse((o) => {
    if (!o.isMesh) return; const mats = Array.isArray(o.material) ? o.material : [o.material];
    const nm = mats.map((m) => { const c = m.clone(); const key = (m.name || '').toLowerCase(); const v = slots[key]; if (v) c.color.set(v); c.roughness = Math.max(c.roughness ?? 0.8, 0.7); c.metalness = 0; return c; });
    o.material = Array.isArray(o.material) ? nm : nm[0]; o.castShadow = true; o.receiveShadow = false; if (o.isSkinnedMesh) o.frustumCulled = false;
  });
}

export function makeGLBAvatar(look, kind, outfitKey) {
  const A = CHAR.A, man = CHAR.man;
  const root = new THREE.Group();
  const full = A.full[outfitKey];
  if (full) return fullAvatar(root, full, look, man);
  const body = SkeletonUtils.clone(A.base.scene); root.add(body);
  const bones = boneMap(body), head = bones[man.headBone || 'Head'], hand = bones[man.handBone || 'RightHand'];
  const slots = { skin: look.skin, hair: look.hair, eyes: '#2A2020', top: look.shirt, bottom: look.pants, shoes: look.shoes || '#2A2A2E' };
  recolor(body, look, slots);
  // outfit (skinned to the same skeleton, rebound by bone name)
  const of = A.outfit[outfitKey] || A.outfit.casual;
  if (of) {
    const oc = SkeletonUtils.clone(of.scene); recolor(oc, look, slots);
    oc.traverse((o) => { if (o.isSkinnedMesh) { const sk = o.skeleton; o.bind(new THREE.Skeleton(sk.bones.map((b) => bones[b.name] || b), sk.boneInverses), o.bindMatrix); } });
    root.add(oc);
    const hide = (man.outfitHides && man.outfitHides[outfitKey]) || man.outfitHidesDefault || [];
    if (hide.length) body.traverse((o) => { if (o.isMesh && hide.includes(o.name)) o.visible = false; });
  }
  // hair / beard / hijab, glasses: rigid meshes on the head bone
  const attach = (gltf) => { if (!gltf || !head) return null; const h = gltf.scene.clone(true); recolor(h, look, slots); head.add(h); return h; };
  const style = look.style === 'beard' ? 'short' : look.style;
  if (style && style !== 'bald') attach(A.hair[style] || A.hair.short);
  if (look.style === 'beard') attach(A.hair.beard);
  if (look.glasses) attach(A.props && A.props.glasses);
  let phone = null; if (hand && A.props && A.props.phone) { phone = A.props.phone.scene.clone(true); hand.add(phone); phone.visible = false; }
  // silhouette
  const s = man.scale || 1; root.scale.set(s * (look.wide || 1), s * (look.tall || 1), s * (look.wide || 1));
  // animation state machine
  const mixer = new THREE.AnimationMixer(body), clipName = Object.assign({}, DEFAULT_CLIPS, man.clips || {}), acts = {};
  for (const st of Object.keys(DEFAULT_CLIPS)) { const c = A.clips.find((x) => x.name === clipName[st]); if (c) { const a = mixer.clipAction(c); if (LOOP_ONCE.has(st)) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; } acts[st] = a; } }
  const resolve = (st) => { let s2 = st, n = 0; while (!acts[s2] && n++ < 4) s2 = FALLBACK[s2] || 'idle'; return acts[s2] ? s2 : null; };
  const anim = {
    root, mixer, state: null, speed: 1,
    set(st, timeScale = 1) {
      const r = resolve(st); if (!r) return; this.speed = timeScale;
      if (phone) phone.visible = st === 'phone' || st === 'sitphone';
      if (r === this.state) return;
      const next = acts[r], prev = this.state && acts[this.state];
      next.reset(); if (!LOOP_ONCE.has(r)) next.time = Math.random() * next.getClip().duration; next.enabled = true; next.setEffectiveWeight(1); next.play();
      if (prev) prev.crossFadeTo(next, man.fade || 0.25, false);
      this.state = r;
    },
    update(dt) { mixer.timeScale = this.speed * this.jit; mixer.update(dt); }, jit: 0.88 + Math.random() * 0.24,
  };
  anim.set('idle'); mixer.update(0.01);
  CHAR.active.add(anim);
  const dummy = () => new THREE.Object3D();
  root.userData.p = { anim, body: dummy(), legs: [dummy(), dummy()], knees: [dummy(), dummy()], arms: [dummy(), dummy()], phone: { visible: false }, head: head || dummy(), sy: look.tall || 1, glb: true };
  root.traverse((m) => { if (m.isMesh) m.userData.owner = root; });
  return root;
}

// a complete character (mesh + its own clips), e.g. one Meshy model per role
// Meshy's Idle clip slowly swivels the hips ~90° (looks like spinning on the spot): keep the sway, drop the yaw
function steadyIdle(gltf) {
  if (gltf.userData.steady) return; gltf.userData.steady = true;
  const q = new THREE.Quaternion(), e = new THREE.Euler(0, 0, 0, 'YXZ');
  for (const c of gltf.animations) { if (!/^(M_)?(Idle|Phone|StandWork|Clean)$/.test(c.name)) continue;
    for (const tr of c.tracks) { if (!/Hips\.quaternion$/.test(tr.name)) continue; const v = tr.values;
      for (let i = 0; i < v.length; i += 4) { q.set(v[i], v[i + 1], v[i + 2], v[i + 3]); e.setFromQuaternion(q); e.y = 0; q.setFromEuler(e); v[i] = q.x; v[i + 1] = q.y; v[i + 2] = q.z; v[i + 3] = q.w; } } }
}
// Meshy's sit/lie clips slide the pelvis 30-60 cm backwards (they expect a chair behind the character).
// The game puts the character's origin on the seat itself, so keep the pelvis over the origin.
function seatClips(gltf) {
  if (gltf.userData.seated) return; gltf.userData.seated = true;
  let rest = null; gltf.scene.traverse((o) => { if (!rest && o.name === 'Hips') rest = o.position.clone(); }); if (!rest) return;
  for (const c of gltf.animations) { if (!/Sit|Lie/.test(c.name)) continue;
    for (const tr of c.tracks) { if (!/Hips\.position$/.test(tr.name)) continue; const v = tr.values, dx = v[0] - rest.x, dz = v[2] - rest.z;
      for (let i = 0; i < v.length; i += 3) { v[i] -= dx; v[i + 2] -= dz; } } }
}
// How fast this character's walk clip "wants" to move (m/s): the speed at which a planted foot slides back under the hips.
// Playing the clip at movement / natural speed keeps the feet glued to the floor (no skating, no moonwalk), whatever the character's size.
function natWalk(root, mixer, act, bones) {
  const fl = bones.LeftFoot || Object.values(bones).find((b) => /left.*foot/i.test(b.name)), fr = bones.RightFoot || Object.values(bones).find((b) => /right.*foot/i.test(b.name)), hips = bones.Hips || Object.values(bones).find((b) => /hips/i.test(b.name));
  if (!fl || !fr || !hips) return 0;
  const N = 60, dur = act.getClip().duration, v = new THREE.Vector3(), rel = (b) => { b.getWorldPosition(v); root.worldToLocal(v); return v.multiply(root.scale).clone(); };
  mixer.stopAllAction(); act.reset(); act.setEffectiveWeight(1); act.play();
  const tr = [[], []];
  for (let k = 0; k < N; k++) { act.time = k * dur / N; mixer.update(0); root.updateMatrixWorld(true); const h = rel(hips); [fl, fr].forEach((f, i) => { const q = rel(f); tr[i].push({ y: q.y, z: q.z - h.z }); }); }
  act.stop();
  const out = [];
  for (const t of tr) { const minY = Math.min(...t.map((a) => a.y)), sp = [];
    for (let k = 0; k < N; k++) { const a = t[k], b = t[(k + 1) % N]; if (a.y < minY + 0.03 && b.y < minY + 0.03) sp.push(Math.abs(b.z - a.z) / (dur / N)); }
    if (sp.length) { sp.sort((a, b) => a - b); out.push(sp[sp.length >> 1]); } }
  const r = out.length ? out.reduce((a, b) => a + b) / out.length : 0;
  return r > 0.5 && r < 3.5 ? r : 0;
}
function fullAvatar(root, gltf, look, man) {
  steadyIdle(gltf); seatClips(gltf);
  const body = SkeletonUtils.clone(gltf.scene); root.add(body);
  body.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false; const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((m) => { m.metalness = 0; m.roughness = Math.max(0.75, m.roughness ?? 0.8); }); } });
  const bones = boneMap(body), head = bones[man.headBone || 'Head'];
  const mixer = new THREE.AnimationMixer(body), clipName = Object.assign({}, DEFAULT_CLIPS, man.clips || {}), acts = {};
  const has = (n) => gltf.animations.some((x) => x.name === n);
  if (look && look.male) for (const st of ['idle', 'sit', 'phone', 'cheer']) if (has('M_' + clipName[st])) clipName[st] = 'M_' + clipName[st];
  for (const st of Object.keys(DEFAULT_CLIPS)) { const c = gltf.animations.find((x) => x.name === clipName[st]); if (c) { const a = mixer.clipAction(c); if (LOOP_ONCE.has(st)) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; } acts[st] = a; } }
  // style variants (e.g. walk -> WalkTired) picked by the game per character
  const alias = {}; for (const [st, n] of Object.entries((look && look.style2) || {})) { const c = gltf.animations.find((x) => x.name === n); if (c) { acts['~' + st] = mixer.clipAction(c); alias[st] = '~' + st; } }
  const resolve = (st) => { if (alias[st]) return alias[st]; let s2 = st, n = 0; while (!acts[s2] && n++ < 5) s2 = FALLBACK[s2] || 'idle'; return alias[s2] || (acts[s2] ? s2 : null); };
  const nat = {}; for (const k of ['walk', '~walk']) if (acts[k]) { const n = natWalk(root, mixer, acts[k], bones); if (n) nat[k] = n; }
  const anim = {
    root, mixer, state: null, speed: 1,
    set(st, timeScale = 1) { const r = resolve(st); if (!r) return; this.walking = !!nat[r]; this.speed = nat[r] ? timeScale * 2.3 / nat[r] : r === 'walk' ? timeScale * 1.6 : r === '~walk' ? timeScale * 1.45 : r === 'clean' ? 1.1 : 1; if (r === this.state) return; const next = acts[r], prev = this.state && acts[this.state]; next.reset(); if (!LOOP_ONCE.has(r)) next.time = Math.random() * next.getClip().duration; next.enabled = true; next.setEffectiveWeight(1); next.play(); if (prev) prev.crossFadeTo(next, man.fade || 0.25, false); this.state = r; },
    update(dt) { mixer.timeScale = this.speed * (this.walking ? 1 : this.jit); mixer.update(dt); }, jit: 0.88 + Math.random() * 0.24, nat,
    stride() { return nat[resolve('walk')] || 0; }, // natural speed of the walk this character uses right now (styled or calm)
    calm() { for (const k of Object.keys(alias)) if (k !== 'angry') delete alias[k]; const st = this.state && this.state.replace('~', ''); if (st && this.state !== st) this.set(st); },
  };
  anim.set('idle'); mixer.update(0.01); CHAR.active.add(anim);
  const dummy = () => new THREE.Object3D();
  root.userData.p = { anim, body: dummy(), legs: [dummy(), dummy()], knees: [dummy(), dummy()], arms: [dummy(), dummy()], phone: { visible: false }, head: head || dummy(), sy: 1, glb: true };
  root.traverse((m) => { if (m.isMesh) m.userData.owner = root; });
  return root;
}
export function updateCharacters(dt) {
  for (const a of CHAR.active) { if (!a.root.parent) { CHAR.active.delete(a); continue; } a.update(dt); }
}

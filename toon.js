// Stylized procedural characters (Two Point-like): big head with a painted, expressive face, soft rounded body,
// tapered limbs, hands, sculpted hair. Same rig contract as before: { body, legs[2], knees[2], arms[2], phone, head }.
import * as THREE from 'three';

const G = {}, M = {}, FT = {};
const mat = (c, o) => { o = o || {}; const k = c + (o.r ?? '') + (o.e ?? '') + (o.ei ?? ''); return M[k] || (M[k] = new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.8, metalness: 0, emissive: o.e || '#000000', emissiveIntensity: o.ei ?? 1 })); };
const geo = (k, f) => G[k] || (G[k] = f());
function mesh(g, c, o) { const m = new THREE.Mesh(g, mat(c, o)); m.castShadow = true; m.receiveShadow = false; return m; }
const add = (p, m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); p.add(m); return m; };
const cap = (r, l, c, seg = 10) => mesh(geo('c' + r + l + seg, () => new THREE.CapsuleGeometry(r, l, 4, seg)), c);
const ball = (r, c, o, w = 18, h = 12) => mesh(geo('s' + r + w, () => new THREE.SphereGeometry(r, w, h)), c, o);
const lathe = (k, pts, c, seg = 20) => mesh(geo('l' + k + seg, () => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg)), c);
const rbox = (w, h, d, c) => mesh(geo('b' + w + h + d, () => new THREE.BoxGeometry(w, h, d)), c);

// ---------- face texture (painted on a front decal of the head sphere) ----------
const HEAD_R = 0.3, PH0 = Math.PI / 2 - 0.95, PHL = 1.9, TH0 = 0.7, THL = 1.45;
function faceTex(expr, brow, eye) {
  const k = expr + brow + eye; if (FT[k]) return FT[k];
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const ex = 43, ey = 128, X = (u) => 128 + u;
  const eyeOpen = (x) => { g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(x, ey, 17, 21, 0, 0, 7); g.fill(); g.fillStyle = eye; g.beginPath(); g.ellipse(x + 1, ey + 3, 12, 15, 0, 0, 7); g.fill(); g.fillStyle = '#1A1414'; g.beginPath(); g.ellipse(x + 1, ey + 4, 6.5, 8, 0, 0, 7); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x + 5, ey - 3, 4.5, 0, 7); g.fill(); g.beginPath(); g.arc(x - 3, ey + 9, 2, 0, 7); g.fill(); };
  const eyeClosed = (x, up) => { g.strokeStyle = '#2A1E1E'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); up ? g.arc(x, ey + 6, 13, Math.PI * 1.15, Math.PI * 1.85) : g.arc(x, ey - 6, 13, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); };
  if (expr === 'sleep') { eyeClosed(X(-ex), false); eyeClosed(X(ex), false); }
  else if (expr === 'joy') { eyeClosed(X(-ex), true); eyeClosed(X(ex), true); }
  else { eyeOpen(X(-ex)); eyeOpen(X(ex)); }
  // brows
  g.strokeStyle = brow; g.lineWidth = 7; g.lineCap = 'round';
  const bro = (x, s) => { g.beginPath(); if (expr === 'angry') { g.moveTo(x - 14 * s, 92); g.lineTo(x + 12 * s, 101); } else if (expr === 'sad') { g.moveTo(x - 14 * s, 100); g.lineTo(x + 12 * s, 92); } else { g.moveTo(x - 14, 97); g.quadraticCurveTo(x, 88, x + 14, 97); } g.stroke(); };
  bro(X(-ex), 1); bro(X(ex), -1);
  // blush
  g.fillStyle = 'rgba(240,120,120,0.35)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(X(s * 68), 160, 16, 10, 0, 0, 7); g.fill(); }
  // mouth
  g.strokeStyle = '#6B2E2E'; g.fillStyle = '#7A2C34'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath();
  if (expr === 'happy' || expr === 'joy') { g.moveTo(X(-20), 168); g.quadraticCurveTo(X(0), 196, X(20), 168); g.closePath(); g.fill(); g.fillStyle = '#FFFFFF'; g.fillRect(X(-14), 168, 28, 5); }
  else if (expr === 'angry') { g.moveTo(X(-16), 184); g.quadraticCurveTo(X(0), 170, X(16), 184); g.stroke(); }
  else if (expr === 'sad') { g.moveTo(X(-14), 182); g.quadraticCurveTo(X(0), 172, X(14), 182); g.stroke(); }
  else if (expr === 'sleep') { g.ellipse(X(0), 176, 6, 7, 0, 0, 7); g.fill(); }
  else { g.moveTo(X(-14), 174); g.quadraticCurveTo(X(0), 182, X(14), 174); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return (FT[k] = new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.08, roughness: 0.7, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
}
const faceGeo = () => geo('face', () => new THREE.SphereGeometry(HEAD_R * 1.006, 28, 20, PH0, PHL, TH0, THL));
export function setFace(p, expr) { if (!p || !p.face || p.expr === expr) return; p.expr = expr; p.face.material = faceTex(expr, p.brow, p.eye); }

// ---------- hair ----------
function hair(head, st, c) {
  const R = HEAD_R;
  if (st === 'bald') { add(head, ball(0.06, c), 0, 0.18, -0.24); return; }
  if (st === 'hijab') { const h = ball(R * 1.12, c); h.scale.set(1, 1.05, 1.02); add(head, h, 0, 0.02, -0.03); const dr = lathe('hij', [[0, -0.05], [0.3, -0.02], [0.36, -0.25], [0.3, -0.4], [0, -0.42]], c); add(head, dr, 0, -0.18, -0.02); return 'hijab'; }
  // skull cap shared by most styles
  const capM = ball(R * 1.06, c); capM.scale.set(1, 0.78, 1.04); add(head, capM, 0, 0.09, -0.035);
  if (st !== 'beanie') { for (const s of [-1, 0, 1]) { const f = ball(0.11, c, null, 12, 8); f.scale.set(1.25, 0.6, 0.8); add(head, f, s * 0.12, 0.2, 0.2 - Math.abs(s) * 0.03); } }
  if (st === 'long') { const b = cap(0.2, 0.32, c); b.scale.set(1.25, 1, 0.55); add(head, b, 0, -0.17, -0.16); for (const s of [-1, 1]) { const l = cap(0.07, 0.3, c, 8); add(head, l, s * 0.27, -0.12, 0.0); } }
  if (st === 'bun') { add(head, ball(0.14, c), 0, 0.31, -0.12); }
  if (st === 'curly') for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const s = ball(0.11, c, null, 10, 8); add(head, s, Math.cos(a) * 0.28, 0.1 + Math.sin(i * 1.7) * 0.06, Math.sin(a) * 0.26 - 0.05); if (i % 2) add(head, ball(0.1, c, null, 10, 8), Math.cos(a) * 0.15, 0.27, Math.sin(a) * 0.15 - 0.04); }
  if (st === 'beanie') { const b = lathe('bean', [[0, 0.22], [0.2, 0.2], [0.31, 0.06], [0.33, -0.04], [0.33, -0.08]], c); add(head, b, 0, 0.12, -0.02); add(head, ball(0.07, '#F4EFE6'), 0, 0.36, -0.02); }
  if (st === 'beard') { const b = ball(0.22, c); b.scale.set(1.15, 0.75, 0.7); add(head, b, 0, -0.17, 0.14); }
}

// ---------- body ----------
const TORSO = [[0, 0], [0.19, 0], [0.235, 0.06], [0.25, 0.22], [0.245, 0.38], [0.215, 0.5], [0.13, 0.57], [0.07, 0.6], [0, 0.6]];
export function toonPerson(o) {
  const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  const sx = o.wide || 1, sy = o.tall || 1; body.scale.set(sx, sy, sx);
  const legs = [], knees = [], arms = [];
  const shirt = o.coat ? '#FFFFFF' : o.shirt;
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(s * 0.11, 0.55, 0); body.add(hip);
    add(hip, cap(0.1, 0.16, o.pants), 0, -0.13, 0);
    const knee = new THREE.Group(); knee.position.set(0, -0.27, 0); hip.add(knee);
    add(knee, cap(0.09, 0.12, o.skirt && false ? o.skin : o.pants), 0, -0.09, 0);
    const shoe = ball(0.11, o.shoes || '#2A2A2E'); shoe.scale.set(0.95, 0.6, 1.45); add(knee, shoe, 0, -0.22, 0.05);
    legs.push(hip); knees.push(knee);
  }
  // torso + hips
  add(body, lathe('torso', TORSO, o.shirt), 0, 0.5, 0);
  const pelvis = ball(0.21, o.pants); pelvis.scale.set(1.1, 0.6, 0.9); add(body, pelvis, 0, 0.56, 0);
  if (o.inner) { const v = lathe('inner', [[0, 0.3], [0.12, 0.3], [0.1, 0.55], [0, 0.55]], o.inner, 12); v.scale.set(1, 1, 1.1); add(body, v, 0, 0.55, 0.1); }
  if (o.coat) { const ct = lathe('coat', [[0.27, -0.12], [0.265, 0.2], [0.262, 0.4], [0.23, 0.52], [0.14, 0.6], [0.08, 0.62]], '#FFFFFF', 22); add(body, ct, 0, 0.5, 0); add(body, rbox(0.1, 0.5, 0.02, o.inner || o.shirt), 0, 0.82, 0.255); }
  if (o.hood) { const hd = ball(0.2, o.shirt); hd.scale.set(1.3, 0.55, 0.9); add(body, hd, 0, 1.08, -0.16); for (const s of [-1, 1]) add(body, cap(0.012, 0.14, '#F4EFE6', 6), s * 0.06, 0.92, 0.24); }
  if (o.skirt) { const sk = lathe('skirt', [[0.2, 0.32], [0.26, 0.16], [0.36, -0.06], [0, -0.06]], o.skirt); add(body, sk, 0, 0.32, 0); }
  if (o.tie) { const ti = rbox(0.06, 0.28, 0.02, o.tie); add(body, ti, 0, 0.86, 0.245); }
  if (o.apron) { const ap = rbox(0.42, 0.34, 0.03, '#EFE3CC'); add(body, ap, 0, 0.66, 0.235); add(body, rbox(0.14, 0.09, 0.02, '#E2D2B4'), -0.1, 0.62, 0.252); add(body, rbox(0.46, 0.04, 0.3, '#EFE3CC'), 0, 0.82, 0.02); }
  if (o.belt) { const b = lathe('belt', [[0.255, 0], [0.255, 0.08]], '#8B6A45', 20); add(body, b, 0, 0.58, 0); add(body, rbox(0.12, 0.13, 0.08, '#A27B4F'), -0.17, 0.56, 0.2); add(body, rbox(0.12, 0.13, 0.08, '#A27B4F'), 0.17, 0.56, 0.2); }
  if (o.lanyard) { add(body, rbox(0.09, 0.12, 0.015, '#FFFFFF'), 0, 0.84, 0.255); const ly = mesh(geo('lny', () => new THREE.TorusGeometry(0.13, 0.008, 4, 16, Math.PI)), o.uniStrip || '#2F3A52'); ly.rotation.z = Math.PI; add(body, ly, 0, 1.03, 0.2); }
  if (o.mat) { const m = cap(0.08, 0.36, '#9B86E0'); m.rotation.z = Math.PI / 2; add(body, m, 0, 1.0, -0.26); }
  if (o.clip) { add(body, rbox(0.2, 0.26, 0.03, '#8B5A3C'), 0.14, 0.78, 0.3); }
  if (o.scarf) { const sc = mesh(geo('scarf', () => new THREE.TorusGeometry(0.15, 0.05, 8, 18)), o.scarf); sc.rotation.x = Math.PI / 2; add(body, sc, 0, 1.08, 0.02); add(body, rbox(0.08, 0.26, 0.04, o.scarf), 0.06, 0.92, 0.2); }
  // arms with hands
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * 0.27, 1.02, 0); body.add(sh);
    add(sh, ball(0.085, shirt), 0, 0, 0);
    const a = cap(0.07, 0.24, shirt); add(sh, a, 0, -0.17, 0);
    add(sh, ball(0.07, o.skin), 0, -0.36, 0.01);
    arms.push(sh);
  }
  const phone = rbox(0.11, 0.18, 0.025, '#23262D'); phone.rotation.x = -0.5; add(body, phone, 0, 0.9, 0.34); phone.visible = false;
  // neck + head (head not scaled by body width)
  add(body, cap(0.075, 0.06, o.skin, 8), 0, 1.12, 0);
  const head = new THREE.Group(); head.position.set(0, 1.42, 0); body.add(head); head.scale.set(1 / sx, 1 / sy, 1 / sx);
  add(head, ball(HEAD_R, o.skin, null, 28, 20));
  for (const s of [-1, 1]) { const e = ball(0.06, o.skin, null, 10, 8); e.scale.set(0.6, 1, 0.8); add(head, e, s * 0.29, -0.01, 0); }
  if (o.nose) add(head, ball(0.045, o.skin, null, 10, 8), 0, -0.04, 0.3);
  const brow = o.style === 'hijab' ? '#3A2A2A' : o.hair === '#E9EEF2' ? '#9AA0A8' : o.hair;
  const p = { body, legs, knees, arms, phone, head, sy, brow, eye: o.eye || '#5A3A22', expr: null };
  const face = new THREE.Mesh(faceGeo(), faceTex('happy', brow, p.eye)); face.renderOrder = 1; head.add(face); p.face = face; p.expr = 'happy';
  hair(head, o.style || 'short', o.hair);
  if (o.cap) { const c = lathe('capH', [[0, 0.16], [0.24, 0.14], [0.32, 0.02], [0.32, -0.02]], o.cap); add(head, c, 0, 0.12, -0.02); const br = mesh(geo('brim', () => new THREE.CylinderGeometry(0.22, 0.22, 0.03, 16, 1, false, -Math.PI / 2, Math.PI)), o.cap); br.scale.set(1, 1, 1.2); add(head, br, 0, 0.1, 0.12); }
  if (o.goggles) { const g = rbox(0.42, 0.09, 0.08, '#BFE6F6'); add(head, g, 0, 0.24, 0.2); }
  if (o.glasses) for (const s of [-1, 1]) { const r = mesh(geo('gl', () => new THREE.TorusGeometry(0.06, 0.012, 6, 18)), '#2A2020'); add(head, r, s * 0.095, 0.035, 0.305); }
  if (o.headset) { const hb = mesh(geo('hs', () => new THREE.TorusGeometry(0.32, 0.022, 6, 20, Math.PI)), '#2F3640'); add(head, hb, 0, 0.02, 0); for (const s of [-1, 1]) add(head, ball(0.06, '#2F3640', null, 10, 8), s * 0.31, 0, 0); const mic = cap(0.012, 0.16, '#2F3640', 6); mic.rotation.x = Math.PI / 2.3; mic.rotation.z = 0.5; add(head, mic, -0.24, -0.12, 0.16); }
  root.userData.p = p;
  return root;
}

// City surroundings: dense, recognizable blocks + landmarks + moving traffic, laid out around each city's plot.
export function buildCity(kind, cg, H, box) {
  const { THREE, put, rbox, cyl, sph, grp, mat, canvasTex } = H;
  let seed = { london: 11, lagos: 23, mumbai: 37, seoul: 41, saopaulo: 53, cairo: 61, mexico: 71, newyork: 83 }[kind] || 7;
  const R = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (a) => a[Math.floor(R() * a.length)];
  const [x0, x1, z0, z1] = box;
  const xW = x0 - 4.2, xE = x1 + 4.6, zN = z0 - 4.2, zS = 15.6, GY = -0.52;
  const B = [], movers = [], reserved = [];
  const reserve = (a, b, c, d) => reserved.push([a, b, c, d]);
  const free = (a, b, c, d) => !reserved.some((r) => a < r[1] && b > r[0] && c < r[3] && d > r[2]);

  // ---------- textures ----------
  const TX = {};
  function facade(style, col, win) {
    const k = style + col + win; if (TX[k]) return TX[k];
    TX[k] = canvasTex(64, 64, (g) => {
      g.fillStyle = col; g.fillRect(0, 0, 64, 64);
      if (style === 'brick') { g.fillStyle = 'rgba(0,0,0,.10)'; for (let y = 0; y < 64; y += 6) { g.fillRect(0, y, 64, 1); for (let x = (y / 6) % 2 ? 0 : 6; x < 64; x += 12) g.fillRect(x, y, 1, 6); } }
      if (style === 'glass') { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, 0, 64, 3); g.fillRect(0, 32, 64, 3); g.fillStyle = 'rgba(20,40,60,.25)'; g.fillRect(31, 0, 2, 64); g.fillStyle = win; g.fillRect(4, 6, 24, 22); g.fillRect(36, 6, 24, 22); g.fillRect(4, 38, 24, 22); g.fillRect(36, 38, 24, 22); return; }
      if (style === 'apt') { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 26, 64, 6); g.fillStyle = win; g.fillRect(6, 6, 22, 16); g.fillRect(36, 6, 22, 16); g.fillStyle = '#FFFFFF'; g.fillRect(0, 22, 64, 4); return; }
      if (style === 'balc') { g.fillStyle = win; g.fillRect(10, 8, 20, 26); g.fillRect(38, 8, 16, 18); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(4, 36, 56, 3); for (let x = 6; x < 60; x += 5) g.fillRect(x, 30, 1, 7); return; }
      if (style === 'grid') { g.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 64; i += 16) { g.fillRect(i, 0, 2, 64); g.fillRect(0, i, 64, 2); } g.fillStyle = win; g.fillRect(4, 4, 10, 10); g.fillRect(20, 4, 10, 10); g.fillRect(36, 4, 10, 10); g.fillRect(52, 4, 10, 10); g.fillRect(4, 36, 10, 10); g.fillRect(36, 36, 10, 10); return; }
      g.fillStyle = '#FFFFFF'; g.fillRect(14, 8, 36, 30); g.fillStyle = win; g.fillRect(17, 11, 30, 24); g.fillStyle = '#FFFFFF'; g.fillRect(31, 11, 2, 24); g.fillRect(17, 22, 30, 2);
    });
    return TX[k];
  }
  const muralTex = (seedC) => canvasTex(128, 64, (g) => { const P = ['#FF5FA2', '#FFD25E', '#5AB8F0', '#7ACB4E', '#B57BE8', '#FF7A2E']; g.fillStyle = '#3B3F48'; g.fillRect(0, 0, 128, 64); for (let i = 0; i < 9; i++) { g.fillStyle = P[(i + seedC) % P.length]; g.beginPath(); g.ellipse(10 + i * 14, 20 + ((i * 37) % 30), 14, 10, i, 0, 7); g.fill(); } g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.moveTo(8, 50); for (let x = 8; x < 120; x += 12) g.lineTo(x + 6, 40 + ((x * 7) % 18)); g.stroke(); });

  // ---------- building ----------
  function bld(x, z, w, d, h, o = {}) {
    const col = o.col || '#E9E1D3', style = o.style || 'plain', win = o.win || '#9FC6DA';
    const t = facade(style, col, win), mk = (rx, ry) => { const c = t.clone(); c.needsUpdate = true; c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(Math.max(1, Math.round(rx)), Math.max(1, Math.round(ry))); return new THREE.MeshStandardMaterial({ map: c, roughness: style === 'glass' ? 0.35 : 0.85, metalness: style === 'glass' ? 0.2 : 0 }); };
    const side = mk(d / 1.6, h / 1.5), front = mk(w / 1.6, h / 1.5), roof = mat(o.roof || '#8A8E96', { r: 0.9 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, roof, roof, front, front]);
    const g = grp(x, z, o.rot || 0, cg); m.position.y = GY + h / 2; m.castShadow = m.receiveShadow = true; g.add(m);
    const top = GY + h;
    if (o.tanks) for (let i = 0; i < o.tanks; i++) put(cyl(0.35, 0.35, 0.6, o.tankCol || '#1F2226'), (R() - 0.5) * (w - 1), top + 0.3, (R() - 0.5) * (d - 1), g);
    if (o.ac) for (let i = 0; i < o.ac; i++) put(rbox(0.6, 0.4, 0.5, '#C9CED6', 0.04), (R() - 0.5) * (w - 1), top + 0.2, (R() - 0.5) * (d - 1), g);
    if (o.heli) { const hp = cyl(Math.min(w, d) * 0.38, Math.min(w, d) * 0.38, 0.08, '#3A3F47'); put(hp, 0, top + 0.05, 0, g); const hh = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: canvasTex(64, 64, (c) => { c.clearRect(0, 0, 64, 64); c.fillStyle = '#FFD25E'; c.font = '900 56px sans-serif'; c.textAlign = 'center'; c.fillText('H', 32, 54); }), transparent: true })); hh.rotation.x = -Math.PI / 2; put(hh, 0, top + 0.1, 0, g); }
    if (o.chim) for (let i = 0; i < 2; i++) { put(rbox(0.5, 0.8, 0.5, '#9A5A40', 0.03), (i ? 1 : -1) * (w / 2 - 0.6), top + 0.4, 0, g); for (let k = 0; k < 3; k++) put(cyl(0.08, 0.08, 0.25, '#C2703A'), (i ? 1 : -1) * (w / 2 - 0.6) - 0.15 + k * 0.15, top + 0.9, 0, g); }
    if (o.pitched) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.01, d * 0.62, w, 4, 1), mat(o.pitched)); r.rotation.z = Math.PI / 2; r.rotation.x = Math.PI / 4; r.scale.set(1, 1, 0.55); put(r, 0, top + d * 0.18, 0, g); r.castShadow = true; }
    if (o.neon) put(rbox(Math.min(w * 0.7, 3), 0.7, 0.08, o.neon, 0.03, { e: o.neon, ei: 1.3 }), 0, GY + Math.min(h - 0.6, 3.2), d / 2 + 0.06, g);
    if (o.laundry) for (let f = 1; f < h / 1.5 - 1; f += 2) for (let i = 0; i < 4; i++) put(rbox(0.32, 0.4, 0.03, pick(['#E9785F', '#5AB8F0', '#FFD25E', '#FF8FAB', '#FFFFFF', '#7ACB4E']), 0.01), -w / 2 + 0.6 + i * (w - 1.2) / 3, GY + f * 1.5 + 0.7, d / 2 + 0.25, g);
    if (o.mural) { const mm = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, Math.min(h * 0.6, 4)), new THREE.MeshStandardMaterial({ map: muralTex(Math.floor(R() * 6)), roughness: 0.9 })); put(mm, 0, GY + Math.min(h * 0.6, 4) / 2 + 0.3, d / 2 + 0.03, g); }
    if (o.num) { const nm = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshBasicMaterial({ map: canvasTex(128, 64, (c) => { c.fillStyle = col; c.fillRect(0, 0, 128, 64); c.fillStyle = '#2F5DA8'; c.font = '900 52px sans-serif'; c.textAlign = 'center'; c.fillText(o.num, 64, 52); }) })); put(nm, 0, top - 1.0, d / 2 + 0.03, g); }
    B.push({ o: g, x, z, h, r: Math.max(w, d) / 2 });
    return g;
  }
  const lm = (g, x, z, h, r = 3) => { B.push({ o: g, x, z, h, r, lm: true }); return g; };

  // ---------- trees & props ----------
  function tree(x, z, type, s = 1) {
    const g = grp(x, z, R() * 6, cg); g.position.y = GY;
    if (type === 'palm') { for (let i = 0; i < 6; i++) put(cyl(0.15 - i * 0.012, 0.17 - i * 0.012, 0.7 * s, '#A0794E'), Math.sin(i * 0.4) * 0.15, (i + 0.5) * 0.7 * s, 0, g); for (let k = 0; k < 7; k++) { const lf = rbox(0.25, 0.06, 1.7, k % 2 ? '#4E9E58' : '#3F8A4D', 0.03); lf.position.set(Math.cos(k * 0.9) * 0.75, 4.2 * s, Math.sin(k * 0.9) * 0.75); lf.rotation.y = -k * 0.9 + Math.PI / 2; lf.rotation.x = 0.35; g.add(lf); } return; }
    if (type === 'cone') { put(cyl(0.14, 0.18, 1.2, '#7A5A3A'), 0, 0.6, 0, g); put(new THREE.Mesh(new THREE.ConeGeometry(0.9 * s, 2.6 * s, 8), mat('#3F7A4D')), 0, 2.2 * s, 0, g); return; }
    const c = { round: '#5FA05A', plane: '#6DAA5A', cherry: '#F4A7C3', jacaranda: '#9B7FD6', ipe: '#F2C230', ginkgo: '#E8C547', banyan: '#3F8A4D' }[type] || '#5FA05A';
    put(cyl(0.18, 0.24, 1.8 * s, '#7A5A3A'), 0, 0.9 * s, 0, g); put(sph(1.15 * s, c, { r: 0.85 }), 0, 2.2 * s, 0, g); put(sph(0.8 * s, c, { r: 0.85 }), 0.65 * s, 1.85 * s, 0.35 * s, g); put(sph(0.75 * s, c, { r: 0.85 }), -0.6 * s, 1.9 * s, -0.3 * s, g);
    if (H.glb && type === 'plane') H.glb(g, 'tree', { h: 3.9 * s });
  }
  const lamp = (x, z, c = '#2F3A44') => { const g = grp(x, z, 0, cg); g.position.y = GY; put(cyl(0.06, 0.08, 3, c), 0, 1.5, 0, g); put(sph(0.2, '#FFE7A8', { e: '#FFD98A', ei: 1.2 }), 0, 3.1, 0, g); if (H.glb) H.glb(g, 'lamp', { h: 3.2 }); };
  function strip(a, b, c, d, col, y = GY + 0.03) { const m = new THREE.Mesh(new THREE.BoxGeometry(b - a, 0.06, d - c), mat(col, { r: 0.95 })); m.position.set((a + b) / 2, y, (c + d) / 2); m.receiveShadow = true; cg.add(m); return m; }
  function water(a, b, c, d, col = '#5FB3C9') { const m = new THREE.Mesh(new THREE.BoxGeometry(b - a, 0.1, d - c), mat(col, { r: 0.2, m: 0.1 })); m.position.set((a + b) / 2, GY - 0.02, (c + d) / 2); cg.add(m); reserve(a, b, c, d); }

  // ---------- roads ----------
  const ROADC = '#4A4F57', SIDE = { london: '#C9CDD2', lagos: '#D6B48C', mumbai: '#D9C9A8', seoul: '#C8CDD6', saopaulo: '#BDB6A8', cairo: '#D8C3A0', mexico: '#CFC4B4', newyork: '#B9BCC2' }[kind] || '#C9CDD2';
  const E0 = -44, E1 = 50;
  strip(E0, E1, zN - 2.2, zN + 2.2, SIDE); strip(E0, E1, zN - 1.5, zN + 1.5, ROADC, GY + 0.05);
  strip(E0, E1, zS - 2.2, zS + 2.2, SIDE); strip(E0, E1, zS - 1.5, zS + 1.5, ROADC, GY + 0.05);
  strip(xW - 2.2, xW + 2.2, E0, E1, SIDE, GY + 0.02); strip(xW - 1.5, xW + 1.5, E0, E1, ROADC, GY + 0.04);
  strip(xE - 2.2, xE + 2.2, E0, E1, SIDE, GY + 0.02); strip(xE - 1.5, xE + 1.5, E0, E1, ROADC, GY + 0.04);
  for (let x = E0; x < E1; x += 2.4) { strip(x, x + 1.1, zN - 0.06, zN + 0.06, '#F4EFE6', GY + 0.09); strip(x, x + 1.1, zS - 0.06, zS + 0.06, '#F4EFE6', GY + 0.09); }
  for (let z = E0; z < E1; z += 2.4) { strip(xW - 0.06, xW + 0.06, z, z + 1.1, '#F4EFE6', GY + 0.08); strip(xE - 0.06, xE + 0.06, z, z + 1.1, '#F4EFE6', GY + 0.08); }
  reserve(-99, 99, zN - 2.3, zN + 2.3); reserve(-99, 99, zS - 2.3, zS + 2.3); reserve(xW - 2.3, xW + 2.3, -99, 99); reserve(xE - 2.3, xE + 2.3, -99, 99);
  reserve(x0 - 2, x1 + 2, z0 - 2, 13);

  // ---------- vehicles ----------
  const loop = [[xW + 0.75, zN + 0.75], [xE - 0.75, zN + 0.75], [xE - 0.75, zS - 0.75], [xW + 0.75, zS - 0.75]];
  const loop2 = [[xW - 0.75, zS + 0.75], [xE + 0.75, zS + 0.75], [xE + 0.75, zN - 0.75], [xW - 0.75, zN - 0.75]];
  function vehicle(kindV) {
    const g = new THREE.Group(); cg.add(g);
    const body = (w, h, l, c, y = 0.35) => put(rbox(w, h, l, c, 0.18), 0, GY + y + h / 2, 0, g);
    const wheels = (l, w = 1.6) => { for (const sz of [-l * 0.32, l * 0.32]) for (const sx of [-w / 2, w / 2]) { const wh = cyl(0.3, 0.3, 0.2, '#1C1C1C'); wh.rotation.z = Math.PI / 2; put(wh, sx, GY + 0.3, sz, g); } };
    const glass = (w, h, l, y) => put(rbox(w, h, l, '#BFE6F6', 0.08, { r: 0.15 }), 0, GY + y, 0, g);
    if (kindV === 'dd') { body(1.9, 2.6, 5, '#D9342B', 0.25); for (const y of [1.2, 2.2]) glass(1.95, 0.5, 4.6, y); wheels(5, 1.7); }
    else if (kindV === 'cab') { body(1.6, 0.8, 3.2, '#1C1C1E'); put(rbox(1.5, 0.75, 1.8, '#1C1C1E', 0.3), 0, GY + 1.5, -0.1, g); glass(1.52, 0.4, 1.6, 1.55); put(rbox(0.4, 0.15, 0.2, '#FFC83D', 0.04, { e: '#FFC83D', ei: 1 }), 0, GY + 1.95, 0, g); wheels(3.2); }
    else if (kindV === 'danfo') { body(1.8, 1.6, 4.0, '#F7C531', 0.3); for (const y of [0.75, 1.55]) put(rbox(1.85, 0.12, 4.02, '#1C1C1C', 0.02), 0, GY + y, 0, g); glass(1.85, 0.45, 3.4, 1.25); put(rbox(1.4, 0.3, 1.6, '#8B6A45', 0.05), 0, GY + 2.1, 0, g); wheels(4); }
    else if (kindV === 'keke' || kindV === 'auto') { const c = kindV === 'keke' ? '#F7C531' : '#2E8B3A'; put(rbox(1.1, 0.7, 1.8, c, 0.2), 0, GY + 0.7, 0, g); put(rbox(1.15, 0.12, 1.9, kindV === 'auto' ? '#F7C531' : '#1C1C1C', 0.06), 0, GY + 1.75, 0, g); for (const sx of [-0.5, 0.5]) put(cyl(0.04, 0.04, 0.7, '#1C1C1C'), sx, GY + 1.4, -0.6, g); wheels(1.8, 1.0); }
    else if (kindV === 'okada') { put(rbox(0.3, 0.5, 1.4, '#C93A2E', 0.1), 0, GY + 0.65, 0, g); for (const sz of [-0.55, 0.55]) { const wh = cyl(0.3, 0.3, 0.12, '#1C1C1C'); wh.rotation.z = Math.PI / 2; put(wh, 0, GY + 0.3, sz, g); } put(rbox(0.4, 0.7, 0.3, pick(['#5AB8F0', '#E9785F', '#7ACB4E']), 0.1), 0, GY + 1.25, -0.1, g); put(sph(0.17, '#2A2A2E'), 0, GY + 1.75, -0.1, g); }
    else if (kindV === 'nycab') { body(1.7, 0.8, 3.4, '#F7C531'); put(rbox(1.55, 0.6, 1.9, '#F7C531', 0.28), 0, GY + 1.45, -0.1, g); glass(1.57, 0.35, 1.7, 1.5); put(rbox(0.5, 0.18, 0.25, '#F4F2EE', 0.04, { e: '#FFFFFF', ei: 0.6 }), 0, GY + 1.85, 0, g); wheels(3.4); }
    else if (kindV === 'taxiMx') { body(1.6, 0.8, 3.2, '#F4F2EE'); put(rbox(1.5, 0.6, 1.8, '#E85A9C', 0.28), 0, GY + 1.45, -0.1, g); glass(1.52, 0.35, 1.6, 1.5); put(rbox(1.62, 0.18, 3.22, '#E85A9C', 0.02), 0, GY + 0.75, 0, g); wheels(3.2); }
    else if (kindV === 'pesero') { body(1.8, 1.6, 4.2, '#7ACB4E', 0.3); put(rbox(1.85, 0.16, 4.22, '#F4F2EE', 0.02), 0, GY + 1.1, 0, g); glass(1.85, 0.45, 3.6, 1.45); wheels(4.2); }
    if (H.glb && (kindV === 'dd' || kindV === 'cab')) H.glb(g, kindV === 'dd' ? 'bus' : 'cab', { len: kindV === 'dd' ? 5.2 : 3.3, rot: Math.PI / 2, y: GY });
    else if (kindV === 'taxiC') { body(1.6, 0.8, 3.2, '#F4F2EE'); put(rbox(1.5, 0.6, 1.8, '#F4F2EE', 0.28), 0, GY + 1.45, -0.1, g); glass(1.52, 0.35, 1.6, 1.5); for (let i = 0; i < 8; i++) put(rbox(1.62, 0.1, 0.2, i % 2 ? '#1C1C1C' : '#F4F2EE', 0.01), 0, GY + 0.95, -1.4 + i * 0.4, g); wheels(3.2); }
    else if (kindV === 'micro') { body(1.8, 1.5, 4.0, '#F4F2EE', 0.3); put(rbox(1.85, 0.2, 4.02, '#2E6BB8', 0.02), 0, GY + 0.9, 0, g); glass(1.85, 0.45, 3.4, 1.4); wheels(4); }
    else if (kindV === 'tuk') { put(rbox(1.1, 0.7, 1.8, '#C93A2E', 0.2), 0, GY + 0.7, 0, g); put(rbox(1.15, 0.12, 1.9, '#1C1C1C', 0.06), 0, GY + 1.75, 0, g); for (const sx of [-0.5, 0.5]) put(cyl(0.04, 0.04, 0.7, '#1C1C1C'), sx, GY + 1.4, -0.6, g); wheels(1.8, 1.0); }
    else if (kindV === 'taxiM') { body(1.6, 0.8, 3.2, '#1C1C1C'); put(rbox(1.5, 0.6, 1.7, '#F7C531', 0.3), 0, GY + 1.45, -0.1, g); wheels(3.2); }
    else if (kindV === 'bus') { const c = { seoul: '#3BB16A', saopaulo: '#E9EEF2', mumbai: '#C8352B', mexico: '#C8352B', newyork: '#2F6FC4' }[kind] || '#E9EEF2'; body(1.9, 2.2, 5.2, c, 0.25); glass(1.95, 0.6, 4.6, 1.7); if (kind === 'saopaulo') put(rbox(1.95, 0.25, 5.22, '#1F74C4', 0.02), 0, GY + 0.75, 0, g); wheels(5.2, 1.7); }
    else { const c = kindV === 'taxiS' ? '#FF8A3D' : pick(['#E9EEF2', '#2F3A52', '#C93A2E', '#5AB8F0', '#8A9AB0', '#FFFFFF', '#3B4452']); body(1.6, 0.7, 3.4, c); put(rbox(1.45, 0.6, 1.9, c, 0.25), 0, GY + 1.3, -0.1, g); glass(1.47, 0.35, 1.7, 1.35); wheels(3.4); }
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = false; } });
    return g;
  }
  const VK = { london: ['dd', 'cab', 'cab', 'car', 'dd', 'car'], lagos: ['danfo', 'danfo', 'okada', 'keke', 'car', 'okada', 'danfo'], mumbai: ['taxiM', 'auto', 'auto', 'bus', 'taxiM', 'car', 'auto'], seoul: ['bus', 'taxiS', 'car', 'car', 'bus', 'taxiS'], saopaulo: ['bus', 'car', 'okada', 'car', 'bus', 'car', 'car'], cairo: ['taxiC', 'micro', 'tuk', 'car', 'taxiC', 'micro', 'car'], mexico: ['taxiMx', 'pesero', 'car', 'taxiMx', 'bus', 'car', 'pesero'], newyork: ['nycab', 'nycab', 'bus', 'car', 'nycab', 'car', 'nycab'] }[kind] || ['car', 'car', 'bus'];
  (H.low ? VK.slice(0, 3) : VK).forEach((k, i) => movers.push({ o: vehicle(k), path: i % 2 ? loop2 : loop, s: i / VK.length + R() * 0.05, sp: (k === 'okada' ? 0.045 : 0.03) * (0.85 + R() * 0.3) }));

  // ---------- landmarks ----------
  const C = (x, z, rot = 0) => grp(x, z, rot, cg);
  function bigBen(x, z) {
    const g = C(x, z); g.position.y = GY; const s = '#CDB98A', d = '#B8A36F';
    put(rbox(2.6, 12, 2.6, s, 0.04, { r: 0.85 }), 0, 6, 0, g);
    for (const a of [-1, 1]) for (const b of [-1, 1]) put(rbox(0.3, 13, 0.3, d, 0.03), a * 1.3, 6.5, b * 1.3, g);
    for (let y = 1.5; y < 11; y += 1.6) for (const f of [[0, 1.32, 0], [0, -1.32, 0], [1.32, 0, 1], [-1.32, 0, 1]]) put(rbox(f[2] ? 0.04 : 1.6, 0.9, f[2] ? 1.6 : 0.04, '#8C7A52', 0.02), f[0], y, f[1], g);
    put(rbox(3.2, 3.2, 3.2, s, 0.05), 0, 13.6, 0, g);
    const face = canvasTex(128, 128, (c) => { c.fillStyle = '#FFF6DC'; c.beginPath(); c.arc(64, 64, 58, 0, 7); c.fill(); c.strokeStyle = '#2F2A20'; c.lineWidth = 6; c.stroke(); c.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(64 + Math.cos(a) * 46, 64 + Math.sin(a) * 46); c.lineTo(64 + Math.cos(a) * 54, 64 + Math.sin(a) * 54); c.stroke(); } c.lineWidth = 5; c.beginPath(); c.moveTo(64, 64); c.lineTo(64, 26); c.moveTo(64, 64); c.lineTo(90, 72); c.stroke(); });
    const fm = new THREE.MeshStandardMaterial({ map: face, emissive: '#FFF0C0', emissiveMap: face, emissiveIntensity: 0.35 });
    for (const [px, pz, ry] of [[0, 1.62, 0], [0, -1.62, Math.PI], [1.62, 0, Math.PI / 2], [-1.62, 0, -Math.PI / 2]]) { const f = new THREE.Mesh(new THREE.CircleGeometry(1.25, 32), fm); f.position.set(px, 13.6, pz); f.rotation.y = ry; g.add(f); }
    put(rbox(2.6, 1.6, 2.6, d, 0.04), 0, 16, 0, g);
    const sp = new THREE.Mesh(new THREE.ConeGeometry(2.0, 5, 4), mat('#4C5A55', { r: 0.6, m: 0.3 })); sp.rotation.y = Math.PI / 4; put(sp, 0, 19.3, 0, g);
    for (const a of [-1, 1]) for (const b of [-1, 1]) put(new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.6, 4), mat('#4C5A55')), a * 1.2, 17.5, b * 1.2, g);
    put(sph(0.25, '#E3B341', { m: 0.8, r: 0.3 }), 0, 22, 0, g);
    lm(g, x, z, 22, 2); reserve(x - 2, x + 2, z - 2, z + 2); if (H.glb) H.glb(g, 'bigben', { h: 18 });
    const pal = C(x + 7.5, z); pal.position.y = GY; put(rbox(11, 5, 4, s, 0.04), 0, 2.5, 0, pal); for (let i = 0; i < 12; i++) put(new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.2, 4), mat(d)), -5.2 + i * 0.95, 5.5, 1.9, pal); for (let i = 0; i < 8; i++) put(rbox(0.7, 2.6, 0.05, '#8C7A52', 0.02), -4.6 + i * 1.3, 2.6, 2.03, pal);
    lm(pal, x + 7.5, z, 6, 6); reserve(x + 1.5, x + 13.5, z - 2.5, z + 2.5);
  }
  function londonEye(x, z, rot) {
    const g = C(x, z, rot); g.position.y = GY; const r = 7;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.14, 8, 64), mat('#E9EEF2', { m: 0.4, r: 0.4 })); ring.position.y = r + 1.2; g.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(r - 0.4, 0.06, 6, 64), mat('#E9EEF2', { m: 0.4, r: 0.4 })); ring2.position.y = r + 1.2; g.add(ring2);
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const sp = cyl(0.03, 0.03, r, '#C9CED6'); sp.position.set(Math.cos(a) * r / 2, r + 1.2 + Math.sin(a) * r / 2, 0); sp.rotation.z = a - Math.PI / 2; g.add(sp); const pod = sph(0.38, '#BFE6F6', { r: 0.2 }); pod.scale.set(1, 0.8, 1.3); pod.position.set(Math.cos(a) * r, r + 1.2 + Math.sin(a) * r, 0); g.add(pod); }
    for (const sx of [-1, 1]) { const leg = cyl(0.15, 0.2, r + 2, '#C9CED6'); leg.position.set(0, (r + 1.2) / 2, sx * 1.6); leg.rotation.x = sx * 0.2; g.add(leg); }
    put(cyl(0.5, 0.5, 0.6, '#C9CED6'), 0, r + 1.2, 0, g).rotation.x = Math.PI / 2;
    lm(g, x, z, 15, 4); reserve(x - 4, x + 4, z - 3, z + 3); if (H.glb) H.glb(g, 'londoneye', { h: 15.5 });
    movers.push({ spin: ring, sp: 0.02 });
  }
  function towerBridge(x, z) {
    const g = C(x, z); g.position.y = GY;
    for (const sx of [-4, 4]) { put(rbox(2.4, 8, 2.4, '#CDB98A', 0.05), sx, 4, 0, g); for (const a of [-1, 1]) for (const b of [-1, 1]) { put(rbox(0.5, 9, 0.5, '#BBA67A', 0.04), sx + a * 1.05, 4.5, b * 1.05, g); put(new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.4, 4), mat('#4C5A55')), sx + a * 1.05, 9.6, b * 1.05, g); } const r = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.6, 4), mat('#4C5A55')); r.rotation.y = Math.PI / 4; put(r, sx, 9.3, 0, g); }
    put(rbox(18, 0.5, 2.6, '#5B86B8', 0.05), 0, 1.4, 0, g); put(rbox(6, 0.8, 1.2, '#5B86B8', 0.05), 0, 7.2, 0, g);
    for (const sx of [-1, 1]) { const c = cyl(0.08, 0.08, 6.5, '#5B86B8'); c.position.set(sx * 7, 4.8, 0); c.rotation.z = sx * 0.75; g.add(c); }
    lm(g, x, z, 10, 6); if (H.glb) H.glb(g, 'towerbridge', { len: 18 });
  }
  function shard(x, z) { const g = C(x, z, Math.PI / 4); g.position.y = GY; const s = new THREE.Mesh(new THREE.ConeGeometry(4.2, 30, 4), new THREE.MeshStandardMaterial({ color: '#B9D3E2', roughness: 0.15, metalness: 0.5 })); s.position.y = 15; s.castShadow = true; g.add(s); for (let y = 2; y < 26; y += 2) put(rbox((30 - y) / 30 * 5.8, 0.05, 0.05, '#E9EEF2', 0.01), 0, y, (30 - y) / 30 * 2.95, g); lm(g, x, z, 30, 3); reserve(x - 4, x + 4, z - 4, z + 4); }
  function phoneBox(x, z, r = 0) { const g = C(x, z, r); g.position.y = GY; put(rbox(0.9, 2.3, 0.9, '#D9342B', 0.08), 0, 1.15, 0, g); put(rbox(0.7, 1.2, 0.92, '#BFE6F6', 0.03), 0, 1.25, 0, g); put(rbox(1.0, 0.25, 1.0, '#C02A22', 0.08), 0, 2.4, 0, g);  if (H.glb) H.glb(g, 'phonebox', { h: 2.55 }); }

  function lekkiBridge(x, z) {
    const g = C(x, z); g.position.y = GY;
    put(rbox(2.4, 0.4, 40, '#E9E1D3', 0.05), 0, 1.6, 0, g);
    put(rbox(0.9, 11, 0.9, '#F4EFE6', 0.1), 0, 5.5, 0, g); put(rbox(1.4, 0.6, 1.4, '#F4EFE6', 0.1), 0, 11, 0, g);
    for (let i = 1; i <= 7; i++) for (const sgn of [-1, 1]) { const dz = i * 2.4, len = Math.hypot(dz, 9); const c = cyl(0.03, 0.03, len, '#9AA4AE'); c.position.set(0, 1.8 + 4.5, sgn * dz / 2); c.rotation.x = sgn * Math.atan2(dz, 9); g.add(c); }
    lm(g, x, z, 11, 2);
  }
  function natTheatre(x, z) {
    const g = C(x, z); g.position.y = GY;
    put(cyl(5, 5.4, 3.2, '#E3E6EA'), 0, 1.6, 0, g); const brim = cyl(6.8, 6.8, 0.35, '#B8BEC6'); put(brim, 0, 3.4, 0, g);
    put(cyl(4.4, 5, 1.6, '#E3E6EA'), 0, 4.4, 0, g); const top = sph(4.2, '#C9CED6'); top.scale.y = 0.35; put(top, 0, 5.2, 0, g);
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; put(rbox(0.25, 2.6, 0.25, '#8A919B', 0.03), Math.cos(a) * 5.2, 1.4, Math.sin(a) * 5.2, g); }
    put(rbox(1.6, 0.6, 0.12, '#16963C', 0.03), 0, 3.6, 6.8, g);
    lm(g, x, z, 7, 6); reserve(x - 7, x + 7, z - 7, z + 7);
  }
  function market(x, z, w, d) {
    const cols = ['#E9785F', '#2BB5A6', '#FFD25E', '#5AB8F0', '#FF8FAB', '#7ACB4E', '#B57BE8'];
    for (let xx = x - w / 2 + 1.2; xx < x + w / 2 - 1; xx += 2.4) for (let zz = z - d / 2 + 1.2; zz < z + d / 2 - 1; zz += 2.6) {
      const g = C(xx + (R() - 0.5) * 0.3, zz, R() * 0.3); g.position.y = GY; put(rbox(1.6, 0.8, 1.1, '#A0794E', 0.04), 0, 0.4, 0, g);
      for (let k = 0; k < 4; k++) put(sph(0.16, pick(['#E9785F', '#FFD25E', '#7ACB4E', '#C93A2E', '#F2A541'])), -0.5 + k * 0.33, 0.9, 0, g);
      put(cyl(0.04, 0.04, 2.1, '#5A4632'), 0, 1.1, 0, g); put(new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.6, 8), mat(pick(cols), { r: 0.8 })), 0, 2.3, 0, g);
    }
    reserve(x - w / 2, x + w / 2, z - d / 2, z + d / 2);
  }
  function ekoTowers(x, z) { [[0, 0, 3, 22, '#7FC7D9'], [5, -1, 3.5, 28, '#5AA9C4'], [10, 0.5, 3, 18, '#9ED3E0'], [-5, 0, 3, 16, '#BFE6F6']].forEach(([dx, dz, w, h, c]) => bld(x + dx, z + dz, w, w, h, { style: 'glass', col: c, win: '#E6F7FC', roof: '#5A6E7A' })); reserve(x - 7, x + 13, z - 3, z + 3); }

  function gateway(x, z, rot = 0) {
    const g = C(x, z, rot); g.position.y = GY; const c = '#D8B88A';
    put(rbox(8, 6.5, 2.4, c, 0.08), 0, 3.25, 0, g); put(rbox(2.6, 4.2, 2.5, '#5A4632', 0.4), 0, 2.1, 0.03, g);
    put(rbox(2.6, 3.8, 2.5, '#F6E6CF', 1.2), 0, 2.4, 0.06, g);
    for (const sx of [-3.4, 3.4]) { put(rbox(1.4, 9, 1.4, '#C9A06B', 0.1), sx, 4.5, 0, g); put(cyl(0.7, 0.7, 0.7, '#C9A06B'), sx, 9.3, 0, g); const dm = sph(0.7, '#C9A06B'); dm.scale.y = 1.2; put(dm, sx, 9.9, 0, g); }
    const dome = sph(1.6, '#C9A06B'); dome.scale.y = 0.8; put(dome, 0, 7.1, 0, g);
    for (let i = 0; i < 6; i++) put(rbox(0.5, 0.5, 2.5, c, 0.05), -2.5 + i, 6.75, 0, g);
    lm(g, x, z, 10, 5); reserve(x - 5, x + 5, z - 3, z + 3);
  }
  function tajHotel(x, z, rot = 0) {
    const g = C(x, z, rot); g.position.y = GY;
    put(rbox(14, 7, 4, '#E6CFAE', 0.08), 0, 3.5, 0, g); for (let y = 1.2; y < 7; y += 1.4) for (let i = 0; i < 12; i++) put(rbox(0.5, 0.8, 0.05, '#7A5A3A', 0.15), -6 + i * 1.1, y, 2.03, g);
    const dm = sph(2.0, '#C8352B', { r: 0.6 }); dm.scale.y = 1.15; put(dm, 0, 8.4, 0, g); put(cyl(1.9, 1.9, 1.2, '#E6CFAE'), 0, 7.4, 0, g); put(new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.2, 8), mat('#E3B341', { m: 0.7, r: 0.3 })), 0, 10.9, 0, g);
    for (const sx of [-6, 6]) { const d2 = sph(1.1, '#C8352B', { r: 0.6 }); d2.scale.y = 1.2; put(d2, sx, 8.1, 0, g); put(cyl(1, 1, 1, '#E6CFAE'), sx, 7.4, 0, g); }
    lm(g, x, z, 11, 7); reserve(x - 7.5, x + 7.5, z - 3, z + 3);
  }
  function train(x0t, x1t, z) {
    strip(x0t, x1t, z - 1.2, z + 1.2, '#8A7D6B', GY + 0.04); for (const dz of [-0.5, 0.5]) strip(x0t, x1t, z + dz - 0.05, z + dz + 0.05, '#4A4F57', GY + 0.1);
    const g = new THREE.Group(); cg.add(g);
    for (let i = 0; i < 4; i++) { const c = grp(i * 5.4, 0, 0, g); put(rbox(5.2, 2.4, 2.0, '#C8352B', 0.2), 0, GY + 1.5, 0, c); put(rbox(5.22, 0.6, 2.02, '#F7C531', 0.05), 0, GY + 0.75, 0, c); for (let k = 0; k < 4; k++) put(rbox(0.7, 0.6, 2.04, '#BFE6F6', 0.05), -1.8 + k * 1.2, GY + 2.0, 0, c); }
    g.position.z = z; reserve(-99, 99, z - 1.3, z + 1.3);
    movers.push({ o: g, rail: [x0t - 22, x1t + 2], sp: 4 });
  }
  function seaLink(x, z) {
    const g = C(x, z); g.position.y = GY; put(rbox(46, 0.4, 2.0, '#E9E1D3', 0.05), 0, 1.6, 0, g);
    for (const sx of [-8, 8]) { put(rbox(0.6, 9, 0.6, '#E9E1D3', 0.1), sx, 5.5, -0.7, g); put(rbox(0.6, 9, 0.6, '#E9E1D3', 0.1), sx, 5.5, 0.7, g); for (let i = 1; i <= 5; i++) for (const sg of [-1, 1]) { const len = Math.hypot(i * 1.6, 8); const c = cyl(0.03, 0.03, len, '#9AA4AE'); c.position.set(sx + sg * i * 0.8, 1.8 + 4, 0); c.rotation.z = -sg * Math.atan2(i * 1.6, 8); g.add(c); } }
    lm(g, x, z, 10, 2);
  }

  function nTower(x, z) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(14, 10, 10), mat('#6F9E6A', { r: 1 })); put(m, x, GY + 5, z, cg); m.scale.z = 0.7;
    const g = C(x, z); g.position.y = GY + 10; put(cyl(0.5, 0.8, 8, '#F4EFE6'), 0, 4, 0, g); put(cyl(1.6, 1.6, 1.4, '#E9EEF2'), 0, 8.4, 0, g); put(cyl(1.2, 1.4, 0.8, '#C9CED6'), 0, 9.4, 0, g); put(cyl(0.12, 0.12, 4.5, '#F4EFE6'), 0, 12, 0, g); put(sph(0.3, '#FF5FA2', { e: '#FF5FA2', ei: 1.2 }), 0, 14.4, 0, g);
    lm(g, x, z, 24, 10); reserve(x - 14, x + 14, z - 10, z + 10);
  }
  function lotteTower(x, z) {
    const g = C(x, z); g.position.y = GY; const segs = 8;
    for (let i = 0; i < segs; i++) { const r0 = 3.2 - i * 0.33, r1 = 3.2 - (i + 1) * 0.33; const s = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, 4.5, 4), new THREE.MeshStandardMaterial({ color: i % 2 ? '#D9E3EA' : '#C6D4DE', roughness: 0.2, metalness: 0.5 })); s.rotation.y = Math.PI / 4; s.position.y = 2.25 + i * 4.5; s.castShadow = true; g.add(s); }
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3, 4), mat('#E9EEF2', { m: 0.5, r: 0.2 })); put(tip, 0, segs * 4.5 + 1.5, 0, g);
    lm(g, x, z, 38, 3); reserve(x - 4, x + 4, z - 4, z + 4);
  }
  function hanok(x, z, rot) {
    const g = C(x, z, rot); g.position.y = GY;
    put(rbox(4.2, 0.5, 3, '#B9B2A6', 0.04), 0, 0.25, 0, g); put(rbox(3.6, 1.8, 2.4, '#F4EFE6', 0.04), 0, 1.4, 0, g);
    for (let i = 0; i < 5; i++) put(rbox(0.12, 1.8, 0.12, '#8B5A2B', 0.02), -1.7 + i * 0.85, 1.4, 1.22, g);
    put(rbox(5.2, 0.25, 3.8, '#3D434C', 0.06), 0, 2.45, 0, g); const rr = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 2.0, 4.6, 4, 1), mat('#3D434C')); rr.rotation.z = Math.PI / 2; rr.rotation.x = Math.PI / 4; rr.scale.set(1, 1, 0.5); put(rr, 0, 3.0, 0, g);
    for (const sx of [-2.5, 2.5]) for (const sz of [-1.8, 1.8]) put(rbox(0.5, 0.18, 0.5, '#3D434C', 0.04), sx, 2.65, sz, g);
    lm(g, x, z, 3.5, 2.5);
  }
  function gwanghwamun(x, z, rot = 0) {
    const g = C(x, z, rot); g.position.y = GY;
    put(rbox(10, 3.4, 3.2, '#CFC8BA', 0.05), 0, 1.7, 0, g); for (const sx of [-2.8, 0, 2.8]) put(rbox(1.6, 2.4, 3.3, '#5A4632', 0.7), sx, 1.2, 0, g);
    put(rbox(8.6, 1.6, 2.6, '#B8342E', 0.04), 0, 4.2, 0, g); put(rbox(10.6, 0.3, 4.4, '#3D434C', 0.06), 0, 5.1, 0, g); put(rbox(7.6, 1.2, 2.2, '#B8342E', 0.04), 0, 5.9, 0, g); put(rbox(9.2, 0.3, 3.8, '#3D434C', 0.06), 0, 6.6, 0, g);
    const rr = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 2.4, 8, 4, 1), mat('#3D434C')); rr.rotation.z = Math.PI / 2; rr.rotation.x = Math.PI / 4; rr.scale.set(1, 1, 0.45); put(rr, 0, 7.2, 0, g);
    put(rbox(8.2, 0.16, 0.06, '#2BB5A6', 0.02), 0, 4.95, 2.22, g);
    lm(g, x, z, 7.5, 5.5); reserve(x - 5.5, x + 5.5, z - 2.5, z + 2.5);
  }

  function masp(x, z, rot = 0) { const g = C(x, z, rot); g.position.y = GY; for (const sx of [-5, 5]) put(rbox(0.7, 7.5, 0.9, '#D93A3F', 0.05), sx, 3.75, 0, g); put(rbox(11, 0.7, 1.0, '#D93A3F', 0.05), 0, 7.3, 0, g); put(rbox(10, 3.0, 5, '#3B4452', 0.05, { r: 0.3, m: 0.3 }), 0, 5.3, 0, g); for (let i = 0; i < 8; i++) put(rbox(0.9, 2.2, 0.05, '#7F9CC0', 0.02, { r: 0.2 }), -4.2 + i * 1.2, 5.3, 2.53, g); lm(g, x, z, 8, 6); reserve(x - 6, x + 6, z - 3, z + 3); }
  function copan(x, z) {
    const g = C(x, z); g.position.y = GY; const h = 22;
    for (let i = 0; i < 9; i++) { const a = (i / 8 - 0.5) * 2.4; const px = Math.sin(a) * 6, pz = (1 - Math.cos(a)) * 3 - i * 0.2; const m = new THREE.Mesh(new THREE.BoxGeometry(1.9, h, 2.4), new THREE.MeshStandardMaterial({ map: (() => { const tx = facade('plain', '#EDEBE6', '#B8C3C9').clone(); tx.needsUpdate = true; return tx; })(), roughness: 0.85 })); m.position.set(px, h / 2, pz); m.rotation.y = a * 0.8; m.castShadow = true; g.add(m); for (let y = 1; y < h; y += 0.7) { const l = rbox(2.0, 0.12, 0.12, '#FFFFFF', 0.02); l.position.set(px + Math.sin(a * 0.8 + Math.PI / 2) * 0, y, pz + 1.25); l.rotation.y = a * 0.8; g.add(l); } }
    lm(g, x, z, h, 7); reserve(x - 8, x + 8, z - 3, z + 6);
  }
  function estaiada(x, z) {
    const g = C(x, z); g.position.y = GY; put(rbox(30, 0.4, 2.2, '#E9E1D3', 0.05), 0, 1.6, 0, g); put(rbox(2, 0.4, 24, '#E9E1D3', 0.05), 0, 1.6, 0, g);
    const legA = rbox(0.8, 26, 0.8, '#F4EFE6', 0.1); legA.rotation.z = 0.28; put(legA, -1.6, 12, 0, g); const legB = rbox(0.8, 26, 0.8, '#F4EFE6', 0.1); legB.rotation.z = -0.28; put(legB, 1.6, 12, 0, g);
    for (let i = 1; i <= 7; i++) for (const sg of [-1, 1]) { const ty = 14 + i * 1.2, dx = i * 1.8; const len = Math.hypot(dx, ty - 1.8); const c = cyl(0.03, 0.03, len, '#FFD25E'); c.position.set(sg * dx / 2, (ty + 1.8) / 2, 0); c.rotation.z = -sg * Math.atan2(dx, ty - 1.8); g.add(c); }
    lm(g, x, z, 26, 2);
  }

  function empire(x, z) { const g = C(x, z); const st = [[8, 14], [6, 10], [4.5, 8], [3, 6], [2, 4]]; let y = 0; for (const [w, h] of st) { put(rbox(w, h, w, '#C9C3B6', 0.08), 0, GY + y + h / 2, 0, g); for (let k = 1; k < h; k += 1.5) put(rbox(w + 0.04, 0.08, w + 0.04, '#9C978D', 0.01), 0, GY + y + k, 0, g); y += h; }
    put(cyl(0.6, 0.9, 3, '#D8D2C6'), 0, GY + y + 1.5, 0, g); put(cyl(0.08, 0.2, 7, '#C9CED6'), 0, GY + y + 6.5, 0, g); reserve(x - 5, x + 5, z - 5, z + 5); }
  function liberty(x, z) { const g = C(x, z); put(rbox(4, 3, 4, '#B9A68A', 0.1), 0, GY + 1.5, 0, g); put(rbox(2.4, 3, 2.4, '#C9B48E', 0.1), 0, GY + 4.5, 0, g); put(cyl(0.7, 1.0, 5, '#6FB59B'), 0, GY + 8.5, 0, g); put(sph(0.55, '#6FB59B'), 0, GY + 11.4, 0, g);
    for (let i = 0; i < 7; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.6, 6), mat('#6FB59B')); const a = -0.9 + i * 0.3; sp.position.set(Math.sin(a) * 0.5, GY + 12.0, Math.cos(a) * 0.3); sp.rotation.z = -a * 0.6; g.add(sp); }
    put(cyl(0.12, 0.12, 2.6, '#6FB59B'), 0.9, GY + 12, 0, g); put(sph(0.28, '#F2C14E', { e: '#FFC94A', ei: 1 }), 0.9, GY + 13.5, 0, g); }
  function brooklynBridge(x, z) { const g = C(x, z, Math.PI / 2); put(rbox(1.6, 0.4, 30, '#8A8E96', 0.05), 0, GY + 2.5, 0, g);
    for (const tz of [-8, 8]) { put(rbox(2.4, 9, 1.8, '#B9A68A', 0.08), 0, GY + 4.5, tz, g); put(rbox(2.5, 1.6, 1.9, '#9C8A6E', 0.04), 0, GY + 6.6, tz, g); }
    for (const sx of [-0.7, 0.7]) for (const [a, b] of [[-15, -8], [-8, 8], [8, 15]]) { const n = 10; for (let k = 0; k < n; k++) { const t0 = k / n, t1 = (k + 1) / n, zA = a + (b - a) * t0, zB = a + (b - a) * t1, sag = (tt) => (a === -8 ? 9 - Math.sin(tt * Math.PI) * 5 : a === -15 ? 2.7 + tt * 6.3 : 9 - tt * 6.3); const y0 = sag(t0), y1 = sag(t1); const L = Math.hypot(zB - zA, y1 - y0); const c = cyl(0.05, 0.05, L, '#5E6470'); c.position.set(sx, GY + (y0 + y1) / 2, (zA + zB) / 2); c.rotation.x = Math.atan2(zB - zA, y1 - y0); g.add(c); } } }
  function angel(x, z) { const g = C(x, z); put(cyl(3.2, 3.6, 1.2, '#D8D2C6'), 0, GY + 0.6, 0, g); put(rbox(3, 3.2, 3, '#E3DDD2', 0.1), 0, GY + 2.8, 0, g); put(cyl(0.7, 0.85, 18, '#E8E2D6'), 0, GY + 13.4, 0, g); put(cyl(1.1, 0.9, 1.2, '#D8D2C6'), 0, GY + 23, 0, g);
    put(sph(0.5, '#E3B341', { m: 0.7, r: 0.3, e: '#C9A54A', ei: 0.2 }), 0, GY + 24.3, 0, g); for (const sx of [-1, 1]) { const w = rbox(1.2, 0.5, 0.08, '#E3B341', 0.04, { m: 0.7, r: 0.3 }); w.rotation.z = sx * 0.5; put(w, sx * 0.7, GY + 24.6, 0, g); } reserve(x - 4, x + 4, z - 4, z + 4); }
  function torreLatino(x, z) { const g = C(x, z); put(rbox(4, 30, 4, '#8FA3B3', 0.1, { m: 0.3, r: 0.2 }), 0, GY + 15, 0, g); for (let y = 2; y < 30; y += 2) put(rbox(4.05, 0.12, 4.05, '#5E6B78', 0.02), 0, GY + y, 0, g); put(rbox(2.6, 4, 2.6, '#8FA3B3', 0.1), 0, GY + 32, 0, g); put(cyl(0.12, 0.2, 6, '#C9CED6'), 0, GY + 37, 0, g); reserve(x - 3, x + 3, z - 3, z + 3); }
  function bellasArtes(x, z) { const g = C(x, z); put(rbox(10, 5, 6, '#F4EFE6', 0.1), 0, GY + 2.5, 0, g); const d = sph(2.2, '#E9785F', { r: 0.4 }); d.scale.y = 0.85; put(d, 0, GY + 5.6, 0, g); for (const sx of [-3.6, 3.6]) { const dd = sph(1.1, '#F2C14E', { r: 0.4 }); dd.scale.y = 0.8; put(dd, sx, GY + 5.4, 0, g); }
    for (let i = -3; i <= 3; i++) put(cyl(0.18, 0.2, 3.6, '#E3DDD2'), i * 1.3, GY + 1.8, 3.1, g); reserve(x - 6, x + 6, z - 4, z + 4); }
  function volcano(x, z, r) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, r * 0.9, 10), mat('#8E9AAE', { r: 1 })); put(m, x, GY + r * 0.45, z, cg); const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.3, r * 0.27, 10), mat('#F4F7FB', { r: 1 })); put(cap, x, GY + r * 0.9 - r * 0.135 + 0.05, z, cg); }
  function cairoTower(x, z) { const g = C(x, z); put(cyl(1.8, 2.0, 1.2, '#C9B48E'), 0, GY + 0.6, 0, g); put(cyl(0.85, 1.05, 22, '#D9C6A5'), 0, GY + 12, 0, g);
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; put(rbox(0.1, 21, 0.1, '#B89A70', 0.02), Math.cos(a) * 1.0, GY + 12, Math.sin(a) * 1.0, g); }
    put(cyl(1.7, 0.95, 2.2, '#C9B48E'), 0, GY + 24, 0, g); put(cyl(1.4, 1.4, 0.7, '#9FB8C4'), 0, GY + 25.4, 0, g); put(cyl(0.08, 0.12, 4, '#8A8E96'), 0, GY + 27.8, 0, g); }
  function pyramid(x, z, s) { const m = new THREE.Mesh(new THREE.ConeGeometry(s, s * 0.95, 4), mat('#D8B57A', { r: 1 })); m.rotation.y = Math.PI / 4; put(m, x, GY + s * 0.47, z, cg); }
  function felucca(x, z, r) { const g = C(x, z, r); put(rbox(0.9, 0.35, 3, '#F4EFE6', 0.15), 0, GY + 0.2, 0, g); put(cyl(0.04, 0.05, 3.2, '#6B4E2E'), 0, GY + 1.9, 0.2, g);
    const sail = new THREE.Mesh(new THREE.ConeGeometry(1.1, 3.0, 3), mat('#FFFFFF', { r: 0.9 })); sail.scale.set(1, 1, 0.06); sail.rotation.z = 0.15; put(sail, 0.3, GY + 2.0, 0.2, g); }
  function mosque(x, z) { const g = C(x, z); put(rbox(7, 3.2, 6, '#E8DCC4', 0.1), 0, GY + 1.6, 0, g); const d = sph(2.2, '#D6C7A8'); d.scale.y = 0.85; put(d, 0, GY + 3.4, 0, g); put(cyl(0.08, 0.08, 1, '#C9A54A'), 0, GY + 5.6, 0, g);
    for (const sx of [-3.8, 3.8]) { put(cyl(0.35, 0.45, 11, '#E8DCC4'), sx, GY + 5.5, -2.4, g); for (const y of [6.5, 9.5]) put(cyl(0.6, 0.6, 0.25, '#D6C7A8'), sx, GY + y, -2.4, g); put(new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.4, 12), mat('#C9B48E')), sx, GY + 11.7, -2.4, g); }
    for (let i = -2; i <= 2; i++) put(rbox(0.6, 1.4, 0.05, '#8A6A45', 0.2), i * 1.3, GY + 1.2, 3.02, g); reserve(x - 5, x + 5, z - 4, z + 4); }
  // ---------- city recipe ----------
  const P = {
    london: { bg: '#B9B3CB', ground: ['#9EA3AE', '#979CA8'], trees: 'plane', styles: [['brick', '#B5654A', '#FFD48A', { chim: 1, pitched: '#5A5F66' }], ['plain', '#F1EBDD', '#FFCF85', { chim: 1 }], ['brick', '#9C5440', '#FFD9A0', { chim: 1 }], ['glass', '#9CC3D5', '#FFE3B0', {}]], h: [3.5, 7, 6, 12, 10, 18] },
    lagos: { bg: '#F3E4C8', ground: ['#D7A678', '#CF9C6C'], trees: 'palm', styles: [['balc', '#F2C14E', '#2F3A52', { tanks: 2 }], ['balc', '#E9785F', '#2F3A52', { tanks: 2 }], ['plain', '#7FC7D9', '#2F3A52', { tanks: 1 }], ['balc', '#F4EFE6', '#3B4A6B', { tanks: 2, ac: 1 }], ['plain', '#9ED36A', '#2F3A52', { tanks: 1 }]], h: [3, 6, 5, 10, 8, 14] },
    mumbai: { bg: '#F6E6CF', ground: ['#DCC9A6', '#D3BF9A'], trees: 'palm', styles: [['balc', '#F1E4CC', '#5A4632', { laundry: 1, ac: 1 }], ['plain', '#E9C9A0', '#5A4632', { laundry: 1 }], ['balc', '#9ED3E0', '#2F3A52', { laundry: 1, tanks: 1, tankCol: '#3B6FB6' }], ['plain', '#F4EFE6', '#7A5A3A', { ac: 2 }], ['glass', '#A9C7D6', '#E3F2F8', {}]], h: [4, 8, 7, 13, 12, 24] },
    seoul: { bg: '#E3E7F2', ground: ['#C9CFD8', '#C1C7D1'], trees: 'cherry', styles: [['apt', '#F4F2EE', '#7F9CC0', {}], ['apt', '#E9EEF2', '#7F9CC0', {}], ['grid', '#C9D6E3', '#FFE7A8', { neon: '#FF5FA2' }], ['glass', '#9FB3C8', '#E3F2F8', {}], ['grid', '#E3E8EE', '#FFE7A8', { neon: '#5AB8F0' }]], h: [4, 9, 12, 20, 16, 26] },
    newyork: { bg: '#DDE3EE', ground: ['#B9BCC2', '#B1B4BB'], trees: 'plane', styles: [['brick', '#8C4A36', '#FFD9A0', { chim: 1 }], ['brick', '#A35A3F', '#FFE3B0', { chim: 1 }], ['glass', '#8FA3B3', '#DCE8EE', {}], ['grid', '#C9C3B6', '#FFE7A8', {}], ['balc', '#7A4A3A', '#FFD48A', {}], ['glass', '#6F8496', '#C9DCE8', {}]], h: [5, 10, 14, 26, 22, 40] },
    mexico: { bg: '#E8E2F2', ground: ['#CFC4B4', '#C7BBA9'], trees: 'jacaranda', styles: [['balc', '#E85A9C', '#3E3226', { laundry: 1 }], ['plain', '#F2C14E', '#3E3226', { ac: 1 }], ['balc', '#E9785F', '#3E3226', { tanks: 1 }], ['plain', '#7FC7D9', '#2F3A52', {}], ['glass', '#9FB3C8', '#E3F2F8', {}], ['plain', '#F4EFE6', '#5A4632', { mural: 1 }]], h: [3.5, 8, 7, 14, 12, 24] },
    cairo: { bg: '#F2DFC2', ground: ['#D9C29C', '#D1B992'], trees: 'palm', styles: [['balc', '#D9B98C', '#5A4632', { laundry: 1, ac: 1 }], ['plain', '#C9A27A', '#4A3A2A', { ac: 2 }], ['balc', '#E8D3B0', '#5A4632', { laundry: 1, tanks: 1 }], ['plain', '#B88A62', '#3E3226', { ac: 1 }], ['glass', '#9FB8C4', '#E3F2F8', {}]], h: [4, 9, 8, 14, 12, 22] },
    saopaulo: { bg: '#E3DFD8', ground: ['#C4BEB3', '#BCB6AA'], trees: 'jacaranda', styles: [['grid', '#B8B2A6', '#E3DDD2', { heli: 1 }], ['plain', '#E3DDD2', '#5E6B78', { ac: 2 }], ['grid', '#9C978D', '#D8D2C6', { heli: 1 }], ['glass', '#8FA3B3', '#DCE8EE', { heli: 1 }], ['plain', '#C9C3B6', '#5E6B78', { mural: 1 }]], h: [6, 12, 14, 24, 22, 34] },
  }[kind] || null;
  const RC = P || { bg: '#DCE6EC', ground: ['#C9D5DA', '#C2CFD5'], trees: 'round', styles: [['plain', '#F1E4CC', '#9FC6DA', {}]], h: [3, 6, 6, 10, 8, 14] };

  // landmarks & water first (they reserve space)
  const cx = (x0 + x1) / 2;
  if (kind === 'london') {
    water(-44, 50, zN - 26, zN - 16, '#6C9AAE'); towerBridge(cx + 14, zN - 21); bigBen(x0 + 1, zN - 9); londonEye(xE + 9, zN - 9, Math.PI / 2); shard(xW - 13, zS + 14);
    const park = strip(xW - 18, xW - 4, 2, 11, '#8DBF6A', GY + 0.05); reserve(xW - 18, xW - 4, 2, 11); for (let i = 0; i < 7; i++) tree(xW - 16 + R() * 10, 3 + R() * 7, 'plane', 1.1);
    phoneBox(x1 + 1.6, 12, Math.PI); phoneBox(x0 - 2.0, 12.2, 0); phoneBox(xE - 2.4, zS + 3, 0);
    // street furniture: Victorian lamps, benches, pillar boxes (modelled; primitives until the models load)
    const lampL = (x, z) => { const g = C(x, z); g.position.y = GY; put(cyl(0.06, 0.09, 3, '#2F3A44'), 0, 1.5, 0, g); put(sph(0.2, '#FFE7A8', { e: '#FFD98A', ei: 1.2 }), 0, 3.1, 0, g); if (H.glb) H.glb(g, 'lamp', { h: 3.2 }); };
    const benchL = (x, z, r) => { const g = C(x, z, r); g.position.y = GY; put(rbox(1.6, 0.08, 0.45, '#B5793A', 0.03), 0, 0.45, 0, g); put(rbox(1.6, 0.45, 0.07, '#B5793A', 0.03), 0, 0.7, -0.2, g); if (H.glb) H.glb(g, 'bench', { len: 1.6 }); };
    const postL = (x, z) => { const g = C(x, z); g.position.y = GY; put(cyl(0.3, 0.3, 1.3, '#D9342B'), 0, 0.65, 0, g); put(sph(0.32, '#D9342B'), 0, 1.3, 0, g); if (H.glb) H.glb(g, 'postbox', { h: 1.45 }); };
    for (let x = -38; x < 48; x += 8) { lampL(x, zS - 1.85); lampL(x + 4, zS + 1.9); }
    for (let z = zN + 6; z < zS - 4; z += 7) { lampL(xW + 1.9, z); lampL(xE - 1.9, z); }
    for (const [bx, r] of [[-30, Math.PI], [-14, Math.PI], [18, Math.PI], [34, Math.PI]]) benchL(bx, zS + 1.95, r);
    postL(x0 - 3.2, zS - 1.85); postL(x1 + 2.6, zS - 1.85); postL(xE + 1.9, zS + 4);
    { const g = C(cx + 3, zS + 2.05, Math.PI); g.position.y = GY; for (const x of [-1.1, 1.1]) put(cyl(0.05, 0.05, 2.2, '#4C7774'), x, 1.1, 0, g); put(rbox(2.4, 0.08, 1.0, '#CFE9F2', 0.03), 0, 2.25, 0, g); if (H.glb) H.glb(g, 'busstop', { len: 2.4 }); }
  } else if (kind === 'lagos') {
    water(-44, 50, -48, zN - 8, '#4FA3B8'); lekkiBridge(cx + 6, zN - 26); ekoTowers(cx - 10, -44);
    natTheatre(xE + 11, -2); market(xW - 10, zS - 4, 11, 12);
    for (let i = 0; i < 8; i++) tree(xW - 3 + R() * 2, zN + 4 + i * 3.2, 'palm', 1);
  } else if (kind === 'mumbai') {
    water(-44, 50, -48, zN - 10, '#4F9FC0'); seaLink(cx - 8, zN - 26);
    for (let x = -40; x < 48; x += 4) lamp(x, zN - 9.2, '#C9CED6'); strip(-44, 50, zN - 10, zN - 8.4, '#E9E1D3', GY + 0.06);
    gateway(xE + 8, zS + 6, 0); tajHotel(xE + 10, zN - 4, 0); train(-44, 50, zS + 13);
    for (let i = 0; i < 9; i++) tree(-40 + i * 10, zN - 7.2, 'palm', 1.1);
    for (let i = 0; i < 10; i++) { const g = C(xW - 8 - (i % 5) * 2.6, zS - 4 - Math.floor(i / 5) * 2.8, 0); g.position.y = GY; put(rbox(2.3, 1.6, 2.4, pick(['#B9A68A', '#8A9AB0', '#C9A06B']), 0.05), 0, 0.8, 0, g); put(rbox(2.5, 0.12, 2.6, '#3B6FB6', 0.03), 0, 1.66, 0, g); } reserve(xW - 21, xW - 6, zS - 10, zS - 2);
  } else if (kind === 'seoul') {
    water(-44, 50, zN - 20, zN - 12, '#6FA6C4'); nTower(cx, zN - 32); lotteTower(xE + 12, zS + 12); gwanghwamun(cx - 6, zS + 6, 0);
    for (let i = 0; i < 6; i++) hanok(xW - 7 - (i % 2) * 6, zN + 5 + Math.floor(i / 2) * 5, (i % 2) * 0.1); reserve(xW - 17, xW - 3, zN + 2, zN + 20);
    for (const [mx, mz, r] of [[-34, zN - 36, 12], [36, zN - 34, 13]]) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, 12, 9), mat('#7FAE7A', { r: 1 })); m.scale.z = 0.7; put(m, mx, GY + 6, mz, cg); }
    for (let i = 0; i < 10; i++) tree(-36 + i * 8.5, zN - 9.5, i % 3 ? 'cherry' : 'ginkgo', 0.9);
  } else if (kind === 'newyork') {
    water(-44, 50, zN - 26, zN - 14, '#5E8FA8'); brooklynBridge(cx - 6, zN - 20); liberty(cx + 26, zN - 30); empire(xE + 12, zN + 2);
    const park = strip(xW - 20, xW - 4, 2, 14, '#7FB062', GY + 0.05); reserve(xW - 20, xW - 4, 2, 14); for (let i = 0; i < 9; i++) tree(xW - 18 + R() * 12, 3 + R() * 10, 'plane', 1.1);
    for (let i = 0; i < 10; i++) lamp(-36 + i * 8.5, zS + 2.2, '#2F3A44');
  } else if (kind === 'mexico') {
    angel(cx + 4, zN - 16); torreLatino(xE + 12, zN + 2); bellasArtes(xW - 12, zS + 8); volcano(cx - 22, zN - 46, 16); volcano(cx - 4, zN - 50, 11);
    for (let i = 0; i < 9; i++) tree(-38 + i * 10, zN - 9.8, 'jacaranda', 1.05);
    for (let i = 0; i < 6; i++) { const y = GY + 4.2, z = zS + 2.6, x0p = -30 + i * 12; for (let k = 0; k < 6; k++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.55), mat(['#E85A9C', '#F2C14E', '#5AB8F0', '#7ACB4E', '#B57BE8', '#E9785F'][(i + k) % 6], { r: 0.9 })); f.position.set(x0p + k * 1.6, y - Math.sin(k / 5 * Math.PI) * 0.5, z); f.material.side = THREE.DoubleSide; cg.add(f); } }
  } else if (kind === 'cairo') {
    water(-44, 50, zN - 24, zN - 12, '#4C9AA8'); strip(cx - 4, cx + 16, zN - 21, zN - 15, '#9DBF73', GY + 0.04); cairoTower(cx + 6, zN - 18);
    for (const [fx, fz, fr] of [[cx - 14, zN - 14.5, 0.3], [cx - 24, zN - 20, -0.4], [cx + 24, zN - 14, 0.2]]) felucca(fx, fz, fr);
    for (const [px, pz, ps] of [[cx - 30, zN - 44, 9], [cx - 18, zN - 47, 7], [cx - 41, zN - 41, 5]]) pyramid(px, pz, ps);
    mosque(xE + 11, zS + 9); for (let i = 0; i < 8; i++) tree(-38 + i * 11, zN - 10.5, 'palm', 1.1);
  } else if (kind === 'saopaulo') {
    water(-44, 50, zN - 21, zN - 13, '#7E9A8A'); estaiada(cx + 4, zN - 17); masp(cx - 4, zS + 6, 0); copan(xE + 12, zN + 6);
    for (let i = 0; i < 8; i++) tree(-38 + i * 11, zS + 3.2, i % 3 ? 'jacaranda' : 'ipe', 1);
  }

  // fill blocks
  const rowH = (row) => { const [a, b] = [RC.h[row * 2], RC.h[row * 2 + 1]]; return a + R() * (b - a); };
  function band(ax, bx, az, bz, depthAxis) {
    // depthAxis: 'z-' grows away north, 'z+' south, 'x-' west, 'x+' east
    const rows = H.low ? 2 : 3;
    for (let row = 0; row < rows; row++) {
      const dd = 5 + R() * 1.5;
      let off = 2.6 + row * 7.5;
      for (let u = depthAxis[0] === 'z' ? ax : az; u < (depthAxis[0] === 'z' ? bx : bz);) {
        const w = 3.6 + R() * 3.4, st = pick(RC.styles), h = rowH(row), gap = 0.8 + R() * 1.4;
        let x, z, bw, bd;
        if (depthAxis === 'z-') { x = u + w / 2; z = az - off - dd / 2; bw = w; bd = dd; }
        else if (depthAxis === 'z+') { x = u + w / 2; z = az + off + dd / 2; bw = w; bd = dd; }
        else if (depthAxis === 'x-') { x = ax - off - dd / 2; z = u + w / 2; bw = dd; bd = w; }
        else { x = ax + off + dd / 2; z = u + w / 2; bw = dd; bd = w; }
        if (free(x - bw / 2, x + bw / 2, z - bd / 2, z + bd / 2) && Math.abs(x) < 46 && Math.abs(z - 3) < 46) {
          const o = { style: st[0], col: st[1], win: st[2], ...st[3] };
          if (row > 0) { delete o.laundry; delete o.mural; delete o.neon; }
          if (row === 0 && kind === 'saopaulo' && R() < 0.35) o.mural = 1;
          if (kind === 'seoul' && st[0] === 'apt') o.num = String(101 + Math.floor(R() * 9));
          const rot = depthAxis === 'z-' ? Math.PI : depthAxis === 'x-' ? -Math.PI / 2 : depthAxis === 'x+' ? Math.PI / 2 : 0;
          const swap = rot === Math.PI / 2 || rot === -Math.PI / 2;
          bld(x, z, swap ? bd : bw, swap ? bw : bd, h, { ...o, rot });
          reserve(x - bw / 2, x + bw / 2, z - bd / 2, z + bd / 2);
        }
        u += w + gap;
      }
    }
  }
  band(-44, 50, zN - 2.2, 0, 'z-'); band(-44, 50, zS + 2.2, 0, 'z+'); band(xW - 2.2, 0, zN - 2, zS + 2, 'x-'); band(xE + 2.2, 0, zN - 2, zS + 2, 'x+');
  // street trees & lamps along the inner sidewalks
  for (let x = xW + 3; x < xE - 2; x += 5.5) if (free(x - 0.5, x + 0.5, zS + 1.6, zS + 2.4) || true) tree(x, zS - 2.0, RC.trees, 0.8);
  for (let z = zN + 3; z < zS - 2; z += 6) { if (z < 6 || z > 13) { tree(xW + 2.0, z, RC.trees, 0.8); tree(xE - 2.0, z, RC.trees, 0.8); } }
  for (let x = xW + 5.5; x < xE - 2; x += 8) lamp(x, zN + 2.0);

  if (H.low) cg.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  return { bg: RC.bg, ground: RC.ground, buildings: B, movers };
}

export function moveCity(movers, dt) {
  for (const m of movers) {
    if (m.spin) { m.spin.rotation.z += m.sp * dt; continue; }
    if (m.rail) { m.o.position.x += m.sp * dt; if (m.o.position.x > m.rail[1]) m.o.position.x = m.rail[0]; continue; }
    const P = m.path; let L = 0; const seg = []; for (let i = 0; i < 4; i++) { const a = P[i], b = P[(i + 1) % 4]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push(l); L += l; }
    m.s = (m.s + m.sp * dt * 30 / L) % 1; let d = m.s * L, i = 0; while (d > seg[i]) { d -= seg[i]; i++; }
    const a = P[i], b = P[(i + 1) % 4], f = d / seg[i];
    m.o.position.set(a[0] + (b[0] - a[0]) * f, 0, a[1] + (b[1] - a[1]) * f); m.o.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]);
  }
}

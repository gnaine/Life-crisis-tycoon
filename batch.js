// Static batching: merges the meshes of a subtree into one mesh per material "kind" (vertex colors carry the colour),
// cutting draw calls. Nodes in `stop` (and their subtrees) are left alone, e.g. animated limbs or toggled parts.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const MATS = {};
function kindKey(m) { return [m.roughness, m.metalness, m.emissive.getHexString(), m.emissiveIntensity.toFixed(2)].join('|'); }
function kindMat(m) {
  const k = kindKey(m);
  return MATS[k] || (MATS[k] = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: m.roughness, metalness: m.metalness, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity }));
}
const canBatch = (o) => o.isMesh && !o.isSkinnedMesh && !o.isInstancedMesh && o.visible && o.material && !Array.isArray(o.material) && o.material.isMeshStandardMaterial && !o.material.map && !o.material.transparent && !o.material.vertexColors;

// Merge the batchable meshes found under `node` (not crossing `stop` nodes) into children of `node`.
export function batchNode(node, stop = new Set(), opts = {}) {
  node.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(node.matrixWorld).invert();
  const buckets = new Map(), victims = [];
  const walk = (o) => {
    for (const c of o.children.slice()) {
      if (stop.has(c)) continue;
      if (canBatch(c)) {
        const g = c.geometry.clone();
        for (const n of Object.keys(g.attributes)) if (!['position', 'normal'].includes(n)) g.deleteAttribute(n);
        if (!g.attributes.normal) g.computeVertexNormals();
        g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, c.matrixWorld));
        const col = c.material.color, n = g.attributes.position.count, arr = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { arr[i * 3] = col.r; arr[i * 3 + 1] = col.g; arr[i * 3 + 2] = col.b; }
        g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
        const k = kindKey(c.material); if (!buckets.has(k)) buckets.set(k, { mat: c.material, geos: [], cast: false, recv: false, ud: c.userData });
        const b = buckets.get(k); b.geos.push(g); b.cast = b.cast || c.castShadow; b.recv = b.recv || c.receiveShadow;
        victims.push(c);
      }
      if (c.children.length && !stop.has(c)) walk(c);
    }
  };
  walk(node);
  if (victims.length < 2) { for (const b of buckets.values()) b.geos.forEach((g) => g.dispose()); return 0; }
  const vs = new Set(victims);
  for (const v of victims) { for (const ch of v.children.slice()) if (!vs.has(ch)) node.attach(ch); v.parent && v.parent.remove(v); }
  // drop now-empty groups (not stop nodes)
  const prune = (o) => { for (const c of o.children.slice()) { if (stop.has(c)) continue; prune(c); if (c.isGroup && !c.children.length && !c.isMesh) o.remove(c); } };
  prune(node);
  let made = 0;
  for (const b of buckets.values()) {
    if (b.geos.some((x) => !x.index)) b.geos = b.geos.map((x) => (x.index ? x.toNonIndexed() : x));
    const merged = mergeGeometries(b.geos, false); b.geos.forEach((g) => g.dispose()); if (!merged) continue;
    const m = new THREE.Mesh(merged, kindMat(b.mat)); m.castShadow = b.cast; m.receiveShadow = b.recv; Object.assign(m.userData, opts.userData || b.ud);
    node.add(m); made++;
  }
  return made;
}

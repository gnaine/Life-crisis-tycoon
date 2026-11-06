// Optimise Meshy props for mobile: weld + simplify to a triangle budget, 512–1024 px WebP base colour only,
// no metal/rough/normal maps (stylised look: flat matte material), scaled to a real height and with the pivot at the base centre.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { compactPrimitive, weld, simplify, dedup, prune, textureCompress, flatten, join, center, quantize } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'fs';
const [, , input, output, tris = '4000', height = '1', tex = '512'] = process.argv;
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);
const root = doc.getRoot();
for (const m of root.listMaterials()) { m.setMetallicRoughnessTexture(null); m.setNormalTexture(null); m.setOcclusionTexture(null); m.setMetallicFactor(0); m.setRoughnessFactor(0.85); }
await doc.transform(dedup(), prune(), flatten(), join(), weld({ tolerance: 0.0005 }));
const count = () => root.listMeshes().reduce((a, me) => a + me.listPrimitives().reduce((b, p) => b + (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3, 0), 0);
const before = count(), target = +tris;
if (before > target) await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: target / before, error: 0.2, lockBorder: false }));
// fallback: Meshy meshes have many UV seams, so the normal simplifier stalls; finish with a permissive,
// UV-aware pass (collapses across seams but weighs the UV error, so textures stay put)
const tot = count();
if (tot > target * 1.25) for (const me of root.listMeshes()) for (const p of me.listPrimitives()) {
  const idx = p.getIndices(); if (!idx) continue; const pos = p.getAttribute('POSITION'), uv = p.getAttribute('TEXCOORD_0');
  const share = idx.getCount() / 3 / tot; const want = Math.max(300, Math.floor(target * share)) * 3;
  const P = new Float32Array(pos.getArray()); const ext = Math.max(...pos.getMax([]).map((v, i) => v - pos.getMin([])[i]));
  let out;
  if (uv) {
    const U = new Float32Array(uv.getArray());
    [out] = MeshoptSimplifier.simplifyWithAttributes(new Uint32Array(idx.getArray()), P, 3, U, 2, [ext * 0.5, ext * 0.5], null, want, 1, ['Permissive']);
  } else [out] = MeshoptSimplifier.simplify(new Uint32Array(idx.getArray()), P, 3, want, 1, ['Permissive']);
  idx.setArray(new Uint32Array(out)); compactPrimitive(p);
}
await doc.transform(prune(), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [+tex, +tex], quality: 80 }));
// scale to the wanted height, pivot at base centre
await doc.transform(center({ pivot: 'below' }));
let minY = Infinity, maxY = -Infinity;
for (const me of root.listMeshes()) for (const p of me.listPrimitives()) { const a = p.getAttribute('POSITION'); const mn = a.getMin([]), mx = a.getMax([]); minY = Math.min(minY, mn[1]); maxY = Math.max(maxY, mx[1]); }
const s = +height / (maxY - minY || 1);
for (const n of root.listScenes()[0].listChildren()) { const sc = n.getScale(); n.setScale([sc[0] * s, sc[1] * s, sc[2] * s]); const t = n.getTranslation(); n.setTranslation([t[0] * s, t[1] * s, t[2] * s]); }
await doc.transform(quantize());
await io.write(output, doc);
console.log(input.split('/').pop(), Math.round(before), '->', Math.round(count()), 'tris,', (fs.statSync(output).size / 1024).toFixed(0), 'KB');

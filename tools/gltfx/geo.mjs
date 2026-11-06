// shape-only simplification: drop UVs/normals so seams can't block or tear the mesh, then quadric simplify to the budget
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, dedup, prune, flatten, join } from '@gltf-transform/functions'; import { MeshoptSimplifier } from 'meshoptimizer';
const [, , input, output, tris] = process.argv; await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS); const doc = await io.read(input); const root = doc.getRoot();
for (const me of root.listMeshes()) for (const p of me.listPrimitives()) { for (const s of p.listSemantics()) if (s !== 'POSITION') p.setAttribute(s, null); p.setMaterial(null); }
for (const t of root.listTextures()) t.dispose(); for (const m of root.listMaterials()) m.dispose();
await doc.transform(dedup(), flatten(), join(), weld({ tolerance: 0.0001 }), prune());
const count = () => root.listMeshes().reduce((a, me) => a + me.listPrimitives().reduce((b, p) => b + p.getIndices().getCount() / 3, 0), 0);
const before = count(); await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: +tris / before, error: 0.05, lockBorder: false }), prune());
await io.write(output, doc); console.log(input.split('/').pop(), before, '->', count());

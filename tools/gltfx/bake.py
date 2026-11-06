# Re-bake the original Meshy texture onto the simplified mesh (fresh xatlas UVs), so colours stay clean.
# usage: python3 -I bake.py high.glb low.glb out.glb texsize
import sys, numpy as np, trimesh, xatlas
from PIL import Image, ImageFilter

hi_p, lo_p, out_p, T = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])

def one_mesh(path, need_tex):
    sc = trimesh.load(path, force='scene')
    ms = []
    for name, g in sc.graph.to_flattened().items():
        geom = g.get('geometry')
        if geom is None: continue
        m = sc.geometry[geom].copy(); m.apply_transform(np.array(g['transform'])); ms.append(m)
    if not need_tex: return trimesh.util.concatenate(ms)
    assert len(ms) == 1, 'expected one textured mesh'
    return ms[0]

hi = one_mesh(hi_p, True); lo = one_mesh(lo_p, False)
uv_hi = np.asarray(hi.visual.uv, dtype=np.float64)
mat = hi.visual.material
img = getattr(mat, 'baseColorTexture', None) or getattr(mat, 'image', None)
tex = np.asarray(img.convert('RGB'), dtype=np.float32); TH, TW = tex.shape[:2]

vmap, idx, uvs = xatlas.parametrize(lo.vertices, lo.faces)
V = lo.vertices[vmap]; F = idx

def sample(uv):
    x = (uv[:, 0] % 1) * (TW - 1); y = (1 - (uv[:, 1] % 1)) * (TH - 1)
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int); x1 = np.minimum(x0 + 1, TW - 1); y1 = np.minimum(y0 + 1, TH - 1)
    fx = (x - x0)[:, None]; fy = (y - y0)[:, None]
    return (tex[y0, x0] * (1 - fx) * (1 - fy) + tex[y0, x1] * fx * (1 - fy) + tex[y1, x0] * (1 - fx) * fy + tex[y1, x1] * fx * fy)

# rasterize every low-poly triangle into the atlas → 3D points
P = uvs * T; pts = []; pix = []
for f in F:
    a, b, c = P[f]; mn = np.floor(np.minimum(np.minimum(a, b), c)).astype(int) - 1; mx = np.ceil(np.maximum(np.maximum(a, b), c)).astype(int) + 1
    xs, ys = np.meshgrid(np.arange(max(mn[0], 0), min(mx[0], T)), np.arange(max(mn[1], 0), min(mx[1], T)))
    q = np.stack([xs.ravel() + 0.5, ys.ravel() + 0.5], 1)
    v0, v1 = b - a, c - a; d = v0[0] * v1[1] - v1[0] * v0[1]
    if abs(d) < 1e-12: continue
    w1 = ((q[:, 0] - a[0]) * v1[1] - v1[0] * (q[:, 1] - a[1])) / d; w2 = (v0[0] * (q[:, 1] - a[1]) - (q[:, 0] - a[0]) * v0[1]) / d; w0 = 1 - w1 - w2
    e = -0.02; ok = (w0 >= e) & (w1 >= e) & (w2 >= e)
    if not ok.any(): continue
    W = np.stack([w0[ok], w1[ok], w2[ok]], 1); pts.append(W @ V[f]); pix.append(q[ok].astype(int))
pts = np.concatenate(pts); pix = np.concatenate(pix)

# closest point on the original surface → its UV → colour
CH = 40000; cps, ds, ts = [], [], []
for i in range(0, len(pts), CH):
    c_, d_, t_ = trimesh.proximity.closest_point(hi, pts[i:i + CH]); cps.append(c_); ds.append(d_); ts.append(t_)
cp, dist, tid = np.concatenate(cps), np.concatenate(ds), np.concatenate(ts)
bc = trimesh.triangles.points_to_barycentric(hi.triangles[tid], cp)
uvq = (uv_hi[hi.faces[tid]] * bc[:, :, None]).sum(1)
col = sample(uvq)

out = np.zeros((T, T, 3), np.float32); cnt = np.zeros((T, T), np.float32)
np.add.at(out, (pix[:, 1], pix[:, 0]), col); np.add.at(cnt, (pix[:, 1], pix[:, 0]), 1)
filled = cnt > 0; out[filled] /= cnt[filled][:, None]
# pad islands so mip-maps don't bleed the background into the seams
im = out.astype(np.uint8); mask = filled.copy()
for _ in range(8):
    m = Image.fromarray(im).filter(ImageFilter.MaxFilter(3)); mm = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))
    grow = (np.asarray(mm) > 0) & ~mask; im[grow] = np.asarray(m)[grow]; mask |= grow
# images are stored top-down, uvs bottom-up: flip rows
img_out = Image.fromarray(im[::-1].copy())
uvs_out = uvs.copy()
mesh = trimesh.Trimesh(V, F, process=False)
mesh.visual = trimesh.visual.TextureVisuals(uv=uvs_out, material=trimesh.visual.material.PBRMaterial(baseColorTexture=img_out, metallicFactor=0, roughnessFactor=0.8))
mesh.export(out_p)
print(out_p, len(F), 'tris, mean dist', float(dist.mean()))

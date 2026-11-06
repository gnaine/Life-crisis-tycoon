# Blender 5.2 (bpy): reception desk, London plane tree, toilet cubicle — matched to the user's reference sheets.
# Blender axes: Z up, front = -Y (glTF exporter turns that into +Z forward, Y up).
import bpy, bmesh, math, random, sys
from mathutils import Vector, Matrix, Euler

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/home/claude/blender/out'
random.seed(7)

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

MATS = {}
def mat(name, hexc, rough=0.6, metal=0.0):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    c = tuple(int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5))
    lin = tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)
    b.inputs['Base Color'].default_value = (*lin, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    m.diffuse_color = (*lin, 1); MATS[name] = m; return m

def lin3(h):  # byte colour layers are stored as sRGB
    return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))

def link(o):
    bpy.context.scene.collection.objects.link(o); return o

def finish(o, m, bevel=0.0, seg=2, smooth=True, angle=50):
    o.data.materials.clear(); o.data.materials.append(m)
    if bevel:
        bv = o.modifiers.new('bv', 'BEVEL'); bv.width = bevel; bv.segments = seg; bv.limit_method = 'ANGLE'; bv.angle_limit = math.radians(30)
    if smooth:
        for p in o.data.polygons: p.use_smooth = True
    return o

def from_bm(bm, name):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); return link(bpy.data.objects.new(name, me))

def box(name, size, loc, m, bevel=0.02, rot=(0, 0, 0)):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    o = from_bm(bm, name); o.location = loc; o.rotation_euler = rot; return finish(o, m, bevel, 3)

def cyl(name, r1, r2, h, loc, m, seg=24, rot=(0, 0, 0), bevel=0.0):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r1, radius2=r2, depth=h)
    o = from_bm(bm, name); o.location = loc; o.rotation_euler = rot; return finish(o, m, bevel, 2)

def sphere(name, r, loc, m, scale=(1, 1, 1), sub=2):
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    o = from_bm(bm, name); o.location = loc; o.scale = scale; return finish(o, m)

def sector(name, r0, r1, a0, a1, z0, z1, m, n=40, center=(0, 0), bevel=0.012):
    bm = bmesh.new(); cx, cy = center; rings = []
    for i in range(n + 1):
        a = a0 + (a1 - a0) * i / n; ca, sa = math.cos(a), math.sin(a)
        rings.append([bm.verts.new((cx + r * ca, cy + r * sa, z)) for (r, z) in ((r0, z0), (r1, z0), (r1, z1), (r0, z1))])
    for i in range(n):
        for k in range(4):
            bm.faces.new((rings[i][k], rings[i + 1][k], rings[i + 1][(k + 1) % 4], rings[i][(k + 1) % 4]))
    bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = from_bm(bm, name); return finish(o, m, bevel, 2)

def export(path):
    for o in bpy.context.scene.objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = next(iter(bpy.context.scene.objects))
    # smooth-by-angle so bevelled boxes keep crisp faces
    try: bpy.ops.object.shade_auto_smooth(angle=math.radians(40))
    except Exception:
        for o in bpy.context.scene.objects:
            if o.type == 'MESH': o.data.set_sharp_from_angle(angle=math.radians(40))
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_apply=True, export_yup=True, export_materials='EXPORT', export_vertex_color='ACTIVE')
    tris = 0
    dg = bpy.context.evaluated_depsgraph_get()
    for o in bpy.context.scene.objects:
        if o.type == 'MESH':
            me = o.evaluated_get(dg).to_mesh(); me.calc_loop_triangles(); tris += len(me.loop_triangles); o.evaluated_get(dg).to_mesh_clear()
    print('EXPORT', path, tris)

# ---------------------------------------------------------------- reception desk
def desk():
    reset(); MATS.clear()
    mint, mintD = mat('mint', '#9DCBB4', 0.75), mat('mintD', '#88B9A1', 0.75)
    wood, woodD = mat('wood', '#E6B37A', 0.55), mat('woodD', '#D59E62', 0.55)
    grey, scr, gold, blk = mat('grey', '#5E636B', 0.5), mat('screen', '#3A3E45', 0.35), mat('gold', '#E8B93E', 0.3, 0.35), mat('black', '#2C2F35', 0.5)
    C = (0, 0.8); a0, a1 = math.radians(-90 - 72), math.radians(-90 + 72)
    sector('base', 0.80, 1.12, a0, a1, 0.10, 0.95, mint, center=C)
    sector('band', 0.78, 1.16, a0 - 0.02, a1 + 0.02, 0.0, 0.11, woodD, center=C, bevel=0.025)
    sector('top', 0.72, 1.24, a0, a1, 0.95, 1.03, wood, center=C, bevel=0.02)
    for a in (a0, a1):  # rounded kidney ends
        r = (1.24 + 0.72) / 2; cyl('cap', 0.26, 0.26, 0.08, (C[0] + r * math.cos(a), C[1] + r * math.sin(a), 0.99), wood, seg=32, bevel=0.02)
        cyl('capB', 0.17, 0.17, 0.85, (C[0] + 0.96 * math.cos(a), C[1] + 0.96 * math.sin(a), 0.525), mint, seg=24)
        cyl('capW', 0.19, 0.19, 0.11, (C[0] + 0.97 * math.cos(a), C[1] + 0.97 * math.sin(a), 0.055), woodD, seg=24, bevel=0.015)
    for i in range(1, 5):  # panel grooves
        a = a0 + (a1 - a0) * i / 5
        box('groove', (0.025, 0.02, 0.8), (C[0] + 1.125 * math.cos(a), C[1] + 1.125 * math.sin(a), 0.53), mintD, bevel=0.006, rot=(0, 0, a + math.pi / 2))
    # monitor (facing the receptionist, i.e. +Y)
    ma = math.radians(-118); mx, my = C[0] + 0.98 * math.cos(ma), C[1] + 0.98 * math.sin(ma)
    box('mbase', (0.28, 0.18, 0.025), (mx, my + 0.05, 1.045), grey, 0.01)
    box('mneck', (0.06, 0.04, 0.2), (mx, my + 0.05, 1.15), grey, 0.01)
    box('mon', (0.56, 0.05, 0.36), (mx, my + 0.02, 1.38), grey, 0.02, rot=(math.radians(-6), 0, 0))
    box('scr', (0.5, 0.01, 0.3), (mx, my + 0.05, 1.38), scr, 0.005, rot=(math.radians(-6), 0, 0))
    # service bell
    ba = math.radians(-62); bx, by = C[0] + 1.0 * math.cos(ba), C[1] + 1.0 * math.sin(ba)
    cyl('bellB', 0.1, 0.1, 0.035, (bx, by, 1.05), blk, seg=24, bevel=0.01)
    s = sphere('bell', 0.085, (bx, by, 1.07), gold, scale=(1, 1, 0.85), sub=3)
    cyl('bellK', 0.012, 0.012, 0.04, (bx, by, 1.16), gold, seg=8); sphere('bellT', 0.018, (bx, by, 1.185), gold, sub=1)
    # chair behind, off to the side so the receptionist has room
    cx, cy = 0.42, 0.95
    cyl('cbase', 0.24, 0.24, 0.04, (cx, cy, 0.04), grey, seg=20, bevel=0.01)
    cyl('cpost', 0.03, 0.03, 0.42, (cx, cy, 0.27), grey, seg=12)
    box('cseat', (0.5, 0.48, 0.1), (cx, cy, 0.52), mint, 0.045)
    box('cback', (0.48, 0.12, 0.55), (cx, cy + 0.24, 0.88), mint, 0.06)
    export(OUT + '/desk.glb')

# ---------------------------------------------------------------- London plane tree
def leaf_mesh(bm, M, size, col=None):
    n = 25; pts = []
    for i in range(n):
        t = i / n * 2 * math.pi
        lob = 0.48 + 0.52 * abs(math.cos(2.5 * (t - math.pi / 2))) ** 1.3   # 5 pointed lobes, top lobe up
        notch = 1  # small stem notch
        r = size * lob * notch; pts.append((r * math.cos(t), r * math.sin(t)))
    c = bm.verts.new(M @ Vector((0, 0, size * 0.12)))
    ring = [bm.verts.new(M @ Vector((x, y, -0.25 * (x * x + y * y) / size))) for x, y in pts]
    fs = []
    for i in range(n):
        fs.append(bm.faces.new((c, ring[i], ring[(i + 1) % n])))
    if col is not None:
        lay = bm.loops.layers.color.get('Col') or bm.loops.layers.color.new('Col')
        hi, lo = col
        for f in fs:
            for l in f.loops:
                if l.vert is c: l[lay] = (*lo, 1)
                else:
                    x, y, _ = (M.inverted() @ l.vert.co); k = min(1, (x * x + y * y) ** 0.5 / size)
                    t = 0.35 + 0.65 * k * (0.75 + 0.25 * max(0, y / size))
                    l[lay] = tuple(lo[j] + (hi[j] - lo[j]) * t for j in range(3)) + (1,)
    return fs

def tree():
    reset(); MATS.clear()
    bark = mat('bark', '#DCCB9C', 0.85); p1, p2, p3 = mat('p1', '#8E6B48', 0.85), mat('p2', '#9DA56E', 0.85), mat('p3', '#BC9364', 0.85)
    L1, L2, L3 = mat('leafL', '#B2D663', 0.7), mat('leafM', '#8CC24E', 0.7), mat('leafD', '#5F9C40', 0.8)
    for m in (L1, L2, L3): m.use_backface_culling = False
    # sturdy trunk, flared foot, limbs that reach into each leaf cluster (visible through the gaps)
    cyl('trunk', 0.40, 0.29, 1.3, (0, 0, 0.65), bark, seg=24)
    cyl('foot', 0.52, 0.40, 0.26, (0, 0, 0.13), bark, seg=24)
    clusters = [((-1.6, 0.15, 2.4), 0.8), ((1.6, -0.1, 2.45), 0.8), ((0.15, 1.45, 2.45), 0.78), ((-0.1, -1.45, 2.5), 0.78),
                ((-0.7, 0.4, 3.05), 0.8), ((0.75, -0.35, 3.1), 0.8), ((0.0, 0.0, 3.4), 0.7), ((-1.15, -1.0, 2.75), 0.65), ((1.15, 1.0, 2.75), 0.65),
                ((-1.1, 1.05, 2.8), 0.6), ((1.1, -1.05, 2.8), 0.6)]
    def limb(a, b, r0, r1):
        d = b - a; o = cyl('limb', r0, r1, d.length, (a + b) / 2, bark, seg=14); o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    for (p, r) in clusters:
        P = Vector(p); fork = Vector((P.x * 0.35, P.y * 0.35, 1.75))
        limb(Vector((0, 0, 1.2)), fork, 0.2, 0.14); limb(fork, P * 0.85 + Vector((0, 0, 0.1)), 0.14, 0.06)
    for i in range(30):  # camouflage bark: flat, smooth patches pressed into the trunk
        z = 0.12 + random.random() * 1.15; ang = random.random() * 6.283; r = (0.40 - 0.1 * z / 1.3 + (0.1 if z < 0.26 else 0)) * 0.93
        o = sphere('patch', 0.11 + random.random() * 0.08, (r * math.cos(ang), r * math.sin(ang), z), random.choice([p1, p2, p3, p1]), sub=2)
        o.rotation_euler = (0, 0, ang); o.scale = (0.28, 1, 1.25)
    # leaf clusters: an outer shell of big light leaves over an inner shell of darker ones (no solid core: gaps show branches)
    bm = bmesh.new()
    for (p, r) in clusters:
        sphere('core', r * 0.42, p, L3, sub=2)
        for shell, k_n in ((1.0, 9), (0.68, 4)):
            for k in range(int(k_n * r * r * 2) + 4):
                v = Vector((random.gauss(0, 1), random.gauss(0, 1), random.gauss(0, 1) + 0.45)).normalized()
                pos = Vector(p) + Vector((v.x, v.y, v.z * 0.8)) * r * shell * (0.9 + random.random() * 0.15)
                if any((pos - Vector(q)).length < rr * 0.7 for (q, rr) in clusters if q is not p): continue
                n = (v * 0.8 + Vector((0, 0, 1.3))).normalized()
                M = Matrix.Translation(pos) @ n.to_track_quat('Z', 'Y').to_matrix().to_4x4() @ Matrix.Rotation(random.random() * 6.283, 4, 'Z') @ Matrix.Rotation((random.random() - 0.5) * 0.5, 4, 'X')
                hl = lin3(random.choice(['#B3D25A', '#A3C951', '#95BF48']) if shell == 1.0 else random.choice(['#7DB043', '#70A63D']))
                lo = lin3('#689D38' if shell == 1.0 else '#4A8030')
                for f in leaf_mesh(bm, M, (0.44 + random.random() * 0.12) * (1 if shell == 1.0 else 0.85), (hl, lo)): f.material_index = 0; f.smooth = True
    me_o = from_bm(bm, 'leaves')
    ca = me_o.data.color_attributes
    for a in list(ca):
        if a.name != 'Col': ca.remove(a)
    ca.active_color = ca['Col']; ca.render_color_index = ca.active_color_index = 0
    LW = mat('leafV', '#FFFFFF', 0.7); LW.use_backface_culling = False; me_o.data.materials.append(LW)
    export(OUT + '/tree.glb')

# ---------------------------------------------------------------- toilet cubicle (open front so the loo reads from the iso camera)
def cubicle():
    reset(); MATS.clear()
    lav, lavD = mat('lav', '#CDB3E0', 0.7), mat('lavD', '#B89BCE', 0.7)
    metal, white, whiteD = mat('metal', '#B9BEC6', 0.35, 0.6), mat('white', '#F6F4F0', 0.3), mat('whiteD', '#E4E1DB', 0.35)
    W, D, H, L = 1.2, 1.1, 1.45, 0.16
    SD, SH = 0.8, 1.2  # side panels: shallower and lower than the back wall
    box('back', (W, 0.06, H), (0, D / 2, L + H / 2), lav, 0.025)
    box('left', (0.06, SD, SH), (-W / 2, D / 2 - SD / 2, L + SH / 2), lav, 0.025)
    box('right', (0.06, SD, SH), (W / 2, D / 2 - SD / 2, L + SH / 2), lav, 0.025)
    fy = D / 2 - SD
    for x in (-W / 2, W / 2):  # rounded front posts + feet
        cyl('post', 0.045, 0.045, SH + 0.02, (x, fy, L + SH / 2), lavD, seg=16, bevel=0.01)
        for y in (fy, D / 2 - 0.05): cyl('leg', 0.035, 0.035, L, (x, y, L / 2), metal, seg=12)
    for z in (0.35, 1.0): box('hinge', (0.04, 0.05, 0.12), (-W / 2 + 0.05, fy + 0.02, L + z), metal, 0.008)
    # toilet: tank, bowl, seat, lid — seat centred on the origin
    box('tank', (0.44, 0.2, 0.36), (0, 0.38, 0.62), white, 0.05)
    box('tankLid', (0.48, 0.23, 0.05), (0, 0.38, 0.82), whiteD, 0.02)
    cyl('pedestal', 0.15, 0.13, 0.32, (0, 0.12, 0.27), white, seg=24)
    o = cyl('bowl', 0.22, 0.17, 0.2, (0, 0.05, 0.42), white, seg=28); o.scale = (1, 1.25, 1)
    o = cyl('seat', 0.23, 0.23, 0.05, (0, 0.04, 0.545), whiteD, seg=28, bevel=0.015); o.scale = (1, 1.28, 1)
    o = cyl('lid', 0.22, 0.22, 0.04, (0, 0.05, 0.59), white, seg=28, bevel=0.015); o.scale = (1, 1.25, 1)
    # little sink on the right wall
    box('basin', (0.24, 0.34, 0.12), (W / 2 - 0.16, 0.05, 0.92), white, 0.04)
    box('bowlIn', (0.18, 0.26, 0.04), (W / 2 - 0.16, 0.05, 0.97), whiteD, 0.015)
    cyl('tap', 0.015, 0.015, 0.16, (W / 2 - 0.08, 0.05, 1.06), metal, seg=10)
    cyl('spout', 0.013, 0.013, 0.1, (W / 2 - 0.12, 0.05, 1.13), metal, seg=10, rot=(0, math.pi / 2, 0))
    cyl('pipe', 0.025, 0.025, 0.4, (W / 2 - 0.16, 0.05, 0.66), metal, seg=10)
    export(OUT + '/toilet.glb')

which = sys.argv[sys.argv.index('--') + 2] if '--' in sys.argv and len(sys.argv) > sys.argv.index('--') + 2 else 'all'
if which in ('all', 'desk'): desk()
if which in ('all', 'tree'): tree()
if which in ('all', 'toilet'): cubicle()

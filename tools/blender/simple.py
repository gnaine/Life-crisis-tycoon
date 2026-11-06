# Blender 5.2: the "simple pieces" from sheets A/B — plants (s/m/l), side table, planter, bus stop, kitchenette, radiator, air-con.
import sys, math, random
OUT = sys.argv[sys.argv.index('--') + 1]; WHICH = sys.argv[sys.argv.index('--') + 2]
sys.argv = ['x', '--', OUT, 'none']
exec(open('./make3.py').read())  # helpers: reset, mat, box, cyl, sphere, sector, leaf_mesh, lin3, from_bm, export
import bmesh
from mathutils import Vector, Matrix
random.seed(11)

def vcol_mesh(bm, name, m):
    o = from_bm(bm, name); ca = o.data.color_attributes
    for a in list(ca):
        if a.name != 'Col': ca.remove(a)
    if 'Col' in ca: ca.active_color = ca['Col']; ca.render_color_index = ca.active_color_index = 0
    o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    return o

def colour(bm, faces, fn):
    lay = bm.loops.layers.color.get('Col') or bm.loops.layers.color.new('Col')
    for f in faces:
        for l in f.loops: l[lay] = (*fn(l.vert), 1)

def pot(r_top, r_bot, h, m, rim=True, soil=True):
    cyl('pot', r_bot, r_top, h, (0, 0, h / 2), m, seg=32, bevel=0.012)
    if rim: cyl('rim', r_top + 0.025, r_top + 0.025, h * 0.16, (0, 0, h - h * 0.08), m, seg=32, bevel=0.015)
    if soil: cyl('soil', r_top - 0.01, r_top - 0.01, 0.02, (0, 0, h - 0.035), mat('soil', '#6B4A33', 0.95), seg=32)

def disc_leaf(bm, M, size, hi, lo, n=14, notch=0.0):
    c = bm.verts.new(M @ Vector((0, 0, size * 0.08)))
    ring = []
    for i in range(n):
        t = i / n * 2 * math.pi
        rr = size * (1 - notch * (abs(math.sin(t * 4)) > 0.9))
        ring.append(bm.verts.new(M @ Vector((rr * math.cos(t), rr * math.sin(t) * 0.92, -0.15 * size))))
    fs = [bm.faces.new((c, ring[i], ring[(i + 1) % n])) for i in range(n)]
    colour(bm, fs, lambda v: lo if v is c else hi); return fs

def stem(a, b, r, m):
    d = b - a; o = cyl('stem', r, r * 0.8, d.length, (a + b) / 2, m, seg=6); o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler(); return o

# ---------------------------------------------------------------- plants
def plant_s():  # pilea in a terracotta pot
    reset(); MATS.clear(); terr = mat('terra', '#D9875A', 0.7); st = mat('stem', '#6FA046', 0.7)
    pot(0.17, 0.12, 0.26, terr)
    LV = mat('leafV', '#FFFFFF', 0.7); LV.use_backface_culling = False
    bm = bmesh.new()
    for i in range(40):
        a = random.random() * 6.283; el = 0.45 + random.random() * 1.0; L = 0.12 + random.random() * 0.12
        base = Vector((0, 0, 0.24)); tip = base + Vector((math.cos(a) * math.cos(el) * L, math.sin(a) * math.cos(el) * L, math.sin(el) * L + 0.05))
        stem(base, tip, 0.008, st)
        n = (tip - base).normalized() + Vector((0, 0, 0.9))
        M = Matrix.Translation(tip) @ n.normalized().to_track_quat('Z', 'Y').to_matrix().to_4x4()
        disc_leaf(bm, M, 0.075 + random.random() * 0.025, lin3(random.choice(['#9CCB5A', '#8DC24F', '#A6D262'])), lin3('#5E9A3C'))
    vcol_mesh(bm, 'leaves', LV); export(OUT + '/plant_s.glb')

def blade(bm, base, ang, tilt, length, width, edge, mid):
    # a sword leaf: 3 columns (edge, centre, edge) × rows, slightly cupped, tapering to a point
    rows = 8; cols = []
    d = Vector((math.cos(ang) * math.sin(tilt), math.sin(ang) * math.sin(tilt), math.cos(tilt)))
    side = Vector((-math.sin(ang), math.cos(ang), 0))
    for r in range(rows + 1):
        t = r / rows; w = width * (math.sin(math.pi * min(1, t * 1.15)) ** 0.6 if t < 0.98 else 0.0) * (1 - t * 0.3)
        p = base + d * length * t + Vector((math.cos(ang), math.sin(ang), 0)) * (0.05 * t * t)
        cols.append([bm.verts.new(p - side * w), bm.verts.new(p + Vector((math.cos(ang), math.sin(ang), 0)) * 0.006), bm.verts.new(p + side * w)])
    fs = []
    for r in range(rows):
        for k in range(2): fs.append(bm.faces.new((cols[r][k], cols[r][k + 1], cols[r + 1][k + 1], cols[r + 1][k])))
    centre = set(c[1] for c in cols)
    colour(bm, fs, lambda v: mid if v in centre else edge)

def plant_m():  # snake plant in a cream pot
    reset(); MATS.clear(); cream = mat('cream', '#F1E6D2', 0.6)
    cyl('pot', 0.13, 0.17, 0.32, (0, 0, 0.16), cream, seg=32, bevel=0.03)
    cyl('soil', 0.16, 0.16, 0.02, (0, 0, 0.3), mat('soil', '#6B4A33', 0.95), seg=32)
    LV = mat('leafV', '#FFFFFF', 0.65); LV.use_backface_culling = False
    bm = bmesh.new()
    for i in range(8):
        a = i / 8 * 6.283 + random.random() * 0.4; r = 0.04 + random.random() * 0.06
        blade(bm, Vector((math.cos(a) * r, math.sin(a) * r, 0.3)), a, 0.08 + random.random() * 0.22, 0.45 + random.random() * 0.3, 0.05 + random.random() * 0.015, lin3('#D8C452'), lin3(random.choice(['#4F8A3A', '#5C9440'])))
    vcol_mesh(bm, 'leaves', LV); export(OUT + '/plant_m.glb')

def monstera_leaf(bm, M, size, hi, lo):
    # heart-shaped blade along local +X (stem at 0); slits run from the edge in toward the midrib
    L = size * 2.2; N = 44; slits = (0.22, 0.36, 0.5, 0.63, 0.76)
    mids, left, right = [], [], []
    for i in range(N + 1):
        u = i / N; x = L * u
        w = L * 0.5 * (math.sin(math.pi * min(1, u * 1.02)) ** 0.55) * (1 - 0.25 * u)
        if u < 0.08: w *= 0.75 + u * 3  # rounded heart base
        dip = min([abs(u - c) for c in slits]); k = 0.3 if dip < 0.018 else 1.0
        z = -0.18 * (w / L) * L * 0.4 + 0.08 * L * math.sin(math.pi * u)  # gentle arch
        mids.append(bm.verts.new(M @ Vector((x, 0, z + 0.01))))
        left.append(bm.verts.new(M @ Vector((x, w * k, z - 0.05 * w))))
        right.append(bm.verts.new(M @ Vector((x, -w * k, z - 0.05 * w))))
    fs = []
    for i in range(N):
        fs.append(bm.faces.new((mids[i], mids[i + 1], left[i + 1], left[i])))
        fs.append(bm.faces.new((mids[i], right[i], right[i + 1], mids[i + 1])))
    mid = set(mids); colour(bm, fs, lambda v: lo if v in mid else hi)

def plant_l():  # monstera in a terracotta pot
    reset(); MATS.clear(); terr = mat('terra', '#D9875A', 0.7); st = mat('stem', '#5E9440', 0.7)
    pot(0.2, 0.15, 0.3, terr)
    LV = mat('leafV', '#FFFFFF', 0.65); LV.use_backface_culling = False
    bm = bmesh.new()
    for i in range(8):
        a = i / 8 * 6.283 + random.random() * 0.5; el = 0.9 + random.random() * 0.5; L = 0.4 + random.random() * 0.3
        base = Vector((0, 0, 0.28)); tip = base + Vector((math.cos(a) * math.cos(el) * L, math.sin(a) * math.cos(el) * L, math.sin(el) * L))
        stem(base, tip, 0.012, st)
        out = Vector((math.cos(a), math.sin(a), 0))
        z = (out * 0.55 + Vector((0, 0, 1))).normalized(); x = (out - z * out.dot(z)).normalized(); y = z.cross(x)
        R = Matrix((x, y, z)).transposed().to_4x4(); M = Matrix.Translation(tip) @ R
        monstera_leaf(bm, M, 0.16 + random.random() * 0.03, lin3(random.choice(['#5DAA55', '#68B35C'])), lin3('#3A7C3C'))
    vcol_mesh(bm, 'leaves', LV); export(OUT + '/plant_l.glb')

# ---------------------------------------------------------------- side table with tissue box
def sidetable():
    reset(); MATS.clear(); wood = mat('wood', '#E2AE74', 0.55); lav = mat('lav', '#C9B2E2', 0.6); white = mat('white', '#FAF8F4', 0.7)
    cyl('top', 0.3, 0.3, 0.06, (0, 0, 0.5), wood, seg=36, bevel=0.02)
    for i in range(3):
        a = i / 3 * 6.283 + 0.5; o = cyl('leg', 0.03, 0.04, 0.5, (math.cos(a) * 0.15, math.sin(a) * 0.15, 0.24), wood, seg=12)
        o.rotation_euler = (math.sin(a) * -0.2, math.cos(a) * 0.2, 0)
    box('tissue', (0.24, 0.24, 0.17), (0, 0, 0.615), lav, 0.035)
    s = sphere('puff', 0.07, (0, 0, 0.72), white, sub=2); s.scale = (1.1, 0.7, 0.9)
    export(OUT + '/sidetable.glb')

# ---------------------------------------------------------------- planter with hydrangeas, lavender, daisies
def planter():
    reset(); MATS.clear(); stone, stoneD = mat('stone', '#E3D3BA', 0.85), mat('stoneD', '#D4C2A6', 0.85)
    box('trough', (1.0, 0.36, 0.34), (0, 0, 0.23), stone, 0.035); box('lip', (1.06, 0.42, 0.05), (0, 0, 0.41), stone, 0.02)
    box('panel', (0.8, 0.02, 0.2), (0, -0.185, 0.23), stoneD, 0.01)
    for x in (-0.42, 0.42): box('foot', (0.14, 0.38, 0.06), (x, 0, 0.03), stoneD, 0.015)
    box('soil', (0.94, 0.3, 0.02), (0, 0, 0.42), mat('soil', '#6B4A33', 0.95), 0.005)
    green, pink, pinkD, lavC, wht, yel = mat('green', '#7DB54B', 0.7), mat('pink', '#F2A2BE', 0.6), mat('pinkD', '#E486A6', 0.6), mat('lavender', '#9C86D6', 0.6), mat('daisy', '#FBF8F0', 0.6), mat('yellow', '#F2C94C', 0.5)
    LV = mat('leafV', '#FFFFFF', 0.7); LV.use_backface_culling = False; bm = bmesh.new()
    def leaf_at(pos, n, size):
        M = Matrix.Translation(pos) @ n.normalized().to_track_quat('Z', 'Y').to_matrix().to_4x4() @ Matrix.Rotation(random.random() * 6.283, 4, 'Z')
        disc_leaf(bm, M, size, lin3(random.choice(['#93C65A', '#86BD50', '#9DCC62'])), lin3('#5A9439'), n=10)
    for i in range(70):  # foliage mound along the trough
        x = -0.46 + random.random() * 0.92; y = -0.13 + random.random() * 0.26; h = 0.44 + random.random() * 0.14 * (1 - abs(x) * 0.8)
        leaf_at(Vector((x, y, h)), Vector((random.gauss(0, 0.5), random.gauss(0, 0.5) - 0.2, 1)), 0.055 + random.random() * 0.02)
    for x in (-0.42, -0.15, 0.12, 0.38):  # ivy trailing over the front lip
        for k in range(4): leaf_at(Vector((x + k * 0.025, -0.215, 0.41 - k * 0.065)), Vector((0, -1, 0.3)), 0.045)
    vcol_mesh(bm, 'foliage', LV)
    for (x, y) in ((-0.28, -0.03), (0.0, 0.05), (0.2, -0.05)):  # hydrangea heads: clusters of florets
        sphere('head', 0.09, (x, y, 0.62), pinkD, sub=2)
        for k in range(11):
            v = Vector((random.gauss(0, 1), random.gauss(0, 1), abs(random.gauss(0, 1)) + 0.2)).normalized() * 0.1
            sphere('flo', 0.04, (x + v.x, y + v.y, 0.62 + v.z), random.choice([pink, pink, pinkD]), sub=2)
    for (x, y) in ((0.36, 0.06), (0.42, -0.04), (0.3, -0.02), (-0.42, 0.06)):  # lavender spikes
        h0 = 0.5 + random.random() * 0.08
        stem(Vector((x, y, 0.42)), Vector((x, y, h0 + 0.15)), 0.006, green)
        for k in range(7): sphere('lv', 0.026 - k * 0.002, (x, y, h0 + k * 0.03), lavC, sub=1)
    for (x, y) in ((0.12, -0.14), (-0.1, -0.15), (0.3, -0.15)):  # daisies on the front edge
        for k in range(8):
            a = k / 8 * 6.283; s = sphere('pet', 0.025, (x + math.cos(a) * 0.03, y - 0.0, 0.52 + math.sin(a) * 0.03), wht, sub=1); s.scale = (1, 0.4, 1)
        sphere('ctr', 0.018, (x, y - 0.01, 0.52), yel, sub=1)
    export(OUT + '/planter.glb')

# ---------------------------------------------------------------- bus stop
def busstop():
    reset(); MATS.clear(); fr = mat('frame', '#4C7774', 0.45, 0.2); glass = mat('glass', '#CFE9F2', 0.1)
    glass.diffuse_color = (0.8, 0.9, 0.95, 0.35); b = glass.node_tree.nodes['Principled BSDF']; b.inputs['Alpha'].default_value = 0.35
    try: glass.surface_render_method = 'BLENDED'
    except Exception: pass
    W, D, H = 2.4, 1.1, 2.3
    for x in (-W / 2, W / 2):
        for y in (-D / 2 + 0.05, D / 2):
            cyl('post', 0.045, 0.045, H, (x, y, H / 2), fr, seg=14)
            cyl('foot', 0.08, 0.08, 0.05, (x, y, 0.025), fr, seg=14)
    # curved roof: a shallow arc in the YZ plane, extruded along X
    o = sector('roof', 0.95, 1.0, math.radians(55), math.radians(125), -W / 2 - 0.08, W / 2 + 0.08, glass, n=16, center=(0, H - 0.82), bevel=0)
    o.rotation_euler = (0, math.radians(90), 0); o.location = (0, 0, 0)
    # (sector builds around Z; rotate the arc so it spans Y and bulges up)
    o.rotation_euler = (math.radians(90), 0, math.radians(90)); o.location = (0, 0, 0)
    for x in (-W / 2, 0, W / 2): sector('rib', 0.94, 1.01, math.radians(55), math.radians(125), x - 0.03, x + 0.03, fr, n=16, center=(0, H - 0.82), bevel=0).rotation_euler = (math.radians(90), 0, math.radians(90))
    box('beam', (W + 0.1, 0.07, 0.07), (0, D / 2, H), fr, 0.01); box('beamF', (W + 0.1, 0.07, 0.07), (0, -D / 2 + 0.05, H), fr, 0.01)
    box('back', (W, 0.03, 1.6), (0, D / 2, 1.1), glass, 0.0)
    box('side', (0.03, D - 0.1, 1.6), (-W / 2, 0.02, 1.1), glass, 0.0)
    box('ad', (0.05, D - 0.15, 1.4), (W / 2, 0.02, 1.05), mat('ad', '#F4E7CF', 0.6), 0.02)
    box('adF', (0.07, D - 0.08, 1.48), (W / 2, 0.02, 1.05), fr, 0.015)
    box('bench', (1.4, 0.32, 0.05), (-0.2, D / 2 - 0.25, 0.48), mat('wood', '#D99A5B', 0.55), 0.015)
    for x in (-0.8, 0.4): box('bleg', (0.05, 0.25, 0.46), (x, D / 2 - 0.25, 0.23), fr, 0.01)
    export(OUT + '/busstop.glb')

# ---------------------------------------------------------------- kitchenette
def kitchenette():
    reset(); MATS.clear(); cream, wood, mint = mat('cream', '#F2E8D5', 0.6), mat('wood', '#E2AE74', 0.5), mat('mint', '#B8D4A8', 0.6)
    white, steel, dark = mat('white', '#FAF8F4', 0.4), mat('steel', '#C3C8CF', 0.3, 0.6), mat('dark', '#3A3F47', 0.5)
    box('body', (1.5, 0.58, 0.82), (0, 0, 0.45), cream, 0.03); box('plinth', (1.44, 0.52, 0.06), (0, 0.02, 0.03), wood, 0.01)
    box('top', (1.58, 0.64, 0.06), (0, 0, 0.89), wood, 0.02); box('splash', (1.58, 0.05, 0.22), (0, 0.3, 1.02), wood, 0.02)
    box('fridge', (0.56, 0.03, 0.66), (-0.42, -0.3, 0.46), white, 0.03); box('fh', (0.03, 0.02, 0.16), (-0.2, -0.33, 0.6), steel, 0.008)
    for x in (0.12, 0.46): box('door', (0.32, 0.03, 0.66), (x, -0.3, 0.46), mint, 0.025); box('h', (0.025, 0.02, 0.14), (x + (0.1 if x < 0.3 else -0.1), -0.33, 0.6), steel, 0.008)
    box('sink', (0.46, 0.34, 0.04), (-0.1, 0, 0.91), steel, 0.02); box('basin', (0.38, 0.26, 0.03), (-0.1, 0, 0.925), mat('steelD', '#9EA5AE', 0.3, 0.6), 0.01)
    cyl('tap', 0.015, 0.015, 0.22, (-0.1, 0.2, 1.03), steel, seg=10); o = cyl('spout', 0.013, 0.013, 0.14, (-0.1, 0.13, 1.14), steel, seg=10); o.rotation_euler = (math.radians(90), 0, 0)
    for x in (-0.16, -0.04): cyl('knob', 0.02, 0.02, 0.03, (x, 0.2, 0.94), steel, seg=8)
    cyl('kettle', 0.08, 0.1, 0.2, (0.5, 0.05, 1.02), white, seg=20, bevel=0.02); cyl('klid', 0.05, 0.05, 0.02, (0.5, 0.05, 1.13), white, seg=16)
    o = sector('khandle', 0.07, 0.095, math.radians(-80), math.radians(80), -0.012, 0.012, dark, n=10, center=(0, 0), bevel=0); o.rotation_euler = (math.radians(90), 0, 0); o.location = (0.52, 0.05, 1.03)
    cyl('kbase', 0.1, 0.1, 0.02, (0.5, 0.05, 0.93), dark, seg=20)
    export(OUT + '/kitchenette.glb')

# ---------------------------------------------------------------- radiator
def radiator():
    reset(); MATS.clear(); cream, steel = mat('cream', '#F1E8D4', 0.45), mat('steel', '#B9BEC6', 0.3, 0.6)
    n = 8
    for i in range(n):
        x = (i - (n - 1) / 2) * 0.13
        cyl('col', 0.05, 0.05, 0.62, (x, 0, 0.5), cream, seg=14); sphere('ct', 0.05, (x, 0, 0.81), cream, sub=2); sphere('cb', 0.05, (x, 0, 0.19), cream, sub=2)
        cyl('col2', 0.04, 0.04, 0.62, (x, 0.07, 0.5), cream, seg=12)
    for z in (0.22, 0.78): o = cyl('hub', 0.035, 0.035, n * 0.13, (0, 0.035, z), cream, seg=12); o.rotation_euler = (0, math.radians(90), 0)
    for x in (-(n / 2) * 0.13, (n / 2) * 0.13 - 0.04):
        cyl('foot', 0.04, 0.05, 0.14, (x, 0.03, 0.07), steel, seg=12)
    cyl('valve', 0.035, 0.035, 0.08, (-(n / 2) * 0.13 - 0.06, 0.03, 0.22), steel, seg=12).rotation_euler = (0, math.radians(90), 0)
    cyl('knob', 0.045, 0.045, 0.05, (-(n / 2) * 0.13 - 0.11, 0.03, 0.22), steel, seg=12).rotation_euler = (0, math.radians(90), 0)
    export(OUT + '/radiator.glb')

# ---------------------------------------------------------------- portable air-con
def aircon():
    reset(); MATS.clear(); cream, grey, dark = mat('cream', '#F2ECE2', 0.5), mat('grey', '#C9CDD3', 0.5), mat('dark', '#4A4F57', 0.5)
    box('body', (0.48, 0.38, 0.92), (0, 0, 0.53), cream, 0.07)
    box('grill', (0.36, 0.02, 0.2), (0, -0.19, 0.82), grey, 0.02)
    for k in range(5): box('slat', (0.34, 0.03, 0.018), (0, -0.2, 0.74 + k * 0.04), dark, 0.006, rot=(math.radians(-20), 0, 0))
    box('panel', (0.3, 0.12, 0.012), (0, -0.05, 0.995), grey, 0.005)
    for x in (-0.06, 0.02, 0.09): cyl('btn', 0.012, 0.012, 0.01, (x, -0.05, 1.003), dark, seg=8)
    box('handle', (0.02, 0.14, 0.05), (0.245, 0, 0.82), grey, 0.008)
    for x in (-0.17, 0.17):
        for y in (-0.13, 0.13): sphere('wheel', 0.035, (x, y, 0.035), dark, sub=1)
    export(OUT + '/aircon.glb')

FN = {'plant_s': plant_s, 'plant_m': plant_m, 'plant_l': plant_l, 'sidetable': sidetable, 'planter': planter, 'busstop': busstop, 'kitchenette': kitchenette, 'radiator': radiator, 'aircon': aircon}
for k in (FN if WHICH == 'all' else WHICH.split(',')): FN[k]()

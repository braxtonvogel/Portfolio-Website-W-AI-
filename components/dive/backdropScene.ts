/**
 * Geometry for the Three.js backdrop behind the dive world: a sunken city of
 * solid, dark structures that are revealed by a noise dissolve (see
 * backdropRenderer.ts for the shader).
 *
 * The layout is the one signed off on in the markup - far skyline, bridge
 * truss, two mid scaffold towers, two high-detail edge facades - authored in
 * normalized screen space (x 0..1 across, y 0..1 down) and mapped onto each
 * structure's depth plane, then extruded into real boxes so the mouse
 * parallax and the lighting read as 3D. Every structure stands on the same
 * ground plane as the CSS floor grid.
 *
 * Pure data, no three.js import: the renderer wraps the typed arrays.
 */

export const FOV = 50;
const TAN_HALF = Math.tan((FOV / 2) * (Math.PI / 180));

/** Camera-space distance for a structure's normalized depth (0 near .. 1 far). */
export function depthDist(depth: number) {
  return 60 + depth * 120;
}
export const MOTE_DEPTH = 110;

export function halfHeightAt(dist: number) {
  return dist * TAN_HALF;
}

/** Height of the camera above the shared ground plane every structure stands on. */
const CAM_HEIGHT = 17.9;
function groundLineAt(dist: number) {
  return 0.5 + CAM_HEIGHT / (2 * halfHeightAt(dist));
}

// the markup's clock had ~0.5s of "void" before anything began - the site
// already spends that beat on the loading screen, so pull every start earlier
const T_OFF = -0.5;
// every grounded structure continues this far below the ground line (world
// units), so its base is always off the bottom of the frame - even after the
// camera has sunk the full descent - and nothing ever reads as floating
const GROUND_EXT = 70;
const TAU = Math.PI * 2;

function mulberry(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash2(ix: number, iy: number) {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

type RGB = [number, number, number];
function hex(h: string): RGB {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
const scale = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k];

// sunken concrete and steel - everything dark and desaturated; the dissolve
// rim and the lit windows are the only bright things
const C_CONCRETE = hex("#0d242c");
const C_CONCRETE_NEAR = hex("#0f2830");
const C_STEEL = hex("#0b2028");
const C_SLAB = hex("#16343d");
const C_MULLION = hex("#122d35");
const C_GLASS = hex("#071a21");
const C_GLASS_LIT = hex("#3a7d88");
const C_WINDOW_LIT = hex("#2e6873");
const C_LOBBY_LIT = hex("#56a0ab");

type Box = {
  x1: number;
  x2: number;
  top: number;
  bot: number;
  fh: number;
  mu: number;
  lobby?: boolean;
};

export type SceneData = {
  mesh: {
    position: Float32Array;
    normal: Float32Array;
    color: Float32Array;
    rel: Float32Array;
    timing: Float32Array;
    emissive: Float32Array;
    // Uint16 when every index fits (the city mesh always does - see the
    // buildScene() emission below); halves the index buffer's GPU memory
    // and fetch bandwidth. three.js reads the typed array's own type to
    // pick gl.UNSIGNED_SHORT vs gl.UNSIGNED_INT, so nothing downstream needs to change.
    index: Uint16Array | Uint32Array;
  };
  lights: { position: Float32Array; timing: Float32Array; phase: Float32Array };
  motes: { norm: Float32Array; a: Float32Array; b: Float32Array };
};

type V3 = [number, number, number];

class MeshEmitter {
  pos: number[] = [];
  nrm: number[] = [];
  col: number[] = [];
  rel: number[] = [];
  tim: number[] = [];
  emi: number[] = [];
  idx: number[] = [];
  n = 0;
  // per-structure context
  timing: [number, number] = [0, 1];
  yBottom = 0;
  yTop = 1;

  /** One quad; winding is fixed up so the face is front-facing along `normal`. */
  face(c: [V3, V3, V3, V3], normal: V3, color: RGB, emissive = 0) {
    const [a, b, c2] = c;
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const e2 = [c2[0] - a[0], c2[1] - a[1], c2[2] - a[2]];
    const cx = e1[1] * e2[2] - e1[2] * e2[1],
      cy = e1[2] * e2[0] - e1[0] * e2[2],
      cz = e1[0] * e2[1] - e1[1] * e2[0];
    const order = cx * normal[0] + cy * normal[1] + cz * normal[2] >= 0 ? [0, 1, 2, 3] : [3, 2, 1, 0];
    const base = this.n;
    const span = this.yTop - this.yBottom || 1;
    for (const i of order) {
      const p = c[i];
      this.pos.push(p[0], p[1], p[2]);
      this.nrm.push(normal[0], normal[1], normal[2]);
      this.col.push(color[0], color[1], color[2]);
      this.rel.push(Math.min(1, Math.max(0, (p[1] - this.yBottom) / span)));
      this.tim.push(this.timing[0], this.timing[1]);
      this.emi.push(emissive);
    }
    this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    this.n += 4;
  }

  /** Axis-aligned box in world units; back face is never visible so it's skipped. */
  box(x0: number, x1: number, y0: number, y1: number, zFront: number, zBack: number, front: RGB, side: RGB, top: RGB, emissive = 0) {
    this.face([[x0, y0, zFront], [x1, y0, zFront], [x1, y1, zFront], [x0, y1, zFront]], [0, 0, 1], front, emissive);
    this.face([[x0, y1, zFront], [x1, y1, zFront], [x1, y1, zBack], [x0, y1, zBack]], [0, 1, 0], top, emissive);
    this.face([[x0, y0, zBack], [x0, y0, zFront], [x0, y1, zFront], [x0, y1, zBack]], [-1, 0, 0], side, emissive);
    this.face([[x1, y0, zFront], [x1, y0, zBack], [x1, y1, zBack], [x1, y1, zFront]], [1, 0, 0], side, emissive);
  }

  /** Flat front-facing quad at depth z (mullions, panes, truss bars). */
  flat(x0: number, x1: number, y0: number, y1: number, z: number, color: RGB, emissive = 0) {
    this.face([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], [0, 0, 1], color, emissive);
  }

  /** Flat bar of width w between two points on the plane z (diagonal bracing). */
  bar(ax: number, ay: number, bx: number, by: number, w: number, z: number, color: RGB) {
    const dx = bx - ax,
      dy = by - ay,
      L = Math.hypot(dx, dy);
    if (L < 1e-6) return;
    const nx = (-dy / L) * (w / 2),
      ny = (dx / L) * (w / 2);
    this.face([[ax + nx, ay + ny, z], [bx + nx, by + ny, z], [bx - nx, by - ny, z], [ax - nx, ay - ny, z]], [0, 0, 1], color);
  }
}

/** Total seconds from `start` until the last structure has fully revealed. */
export const BUILD_DURATION = 1.65 + T_OFF + 3.2;

/**
 * Builds the whole backdrop for a given viewport aspect ratio. Deterministic:
 * the same aspect always yields the identical scene.
 */
export function buildScene(aspect: number): SceneData {
  const rnd = mulberry(20260901);
  const em = new MeshEmitter();
  const li = { pos: [] as number[], tim: [] as number[], pha: [] as number[] };

  // The layout is authored for a landscape frame. Mapped straight onto a
  // portrait phone every structure would be squeezed into a tall sliver, so
  // portrait keeps square proportions instead: the layout spans a wider world
  // than the screen shows (the middle ~46% is visible) and the near towers
  // and facades are moved inward into that window.
  const portrait = aspect < 1;
  const layoutAspect = portrait ? 1 : aspect;

  type Plane = { toW: (nx: number, ny: number) => [number, number]; S: number; D: number; extN: number };
  // sets up the mapping from normalized layout space onto a depth plane whose
  // authored `base` line sits on the ground. `extN` is GROUND_EXT expressed in
  // this plane's normalized units, so detail loops can continue below the
  // ground line by the same distance the structures do.
  function plane(depth: number, base: number): Plane {
    const D = depthDist(depth);
    const halfH = halfHeightAt(D),
      halfW = halfH * layoutAspect;
    const lift = groundLineAt(D) - base;
    return {
      D,
      S: 2 * halfW,
      extN: GROUND_EXT / (2 * halfH),
      toW: (nx, ny) => [(nx - 0.5) * 2 * halfW, (0.5 - (ny + lift)) * 2 * halfH],
    };
  }
  function begin(p: Plane, top: number, base: number, start: number, dur: number) {
    em.timing = [start + T_OFF, dur];
    em.yTop = p.toW(0, top)[1];
    em.yBottom = p.toW(0, base)[1];
  }

  // ---------- far skyline ----------
  const HZ = 0.355;
  const skyline: [number, number, number, number, number, number][] = [
    [0.02, 0.1, 0.11, 0.018, 0.9, 3.4],
    [0.13, 0.16, 0.2, 0.016, 0.95, 3.4],
    [0.29, 0.06, 0.37, 0.018, 1.0, 3.4],
    [0.41, 0.13, 0.56, 0.02, 1.05, 3.4],
    [0.6, 0.09, 0.68, 0.018, 1.0, 3.4],
    [0.71, 0.17, 0.79, 0.016, 0.95, 3.4],
    [0.87, 0.07, 0.97, 0.018, 0.9, 3.4],
  ];
  for (const [x1, top, x2, floorH, start, dur] of skyline) {
    const p = plane(0.9, HZ);
    begin(p, top, HZ, start, dur);
    const [wx0, wy1] = p.toW(x1, top);
    const [wx1, wy0] = p.toW(x2, HZ);
    const depth = (wx1 - wx0) * 0.6;
    em.box(wx0, wx1, wy0 - GROUND_EXT, wy1, -p.D, -p.D - depth, C_CONCRETE, scale(C_CONCRETE, 0.8), scale(C_CONCRETE, 1.15));
    const cols = Math.max(1, Math.floor((x2 - x1 - 0.012) / 0.013)),
      cw = 0.007;
    // windows continue down the extension below the ground line
    for (let fy = top + floorH; fy < HZ + p.extN - 0.006; fy += floorH) {
      for (let c = 0; c < cols; c++) {
        const wx = x1 + 0.008 + c * 0.013;
        const lit = hash2(Math.round(wx * 1000), Math.round(fy * 1000)) > 0.86;
        const [a, b] = p.toW(wx, fy + 0.004);
        const [c2, d] = p.toW(wx + cw, fy + floorH - 0.005);
        em.flat(a, c2, d, b, -p.D + 0.15, lit ? C_WINDOW_LIT : C_GLASS, lit ? 1 : 0);
      }
    }
  }

  // ---------- bridge truss between the scaffold towers ----------
  {
    const p = plane(0.7, 0.36);
    begin(p, 0.185, 0.36, 1.15, 3.2);
    const x1 = 0.19,
      x2 = 0.81,
      Y = 0.215;
    const [wx0] = p.toW(x1, Y);
    const [wx1] = p.toW(x2, Y);
    const yc = p.toW(0, Y)[1];
    const unit = p.S; // world units per normalized width
    // deck
    em.box(wx0, wx1, yc - 0.008 * unit, yc + 0.008 * unit, -p.D + 2, -p.D - 2, C_STEEL, scale(C_STEEL, 0.8), scale(C_SLAB, 0.9));
    // top and bottom chords + verticals + diagonals, on a front and a back plane
    for (const z of [-p.D + 2.6, -p.D - 2.6]) {
      const col = z > -p.D ? C_STEEL : scale(C_STEEL, 0.7);
      em.flat(wx0, wx1, yc + 0.028 * unit, yc + 0.032 * unit, z, col);
      em.flat(wx0, wx1, yc - 0.032 * unit, yc - 0.028 * unit, z, col);
      const n = Math.round((x2 - x1) / 0.035);
      for (let i = 0; i <= n; i++) {
        const x = wx0 + ((wx1 - wx0) * i) / n;
        em.flat(x - 0.002 * unit, x + 0.002 * unit, yc + 0.008 * unit, yc + 0.03 * unit, z, col);
        em.flat(x - 0.002 * unit, x + 0.002 * unit, yc - 0.03 * unit, yc - 0.008 * unit, z, col);
        if (i < n) {
          const xn = wx0 + ((wx1 - wx0) * (i + 1)) / n;
          if (i % 2) em.bar(x, yc - 0.008 * unit, xn, yc - 0.03 * unit, 0.0025 * unit, z, col);
          else em.bar(x, yc - 0.03 * unit, xn, yc - 0.008 * unit, 0.0025 * unit, z, col);
        }
      }
    }
  }

  // ---------- mid scaffold towers ----------
  const towerXs: [number, number][] = portrait
    ? [
        [0.3, 1.35],
        [0.63, 1.45],
      ]
    : [
        [0.2, 1.35],
        [0.73, 1.45],
      ];
  for (const [x1, start] of towerXs) {
    const p = plane(0.65, 0.36);
    const top = 0.1,
      bot = 0.36,
      x2 = x1 + 0.07,
      bays = 2,
      lifts = 5;
    begin(p, top, bot, start, 3.0);
    const [wx0, wy1] = p.toW(x1, top);
    const [wx1, wy0] = p.toW(x2, bot);
    const unit = p.S;
    const bw = (wx1 - wx0) / bays,
      lh = (wy1 - wy0) / lifts;
    const depth = 5;
    // the lattice keeps its rhythm all the way down the extension
    const extLifts = Math.ceil(GROUND_EXT / lh);
    for (const z of [-p.D, -p.D - depth]) {
      const col = z > -p.D - 1 ? C_STEEL : scale(C_STEEL, 0.7);
      for (let b = 0; b <= bays; b++) {
        const x = wx0 + bw * b;
        em.flat(x - 0.004 * unit, x + 0.004 * unit, wy0 - GROUND_EXT, wy1, z, col);
      }
      for (let l = -extLifts; l <= lifts; l++) {
        const y = wy0 + lh * l;
        em.flat(wx0, wx1, y - 0.0025 * unit, y + 0.0025 * unit, z, col);
      }
      for (let b = 0; b < bays; b++)
        for (let l = -extLifts; l < lifts; l++) {
          const xa = wx0 + bw * b,
            xb = xa + bw,
            ya = wy0 + lh * l,
            yb = ya + lh;
          if ((((b + l) % 2) + 2) % 2) em.bar(xa, ya, xb, yb, 0.004 * unit, z, col);
          else em.bar(xb, ya, xa, yb, 0.004 * unit, z, col);
        }
    }
    // planks every other lift, spanning the depth (none on the ground line)
    for (let l = -extLifts + (extLifts % 2); l < lifts; l += 2) {
      if (l === 0) continue;
      const y = wy0 + lh * l;
      em.face([[wx0, y, -p.D], [wx1, y, -p.D], [wx1, y, -p.D - depth], [wx0, y, -p.D - depth]], [0, 1, 0], scale(C_SLAB, 0.8));
    }
    // corner posts joining front and back frames
    for (const x of [wx0, wx1]) {
      const yb = wy0 - GROUND_EXT;
      em.face([[x, yb, -p.D], [x, yb, -p.D - depth], [x, wy1, -p.D - depth], [x, wy1, -p.D]], [x < 0 ? -1 : 1, 0, 0], scale(C_STEEL, 0.85));
    }
  }

  // ---------- near high-detail facades ----------
  // in portrait the two edge facades slide inward so they frame the visible
  // window instead of sitting outside it
  const fx = portrait ? 0.22 : 0;
  const facades: { boxes: Box[]; mastX: number; start: number }[] = [
    {
      boxes: [
        { x1: 0.0 + fx, x2: 0.1 + fx, top: 0.03, bot: 0.245, fh: 0.028, mu: 0.014 },
        { x1: -0.02 + fx, x2: 0.12 + fx, top: 0.245, bot: 0.47, fh: 0.028, mu: 0.014, lobby: true },
      ],
      mastX: 0.03 + fx,
      start: 1.55,
    },
    {
      boxes: [
        { x1: 0.9 - fx, x2: 1.0 - fx, top: 0.06, bot: 0.26, fh: 0.028, mu: 0.014 },
        { x1: 0.88 - fx, x2: 1.02 - fx, top: 0.26, bot: 0.47, fh: 0.028, mu: 0.014, lobby: true },
      ],
      mastX: 0.97 - fx,
      start: 1.65,
    },
  ];
  for (const f of facades) {
    const p = plane(0.3, 0.47);
    const tb = f.boxes[0];
    begin(p, tb.top - 0.06, 0.47, f.start, 3.2);
    const unit = p.S;
    const depth = 0.11 * unit;
    for (const b of f.boxes) {
      const [wx0, wy1] = p.toW(b.x1, b.top);
      const [wx1, wy0] = p.toW(b.x2, b.bot);
      // the ground-floor box continues below the frame
      const yBase = b.bot >= 0.469 ? wy0 - GROUND_EXT : wy0;
      em.box(wx0, wx1, yBase, wy1, -p.D, -p.D - depth, C_CONCRETE_NEAR, scale(C_CONCRETE_NEAR, 0.78), scale(C_CONCRETE_NEAR, 1.2));
      const lobby = b.lobby ? b.fh * 1.6 : 0;
      // the ground-floor box continues below the frame - its floors, mullions
      // and panes keep going down with it
      const grounded = b.bot >= 0.469;
      const bottom = grounded ? b.bot + p.extN : b.bot;
      // floor slabs
      const floors: number[] = [];
      let y = b.bot - lobby;
      if (lobby) floors.push(y);
      for (y = y - b.fh; y > b.top + b.fh * 0.6; y -= b.fh) floors.push(y);
      if (grounded) for (y = b.bot; y < bottom; y += b.fh) floors.push(y);
      for (const fy of floors) {
        const [, ya] = p.toW(0, fy - 0.0025);
        const [, yb] = p.toW(0, fy + 0.0025);
        em.flat(wx0, wx1, yb, ya, -p.D + 0.35, C_SLAB);
      }
      // mullions: above the lobby, and again below the ground line
      const muls: number[] = [];
      for (let x = b.x1 + b.mu; x < b.x2 - b.mu * 0.5; x += b.mu) {
        muls.push(x);
        const [xa] = p.toW(x - 0.0012, 0);
        const [xb] = p.toW(x + 0.0012, 0);
        const [, yt] = p.toW(0, b.top);
        const [, yl] = p.toW(0, b.bot - lobby);
        em.flat(xa, xb, yl, yt, -p.D + 0.3, C_MULLION);
        if (grounded) {
          const [, yg] = p.toW(0, b.bot);
          const [, ye] = p.toW(0, bottom);
          em.flat(xa, xb, ye, yg, -p.D + 0.3, C_MULLION);
        }
      }
      // panes: between consecutive floor lines, skipping the lobby's own span
      const xs = [b.x1, ...muls, b.x2];
      const ys = [b.top, ...floors].sort((a, c) => a - c);
      for (let i = 0; i < ys.length - 1; i++) {
        const y0 = Math.min(ys[i], ys[i + 1]) + 0.0018,
          y1 = Math.max(ys[i], ys[i + 1]) - 0.0018;
        if (y1 - y0 < 0.002) continue;
        if (lobby && y0 >= b.bot - lobby - 1e-6 && y1 <= b.bot + 1e-6) continue;
        for (let j = 0; j < xs.length - 1; j++) {
          const x0 = xs[j] + 0.0018,
            x1 = xs[j + 1] - 0.0018;
          if (x1 - x0 < 0.002) continue;
          const lit = hash2(Math.round(x0 * 1000), Math.round(y0 * 1000)) > 0.86;
          const [a, bb] = p.toW(x0, y0);
          const [c, d] = p.toW(x1, y1);
          em.flat(a, c, d, bb, -p.D + 0.2, lit ? C_GLASS_LIT : C_GLASS, lit ? 1 : 0);
        }
      }
      // double-height lobby glass
      if (lobby) {
        const lx: number[] = [];
        for (let xl = b.x1; xl <= b.x2 + 1e-6; xl += b.mu * 2) lx.push(Math.min(xl, b.x2));
        if (lx[lx.length - 1] < b.x2) lx.push(b.x2);
        for (let j = 0; j < lx.length - 1; j++) {
          const x0 = lx[j] + 0.0022,
            x1 = lx[j + 1] - 0.0022;
          if (x1 - x0 < 0.002) continue;
          const lit = hash2(Math.round(x0 * 1000), Math.round(b.bot * 1000)) > 0.4;
          const [a, bb] = p.toW(x0, b.bot - lobby + 0.0022);
          const [c, d] = p.toW(x1, b.bot - 0.0022);
          em.flat(a, c, d, bb, -p.D + 0.2, lit ? C_LOBBY_LIT : C_GLASS, lit ? 1 : 0);
          const [xa] = p.toW(lx[j] - 0.0015, 0);
          const [xb] = p.toW(lx[j] + 0.0015, 0);
          em.flat(xa, xb, d, bb, -p.D + 0.3, C_MULLION);
        }
      }
    }
    // rooftop mechanical box + antenna mast with beacon
    const bw = (tb.x2 - tb.x1) * 0.35,
      bx = tb.x1 + (tb.x2 - tb.x1) * 0.15;
    {
      const [wx0, wy1] = p.toW(bx, tb.top - 0.02);
      const [wx1, wy0] = p.toW(bx + bw, tb.top);
      em.box(wx0, wx1, wy0, wy1, -p.D - depth * 0.3, -p.D - depth * 0.7, C_CONCRETE_NEAR, scale(C_CONCRETE_NEAR, 0.78), scale(C_CONCRETE_NEAR, 1.2));
      const [mx0, my1] = p.toW(f.mastX - 0.0015, tb.top - 0.06);
      const [mx1, my0] = p.toW(f.mastX + 0.0015, tb.top - 0.02);
      const mz = -p.D - depth * 0.5;
      em.box(mx0, mx1, my0, my1, mz + 0.2, mz - 0.2, C_STEEL, scale(C_STEEL, 0.8), C_STEEL);
      li.pos.push((mx0 + mx1) / 2, my1 + 0.3, mz + 0.5);
      li.tim.push(em.timing[0], em.timing[1]);
      li.pha.push(f.mastX * 40);
    }
  }

  // ---------- marine snow ----------
  const mo = { norm: [] as number[], a: [] as number[], b: [] as number[] };
  for (let m = 0; m < 90; m++) {
    const near = rnd() < 0.18; // a few big soft ones drifting close to the lens
    mo.norm.push(rnd(), rnd());
    mo.a.push(near ? 3 + rnd() * 4 : 0.6 + rnd() * 1.2, 0.0015 + rnd() * 0.004, 0.2 + rnd() * 0.5);
    mo.b.push(rnd() * TAU, near ? 0.05 + rnd() * 0.08 : 0.12 + rnd() * 0.3, 0.5 + rnd() * 1.2);
  }

  return {
    mesh: {
      position: Float32Array.from(em.pos),
      normal: Float32Array.from(em.nrm),
      color: Float32Array.from(em.col),
      rel: Float32Array.from(em.rel),
      timing: Float32Array.from(em.tim),
      emissive: Float32Array.from(em.emi),
      index: (em.n <= 65535 ? Uint16Array : Uint32Array).from(em.idx),
    },
    lights: { position: Float32Array.from(li.pos), timing: Float32Array.from(li.tim), phase: Float32Array.from(li.pha) },
    motes: { norm: Float32Array.from(mo.norm), a: Float32Array.from(mo.a), b: Float32Array.from(mo.b) },
  };
}

/**
 * Tileable multi-octave value noise, baked once into a small texture: the
 * dissolve threshold field (red) and a surface grime field (green).
 */
export function makeNoiseTexture(size = 256): Uint8Array<ArrayBuffer> {
  const data = new Uint8Array(new ArrayBuffer(size * size * 4));
  const lattice = (period: number, seed: number) => {
    const g = new Float32Array(period * period);
    const r = mulberry(seed);
    for (let i = 0; i < g.length; i++) g[i] = r();
    return (x: number, y: number) => {
      const gx = (x / size) * period,
        gy = (y / size) * period;
      const ix = Math.floor(gx),
        iy = Math.floor(gy);
      let fx = gx - ix,
        fy = gy - iy;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      const at = (a: number, b: number) => g[(((b % period) + period) % period) * period + (((a % period) + period) % period)];
      const top = at(ix, iy) * (1 - fx) + at(ix + 1, iy) * fx;
      const bot = at(ix, iy + 1) * (1 - fx) + at(ix + 1, iy + 1) * fx;
      return top * (1 - fy) + bot * fy;
    };
  };
  const fbm = (seed: number, base: number, octaves: number) => {
    const layers = Array.from({ length: octaves }, (_, o) => lattice(base << o, seed + o * 7919));
    return (x: number, y: number) => {
      let v = 0,
        amp = 0.5,
        tot = 0;
      for (let o = 0; o < octaves; o++) {
        v += layers[o](x, y) * amp;
        tot += amp;
        amp *= 0.5;
      }
      return v / tot;
    };
  };
  const dissolve = fbm(11, 4, 5);
  const grime = fbm(101, 6, 3);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      data[i] = Math.round(255 * dissolve(x, y));
      data[i + 1] = Math.round(255 * grime(x, y));
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  return data;
}

/**
 * Geometry for the Three.js skyline backdrop behind the dive world.
 *
 * This is a direct port of the approved Canvas-2D markup: the same structures
 * (far skyline, bridge truss, mid scaffold towers, two high-detail edge
 * facades), the same "shards drift in along a noise wavefront, settle, then
 * lock solid" choreography, the same palette. The only difference is that
 * each structure now lives on its own plane at a real depth in front of a
 * perspective camera, so the mouse parallax is genuine 3D rather than a flat
 * image.
 *
 * Everything here is pure data (typed arrays) - no three.js import - so it
 * stays trivially testable and the renderer module is the only thing that
 * touches WebGL.
 *
 * Layout is authored in the markup's normalized screen space (x 0..1 across
 * the width, y 0..1 down from the top) and mapped onto each structure's depth
 * plane at build time, so the composition the user signed off on is
 * reproduced exactly at whatever aspect ratio the viewport has.
 */

export const FOV = 50;
const TAN_HALF = Math.tan((FOV / 2) * (Math.PI / 180));

/** Camera-space distance for a structure's normalized depth (0 near .. 1 far). */
export function depthDist(depth: number) {
  return 60 + depth * 120;
}
export const MOTE_DEPTH = 130;

export function halfHeightAt(dist: number) {
  return dist * TAN_HALF;
}

/**
 * Height of the camera above the shared ground plane. Every structure stands
 * on that plane, so its base lands on screen where the perspective says it
 * should for its depth - far skyline highest, near edge towers lowest, all of
 * it sitting on the same ground the CSS floor grid recedes across instead of
 * floating in the top third of the viewport.
 */
const CAM_HEIGHT = 17.9;

/** Normalized screen y (0 top .. 1 bottom) of the ground line at a given camera distance. */
function groundLineAt(dist: number) {
  return 0.5 + CAM_HEIGHT / (2 * halfHeightAt(dist));
}

// the markup's clock had ~0.5s of "void" before anything began - the site
// already spends that beat on the loading screen, so pull every start earlier
const T_OFF = -0.5;

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
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const c01 = (v: number) => clamp(v, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function hash2(ix: number, iy: number) {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function vnoise(x: number, y: number, cell: number) {
  const gx = x / cell,
    gy = y / cell,
    ix = Math.floor(gx),
    iy = Math.floor(gy);
  let fx = gx - ix,
    fy = gy - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash2(ix, iy), hash2(ix + 1, iy), fx), lerp(hash2(ix, iy + 1), hash2(ix + 1, iy + 1), fx), fy);
}

type RGB = [number, number, number];
function hex(h: string): RGB {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const SHADES: RGB[] = [hex("#16303f"), hex("#2b7396"), hex("#67e8f9"), hex("#dffbff")];
const C_LIT = hex("#67e8f9");
const C_EDGE = hex("#38bdf8");
const C_HI = hex("#a5f3fc");
const C_BOX = hex("#0a1a26");
const C_BOX_NEAR = hex("#0b1c29");
const C_WIN_DARK = hex("#102636");
const C_PANE_DARK = hex("#0e2534");
const C_FILL_NEAR = hex("#163d53");
const C_FILL_FAR = hex("#0d2331");
const C_FILL_MID = hex("#0f2a3b");

type Member = { X1: number; Y1: number; X2: number; Y2: number; w: number; step?: number };
type Box = {
  x1: number;
  x2: number;
  top: number;
  bot: number;
  fh: number;
  mu: number;
  lobby?: boolean;
  floors?: number[];
  muls?: number[];
  lobbyH?: number;
};
type Struct = {
  kind: "building" | "scaffold" | "bridge" | "facade";
  members: Member[];
  /** The authored y the structure stands on - moved onto the ground plane at build time. */
  base: number;
  depth: number;
  start: number;
  dur: number;
  step: number;
  axis: (X: number, Y: number) => number;
  box?: [number, number, number, number];
  floorH?: number;
  grid?: { x1: number; x2: number; top: number; bot: number; bays: number; lifts: number };
  boxes?: Box[];
  roof?: [number, number, number, number];
  mast?: [number, number];
};

const member = (X1: number, Y1: number, X2: number, Y2: number, w: number): Member => ({ X1, Y1, X2, Y2, w });
const outline = (x1: number, y1: number, x2: number, y2: number, w: number) => [
  member(x1, y1, x2, y1, w),
  member(x2, y1, x2, y2, w),
  member(x2, y2, x1, y2, w),
  member(x1, y2, x1, y1, w),
];

function building(x1: number, top: number, x2: number, bot: number, floorH: number, depth: number, start: number, dur: number): Struct {
  const ms = outline(x1, top, x2, bot, 0.004);
  for (let y = top + floorH; y < bot - 0.006; y += floorH) ms.push(member(x1, y, x2, y, 0.0025));
  return { kind: "building", members: ms, base: bot, box: [x1, top, x2, bot], floorH, depth, start, dur, step: 0.004, axis: (_X, Y) => 1 - (Y - top) / (bot - top) };
}

function scaffold(
  x1: number,
  top: number,
  x2: number,
  bot: number,
  bays: number,
  lifts: number,
  mw: number,
  bw: number,
  pw: number,
  depth: number,
  start: number,
  dur: number
): Struct {
  const ms: Member[] = [];
  const bwd = (x2 - x1) / bays,
    lh = (bot - top) / lifts;
  for (let b = 0; b <= bays; b++) {
    const x = x1 + bwd * b;
    ms.push(member(x, top, x, bot, mw));
  }
  for (let l = 0; l <= lifts; l++) {
    const y = top + lh * l;
    ms.push(member(x1, y, x2, y, bw));
  }
  for (let b = 0; b < bays; b++)
    for (let l = 0; l < lifts; l++) {
      const xa = x1 + bwd * b,
        xb = xa + bwd,
        ya = top + lh * l,
        yb = ya + lh;
      ms.push((b + l) % 2 ? member(xa, ya, xb, yb, bw * 0.8) : member(xb, ya, xa, yb, bw * 0.8));
    }
  for (let l = 2; l < lifts; l += 2) {
    const yp = top + lh * l;
    ms.push(member(x1, yp, x2, yp, pw));
  }
  return { kind: "scaffold", members: ms, base: bot, grid: { x1, x2, top, bot, bays, lifts }, depth, start, dur, step: 0.0032, axis: (_X, Y) => 1 - (Y - top) / (bot - top) };
}

function bridge(x1: number, x2: number, Y: number, base: number, depth: number, start: number, dur: number): Struct {
  const ms = [member(x1, Y, x2, Y, 0.016), member(x1, Y - 0.03, x2, Y - 0.03, 0.004), member(x1, Y - 0.016, x2, Y - 0.016, 0.003), member(x1, Y + 0.03, x2, Y + 0.03, 0.006)];
  const n = Math.round((x2 - x1) / 0.035);
  for (let i = 0; i <= n; i++) {
    const x = x1 + ((x2 - x1) * i) / n;
    ms.push(member(x, Y - 0.03, x, Y - 0.008, 0.004));
    ms.push(member(x, Y + 0.008, x, Y + 0.03, 0.004));
    if (i < n) {
      const xn = x1 + ((x2 - x1) * (i + 1)) / n;
      ms.push(i % 2 ? member(x, Y + 0.008, xn, Y + 0.03, 0.003) : member(x, Y + 0.03, xn, Y + 0.008, 0.003));
    }
  }
  return { kind: "bridge", members: ms, base, depth, start, dur, step: 0.0032, axis: (X) => (X - x1) / (x2 - x1) };
}

function facade(boxes: Box[], mastX: number, depth: number, start: number, dur: number): Struct {
  let ms: Member[] = [];
  boxes.forEach((b) => {
    const { x1, x2, top, bot, fh, mu } = b;
    const midx = (x1 + x2) / 2;
    const lobby = b.lobby ? fh * 1.6 : 0;
    ms.push(member(x1, top, x1, bot, 0.012), member(x2, top, x2, bot, 0.012), member(midx, top, midx, bot, 0.007));
    ms.push(member(x1, top, x2, top, 0.009), member(x1, bot, x2, bot, 0.006));
    const floors: number[] = [];
    let y = bot - lobby;
    if (lobby) {
      ms.push(member(x1, y, x2, y, 0.006));
      floors.push(y);
    }
    for (y = y - fh; y > top + fh * 0.6; y -= fh) {
      ms.push(member(x1, y, x2, y, 0.0045));
      floors.push(y);
    }
    const muls: number[] = [];
    for (let x = x1 + mu; x < x2 - mu * 0.5; x += mu) {
      muls.push(x);
      if (Math.abs(x - midx) < mu * 0.4) continue;
      const m = member(x, top, x, bot - lobby, 0.002);
      m.step = 0.0042;
      ms.push(m);
    }
    if (lobby)
      for (let xl = x1 + mu * 2; xl < x2 - mu; xl += mu * 2) {
        const m2 = member(xl, bot - lobby, xl, bot, 0.003);
        m2.step = 0.0042;
        ms.push(m2);
      }
    b.floors = floors;
    b.muls = muls;
    b.lobbyH = lobby;
  });
  const tb = boxes[0],
    bw = (tb.x2 - tb.x1) * 0.35,
    bx = tb.x1 + (tb.x2 - tb.x1) * 0.15;
  ms = ms.concat(outline(bx, tb.top - 0.02, bx + bw, tb.top, 0.004));
  ms.push(member(mastX, tb.top - 0.02, mastX, tb.top - 0.06, 0.003));
  const topY = tb.top - 0.06,
    botY = boxes[boxes.length - 1].bot;
  return {
    kind: "facade",
    members: ms,
    base: botY,
    boxes,
    roof: [bx, tb.top - 0.02, bx + bw, tb.top],
    mast: [mastX, topY],
    depth,
    start,
    dur,
    step: 0.0028,
    axis: (_X, Y) => 1 - (Y - topY) / (botY - topY),
  };
}

const HZ = 0.355;
function makeStructs(): Struct[] {
  return [
    building(0.02, 0.1, 0.11, HZ, 0.018, 0.9, 0.9, 2.6),
    building(0.13, 0.16, 0.2, HZ, 0.016, 0.9, 0.95, 2.6),
    building(0.29, 0.06, 0.37, HZ, 0.018, 0.9, 1.0, 2.6),
    building(0.41, 0.13, 0.56, HZ, 0.02, 0.9, 1.05, 2.6),
    building(0.6, 0.09, 0.68, HZ, 0.018, 0.9, 1.0, 2.6),
    building(0.71, 0.17, 0.79, HZ, 0.016, 0.9, 0.95, 2.6),
    building(0.87, 0.07, 0.97, HZ, 0.018, 0.9, 0.9, 2.6),
    // the bridge spans between the two scaffold towers, so it shares their ground line
    bridge(0.19, 0.81, 0.215, 0.36, 0.7, 1.15, 2.4),
    scaffold(0.2, 0.1, 0.27, 0.36, 2, 5, 0.008, 0.005, 0.011, 0.65, 1.35, 2.2),
    scaffold(0.73, 0.1, 0.8, 0.36, 2, 5, 0.008, 0.005, 0.011, 0.65, 1.45, 2.2),
    facade(
      [
        { x1: 0.0, x2: 0.1, top: 0.03, bot: 0.245, fh: 0.028, mu: 0.014 },
        { x1: -0.02, x2: 0.12, top: 0.245, bot: 0.47, fh: 0.028, mu: 0.014, lobby: true },
      ],
      0.03,
      0.3,
      1.55,
      2.3
    ),
    facade(
      [
        { x1: 0.9, x2: 1.0, top: 0.06, bot: 0.26, fh: 0.028, mu: 0.014 },
        { x1: 0.88, x2: 1.02, top: 0.26, bot: 0.47, fh: 0.028, mu: 0.014, lobby: true },
      ],
      0.97,
      0.3,
      1.65,
      2.3
    ),
  ];
}

/** Total seconds from `start` until the last structure has fully locked solid. */
export const BUILD_DURATION = 1.65 + T_OFF + 2.3 * 1.02;

export type SceneData = {
  /** Solid pass: fills, window panes, member bars and their edge lines - one indexed mesh in painter's order (far to near). */
  mesh: { position: Float32Array; color: Float32Array; alpha: Float32Array; solid: Float32Array; fog: Float32Array; index: Uint32Array };
  /** Fragment pass: every shard, with its resting spot, scatter offset, timing and shade. */
  shards: { position: Float32Array; scatter: Float32Array; timing: Float32Array; solid: Float32Array; fog: Float32Array; size: Float32Array; color: Float32Array };
  /** Blinking antenna beacons on the two facade masts. */
  lights: { position: Float32Array; solid: Float32Array; fog: Float32Array; phase: Float32Array };
  /** Ambient dust motes, in normalized screen space (mapped in the shader). */
  motes: { norm: Float32Array; a: Float32Array; b: Float32Array };
};

class MeshEmitter {
  pos: number[] = [];
  col: number[] = [];
  alp: number[] = [];
  sol: number[] = [];
  fog: number[] = [];
  idx: number[] = [];
  n = 0;
  /** Mapping from normalized screen space onto the current structure's depth plane - swapped per structure. */
  toWorld: (nx: number, ny: number) => [number, number, number] = () => [0, 0, 0];
  quad(pts: [number, number][], color: RGB, alpha: number, solid: [number, number], fog: number) {
    const base = this.n;
    for (const [nx, ny] of pts) {
      const [x, y, z] = this.toWorld(nx, ny);
      this.pos.push(x, y, z);
      this.col.push(color[0], color[1], color[2]);
      this.alp.push(alpha);
      this.sol.push(solid[0], solid[1]);
      this.fog.push(fog);
    }
    this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    this.n += 4;
  }
  rect(x0: number, y0: number, x1: number, y1: number, color: RGB, alpha: number, solid: [number, number], fog: number) {
    this.quad(
      [
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ],
      color,
      alpha,
      solid,
      fog
    );
  }
  /** A bar of width `w` from (X1,Y1) to (X2,Y2), offset sideways by `off` along its normal. */
  bar(m: Member, w: number, off: number, color: RGB, alpha: number, solid: [number, number], fog: number) {
    const dx = m.X2 - m.X1,
      dy = m.Y2 - m.Y1,
      L = Math.hypot(dx, dy);
    if (L < 1e-6) return;
    const nx = (-dy / L) * 1,
      ny = (dx / L) * 1;
    const ox = nx * off,
      oy = ny * off,
      hx = nx * (w / 2),
      hy = ny * (w / 2);
    this.quad(
      [
        [m.X1 + ox + hx, m.Y1 + oy + hy],
        [m.X2 + ox + hx, m.Y2 + oy + hy],
        [m.X2 + ox - hx, m.Y2 + oy - hy],
        [m.X1 + ox - hx, m.Y1 + oy - hy],
      ],
      color,
      alpha,
      solid,
      fog
    );
  }
}

/**
 * Builds the whole backdrop for a given viewport aspect ratio. Deterministic:
 * the same aspect always yields the identical scene.
 */
export function buildScene(aspect: number): SceneData {
  const rnd = mulberry(20260901);
  const structs = makeStructs().sort((a, b) => b.depth - a.depth); // painter's order: far first

  const mesh = new MeshEmitter();
  const sh = { pos: [] as number[], sca: [] as number[], tim: [] as number[], sol: [] as number[], fog: [] as number[], siz: [] as number[], col: [] as number[] };
  const li = { pos: [] as number[], sol: [] as number[], fog: [] as number[], pha: [] as number[] };

  // line "widths" are authored in normalized units, so they scale with the
  // viewport just like everything else (~1.5px at 1600px wide)
  const EDGE_W = 0.0009,
    HI_W = 0.0011;

  for (const st of structs) {
    const D = depthDist(st.depth);
    const halfH = halfHeightAt(D),
      halfW = halfH * aspect;
    const S = 2 * halfW; // world units per normalized-width unit (the markup's `s = w`)
    // slide the whole structure down so its authored base sits on the ground plane
    const lift = groundLineAt(D) - st.base;
    const toWorld = (nx: number, ny: number): [number, number, number] => [(nx - 0.5) * 2 * halfW, (0.5 - (ny + lift)) * 2 * halfH, -D];
    mesh.toWorld = toWorld;

    const start = st.start + T_OFF;
    const fog = 1 - st.depth * 0.5;
    const solid: [number, number] = [start + 0.9 * st.dur, start + 1.02 * st.dur];
    const near = st.depth < 0.5;

    // ---- solid pass ----
    if (st.kind === "building" && st.box && st.floorH) {
      const b = st.box;
      mesh.rect(b[0], b[1], b[2], b[3], C_BOX, 0.92, solid, fog);
      const cols = Math.max(1, Math.floor((b[2] - b[0] - 0.012) / 0.013)),
        cw = 0.007;
      for (let fy = b[1] + st.floorH; fy < b[3] - 0.006; fy += st.floorH) {
        for (let c = 0; c < cols; c++) {
          const wx = b[0] + 0.008 + c * 0.013;
          const lit = hash2(Math.round(wx * 1000), Math.round(fy * 1000)) > 0.8;
          mesh.rect(wx, fy + 0.004, wx + cw, fy + st.floorH - 0.005, lit ? C_LIT : C_WIN_DARK, lit ? 0.5 : 0.9, solid, fog);
        }
      }
    }
    if (st.kind === "facade" && st.boxes && st.roof) {
      const panes = (xs: number[], ys: number[], inset: number, litP: number) => {
        for (let i = 0; i < ys.length - 1; i++) {
          const y0 = Math.min(ys[i], ys[i + 1]) + inset,
            y1 = Math.max(ys[i], ys[i + 1]) - inset;
          if (y1 - y0 < 0.002) continue;
          for (let j = 0; j < xs.length - 1; j++) {
            const x0 = xs[j] + inset,
              x1 = xs[j + 1] - inset;
            if (x1 - x0 < 0.002) continue;
            const lit = hash2(Math.round(x0 * 1000), Math.round(y0 * 1000)) > 1 - litP;
            mesh.rect(x0, y0, x1, y1, lit ? C_LIT : C_PANE_DARK, lit ? 0.55 : 0.9, solid, fog);
          }
        }
      };
      for (const bx of st.boxes) {
        mesh.rect(bx.x1, bx.top, bx.x2, bx.bot, C_BOX_NEAR, 0.95, solid, fog);
        const xs = [bx.x1, ...(bx.muls ?? []), bx.x2];
        const ys = [bx.top, ...(bx.floors ?? []).slice().reverse()];
        panes(xs, ys, 0.0018, 0.2);
        if (bx.lobbyH) {
          const lx: number[] = [];
          for (let xl = bx.x1; xl <= bx.x2 + 1e-6; xl += bx.mu * 2) lx.push(Math.min(xl, bx.x2));
          if (lx[lx.length - 1] < bx.x2) lx.push(bx.x2);
          panes(lx, [bx.bot - bx.lobbyH, bx.bot], 0.0022, 0.6);
        }
      }
      const r = st.roof;
      mesh.rect(r[0], r[1], r[2], r[3], C_BOX_NEAR, 0.95, solid, fog);
    }

    const fillColor = near ? C_FILL_NEAR : st.depth > 0.8 ? C_FILL_FAR : C_FILL_MID;
    for (const m of st.members) {
      mesh.bar(m, m.w, 0, fillColor, 1, solid, fog);
      mesh.bar(m, EDGE_W, m.w / 2, C_EDGE, 0.5, solid, fog);
      mesh.bar(m, EDGE_W, -m.w / 2, C_EDGE, 0.5, solid, fog);
      mesh.bar(m, HI_W, -m.w / 2, C_HI, near ? 0.6 : 0.4, solid, fog);
    }

    if (st.kind === "scaffold" && st.grid) {
      const g = st.grid,
        bwd = (g.x2 - g.x1) / g.bays,
        lh = (g.bot - g.top) / g.lifts,
        cs = 0.004;
      for (let bb = 0; bb <= g.bays; bb++)
        for (let ll = 0; ll <= g.lifts; ll++) {
          const cx = g.x1 + bwd * bb,
            cy = g.top + lh * ll;
          mesh.rect(cx - cs / 2, cy - cs / 2, cx + cs / 2, cy + cs / 2, C_HI, 0.45, solid, fog);
        }
    }

    if (st.kind === "facade" && st.mast) {
      const [x, y, z] = toWorld(st.mast[0], st.mast[1]);
      li.pos.push(x, y, z + 1);
      li.sol.push(solid[0], solid[1]);
      li.fog.push(fog);
      li.pha.push(st.mast[0] * 40);
    }

    // ---- fragment pass ----
    for (const m of st.members) {
      const dx = m.X2 - m.X1,
        dy = m.Y2 - m.Y1,
        L = Math.hypot(dx, dy);
      if (L < 1e-6) continue;
      const stp = m.step || st.step;
      const ux = dx / L,
        uy = dy / L,
        nx = -uy,
        ny = ux;
      const along = Math.max(2, Math.ceil(L / stp)),
        across = Math.max(2, Math.round(m.w / stp));
      for (let i = 0; i <= along; i++) {
        const u = i / along;
        for (let j = 0; j < across; j++) {
          const v = (j + 0.5) / across - 0.5;
          const X = m.X1 + ux * u * L + nx * v * m.w,
            Y = m.Y1 + uy * u * L + ny * v * m.w;
          const nv = 0.6 * vnoise(X, Y, 0.02) + 0.4 * vnoise(X + 7.3, Y + 2.1, 0.007);
          const at = c01(0.06 + 0.5 * st.axis(X, Y) + 0.32 * nv);
          const ang = rnd() * TAU,
            mag = 0.004 + rnd() * 0.014;
          const light = -v * 2 + (rnd() - 0.5) * 0.8;
          const s = light > 0.7 ? (rnd() < 0.6 ? 3 : 2) : light > 0 ? (rnd() < 0.6 ? 2 : 1) : rnd() < 0.7 ? 0 : 1;
          const [wx, wy, wz] = toWorld(X, Y);
          // rest a hair in front of the structure's own solid plane so the
          // settled shards never z-fight with it
          sh.pos.push(wx, wy, wz + 0.4 + rnd() * 0.4);
          sh.sca.push(Math.cos(ang) * mag * S, -Math.sin(ang) * mag * S, (rnd() - 0.5) * mag * S * 3);
          sh.tim.push(start + at * st.dur, 0.14 * st.dur);
          sh.sol.push(solid[0], solid[1]);
          sh.fog.push(fog);
          sh.siz.push((0.0022 + rnd() * 0.0012) * S);
          const c = SHADES[s];
          sh.col.push(c[0], c[1], c[2]);
        }
      }
    }
  }

  const mo = { norm: [] as number[], a: [] as number[], b: [] as number[] };
  for (let m = 0; m < 70; m++) {
    mo.norm.push(rnd(), rnd());
    mo.a.push(0.5 + rnd() * 1.1, 0.004 + rnd() * 0.008, 0.3 + rnd() * 0.6);
    mo.b.push(rnd() * TAU, 0.12 + rnd() * 0.25, 0.8 + rnd() * 1.6);
  }

  return {
    mesh: {
      position: Float32Array.from(mesh.pos),
      color: Float32Array.from(mesh.col),
      alpha: Float32Array.from(mesh.alp),
      solid: Float32Array.from(mesh.sol),
      fog: Float32Array.from(mesh.fog),
      index: Uint32Array.from(mesh.idx),
    },
    shards: {
      position: Float32Array.from(sh.pos),
      scatter: Float32Array.from(sh.sca),
      timing: Float32Array.from(sh.tim),
      solid: Float32Array.from(sh.sol),
      fog: Float32Array.from(sh.fog),
      size: Float32Array.from(sh.siz),
      color: Float32Array.from(sh.col),
    },
    lights: {
      position: Float32Array.from(li.pos),
      solid: Float32Array.from(li.sol),
      fog: Float32Array.from(li.fog),
      phase: Float32Array.from(li.pha),
    },
    motes: { norm: Float32Array.from(mo.norm), a: Float32Array.from(mo.a), b: Float32Array.from(mo.b) },
  };
}

import * as THREE from "three";
import { buildScene, halfHeightAt, FOV, MOTE_DEPTH, BUILD_DURATION, type SceneData } from "./backdropScene";

/**
 * Owns the WebGL side of the skyline backdrop: one canvas, four draw calls
 * (solid mesh, shard points, mast beacons, dust motes), one clock.
 *
 * Loaded via a dynamic import from Backdrop.tsx so three.js only ships to the
 * desktop dive world, never to the welcome screen or the mobile fallback.
 *
 * Budget: this runs alongside the CSS 3D world on integrated graphics, so it
 * is deliberately cheap - no post-processing, no per-frame allocation, device
 * pixel ratio capped, and the loop stops entirely once the backdrop has faded
 * out behind a focused section.
 */

export type BackdropController = {
  setStart(v: boolean): void;
  setDimmed(v: boolean): void;
  dispose(): void;
};

const MAX_DPR = 1.5;
// how far the camera slides (world units) at full mouse deflection
const PARALLAX_X = 3.2;
const PARALLAX_Y = 2.0;

const COMMON_HEAD = /* glsl */ `
  uniform float uTime;
  uniform float uFade;
  varying vec4 vColor;
`;

const MESH_VERT = /* glsl */ `
  ${COMMON_HEAD}
  attribute vec3 aColor;
  attribute float aAlpha;
  attribute vec2 aSolid;
  attribute float aFog;
  void main() {
    float s = smoothstep(aSolid.x, aSolid.y, uTime);
    vColor = vec4(aColor, aAlpha * s * aFog * uFade);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FLAT_FRAG = /* glsl */ `
  varying vec4 vColor;
  void main() {
    if (vColor.a < 0.004) discard;
    gl_FragColor = vColor;
  }
`;

const SHARD_VERT = /* glsl */ `
  ${COMMON_HEAD}
  uniform float uProj;
  attribute vec3 aScatter;
  attribute vec2 aTiming;
  attribute vec2 aSolid;
  attribute float aFog;
  attribute float aSize;
  attribute vec3 aColor;
  const vec3 LIT = vec3(0.875, 0.984, 1.0);
  void main() {
    float fp = clamp((uTime - aTiming.x) / aTiming.y, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - fp, 3.0);
    vec3 p = position + aScatter * (1.0 - e);
    float solid = smoothstep(aSolid.x, aSolid.y, uTime);
    float a = min(1.0, fp * 4.0) * (1.0 - solid * 0.92) * aFog * uFade;
    vColor = vec4(e < 0.55 ? LIT : aColor, a);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = max(1.0, aSize * uProj / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const LIGHT_VERT = /* glsl */ `
  ${COMMON_HEAD}
  uniform float uDpr;
  attribute vec2 aSolid;
  attribute float aFog;
  attribute float aPhase;
  void main() {
    float s = smoothstep(aSolid.x, aSolid.y, uTime);
    float blink = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 5.0 + aPhase));
    vColor = vec4(0.875, 0.984, 1.0, s * aFog * blink * uFade);
    gl_PointSize = 4.4 * uDpr;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ROUND_FRAG = /* glsl */ `
  varying vec4 vColor;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    if (dot(d, d) > 0.25 || vColor.a < 0.004) discard;
    gl_FragColor = vColor;
  }
`;

const MOTE_VERT = /* glsl */ `
  ${COMMON_HEAD}
  uniform float uDpr;
  uniform vec2 uHalf;   // frustum half extents at the mote plane
  uniform float uDist;
  attribute vec2 aNorm;
  attribute vec3 aA;    // r, vy, f
  attribute vec3 aB;    // p, a, tw
  void main() {
    float appear = clamp((uTime - 0.4) / 1.2, 0.0, 1.0);
    float y = fract(aNorm.y - uTime * aA.y);
    float x = aNorm.x + sin(uTime * aA.z + aB.x) * 0.012;
    vec3 p = vec3((x - 0.5) * 2.0 * uHalf.x, (0.5 - y) * 2.0 * uHalf.y, -uDist);
    float a = clamp(appear * aB.y * (0.6 + 0.4 * sin(uTime * aB.z + aB.x)), 0.0, 1.0);
    vColor = vec4(0.647, 0.953, 0.988, a * uFade);
    gl_PointSize = aA.x * 2.0 * uDpr;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

function attr(arr: Float32Array, size: number) {
  return new THREE.BufferAttribute(arr, size);
}

export function mountBackdrop(
  canvas: HTMLCanvasElement,
  opts: { reducedMotion: boolean; start: boolean; dimmed: boolean }
): BackdropController | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  } catch {
    // no WebGL - the CSS scene stands on its own, exactly as before
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 400);
  camera.position.set(0, 0, 0);

  const uniforms = {
    uTime: { value: -1 },
    uFade: { value: 1 },
    uProj: { value: 1 },
    uDpr: { value: 1 },
    uHalf: { value: new THREE.Vector2(1, 1) },
    uDist: { value: MOTE_DEPTH },
  };

  const meshMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: MESH_VERT,
    fragmentShader: FLAT_FRAG,
    transparent: true,
    // painter's order within the one draw call decides what covers what; the
    // depth it leaves behind is what keeps far shards from bleeding through
    // near facades
    depthTest: true,
    depthFunc: THREE.AlwaysDepth,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
  const shardMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: SHARD_VERT,
    fragmentShader: FLAT_FRAG,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
  const lightMat = new THREE.ShaderMaterial({ uniforms, vertexShader: LIGHT_VERT, fragmentShader: ROUND_FRAG, transparent: true, depthTest: false, depthWrite: false });
  const moteMat = new THREE.ShaderMaterial({ uniforms, vertexShader: MOTE_VERT, fragmentShader: ROUND_FRAG, transparent: true, depthTest: false, depthWrite: false });

  let objects: THREE.Object3D[] = [];
  let geometries: THREE.BufferGeometry[] = [];

  function build(data: SceneData) {
    for (const o of objects) scene.remove(o);
    for (const g of geometries) g.dispose();
    objects = [];
    geometries = [];

    const mg = new THREE.BufferGeometry();
    mg.setAttribute("position", attr(data.mesh.position, 3));
    mg.setAttribute("aColor", attr(data.mesh.color, 3));
    mg.setAttribute("aAlpha", attr(data.mesh.alpha, 1));
    mg.setAttribute("aSolid", attr(data.mesh.solid, 2));
    mg.setAttribute("aFog", attr(data.mesh.fog, 1));
    mg.setIndex(new THREE.BufferAttribute(data.mesh.index, 1));
    const mesh = new THREE.Mesh(mg, meshMat);
    mesh.renderOrder = 0;

    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", attr(data.shards.position, 3));
    sg.setAttribute("aScatter", attr(data.shards.scatter, 3));
    sg.setAttribute("aTiming", attr(data.shards.timing, 2));
    sg.setAttribute("aSolid", attr(data.shards.solid, 2));
    sg.setAttribute("aFog", attr(data.shards.fog, 1));
    sg.setAttribute("aSize", attr(data.shards.size, 1));
    sg.setAttribute("aColor", attr(data.shards.color, 3));
    const shards = new THREE.Points(sg, shardMat);
    shards.renderOrder = 1;

    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", attr(data.lights.position, 3));
    lg.setAttribute("aSolid", attr(data.lights.solid, 2));
    lg.setAttribute("aFog", attr(data.lights.fog, 1));
    lg.setAttribute("aPhase", attr(data.lights.phase, 1));
    const lights = new THREE.Points(lg, lightMat);
    lights.renderOrder = 2;

    const og = new THREE.BufferGeometry();
    // the vertex shader positions motes itself - this only sizes the draw
    og.setAttribute("position", attr(new Float32Array(data.motes.norm.length * 1.5), 3));
    og.setAttribute("aNorm", attr(data.motes.norm, 2));
    og.setAttribute("aA", attr(data.motes.a, 3));
    og.setAttribute("aB", attr(data.motes.b, 3));
    const motes = new THREE.Points(og, moteMat);
    motes.renderOrder = 3;

    for (const o of [mesh, shards, lights, motes]) {
      o.frustumCulled = false;
      scene.add(o);
      objects.push(o);
    }
    geometries.push(mg, sg, lg, og);
  }

  // ---- sizing ----
  let aspect = 0;
  let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
  function fit() {
    const w = canvas.clientWidth || 1,
      h = canvas.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uProj.value = (h * dpr) / 2 / Math.tan((FOV / 2) * (Math.PI / 180));
    uniforms.uDpr.value = dpr;
    const hh = halfHeightAt(MOTE_DEPTH);
    uniforms.uHalf.value.set(hh * camera.aspect, hh);

    const next = w / h;
    if (aspect === 0) {
      aspect = next;
      build(buildScene(aspect));
    } else if (Math.abs(next - aspect) / aspect > 0.01) {
      // the layout is authored in screen space - a real aspect change means
      // re-laying it out, but not on every intermediate frame of a drag-resize
      if (rebuildTimer) clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(() => {
        rebuildTimer = null;
        aspect = canvas.clientWidth / (canvas.clientHeight || 1);
        build(buildScene(aspect));
        requestRender();
      }, 200);
    }
    requestRender();
  }
  const ro = new ResizeObserver(fit);
  ro.observe(canvas);

  // ---- clock / fade / parallax state ----
  const { reducedMotion } = opts;
  let t0: number | null = null;
  let fade = opts.dimmed ? 0 : 1,
    fadeTarget = fade;
  let px = 0,
    py = 0,
    tx = 0,
    ty = 0;
  let raf = 0;
  let lastRender = 0;
  let disposed = false;

  function currentTime(now: number) {
    if (reducedMotion) return t0 === null ? -1 : 1000;
    return t0 === null ? -1 : (now - t0) / 1000;
  }

  function render(now: number) {
    const t = currentTime(now);
    uniforms.uTime.value = t;
    uniforms.uFade.value = fade;
    camera.position.set(px, py, 0);
    renderer.render(scene, camera);
    lastRender = now;
  }

  function frame(now: number) {
    raf = 0;
    if (disposed) return;
    const t = currentTime(now);

    // ease the fade and the parallax toward their targets
    fade += (fadeTarget - fade) * 0.12;
    if (Math.abs(fadeTarget - fade) < 0.002) fade = fadeTarget;
    px += (tx - px) * 0.08;
    py += (ty - py) * 0.08;
    const parallaxSettled = Math.abs(tx - px) < 0.002 && Math.abs(ty - py) < 0.002;
    if (parallaxSettled) {
      px = tx;
      py = ty;
    }

    const building = t >= 0 && t < BUILD_DURATION + 0.3;
    const fading = fade !== fadeTarget;
    // once the scene has locked in and nothing is easing, only the mast
    // beacons and dust motes are moving - half rate is plenty for those and
    // leaves more headroom for the CSS world's own compositing
    const idle = !building && !fading && parallaxSettled;
    if (!idle || now - lastRender >= 32) render(now);

    if (fade === 0 && fadeTarget === 0) return; // fully faded out - sleep until un-dimmed
    if (reducedMotion && !fading && parallaxSettled) return; // static image - nothing to animate
    raf = requestAnimationFrame(frame);
  }

  function requestRender() {
    if (disposed || raf) return;
    if (t0 === null && !reducedMotion) {
      // nothing on screen yet - just keep the canvas clear
      renderer.clear();
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function onMove(e: MouseEvent) {
    if (reducedMotion || fadeTarget === 0) return;
    const w = window.innerWidth || 1,
      h = window.innerHeight || 1;
    tx = (e.clientX / w - 0.5) * PARALLAX_X;
    ty = -(e.clientY / h - 0.5) * PARALLAX_Y;
    requestRender();
  }
  window.addEventListener("mousemove", onMove, { passive: true });

  const controller: BackdropController = {
    setStart(v) {
      if (v && t0 === null) {
        t0 = performance.now();
        requestRender();
      } else if (!v) {
        t0 = null;
      }
    },
    setDimmed(v) {
      fadeTarget = v ? 0 : 1;
      if (v) {
        // the CSS camera snaps back to center when a section is focused -
        // bring the backdrop's parallax home with it
        tx = 0;
        ty = 0;
      }
      requestRender();
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      if (rebuildTimer) clearTimeout(rebuildTimer);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      for (const g of geometries) g.dispose();
      meshMat.dispose();
      shardMat.dispose();
      lightMat.dispose();
      moteMat.dispose();
      renderer.dispose();
    },
  };

  if (opts.start) controller.setStart(true);
  fit();
  return controller;
}

import * as THREE from "three";
import { buildScene, makeNoiseTexture, halfHeightAt, FOV, MOTE_DEPTH, BUILD_DURATION, type SceneData } from "./backdropScene";

/**
 * Owns the WebGL side of the backdrop: one canvas, four draw calls (water
 * background, dissolving city, mast beacons, marine snow), one clock.
 *
 * The city is revealed by a noise dissolve: every surface compares a baked
 * noise field against a rising per-structure threshold, so it emerges as
 * irregular patches that spread and merge, with a bright "burning" rim
 * tracing the edge of each patch. Once the threshold passes the top of the
 * noise range the rim is gone and only the dark structure remains.
 *
 * Loaded via a dynamic import from Backdrop.tsx so three.js only ships to the
 * desktop dive world. Kept cheap for integrated graphics: no post-processing,
 * one texture lookup or two per pixel, device pixel ratio capped, half rate
 * once idle, and the loop stops entirely while faded out behind a section.
 */

export type BackdropController = {
  setStart(v: boolean): void;
  setDimmed(v: boolean): void;
  /** 0 = overview, 1 = deepest floor. */
  setDescent(t: number): void;
  dispose(): void;
};

// how far the camera sinks over the whole descent (world units) - the city
// rises past the viewer as they go down
const DESCENT_Y = 14;
// a floor in focus sinks the city part-way back into the water rather than
// all the way out: the panel stays legible, the descent stays visible
const DIM_LEVEL = 0.3;

// the backdrop is fogged, grainy and soft by design - at 1.25x it is
// indistinguishable from native resolution and shades a third fewer pixels
// than 1.5x on a 2x display; the CSS world on top stays fully sharp regardless
const MAX_DPR = 1.25;
// once the city has revealed only the snow, grain and beacons move - 24fps is
// plenty for a slow drift and leaves the CSS compositor the headroom it needs
const IDLE_FRAME_MS = 1000 / 24;
const PARALLAX_X = 3.2;
const PARALLAX_Y = 2.0;

// the water: a depth gradient (lighter toward the surface) with the soft glow
// of light filtering down from above - shared by the background and by the
// fog so distant structures sink into exactly the water behind them
const WATER_GLSL = /* glsl */ `
  uniform float uAspect;
  uniform float uDepth;
  uniform float uTime;
  // volumetric light: three shafts fanning down from above the frame, slowly
  // swaying and breathing, brightest near the top and fading toward the floor
  // and with depth. Screen-space, so they fall over the city as well as the
  // water behind it.
  float rays(vec2 s) {
    float t = max(uTime, 0.0);
    float r = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float x0 = 0.24 + fi * 0.26 + sin(t * (0.11 + fi * 0.03) + fi * 2.1) * 0.05;
      float slope = (fi - 1.0) * 0.16;
      float cx = x0 + (1.0 - s.y) * slope;
      float wdt = 0.04 + fi * 0.012 + (1.0 - s.y) * 0.035;
      float d = (s.x - cx) / wdt;
      r += exp(-d * d) * (0.6 + 0.4 * sin(t * 0.6 + fi * 1.9));
    }
    r *= smoothstep(0.0, 0.8, s.y);
    return r * (1.0 - 0.65 * uDepth);
  }
  vec3 water(vec2 s) {
    // the deeper the descent, the darker the water and the fainter the light
    // filtering down from the surface
    vec3 deep = mix(vec3(0.022, 0.105, 0.135), vec3(0.006, 0.028, 0.042), uDepth);
    vec3 shallow = mix(vec3(0.078, 0.31, 0.355), vec3(0.024, 0.11, 0.14), uDepth);
    vec3 c = mix(deep, shallow, smoothstep(0.0, 1.0, s.y));
    vec2 p = (s - vec2(0.5, 1.12)) * vec2(uAspect, 1.0);
    c += vec3(0.55, 0.78, 0.72) * exp(-dot(p, p) * 3.2) * 0.34 * (1.0 - 0.75 * uDepth);
    return c;
  }
  float grain(vec2 fragCoord, float t) {
    return fract(sin(dot(fragCoord + mod(t, 10.0) * 37.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  }
`;

const BG_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;
const BG_FRAG = /* glsl */ `
  varying vec2 vUv;
  ${WATER_GLSL}
  void main() {
    vec3 c = water(vUv);
    c += vec3(0.5, 0.86, 0.92) * rays(vUv) * 0.3;
    c += grain(gl_FragCoord.xy, uTime) * 0.035;
    gl_FragColor = vec4(c, 1.0);
  }
`;

const CITY_VERT = /* glsl */ `
  uniform float uTime;
  attribute vec3 aColor;
  attribute float aRel;
  attribute vec2 aTiming;
  attribute float aEmissive;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec3 vColor;
  varying float vProg;
  varying float vRel;
  varying float vEmis;
  varying float vDist;
  void main() {
    vWorld = position;
    vNormal = normal;
    vColor = aColor;
    vRel = aRel;
    vEmis = aEmissive;
    vProg = clamp((uTime - aTiming.x) / aTiming.y, 0.0, 1.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const CITY_FRAG = /* glsl */ `
  uniform sampler2D uNoise;
  uniform float uFade;
  uniform vec2 uRes;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec3 vColor;
  varying float vProg;
  varying float vRel;
  varying float vEmis;
  varying float vDist;
  ${WATER_GLSL}
  void main() {
    if (vProg <= 0.0) discard;
    // project the noise onto the surface along its dominant axis so patches
    // stay coherent across the front and side faces of a box
    vec3 an = abs(vNormal);
    vec2 uv = an.z > 0.5 ? vWorld.xy : (an.x > 0.5 ? vWorld.zy : vWorld.xz);
    float n = texture2D(uNoise, uv / 34.0).r;
    // rising threshold, biased a little so the lower floors lead
    float thr = vProg * 1.35 - 0.2 * vRel;
    float d = thr - n;
    if (d < 0.0) discard;
    float rim = 1.0 - smoothstep(0.0, 0.08, d);
    float core = 1.0 - smoothstep(0.0, 0.022, d);

    float light = 0.74 + 0.36 * max(vNormal.y, 0.0) + 0.12 * max(vNormal.z, 0.0);
    float grime = texture2D(uNoise, uv / 9.0 + vec2(0.37, 0.11)).g;
    // caustic light dancing on the upward faces: two drifting noise reads,
    // sharpened, so the rooftops and ledges flicker like a pool floor
    float t = max(uTime, 0.0);
    float ca = texture2D(uNoise, uv * 0.045 + vec2(t * 0.02, t * 0.013)).r;
    float cb = texture2D(uNoise, uv * 0.03 - vec2(t * 0.017, t * 0.006)).g;
    float caustic = smoothstep(0.52, 0.9, ca * 0.55 + cb * 0.55) * max(vNormal.y, 0.0) * (1.0 - 0.6 * uDepth);
    vec3 base = vColor * mix(light * mix(0.8, 1.2, grime), 1.0, vEmis) * (1.0 + caustic * 1.4);

    vec2 s = gl_FragCoord.xy / uRes;
    vec3 fogCol = water(s);
    // fog closes in with depth so distant structures sink away as you go down
    float fog = smoothstep(55.0 - 20.0 * uDepth, 235.0 - 80.0 * uDepth, vDist) * 0.92;
    vec3 col = mix(base, fogCol, fog);
    col += vec3(0.6, 0.98, 1.0) * (rim * 0.45 + core * 1.25) * (1.0 - fog * 0.6);
    // the light shafts fall over the buildings too, fainter where they're near
    col += vec3(0.5, 0.86, 0.92) * rays(s) * 0.22 * (0.5 + 0.5 * fog);
    // fading out = sinking back into the water rather than going transparent
    col = mix(fogCol, col, uFade);
    col += grain(gl_FragCoord.xy, uTime) * 0.04;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const LIGHT_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uFade;
  uniform float uDpr;
  attribute vec2 aTiming;
  attribute float aPhase;
  varying vec4 vColor;
  void main() {
    float p = clamp((uTime - aTiming.x) / aTiming.y, 0.0, 1.0);
    float on = smoothstep(0.85, 1.0, p);
    float blink = 0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * 4.0 + aPhase));
    vColor = vec4(0.85, 0.98, 1.0, on * blink * uFade * 0.8);
    gl_PointSize = 4.0 * uDpr;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const MOTE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uFade;
  uniform float uDpr;
  uniform vec2 uHalf;
  uniform float uDist;
  attribute vec2 aNorm;
  attribute vec3 aA;    // r, vy, f
  attribute vec3 aB;    // p, a, tw
  varying vec4 vColor;
  void main() {
    float appear = clamp((uTime - 0.2) / 1.5, 0.0, 1.0);
    float y = fract(aNorm.y - uTime * aA.y);
    float x = aNorm.x + sin(uTime * aA.z + aB.x) * 0.01;
    vec3 p = vec3((x - 0.5) * 2.0 * uHalf.x, (0.5 - y) * 2.0 * uHalf.y, -uDist);
    float a = clamp(appear * aB.y * (0.65 + 0.35 * sin(uTime * aB.z + aB.x)), 0.0, 1.0);
    vColor = vec4(0.72, 0.93, 0.93, a * uFade);
    gl_PointSize = aA.x * 2.2 * uDpr;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const SOFT_FRAG = /* glsl */ `
  varying vec4 vColor;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = vColor.a * smoothstep(0.5, 0.12, r);
    if (a < 0.004) discard;
    gl_FragColor = vec4(vColor.rgb, a);
  }
`;

function attr(arr: Float32Array, size: number) {
  return new THREE.BufferAttribute(arr, size);
}

export function mountBackdrop(
  canvas: HTMLCanvasElement,
  opts: { reducedMotion: boolean; start: boolean; dimmed: boolean; descent: number }
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

  const noise = new THREE.DataTexture(makeNoiseTexture(256), 256, 256, THREE.RGBAFormat);
  noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
  noise.minFilter = THREE.LinearFilter;
  noise.magFilter = THREE.LinearFilter;
  noise.needsUpdate = true;

  const uniforms = {
    uTime: { value: -1 },
    uFade: { value: 1 },
    uDpr: { value: 1 },
    uAspect: { value: 1 },
    uDepth: { value: opts.descent },
    uRes: { value: new THREE.Vector2(1, 1) },
    uHalf: { value: new THREE.Vector2(1, 1) },
    uDist: { value: MOTE_DEPTH },
    uNoise: { value: noise },
  };

  const bgMat = new THREE.ShaderMaterial({ uniforms, vertexShader: BG_VERT, fragmentShader: BG_FRAG, depthTest: false, depthWrite: false });
  const cityMat = new THREE.ShaderMaterial({ uniforms, vertexShader: CITY_VERT, fragmentShader: CITY_FRAG, side: THREE.FrontSide, depthTest: true, depthWrite: true });
  const lightMat = new THREE.ShaderMaterial({ uniforms, vertexShader: LIGHT_VERT, fragmentShader: SOFT_FRAG, transparent: true, depthTest: false, depthWrite: false });
  const moteMat = new THREE.ShaderMaterial({ uniforms, vertexShader: MOTE_VERT, fragmentShader: SOFT_FRAG, transparent: true, depthTest: false, depthWrite: false });

  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bg.frustumCulled = false;
  bg.renderOrder = -1;
  scene.add(bg);


  let objects: THREE.Object3D[] = [];
  let geometries: THREE.BufferGeometry[] = [];
  let city: THREE.Mesh | null = null;

  function build(data: SceneData) {
    for (const o of objects) scene.remove(o);
    for (const g of geometries) g.dispose();
    objects = [];
    geometries = [];

    const cg = new THREE.BufferGeometry();
    cg.setAttribute("position", attr(data.mesh.position, 3));
    cg.setAttribute("normal", attr(data.mesh.normal, 3));
    cg.setAttribute("aColor", attr(data.mesh.color, 3));
    cg.setAttribute("aRel", attr(data.mesh.rel, 1));
    cg.setAttribute("aTiming", attr(data.mesh.timing, 2));
    cg.setAttribute("aEmissive", attr(data.mesh.emissive, 1));
    cg.setIndex(new THREE.BufferAttribute(data.mesh.index, 1));
    city = new THREE.Mesh(cg, cityMat);
    city.renderOrder = 0;

    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", attr(data.lights.position, 3));
    lg.setAttribute("aTiming", attr(data.lights.timing, 2));
    lg.setAttribute("aPhase", attr(data.lights.phase, 1));
    const lights = new THREE.Points(lg, lightMat);
    lights.renderOrder = 1;

    const og = new THREE.BufferGeometry();
    // the vertex shader positions motes itself - this only sizes the draw
    og.setAttribute("position", attr(new Float32Array(data.motes.norm.length * 1.5), 3));
    og.setAttribute("aNorm", attr(data.motes.norm, 2));
    og.setAttribute("aA", attr(data.motes.a, 3));
    og.setAttribute("aB", attr(data.motes.b, 3));
    const motes = new THREE.Points(og, moteMat);
    motes.renderOrder = 2;

    for (const o of [city, lights, motes]) {
      o.frustumCulled = false;
      scene.add(o);
      objects.push(o);
    }
    geometries.push(cg, lg, og);
    warmUp();
  }

  // Compiles every shader and pushes one real draw through the pipeline
  // while the loading screen is still up, so the first visible frame of the
  // reveal doesn't stall on shader compilation (a 50-200ms hitch on
  // integrated graphics, landing right as the floor grid starts to grow).
  // The draw is confined to a single pixel and cleared straight after, so
  // nothing of it is ever seen.
  function warmUp() {
    if (t0 !== null) return; // already running for real - nothing to hide
    renderer.compile(scene, camera);
    renderer.setScissorTest(true);
    renderer.setScissor(0, 0, 1, 1);
    uniforms.uTime.value = 0.01;
    renderer.render(scene, camera);
    renderer.setScissorTest(false);
    uniforms.uTime.value = -1;
    renderer.clear();
  }

  // ---- sizing ----
  let aspect = 0;
  let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
  function fit() {
    const w = canvas.clientWidth || 1,
      h = canvas.clientHeight || 1;
    // phones render at 1x: their screens are dense and their GPUs are not
    const dpr = Math.min(window.devicePixelRatio || 1, (window.innerWidth || 1) < 768 ? 1 : MAX_DPR);
    // setPixelRatio always calls setSize internally, which reassigns
    // canvas.width/height and reinitializes the WebGL drawing buffer even
    // when the value is unchanged - skipping it when the ratio is already
    // current avoids reallocating the whole framebuffer twice on every
    // resize (a mobile browser's URL bar collapsing during scroll fires
    // this often, and backbuffer reallocation is expensive on weak GPUs)
    if (renderer.getPixelRatio() !== dpr) renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uDpr.value = dpr;
    uniforms.uAspect.value = camera.aspect;
    uniforms.uRes.value.set(w * dpr, h * dpr);
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
  const ro = new ResizeObserver(() => fit());
  ro.observe(canvas);

  // ---- clock / fade / parallax state ----
  const { reducedMotion } = opts;
  let t0: number | null = null; // declared ahead of build()/warmUp() which read it
  let fade = opts.dimmed ? DIM_LEVEL : 1,
    fadeTarget = fade;
  let px = 0,
    py = 0,
    tx = 0,
    ty = 0;
  // descent: the eased value lags the target the same way the parallax does
  let descent = opts.descent,
    descentTarget = descent;
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
    uniforms.uDepth.value = descent;
    if (city) city.visible = fade > 0.002;
    camera.position.set(px, py - descent * DESCENT_Y, 0);
    renderer.render(scene, camera);
    lastRender = now;
  }

  function frame(now: number) {
    raf = 0;
    if (disposed) return;
    const t = currentTime(now);

    fade += (fadeTarget - fade) * 0.1;
    if (Math.abs(fadeTarget - fade) < 0.002) fade = fadeTarget;
    px += (tx - px) * 0.08;
    py += (ty - py) * 0.08;
    descent += (descentTarget - descent) * 0.12;
    const descentSettled = Math.abs(descentTarget - descent) < 0.0015;
    if (descentSettled) descent = descentTarget;
    const parallaxSettled = Math.abs(tx - px) < 0.002 && Math.abs(ty - py) < 0.002 && descentSettled;
    if (parallaxSettled) {
      px = tx;
      py = ty;
    }

    const building = t >= 0 && t < BUILD_DURATION + 0.3;
    const fading = fade !== fadeTarget;
    // once revealed and settled only the beacons, the snow and the grain are
    // moving - half rate is plenty for those and leaves headroom for the CSS
    // world's own compositing
    const idle = !building && !fading && parallaxSettled;
    if (!idle || now - lastRender >= IDLE_FRAME_MS) render(now);

    if (reducedMotion && !fading && parallaxSettled) return; // static image - nothing to animate
    raf = requestAnimationFrame(frame);
  }

  function requestRender() {
    if (disposed || raf) return;
    if (t0 === null && !reducedMotion) {
      // nothing on screen yet - keep the canvas clear so the CSS stars show
      renderer.clear();
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function onMove(e: MouseEvent) {
    if (reducedMotion || fadeTarget < 1) return;
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
      fadeTarget = v ? DIM_LEVEL : 1;
      if (v) {
        // the CSS camera holds still while a floor is in focus - bring the
        // backdrop's parallax home with it
        tx = 0;
        ty = 0;
      }
      requestRender();
    },
    setDescent(t) {
      descentTarget = Math.min(1, Math.max(0, t));
      if (reducedMotion) descent = descentTarget;
      requestRender();
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      if (rebuildTimer) clearTimeout(rebuildTimer);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      for (const g of geometries) g.dispose();
      bg.geometry.dispose();
      bgMat.dispose();
      cityMat.dispose();
      lightMat.dispose();
      moteMat.dispose();
      noise.dispose();
      renderer.dispose();
    },
  };

  if (opts.start) controller.setStart(true);
  fit();
  return controller;
}

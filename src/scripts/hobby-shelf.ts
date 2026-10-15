// The Hobbys shelf: a real-time three.js scene of six compartments (owner 2026-10-10, mockup
// drafts/hobbys-regal-3d-v4.html; history in AGENTS.md). Loaded lazily by Hobbys.astro when the
// section comes near the screen; initShelf(root) builds into root's [data-stage] and drives the
// list beside it ([data-list] .row). Without WebGL it adds .no-3d to root and returns.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { reduceMotion } from "./page";
import { makeKit, CW, CH, D, type Compartment, type CompartmentApi } from "./shelf/kit";
import { LAYOUTS, sizeOf, cellX, floorY, makeFrame, type Layout } from "./shelf/frame";
import fussball from "./shelf/compartments/fussball";
import trainer from "./shelf/compartments/trainer";
import basketball from "./shelf/compartments/basketball";
import ausgehen from "./shelf/compartments/ausgehen";
import gaming from "./shelf/compartments/gaming";
import nerd from "./shelf/compartments/nerd";

/** one compartment while the shelf runs */
type Item = {
  id: string;
  side: Compartment["side"];
  g: THREE.Group;
  inner: THREE.Group;
  sc: number;
  api: CompartmentApi;
  dur: number;
  lamp: { position: THREE.Vector3; intensity: number };
  bulbMat: THREE.MeshPhysicalMaterial;
  coneMat: THREE.MeshBasicMaterial;
  poolMat: THREE.MeshBasicMaterial;
  hit: THREE.Mesh;
  on: boolean;
  glow: number;
  time: number;
  running: boolean;
  label: string;
  col?: number;
};

declare global {
  interface Window {
    // test hooks (qa and testers)
    __shelf?: {
      items: Item[];
      sync: () => void;
      renderer: THREE.WebGLRenderer;
      camera: THREE.PerspectiveCamera;
      focus: (id: string | null) => void;
      hover: (id: string | null) => void;
      pose: (id: string, p: number) => void;
    };
  }
}

export function initShelf(root: HTMLElement) {
  const reduce = reduceMotion.matches;
  const stage = root.querySelector<HTMLElement>("[data-stage]")!;
  const listEl = root.querySelector<HTMLElement>("[data-list]")!;
  const rows = [...listEl.querySelectorAll<HTMLElement>(".row")];
  const backBtn = root.querySelector<HTMLElement>("[data-back]")!;

  // ---------- renderer ----------
  let renderer: THREE.WebGLRenderer;
  try {
    const probe = document.createElement("canvas").getContext("webgl2");
    if (!probe) throw new Error("no WebGL 2");
    // a software renderer (the GPU is blocklisted or missing) draws this scene at about one
    // frame a second: then the list alone is the better page
    const dbg = probe.getExtension("WEBGL_debug_renderer_info");
    const gpu = dbg ? String(probe.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
    probe.getExtension("WEBGL_lose_context")?.loseContext();
    if (/swiftshader|llvmpipe|software|microsoft basic render/i.test(gpu) && !location.search.includes("force3d")) throw new Error("software GL");
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    // no WebGL: the stage steps aside, the list tells the same
    root.classList.add("no-3d");
    return;
  }
  // Resolution: as sharp as the screen can show. 1x screens are supersampled at 1.5x (smoother
  // edges than antialiasing alone), high-dpi screens get their own ratio, up to 2x. On a weaker
  // GPU `dpr` (the ratio while animating) steps down by itself (see the loop); whenever nothing
  // moves, the frame is drawn at full sharpness again.
  const maxDpr = Math.min(Math.max(devicePixelRatio, 1) * (devicePixelRatio < 1.5 ? 1.5 : 1), 2);
  // (what this tab stepped down to, so a reload on a weak GPU doesn't stutter again first; only
  // for the tab session: one slow visit (battery saver, shaders compiling) must not stick)
  const DPR_KEY = `shelfDpr:${maxDpr}`;
  let dpr = maxDpr;
  try { const s = Number(sessionStorage.getItem(DPR_KEY)); if (s > 0 && s < maxDpr) dpr = s; } catch {}
  renderer.setPixelRatio(maxDpr);
  renderer.shadowMap.enabled = true;
  // the shadow map was half of every frame (all objects drawn twice): it is redrawn only when
  // something moves (at most 30 times a second), not for camera moves (the light stays put)
  renderer.shadowMap.autoUpdate = false;
  let shadowDirty = true, shadowAt = 0;
  renderer.shadowMap.type = THREE.PCFShadowMap; // honours shadow.radius: soft edges
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;
  stage.prepend(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);

  // the lamp light, shared: every point light costs every pixel, lit or not, so there is one
  // (it follows the brightest compartment) instead of one per compartment
  const lampL = new THREE.PointLight("#ffd9a0", 0, 1.0, 1.6);
  scene.add(lampL);
  const HEMI = 0.42, KEY = 1.9;
  const hemi = new THREE.HemisphereLight("#fff6ee", "#d8cfc6", HEMI);
  scene.add(hemi);
  const key = new THREE.DirectionalLight("#fff8f0", KEY);
  key.position.set(-1.6, 3.4, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); // soft (radius) anyway; 2048 cost fill rate for nothing
  Object.assign(key.shadow.camera, { left: -2.4, right: 2.4, top: 2, bottom: -2, near: 2, far: 16 });
  key.shadow.radius = 6;
  key.shadow.blurSamples = 16;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.01;
  scene.add(key);

  const kit = makeKit(renderer);
  const { canvasTex, clay, ink, cyl, sph, at, noShadow } = kit;
  const kitWithScene = Object.assign(kit, { scene }); // (the disco spot adds itself to the scene)

  // ---------- the shelf (rebuilt per layout) ----------
  let L: Layout, W = 0, H = 0;
  const body = makeFrame(kit);
  let shelf: THREE.Group | null = null;
  function buildShelf() {
    if (shelf) {
      scene.remove(shelf);
      body.dispose(shelf);
    }
    shelf = body.build(L, W, H);
    scene.add(shelf);
    shadowDirty = true;
  }

  // the light cone fades from the lamp to the floor
  const coneFade = (() => {
    const [x, t] = canvasTex(4, 128);
    const gr = x.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(1, "rgba(255,255,255,0.08)");
    x.fillStyle = gr; x.fillRect(0, 0, 4, 128);
    t.needsUpdate = true;
    return t;
  })();

  // ---------- compartments ----------
  const items: Item[] = [];
  function slot(id: string, side: Compartment["side"], sc: number, dur: number, build: Compartment["build"]) {
    const g = new THREE.Group();
    scene.add(g);
    const inner = new THREE.Group();
    inner.scale.setScalar(sc);
    inner.position.z = 0.05;
    g.add(inner);
    const api = build(inner, g, sc, kitWithScene);
    // lamp: fixture, bulb, a soft visible cone and a warm point light
    g.add(at(cyl(0.07, 0.065, 0.022, ink), 0, CH - 0.011, 0.2));
    const bulbMat = clay("#fff1c9", { emissive: "#ffb000", emissiveIntensity: 0 });
    g.add(at(sph(0.026, bulbMat), 0, CH - 0.034, 0.2));
    const coneMat = new THREE.MeshBasicMaterial({ color: "#ffd9a0", map: coneFade, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const cone = noShadow(at(new THREE.Mesh(new THREE.ConeGeometry(0.4, CH - 0.06, 40, 1, true), coneMat), 0, (CH - 0.06) / 2, 0.14));
    g.add(cone);
    const [px2, poolTex] = canvasTex(128, 128);
    const pg = px2.createRadialGradient(64, 64, 0, 64, 64, 64);
    pg.addColorStop(0, "rgba(255,214,150,1)"); pg.addColorStop(0.5, "rgba(255,214,150,0.35)"); pg.addColorStop(1, "rgba(255,214,150,0)");
    px2.fillStyle = pg; px2.fillRect(0, 0, 128, 128); poolTex.needsUpdate = true;
    const poolMat = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const pool = noShadow(at(new THREE.Mesh(new THREE.PlaneGeometry(CW * 0.95, D * 0.85), poolMat), 0, 0.004, 0.04));
    pool.rotation.x = -Math.PI / 2;
    const wash = noShadow(at(new THREE.Mesh(new THREE.PlaneGeometry(CW * 0.95, CH * 1.1), poolMat), 0, CH * 0.78, -D / 2 + 0.056));
    g.add(pool, wash);
    // where this compartment's lamp light would be; the one real light (lampL) goes to the
    // brightest compartment each frame
    const lamp = { position: new THREE.Vector3(), intensity: 0 };
    const hit = at(new THREE.Mesh(new THREE.BoxGeometry(CW, CH, D), new THREE.MeshBasicMaterial({ visible: false })), 0, CH / 2, 0);
    hit.userData.id = id;
    g.add(hit);
    const it: Item = { id, side, g, inner, sc, api, dur, lamp, bulbMat, coneMat, poolMat, hit, on: false, glow: 0, time: 0, running: false, label: rows.find((r) => r.dataset.id === id)?.querySelector(".t")?.textContent ?? id };
    api.rest();
    items.push(it);
  }
  function placeItems() {
    for (const it of items) {
      const [c, r] = L.at[it.id];
      it.g.position.set(cellX(c, W), floorY(r, H), 0);
      it.lamp.position.set(cellX(c, W), floorY(r, H) + CH - 0.1, 0.24);
      it.col = c;
    }
  }
  for (const c of [fussball, trainer, basketball, ausgehen, gaming, nerd]) slot(c.id, c.side, c.scale, c.dur, c.build);

  scene.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || o.userData.noShadow) return;
    const m = o.material as THREE.Material;
    if (m.visible === false || m.transparent || m.blending === THREE.AdditiveBlending) return;
    o.castShadow = true;
    o.receiveShadow = true;
  });

  // ---------- labels ----------
  const tags = new Map(items.map((it) => {
    const t = document.createElement("span");
    t.className = "tag";
    t.textContent = it.label;
    stage.appendChild(t);
    return [it.id, t];
  }));

  // ---------- layout and camera ----------
  const camPos = new THREE.Vector3(0, 0.6, 8), camLook = new THREE.Vector3();
  const goalPos = new THREE.Vector3(), goalLook = new THREE.Vector3();
  let baseZ = 8, layoutKey = "";
  // the stage's size, read once per resize (reading it in the loop forced a layout every frame)
  let sw = 1, sh = 1;
  const fit = (halfW: number, halfH: number) => {
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return Math.max(halfH / tan, halfW / (tan * camera.aspect));
  };
  function setLayout(k: keyof typeof LAYOUTS) {
    if (k === layoutKey) return;
    layoutKey = k;
    L = LAYOUTS[k];
    ({ W, H } = sizeOf(L));
    stage.style.aspectRatio = k === "tall" ? "4 / 5" : "16 / 10";
    buildShelf();
    placeItems();
  }
  function resize() {
    setLayout(stage.clientWidth < 560 ? "tall" : "wide");
    const w = (sw = stage.clientWidth || 1), h = (sh = stage.clientHeight || 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // (phones: the tall shelf framed tighter, every pixel counts there)
    baseZ = (layoutKey === "tall" ? fit(W / 2 + 0.06, H / 2 + 0.1) : fit(W / 2 + 0.15, H / 2 + 0.2)) + D / 2;
    kick();
  }

  // ---------- state ----------
  let hovered: string | null = null, focused: string | null = null, pinned: string[] = [];
  const intro = new Set<string>();
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  const litIds = () => (focused ? [focused] : hovered ? [hovered] : pinned);
  function sync() {
    const lit = litIds();
    for (const it of items) it.on = lit.includes(it.id) || intro.has(it.id);
    rows.forEach((r) => r.classList.toggle("is-on", lit.includes(r.dataset.id ?? "")));
    listEl.classList.toggle("has-on", lit.length > 0);
    stage.classList.toggle("is-hover", !!hovered && !focused);
    stage.classList.toggle("is-focus", !!focused);
    kick();
  }
  let lastFocus: string | null = null;
  const focusOn = (id: string | null) => {
    if (id) lastFocus = id;
    focused = id;
    const row = document.activeElement?.closest<HTMLElement>(".row") || listEl.querySelector<HTMLElement>(".row:hover");
    hovered = !id && row ? row.dataset.id ?? null : null;
    sync();
  };

  // ---------- pointer ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pick = (e: PointerEvent | MouseEvent) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(items.map((i) => i.hit))[0];
    return hit ? hit.object.userData.id : null;
  };
  stage.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = stage.getBoundingClientRect();
    if (!reduce) {
      par.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      par.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
    const id = focused ? null : pick(e);
    if (id !== hovered) { hovered = id; sync(); } else kick();
  });
  stage.addEventListener("pointerleave", () => { hovered = null; par.tx = par.ty = 0; sync(); });
  renderer.domElement.addEventListener("click", (e) => {
    const id = pick(e);
    if (focused) focusOn(id && id !== focused ? id : null);
    else if (id) focusOn(id);
  });
  backBtn.addEventListener("click", () => { focusOn(null); rows.find((r) => r.dataset.id === lastFocus)?.focus({ preventScroll: true }); });
  // zoomed in: step to the previous / next compartment (buttons, or the arrow keys)
  const step = (d: number) => {
    if (!focused) return;
    const ids = items.map((i) => i.id);
    focusOn(ids[(ids.indexOf(focused) + d + ids.length) % ids.length]);
  };
  root.querySelector("[data-prev]")?.addEventListener("click", () => step(-1));
  root.querySelector("[data-next]")?.addEventListener("click", () => step(1));
  addEventListener("keydown", (e) => {
    if (focused && (e.key === "ArrowLeft" || e.key === "ArrowRight") && !(e.target as HTMLElement | null)?.closest?.("[role=radiogroup], input, textarea")) {
      e.preventDefault();
      step(e.key === "ArrowLeft" ? -1 : 1);
      return;
    }
    if (e.key !== "Escape" || !focused) return;
    const inStage = stage.contains(document.activeElement);
    focusOn(null);
    if (inStage) rows.find((r) => r.dataset.id === lastFocus)?.focus({ preventScroll: true });
  });
  for (const r of rows) {
    const id = r.dataset.id!;
    r.addEventListener("pointerenter", () => { if (!focused) { hovered = id; sync(); } });
    r.addEventListener("pointerleave", () => { if (!focused) { hovered = null; sync(); } });
    r.addEventListener("focus", () => { if (!focused) { hovered = id; sync(); } });
    r.addEventListener("blur", () => { if (!focused) { hovered = null; sync(); } });
    r.addEventListener("click", () => {
      focusOn(focused === id ? null : id);
      const top = stage.getBoundingClientRect().top;
      if (focused && (top < 0 || top > innerHeight * 0.6)) stage.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  }
  // the Draußen | Beides | Drinnen switch (its radiogroup lives in Hobbys.astro) lights a whole side
  root.addEventListener("hobby-mode", (e) => {
    focused = null;
    const mode = (e as CustomEvent<"all" | Compartment["side"]>).detail;
    pinned = mode === "all" ? [] : items.filter((i) => i.side === mode).map((i) => i.id);
    sync();
  });

  // ---------- the loop: full speed while something moves, a slow tick for the idle life ----------
  let raf = 0, idleTimer: ReturnType<typeof setTimeout> | 0 = 0, last = performance.now(), clock = 0, visible = false, ready = false;
  let compiled = false;
  function kick() {
    if (raf || !visible || !compiled) return;
    clearTimeout(idleTimer);
    idleTimer = 0;
    const now = performance.now();
    if (now - last > 250) last = now;
    raf = requestAnimationFrame(frame);
  }
  const v = new THREE.Vector3();
  const yaw = Math.tan(THREE.MathUtils.degToRad(8));
  const slow: number[] = [];
  let strikes = 0, readyAt = 0, busyAt = -Infinity;
  function frame(now: number) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    clock += dt;
    let busy = false;

    if (!reduce) { par.x += (par.tx - par.x) * 0.08; par.y += (par.ty - par.y) * 0.08; }
    if (Math.abs(par.tx - par.x) + Math.abs(par.ty - par.y) > 0.001) busy = true;
    const f = focused && items.find((i) => i.id === focused);
    if (f) {
      goalLook.set(f.g.position.x, f.g.position.y + CH * 0.46, 0);
      // (the tall phone stage zooms in a little closer, so less of the neighbours shows)
      const dist = (layoutKey === "tall" ? fit(0.54, 0.43) : fit(0.6, 0.48)) + D / 2;
      const side = f.g.position.x > 0.01 ? -1 : 1;
      goalPos.set(goalLook.x + side * dist * yaw + par.x * 0.1, goalLook.y + 0.18 - par.y * 0.06, dist);
    } else {
      goalLook.set(0, -0.06, 0);
      goalPos.set(0.3 + par.x * 0.6, 0.42 + H * 0.06 - par.y * 0.3, baseZ);
    }
    const k = reduce ? 1 : 1 - Math.exp(-dt * 5);
    camPos.lerp(goalPos, k);
    camLook.lerp(goalLook, k);
    if (camPos.distanceTo(goalPos) + camLook.distanceTo(goalLook) > 0.0005) busy = true;
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    // the room dims while one compartment is in focus
    hemi.intensity += ((focused ? 0.6 : 1) * HEMI - hemi.intensity) * k;
    key.intensity += ((focused ? 0.45 : 1) * KEY - key.intensity) * k;
    if (Math.abs(key.intensity - (focused ? 0.45 : 1) * KEY) > 0.002) busy = true;

    for (const it of items) {
      const tg = it.on ? 1 : 0;
      it.glow += (tg - it.glow) * (reduce ? 1 : 1 - Math.exp(-dt * 9));
      if (Math.abs(tg - it.glow) > 0.002) busy = true;
      it.lamp.intensity = it.glow * 1.8;
      it.bulbMat.emissiveIntensity = 0.35 + it.glow * 3;
      it.coneMat.opacity = it.glow * 0.03;
      it.poolMat.opacity = it.glow * 0.32;
      it.inner.scale.setScalar(it.sc * (1 + 0.02 * it.glow));
      if (!reduce && (it.on || it.running)) {
        busy = true;
        it.running = true;
        const before = it.time;
        it.time += dt / it.dur;
        if (!it.on && Math.floor(it.time) > Math.floor(before)) { it.time = 0; it.running = false; it.api.rest(); it.api.off?.(); shadowDirty = true; }
        else it.api.update(it.time % 1, clock, dt, it.glow);
      } else if (!reduce) it.api.idle?.(clock, dt);
      const tag = tags.get(it.id)!;
      const showTag = (it.id === hovered && !focused) || it.id === focused;
      if (tag.classList.contains("is-on") !== showTag) tag.classList.toggle("is-on", showTag);
      if (showTag) {
        v.set(it.g.position.x, it.g.position.y + 0.03, D / 2).project(camera);
        // zoomed in, the name sits in the control bar at the bottom, between ‹ and ›
        if (focused) tag.style.transform = `translate(${sw / 2}px, ${sh - 32}px) translate(-50%, -50%)`;
        else tag.style.transform = `translate(${((v.x * 0.5 + 0.5) * sw).toFixed(1)}px, ${Math.min((-v.y * 0.5 + 0.5) * sh, sh - 20).toFixed(1)}px) translate(-50%, -60%)`;
      }
    }
    if (shadowDirty || (items.some((i) => i.running) && now - shadowAt > 33)) {
      renderer.shadowMap.needsUpdate = true;
      shadowAt = now;
      shadowDirty = false;
    }
    let lit = items[0];
    for (const it of items) if (it.lamp.intensity > lit.lamp.intensity) lit = it;
    lampL.position.copy(lit.lamp.position);
    lampL.intensity = lit.lamp.intensity;
    // (each change of ratio reallocates the canvas, a hitch of its own: back to full sharpness
    // only once the motion has rested a second, not between every hover and the idle tick)
    if (busy) busyAt = now;
    const ratio = busy || now - busyAt < 1000 ? dpr : maxDpr;
    if (renderer.getPixelRatio() !== ratio) renderer.setPixelRatio(ratio);
    renderer.render(scene, camera);
    if (!ready) { ready = true; readyAt = now; stage.classList.add("is-ready"); }
    // weaker GPUs: while frames run back to back (animating), take the median frame time of
    // 30 frames, from 1.5 s after the first frame (the first frames are slow everywhere; the
    // median ignores a single hitch). Two slow windows in a row (under ~45 fps, i.e. visibly
    // not smooth) step the animating resolution down: 1.5x, 1.25x, then 1x; only under ~25 fps
    // on to 0.8x. Never back up while animating (it would flicker); still frames are always
    // drawn at full sharpness (above). The step is remembered for the tab session.
    if (busy && dt > 0 && now - readyAt > 1500) {
      slow.push(dt);
      if (slow.length >= 30) {
        const med = slow.sort((a, b) => a - b)[15];
        slow.length = 0;
        const next = dpr > 1.5 ? 1.5 : dpr > 1.25 ? 1.25 : dpr > 1 ? 1 : 0.8;
        const slowNow = med > 1 / 45 && (next >= 1 || med > 1 / 25) && next < dpr;
        strikes = slowNow ? strikes + 1 : 0;
        if (strikes >= 2) {
          strikes = 0;
          dpr = next;
          try { sessionStorage.setItem(DPR_KEY, String(dpr)); } catch {}
        }
      }
    } else if (!busy) slow.length = 0;
    if (!visible) return;
    if (busy) raf = requestAnimationFrame(frame);
    else if (!reduce) idleTimer = setTimeout(idleTick, 90);
  }
  // the idle life waits while the page scrolls: a full frame of the shelf then only competes
  // with the scroll for the GPU, and nobody watches the disco ball turn mid-scroll
  let scrollAt = 0;
  addEventListener("scroll", () => { scrollAt = performance.now(); }, { passive: true });
  function idleTick() {
    idleTimer = 0;
    if (performance.now() - scrollAt < 200) { idleTimer = setTimeout(idleTick, 120); return; }
    raf = requestAnimationFrame(frame);
  }

  // first time on screen: the shelf wakes up, lamp by lamp, each object plays once
  let introDone = reduce;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
    else { cancelAnimationFrame(raf); raf = 0; clearTimeout(idleTimer); idleTimer = 0; }
    if (visible && e.intersectionRatio > 0.5 && !introDone) {
      introDone = true;
      items.forEach((it, i) => {
        setTimeout(() => { intro.add(it.id); sync(); }, 350 + i * 250);
        setTimeout(() => { intro.delete(it.id); sync(); }, 350 + i * 250 + 900);
      });
    }
  }, { threshold: [0, 0.5] }).observe(stage);
  new ResizeObserver(resize).observe(stage);
  resize();
  // compile every shader off the main thread first (KHR_parallel_shader_compile where the
  // browser has it), so the page never freezes while the shelf is built; then the first frame.
  // On a fresh profile opening /#hobbys it never settled once: draw anyway after 3 s
  const go = () => { if (compiled) return; compiled = true; kick(); };
  renderer.compileAsync(scene, camera).catch(() => {}).then(go);
  setTimeout(go, 3000);

  // test hooks (qa and testers)
  window.__shelf = {
    items, sync, renderer, camera, focus: focusOn,
    hover: (id: string | null) => { hovered = id; sync(); },
    pose: (id: string, p: number) => { const it = items.find((i) => i.id === id)!; it.on = true; it.glow = 1; it.lamp.intensity = 1.3; lampL.position.copy(it.lamp.position); lampL.intensity = 1.3; it.bulbMat.emissiveIntensity = 3; it.coneMat.opacity = 0.03; it.poolMat.opacity = 0.32; it.api.update(p, p * it.dur, 0.016, 1); renderer.shadowMap.needsUpdate = true; renderer.render(scene, camera); },
  };

}

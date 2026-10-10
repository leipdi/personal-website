// @ts-nocheck
// The Hobbys shelf: a real-time three.js scene of six compartments (owner 2026-10-10, mockup
// drafts/hobbys-regal-3d-v4.html; history in AGENTS.md). Loaded lazily by Hobbys.astro when the
// section comes near the screen; initShelf(root) builds into root's [data-stage] and drives the
// list beside it ([data-list] .row). Without WebGL it adds .no-3d to root and returns.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function initShelf(root) {


  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = root.querySelector("[data-stage]");
  const listEl = root.querySelector("[data-list]");
  const rows = [...listEl.querySelectorAll(".row")];
  const backBtn = root.querySelector("[data-back]");

  // ---------- renderer ----------
  let renderer;
  try {
    if (!document.createElement("canvas").getContext("webgl2")) throw new Error("no WebGL 2");
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    // no WebGL: the stage steps aside, the list tells the same
    root.classList.add("no-3d");
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
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

  const HEMI = 0.42, KEY = 1.9;
  const hemi = new THREE.HemisphereLight("#fff6ee", "#d8cfc6", HEMI);
  scene.add(hemi);
  const key = new THREE.DirectionalLight("#fff8f0", KEY);
  key.position.set(-1.6, 3.4, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -2.4, right: 2.4, top: 2, bottom: -2, near: 2, far: 16 });
  key.shadow.radius = 6;
  key.shadow.blurSamples = 16;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.01;
  scene.add(key);

  // ---------- materials (v4: one material per real surface, no shared clay grain) ----------
  const canvasTex = (w, h, srgb = true) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return [c.getContext("2d"), t];
  };
  // fine roughness variation, so no surface is CG-perfect (values near white: roughness x 0.8-1)
  const microTex = (() => {
    const [x, t] = canvasTex(256, 256, false);
    const img = x.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) { const v = 205 + Math.random() * 50; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    x.putImageData(img, 0, 0);
    for (let i = 0; i < 90; i++) { // a few smudges
      const px = Math.random() * 256, py = Math.random() * 256, r = 6 + Math.random() * 22, g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, "rgba(170,170,170,0.35)"); g.addColorStop(1, "rgba(170,170,170,0)");
      x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2);
    }
    t.needsUpdate = true;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  })();
  // every physical material carries the same features (a neutral bump and a hair of clearcoat
  // where it has none), so the scene compiles a handful of shader programs instead of dozens:
  // each program costs a long, blocking compile on some GPUs
  const phys = (o) => new THREE.MeshPhysicalMaterial({ roughnessMap: microTex, bumpMap: microTex, bumpScale: 0, clearcoat: 0.001, ...o });
  const plastic = (color, roughness = 0.5, o = {}) => phys({ color, roughness, metalness: 0, ...o });
  const gloss = (color, o = {}) => phys({ color, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08, ...o });
  const metal = (color, roughness = 0.32, o = {}) => phys({ color, roughness, metalness: 1, ...o });
  const rubber = (color, o = {}) => phys({ color, roughness: 0.92, ...o });
  // the shelf and other painted parts: satin lacquer
  const clay = (color, o = {}) => phys({ color, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.45, ...o });
  const INK = "#1b2638";
  const ink = plastic(INK, 0.55);
  const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const cyl = (rt, rb, h, mat, seg = 32) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  const sph = (r, mat, ws = 48, hs = 32) => new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat);
  const at = (m, x, y, z) => (m.position.set(x, y, z), m);
  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
  const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const backOut = (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
  const seg = (p, a, b) => ease(clamp01((p - a) / (b - a)));
  const bump = (p, a, b) => (p > a && p < b ? Math.sin((Math.PI * (p - a)) / (b - a)) : 0);
  const lathe = (pts, mat, n = 64) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), n), mat);
  const noShadow = (o) => (o.traverse((c) => (c.userData.noShadow = true)), o);
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  // paint a sphere's equirectangular colour + bump maps from a function of the direction
  const sphereTex = (w, h, fn) => {
    const [cx, map] = canvasTex(w, h);
    const [bx, bumpMap] = canvasTex(w, h, false);
    const ci = cx.createImageData(w, h), bi = bx.createImageData(w, h);
    const d = new THREE.Vector3(), o = [0, 0, 0, 255];
    for (let j = 0; j < h; j++) {
      const th = ((j + 0.5) / h) * Math.PI;
      for (let i = 0; i < w; i++) {
        const ph = ((i + 0.5) / w) * Math.PI * 2;
        d.set(-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th));
        fn(d, o, i, j);
        const k = (j * w + i) * 4;
        ci.data[k] = o[0]; ci.data[k + 1] = o[1]; ci.data[k + 2] = o[2]; ci.data[k + 3] = 255;
        bi.data[k] = bi.data[k + 1] = bi.data[k + 2] = o[3]; bi.data[k + 3] = 255;
      }
    }
    cx.putImageData(ci, 0, 0); bx.putImageData(bi, 0, 0);
    map.needsUpdate = bumpMap.needsUpdate = true;
    return { map, bumpMap };
  };
  // a soft dark spot where something touches the floor
  const blobTex = (() => {
    const [x, t] = canvasTex(128, 128);
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(15,27,45,0.6)");
    g.addColorStop(0.45, "rgba(15,27,45,0.24)");
    g.addColorStop(1, "rgba(15,27,45,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    t.needsUpdate = true;
    return t;
  })();
  const blob = (w, d, opacity = 1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.renderOrder = 1;
    return noShadow(m);
  };
  // a goal net: a square grid of cord with transparent holes
  const netTex = (() => {
    const [x, t] = canvasTex(64, 64);
    x.clearRect(0, 0, 64, 64);
    x.strokeStyle = "rgba(246,246,242,1)";
    x.lineWidth = 4;
    x.strokeRect(0, 0, 64, 64);
    t.needsUpdate = true;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  })();
  const netMat = (rx, ry) => {
    const t = netTex.clone();
    t.needsUpdate = true;
    t.repeat.set(rx, ry);
    return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.95 });
  };
  // strings between points, merged into one mesh (nets, wires)
  const strings = (pairs, r, mat) => {
    const geos = pairs.map(([a, b]) => {
      const len = a.distanceTo(b);
      const g = new THREE.CylinderGeometry(r, r, len, 5, 1, true);
      g.translate(0, len / 2, 0);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()));
      g.translate(a.x, a.y, a.z);
      return g;
    });
    return new THREE.Mesh(mergeGeometries(geos), mat);
  };
  // rows of small keys (laptop, keyboard)
  const keysMesh = (cols, rows, w, d, key, mat) => {
    const geo = new RoundedBoxGeometry(key[0], key[1], key[2], 2, Math.min(key[1], key[0]) * 0.35);
    const m = new THREE.InstancedMesh(geo, mat, cols * rows);
    const o = new THREE.Object3D();
    let n = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      o.position.set(-w / 2 + (c + 0.5) * (w / cols), key[1] / 2, -d / 2 + (r + 0.5) * (d / rows));
      o.updateMatrix();
      m.setMatrixAt(n++, o.matrix);
    }
    return m;
  };
  // a basketball skin: pebbled leather, black grooves (two great circles and two side circles)
  const basketTex = (base, w = 1024) => sphereTex(w, w / 2, (d, o, i, j) => {
    const w = 0.014;
    const s = Math.min(Math.abs(d.y), Math.abs(d.z), Math.abs(Math.abs(d.x) - 0.69) * 1.4);
    const seam = 1 - smooth(w * 0.55, w, s);
    const ci = Math.floor(i / 3), cj = Math.floor(j / 3);
    const jx = ci * 3 + 0.5 + hash(ci, cj) * 2, jy = cj * 3 + 0.5 + hash(cj, ci) * 2;
    const peb = 1 - Math.min(1, Math.hypot(i - jx, j - jy) / 1.9);
    const n = (hash(i * 0.37, j * 0.61) - 0.5) * 14;
    o[0] = base[0] + n - seam * (base[0] - 22); o[1] = base[1] + n * 0.6 - seam * (base[1] - 18); o[2] = base[2] + n * 0.4 - seam * (base[2] - 16);
    o[3] = (190 + peb * 65) * (1 - seam * 0.85);
  });

  // ---------- the shelf (rebuilt per layout) ----------
  const T = 0.1, CW = 1, CH = 0.8, D = 0.74, R = 0.075;
  const LAYOUTS = {
    wide: { cols: 3, rows: 2, at: { fussball: [0, 0], trainer: [1, 0], basketball: [2, 0], ausgehen: [0, 1], gaming: [1, 1], nerd: [2, 1] } },
    tall: { cols: 2, rows: 3, at: { fussball: [0, 0], trainer: [1, 0], basketball: [0, 1], ausgehen: [1, 1], gaming: [0, 2], nerd: [1, 2] } },
  };
  let L, W, H;
  const cellX = (c) => -W / 2 + T + CW / 2 + c * (CW + T);
  const floorY = (r) => H / 2 - T - CH - r * (CH + T);
  // a fine clay grain on the shelf: the micro texture, tiled small
  const grainTex = microTex.clone();
  grainTex.repeat.set(6, 6);
  grainTex.needsUpdate = true;
  const SHELF = {
    ton: { r: 0.045, rd: 0.04, fillet: true, mat: clay("#ece7e1", { roughness: 0.62, bumpMap: grainTex, bumpScale: 0.6, clearcoat: 0.15 }), back: clay("#e2dcd5", { roughness: 0.66, bumpMap: grainTex, bumpScale: 0.6, clearcoat: 0.1 }) },
  };
  const shelfStyle = "ton";
  // baked ambient occlusion: dark edges on each back wall, a darker strip along the back of each floor
  const aoWall = (() => {
    const [x, t] = canvasTex(256, 256);
    x.clearRect(0, 0, 256, 256);
    const edge = (gx0, gy0, gx1, gy1) => { const gr = x.createLinearGradient(gx0, gy0, gx1, gy1); gr.addColorStop(0, "rgba(40,30,20,0.55)"); gr.addColorStop(1, "rgba(40,30,20,0)"); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); };
    edge(0, 0, 46, 0); edge(256, 0, 210, 0); edge(0, 0, 0, 46); edge(0, 256, 0, 200);
    t.needsUpdate = true;
    return t;
  })();
  const aoFloor = (() => {
    const [x, t] = canvasTex(4, 128);
    const gr = x.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, "rgba(40,30,20,0.5)"); gr.addColorStop(1, "rgba(40,30,20,0)");
    x.fillStyle = gr; x.fillRect(0, 0, 4, 128);
    t.needsUpdate = true;
    return t;
  })();
  const aoMat = (map, o) => new THREE.MeshBasicMaterial({ map, transparent: true, opacity: o, depthWrite: false });
  const fillet = (() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(R, 0); s.absarc(R, R, R, -Math.PI / 2, Math.PI, true); s.lineTo(0, 0);
    return new THREE.ExtrudeGeometry(s, { depth: D - 0.06, bevelEnabled: false, curveSegments: 10 });
  })();
  let shelf = null;
  function buildShelf() {
    if (shelf) {
      scene.remove(shelf);
      shelf.traverse((o) => {
        if (!o.isMesh) return;
        if (o.geometry !== fillet) o.geometry.dispose();
        if (o.material.map === aoWall || o.material.map === aoFloor || o.material.map === blobTex) o.material.dispose();
      });
    }
    shelf = new THREE.Group();
    const S = SHELF[shelfStyle], shelfMat = S.mat;
    shelf.add(at(box(W - 0.02, H - 0.02, 0.05, S.back), 0, 0, -D / 2 + 0.025));
    for (let r = 0; r <= L.rows; r++) shelf.add(at(rbox(W, T, D, S.r, shelfMat), 0, H / 2 - T / 2 - r * (CH + T), 0));
    for (const x of [-W / 2 + T / 2, W / 2 - T / 2]) shelf.add(at(rbox(T, H, D, S.r, shelfMat), x, 0, 0));
    // inner dividers per row; the top row's first two cells are one bay ("Platz")
    const cells = [];
    for (let r = 0; r < L.rows; r++) {
      for (let d = 1; d < L.cols; d++) {
        if (r === 0 && d === 1) continue;
        shelf.add(at(rbox(T, CH + (S.fillet ? 0.04 : 0.002), D, S.rd, shelfMat), -W / 2 + T / 2 + d * (CW + T), floorY(r) + CH / 2, 0));
      }
      if (r === 0) cells.push([cellX(0) - CW / 2, cellX(1) + CW / 2]);
      for (let c = r === 0 ? 2 : 0; c < L.cols; c++) cells.push([cellX(c) - CW / 2, cellX(c) + CW / 2]);
      for (const [x0, x1] of cells.splice(0)) {
        const y0 = floorY(r), y1 = y0 + CH;
        const wall = noShadow(at(new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, CH), aoMat(aoWall, 0.55)), (x0 + x1) / 2, y0 + CH / 2, -D / 2 + 0.051));
        const strip = noShadow(at(new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 0.3), aoMat(aoFloor, 0.6)), (x0 + x1) / 2, y0 + 0.0015, -D / 2 + 0.2));
        strip.rotation.x = -Math.PI / 2;
        shelf.add(wall, strip);
        if (S.fillet) for (const [x, y, rot] of [[x0, y0, 0], [x1, y0, Math.PI / 2], [x1, y1, Math.PI], [x0, y1, -Math.PI / 2]]) {
          const f = at(new THREE.Mesh(fillet, shelfMat), x, y, -D / 2 + 0.05);
          f.rotation.z = rot;
          shelf.add(f);
        }
      }
    }
    for (const x of [-W / 2 + 0.3, W / 2 - 0.3]) shelf.add(at(rbox(0.14, 0.08, 0.32, 0.03, ink), x, -H / 2 - 0.04, 0));
    shelf.add(at(blob(W * 1.08, D * 1.5, 0.55), 0, -H / 2 - 0.079, 0.02));
    shelf.traverse((o) => { if (o.isMesh && !o.userData.noShadow) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(shelf);
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
  const items = [];
  function slot(id, side, sc, dur, build) {
    const g = new THREE.Group();
    scene.add(g);
    const inner = new THREE.Group();
    inner.scale.setScalar(sc);
    inner.position.z = 0.05;
    g.add(inner);
    const api = build(inner, g, sc);
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
    const lamp = new THREE.PointLight("#ffd9a0", 0, 1.0, 1.6);
    scene.add(lamp);
    const hit = at(new THREE.Mesh(new THREE.BoxGeometry(CW, CH, D), new THREE.MeshBasicMaterial({ visible: false })), 0, CH / 2, 0);
    hit.userData.id = id;
    g.add(hit);
    const it = { id, side, g, inner, sc, api, dur, lamp, bulbMat, coneMat, poolMat, hit, on: false, glow: 0, time: 0, running: false, label: rows.find((r) => r.dataset.id === id).querySelector(".t").textContent };
    api.rest();
    items.push(it);
  }
  function placeItems() {
    for (const it of items) {
      const [c, r] = L.at[it.id];
      it.g.position.set(cellX(c), floorY(r), 0);
      it.lamp.position.set(cellX(c), floorY(r) + CH - 0.1, 0.24);
      it.col = c;
    }
  }

  // 1 Fußball: one mown pitch across the "Platz" bay; a classic stitched ball winds up, flies in,
  // squashes on the net (reference: classic black-and-white 32-panel ball)
  slot("fussball", "out", 1.18, 2.8, (g, outer, sc) => {
    const MAT = 0.026;
    const powder = plastic("#f5f5f1", 0.32, { clearcoat: 0.6, clearcoatRoughness: 0.2 });
    // the pitch spans the whole bay (this cell and the trainer's), in world units
    const PW = 2 * CW + T - 0.08, PD = 0.6;
    const [px, ptex] = canvasTex(1024, 300);
    for (let i = 0; i < 12; i++) { px.fillStyle = i % 2 ? "#4c8459" : "#568e62"; px.fillRect((i * 1024) / 12, 0, 1024 / 12 + 1, 300); }
    for (let i = 0; i < 9000; i++) { px.fillStyle = Math.random() > 0.5 ? "rgba(255,255,230,0.08)" : "rgba(10,40,20,0.12)"; px.fillRect(Math.random() * 1024, Math.random() * 300, 1.5, 3); }
    px.strokeStyle = "rgba(255,255,255,0.92)"; px.lineWidth = 3.5;
    px.beginPath(); px.moveTo(512, 10); px.lineTo(512, 290); px.stroke();
    px.beginPath(); px.arc(512, 150, 52, 0, Math.PI * 2); px.stroke();
    px.fillStyle = "#fff"; px.beginPath(); px.arc(512, 150, 4, 0, 7); px.fill();
    ptex.needsUpdate = true;
    const pitch = new THREE.Group();
    pitch.scale.setScalar(1 / sc);
    pitch.position.set((CW + T) / 2 / sc, 0, -0.03 / sc);
    pitch.add(at(rbox(PW, MAT, PD, 0.012, rubber("#3d6e4a")), 0, MAT / 2 - 0.001, 0));
    const turf = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.02, PD - 0.02), phys({ map: ptex, roughness: 0.95, bumpMap: microTex, bumpScale: 2 }));
    turf.rotation.x = -Math.PI / 2;
    pitch.add(at(turf, 0, MAT + 0.0005, 0));
    g.add(pitch);
    const m = MAT / sc;
    // a box mini goal, white powder-coated tube
    const goal = new THREE.Group();
    goal.position.set(0.1, m, -0.085);
    const bar = (len, x, y, z, rot) => { const b = at(cyl(0.011, 0.011, len, powder, 20), x, y, z); if (rot === "z") b.rotation.z = Math.PI / 2; if (rot === "x") b.rotation.x = Math.PI / 2; goal.add(b); };
    bar(0.4, -0.26, 0.2, 0); bar(0.4, 0.26, 0.2, 0); bar(0.535, 0, 0.4, 0, "z");
    bar(0.2, -0.26, 0.4, -0.1, "x"); bar(0.2, 0.26, 0.4, -0.1, "x"); bar(0.52, 0, 0.012, -0.2, "z");
    bar(0.2, -0.26, 0.012, -0.1, "x"); bar(0.2, 0.26, 0.012, -0.1, "x"); bar(0.4, -0.26, 0.2, -0.2); bar(0.4, 0.26, 0.2, -0.2);
    for (const x of [-0.26, 0.26]) for (const [y, z] of [[0.4, 0], [0.012, 0], [0.4, -0.2], [0.012, -0.2]]) goal.add(at(sph(0.013, powder, 16, 12), x, y, z));
    const backGeo = new THREE.PlaneGeometry(0.52, 0.4, 18, 14);
    goal.add(noShadow(at(new THREE.Mesh(backGeo, netMat(13, 10)), 0, 0.2, -0.2)));
    for (const x of [-0.26, 0.26]) { const s = noShadow(at(new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.4), netMat(5, 10)), x, 0.2, -0.1)); s.rotation.y = Math.PI / 2; goal.add(s); }
    const top = noShadow(at(new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.2), netMat(13, 5)), 0, 0.4, -0.1));
    top.rotation.x = Math.PI / 2;
    goal.add(top);
    g.add(goal);
    const base = backGeo.attributes.position.array.slice();
    const bulge = (b) => {
      const p = backGeo.attributes.position;
      for (let i = 0; i < p.count; i++) p.setZ(i, -b * Math.exp(-(base[i * 3] ** 2 + (base[i * 3 + 1] + 0.06) ** 2) / 0.03));
      p.needsUpdate = true;
    };
    // corner flag: a sprung pole, a cloth flag
    g.add(at(cyl(0.005, 0.005, 0.3, plastic("#f2f1ec", 0.35), 10), -0.38, m + 0.15, 0.26));
    const flagGeo = new THREE.PlaneGeometry(0.13, 0.085, 12, 3);
    flagGeo.translate(-0.065, 0, 0);
    const flag = at(new THREE.Mesh(flagGeo, phys({ color: "#b4532a", roughness: 0.85, side: THREE.DoubleSide })), -0.38, m + 0.255, 0.26);
    flag.rotation.y = Math.PI;
    g.add(flag);
    const fbase = flagGeo.attributes.position.array.slice();
    const wave = (t, amp) => {
      const p = flagGeo.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = fbase[i * 3]; p.setZ(i, Math.sin(x * 50 + t * 9) * amp * (-x / 0.13)); }
      p.needsUpdate = true;
      flagGeo.computeVertexNormals();
    };
    // a squeeze bottle at the back: translucent blue, white cap
    const bottle = new THREE.Group();
    bottle.position.set(-0.36, m, -0.16);
    bottle.add(lathe([[0, 0], [0.03, 0], [0.033, 0.006], [0.033, 0.06], [0.029, 0.08], [0.033, 0.1], [0.033, 0.15], [0.026, 0.168], [0, 0.17]], phys({ color: "#5b78b0", roughness: 0.3, transparent: true, opacity: 0.82 })));
    bottle.add(at(cyl(0.019, 0.02, 0.022, plastic("#f4f4f1", 0.35)), 0, 0.18, 0));
    bottle.add(at(cyl(0.006, 0.01, 0.022, plastic("#f4f4f1", 0.35), 16), 0, 0.2, 0));
    g.add(bottle);
    g.add(at(blob(0.12, 0.12), -0.36, m + 0.002, -0.16));
    // the ball: 12 black pentagons, 20 white hexagons, a stitched groove along every edge
    const r = 0.074;
    const ballTex = (() => {
      const ico = new THREE.IcosahedronGeometry(1, 0).attributes.position, verts = [], faces = [];
      for (let k = 0; k < ico.count; k++) {
        const v = new THREE.Vector3().fromBufferAttribute(ico, k).normalize();
        if (!verts.some((s) => s.distanceTo(v) < 0.01)) verts.push(v);
      }
      for (let k = 0; k < ico.count; k += 3) {
        faces.push(new THREE.Vector3().fromBufferAttribute(ico, k).add(new THREE.Vector3().fromBufferAttribute(ico, k + 1)).add(new THREE.Vector3().fromBufferAttribute(ico, k + 2)).normalize());
      }
      const bases = verts.map((v) => {
        const u = (Math.abs(v.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).cross(v).normalize();
        return [v, u, v.clone().cross(u)];
      });
      const apo = Math.tan(0.37) * Math.cos(Math.PI / 5), sector = (Math.PI * 2) / 5;
      return sphereTex(768, 384, (d, o) => {
        let best = 0, bd = -2;
        for (let k = 0; k < 12; k++) { const dt = d.dot(bases[k][0]); if (dt > bd) { bd = dt; best = k; } }
        const [, u, w] = bases[best];
        const px = d.dot(u) / bd, py = d.dot(w) / bd, rr = Math.hypot(px, py);
        const ang = (((Math.atan2(py, px) % sector) + sector) % sector) - sector / 2;
        const edge = apo - rr * Math.cos(ang);
        let s, black = edge > 0;
        if (black) s = edge;
        else {
          let d1 = -2, d2 = -2;
          for (const f of faces) { const dt = d.dot(f); if (dt > d1) { d2 = d1; d1 = dt; } else if (dt > d2) d2 = dt; }
          s = Math.min(-edge, (d1 - d2) * 1.4);
        }
        const seam = 1 - smooth(0.003, 0.01, s);
        const c = black ? [24, 26, 30] : [243, 242, 237], sc2 = black ? [8, 8, 10] : [128, 128, 124];
        const n = (hash(d.x * 91, d.y * 57 + d.z) - 0.5) * 6;
        o[0] = c[0] + (sc2[0] - c[0]) * seam + n; o[1] = c[1] + (sc2[1] - c[1]) * seam + n; o[2] = c[2] + (sc2[2] - c[2]) * seam + n;
        o[3] = 255 - seam * 230;
      });
    })();
    const ball = new THREE.Group();
    ball.add(sph(r, phys({ map: ballTex.map, bumpMap: ballTex.bumpMap, bumpScale: 3, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.18 }), 64, 48));
    const holder = new THREE.Group();
    holder.add(ball);
    g.add(holder);
    const shadow = at(blob(0.24, 0.24), 0, m + 0.002, 0);
    g.add(shadow);
    const Rst = new THREE.Vector3(-0.24, m + r, 0.16), G = new THREE.Vector3(0.1, m + 0.13, -0.2);
    const put = (x, y, z, sx = 1, sy = 1) => {
      holder.position.set(x, y, z);
      holder.scale.set(sx, sy, sx);
      shadow.position.set(x, m + 0.002, z);
      const hgt = clamp01((y - m - r) / 0.25);
      shadow.scale.setScalar(1 - hgt * 0.5);
      shadow.material.opacity = 1 - hgt * 0.7;
    };
    return {
      rest() { put(Rst.x, Rst.y, Rst.z); ball.rotation.set(0.3, 0.5, 0); bulge(0.02); wave(0, 0.004); },
      idle(t) { wave(t * 0.4, 0.004); },
      update(p, time) {
        if (p < 0.12) {
          const w = bump(p, 0, 0.12);
          put(Rst.x - w * 0.03, Rst.y - w * 0.012, Rst.z, 1 + w * 0.1, 1 - w * 0.14);
          ball.rotation.z = w * 0.4;
        } else if (p < 0.5) {
          const u = seg(p, 0.12, 0.5);
          const x = Rst.x + (G.x - Rst.x) * u, z = Rst.z + (G.z - Rst.z) * u;
          const y = Rst.y + (G.y - Rst.y) * u + Math.sin(Math.PI * u) * 0.16;
          const st = bump(p, 0.12, 0.2) * 0.12;
          put(x, y, z, 1 - st, 1 + st);
          ball.rotation.set(0.3 + u * 5, 0.5, -u * 12);
        } else if (p < 0.84) {
          const sq = bump(p, 0.5, 0.58) * 0.16;
          put(G.x, G.y - (p > 0.58 ? seg(p, 0.58, 0.7) * (G.y - Rst.y) : 0), G.z - sq * 0.05, 1 + sq, 1 - sq);
        } else {
          const s = p < 0.9 ? 1 - seg(p, 0.84, 0.9) : backOut(clamp01((p - 0.9) / 0.1));
          put(p < 0.9 ? G.x : Rst.x, Rst.y, p < 0.9 ? G.z : Rst.z, Math.max(s, 0.001), Math.max(s, 0.001));
          if (p >= 0.9) ball.rotation.set(0.3, 0.5, 0);
        }
        const t = (p - 0.5) / 0.5;
        bulge(0.02 + (t > 0 ? 0.03 * Math.exp(-t * 5) * Math.sin(t * Math.PI * 5) : 0));
        wave(time, 0.014);
      },
    };
  });

  // 2 Trainer: a magnetic tactics board in an aluminium frame plays its move, the whistle blows
  slot("trainer", "out", 1.12, 3.4, (g, outer, sc) => {
    const m = 0.026 / sc;
    const board = new THREE.Group();
    board.position.set(0, m, -0.215);
    board.rotation.x = -0.16;
    const alu = metal("#d4d8dc", 0.3);
    board.add(at(rbox(0.72, 0.5, 0.03, 0.01, alu), 0, 0.235, -0.004));
    board.add(at(box(0.68, 0.46, 0.02, plastic("#e9ece9", 0.5)), 0, 0.23, 0.004));
    // the printed pitch on the board surface
    const [bx, btex] = canvasTex(680, 460);
    bx.fillStyle = "#3a7552"; bx.fillRect(0, 0, 680, 460);
    for (let i = 0; i < 10; i++) { bx.fillStyle = i % 2 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.035)"; bx.fillRect(i * 68, 0, 68, 460); }
    bx.strokeStyle = "#f4f6f2"; bx.lineWidth = 4;
    bx.strokeRect(30, 30, 620, 400);
    bx.beginPath(); bx.moveTo(340, 30); bx.lineTo(340, 430); bx.stroke();
    bx.beginPath(); bx.arc(340, 230, 58, 0, Math.PI * 2); bx.stroke();
    for (const sgn of [-1, 1]) {
      const gx = sgn < 0 ? 30 : 650;
      bx.strokeRect(sgn < 0 ? gx : gx - 100, 130, 100, 200);
      bx.strokeRect(sgn < 0 ? gx : gx - 40, 185, 40, 90);
      bx.beginPath(); bx.arc(sgn < 0 ? gx + 70 : gx - 70, 230, 3, 0, 7); bx.fillStyle = "#f4f6f2"; bx.fill();
      bx.beginPath(); bx.arc(sgn < 0 ? gx + 70 : gx - 70, 230, 58, sgn < 0 ? -0.93 : Math.PI - 0.93, sgn < 0 ? 0.93 : Math.PI + 0.93); bx.stroke();
    }
    bx.font = "600 13px sans-serif"; bx.fillStyle = "rgba(255,255,255,0.55)"; bx.fillText("TAKTIK", 600, 450);
    btex.needsUpdate = true;
    board.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.445), phys({ map: btex, roughness: 0.5, clearcoat: 0.5, clearcoatRoughness: 0.3 })), 0, 0.23, 0.0145));
    // the tray along the bottom with a marker and an eraser
    board.add(at(rbox(0.6, 0.016, 0.07, 0.006, alu), 0, -0.004, 0.03));
    const pen = cyl(0.0075, 0.0075, 0.11, gloss("#20242c"), 16);
    pen.rotation.z = Math.PI / 2;
    board.add(at(pen, -0.14, 0.012, 0.035));
    const cap = cyl(0.008, 0.008, 0.03, gloss("#d9412e"), 16);
    cap.rotation.z = Math.PI / 2;
    board.add(at(cap, -0.205, 0.012, 0.035));
    board.add(at(rbox(0.09, 0.022, 0.04, 0.006, plastic("#2f55c7", 0.45)), 0.16, 0.02, 0.035));
    board.add(at(box(0.086, 0.008, 0.036, rubber("#e9e5dc")), 0.16, 0.005, 0.035));
    const map = ([x, y]) => [(x / 320 - 0.5) * 0.62, 0.23 + (0.5 - y / 230) * 0.4];
    const S = [[70, 135], [120, 195], [180, 105]].map(map), E = [[150, 82], [210, 155], [260, 62]].map(map);
    const BP = [[70, 135], [210, 155], [260, 62]].map(map);
    // round magnets with a domed glossy top
    const magnetGeo = new THREE.LatheGeometry([[0, 0], [1, 0], [1, 0.36], [0.95, 0.44], [0, 0.46]].map(([x, y]) => new THREE.Vector2(x, y)), 40);
    const disc = (r, c, x, y) => {
      const d = new THREE.Mesh(magnetGeo, phys({ color: c, roughness: 0.35, clearcoat: 0.4, clearcoatRoughness: 0.3 }));
      d.scale.set(r, r, r);
      d.rotation.x = Math.PI / 2;
      d.position.set(x, y, 0.015);
      board.add(d);
      return d;
    };
    const pieces = S.map(([x, y]) => disc(0.03, "#3557b0", x, y));
    [[250, 188], [290, 112], [110, 55]].map(map).forEach(([x, y]) => disc(0.03, "#b4532a", x, y));
    const b = at(sph(0.014, gloss("#f7f7f4")), BP[0][0], BP[0][1], 0.03);
    board.add(b);
    const arrows = S.map(([x, y], i) => {
      const mat = new THREE.LineDashedMaterial({ color: "#ffffff", dashSize: 0.018, gapSize: 0.012, transparent: true });
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, 0.016), new THREE.Vector3(E[i][0], E[i][1], 0.016)]), mat);
      l.computeLineDistances();
      board.add(l);
      return mat;
    });
    g.add(board);
    // training cones: hollow, glossy orange, with a wide square foot
    const coneMat = gloss("#d0662f", { roughness: 0.4, clearcoat: 0.4 });
    const cones = [[-0.36, 0.18], [0.36, 0.2]].map(([x, z]) => {
      const c = new THREE.Group();
      c.position.set(x, m, z);
      c.add(at(lathe([[0.034, 0], [0.01, 0.085], [0.006, 0.088], [0, 0.088]], coneMat, 40), 0, 0.006, 0));
      c.add(at(rbox(0.08, 0.008, 0.08, 0.003, coneMat), 0, 0.004, 0));
      c.add(at(cyl(0.0245, 0.0272, 0.016, plastic("#f6f6f2", 0.4), 40), 0, 0.032, 0));
      g.add(c);
      g.add(at(blob(0.13, 0.13, 0.8), x, m + 0.002, z));
      return c;
    });
    // a chrome whistle on a blue lanyard
    const chrome = metal("#e2e5e9", 0.12);
    const whistle = new THREE.Group();
    whistle.position.set(0.08, m + 0.028, 0.22);
    whistle.rotation.y = -0.5;
    const body = cyl(0.028, 0.028, 0.06, chrome, 40);
    body.rotation.z = Math.PI / 2;
    whistle.add(body);
    whistle.add(at(rbox(0.06, 0.022, 0.03, 0.006, chrome), 0.05, 0.012, 0));
    whistle.add(at(box(0.012, 0.012, 0.031, plastic("#111", 0.6)), 0.03, 0.022, 0));
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.005, 8, 48), phys({ color: "#2f55c7", roughness: 0.8 }));
    loop.rotation.x = Math.PI / 2;
    whistle.add(at(loop, -0.09, -0.024, 0));
    g.add(whistle);
    g.add(at(blob(0.14, 0.1), 0.08, m + 0.002, 0.22));
    const rings = [0, 1, 2].map(() => {
      const r = noShadow(new THREE.Mesh(new THREE.TorusGeometry(1, 0.07, 6, 40), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0 })));
      r.position.set(0.16, m + 0.16, 0.25);
      r.scale.setScalar(0.001);
      g.add(r);
      return r;
    });
    const place = (t) => {
      pieces.forEach((d, i) => {
        const k = ease(clamp01(t * 2.2 - i * 0.1));
        d.position.x = S[i][0] + (E[i][0] - S[i][0]) * k;
        d.position.y = S[i][1] + (E[i][1] - S[i][1]) * k;
        d.position.z = 0.015 + bump(k, 0, 1) * 0.02;
        arrows[i].opacity = 1 - k;
      });
      const pos = clamp01((t - 0.5) * 2) * 1.999, j = Math.floor(pos), f = ease(pos - j);
      b.position.x = BP[j][0] + (BP[j + 1][0] - BP[j][0]) * f;
      b.position.y = BP[j][1] + (BP[j + 1][1] - BP[j][1]) * f;
    };
    return {
      rest() { place(0); cones.forEach((c) => (c.rotation.z = 0)); whistle.position.y = m + 0.028; whistle.rotation.z = 0; rings.forEach((r) => (r.material.opacity = 0)); },
      update(p) {
        place(clamp01((p - 0.14) / 0.64));
        const hop = bump(p, 0, 0.14);
        whistle.position.y = m + 0.028 + hop * 0.06;
        whistle.rotation.z = hop * 0.4;
        rings.forEach((r, i) => {
          const k = clamp01((p - 0.04 - i * 0.04) / 0.22);
          r.scale.setScalar(0.02 + k * 0.1);
          r.material.opacity = k > 0 && k < 1 ? (1 - k) * 0.9 : 0;
        });
        cones.forEach((c, i) => {
          const k = clamp01((p - 0.06 - i * 0.04) / 0.5);
          c.rotation.z = k > 0 && k < 1 ? Math.sin(k * Math.PI * 4) * 0.22 * (1 - k) : 0;
        });
      },
    };
  });

  // 3 Basketball: an over-the-door mini hoop on the back wall, a pebbled ball with grooves,
  // a corded diamond net, spare balls, a scoreboard that counts the basket
  slot("basketball", "out", 1.1, 2.8, (g) => {
    const BZ = -D / 2 / 1.1 + 0.02;
    // backboard: clear-coated white board with the printed red frame and shooter's square
    const [hx, htex] = canvasTex(380, 250);
    hx.fillStyle = "#2b74b8"; hx.fillRect(0, 0, 380, 250);
    hx.strokeStyle = "#f4f6f8"; hx.lineWidth = 7; hx.strokeRect(14, 14, 352, 222);
    hx.lineWidth = 6; hx.strokeRect(135, 112, 110, 76);
    htex.needsUpdate = true;
    htex.repeat.set(1 / 0.38, 1 / 0.25); htex.offset.set(0.5, 0.5);
    // the moulded board: a rectangle with the arched cut-out along its lower edge
    const bs = new THREE.Shape();
    bs.moveTo(-0.19, 0.125); bs.lineTo(0.19, 0.125); bs.lineTo(0.19, -0.125); bs.lineTo(0.1, -0.125);
    bs.quadraticCurveTo(0, -0.05, -0.1, -0.125); bs.lineTo(-0.19, -0.125); bs.lineTo(-0.19, 0.125);
    const boardGeo = new THREE.ExtrudeGeometry(bs, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3, curveSegments: 24 });
    const board = new THREE.Group();
    board.position.set(0.1, 0.5, BZ);
    board.add(at(new THREE.Mesh(boardGeo, gloss("#ffffff", { map: htex, roughness: 0.3, clearcoat: 0.6 })), 0, 0, 0.004));
    const steel = metal("#b8bdc3", 0.38);
    board.add(at(rbox(0.06, 0.03, 0.07, 0.006, steel), 0, -0.1, 0.05));
    for (const x of [-0.12, 0.12]) board.add(at(box(0.02, 0.26, 0.012, steel), x, 0.03, -0.004));
    g.add(board);
    const RIM = new THREE.Vector3(0.1, 0.39, BZ + 0.15);
    const RR = 0.098;
    const rimMat = metal("#e2581f", 0.42, { metalness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.25 });
    const rim = at(new THREE.Mesh(new THREE.TorusGeometry(RR, 0.0062, 14, 72), rimMat), RIM.x, RIM.y, RIM.z);
    rim.rotation.x = Math.PI / 2;
    g.add(rim);
    g.add(at(rbox(0.07, 0.01, 0.07, 0.003, rimMat), RIM.x, RIM.y, RIM.z - RR - 0.022));
    // the net: 12 cords zig-zagging down in diamonds
    const N = 14, LV = 4, P = (i, l) => {
      const a = ((i + l * 0.5) / N) * Math.PI * 2, rr = RR - 0.003 - l * 0.007, y = -l * 0.034;
      return new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr);
    };
    const pairs = [];
    for (let l = 0; l < LV; l++) for (let i = 0; i < N; i++) { pairs.push([P(i, l), P(i, l + 1)], [P(i, l), P(i - 1, l + 1)]); }
    const net = noShadow(at(strings(pairs, 0.0024, rubber("#f6f6f2")), RIM.x, RIM.y - 0.004, RIM.z));
    g.add(net);
    // the balls
    const ballMat = (rgb, w) => { const t = basketTex(rgb, w); return phys({ map: t.map, bumpMap: t.bumpMap, bumpScale: 2.2, roughness: 0.72 }); };
    const mainMat = ballMat([186, 82, 32], 768);
    for (const [rgb, x, z, r] of [[[61, 90, 158], 0.37, 0.04, 0.05], [[180, 83, 42], 0.3, 0.22, 0.046]]) {
      const b = at(sph(r, ballMat(rgb, 384), 48, 32), x, r, z);
      b.rotation.set(0.6, x * 4, 0.3);
      g.add(b, at(blob(r * 3, r * 3), x, 0.002, z));
    }
    // the scoreboard, standing on the floor at the left back
    const [sx, stex] = canvasTex(128, 64);
    let score = 24;
    const drawScore = (n) => {
      sx.fillStyle = "#101418"; sx.fillRect(0, 0, 128, 64);
      sx.fillStyle = "#ff5a3c"; sx.font = "bold 44px monospace"; sx.textAlign = "center";
      sx.shadowColor = "#ff5a3c"; sx.shadowBlur = 8;
      sx.fillText(String(n).padStart(2, "0"), 64, 48);
      sx.shadowBlur = 0;
      stex.needsUpdate = true;
    };
    drawScore(score);
    const sb = new THREE.Group();
    sb.position.set(-0.33, 0, -0.18);
    sb.rotation.y = 0.35;
    sb.add(at(rbox(0.16, 0.09, 0.05, 0.01, plastic("#23272e", 0.45)), 0, 0.045, 0));
    sb.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.065), new THREE.MeshBasicMaterial({ map: stex, toneMapped: false })), 0, 0.045, 0.026));
    g.add(sb, at(blob(0.22, 0.12), -0.33, 0.002, -0.18));
    const r = 0.062;
    const ball = new THREE.Group();
    ball.add(sph(r, mainMat, 64, 48));
    const holder = new THREE.Group();
    holder.add(ball);
    g.add(holder);
    const shadow = at(blob(0.2, 0.2), 0, 0.002, 0);
    g.add(shadow);
    const Rst = new THREE.Vector3(-0.2, r, 0.18);
    const A = new THREE.Vector3(RIM.x, RIM.y + 0.11, RIM.z), Nn = new THREE.Vector3(RIM.x, RIM.y - 0.14, RIM.z), F = new THREE.Vector3(RIM.x, r, RIM.z + 0.04);
    const put = (v, sx2 = 1, sy = 1) => {
      holder.position.copy(v);
      holder.scale.set(sx2, sy, sx2);
      shadow.position.set(v.x, 0.002, v.z);
      const hgt = clamp01((v.y - r) / 0.35);
      shadow.scale.setScalar(1 - hgt * 0.5);
      shadow.material.opacity = 1 - hgt * 0.75;
    };
    const tmp = new THREE.Vector3();
    let counted = false;
    return {
      rest() { put(Rst); ball.rotation.set(0.4, 0.8, 0); net.scale.set(1, 1, 1); counted = false; },
      update(p) {
        if (p < 0.1) {
          const w = bump(p, 0, 0.1);
          tmp.copy(Rst); tmp.y -= w * 0.012;
          put(tmp, 1 + w * 0.12, 1 - w * 0.16);
          counted = false;
        } else if (p < 0.5) {
          const u = seg(p, 0.1, 0.5);
          tmp.lerpVectors(Rst, A, u);
          tmp.y += Math.sin(Math.PI * u) * 0.16;
          const st = bump(p, 0.1, 0.18) * 0.12;
          put(tmp, 1 - st, 1 + st);
        } else if (p < 0.62) put(tmp.lerpVectors(A, Nn, (p - 0.5) / 0.12));
        else if (p < 0.72) { const u = (p - 0.62) / 0.1; put(tmp.lerpVectors(Nn, F, u * u)); }
        else if (p < 0.84) {
          const sq = bump(p, 0.72, 0.76) * 0.18;
          tmp.copy(F); tmp.y += bump(p, 0.76, 0.84) * 0.07 - sq * r * 0.5;
          put(tmp, 1 + sq, 1 - sq);
        } else put(tmp.lerpVectors(F, Rst, seg(p, 0.84, 1)));
        if (p > 0.58 && !counted) { counted = true; score = score >= 98 ? 0 : score + 2; drawScore(score); }
        ball.rotation.set(0.4, 0.8, -p * 14);
        const sw = bump(p, 0.52, 0.66);
        net.scale.set(1 + sw * 0.12, 1 - sw * 0.3, 1 + sw * 0.12);
      },
    };
  });

  // 4 Ausgehen: a mirror-tiled disco ball throws specks on the walls; a swing-top beer bottle and
  // a martini glass with a lime wheel clink (references: dark swing-top lager bottle, coral cocktail)
  slot("ausgehen", "out", 1, 3, (g, outer) => {
    const disco = new THREE.Group();
    disco.position.set(0, 0.5, -0.04);
    g.add(at(cyl(0.0025, 0.0025, CH - 0.61, metal("#9aa0a8", 0.4), 6), 0, 0.5 + (CH - 0.5) / 2 + 0.05, -0.04));
    const DR = 0.085, TS = 0.0095, step = TS * 1.12;
    const tiles = [];
    for (let th = -Math.PI / 2 + step / DR / 2; th < Math.PI / 2; th += step / DR) {
      const n = Math.max(1, Math.floor((2 * Math.PI * DR * Math.cos(th)) / step));
      for (let k = 0; k < n; k++) tiles.push([th, (k / n) * Math.PI * 2 + th * 3]);
    }
    const tileMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(TS, TS, 0.0016), metal("#eef1f4", 0.05, { envMapIntensity: 1.6 }), tiles.length);
    const o3 = new THREE.Object3D(), dir = new THREE.Vector3(), tint = new THREE.Color();
    tiles.forEach(([th, ph], i) => {
      dir.set(Math.cos(th) * Math.cos(ph), Math.sin(th), Math.cos(th) * Math.sin(ph));
      o3.position.copy(dir).multiplyScalar(DR);
      o3.lookAt(dir.multiplyScalar(2));
      o3.rotateZ((hash(i, 3) - 0.5) * 0.3);
      o3.rotateX((hash(i, 7) - 0.5) * 0.08);
      o3.updateMatrix();
      tileMesh.setMatrixAt(i, o3.matrix);
      tileMesh.setColorAt(i, tint.setHSL(0.6, 0.05, 0.78 + hash(i, 11) * 0.2));
    });
    disco.add(noShadow(tileMesh));
    disco.add(noShadow(sph(DR - 0.001, plastic("#3a3d42", 0.8), 32, 24)));
    disco.add(at(cyl(0.008, 0.008, 0.016, metal("#9aa0a8", 0.4), 12), 0, DR + 0.006, 0));
    g.add(disco);
    const [dx, dotTex] = canvasTex(256, 256);
    dx.fillStyle = "#000"; dx.fillRect(0, 0, 256, 256);
    const cols = ["#ffffff", "#ffe2a8", "#ffd0dc", "#cfe0ff", "#ffffff"];
    for (let i = 0; i < 140; i++) { dx.fillStyle = cols[i % cols.length]; dx.beginPath(); dx.arc(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 3, 0, 7); dx.fill(); }
    dotTex.needsUpdate = true;
    dotTex.center.set(0.5, 0.5);
    const spot = new THREE.SpotLight("#ffffff", 0, 1.6, 0.62, 0.25, 1);
    spot.map = dotTex;
    spot.castShadow = true;
    spot.shadow.mapSize.set(512, 512);
    spot.shadow.camera.near = 0.05;
    scene.add(spot, spot.target);
    // glass without transmission (that pass compiles every shader a second time, seconds on some
    // GPUs): a nearly clear surface that is mostly reflection, drawn after what stands behind it
    const glassMat = phys({ color: "#f4f8f9", roughness: 0.04, metalness: 0, transparent: true, opacity: 0.22, depthWrite: false, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, side: THREE.DoubleSide });
    // the martini glass: foot, stem, a wide cone; coral drink; a lime wheel on the rim
    const glass = new THREE.Group();
    glass.add(lathe([[0, 0], [0.045, 0], [0.046, 0.004], [0.012, 0.009], [0.0045, 0.02], [0.0045, 0.105], [0.008, 0.112], [0.078, 0.19], [0.0785, 0.193]], glassMat));
    glass.add(lathe([[0, 0.113], [0.006, 0.113], [0.064, 0.176], [0, 0.176]], phys({ color: "#ef4f3a", roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 })));
    const [lx, ltex] = canvasTex(128, 128);
    lx.fillStyle = "#4f8f1c"; lx.beginPath(); lx.arc(64, 64, 64, 0, 7); lx.fill();
    lx.fillStyle = "#f0f6c8"; lx.beginPath(); lx.arc(64, 64, 57, 0, 7); lx.fill();
    for (let k = 0; k < 9; k++) {
      lx.fillStyle = "#b9d84a"; lx.beginPath(); lx.moveTo(64, 64); lx.arc(64, 64, 52, (k / 9) * Math.PI * 2 + 0.06, ((k + 1) / 9) * Math.PI * 2 - 0.06); lx.closePath(); lx.fill();
    }
    lx.fillStyle = "#f0f6c8"; lx.beginPath(); lx.arc(64, 64, 7, 0, 7); lx.fill();
    ltex.needsUpdate = true;
    const lime = cyl(0.024, 0.024, 0.006, [phys({ color: "#5d9a22", roughness: 0.5 }), phys({ map: ltex, roughness: 0.35, clearcoat: 0.6 }), phys({ map: ltex, roughness: 0.35, clearcoat: 0.6 })], 40);
    lime.rotation.set(Math.PI / 2, 0, 0.25);
    glass.add(at(lime, 0.074, 0.198, 0.0));
    const Lg = at(glass, -0.15, 0, 0.1);
    Lg.scale.setScalar(1.45);
    noShadow(Lg);
    // the swing-top bottle: dark brown glass, cream-and-red label, white ceramic cap on a wire
    const bottle = new THREE.Group();
    bottle.add(lathe([[0, 0], [0.032, 0], [0.034, 0.006], [0.034, 0.15], [0.031, 0.17], [0.019, 0.205], [0.0145, 0.24], [0.0145, 0.268], [0.017, 0.272], [0.017, 0.28], [0, 0.28]],
      phys({ color: "#3a1907", roughness: 0.05, transparent: true, opacity: 0.93, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.8 })));
    const [bl, bltex] = canvasTex(512, 200);
    bl.fillStyle = "#f3ead6"; bl.fillRect(0, 0, 512, 200);
    bl.fillStyle = "#b51f24"; bl.beginPath(); bl.ellipse(256, 100, 150, 86, 0, 0, 7); bl.fill();
    bl.strokeStyle = "#c9a24a"; bl.lineWidth = 6; bl.beginPath(); bl.ellipse(256, 100, 142, 78, 0, 0, 7); bl.stroke();
    bl.fillStyle = "#f3ead6"; bl.font = "700 54px Georgia, serif"; bl.textAlign = "center"; bl.fillText("Lager", 256, 112);
    bl.font = "600 18px Georgia, serif"; bl.fillStyle = "#c9a24a"; bl.fillText("HELL · 0,5 l", 256, 146);
    bltex.needsUpdate = true;
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.0345, 0.0345, 0.075, 48, 1, true, -1.25, 2.5), phys({ map: bltex, roughness: 0.6 }));
    bottle.add(at(label, 0, 0.085, 0));
    bottle.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.0168, 0.0185, 0.03, 32, 1, true), phys({ color: "#b51f24", roughness: 0.5 })), 0, 0.215, 0));
    const capM = at(sph(0.016, gloss("#f5f3ee"), 24, 16), 0, 0.29, 0);
    capM.scale.set(1, 0.7, 1);
    bottle.add(capM);
    bottle.add(at(cyl(0.0172, 0.0172, 0.005, rubber("#d33a2a"), 24), 0, 0.282, 0));
    const wire = metal("#c9ccd0", 0.3);
    const W = (a, b2) => [new THREE.Vector3(...a), new THREE.Vector3(...b2)];
    bottle.add(strings([W([-0.017, 0.296, 0], [-0.017, 0.255, 0]), W([0.017, 0.296, 0], [0.017, 0.255, 0]), W([-0.017, 0.296, 0], [0.017, 0.296, 0]), W([-0.017, 0.255, 0], [-0.03, 0.235, 0.004]), W([0.017, 0.255, 0], [0.03, 0.235, 0.004])], 0.0012, wire));
    const Rg = at(bottle, 0.097, 0, 0.1);
    Rg.scale.setScalar(1.2);
    noShadow(Rg);
    g.add(Lg, Rg);
    g.add(at(blob(0.2, 0.14), -0.15, 0.002, 0.1), at(blob(0.13, 0.13), 0.097, 0.002, 0.1));
    const sparks = [];
    for (let i = 0; i < 6; i++) {
      const s = noShadow(sph(0.008, new THREE.MeshBasicMaterial({ color: "#fff1c0" }), 12, 8));
      s.userData.dir = new THREE.Vector3(Math.cos(i * 1.05) * 0.08, 0.05 + Math.sin(i * 1.05) * 0.05, 0.03);
      g.add(s);
      sparks.push(s);
    }
    const C = new THREE.Vector3(-0.03, 0.36, 0.12);
    const aim = (time) => {
      spot.position.set(outer.position.x, outer.position.y + 0.5, 0.01);
      spot.target.position.set(outer.position.x + Math.sin(time * 0.9) * 0.2, outer.position.y + 0.32 + Math.cos(time * 0.7) * 0.08, -D / 2);
      dotTex.rotation = time * 0.4;
    };
    return {
      rest() { Lg.rotation.z = 0; Rg.rotation.z = 0; Lg.position.y = 0; Rg.position.y = 0; sparks.forEach((s) => (s.visible = false)); spot.intensity = 0; aim(0); },
      idle(t, dt) { disco.rotation.y += dt * 0.25; },
      update(p, time, dt, glow) {
        // tilt in, clink, swing back past upright and settle
        const a = p < 0.56 ? 0.24 * seg(p, 0.2, 0.42) : 0.24 * (1 - backOut(clamp01((p - 0.56) / 0.26)));
        // each tips over the edge of its foot, so it never sinks into the floor
        Lg.rotation.z = -a * 0.8;
        Lg.position.y = Math.sin(Math.abs(a) * 0.8) * 0.045 * 1.45;
        Rg.rotation.z = a;
        Rg.position.y = Math.sin(Math.abs(a)) * 0.034 * 1.2;
        disco.rotation.y += dt * 1.2;
        spot.intensity = 26 * glow;
        aim(time);
        const k = clamp01((p - 0.42) / 0.16);
        sparks.forEach((s) => {
          s.visible = k > 0 && k < 1;
          s.position.copy(C).addScaledVector(s.userData.dir, k);
          s.scale.setScalar(Math.max(Math.sin(Math.PI * k), 0.001));
        });
      },
      off() { spot.intensity = 0; },
    };
  });

  // 5 Gaming: Pong on a thin-bezel monitor (slow at rest), a DualShock-style controller that
  // buzzes, a mechanical keyboard, game cases, leather-band headphones on a stand
  slot("gaming", "in", 1.15, 3, (g, outer) => {
    const [ctx, tex] = canvasTex(320, 180);
    const draw = (time) => {
      ctx.fillStyle = "#0e2240"; ctx.fillRect(0, 0, 320, 180);
      ctx.fillStyle = "rgba(230,237,245,.35)";
      for (let y = 8; y < 180; y += 16) ctx.fillRect(158, y, 4, 8);
      ctx.fillStyle = "#e6edf5"; ctx.font = "bold 22px monospace"; ctx.textAlign = "center";
      ctx.fillText("3", 130, 30); ctx.fillText("2", 190, 30);
      const u = (time * 0.55) % 2, bx = 24 + (u < 1 ? u : 2 - u) * 272;
      const v = (time * 0.83) % 2, by = 20 + (v < 1 ? v : 2 - v) * 140;
      ctx.fillRect(14, Math.min(Math.max(by - 22, 4), 132), 8, 44);
      ctx.fillRect(298, Math.min(Math.max(by - 22 + Math.sin(time * 2) * 18, 4), 132), 8, 44);
      ctx.fillRect(bx - 5, by - 5, 10, 10);
      tex.needsUpdate = true;
    };
    const black = plastic("#16181d", 0.42, { clearcoat: 0.3, clearcoatRoughness: 0.3 });
    const alu = metal("#c4c8cd", 0.34);
    const mon = new THREE.Group();
    mon.position.set(-0.08, 0, -0.2);
    mon.add(at(rbox(0.2, 0.012, 0.13, 0.005, alu), 0, 0.006, 0));
    mon.add(at(rbox(0.04, 0.17, 0.016, 0.006, alu), 0, 0.09, -0.03));
    mon.add(at(rbox(0.54, 0.32, 0.03, 0.01, black), 0, 0.3, 0));
    mon.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.524, 0.29), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })), 0, 0.302, 0.0155));
    const [rx, rtex] = canvasTex(128, 64);
    const grad = rx.createRadialGradient(64, 32, 4, 64, 32, 64);
    grad.addColorStop(0, "rgba(255,255,255,1)"); grad.addColorStop(1, "rgba(255,255,255,0)");
    rx.fillStyle = grad; rx.fillRect(0, 0, 128, 64); rtex.needsUpdate = true;
    const rgbMat = new THREE.MeshBasicMaterial({ map: rtex, color: "#7a5cff", transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    g.add(noShadow(at(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.46), rgbMat), -0.08, 0.32, -0.27)));
    g.add(mon);
    g.add(at(blob(0.24, 0.16), -0.08, 0.002, -0.2));
    // a low mechanical keyboard
    const kb = new THREE.Group();
    kb.position.set(-0.1, 0, 0.0);
    kb.add(at(rbox(0.34, 0.016, 0.11, 0.005, plastic("#22252b", 0.4)), 0, 0.008, 0));
    kb.add(at(keysMesh(15, 4, 0.32, 0.092, [0.0175, 0.008, 0.0175], plastic("#2e323a", 0.38, { clearcoat: 0.4 })), 0, 0.016, 0));
    g.add(kb, at(blob(0.42, 0.18), -0.1, 0.002, 0));
    const glowL = new THREE.PointLight("#6c96ff", 0, 0.9, 1.6);
    scene.add(glowL);
    // the controller: DualShock outline, extruded and bevelled
    const s = new THREE.Shape();
    s.moveTo(0, 0.052); s.lineTo(0.07, 0.052);
    s.bezierCurveTo(0.115, 0.054, 0.135, 0.04, 0.138, 0.012);
    s.bezierCurveTo(0.142, -0.03, 0.14, -0.075, 0.122, -0.098);
    s.bezierCurveTo(0.108, -0.115, 0.082, -0.112, 0.074, -0.092);
    s.bezierCurveTo(0.066, -0.07, 0.058, -0.045, 0.045, -0.04);
    s.lineTo(-0.045, -0.04);
    s.bezierCurveTo(-0.058, -0.045, -0.066, -0.07, -0.074, -0.092);
    s.bezierCurveTo(-0.082, -0.112, -0.108, -0.115, -0.122, -0.098);
    s.bezierCurveTo(-0.14, -0.075, -0.142, -0.03, -0.138, 0.012);
    s.bezierCurveTo(-0.135, 0.04, -0.115, 0.054, -0.07, 0.052);
    s.lineTo(0, 0.052);
    const shellGeo = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.011, bevelSegments: 6, curveSegments: 28 });
    shellGeo.rotateX(-Math.PI / 2);
    const pad = new THREE.Group();
    pad.position.set(0.08, 0.001, 0.13);
    pad.rotation.set(0, -0.25, 0);
    pad.scale.set(0.72, 0.8, 0.7);
    const shell = plastic("#1d1f25", 0.48, { clearcoat: 0.25, clearcoatRoughness: 0.35 });
    pad.add(at(new THREE.Mesh(shellGeo, shell), 0, 0.012, 0));
    const TOP = 0.044;
    pad.add(at(rbox(0.074, 0.006, 0.042, 0.003, gloss("#24272e", { roughness: 0.18 })), 0, TOP, -0.026));
    const bar = at(rbox(0.07, 0.008, 0.006, 0.003, phys({ color: "#4a8dff", emissive: "#3f7dff", emissiveIntensity: 1.2, roughness: 0.3 })), 0, 0.03, -0.064);
    pad.add(bar);
    for (const x of [-1, 1]) pad.add(at(rbox(0.05, 0.014, 0.02, 0.006, shell), x * 0.098, 0.034, -0.058));
    // thumbsticks: a neck, a concave rubber cap with a grip ring
    const stickTop = rubber("#2a2d33");
    for (const x of [-0.034, 0.034]) {
      pad.add(at(cyl(0.0095, 0.012, 0.012, shell, 24), x, TOP + 0.004, 0.013));
      pad.add(at(cyl(0.015, 0.015, 0.006, stickTop, 32), x, TOP + 0.012, 0.013));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0135, 0.0025, 8, 32), stickTop);
      ring.rotation.x = Math.PI / 2;
      pad.add(at(ring, x, TOP + 0.015, 0.013));
    }
    const dpad = gloss("#2a2d33", { roughness: 0.3 });
    for (const [dx2, dz] of [[0, -0.012], [0, 0.012], [-0.012, 0], [0.012, 0]]) pad.add(at(rbox(0.011, 0.006, 0.011, 0.002, dpad), -0.088 + dx2, TOP + 0.001, -0.012 + dz));
    const btns = [["#3fd0a6", 0, -0.014], ["#ff6b8a", 0.014, 0], ["#7fa7ff", 0, 0.014], ["#e5a3ff", -0.014, 0]].map(([c, dx2, dz]) => {
      const b = at(cyl(0.0068, 0.0068, 0.006, gloss("#2a2d33", { roughness: 0.2 }), 24), 0.088 + dx2, TOP + 0.002, -0.012 + dz);
      const sym = new THREE.Mesh(new THREE.TorusGeometry(0.0034, 0.0007, 6, 20), new THREE.MeshBasicMaterial({ color: c }));
      sym.rotation.x = Math.PI / 2;
      b.add(at(sym, 0, 0.0031, 0));
      pad.add(b);
      return b;
    });
    g.add(pad);
    const padShadow = at(blob(0.27, 0.17), 0.08, 0.002, 0.13);
    g.add(padShadow);
    // game cases, stacked: glossy sleeves, a white spine
    [["#9c5a3c", 0], ["#3d5a9e", 0.014], ["#2c7f74", 0.028]].forEach(([c, y], i) => {
      const cs = new THREE.Group();
      cs.position.set(-0.34, 0.0065 + y, 0.15);
      cs.rotation.y = 0.2 - i * 0.12;
      cs.add(rbox(0.13, 0.013, 0.17, 0.003, gloss(c, { roughness: 0.25 })));
      cs.add(at(box(0.004, 0.0132, 0.168, plastic("#f2f2ef", 0.4)), -0.064, 0, 0));
      g.add(cs);
    });
    g.add(at(blob(0.2, 0.24), -0.34, 0.002, 0.15));
    // the headphones on their stand: brown leather band, metal sliders, black cups, a cable
    const st = new THREE.Group();
    st.position.set(0.31, 0, 0.02);
    st.add(at(cyl(0.05, 0.055, 0.012, alu, 48), 0, 0.006, 0));
    st.add(at(cyl(0.0065, 0.0065, 0.25, alu, 16), 0, 0.13, 0));
    st.add(at(rbox(0.07, 0.01, 0.03, 0.004, alu), 0, 0.258, 0));
    const hp = new THREE.Group();
    hp.position.set(0, 0.178, 0);
    const leather = phys({ color: "#7a4a2a", roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.5, bumpMap: microTex, bumpScale: 1.5 });
    const arc = new THREE.CatmullRomCurve3([[-0.074, -0.01], [-0.07, 0.04], [-0.045, 0.074], [0, 0.088], [0.045, 0.074], [0.07, 0.04], [0.074, -0.01]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
    const band = new THREE.Mesh(new THREE.TubeGeometry(arc, 48, 0.0075, 10), leather);
    band.scale.set(1, 1, 1.9);
    hp.add(band);
    const cupMat = plastic("#1b1c20", 0.4, { clearcoat: 0.4 });
    for (const sgn of [-1, 1]) {
      hp.add(at(box(0.004, 0.034, 0.012, metal("#cfd2d6", 0.25)), sgn * 0.074, -0.022, 0));
      const cup = new THREE.Group();
      cup.position.set(sgn * 0.078, -0.06, 0);
      const c = cyl(0.036, 0.034, 0.02, cupMat, 40);
      c.rotation.z = Math.PI / 2;
      cup.add(c);
      const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0105, 12, 40), rubber("#121316"));
      cushion.rotation.y = Math.PI / 2;
      cup.add(at(cushion, -sgn * 0.014, 0, 0));
      const ringM = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.0018, 6, 40), metal("#d9a86a", 0.3));
      ringM.rotation.y = Math.PI / 2;
      cup.add(at(ringM, sgn * 0.0102, 0, 0));
      hp.add(cup);
    }
    st.add(hp);
    const cable = new THREE.CatmullRomCurve3([[-0.078, 0.1, 0.0], [-0.09, 0.05, 0.04], [-0.07, 0.006, 0.09], [-0.01, 0.004, 0.13], [0.05, 0.004, 0.11]].map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    st.add(new THREE.Mesh(new THREE.TubeGeometry(cable, 48, 0.0022, 6), rubber("#16171a")));
    const jack = cyl(0.004, 0.004, 0.022, metal("#d9b46a", 0.25), 12);
    jack.rotation.z = Math.PI / 2;
    st.add(at(jack, 0.062, 0.004, 0.11));
    g.add(st);
    g.add(at(blob(0.14, 0.14), 0.31, 0.002, 0.02));
    return {
      rest() { draw(1.3); pad.position.y = 0.001; pad.rotation.z = 0; btns.forEach((b) => (b.position.y = TOP + 0.002)); glowL.intensity = 0; rgbMat.color.set("#7a5cff"); rgbMat.opacity = 0.25; hp.rotation.z = 0; },
      idle(t) { draw(t * 0.3); },
      update(p, time, dt, glow) {
        draw(time);
        glowL.position.set(outer.position.x - 0.1, outer.position.y + 0.36, 0.08);
        glowL.intensity = 1.1 * glow;
        rgbMat.color.setHSL((time * 0.12) % 1, 0.85, 0.6);
        rgbMat.opacity = 0.25 + 0.4 * glow;
        glowL.color.copy(rgbMat.color);
        bar.material.emissive.copy(rgbMat.color);
        const lift = bump(p, 0, 1);
        pad.position.y = 0.001 + lift * 0.05;
        pad.rotation.z = Math.sin(time * 38) * 0.02 * lift;
        padShadow.material.opacity = 1 - lift * 0.5;
        btns.forEach((b, i) => (b.position.y = TOP + 0.002 - (Math.sin(time * 9 + i * 1.6) > 0.7 ? 0.0025 : 0)));
        hp.rotation.z = Math.sin(time * 2.2) * 0.06 * lift;
      },
      off() { glowL.intensity = 0; },
    };
  });

  // 6 Nerd: a bed-slinger printer after the Bambu A1 mini (one column, a cantilevered arm, the bed
  // slides front to back, the spool on top, a PTFE tube to the head) builds an orange vase with
  // visible layer lines; Claude types on a dark aluminium laptop
  slot("nerd", "in", 1.05, 6, (g) => {
    const shell = plastic("#eceef1", 0.42, { clearcoat: 0.2 });
    const dark = plastic("#2a2d33", 0.5);
    const rod = metal("#d5d9de", 0.18);
    const pr = new THREE.Group();
    pr.position.set(0.08, 0, -0.06);
    pr.add(at(rbox(0.42, 0.07, 0.34, 0.02, shell), 0, 0.035, 0));
    pr.add(at(rbox(0.07, 0.04, 0.006, 0.004, gloss("#0f1218", { roughness: 0.1 })), 0.13, 0.04, 0.171));
    const led = phys({ color: "#3fc1a7", emissive: "#3fc1a7", emissiveIntensity: 0.4 });
    pr.add(at(sph(0.006, led, 12, 8), 0.175, 0.04, 0.172));
    // the bed slides in z: a textured gold PEI sheet on a dark carrier
    const bed = new THREE.Group();
    bed.position.set(0.03, 0.074, 0);
    bed.add(at(rbox(0.27, 0.01, 0.27, 0.004, dark), 0, -0.002, 0));
    bed.add(at(box(0.25, 0.003, 0.25, phys({ color: "#b8954f", roughness: 0.62, metalness: 0.35, bumpMap: microTex, bumpScale: 3 })), 0, 0.004, 0));
    // the part: orange PLA with layer lines
    const [lx2, layerTex] = canvasTex(4, 256, false);
    for (let y = 0; y < 256; y += 2) { lx2.fillStyle = y % 4 ? "#fff" : "#9a9a9a"; lx2.fillRect(0, y, 4, 2); }
    layerTex.needsUpdate = true;
    layerTex.wrapS = layerTex.wrapT = THREE.RepeatWrapping;
    layerTex.repeat.set(1, 2);
    const part = lathe([[0, 0], [0.055, 0], [0.055, 0.01], [0.042, 0.05], [0.032, 0.1], [0.042, 0.15], [0.052, 0.19], [0.047, 0.21], [0, 0.21]], phys({ color: "#2c8c80", roughness: 0.38, clearcoat: 0.3, bumpMap: layerTex, bumpScale: 1.2 }));
    part.position.y = 0.006;
    bed.add(part);
    pr.add(bed);
    // the column with its rods, the arm reaching right
    pr.add(at(rbox(0.05, 0.6, 0.05, 0.012, shell), -0.18, 0.33, -0.12));
    for (const dz of [-0.012, 0.012]) pr.add(at(cyl(0.004, 0.004, 0.56, rod, 12), -0.152, 0.34, -0.12 + dz));
    pr.add(at(rbox(0.055, 0.02, 0.055, 0.006, dark), -0.18, 0.635, -0.12));
    const arm = new THREE.Group();
    arm.add(at(rbox(0.36, 0.04, 0.045, 0.01, shell), 0.0, 0, -0.12));
    arm.add(at(cyl(0.004, 0.004, 0.34, rod, 12), 0, -0.024, -0.096).rotateZ(Math.PI / 2));
    arm.add(at(rbox(0.06, 0.06, 0.06, 0.01, dark), -0.18, 0, -0.12));
    const head = new THREE.Group();
    head.add(at(rbox(0.07, 0.08, 0.06, 0.014, shell), 0, -0.01, -0.07));
    for (let k = 0; k < 4; k++) head.add(at(rbox(0.04, 0.004, 0.003, 0.0012, dark), 0, 0.012 - k * 0.009, -0.0398));
    head.add(at(cyl(0.01, 0.002, 0.022, metal("#c8a050", 0.3), 16), 0, -0.061, -0.07));
    const hot = at(sph(0.004, phys({ color: "#ffb000", emissive: "#ff8a00", emissiveIntensity: 0 }), 12, 8), 0, -0.074, -0.07);
    head.add(hot);
    arm.add(head);
    pr.add(arm);
    // the spool on top: orange filament wound between grey flanges
    const spool = new THREE.Group();
    spool.position.set(-0.18, 0.672, -0.12);
    spool.rotation.y = Math.PI / 2; // side-on: the wound filament faces the room
    const [wx, windTex] = canvasTex(256, 32);
    for (let x = 0; x < 256; x += 2) { wx.fillStyle = x % 4 ? "#2c8c80" : "#237268"; wx.fillRect(x, 0, 2, 32); }
    windTex.needsUpdate = true;
    windTex.wrapS = THREE.RepeatWrapping; windTex.repeat.set(3, 1);
    const sp = cyl(0.064, 0.064, 0.046, phys({ map: windTex, roughness: 0.35, clearcoat: 0.4 }), 64);
    sp.rotation.x = Math.PI / 2;
    spool.add(sp);
    const hub = cyl(0.022, 0.022, 0.06, plastic("#f5f5f2", 0.4));
    hub.rotation.x = Math.PI / 2;
    spool.add(hub);
    for (const z of [-0.026, 0.026]) { const f = cyl(0.074, 0.074, 0.004, phys({ color: "#3a3f47", roughness: 0.12, transparent: true, opacity: 0.55, depthWrite: false }), 64); f.rotation.x = Math.PI / 2; spool.add(at(f, 0, 0, z)); }
    pr.add(spool);
    pr.add(at(rbox(0.012, 0.03, 0.012, 0.003, dark), -0.18, 0.65, -0.12));
    const tubeMat = plastic("#eef1f4", 0.3, { clearcoat: 0.5 });
    let tube = null;
    const reTube = () => {
      const a = new THREE.Vector3(-0.15, 0.66, -0.1), h = new THREE.Vector3(head.position.x, arm.position.y + 0.03, -0.07);
      const c = new THREE.CatmullRomCurve3([a, new THREE.Vector3(-0.08, 0.7, -0.06), new THREE.Vector3((a.x + h.x) / 2 + 0.06, Math.min(Math.max(h.y, 0.4) + 0.12, 0.68), -0.04), h]);
      if (tube) { pr.remove(tube); tube.geometry.dispose(); }
      tube = new THREE.Mesh(new THREE.TubeGeometry(c, 32, 0.0045, 8), tubeMat);
      pr.add(tube);
    };
    g.add(pr);
    g.add(at(blob(0.5, 0.42), 0.08, 0.002, -0.06));
    // the laptop with a terminal
    const [tc, ttex] = canvasTex(320, 200);
    const cmd = 'claude "Report"';
    const term = (n, done, blink) => {
      tc.fillStyle = "#0d1117"; tc.fillRect(0, 0, 320, 200);
      tc.font = "bold 30px monospace"; tc.textAlign = "left";
      tc.fillStyle = "#9fb0c3"; tc.fillText("$", 18, 52);
      tc.fillStyle = "#e6edf5"; tc.fillText(cmd.slice(0, n), 44, 52);
      if (done) { tc.fillStyle = "#3fc1a7"; tc.fillText("✓", 18, 100); tc.fillStyle = "#e6edf5"; tc.fillText("fertig", 48, 100); }
      if (blink) { tc.fillStyle = "#e6edf5"; tc.fillRect(done ? 18 : 44 + n * 18, done ? 118 : 32, 13, 24); }
      ttex.needsUpdate = true;
    };
    const lap = new THREE.Group();
    lap.position.set(-0.25, 0, 0.12);
    lap.rotation.y = 0.5;
    lap.scale.setScalar(1.3);
    const casing = metal("#5c6169", 0.4, { metalness: 0.85 });
    lap.add(at(rbox(0.24, 0.011, 0.16, 0.004, casing), 0, 0.0055, 0));
    lap.add(at(keysMesh(13, 5, 0.2, 0.072, [0.0128, 0.002, 0.0118], plastic("#15171b", 0.5)), 0, 0.0108, -0.025));
    lap.add(at(rbox(0.08, 0.001, 0.045, 0.002, metal("#666b73", 0.25, { metalness: 0.8 })), 0, 0.0112, 0.045));
    const lid = new THREE.Group();
    lid.position.set(0, 0.011, -0.078);
    lid.rotation.x = -0.32;
    lid.add(at(rbox(0.24, 0.15, 0.006, 0.004, casing), 0, 0.075, -0.001));
    lid.add(at(box(0.236, 0.146, 0.001, gloss("#0b0c0f", { roughness: 0.08 })), 0, 0.075, 0.0025));
    lid.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.128), new THREE.MeshBasicMaterial({ map: ttex, toneMapped: false })), 0, 0.077, 0.0032));
    lap.add(lid);
    g.add(lap);
    g.add(at(blob(0.36, 0.28), -0.25, 0.002, 0.12));
    const set = (prog, hx, bz) => {
      part.scale.y = Math.max(prog, 0.001);
      layerTex.repeat.y = 2 * Math.max(prog, 0.05);
      arm.position.y = 0.074 + 0.006 + prog * 0.21 + 0.085;
      head.position.x = hx;
      bed.position.z = bz;
      reTube();
    };
    return {
      rest() { set(0.45, 0.03, 0); term(cmd.length, true, true); hot.material.emissiveIntensity = 0; },
      idle(t) { led.emissiveIntensity = 0.5 + Math.sin(t * 2.4) * 0.45; },
      update(p, time, dt) {
        const printing = p < 0.82;
        const prog = printing ? 0.02 + 0.98 * clamp01(p / 0.82) : p < 0.94 ? 1 : 1 - seg(p, 0.94, 1);
        set(prog, 0.03 + (printing ? Math.sin(time * 9) * 0.045 : 0), printing ? Math.sin(time * 6.3) * 0.04 : 0);
        hot.material.emissiveIntensity = printing ? 3 : 0;
        led.emissiveIntensity = printing ? 1.6 : 0.5;
        spool.rotation.z -= dt * (printing ? 2.4 : 0);
        const n = Math.round(clamp01((p - 0.05) / 0.3) * cmd.length);
        term(n, p > 0.42, Math.floor(time * 2.2) % 2 === 0);
      },
    };
  });

  scene.traverse((o) => {
    if (!o.isMesh || o.userData.noShadow || o.material.visible === false || o.material.transparent || o.material.blending === THREE.AdditiveBlending) return;
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
  const fit = (halfW, halfH) => {
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return Math.max(halfH / tan, halfW / (tan * camera.aspect));
  };
  function setLayout(k) {
    if (k === layoutKey) return;
    layoutKey = k;
    L = LAYOUTS[k];
    W = L.cols * CW + (L.cols + 1) * T;
    H = L.rows * CH + (L.rows + 1) * T;
    stage.style.aspectRatio = k === "tall" ? "4 / 5" : "16 / 10.5";
    buildShelf();
    placeItems();
  }
  function resize() {
    setLayout(stage.clientWidth < 560 ? "tall" : "wide");
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    baseZ = fit(W / 2 + 0.15, H / 2 + 0.2) + D / 2;
    kick();
  }

  // ---------- state ----------
  let hovered = null, focused = null, pinned = [], intro = new Set();
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  const litIds = () => (focused ? [focused] : hovered ? [hovered] : pinned);
  function sync() {
    const lit = litIds();
    for (const it of items) it.on = lit.includes(it.id) || intro.has(it.id);
    rows.forEach((r) => r.classList.toggle("is-on", lit.includes(r.dataset.id)));
    listEl.classList.toggle("has-on", lit.length > 0);
    stage.classList.toggle("is-hover", !!hovered && !focused);
    stage.classList.toggle("is-focus", !!focused);
    kick();
  }
  let lastFocus = null;
  const focusOn = (id) => {
    if (id) lastFocus = id;
    focused = id;
    const row = document.activeElement?.closest?.(".row") || listEl.querySelector(".row:hover");
    hovered = !id && row ? row.dataset.id : null;
    sync();
  };

  // ---------- pointer ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pick = (e) => {
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
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !focused) return;
    const inStage = stage.contains(document.activeElement);
    focusOn(null);
    if (inStage) rows.find((r) => r.dataset.id === lastFocus)?.focus({ preventScroll: true });
  });
  for (const r of rows) {
    const id = r.dataset.id;
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
    const mode = e.detail;
    pinned = mode === "all" ? [] : items.filter((i) => i.side === mode).map((i) => i.id);
    sync();
  });

  // ---------- the loop: full speed while something moves, a slow tick for the idle life ----------
  let raf = 0, idleTimer = 0, last = performance.now(), clock = 0, visible = false, ready = false;
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
  function frame(now) {
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
      const dist = fit(0.6, 0.48) + D / 2;
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
        if (!it.on && Math.floor(it.time) > Math.floor(before)) { it.time = 0; it.running = false; it.api.rest(); it.api.off?.(); }
        else it.api.update(it.time % 1, clock, dt, it.glow);
      } else if (!reduce) it.api.idle?.(clock, dt);
      const tag = tags.get(it.id);
      const showTag = (it.id === hovered && !focused) || it.id === focused;
      tag.classList.toggle("is-on", showTag);
      if (showTag) {
        v.set(it.g.position.x, it.g.position.y + 0.03, D / 2).project(camera);
        tag.style.transform = `translate(${(v.x * 0.5 + 0.5) * stage.clientWidth}px, ${Math.min((-v.y * 0.5 + 0.5) * stage.clientHeight, stage.clientHeight - 20)}px) translate(-50%, -60%)`;
      }
    }
    renderer.render(scene, camera);
    if (!ready) { ready = true; stage.classList.add("is-ready"); }
    if (!visible) return;
    if (busy) raf = requestAnimationFrame(frame);
    else if (!reduce) idleTimer = setTimeout(() => { idleTimer = 0; raf = requestAnimationFrame(frame); }, 45);
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
    items, sync, renderer, focus: focusOn,
    hover: (id) => { hovered = id; sync(); },
    pose: (id, p) => { const it = items.find((i) => i.id === id); it.on = true; it.glow = 1; it.lamp.intensity = 1.3; it.bulbMat.emissiveIntensity = 3; it.coneMat.opacity = 0.03; it.poolMat.opacity = 0.32; it.api.update(p, p * it.dur, 0.016, 1); renderer.render(scene, camera); },
  };

}

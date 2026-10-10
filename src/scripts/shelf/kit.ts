// The shelf's materials and modelling helpers, shared by the shelf and every compartment.
// v4: one material per real surface, no shared clay grain. makeKit(renderer) builds the
// textures once per shelf (canvas textures take the GPU's anisotropy).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// the shelf's measures (world units): board thickness, cell width/height, depth, fillet radius
export const T = 0.1, CW = 1, CH = 0.8, D = 0.74, R = 0.075;

type Mat = THREE.Material | THREE.Material[];
type PhysOpts = THREE.MeshPhysicalMaterialParameters;
type Color = THREE.ColorRepresentation;
/** a sphere painter: the direction d → colour o[0..2] and bump o[3] (0-255), at pixel i, j */
type SpherePaint = (d: THREE.Vector3, o: number[], i: number, j: number) => void;

export type Kit = ReturnType<typeof makeKit> & { scene?: THREE.Scene };

export function makeKit(renderer: THREE.WebGLRenderer) {
  const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy(), 16);
  const canvasTex = (w: number, h: number, srgb = true): [CanvasRenderingContext2D, THREE.CanvasTexture] => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return [c.getContext("2d")!, t];
  };
  // the same at k times the pixels, drawn in the original coordinates (labels, screens, prints
  // that the zoom brings close)
  const canvasTex2 = (w: number, h: number, k = 2): [CanvasRenderingContext2D, THREE.CanvasTexture] => {
    const [x, t] = canvasTex(w * k, h * k);
    x.scale(k, k);
    return [x, t];
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
  const phys = (o: PhysOpts) => new THREE.MeshPhysicalMaterial({ roughnessMap: microTex, bumpMap: microTex, bumpScale: 0, clearcoat: 0.001, ...o });
  const plastic = (color: Color, roughness = 0.5, o: PhysOpts = {}) => phys({ color, roughness, metalness: 0, ...o });
  const gloss = (color: Color, o: PhysOpts = {}) => phys({ color, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08, ...o });
  const metal = (color: Color, roughness = 0.32, o: PhysOpts = {}) => phys({ color, roughness, metalness: 1, ...o });
  const rubber = (color: Color, o: PhysOpts = {}) => phys({ color, roughness: 0.92, ...o });
  // the shelf and other painted parts: satin lacquer
  const clay = (color: Color, o: PhysOpts = {}) => phys({ color, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.45, ...o });
  const INK = "#1b2638";
  const ink = plastic(INK, 0.55);
  const rbox = <M extends Mat>(w: number, h: number, d: number, r: number, mat: M) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
  const box = <M extends Mat>(w: number, h: number, d: number, mat: M) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const cyl = <M extends Mat>(rt: number, rb: number, h: number, mat: M, seg = 32) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  const sph = <M extends Mat>(r: number, mat: M, ws = 48, hs = 32) => new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat);
  const at = <O extends THREE.Object3D>(m: O, x: number, y: number, z: number) => (m.position.set(x, y, z), m);
  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  const smooth = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const backOut = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
  const seg = (p: number, a: number, b: number) => ease(clamp01((p - a) / (b - a)));
  const bump = (p: number, a: number, b: number) => (p > a && p < b ? Math.sin((Math.PI * (p - a)) / (b - a)) : 0);
  const lathe = <M extends Mat>(pts: number[][], mat: M, n = 64) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), n), mat);
  const noShadow = <O extends THREE.Object3D>(o: O) => (o.traverse((c) => (c.userData.noShadow = true)), o);
  const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  // paint a sphere's equirectangular colour + bump maps from a function of the direction
  const sphereTex = (w: number, h: number, fn: SpherePaint) => {
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
  const blob = (w: number, d: number, opacity = 1) => {
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
  const netMat = (rx: number, ry: number) => {
    const t = netTex.clone();
    t.needsUpdate = true;
    t.repeat.set(rx, ry);
    return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.95 });
  };
  // strings between points, merged into one mesh (nets, wires)
  const strings = (pairs: THREE.Vector3[][], r: number, mat: Mat) => {
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
  const keysMesh = (cols: number, rows: number, w: number, d: number, key: number[], mat: Mat) => {
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
  const basketTex = (base: number[], w = 1024) => sphereTex(w, w / 2, (d, o, i, j) => {
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
  return { canvasTex, canvasTex2, microTex, phys, plastic, gloss, metal, rubber, clay, INK, ink, rbox, box, cyl, sph, at, clamp01, smooth, ease, backOut, seg, bump, lathe, noShadow, hash, sphereTex, blobTex, blob, netTex, netMat, strings, keysMesh, basketTex };
}

/** one compartment of the shelf (compartments/*.js) */
export type Compartment = {
  id: string;
  side: "out" | "in"; // Draußen or Drinnen
  scale: number;
  dur: number; // seconds per play
  build: (g: THREE.Group, outer: THREE.Group, sc: number, kit: Kit) => CompartmentApi;
};
/** what a compartment's build() returns: its poses and its animation */
export type CompartmentApi = {
  rest(): void; // the still pose
  update(p: number, time: number, dt: number, glow: number): void; // p: 0-1 through one play
  idle?(time: number, dt: number): void; // the quiet life while unlit
  off?(): void; // after the last play (lights out)
};

// The shelf itself: boards, the moulded inner corners, baked ambient occlusion per compartment.
// Rebuilt whenever the layout changes (wide 3x2 or tall 2x3).
import * as THREE from "three";
import { T, CW, CH, D, R, type Kit } from "./kit";

export type Layout = { cols: number; rows: number; at: Record<string, [number, number]> };
export const LAYOUTS: Record<"wide" | "tall", Layout> = {
  wide: { cols: 3, rows: 2, at: { fussball: [0, 0], trainer: [1, 0], basketball: [2, 0], ausgehen: [0, 1], gaming: [1, 1], nerd: [2, 1] } },
  tall: { cols: 2, rows: 3, at: { fussball: [0, 0], trainer: [1, 0], basketball: [0, 1], ausgehen: [1, 1], gaming: [0, 2], nerd: [1, 2] } },
};

/** the shelf's outer size for a layout */
export const sizeOf = (L: Layout) => ({ W: L.cols * CW + (L.cols + 1) * T, H: L.rows * CH + (L.rows + 1) * T });
/** a column's centre and a row's floor, for a shelf of size W x H */
export const cellX = (c: number, W: number) => -W / 2 + T + CW / 2 + c * (CW + T);
export const floorY = (r: number, H: number) => H / 2 - T - CH - r * (CH + T);

export function makeFrame(k: Kit) {
  const { canvasTex, microTex, clay, ink, rbox, box, at, blob, blobTex, noShadow } = k;
  // a fine clay grain on the shelf: the micro texture, tiled small
  const grainTex = microTex.clone();
  grainTex.repeat.set(6, 6);
  grainTex.needsUpdate = true;
  // the "Ton" shelf (owner's pick from the mockup's Ton / Stahl / Eiche switch): board and
  // corner radii, moulded inner corners, the lacquer, the back panel
  const S = { r: 0.045, rd: 0.04, fillet: true, mat: clay("#ece7e1", { roughness: 0.62, bumpMap: grainTex, bumpScale: 0.6, clearcoat: 0.15 }), back: clay("#e2dcd5", { roughness: 0.66, bumpMap: grainTex, bumpScale: 0.6, clearcoat: 0.1 }) };
  // baked ambient occlusion: dark edges on each back wall, a darker strip along the back of each floor
  const aoWall = (() => {
    const [x, t] = canvasTex(256, 256);
    x.clearRect(0, 0, 256, 256);
    const edge = (gx0: number, gy0: number, gx1: number, gy1: number) => { const gr = x.createLinearGradient(gx0, gy0, gx1, gy1); gr.addColorStop(0, "rgba(40,30,20,0.55)"); gr.addColorStop(1, "rgba(40,30,20,0)"); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); };
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
  const aoMat = (map: THREE.Texture, o: number) => new THREE.MeshBasicMaterial({ map, transparent: true, opacity: o, depthWrite: false });
  const fillet = (() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(R, 0); s.absarc(R, R, R, -Math.PI / 2, Math.PI, true); s.lineTo(0, 0);
    return new THREE.ExtrudeGeometry(s, { depth: D - 0.06, bevelEnabled: false, curveSegments: 10 });
  })();
  /** frees what build() made for one layout (the shared fillet and textures stay) */
  const dispose = (shelf: THREE.Group) =>
    shelf.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      if (o.geometry !== fillet) o.geometry.dispose();
      const m = o.material as THREE.MeshBasicMaterial;
      if (m.map === aoWall || m.map === aoFloor || m.map === blobTex) m.dispose();
    });
  /** the shelf for layout L (LAYOUTS), W x H (sizeOf) */
  const build = (L: Layout, W: number, H: number) => {
    const cellX_ = (c: number) => cellX(c, W), floorY_ = (r: number) => floorY(r, H);
    const shelf = new THREE.Group();
    const shelfMat = S.mat;
    shelf.add(at(box(W - 0.02, H - 0.02, 0.05, S.back), 0, 0, -D / 2 + 0.025));
    for (let r = 0; r <= L.rows; r++) shelf.add(at(rbox(W, T, D, S.r, shelfMat), 0, H / 2 - T / 2 - r * (CH + T), 0));
    for (const x of [-W / 2 + T / 2, W / 2 - T / 2]) shelf.add(at(rbox(T, H, D, S.r, shelfMat), x, 0, 0));
    // inner dividers per row; the top row's first two cells are one bay ("Platz")
    const cells: [number, number][] = [];
    for (let r = 0; r < L.rows; r++) {
      for (let d = 1; d < L.cols; d++) {
        if (r === 0 && d === 1) continue;
        shelf.add(at(rbox(T, CH + (S.fillet ? 0.04 : 0.002), D, S.rd, shelfMat), -W / 2 + T / 2 + d * (CW + T), floorY_(r) + CH / 2, 0));
      }
      if (r === 0) cells.push([cellX_(0) - CW / 2, cellX_(1) + CW / 2]);
      for (let c = r === 0 ? 2 : 0; c < L.cols; c++) cells.push([cellX_(c) - CW / 2, cellX_(c) + CW / 2]);
      for (const [x0, x1] of cells.splice(0)) {
        const y0 = floorY_(r), y1 = y0 + CH;
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
    shelf.traverse((o) => { if (o instanceof THREE.Mesh && !o.userData.noShadow) { o.castShadow = true; o.receiveShadow = true; } });
    return shelf;
  };
  return { build, dispose };
}

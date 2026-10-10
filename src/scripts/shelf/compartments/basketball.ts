// Basketball: an over-the-door mini hoop on the back wall, a pebbled ball with grooves,
// a corded diamond net, spare balls, a scoreboard that counts the basket
import * as THREE from "three";
import type { Compartment } from "../kit";
import { D } from "../kit";

export default {
  id: "basketball",
  side: "out", // "out" (Draußen) or "in" (Drinnen)
  scale: 1.1,
  dur: 2.8, // seconds per play
  // g: the scaled inner group, outer: the compartment's group, sc: the scale, kit: makeKit()
  build(g, _outer, _sc, kit) {
    const { canvasTex2, phys, plastic, gloss, metal, rubber, rbox, box, sph, at, clamp01, seg, bump, noShadow, blob, strings, basketTex } = kit;
    const BZ = -D / 2 / 1.1 + 0.02;
    // backboard: clear-coated white board with the printed red frame and shooter's square
    const [hx, htex] = canvasTex2(380, 250);
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
    const N = 14, LV = 4, P = (i: number, l: number) => {
      const a = ((i + l * 0.5) / N) * Math.PI * 2, rr = RR - 0.003 - l * 0.007, y = -l * 0.034;
      return new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr);
    };
    const pairs = [];
    for (let l = 0; l < LV; l++) for (let i = 0; i < N; i++) { pairs.push([P(i, l), P(i, l + 1)], [P(i, l), P(i - 1, l + 1)]); }
    const net = noShadow(at(strings(pairs, 0.0024, rubber("#f6f6f2")), RIM.x, RIM.y - 0.004, RIM.z));
    g.add(net);
    // the balls
    const ballMat = (rgb: number[], w: number) => { const t = basketTex(rgb, w); return phys({ map: t.map, bumpMap: t.bumpMap, bumpScale: 2.2, roughness: 0.72 }); };
    const mainMat = ballMat([186, 82, 32], 768);
    for (const [rgb, x, z, r] of [[[61, 90, 158], 0.37, 0.04, 0.05], [[180, 83, 42], 0.3, 0.22, 0.046]] as [number[], number, number, number][]) {
      const b = at(sph(r, ballMat(rgb, 384), 48, 32), x, r, z);
      b.rotation.set(0.6, x * 4, 0.3);
      g.add(b, at(blob(r * 3, r * 3), x, 0.002, z));
    }
    // the scoreboard, standing on the floor at the left back
    const [sx, stex] = canvasTex2(128, 64, 3);
    let score = 24;
    const drawScore = (n: number) => {
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
    const put = (v: THREE.Vector3, sx2 = 1, sy = 1) => {
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
  },
} satisfies Compartment;

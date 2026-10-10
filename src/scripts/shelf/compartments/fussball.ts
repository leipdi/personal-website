// Fußball: one mown pitch across the "Platz" bay; a classic stitched ball winds up, flies in,
// squashes on the net (reference: classic black-and-white 32-panel ball)
import * as THREE from "three";
import type { Compartment } from "../kit";
import { T, CW } from "../kit";

export default {
  id: "fussball",
  side: "out", // "out" (Draußen) or "in" (Drinnen)
  scale: 1.18,
  dur: 2.8, // seconds per play
  // g: the scaled inner group, outer: the compartment's group, sc: the scale, kit: makeKit()
  build(g, _outer, sc, kit) {
    const { canvasTex2, microTex, phys, plastic, rubber, rbox, cyl, sph, at, clamp01, smooth, backOut, seg, bump, lathe, noShadow, hash, sphereTex, blob, netMat } = kit;
    const MAT = 0.026;
    const powder = plastic("#f5f5f1", 0.32, { clearcoat: 0.6, clearcoatRoughness: 0.2 });
    // the pitch spans the whole bay (this cell and the trainer's), in world units
    const PW = 2 * CW + T - 0.08, PD = 0.6;
    const [px, ptex] = canvasTex2(1024, 300);
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
    const bar = (len: number, x: number, y: number, z: number, rot?: "x" | "z") => { const b = at(cyl(0.011, 0.011, len, powder, 20), x, y, z); if (rot === "z") b.rotation.z = Math.PI / 2; if (rot === "x") b.rotation.x = Math.PI / 2; goal.add(b); };
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
    const bulge = (b: number) => {
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
    const wave = (t: number, amp: number) => {
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
      const ico = new THREE.IcosahedronGeometry(1, 0).attributes.position, verts: THREE.Vector3[] = [], faces: THREE.Vector3[] = [];
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
    const put = (x: number, y: number, z: number, sx = 1, sy = 1) => {
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
  },
} satisfies Compartment;

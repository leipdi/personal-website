// Trainer: a magnetic tactics board in an aluminium frame plays its move, the whistle blows
import * as THREE from "three";
import type { Compartment } from "../kit";

export default {
  id: "trainer",
  side: "out", // "out" (Draußen) or "in" (Drinnen)
  scale: 1.12,
  dur: 3.4, // seconds per play
  // g: the scaled inner group, outer: the compartment's group, sc: the scale, kit: makeKit()
  build(g, _outer, sc, kit) {
    const { canvasTex2, phys, plastic, gloss, metal, rubber, rbox, box, cyl, sph, at, clamp01, ease, bump, lathe, noShadow, blob } = kit;
    const m = 0.026 / sc;
    const board = new THREE.Group();
    board.position.set(0, m, -0.215);
    board.rotation.x = -0.16;
    const alu = metal("#d4d8dc", 0.3);
    board.add(at(rbox(0.72, 0.5, 0.03, 0.01, alu), 0, 0.235, -0.004));
    board.add(at(box(0.68, 0.46, 0.02, plastic("#e9ece9", 0.5)), 0, 0.23, 0.004));
    // the printed pitch on the board surface
    const [bx, btex] = canvasTex2(680, 460);
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
    const map = ([x, y]: number[]) => [(x / 320 - 0.5) * 0.62, 0.23 + (0.5 - y / 230) * 0.4];
    const S = [[70, 135], [120, 195], [180, 105]].map(map), E = [[150, 82], [210, 155], [260, 62]].map(map);
    const BP = [[70, 135], [210, 155], [260, 62]].map(map);
    // round magnets with a domed glossy top
    const magnetGeo = new THREE.LatheGeometry([[0, 0], [1, 0], [1, 0.36], [0.95, 0.44], [0, 0.46]].map(([x, y]) => new THREE.Vector2(x, y)), 40);
    const disc = (r: number, c: string, x: number, y: number) => {
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
    const place = (t: number) => {
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
  },
} satisfies Compartment;

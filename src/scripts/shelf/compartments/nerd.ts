// Nerd: a bed-slinger printer after the Bambu A1 mini (one column, a cantilevered arm, the bed
// slides front to back, the spool on top, a PTFE tube to the head) builds an orange vase with
// visible layer lines; Claude types on a dark aluminium laptop
import * as THREE from "three";
import type { Compartment } from "../kit";

export default {
  id: "nerd",
  side: "in", // "out" (Draußen) or "in" (Drinnen)
  scale: 1.05,
  dur: 6, // seconds per play
  // g: the scaled inner group, outer: the compartment's group, sc: the scale, kit: makeKit()
  build(g, _outer, _sc, kit) {
    const { canvasTex, canvasTex2, microTex, phys, plastic, gloss, metal, rbox, box, cyl, sph, at, clamp01, seg, lathe, blob, keysMesh } = kit;
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
    let tube: THREE.Mesh | null = null;
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
    const [tc, ttex] = canvasTex2(320, 200);
    const cmd = 'claude "Report"';
    // (redrawn, and uploaded to the GPU, only when the text or the cursor changed)
    let shown = "";
    const term = (n: number, done: boolean, blink: boolean) => {
      const key = `${n} ${done} ${blink}`;
      if (key === shown) return;
      shown = key;
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
    const set = (prog: number, hx: number, bz: number) => {
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
  },
} satisfies Compartment;

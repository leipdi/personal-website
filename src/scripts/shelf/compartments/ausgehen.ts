// Ausgehen: a mirror-tiled disco ball throws specks on the walls; a swing-top beer bottle and
// a martini glass with a lime wheel clink (references: dark swing-top lager bottle, coral cocktail)
import * as THREE from "three";
import type { Compartment } from "../kit";
import { CH, D } from "../kit";

export default {
  id: "ausgehen",
  side: "out", // "out" (Draußen) or "in" (Drinnen)
  scale: 1,
  dur: 3, // seconds per play
  // g: the scaled inner group, outer: the compartment's group, sc: the scale, kit: makeKit()
  build(g, outer, _sc, kit) {
    const { canvasTex, canvasTex2, phys, plastic, gloss, metal, rubber, cyl, sph, at, clamp01, backOut, seg, lathe, noShadow, hash, blob, strings, scene } = kit;
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
    spot.castShadow = false;
    spot.shadow.mapSize.set(512, 512);
    spot.shadow.camera.near = 0.05;
    scene!.add(spot, spot.target);
    // glass without transmission (that pass compiles every shader a second time, seconds on some
    // GPUs): a nearly clear surface that is mostly reflection, drawn after what stands behind it
    const glassMat = phys({ color: "#f4f8f9", roughness: 0.04, metalness: 0, transparent: true, opacity: 0.22, depthWrite: false, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, side: THREE.DoubleSide });
    // the martini glass: foot, stem, a wide cone; coral drink; a lime wheel on the rim
    const glass = new THREE.Group();
    glass.add(lathe([[0, 0], [0.045, 0], [0.046, 0.004], [0.012, 0.009], [0.0045, 0.02], [0.0045, 0.105], [0.008, 0.112], [0.078, 0.19], [0.0785, 0.193]], glassMat));
    glass.add(lathe([[0, 0.113], [0.006, 0.113], [0.064, 0.176], [0, 0.176]], phys({ color: "#ef4f3a", roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 })));
    const [lx, ltex] = canvasTex2(128, 128);
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
    const [bl, bltex] = canvasTex2(512, 200);
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
    const W = (a: [number, number, number], b2: [number, number, number]) => [new THREE.Vector3(...a), new THREE.Vector3(...b2)];
    bottle.add(strings([W([-0.017, 0.296, 0], [-0.017, 0.255, 0]), W([0.017, 0.296, 0], [0.017, 0.255, 0]), W([-0.017, 0.296, 0], [0.017, 0.296, 0]), W([-0.017, 0.255, 0], [-0.03, 0.235, 0.004]), W([0.017, 0.255, 0], [0.03, 0.235, 0.004])], 0.0012, wire));
    const Rg = at(bottle, 0.097, 0, 0.1);
    Rg.scale.setScalar(1.2);
    noShadow(Rg);
    g.add(Lg, Rg);
    g.add(at(blob(0.2, 0.14), -0.15, 0.002, 0.1), at(blob(0.13, 0.13), 0.097, 0.002, 0.1));
    const sparks: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const s = noShadow(sph(0.008, new THREE.MeshBasicMaterial({ color: "#fff1c0" }), 12, 8));
      s.userData.dir = new THREE.Vector3(Math.cos(i * 1.05) * 0.08, 0.05 + Math.sin(i * 1.05) * 0.05, 0.03);
      g.add(s);
      sparks.push(s);
    }
    const C = new THREE.Vector3(-0.03, 0.36, 0.12);
    const aim = (time: number) => {
      spot.position.set(outer.position.x, outer.position.y + 0.5, 0.01);
      spot.target.position.set(outer.position.x + Math.sin(time * 0.9) * 0.2, outer.position.y + 0.32 + Math.cos(time * 0.7) * 0.08, -D / 2);
      dotTex.rotation = time * 0.4;
    };
    return {
      rest() { Lg.rotation.z = 0; Rg.rotation.z = 0; Lg.position.y = 0; Rg.position.y = 0; sparks.forEach((s) => (s.visible = false)); spot.intensity = 0; aim(0); },
      idle(_t, dt) { disco.rotation.y += dt * 0.25; },
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
  },
} satisfies Compartment;

// Gaming: Pong on a thin-bezel monitor (slow at rest), a DualShock-style controller that
// buzzes, a mechanical keyboard, game cases, leather-band headphones on a stand
import * as THREE from "three";
import type { Compartment } from "../kit";

export default {
  id: "gaming",
  side: "in", // "out" (Draußen) or "in" (Drinnen)
  scale: 1.15,
  dur: 3, // seconds per play
  // g: the scaled inner group, outer: the compartment's group, sc: the scale, kit: makeKit()
  build(g, outer, _sc, kit) {
    const { canvasTex, canvasTex2, microTex, phys, plastic, gloss, metal, rubber, rbox, box, cyl, at, bump, noShadow, blob, keysMesh } = kit;
    const [ctx, tex] = canvasTex2(320, 180);
    // (the screen is a 640x360 upload: redrawn at most 30 times a second)
    let drawn = -1;
    const draw = (time: number) => {
      const f = Math.floor(time * 30);
      if (f === drawn) return;
      drawn = f;
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
    // (no light of its own: the RGB plane carries the glow; one point light less per pixel)
    const glowL = { position: new THREE.Vector3(), intensity: 0, color: new THREE.Color() };
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
    const btns = ([["#3fd0a6", 0, -0.014], ["#ff6b8a", 0.014, 0], ["#7fa7ff", 0, 0.014], ["#e5a3ff", -0.014, 0]] as [string, number, number][]).map(([c, dx2, dz]) => {
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
    ([["#9c5a3c", 0], ["#3d5a9e", 0.014], ["#2c7f74", 0.028]] as [string, number][]).forEach(([c, y], i) => {
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
      update(p, time, _dt, glow) {
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
  },
} satisfies Compartment;

// Werdegang's lane packing, shared by the server (no-JS fallback, label widths estimated in % of
// the track) and the browser (real label widths in px). Each station, in date order, goes on
// the first line of its lane where its bar, its label (above the bar) and its flag name (below
// it) collide with nothing; a narrow track just gets more lines.

export type GanttBox = {
  b0: number; // the bar
  b1: number;
  l0: number; // the label
  l1: number;
  lbl: boolean; // has a label to keep clear
  flag: null | {
    right: [number, number]; // the flag name's extent when it hangs right of its pole
    left: [number, number]; // … and when it hangs left
    n0: number; // where a right-hanging name starts (a bar from here on would cover it)
    w: number; // the name's width (0: nothing to move)
    hangLeft: boolean; // hangs left from the start (it would run past the chart's end)
  };
};

export type Placed = {
  line: number;
  fb: number; // lines with flags above this one
  hangLeft: boolean;
};

const clear = (a0: number, a1: number, b0: number, b1: number, gap: number) => a1 + gap <= b0 || b1 + gap <= a0;

/** Packs one lane. `gaps.bar` between bars on a line, `gaps.lbl` between labels and flag names. */
export function packLane(boxes: GanttBox[], gaps: { bar: number; lbl: number }) {
  type Cur = { box: GanttBox; f0: number; f1: number; left: boolean };
  const lines: Cur[][] = [];
  const at: { cur: Cur; line: number }[] = [];
  for (const box of boxes) {
    const left = !!box.flag?.hangLeft;
    const [f0, f1] = box.flag ? (left ? box.flag.left : box.flag.right) : [0, 0];
    const cur: Cur = { box, f0, f1, left };
    let k = lines.findIndex((ln) =>
      ln.every(
        (o) =>
          clear(box.b0, box.b1, o.box.b0, o.box.b1, gaps.bar) &&
          (!box.lbl || !o.box.lbl || clear(box.l0, box.l1, o.box.l0, o.box.l1, gaps.lbl)) &&
          (!box.flag || !o.box.flag || clear(f0, f1, o.f0, o.f1, gaps.lbl)),
      ),
    );
    if (k < 0) k = lines.push([]) - 1;
    lines[k].push(cur);
    at.push({ cur, line: k });
  }
  // A flag name hanging right of its pole must not sit under the next station's bar on the
  // same line (the grade at the end of the Abitur ran under the B.Eng. bar): it then hangs
  // left, under its own bar.
  for (const ln of lines) {
    for (const o of ln) {
      const f = o.box.flag;
      if (!f || !f.w || o.left) continue;
      if (ln.some((p) => p !== o && p.box.b0 < o.f1 && p.box.b1 > f.n0)) {
        o.left = true;
        [o.f0, o.f1] = f.left;
      }
    }
  }
  const flagLine = lines.map((ln) => ln.some((o) => o.box.flag));
  const placed: Placed[] = at.map(({ cur, line }) => ({
    line,
    fb: flagLine.slice(0, line).filter(Boolean).length,
    hangLeft: cur.left,
  }));
  return {
    placed,
    // each line's boxes by index into `boxes`
    lines: lines.map((ln) => ln.map((o) => boxes.indexOf(o.box))),
    nLines: lines.length,
    nFlag: flagLine.filter(Boolean).length,
  };
}

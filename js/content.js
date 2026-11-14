/* Aim, theory, method and worked example figures */
(function (L) {
  'use strict';
  const { $, el, txt, tsub, F_CAP, F_BODY } = L;
  const rad = d => d * Math.PI / 180;
  const VC = { f1: 'var(--f1)', f2: 'var(--f2)', f3: 'var(--f3)', fr: 'var(--fr)', ink: 'var(--ink)', muted: 'var(--muted)' };
  let mk = 0;
  function arrow(g, a, b, c, w, dash) {
    const id = 'ah' + (mk++), svg = g.ownerSVGElement || g;
    let d = svg.querySelector('defs'); if (!d) d = el('defs', null, svg);
    const m = el('marker', { id, viewBox: '0 0 12 12', refX: 10, refY: 6, markerWidth: 11, markerHeight: 11, markerUnits: 'userSpaceOnUse', orient: 'auto' }, d);
    el('path', { d: 'M0 1 L11 6 L0 11 L3 6z', fill: c }, m);
    return el('path', { d: `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`, stroke: c, 'stroke-width': w || 3, 'marker-end': `url(#${id})`, 'stroke-dasharray': dash || null, 'stroke-linecap': 'round', fill: 'none' }, g);
  }
  const lab = (g, x, y, parts, c, o) => tsub(g, x, y, parts, Object.assign({ 'font-size': 17, 'font-family': F_BODY, 'font-weight': 700, fill: c }, o || {}));
  const pol = (o, len, a) => [o[0] + len * Math.cos(rad(a)), o[1] - len * Math.sin(rad(a))];
  function arc(g, c, r, a0, a1, col, label, lx) {
    const p0 = pol(c, r, a0), p1 = pol(c, r, a1);
    el('path', { d: `M${p0[0]} ${p0[1]} A${r} ${r} 0 0 0 ${p1[0]} ${p1[1]}`, fill: 'none', stroke: col || 'var(--acc-2)', 'stroke-width': 1.6 }, g);
    if (label) { const m = pol(c, r + (lx || 16), (a0 + a1) / 2); txt(g, m[0], m[1] + 5, label, { 'text-anchor': 'middle', 'font-size': 15, 'font-family': F_BODY, 'font-style': 'italic', 'font-weight': 600, fill: col || 'var(--acc-2)' }); }
  }
  function triangle(g, o, F1, F2, th, sc, opt) {
    opt = opt || {};
    const t1 = [o[0] + F1 * sc, o[1]], t2 = pol(t1, F2 * sc, th);
    el('path', { d: `M${t1[0]} ${t1[1]}h${Math.min(120, F2 * sc)}`, stroke: 'var(--rule-2)', 'stroke-dasharray': '4 4' }, g);
    arrow(g, o, t1, VC.f1); arrow(g, t1, t2, VC.f2); if (!opt.noR) arrow(g, o, t2, VC.fr, 3.4);
    lab(g, (o[0] + t1[0]) / 2, o[1] + 26, [{ i: 'F' }, { sub: '1' }], VC.f1, { 'text-anchor': 'middle' });
    lab(g, (t1[0] + t2[0]) / 2 + 14, (t1[1] + t2[1]) / 2 + 6, [{ i: 'F' }, { sub: '2' }], VC.f2);
    if (!opt.noR) lab(g, (o[0] + t2[0]) / 2 - 12, (o[1] + t2[1]) / 2 - 8, [{ i: 'F' }, { sub: 'R' }], VC.fr, { 'text-anchor': 'end' });
    arc(g, t1, 34, 0, th, 'var(--acc-2)', 'θ', 18);
    if (opt.alpha) { const al = Math.atan2(t1[1] - t2[1], t2[0] - o[0]) * 180 / Math.PI; arc(g, o, 60, 0, al, VC.fr, 'α', 16); }
    if (opt.inner) { arc(g, t1, 22, th, 180, 'var(--muted)', '', 0); const m = pol(t1, 48, (th + 180) / 2); txt(g, m[0], m[1] + 4, '180° − θ', { 'text-anchor': 'middle', 'font-size': 13, 'font-family': F_CAP, fill: 'var(--muted)' }); }
    return { t1, t2 };
  }

  /* aim: head-to-tail triangle and the equilibrant */
  (function aim() {
    const s = $('aim-fig'); if (!s) return;
    const g = el('g', null, s);
    triangle(g, [80, 270], 2.0, 2.5, 60, 95, { alpha: true });
    const t2 = pol([80 + 190, 270], 237.5, 60);
    void t2;
    /* ring with three forces */
    const c = [690, 170];
    el('circle', { cx: c[0], cy: c[1], r: 110, fill: 'none', stroke: 'var(--rule-2)', 'stroke-dasharray': '3 5' }, g);
    arrow(g, c, pol(c, 92, 0), VC.f1); arrow(g, c, pol(c, 116, 60), VC.f2); arrow(g, c, pol(c, 140, 213.7), VC.f3, 3.4);
    el('circle', { cx: c[0], cy: c[1], r: 9, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 3 }, g);
    lab(g, c[0] + 98, c[1] + 6, [{ i: 'F' }, { sub: '1' }], VC.f1);
    lab(g, pol(c, 128, 60)[0], pol(c, 128, 60)[1] - 4, [{ i: 'F' }, { sub: '2' }], VC.f2);
    lab(g, pol(c, 150, 213.7)[0] - 6, pol(c, 150, 213.7)[1] + 22, [{ i: 'F' }, { sub: '3' }, ' = equilibrant'], VC.f3, { 'text-anchor': 'middle' });
    tsub(g, 300, 312, ['head to tail: F₁ + F₂ = ', { i: 'F' }, { sub: 'R' }], { 'text-anchor': 'middle', 'font-size': 14, 'font-family': F_CAP, 'font-weight': 600, fill: 'var(--muted)', 'letter-spacing': '.06em' });
    tsub(g, 690, 22, ['balanced ring: F₃ = −', { i: 'F' }, { sub: 'R' }], { 'text-anchor': 'middle', 'font-size': 14, 'font-family': F_CAP, 'font-weight': 600, fill: 'var(--muted)', 'letter-spacing': '.06em' });
  })();

  /* theory figures */
  (function tri() { const s = $('th-tri'); if (!s) return; triangle(el('g', null, s), [60, 270], 2.0, 2.5, 60, 85, { alpha: true, inner: true }); })();
  (function para() {
    const s = $('th-para'); if (!s) return; const g = el('g', null, s), o = [60, 280], sc = 85, F1 = 2, F2 = 2.5, th = 60;
    const t1 = [o[0] + F1 * sc, o[1]], q = pol(o, F2 * sc, th), t2 = pol(t1, F2 * sc, th);
    el('path', { d: `M${t1[0]} ${t1[1]}L${t2[0]} ${t2[1]}L${q[0]} ${q[1]}`, stroke: 'var(--rule-2)', 'stroke-width': 1.6, 'stroke-dasharray': '7 6', fill: 'none' }, g);
    arrow(g, o, t1, VC.f1); arrow(g, o, q, VC.f2); arrow(g, o, t2, VC.fr, 3.4);
    lab(g, (o[0] + t1[0]) / 2, o[1] + 26, [{ i: 'F' }, { sub: '1' }], VC.f1, { 'text-anchor': 'middle' });
    lab(g, (o[0] + q[0]) / 2 - 30, (o[1] + q[1]) / 2, [{ i: 'F' }, { sub: '2' }], VC.f2);
    lab(g, (o[0] + t2[0]) / 2 + 14, (o[1] + t2[1]) / 2 + 22, [{ i: 'F' }, { sub: 'R' }], VC.fr);
    arc(g, o, 40, 0, th, 'var(--acc-2)', 'θ', 16);
  })();
  (function eq() {
    const s = $('th-eq'); if (!s) return; const g = el('g', null, s), c = [140, 170];
    arrow(g, c, pol(c, 80, 0), VC.f1); arrow(g, c, pol(c, 100, 60), VC.f2); arrow(g, c, pol(c, 120, 213.7), VC.f3);
    el('circle', { cx: c[0], cy: c[1], r: 7, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 2.6 }, g);
    lab(g, c[0] + 84, c[1] + 22, [{ i: 'F' }, { sub: '1' }], VC.f1); lab(g, pol(c, 108, 60)[0] + 6, pol(c, 108, 60)[1], [{ i: 'F' }, { sub: '2' }], VC.f2); lab(g, pol(c, 120, 213.7)[0] - 4, pol(c, 120, 213.7)[1] + 24, [{ i: 'F' }, { sub: '3' }], VC.f3);
    const o = [300, 250], sc = 40, t1 = [o[0] + 2 * sc, o[1]], t2 = pol(t1, 2.5 * sc, 60);
    arrow(g, o, t1, VC.f1); arrow(g, t1, t2, VC.f2); arrow(g, t2, o, VC.f3, 3);
    lab(g, (o[0] + t1[0]) / 2, o[1] + 24, [{ i: 'F' }, { sub: '1' }], VC.f1, { 'text-anchor': 'middle' }); lab(g, (t1[0] + t2[0]) / 2 + 12, (t1[1] + t2[1]) / 2 + 4, [{ i: 'F' }, { sub: '2' }], VC.f2); lab(g, (o[0] + t2[0]) / 2 - 12, (o[1] + t2[1]) / 2 - 4, [{ i: 'F' }, { sub: '3' }], VC.f3, { 'text-anchor': 'end' });
    txt(g, 380, 300, 'closed triangle: sum = 0', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-family': F_CAP, 'font-weight': 600, fill: 'var(--muted)' });
  })();
  /* explorer */
  (function explorer() {
    const s = $('th-ex'); if (!s) return;
    const i1 = $('ex-f1'), i2 = $('ex-f2'), i3 = $('ex-th'), out = $('ex-out');
    function draw() {
      const F1 = +i1.value, F2 = +i2.value, th = +i3.value; $('ex-f1v').textContent = F1.toFixed(1); $('ex-f2v').textContent = F2.toFixed(1); $('ex-thv').textContent = th;
      s.innerHTML = '';
      const sc = 50, o = [40 + (th > 90 ? F2 * sc * Math.min(1, -Math.cos(rad(th))) : 0), 300];
      triangle(el('g', null, s), o, F1, F2, th, sc, { alpha: true });
      const R = Math.sqrt(F1 * F1 + F2 * F2 + 2 * F1 * F2 * Math.cos(rad(th))), al = Math.atan2(F2 * Math.sin(rad(th)), F1 + F2 * Math.cos(rad(th))) * 180 / Math.PI;
      out.innerHTML = `<div><span><i>F</i><sub>R</sub> = </span><b>${R.toFixed(2)}</b> N</div><div><span><i>α</i> = </span><b>${al.toFixed(1)}</b>°</div><div><span>equilibrant at </span><b>${(al + 180).toFixed(1)}</b>° from <i>F</i><sub>1</sub></div>`;
    }
    [i1, i2, i3].forEach(i => i.addEventListener('input', draw)); draw();
  })();

  /* apparatus */
  (function apparatus() {
    const grid = $('app-grid'); if (!grid) return;
    const items = [
      ['Force table', 'Aluminium disc with a 0–360° scale on a tripod with levelling screws.', g => { el('ellipse', { cx: 100, cy: 48, rx: 80, ry: 28, fill: '#c3c9cd', stroke: '#1d252b', 'stroke-width': 1.5 }, g); el('path', { d: 'M20 48v8a80 28 0 0 0 160 0v-8', fill: '#8a9399', stroke: '#1d252b' }, g); for (let a = 0; a < 360; a += 15) { const c = Math.cos(rad(a)), s2 = Math.sin(rad(a)); el('path', { d: `M${100 + 74 * c} ${48 + 26 * s2}L${100 + 66 * c} ${48 + 23 * s2}`, stroke: '#1d252b' }, g); } el('path', { d: 'M100 84v18M70 108l30-6 30 6', stroke: '#c3c9cd', 'stroke-width': 4, fill: 'none' }, g); }],
      ['Pulleys and clamps', 'Low-friction pulleys that clamp anywhere on the rim.', g => { el('rect', { x: 60, y: 60, width: 60, height: 16, fill: '#4a535a' }, g); el('circle', { cx: 130, cy: 50, r: 24, fill: '#7d868c', stroke: '#c3c9cd', 'stroke-width': 3 }, g); el('circle', { cx: 130, cy: 50, r: 4, fill: '#e2e7ea' }, g); el('path', { d: 'M30 26 H130 M154 50 V104', stroke: '#ece6d6', 'stroke-width': 1.6, fill: 'none' }, g); el('path', { d: 'M80 76v20h10', stroke: '#c3c9cd', 'stroke-width': 3, fill: 'none' }, g); }],
      ['Ring, strings and thread', 'A light ring round the centre pin, tied to three strings, and a thread up to a hook above the centre.', g => { el('path', { d: 'M100 10 V58', stroke: '#fbf6e8', 'stroke-width': 1.4 }, g); el('path', { d: 'M100 64 L190 64 M100 64 L40 30 M100 64 L50 106', stroke: '#ece6d6', 'stroke-width': 1.6 }, g); el('circle', { cx: 100, cy: 64, r: 8, fill: 'none', stroke: '#e2e7ea', 'stroke-width': 3 }, g); }],
      ['Hangers and slotted masses', '50 g hangers; slotted masses of 10, 20, 50, 100 and 200 g.', g => { el('path', { d: 'M100 6v16', stroke: '#c3c9cd', 'stroke-width': 2 }, g); el('rect', { x: 97, y: 22, width: 6, height: 70, fill: '#2a3035' }, g); [[92, 14], [78, 10], [68, 7]].forEach(([y, h], k) => { el('rect', { x: 66, y: y - h, width: 68, height: h, rx: 3, fill: k ? '#c9a24f' : '#d9b25a', stroke: '#5c4718' }, g); }); el('rect', { x: 64, y: 92, width: 72, height: 8, rx: 3, fill: '#2a3035' }, g); }],
      ['Spirit level', 'A bull\'s-eye level: the bubble sits in the circle when the top is level.', g => { el('circle', { cx: 100, cy: 56, r: 40, fill: '#a3b18c', stroke: '#12181d', 'stroke-width': 4 }, g); el('circle', { cx: 100, cy: 56, r: 12, fill: 'none', stroke: '#1b2414', 'stroke-width': 1.4 }, g); el('circle', { cx: 100, cy: 56, r: 9, fill: '#eef5dc' }, g); }],
      ['Graph paper, ruler and protractor', 'For the scale drawing of the graphical method.', g => { el('rect', { x: 30, y: 14, width: 140, height: 90, fill: '#c9d3c8' }, g); for (let x = 30; x <= 170; x += 10) el('path', { d: `M${x} 14v90`, stroke: '#9fb0a2', 'stroke-width': .6 }, g); for (let y = 14; y <= 104; y += 10) el('path', { d: `M30 ${y}h140`, stroke: '#9fb0a2', 'stroke-width': .6 }, g); el('path', { d: 'M40 94 h60 l40 -50 M40 94 L140 44', stroke: '#c95816', 'stroke-width': 2.4, fill: 'none' }, g); }]
    ];
    items.forEach(([t, sm, f]) => { const d = document.createElement('div'); d.className = 'app-item'; d.innerHTML = `<svg viewBox="0 0 200 112" aria-hidden="true"></svg><span>${t}</span><small>${sm}</small>`; f(d.querySelector('svg')); grid.appendChild(d); });
  })();

  /* method steps: a plan view of the table for each step */
  (function steps() {
    const svg = $('m-step-svg'), list = $('m-steps'), cap = $('m-step-cap'); if (!svg) return;
    const c = [280, 180], R = 140;
    function table(g, o) {
      el('circle', { cx: c[0], cy: c[1], r: R + 6, fill: '#8a9399' }, g);
      el('circle', { cx: c[0], cy: c[1], r: R, fill: '#c3c9cd', stroke: '#1d252b', 'stroke-width': 1.4 }, g);
      let t = ''; for (let a = 0; a < 360; a += 5) { const L1 = a % 30 ? 6 : 12, p = pol(c, R - 3, a), q = pol(c, R - 3 - L1, a); t += `M${p[0]} ${p[1]}L${q[0]} ${q[1]}`; } el('path', { d: t, stroke: '#1d252b', 'stroke-width': .8 }, g);
      for (let a = 0; a < 360; a += 30) { const p = pol(c, R - 26, a); txt(g, p[0], p[1] + 4, String(a), { 'text-anchor': 'middle', 'font-size': 11, 'font-family': F_CAP, fill: '#1d252b' }); }
      el('circle', { cx: c[0], cy: c[1], r: 2.5, fill: '#1d252b' }, g);
      (o.str || []).forEach(([a, col, lb, ring]) => { const r0 = ring || [0, 0], p = pol(c, R + 16, a); el('path', { d: `M${c[0] + r0[0]} ${c[1] + r0[1]}L${p[0]} ${p[1]}`, stroke: col, 'stroke-width': 2.2 }, g); el('circle', { cx: p[0], cy: p[1], r: 8, fill: '#4a535a', stroke: col, 'stroke-width': 2 }, g); if (lb) { const q = pol(c, R + 40, a); txt(g, q[0], q[1] + 5, lb, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-family': F_CAP, 'font-weight': 700, fill: col }); } });
      const ro = o.ring || [0, 0]; el('circle', { cx: c[0] + ro[0], cy: c[1] + ro[1], r: 9, fill: 'none', stroke: '#2a3035', 'stroke-width': 3 }, g);
    }
    function draw(i) {
      svg.innerHTML = ''; const g = el('g', null, svg);
      if (i === 0) { table(g, { ring: [-14, 8] }); const lc = [210, 110]; el('circle', { cx: lc[0], cy: lc[1], r: 22, fill: '#a3b18c', stroke: '#12181d', 'stroke-width': 3 }, g); el('circle', { cx: lc[0], cy: lc[1], r: 7, fill: 'none', stroke: '#1b2414' }, g); el('circle', { cx: lc[0] + 9, cy: lc[1] - 6, r: 6, fill: '#eef5dc' }, g); txt(g, 470, 40, 'bubble → centre', { 'text-anchor': 'middle', 'font-size': 14, 'font-family': F_CAP, 'font-weight': 600, fill: 'var(--acc-2)' }); }
      else if (i === 1) table(g, { str: [[0, VC.f1, 'F₁'], [60, VC.f2, 'F₂']], ring: [16, -10] });
      else if (i === 2) { table(g, { str: [[0, VC.f1, 'F₁'], [60, VC.f2, 'F₂']], ring: [16, -10] }); arc(g, c, 50, 0, 60, 'var(--acc-2)', 'θ = 60°', 26); txt(g, 470, 330, 'm₁ = 0.2 kg · m₂ = 0.25 kg', { 'text-anchor': 'middle', 'font-size': 14, 'font-family': F_CAP, 'font-weight': 600, fill: 'var(--ink-2)' }); }
      else if (i === 3) { table(g, { str: [[0, VC.f1, 'F₁'], [60, VC.f2, 'F₂'], [214, VC.f3, 'F₃']] }); txt(g, 470, 330, 'm₃ adjusted → ring centred', { 'text-anchor': 'middle', 'font-size': 14, 'font-family': F_CAP, 'font-weight': 600, fill: 'var(--ink-2)' }); }
      else if (i === 4) { arrow(g, c, pol(c, 90, 0), VC.f1); arrow(g, c, pol(c, 112, 60), VC.f2); arrow(g, c, pol(c, 140, 33.7), VC.fr, 2.6, '6 5'); arrow(g, c, pol(c, 140, 213.7), VC.f3, 3.2); el('circle', { cx: c[0], cy: c[1], r: 7, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 2.6 }, g); lab(g, pol(c, 150, 33.7)[0], pol(c, 150, 33.7)[1], [{ i: 'F' }, { sub: 'R' }], VC.fr); lab(g, pol(c, 156, 213.7)[0], pol(c, 156, 213.7)[1] + 16, [{ i: 'F' }, { sub: '3' }, ' = −', { i: 'F' }, { sub: 'R' }], VC.f3, { 'text-anchor': 'middle' }); }
      else { triangle(g, [70, 300], 1.96, 2.45, 60, 80, { alpha: true }); tsub(g, 470, 40, [{ i: 'F' }, { sub: 'R' }, ' = √(F₁² + F₂² + 2F₁F₂ cos θ)'], { 'text-anchor': 'middle', 'font-size': 14, 'font-family': F_CAP, 'font-weight': 600, fill: 'var(--ink-2)' }); }
    }
    const caps = [
      'Turn the levelling screws until the bubble of the spirit level sits in the inner circle. On a level top the ring feels only the strings.',
      'Hang masses over two pulleys, here at 0° and 60°. The ring slides towards their resultant until it rests against the centre pin.',
      'Note each hanging mass (hanger included) and each string position. θ is the angle between F₁ and F₂.',
      'Slide the third pulley round and change its mass until the ring sits centred round the pin without touching it.',
      'The third force, the equilibrant, is equal and opposite to the resultant of F₁ and F₂: F₃ = −<i>F</i><sub>R</sub>.',
      'Find <i>F</i><sub>R</sub> by the formula and by a scale drawing, head to tail, and compare both with <i>F</i><sub>E</sub> = m₃g.'
    ];
    L.methodSteps(list, cap, draw, caps);
  })();

  /* worked example */
  (function example() {
    const G = 9.8, m = [0.2, 0.25, 0.39], a = [0, 60, 214], F = m.map(x => x * G), th = 60;
    const FR = Math.sqrt(F[0] ** 2 + F[1] ** 2 + 2 * F[0] * F[1] * Math.cos(rad(th))), FRs = FR.toFixed(2);
    const al = Math.atan2(F[1] * Math.sin(rad(th)), F[0] + F[1] * Math.cos(rad(th))) * 180 / Math.PI;
    const sc = 0.5, l1 = Math.round(F[0] / sc * 10) / 10, l2 = Math.round(F[1] / sc * 10) / 10;
    const lR = Math.sqrt(l1 * l1 + l2 * l2 + 2 * l1 * l2 * Math.cos(rad(th))), lRr = Math.round(lR * 10) / 10, FG = lRr * sc;
    const alD = Math.round(Math.atan2(l2 * Math.sin(rad(th)), l1 + l2 * Math.cos(rad(th))) * 180 / Math.PI);
    const FE = F[2], e1 = Math.abs(+FE.toFixed(2) - +FRs) / +FRs * 100, e2 = Math.abs(+FG.toFixed(2) - +FRs) / +FRs * 100;
    const A = (+F[0].toFixed(2)) ** 2, B = (+F[1].toFixed(2)) ** 2, Cc = 2 * +F[0].toFixed(2) * +F[1].toFixed(2) * Math.cos(rad(th));
    $('ex-table').innerHTML = `<thead><tr><th>Force</th><th>Mass <i>m</i><span class="u">kg</span></th><th>Force = <i>mg</i><span class="u">N</span></th><th>Angle <i>θ</i><span class="u">degree</span></th><th>Resultant <i>F</i><sub>R</sub><span class="fx">theoretical</span><span class="u">N</span></th><th>Resultant <i>F</i><sub>E</sub><span class="fx">experimental · <i>m</i><sub>3</sub><i>g</i></span><span class="u">N</span></th><th>Resultant <i>F</i><sub>G</sub><span class="fx">graphical</span><span class="u">N</span></th></tr></thead>
      <tbody><tr><td class="grp"><i>F</i><sub>1</sub></td><td>${String(+m[0].toFixed(3))}</td><td>${F[0].toFixed(2)}</td><td rowspan="2">${th}</td><td rowspan="2" class="calc-c">${FRs}</td><td rowspan="2" class="calc-c">${FE.toFixed(2)}</td><td rowspan="2" class="calc-c">${FG.toFixed(2)}</td></tr>
      <tr><td class="grp"><i>F</i><sub>2</sub></td><td>${String(+m[1].toFixed(3))}</td><td>${F[1].toFixed(2)}</td></tr></tbody>`;
    $('ex-eqtable').innerHTML = `<thead><tr><th>Pulley</th><th>Position<span class="u">degree</span></th><th>Hanging mass <i>m</i><span class="u">kg</span></th><th>Force <i>mg</i><span class="u">N</span></th></tr></thead><tbody>${[0, 1, 2].map(i => `<tr><td class="grp"><i>F</i><sub>${i + 1}</sub>${i === 2 ? ' <small>equilibrant</small>' : ''}</td><td>${a[i]}</td><td>${String(+m[i].toFixed(3))}</td><td>${F[i].toFixed(2)}</td></tr>`).join('')}</tbody><tfoot><tr><td class="lbl" colspan="4">Hanging masses include the 50 g hanger: m₁ = 0.05 + 0.1 + 0.05, m₂ = 0.05 + 0.2, m₃ = 0.05 + 0.2 + 0.1 + 0.02 + 0.02.</td></tr></tfoot>`;
    /* drawing */
    const s = $('ex-graph'), PX = 36, o = [60, 360];
    const defs = el('defs', null, s); defs.innerHTML = `<pattern id="ex-mm" width="${PX / 10}" height="${PX / 10}" patternUnits="userSpaceOnUse"><path d="M${PX / 10} 0V${PX / 10}H0" fill="none" stroke="#9fb0a2" stroke-width=".35"/></pattern><pattern id="ex-cm" width="${PX}" height="${PX}" patternUnits="userSpaceOnUse" x="${o[0]}" y="${o[1]}"><rect width="${PX}" height="${PX}" fill="url(#ex-mm)"/><path d="M${PX} 0V${PX}H0" fill="none" stroke="#7f9584" stroke-width=".9"/></pattern>`;
    el('rect', { width: 760, height: 420, fill: '#c9d3c8' }, s); el('rect', { width: 760, height: 420, fill: 'url(#ex-cm)' }, s);
    const g = el('g', null, s);
    const t1 = [o[0] + l1 * PX, o[1]], t2 = pol(t1, l2 * PX, th);
    el('path', { d: `M${t1[0]} ${t1[1]}h120`, stroke: '#4b5a50', 'stroke-dasharray': '3 4' }, g);
    arrow(g, o, t1, VC.f1); arrow(g, t1, t2, VC.f2); arrow(g, o, t2, VC.fr, 3.4);
    lab(g, (o[0] + t1[0]) / 2, o[1] + 26, [{ i: 'F' }, { sub: '1' }, ` = ${l1.toFixed(1)} cm`], VC.f1, { 'text-anchor': 'middle', 'font-size': 15 });
    lab(g, (t1[0] + t2[0]) / 2 + 14, (t1[1] + t2[1]) / 2 + 4, [{ i: 'F' }, { sub: '2' }, ` = ${l2.toFixed(1)} cm`], VC.f2, { 'font-size': 15 });
    lab(g, (o[0] + t2[0]) / 2 - 10, (o[1] + t2[1]) / 2 - 12, [{ i: 'F' }, { sub: 'R' }, ` = ${lRr.toFixed(1)} cm`], VC.fr, { 'text-anchor': 'end', 'font-size': 15 });
    arc(g, t1, 34, 0, th, 'var(--acc-2)', '60°', 22); arc(g, o, 70, 0, alD, VC.fr, alD + '°', 18);
    el('rect', { x: 500, y: 20, width: 236, height: 46, rx: 8, fill: 'rgba(29,37,43,.86)' }, g);
    el('path', { d: `M516 43h${PX}M516 37v12M${516 + PX} 37v12`, stroke: '#e2864a', 'stroke-width': 2 }, g);
    txt(g, 516 + PX + 14, 49, 'Scale: 1 cm = 0.5 N', { 'font-size': 15, 'font-family': F_CAP, 'font-weight': 700, fill: '#f1e9df' });
    /* calculation */
    const step = (n, t, body, res) => `<div class="calc-step${res ? ' result' : ''}"><span class="cs-n">${n}</span><div><div class="sub">${t}</div><div class="eq-line">${body}</div></div></div>`;
    $('ex-calc').innerHTML = [
      step(1, 'The two forces', `<i>F</i><sub>1</sub> = <i>m</i><sub>1</sub><i>g</i> = 0.2 × 9.8 = <b>${F[0].toFixed(2)} N</b> · <i>F</i><sub>2</sub> = 0.25 × 9.8 = <b>${F[1].toFixed(2)} N</b>`),
      step(2, 'Angle between them', `<i>θ</i> = 60° − 0° = <b>60°</b>`),
      step(3, 'Theoretical resultant', `<i>F</i><sub>R</sub> = √(${F[0].toFixed(2)}² + ${F[1].toFixed(2)}² + 2 × ${F[0].toFixed(2)} × ${F[1].toFixed(2)} × cos 60°) = √(${A.toFixed(4)} + ${B.toFixed(4)} + ${Cc.toFixed(4)}) = √${(A + B + Cc).toFixed(4)} = <b>${FRs} N</b>`),
      step(4, 'Direction of the resultant', `tan <i>α</i> = ${F[1].toFixed(2)} × sin 60° ÷ (${F[0].toFixed(2)} + ${F[1].toFixed(2)} × cos 60°) = ${(F[1] * Math.sin(rad(60))).toFixed(3)} ÷ ${(F[0] + F[1] * .5).toFixed(3)} → <i>α</i> = <b>${al.toFixed(1)}°</b>; equilibrant expected at ${(al + 180).toFixed(1)}°, found at 214°`),
      step(5, 'Experimental resultant', `<i>F</i><sub>E</sub> = <i>m</i><sub>3</sub><i>g</i> = 0.39 × 9.8 = <b>${FE.toFixed(2)} N</b>`),
      step(6, 'Graphical resultant', `<i>ℓ</i><sub>1</sub> = ${F[0].toFixed(2)} ÷ 0.5 = ${(F[0] / sc).toFixed(2)} ≈ ${l1.toFixed(1)} cm, <i>ℓ</i><sub>2</sub> = ${F[1].toFixed(2)} ÷ 0.5 = ${l2.toFixed(1)} cm; measured <i>ℓ</i><sub>R</sub> = ${lRr.toFixed(1)} cm, so <i>F</i><sub>G</sub> = ${lRr.toFixed(1)} × 0.5 = <b>${FG.toFixed(2)} N</b>`),
      step(7, '% differences from the theoretical value', `experimental: |${FE.toFixed(2)} − ${FRs}| ÷ ${FRs} × 100 = <b>${e1.toFixed(2)} %</b> · graphical: |${FG.toFixed(2)} − ${FRs}| ÷ ${FRs} × 100 = <b>${e2.toFixed(2)} %</b>`, true)
    ].join('');
    $('ex-res').innerHTML = `<thead><tr><th>Resultant</th><th>Value</th><th>Difference from theoretical</th></tr></thead><tbody><tr><td>Theoretical (formula)</td><td>${FRs} N</td><td>—</td></tr><tr><td>Experimental (equilibrant)</td><td>${FE.toFixed(2)} N</td><td>${e1.toFixed(2)} %</td></tr><tr><td>Graphical (scale drawing)</td><td>${FG.toFixed(2)} N</td><td>${e2.toFixed(2)} %</td></tr></tbody>`;
    L.EXRES = { F, FR, FE, FG, e1, e2, al, lRr };
  })();

  L.mcq($('mcq-list'), L.MCQ, $('mcq-score'), $('mcq-reset'));
})(window.SOL);

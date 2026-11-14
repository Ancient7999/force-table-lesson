/* Force table apparatus: oblique view of the table, pulleys, strings, ring and overhead thread, plus a bench of hangers and slotted masses */
(function (L) {
  'use strict';
  const { $, el, txt, tsub, clamp, svgPoint, F_HEAD, F_BODY, F_CAP } = L;
  const G = 9.8, HANGER = 50, SLOTS = [200, 100, 50, 20, 10], MAXSLOT = 750;
  const FR = 0.035; /* friction at the pulleys: a net pull smaller than this does not move the ring */
  const COL = ['var(--f1)', 'var(--f2)', 'var(--f3)'], NAME = ['F₁', 'F₂', 'F₃'];
  const FEET = [90, 210, 330];
  const DEF = () => ({ a: [0, 120, 240], stack: [[], [], []], phi: -18, h: [0, 0.9, -0.3], focus: -1 });
  const st = DEF();

  /* ---------- physics ---------- */
  const massKg = i => (HANGER + st.stack[i].reduce((s, g) => s + g, 0)) / 1000;
  const force = i => massKg(i) * G;
  const rad = d => d * Math.PI / 180;
  function tilt() { let x = 0, y = 0; FEET.forEach((f, i) => { x += st.h[i] * Math.cos(rad(f)); y += st.h[i] * Math.sin(rad(f)); }); return { x: x * 2 / 3, y: y * 2 / 3 }; }
  const level = () => { const t = tilt(); return Math.hypot(t.x, t.y) < 0.05; };
  /* net horizontal force on the ring in table coordinates (N): three strings plus the slope of an unlevelled top */
  function net() {
    let x = 0, y = 0;
    for (let i = 0; i < 3; i++) { const F = force(i); x += F * Math.cos(rad(st.a[i])); y += F * Math.sin(rad(st.a[i])); }
    const t = tilt(); x -= 0.5 * t.x; y -= 0.5 * t.y;
    return { x, y, m: Math.hypot(x, y), dir: ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360 };
  }
  const balanced = () => net().m <= FR;
  const DMAX = 46, F0 = 0.55;
  function target() { const n = net(); if (n.m <= FR) return { x: 0, y: 0 }; const d = DMAX * Math.tanh((n.m - FR) / F0); return { x: d * n.x / n.m, y: d * n.y / n.m }; }

  /* ---------- geometry of the oblique view ---------- */
  const W = 1000, H = 800, CX = 500, CY = 252, R = 300, K = 0.38, HOOK = 222, DROP = 290;
  const P = (u, v, z) => { const c = Math.cos(rad(st.phi)), s = Math.sin(rad(st.phi)), x = u * c - v * s, y = u * s + v * c; return [CX + x, CY - y * K - (z || 0)]; };
  const PA = (r, a, z) => P(r * Math.cos(rad(a)), r * Math.sin(rad(a)), z);
  const depth = a => Math.sin(rad(a + st.phi)); /* > 0: far side */
  const pt = p => p[0].toFixed(1) + ' ' + p[1].toFixed(1);
  function ellipsePath(r, z, u0, v0) { let d = ''; for (let k = 0; k <= 72; k++) { const t = k / 72 * 2 * Math.PI, p = P((u0 || 0) + r * Math.cos(t), (v0 || 0) + r * Math.sin(t), z); d += (k ? 'L' : 'M') + pt(p); } return d + 'Z'; }

  const svg = $('ft-rig');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const defs = el('defs', null, svg);
  defs.innerHTML = `
    <linearGradient id="g-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b464e"/><stop offset=".62" stop-color="#2e383f"/><stop offset=".62" stop-color="#4a3b2e"/><stop offset="1" stop-color="#3a2d22"/></linearGradient>
    <radialGradient id="g-top" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#e3e7e9"/><stop offset=".55" stop-color="#c3c9cd"/><stop offset="1" stop-color="#9aa2a8"/></radialGradient>
    <linearGradient id="g-edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b646a"/><stop offset=".3" stop-color="#b8c0c5"/><stop offset=".55" stop-color="#e6eaec"/><stop offset=".8" stop-color="#8a9399"/><stop offset="1" stop-color="#4c555b"/></linearGradient>
    <linearGradient id="g-rod" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5d666c"/><stop offset=".4" stop-color="#dfe4e7"/><stop offset=".7" stop-color="#a3acb2"/><stop offset="1" stop-color="#4f585e"/></linearGradient>
    <linearGradient id="g-iron" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f474d"/><stop offset="1" stop-color="#1c2226"/></linearGradient>
    <linearGradient id="g-brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5a1e"/><stop offset=".28" stop-color="#d9b25a"/><stop offset=".5" stop-color="#f2d68f"/><stop offset=".75" stop-color="#b48a36"/><stop offset="1" stop-color="#6b4d16"/></linearGradient>
    <linearGradient id="g-brasstop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4dc9c"/><stop offset="1" stop-color="#b58b39"/></linearGradient>
    <linearGradient id="g-nickel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#666e74"/><stop offset=".35" stop-color="#d6dbde"/><stop offset=".55" stop-color="#f3f5f6"/><stop offset=".8" stop-color="#99a1a7"/><stop offset="1" stop-color="#5a6268"/></linearGradient>
    <linearGradient id="g-black" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#15191c"/><stop offset=".45" stop-color="#4b545a"/><stop offset="1" stop-color="#121518"/></linearGradient>
    <radialGradient id="g-bubble" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".6" stop-color="#e9f3cf" stop-opacity=".7"/><stop offset="1" stop-color="#b5c78a" stop-opacity=".5"/></radialGradient>
    <radialGradient id="g-vial" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#d6e3a6"/><stop offset="1" stop-color="#97ab60"/></radialGradient>
    <linearGradient id="g-wheel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b4248"/><stop offset=".5" stop-color="#9aa3a9"/><stop offset="1" stop-color="#2a3035"/></linearGradient>
    <filter id="f-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
    <pattern id="p-brush" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6" stroke="#fff" stroke-opacity=".06" stroke-width="1"/></pattern>`;
  const gBack = el('g', null, svg), gFar = el('g', null, svg), gTri = el('g', null, svg), gDisc = el('g', null, svg), gNear = el('g', null, svg), gPul = el('g', null, svg), gStr = el('g', null, svg), gHud = el('g', null, svg);

  /* fixed backdrop: wall, bench and a retort stand whose arm carries the hook above the centre */
  (function backdrop() {
    el('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#g-wall)' }, gBack);
    el('rect', { x: 0, y: H * .62, width: W, height: 3, fill: '#1d1712', opacity: .7 }, gBack);
    for (let k = 0; k < 9; k++) el('path', { d: `M0 ${H * .64 + k * 34} Q500 ${H * .64 + k * 34 + 8} 1000 ${H * .64 + k * 34 - 4}`, stroke: '#2a2018', 'stroke-width': 1, fill: 'none', opacity: .45 }, gBack);
    /* stand: base, rod, boss, arm, hook */
    el('ellipse', { cx: 96, cy: 742, rx: 70, ry: 16, fill: '#000', opacity: .35, filter: 'url(#f-soft)' }, gBack);
    el('path', { d: 'M30 724 h132 l10 22 h-152z', fill: 'url(#g-iron)' }, gBack);
    el('rect', { x: 89, y: 22, width: 14, height: 706, fill: 'url(#g-rod)' }, gBack);
    el('rect', { x: 80, y: 38, width: 32, height: 30, rx: 3, fill: 'url(#g-iron)' }, gBack);
    el('circle', { cx: 96, cy: 53, r: 5, fill: '#8a949a' }, gBack);
    el('rect', { x: 110, y: 46, width: CX - 104, height: 10, rx: 4, fill: 'url(#g-rod)' }, gBack);
    el('path', { d: `M${CX + 6} 46 h10 v10 h-10z`, fill: '#4b545a' }, gBack);
    el('path', { d: `M${CX} 56 v8 a5 5 0 1 0 5 5`, stroke: '#cfd5d9', 'stroke-width': 2.4, fill: 'none' }, gBack);
  })();
  const HOOKP = [CX, 70];

  /* tripod and levelling screws */
  function drawTripod() {
    gTri.innerHTML = '';
    const base = 268;
    el('ellipse', { cx: CX, cy: CY + base + 6, rx: 230, ry: 230 * K, fill: '#000', opacity: .28, filter: 'url(#f-soft)' }, gTri);
    const feet = FEET.map(f => ({ f, d: depth(f) })).sort((a, b) => b.d - a.d);
    const top = P(0, 0, -30), hub = P(0, 0, -base + 30);
    const legs = foot => { const p = PA(205, foot.f, -base), q = PA(40, foot.f, -base + 34); el('path', { d: `M${pt(hub)} L${pt(q)} L${pt(p)}`, stroke: 'url(#g-iron)', 'stroke-width': 18, 'stroke-linecap': 'round', fill: 'none' }, gTri); el('path', { d: `M${pt(hub)} L${pt(q)} L${pt(p)}`, stroke: '#566067', 'stroke-width': 3, fill: 'none', opacity: .7 }, gTri); };
    const screw = (foot, i) => {
      const p = PA(205, foot.f, -base);
      const g = el('g', { class: 'lvl-screw', 'data-i': i }, gTri);
      el('rect', { x: p[0] - 3, y: p[1] - 4, width: 6, height: 30, fill: 'url(#g-rod)' }, g);
      el('ellipse', { cx: p[0], cy: p[1] + 26, rx: 20, ry: 7, fill: 'url(#g-black)' }, g);
      el('rect', { x: p[0] - 20, y: p[1] + 18, width: 40, height: 8, fill: 'url(#g-black)' }, g);
      for (let k = -16; k <= 16; k += 4) el('path', { d: `M${p[0] + k} ${p[1] + 18}v8`, stroke: '#0c0f11', 'stroke-width': 1 }, g);
      el('ellipse', { cx: p[0], cy: p[1] + 18, rx: 20, ry: 7, fill: '#3a4247' }, g);
      txt(g, p[0], p[1] + 54, 'ABC'[i], { 'text-anchor': 'middle', 'font-size': 15, 'font-family': F_CAP, 'font-weight': 700, fill: '#d6dcdf' });
    };
    feet.filter(f => f.d > 0).forEach(f => { legs(f); screw(f, FEET.indexOf(f.f)); });
    el('rect', { x: CX - 13, y: top[1], width: 26, height: hub[1] - top[1], fill: 'url(#g-rod)' }, gTri);
    el('ellipse', { cx: hub[0], cy: hub[1], rx: 34, ry: 13, fill: 'url(#g-iron)' }, gTri);
    feet.filter(f => f.d <= 0).forEach(f => { legs(f); screw(f, FEET.indexOf(f.f)); });
  }

  /* disc: machined edge, brushed top, engraved degree scale, centre pin and a bull's-eye spirit level */
  function drawDisc() {
    gDisc.innerHTML = '';
    const T = 16;
    let side = ''; for (let k = 0; k <= 36; k++) { const a = 180 + k * 5 - st.phi; side += (k ? 'L' : 'M') + pt(PA(R, a, 0)); } for (let k = 36; k >= 0; k--) { const a = 180 + k * 5 - st.phi; side += 'L' + pt(PA(R, a, -T)); }
    el('path', { d: side + 'Z', fill: 'url(#g-edge)' }, gDisc);
    el('path', { d: ellipsePath(R, 0), fill: 'url(#g-top)', class: 'spin' }, gDisc);
    el('path', { d: ellipsePath(R, 0), fill: 'url(#p-brush)', 'pointer-events': 'none' }, gDisc);
    el('path', { d: ellipsePath(R - 4, 0), fill: 'none', stroke: '#7d868c', 'stroke-width': 1, 'pointer-events': 'none' }, gDisc);
    el('path', { d: ellipsePath(R - 44, 0), fill: 'none', stroke: '#3a4247', 'stroke-width': 1, opacity: .7, 'pointer-events': 'none' }, gDisc);
    const sc = el('g', { 'pointer-events': 'none' }, gDisc);
    let ticks = '', mid = '', big = '';
    for (let a = 0; a < 360; a++) {
      const L1 = a % 10 === 0 ? 20 : a % 5 === 0 ? 13 : 7, p = PA(R - 8, a, 0), q = PA(R - 8 - L1, a, 0), s = `M${pt(p)}L${pt(q)}`;
      if (a % 10 === 0) big += s; else if (a % 5 === 0) mid += s; else ticks += s;
    }
    el('path', { d: ticks, stroke: '#2a3136', 'stroke-width': .7 }, sc); el('path', { d: mid, stroke: '#20272c', 'stroke-width': 1.1 }, sc); el('path', { d: big, stroke: '#141a1e', 'stroke-width': 1.5 }, sc);
    for (let a = 0; a < 360; a += 10) {
      const p = PA(R - 58, a, 0), dz = depth(a);
      txt(sc, p[0], p[1] + 4.5, String(a), { 'text-anchor': 'middle', 'font-size': dz > .5 ? 11.5 : 13.5, 'font-family': F_CAP, 'font-weight': 600, fill: a % 90 === 0 ? '#8f3a0b' : '#1e262b' });
    }
    /* radial guide lines and centre cross */
    let rl = ''; for (let a = 0; a < 360; a += 30) rl += `M${pt(PA(28, a, 0))}L${pt(PA(R - 70, a, 0))}`;
    el('path', { d: rl, stroke: '#3a4247', 'stroke-width': .6, opacity: .35 }, sc);
    el('path', { d: ellipsePath(30, 0), fill: 'none', stroke: '#3a4247', 'stroke-width': .8, opacity: .6 }, sc);
    el('path', { d: ellipsePath(10, 0), fill: 'none', stroke: '#3a4247', 'stroke-width': .8, opacity: .6 }, sc);
    /* spirit level */
    const lu = 165 * Math.cos(rad(150)), lv = 165 * Math.sin(rad(150));
    const lg = el('g', { 'pointer-events': 'none' }, gDisc);
    el('path', { d: ellipsePath(20, 0, lu, lv), fill: '#000', opacity: .25 }, lg);
    const top = P(lu, lv, 8), bot = P(lu, lv, 0);
    el('path', { d: ellipsePath(18, 0, lu, lv), fill: 'url(#g-black)' }, lg);
    el('rect', { x: top[0] - 18, y: top[1], width: 36, height: bot[1] - top[1], fill: 'url(#g-black)' }, lg);
    el('path', { d: ellipsePath(18, 8, lu, lv), fill: '#2b3237' }, lg);
    el('path', { d: ellipsePath(14, 8, lu, lv), fill: 'url(#g-vial)' }, lg);
    el('path', { d: ellipsePath(5, 8.2, lu, lv), fill: 'none', stroke: '#1b2414', 'stroke-width': 1 }, lg);
    LV.bubble = el('ellipse', { rx: 4.2, ry: 4.2 * K + 1, fill: 'url(#g-bubble)', stroke: '#6d7f45', 'stroke-width': .6 }, lg);
    LV.u = lu; LV.v = lv;
    /* centre pin */
    const p0 = P(0, 0, 0), p1 = P(0, 0, 16);
    el('ellipse', { cx: p0[0], cy: p0[1], rx: 4, ry: 2, fill: '#1b2125' }, gDisc);
    el('rect', { x: p1[0] - 2, y: p1[1], width: 4, height: p0[1] - p1[1], fill: 'url(#g-rod)' }, gDisc);
    el('ellipse', { cx: p1[0], cy: p1[1], rx: 2.4, ry: 1.2, fill: '#eef1f2' }, gDisc);
  }
  const LV = { bubble: null, u: 0, v: 0 };

  /* pulleys, clamps, drop strings and hangers in the oblique view */
  function slotStack(g, x, yBase, stack, sc) {
    /* yBase: top of the hanger base plate; masses stack upwards; sc: scale */
    let y = yBase;
    stack.forEach(m => {
      const th = (m === 200 ? 20 : m === 100 ? 13 : m === 50 ? 8 : m === 20 ? 6 : 4.5) * sc, rw = (m >= 50 ? 26 : 20) * sc, ry = rw * .32;
      const fill = m >= 100 ? 'url(#g-brass)' : 'url(#g-nickel)', topf = m >= 100 ? 'url(#g-brasstop)' : '#e1e5e7';
      el('path', { d: `M${x - rw} ${y} v${-th} a${rw} ${ry} 0 0 0 ${2 * rw} 0 v${th} a${rw} ${ry} 0 0 1 ${-2 * rw} 0z`, fill, stroke: '#3d2d10', 'stroke-width': .5 }, g);
      el('ellipse', { cx: x, cy: y - th, rx: rw, ry, fill: topf, stroke: '#5c4718', 'stroke-width': .5 }, g);
      el('path', { d: `M${x} ${y - th} l${rw} ${-ry * .2}`, stroke: '#2a1e08', 'stroke-width': 2.2 * sc, opacity: .55 }, g);
      y -= th;
    });
    return y;
  }
  function hangerAt(g, top, i, sc) {
    const x = top[0], y = top[1];
    el('path', { d: `M${x} ${y} v${10 * sc} a${4 * sc} ${4 * sc} 0 1 1 ${-4 * sc} ${4 * sc}`, stroke: '#cfd5d9', 'stroke-width': 1.6 * sc, fill: 'none' }, g);
    const rodTop = y + 12 * sc, base = y + 86 * sc;
    el('rect', { x: x - 2 * sc, y: rodTop, width: 4 * sc, height: base - rodTop, fill: 'url(#g-black)' }, g);
    const bw = 24 * sc, bry = bw * .32;
    el('path', { d: `M${x - bw} ${base} v${6 * sc} a${bw} ${bry} 0 0 0 ${2 * bw} 0 v${-6 * sc}z`, fill: 'url(#g-black)' }, g);
    el('ellipse', { cx: x, cy: base, rx: bw, ry: bry, fill: '#3b4348' }, g);
    slotStack(g, x, base, st.stack[i], sc);
    txt(g, x, base + 30 * sc, NAME[i], { 'text-anchor': 'middle', 'font-size': 16, 'font-family': F_CAP, 'font-weight': 700, fill: '#e9edef' });
  }
  const pulleyHit = [];
  function drawPulleys() {
    gFar.innerHTML = ''; gNear.innerHTML = ''; gPul.innerHTML = ''; pulleyHit.length = 0;
    const order = [0, 1, 2].sort((a, b) => depth(st.a[b]) - depth(st.a[a]));
    order.forEach(i => {
      const a = st.a[i], far = depth(a) > 0, gH = far ? gFar : gNear;
      const out = PA(R + 33, a, 14), hk = [out[0], out[1] + DROP];
      el('path', { d: `M${pt(out)}L${pt(hk)}`, stroke: '#ece6d6', 'stroke-width': 1.4 }, gH);
      hangerAt(gH, hk, i, 1);
      /* clamp: a block over the rim with a thumbscrew below */
      const g = el('g', { class: 'pulley kfocus drag', tabindex: 0, role: 'slider', 'aria-label': `${NAME[i]} pulley angle`, 'aria-valuemin': 0, 'aria-valuemax': 359, 'aria-valuenow': a, 'data-i': i }, gPul);
      const c1 = PA(R - 10, a - 2.2, 0), c2 = PA(R + 14, a - 2.2, 0), c3 = PA(R + 14, a + 2.2, 0), c4 = PA(R - 10, a + 2.2, 0);
      const d1 = PA(R + 14, a - 2.2, -20), d2 = PA(R + 14, a + 2.2, -20);
      const gL = far ? gH : g; /* the lower jaw and thumbscrew sit under the rim: hidden by the disc on the far side */
      el('path', { d: `M${pt(c2)}L${pt(d1)}L${pt(d2)}L${pt(c3)}Z`, fill: '#262d32' }, gL);
      el('path', { d: `M${pt(c1)}L${pt(c2)}L${pt(c3)}L${pt(c4)}Z`, fill: '#4a535a', stroke: '#1a1f23', 'stroke-width': .8 }, g);
      const ts = PA(R + 4, a, -26); el('rect', { x: ts[0] - 2, y: ts[1] - 6, width: 4, height: 14, fill: 'url(#g-rod)' }, gL); el('ellipse', { cx: ts[0], cy: ts[1] + 9, rx: 7, ry: 3, fill: '#8a949a' }, gL);
      /* bracket and wheel in the radial vertical plane */
      const b1 = PA(R + 4, a, 2), b2 = PA(R + 18, a, 14);
      el('path', { d: `M${pt(b1)}L${pt(b2)}`, stroke: '#3b4247', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
      let wd = ''; const ca = Math.cos(rad(a)), sa = Math.sin(rad(a));
      for (let k = 0; k <= 40; k++) { const t = k / 40 * 2 * Math.PI, r = R + 18 + 14 * Math.cos(t), z = 14 + 14 * Math.sin(t); wd += (k ? 'L' : 'M') + pt(P(r * ca, r * sa, z)); }
      el('path', { d: wd + 'Z', fill: 'url(#g-wheel)', stroke: '#1b2024', 'stroke-width': 1.2 }, g);
      let wd2 = ''; for (let k = 0; k <= 40; k++) { const t = k / 40 * 2 * Math.PI, r = R + 18 + 8 * Math.cos(t), z = 14 + 8 * Math.sin(t); wd2 += (k ? 'L' : 'M') + pt(P(r * ca, r * sa, z)); }
      el('path', { d: wd2 + 'Z', fill: 'none', stroke: '#2b3237', 'stroke-width': 1 }, g);
      const ax = P((R + 18) * ca, (R + 18) * sa, 14); el('circle', { cx: ax[0], cy: ax[1], r: 2.6, fill: '#d8dde0' }, g);
      /* index mark on the scale and a coloured tag */
      el('path', { d: `M${pt(PA(R - 6, a, .5))}L${pt(PA(R - 30, a, .5))}`, stroke: COL[i], 'stroke-width': 2.4 }, g);
      const tg = PA(R + 62, a, 30);
      el('rect', { x: tg[0] - 19, y: tg[1] - 12, width: 38, height: 22, rx: 5, fill: COL[i], stroke: '#0e1215', 'stroke-width': .8 }, g);
      txt(g, tg[0], tg[1] + 4.5, NAME[i], { 'text-anchor': 'middle', 'font-size': 13.5, 'font-family': F_CAP, 'font-weight': 700, fill: '#fff' });
      const hit = PA(R + 18, a, 14); el('circle', { cx: hit[0], cy: hit[1], r: 34, fill: 'transparent', class: 'hit' }, g);
      el('rect', { class: 'focus-ring', x: hit[0] - 30, y: hit[1] - 30, width: 60, height: 60, rx: 8, fill: 'none' }, g);
      pulleyHit[i] = g;
    });
  }

  /* strings, ring and the overhead thread: updated every frame */
  const strs = [0, 1, 2].map(i => el('path', { stroke: '#f3eddc', 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }, gStr));
  const plumb = el('path', { stroke: '#e9eef0', 'stroke-width': 1, 'stroke-dasharray': '3 5', opacity: .35, fill: 'none' }, gStr);
  const thread = el('path', { stroke: '#fbf6e8', 'stroke-width': 1.5, fill: 'none' }, gStr);
  const ringShadow = el('ellipse', { rx: 15, ry: 15 * K, fill: '#000', opacity: .25 }, gStr);
  const ringO = el('ellipse', { rx: 15, ry: 15 * K, fill: 'none', stroke: 'url(#g-nickel)', 'stroke-width': 4.5 }, gStr);
  const ringI = el('ellipse', { rx: 15, ry: 15 * K, fill: 'none', stroke: '#2b3237', 'stroke-width': .8 }, gStr);
  const knots = [0, 1, 2].map(i => el('circle', { r: 2.6, fill: COL[i] }, gStr));

  /* HUD: plan view of the ring, spirit level close-up and the balance lamp */
  const plan = el('g', { transform: 'translate(880 120)' }, gHud);
  el('rect', { x: -96, y: -98, width: 192, height: 228, rx: 12, fill: '#20282e', stroke: '#566168', 'stroke-width': 1 }, plan);
  txt(plan, 0, -78, 'RING FROM ABOVE', { 'text-anchor': 'middle', 'font-size': 11.5, 'letter-spacing': '.12em', 'font-family': F_CAP, 'font-weight': 600, fill: '#aeb8be' });
  el('circle', { r: 58, cy: 4, fill: '#2c353b', stroke: '#566168' }, plan);
  el('circle', { r: 9, cy: 4, fill: 'none', stroke: '#7fb48f', 'stroke-width': 1.2, 'stroke-dasharray': '2 2' }, plan);
  el('path', { d: 'M-58 4h116M0 -54v116', stroke: '#566168', 'stroke-width': .8 }, plan);
  el('circle', { r: 2.5, cy: 4, fill: '#cfd5d9' }, plan);
  const planRing = el('circle', { r: 12, cy: 4, fill: 'none', stroke: '#e2e7ea', 'stroke-width': 3 }, plan);
  const planArrow = el('path', { stroke: '#e2864a', 'stroke-width': 2, fill: 'none' }, plan);
  const lamp = el('circle', { cx: -66, cy: 96, r: 7, fill: '#3b2f26' }, plan);
  const lampT = txt(plan, -52, 101, 'NOT BALANCED', { 'font-size': 12.5, 'letter-spacing': '.08em', 'font-family': F_CAP, 'font-weight': 700, fill: '#c9a48c' });
  const slantT = txt(plan, 0, 122, '', { 'text-anchor': 'middle', 'font-size': 11.5, 'font-family': F_CAP, 'font-weight': 500, fill: '#aeb8be' });
  const lvBox = el('g', { transform: 'translate(120 130)' }, gHud);
  el('rect', { x: -64, y: -62, width: 128, height: 140, rx: 12, fill: '#20282e', stroke: '#566168' }, lvBox);
  txt(lvBox, 0, -44, 'SPIRIT LEVEL', { 'text-anchor': 'middle', 'font-size': 11.5, 'letter-spacing': '.12em', 'font-family': F_CAP, 'font-weight': 600, fill: '#aeb8be' });
  el('circle', { r: 40, cy: 6, fill: 'url(#g-vial)', stroke: '#0f1316', 'stroke-width': 3 }, lvBox);
  el('circle', { r: 12, cy: 6, fill: 'none', stroke: '#1b2414', 'stroke-width': 1.2 }, lvBox);
  el('path', { d: 'M-40 6h80M0 -34v80', stroke: '#1b2414', 'stroke-width': .5, opacity: .5 }, lvBox);
  const lvB = el('circle', { r: 9.5, cy: 6, fill: 'url(#g-bubble)', stroke: '#6d7f45', 'stroke-width': .8 }, lvBox);
  const lvT = txt(lvBox, 0, 66, '', { 'text-anchor': 'middle', 'font-size': 12, 'font-family': F_CAP, 'font-weight': 600, fill: '#aeb8be' });

  /* ring motion: a lightly damped spring towards the equilibrium offset, on the tutorial clock */
  const ring = { x: 0, y: 0, vx: 0, vy: 0, t: null };
  function stepRing() {
    const now = L.tnow(), tg = target();
    if (ring.t == null) ring.t = now;
    let dt = Math.min(0.25, (now - ring.t) / 1000); ring.t = now;
    if (L.tut && L.tut.on && L.tut.skip) { ring.x = tg.x; ring.y = tg.y; ring.vx = ring.vy = 0; dt = 0; }
    while (dt > 0) { const h = Math.min(dt, 1 / 120); const k = 38, c = 5.2; ring.vx += (-k * (ring.x - tg.x) - c * ring.vx) * h; ring.vy += (-k * (ring.y - tg.y) - c * ring.vy) * h; ring.x += ring.vx * h; ring.y += ring.vy * h; dt -= h; }
  }
  function placeRing() {
    const rp = P(ring.x, ring.y, 4), c = Math.cos(rad(st.phi)), s = Math.sin(rad(st.phi));
    [ringO, ringI].forEach(e => { e.setAttribute('cx', rp[0].toFixed(1)); e.setAttribute('cy', rp[1].toFixed(1)); });
    ringShadow.setAttribute('cx', rp[0].toFixed(1)); ringShadow.setAttribute('cy', (rp[1] + 4).toFixed(1));
    for (let i = 0; i < 3; i++) {
      const a = st.a[i], ku = ring.x + 15 * Math.cos(rad(a)), kv = ring.y + 15 * Math.sin(rad(a)), kp = P(ku, kv, 4), tp = PA(R + 18, a, 28);
      strs[i].setAttribute('d', `M${pt(kp)}L${pt(tp)}`); knots[i].setAttribute('cx', kp[0].toFixed(1)); knots[i].setAttribute('cy', kp[1].toFixed(1));
    }
    const top = P(ring.x, ring.y, 6);
    thread.setAttribute('d', `M${HOOKP[0]} ${HOOKP[1] + 12}L${pt(top)}`); plumb.setAttribute('d', `M${HOOKP[0]} ${HOOKP[1] + 12}L${pt(P(0, 0, 16))}`);
    const off = Math.hypot(ring.x, ring.y), ok = balanced() && off < 1.2;
    thread.setAttribute('stroke', ok ? '#a8e0b6' : '#fbf6e8');
    /* plan view */
    const sx = ring.x * c - ring.y * s, sy = ring.x * s + ring.y * c, mag = 1.05;
    planRing.setAttribute('cx', (sx * mag).toFixed(1)); planRing.setAttribute('cy', (4 - sy * mag).toFixed(1));
    planArrow.setAttribute('d', off > 2 ? `M0 4L${(sx * mag).toFixed(1)} ${(4 - sy * mag).toFixed(1)}` : '');
    lamp.setAttribute('fill', ok ? '#5fe08a' : '#3b2f26'); lamp.setAttribute('filter', ''); lampT.textContent = ok ? 'BALANCED' : 'NOT BALANCED'; lampT.setAttribute('fill', ok ? '#9fe6b4' : '#c9a48c');
    const slant = Math.atan2(off, HOOK) * 180 / Math.PI;
    slantT.textContent = `thread slant ${slant.toFixed(1)}°`;
    /* spirit level */
    const t = tilt(), bx = clamp(t.x, -1, 1), by = clamp(t.y, -1, 1), bu = LV.u + bx * 9, bv = LV.v + by * 9, bp = P(bu, bv, 8.4);
    if (LV.bubble) { LV.bubble.setAttribute('cx', bp[0].toFixed(1)); LV.bubble.setAttribute('cy', bp[1].toFixed(1)); }
    const vx = bx * c - by * s, vy = bx * s + by * c;
    lvB.setAttribute('cx', (vx * 28).toFixed(1)); lvB.setAttribute('cy', (6 - vy * 28).toFixed(1));
    lvT.textContent = level() ? 'level' : 'not level';
    lvT.setAttribute('fill', level() ? '#9fe6b4' : '#e2b08c');
  }
  (function loop() { stepRing(); placeRing(); requestAnimationFrame(loop); })();

  /* ---------- state changes ---------- */
  const listeners = [];
  function changed(kind) { listeners.forEach(f => f(kind)); BENCH.draw(); }
  function full() { drawTripod(); drawDisc(); drawPulleys(); placeRing(); }
  const norm = a => ((Math.round(a) % 360) + 360) % 360;
  const gap = (a, b) => { const d = Math.abs(norm(a) - norm(b)) % 360; return Math.min(d, 360 - d); };
  function setAngle(i, a) {
    a = norm(a);
    for (let j = 0; j < 3; j++) if (j !== i && gap(a, st.a[j]) < 14) return false; /* the clamps cannot overlap */
    if (st.a[i] === a) return true;
    st.a[i] = a; drawPulleys(); changed('angle'); return true;
  }
  function nudge(i, d) { const a0 = st.a[i]; let a = a0 + d; let tries = 0; while (!setAngle(i, a) && tries < 40) { a += Math.sign(d); tries++; } return st.a[i] !== a0; }
  function setPhi(p) { st.phi = ((p % 360) + 540) % 360 - 180; full(); changed('view'); }
  const slotTotal = i => st.stack[i].reduce((s, g) => s + g, 0);
  function addMass(i, g) { if (slotTotal(i) + g > MAXSLOT) return false; st.stack[i].push(g); drawPulleys(); changed('mass'); return true; }
  function liftTop(i) { if (!st.stack[i].length) return null; const g = st.stack[i].pop(); drawPulleys(); changed('mass'); return g; }
  function turnScrew(i, d) { st.h[i] = Math.round((st.h[i] + d) * 10) / 10; changed('level'); }
  function reset() { Object.assign(st, DEF()); ring.x = ring.y = ring.vx = ring.vy = 0; const tg = target(); ring.x = tg.x; ring.y = tg.y; full(); changed('reset'); }
  function snapshot() { return JSON.parse(JSON.stringify({ a: st.a, stack: st.stack, phi: st.phi, h: st.h })); }

  /* ---------- pointer: drag a pulley round the rim, or spin the table by dragging its top ---------- */
  const tableAngle = p => { const x = p.x - CX, y = (CY - p.y) / K; return Math.atan2(y, x) * 180 / Math.PI - st.phi; };
  let drag = null;
  svg.addEventListener('pointerdown', e => {
    if (L.tut && L.tut.on) return;
    const g = e.target.closest('.pulley'), sp = e.target.closest('.spin');
    if (!g && !sp) return;
    e.preventDefault(); svg.setPointerCapture(e.pointerId); L.cursorTick && L.cursorTick();
    const p = svgPoint(svg, e);
    if (g) { const i = +g.dataset.i; st.focus = i; drag = { kind: 'pulley', i }; g.focus({ preventScroll: true }); }
    else drag = { kind: 'spin', a0: tableAngle(p) + st.phi, phi0: st.phi };
  });
  svg.addEventListener('pointermove', e => {
    if (!drag) return; const p = svgPoint(svg, e);
    if (drag.kind === 'pulley') { const a = tableAngle(p); if (!setAngle(drag.i, a)) { /* blocked by a neighbour: stay */ } listeners.forEach(f => f('drag')); }
    else { const a = tableAngle(p) + st.phi; let d = a - drag.a0; d = ((d + 540) % 360) - 180; setPhi(drag.phi0 + d); }
  });
  const end = () => { drag = null; };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  svg.addEventListener('keydown', e => {
    const g = e.target.closest && e.target.closest('.pulley'); if (!g || (L.tut && L.tut.on)) return;
    const i = +g.dataset.i, step = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); nudge(i, -step); refocus(i); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); nudge(i, step); refocus(i); }
  });
  function refocus(i) { const g = pulleyHit[i]; if (g) g.focus({ preventScroll: true }); }

  /* spotlight boxes in rig coordinates */
  const bb = (pts, pad) => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad; return [x0, y0, Math.max(...xs) - x0 + pad, Math.max(...ys) - y0 + pad]; };
  const box = {
    disc: () => [CX - R - 10, CY - R * K - 10, 2 * R + 20, 2 * R * K + 40],
    scale: () => bb([PA(R, 300 - st.phi, 0), PA(R, 240 - st.phi, 0), PA(R - 70, 270 - st.phi, 0)], 10),
    tripod: () => bb(FEET.map(f => PA(205, f, -268)).concat([P(0, 0, -30)]), 40),
    screw: i => { const p = PA(205, FEET[i], -268); return [p[0] - 32, p[1] - 12, 64, 76]; },
    level: () => { const p = P(LV.u, LV.v, 4); return [p[0] - 30, p[1] - 22, 60, 40]; },
    levelInset: () => [52, 64, 136, 146],
    pin: () => { const p = P(0, 0, 8); return [p[0] - 34, p[1] - 26, 68, 52]; },
    ring: () => { const p = P(ring.x, ring.y, 4); return [p[0] - 36, p[1] - 26, 72, 52]; },
    thread: () => { const p = P(ring.x, ring.y, 4); const x0 = Math.min(p[0], CX) - 30; return [x0, HOOKP[1] - 30, Math.abs(p[0] - CX) + 60, p[1] - HOOKP[1] + 50]; },
    hook: () => [CX - 70, 30, 140, 70],
    stand: () => [70, 20, CX - 40, 740],
    pulley: i => { const p = PA(R + 18, st.a[i], 14); return [p[0] - 44, p[1] - 44, 88, 88]; },
    hanger: i => { const o = PA(R + 33, st.a[i], 14), y = o[1] + DROP; return [o[0] - 40, y - 10, 80, 140]; },
    string: i => bb([P(ring.x, ring.y, 4), PA(R + 18, st.a[i], 28)], 14),
    plan: () => [780, 18, 200, 236],
    sector: (a, b) => bb([P(0, 0, 0), PA(R, a, 0), PA(R, (a + b) / 2, 0), PA(R, b, 0)], 14)
  };

  /* ================= bench: mass tray and three hangers in close-up ================= */
  const bsvg = $('ft-bench');
  const BW = 1000, BH = 380, HX = [560, 720, 880], HBASE = 300;
  bsvg.setAttribute('viewBox', `0 0 ${BW} ${BH}`);
  const bdefs = el('defs', null, bsvg); bdefs.innerHTML = defs.innerHTML.replace(/id="/g, 'id="b');
  const fillB = s => s.replace(/url\(#/g, 'url(#b');
  const bBack = el('g', null, bsvg), bTray = el('g', null, bsvg), bH = el('g', null, bsvg), bGhost = el('g', { 'pointer-events': 'none' }, bsvg);
  (function benchBack() {
    el('rect', { x: 0, y: 0, width: BW, height: BH, fill: '#2d373e' }, bBack);
    el('rect', { x: 0, y: 330, width: BW, height: 50, fill: '#3e3126' }, bBack);
    el('rect', { x: 0, y: 328, width: BW, height: 3, fill: '#1b1510' }, bBack);
    /* tray: a wooden block with pegs */
    el('path', { d: 'M24 300 h400 l14 30 h-428z', fill: '#6b4a2b' }, bBack);
    el('rect', { x: 24, y: 286, width: 400, height: 16, rx: 3, fill: '#8a6239' }, bBack);
    for (let k = 0; k < 14; k++) el('path', { d: `M${30 + k * 28} 290 q10 4 20 0`, stroke: '#6d4b29', 'stroke-width': 1, fill: 'none', opacity: .6 }, bBack);
    txt(bBack, 224, 356, 'SLOTTED MASSES · drag onto a hanger', { 'text-anchor': 'middle', 'font-size': 13, 'letter-spacing': '.1em', 'font-family': F_CAP, 'font-weight': 600, fill: '#d8c7b1' });
    txt(bBack, 472, 160, 'HANGERS', { 'text-anchor': 'middle', transform: 'rotate(-90 472 160)', 'font-size': 13, 'letter-spacing': '.1em', 'font-family': F_CAP, 'font-weight': 600, fill: '#aeb8be' });
  })();
  const TRAYX = { 200: 68, 100: 152, 50: 232, 20: 306, 10: 376 };
  const dims = m => ({ th: m === 200 ? 26 : m === 100 ? 16 : m === 50 ? 10 : m === 20 ? 7 : 5.5, rw: m >= 50 ? 44 : 30 });
  function piece(g, x, y, m, cls) {
    const { th, rw } = dims(m), ry = rw * .3, fill = m >= 100 ? 'url(#bg-brass)' : 'url(#bg-nickel)', topf = m >= 100 ? 'url(#bg-brasstop)' : '#e1e5e7';
    const pg = el('g', { class: cls || '', 'data-m': m }, g);
    el('path', { d: `M${x - rw} ${y} v${-th} a${rw} ${ry} 0 0 0 ${2 * rw} 0 v${th} a${rw} ${ry} 0 0 1 ${-2 * rw} 0z`, fill, stroke: '#3d2d10', 'stroke-width': .7 }, pg);
    el('ellipse', { cx: x, cy: y - th, rx: rw, ry, fill: topf, stroke: '#5c4718', 'stroke-width': .7 }, pg);
    el('path', { d: `M${x} ${y - th} l${rw + 1} ${-ry * .15}`, stroke: '#20170a', 'stroke-width': 4, opacity: .6 }, pg);
    el('circle', { cx: x, cy: y - th, r: 3.4, fill: '#20170a', opacity: .8 }, pg);
    if (th >= 9) txt(pg, x - rw * .35, y - th / 2 + 4.5, m + ' g', { 'text-anchor': 'middle', 'font-size': th >= 16 ? 12 : 10, 'font-family': F_CAP, 'font-weight': 700, fill: m >= 100 ? '#3d2a08' : '#2a3035' });
    return pg;
  }
  function drawTray() {
    bTray.innerHTML = '';
    SLOTS.forEach(m => {
      const x = TRAYX[m], { th } = dims(m);
      el('rect', { x: x - 3, y: 286 - 120, width: 6, height: 122, fill: 'url(#bg-rod)' }, bTray);
      let y = 288; for (let k = 0; k < 4; k++) { piece(bTray, x, y, m, 'tray-pc drag'); y -= th + 1; }
      txt(bTray, x, 316, m + ' g', { 'text-anchor': 'middle', 'font-size': 14, 'font-family': F_CAP, 'font-weight': 700, fill: '#f1e4d2' });
    });
  }
  const BENCH = {
    draw() {
      bH.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const x = HX[i], g = el('g', { class: 'bh', 'data-i': i }, bH);
        el('rect', { x: x - 74, y: 30, width: 148, height: 296, rx: 10, fill: '#fff', opacity: .03, class: 'drop-zone' }, g);
        el('path', { d: `M${x} 0 V44`, stroke: '#ece6d6', 'stroke-width': 1.6 }, g);
        el('path', { d: `M${x} 44 v10 a7 7 0 1 1 -7 7`, stroke: '#cfd5d9', 'stroke-width': 2.4, fill: 'none' }, g);
        el('rect', { x: x - 3.5, y: 64, width: 7, height: HBASE - 64, fill: 'url(#bg-black)' }, g);
        el('path', { d: `M${x - 48} ${HBASE} v9 a48 14 0 0 0 96 0 v-9z`, fill: 'url(#bg-black)' }, g);
        el('ellipse', { cx: x, cy: HBASE, rx: 48, ry: 14, fill: '#3b4348' }, g);
        let y = HBASE;
        st.stack[i].forEach((m, k) => { piece(g, x, y, m, k === st.stack[i].length - 1 ? 'top-pc drag' : ''); y -= dims(m).th + .5; });
        el('rect', { x: x - 26, y: 6, width: 52, height: 24, rx: 6, fill: COL[i], stroke: '#0e1215' }, g);
        txt(g, x, 23, NAME[i], { 'text-anchor': 'middle', 'font-size': 15, 'font-family': F_CAP, 'font-weight': 700, fill: '#fff' });
        el('rect', { x: x - 54, y: 334, width: 108, height: 30, rx: 6, fill: '#a3b18c', stroke: '#0e1215' }, g);
        txt(g, x, 355, massKg(i).toFixed(3) + ' kg', { 'text-anchor': 'middle', 'font-size': 17, 'font-family': F_CAP, 'font-weight': 700, fill: '#1b2414' });
      }
    }
  };
  bBox();
  function bBox() { /* placeholder to keep hoisting order clear */ }
  const bbox = {
    tray: () => [20, 140, 424, 230],
    trayPiece: m => [TRAYX[m] - 50, 190, 100, 140],
    hanger: i => [HX[i] - 76, 0, 152, 372],
    stackTop: i => { let y = HBASE; st.stack[i].forEach(m => { y -= dims(m).th + .5; }); return [HX[i] - 58, y - 30, 116, HBASE - y + 50]; }
  };
  /* drag a piece from the tray or off the top of a stack, and drop it on a hanger */
  let bd = null;
  const hangerAtX = x => { for (let i = 0; i < 3; i++) if (Math.abs(x - HX[i]) < 76) return i; return -1; };
  function ghost(x, y, m) { bGhost.innerHTML = ''; if (m) piece(bGhost, x, y + dims(m).th / 2, m); }
  bsvg.addEventListener('pointerdown', e => {
    if (L.tut && L.tut.on) return;
    const tp = e.target.closest('.tray-pc'), sp = e.target.closest('.top-pc');
    if (!tp && !sp) return;
    e.preventDefault(); bsvg.setPointerCapture(e.pointerId); L.cursorTick && L.cursorTick();
    const p = svgPoint(bsvg, e), m = +(tp || sp).dataset.m;
    bd = { m, from: tp ? -1 : +sp.closest('.bh').dataset.i, x0: p.x, y0: p.y, moved: false };
  });
  bsvg.addEventListener('pointermove', e => {
    if (!bd) return; const p = svgPoint(bsvg, e);
    if (!bd.moved && Math.hypot(p.x - bd.x0, p.y - bd.y0) > 6) { bd.moved = true; if (bd.from >= 0) liftTop(bd.from); }
    if (bd.moved) ghost(p.x, p.y, bd.m);
  });
  function bEnd(e) {
    if (!bd) return; const p = svgPoint(bsvg, e), d = bd; bd = null; bGhost.innerHTML = '';
    if (!d.moved) return;
    const i = hangerAtX(p.x);
    if (i >= 0 && p.y < 340) { if (!addMass(i, d.m)) { L.FTmsg && L.FTmsg(`${NAME[i]} hanger is full: at most ${MAXSLOT} g of slotted masses.`, 'warn'); } }
  }
  bsvg.addEventListener('pointerup', bEnd); bsvg.addEventListener('pointercancel', () => { if (bd && bd.moved && bd.from >= 0) { /* lifted piece goes back to the tray */ } bd = null; bGhost.innerHTML = ''; });
  /* animated move for the tutorial: a piece travels from the tray to a hanger (or back) on the tutorial clock */
  async function flyPiece(m, fromX, fromY, toX, toY, ms) {
    await L.tween(ms, k => { const e = L.ease(k), x = fromX + (toX - fromX) * e, y = fromY + (toY - fromY) * e - Math.sin(Math.PI * e) * 70; ghost(x, y, m); });
    bGhost.innerHTML = '';
  }
  const stackTopY = i => { let y = HBASE; st.stack[i].forEach(m => { y -= dims(m).th + .5; }); return y; };
  async function tutAdd(i, m, ms) { await flyPiece(m, TRAYX[m], 200, HX[i], stackTopY(i) - dims(m).th / 2 - 4, ms); addMass(i, m); }
  async function tutRemove(i, ms) { const m = st.stack[i][st.stack[i].length - 1]; if (!m) return; const y = stackTopY(i); liftTop(i); await flyPiece(m, HX[i], y, TRAYX[m], 200, ms); }

  const VIEWS = { full: `0 0 ${W} ${H}`, top: '30 14 950 530', pair: '30 14 950 410' };
  function setView(m) { const v = VIEWS[m] || VIEWS.full; if (svg.getAttribute('viewBox') !== v) svg.setAttribute('viewBox', v); }
  drawTray(); full();
  L.FT = { setView, st, G, HANGER, SLOTS, FR, NAME, COL, massKg, force, net, balanced, level, tilt, target, setAngle, nudge, setPhi, addMass, liftTop, turnScrew, reset, snapshot, slotTotal, box, bbox, svg, bsvg, listeners, ring, tutAdd, tutRemove, pulleyHit, norm, gap, depth, full, MAXSLOT };
  void tsub; void F_HEAD; void F_BODY;
})(window.SOL);

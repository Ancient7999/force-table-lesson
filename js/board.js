/* Drawing board: the graphical method, head to tail and to scale, with a ruler and protractors */
(function (L) {
  'use strict';
  const { $, el, txt, tsub, clamp, svgPoint, F_CAP, F_BODY } = L;
  const svg = $('ft-board'), W = 900, H = 560, PX = 56; /* 56 px per cm */
  const O = [64, 470];
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const DEF = () => ({ l1: 0, l2: 0, th: 0, R: false, ruler: null, para: false, src: null });
  const bd = DEF();
  const defs = el('defs', null, svg);
  defs.innerHTML = `<pattern id="bp-mm" width="${PX / 10}" height="${PX / 10}" patternUnits="userSpaceOnUse"><path d="M${PX / 10} 0V${PX / 10}H0" fill="none" stroke="#9fb0a2" stroke-width=".35"/></pattern>
    <pattern id="bp-cm" width="${PX}" height="${PX}" patternUnits="userSpaceOnUse" x="${O[0]}" y="${O[1]}"><rect width="${PX}" height="${PX}" fill="url(#bp-mm)"/><path d="M${PX} 0V${PX}H0" fill="none" stroke="#7f9584" stroke-width=".9"/></pattern>
    <linearGradient id="bp-ruler" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9efe3" stop-opacity=".82"/><stop offset="1" stop-color="#cbd6c4" stop-opacity=".82"/></linearGradient>
    ${['f1', 'f2', 'fr'].map(k => `<marker id="bm-${k}" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 1 L11 6 L0 11 L3 6z" fill="var(--${k})"/></marker>`).join('')}
    <filter id="bp-pencil"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.1"/></filter>`;
  el('rect', { x: 0, y: 0, width: W, height: H, fill: '#c9d3c8' }, svg);
  el('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#bp-cm)' }, svg);
  const gScale = el('g', null, svg), gDraw = el('g', null, svg), gTools = el('g', null, svg), gLab = el('g', null, svg), gH = el('g', null, svg);
  const read = $('ft-bread');

  const scale = () => { const s = bd.src; if (!s) return 0.5; return (s.F1 + s.F2) / 0.5 <= 13 ? 0.5 : (s.F1 + s.F2) <= 13 ? 1 : 2; };
  const r1 = v => Math.round(v * 10) / 10;
  const tip1 = () => [O[0] + bd.l1 * PX, O[1]];
  const tip2 = () => { const t = tip1(); return [t[0] + bd.l2 * PX * Math.cos(rad(bd.th)), t[1] - bd.l2 * PX * Math.sin(rad(bd.th))]; };
  function rGeom() { const t = tip2(), dx = (t[0] - O[0]) / PX, dy = (O[1] - t[1]) / PX; return { len: Math.hypot(dx, dy), ang: deg(Math.atan2(dy, dx)) }; }
  const lrRead = () => bd.ruler && bd.R && Math.abs(bd.ruler - rGeom().ang) < 0.01 ? r1(rGeom().len) : null;
  const alRead = () => bd.R ? Math.round(rGeom().ang) : null;

  function arrow(g, a, b, k, w, dash) {
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 2) return null;
    return el('path', { d: `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`, stroke: `var(--${k})`, 'stroke-width': w || 3, 'marker-end': `url(#bm-${k})`, 'stroke-dasharray': dash || null, 'stroke-linecap': 'round', filter: 'url(#bp-pencil)' }, g);
  }
  function protractor(g, c, from, to, label, r) {
    r = r || 74;
    const pg = el('g', { opacity: .92 }, g);
    el('path', { d: `M${c[0] - r} ${c[1]} A${r} ${r} 0 0 1 ${c[0] + r} ${c[1]} Z`, fill: 'rgba(214,226,236,.55)', stroke: '#3c5566', 'stroke-width': 1 }, pg);
    let t = ''; for (let a = 0; a <= 180; a += 5) { const L1 = a % 10 ? 5 : 9, ca = Math.cos(rad(a)), sa = Math.sin(rad(a)); t += `M${(c[0] + r * ca).toFixed(1)} ${(c[1] - r * sa).toFixed(1)}L${(c[0] + (r - L1) * ca).toFixed(1)} ${(c[1] - (r - L1) * sa).toFixed(1)}`; }
    el('path', { d: t, stroke: '#2b4252', 'stroke-width': .8 }, pg);
    for (let a = 0; a <= 180; a += 30) txt(pg, c[0] + (r - 18) * Math.cos(rad(a)), c[1] - (r - 18) * Math.sin(rad(a)) + 3.5, String(a), { 'text-anchor': 'middle', 'font-size': 9.5, 'font-family': F_CAP, fill: '#2b4252' });
    if (to > from + .2) {
      const rr = r * .55, a0 = rad(from), a1 = rad(to);
      el('path', { d: `M${(c[0] + rr * Math.cos(a0)).toFixed(1)} ${(c[1] - rr * Math.sin(a0)).toFixed(1)} A${rr} ${rr} 0 0 0 ${(c[0] + rr * Math.cos(a1)).toFixed(1)} ${(c[1] - rr * Math.sin(a1)).toFixed(1)}`, fill: 'none', stroke: '#8f3a0b', 'stroke-width': 1.8 }, pg);
      const am = rad((from + to) / 2); txt(pg, c[0] + (rr + 16) * Math.cos(am), c[1] - (rr + 16) * Math.sin(am) + 5, label, { 'text-anchor': 'middle', 'font-size': 14, 'font-family': F_CAP, 'font-weight': 700, fill: '#8f3a0b' });
    }
    return pg;
  }
  const marks = {};
  function draw() {
    gScale.innerHTML = ''; gDraw.innerHTML = ''; gLab.innerHTML = ''; gTools.innerHTML = ''; gH.innerHTML = '';
    const s = scale();
    /* scale key */
    const kx = W - 250, ky = 520;
    el('rect', { x: kx - 14, y: ky - 26, width: 248, height: 52, rx: 8, fill: 'rgba(29,37,43,.86)' }, gScale);
    el('path', { d: `M${kx} ${ky + 12}h${PX}M${kx} ${ky + 6}v12M${kx + PX} ${ky + 6}v12`, stroke: '#e2864a', 'stroke-width': 2 }, gScale);
    marks.scale = txt(gScale, kx + PX + 14, ky + 17, `Scale: 1 cm = ${s} N`, { 'font-size': 16, 'font-family': F_CAP, 'font-weight': 700, fill: '#f1e9df' });
    txt(gScale, kx, ky - 6, 'SCALE', { 'font-size': 10.5, 'letter-spacing': '.14em', 'font-family': F_CAP, 'font-weight': 600, fill: '#aeb8be' });
    /* baseline and origin */
    el('path', { d: `M${O[0] - 30} ${O[1]}H${W - 24}`, stroke: '#4b5a50', 'stroke-width': 1, 'stroke-dasharray': '6 5' }, gScale);
    el('circle', { cx: O[0], cy: O[1], r: 3.5, fill: '#1d252b' }, gScale);
    txt(gScale, O[0] - 14, O[1] + 22, 'O', { 'font-size': 15, 'font-family': F_CAP, 'font-weight': 700, fill: '#1d252b' });
    const t1 = tip1(), t2 = tip2();
    /* parallelogram view */
    if (bd.para && bd.l1 > 0 && bd.l2 > 0) {
      const q = [O[0] + bd.l2 * PX * Math.cos(rad(bd.th)), O[1] - bd.l2 * PX * Math.sin(rad(bd.th))];
      el('path', { d: `M${O[0]} ${O[1]}L${q[0]} ${q[1]}L${t2[0]} ${t2[1]}`, stroke: '#4b5a50', 'stroke-width': 1.6, 'stroke-dasharray': '7 6', fill: 'none' }, gDraw);
      arrow(gDraw, O, q, 'f2', 2.2, '7 6');
      txt(gDraw, (O[0] + q[0]) / 2 - 18, (O[1] + q[1]) / 2, 'F₂', { 'font-size': 15, 'font-family': F_CAP, 'font-weight': 700, fill: 'var(--f2)', opacity: .7 });
    }
    marks.f1 = arrow(gDraw, O, t1, 'f1');
    if (bd.l1 > 0) tsub(gLab, O[0] + (t1[0] - O[0]) * .62, O[1] - 12, [{ i: 'F' }, { sub: '1' }, ` = ${bd.l1.toFixed(1)} cm`], { 'text-anchor': 'middle', 'font-size': 16, 'font-family': F_BODY, 'font-weight': 600, fill: 'var(--f1)' });
    marks.f2 = arrow(gDraw, t1, t2, 'f2');
    if (bd.l2 > 0) { const m = [(t1[0] + t2[0]) / 2, (t1[1] + t2[1]) / 2]; tsub(gLab, m[0] + 16, m[1] + 4, [{ i: 'F' }, { sub: '2' }, ` = ${bd.l2.toFixed(1)} cm`], { 'font-size': 16, 'font-family': F_BODY, 'font-weight': 600, fill: 'var(--f2)' }); }
    if (bd.R) {
      marks.fr = arrow(gDraw, O, t2, 'fr', 3.4);
      const g = rGeom(), m = [(O[0] + t2[0]) / 2, (O[1] + t2[1]) / 2];
      tsub(gLab, m[0] - 20, m[1] - 14, [{ i: 'F' }, { sub: 'R' }], { 'text-anchor': 'end', 'font-size': 17, 'font-family': F_BODY, 'font-weight': 700, fill: 'var(--fr)' });
      void g;
    } else marks.fr = null;
    /* protractor at the tip of F1 while F2 is drawn */
    if (bd.l1 > 0 && bd.l2 > 0 && !bd.ruler) { el('path', { d: `M${t1[0]} ${t1[1]}h${110}`, stroke: '#4b5a50', 'stroke-width': 1, 'stroke-dasharray': '3 4' }, gTools); marks.thp = protractor(gTools, t1, 0, bd.th, bd.th + '°'); } else marks.thp = null;
    /* ruler along the resultant, pivoting at O */
    marks.ruler = null; marks.alp = null;
    if (bd.ruler != null) {
      const a = bd.ruler, len = 14 * PX, rg = el('g', { transform: `translate(${O[0]} ${O[1]}) rotate(${-a})` }, gTools);
      el('rect', { x: -8, y: 2, width: len + 16, height: 40, rx: 3, fill: 'url(#bp-ruler)', stroke: '#51624f', 'stroke-width': 1 }, rg);
      let tk = ''; for (let k = 0; k <= 140; k++) { const L1 = k % 10 === 0 ? 14 : k % 5 === 0 ? 10 : 6; tk += `M${k * PX / 10} 2v${L1}`; }
      el('path', { d: tk, stroke: '#1d252b', 'stroke-width': .7 }, rg);
      for (let c = 0; c <= 14; c++) txt(rg, c * PX, 30, String(c), { 'text-anchor': 'middle', 'font-size': 11, 'font-family': F_CAP, 'font-weight': 600, fill: '#1d252b' });
      txt(rg, len - 20, 38, 'cm', { 'font-size': 9.5, 'font-family': F_CAP, fill: '#1d252b' });
      const hd = el('g', { class: 'drag rh', transform: `translate(${len + 4} 22)` }, rg);
      el('circle', { r: 16, fill: 'rgba(201,88,22,.18)', stroke: 'var(--acc)', 'stroke-width': 1.6 }, hd);
      el('path', { d: 'M-5 -6 0 -11 5 -6M-5 6 0 11 5 6', stroke: 'var(--acc-2)', 'stroke-width': 1.6, fill: 'none' }, hd);
      marks.ruler = rg;
      const lr = lrRead();
      if (lr != null) {
        const t = tip2();
        const lp = el('g', null, gTools);
        el('circle', { cx: t[0], cy: t[1], r: 30, fill: 'rgba(255,255,255,.12)', stroke: '#1d252b', 'stroke-width': 2 }, lp);
        el('rect', { x: t[0] + 26, y: t[1] - 46, width: 92, height: 28, rx: 6, fill: '#a3b18c', stroke: '#1d252b' }, lp);
        marks.lr = txt(lp, t[0] + 72, t[1] - 26, lr.toFixed(1) + ' cm', { 'text-anchor': 'middle', 'font-size': 16, 'font-family': F_CAP, 'font-weight': 700, fill: '#1b2414' });
        marks.alp = protractor(gTools, O, 0, rGeom().ang, alRead() + '°', 66);
      } else marks.lr = null;
    } else marks.lr = null;
    /* handles */
    marks.h1 = handle(t1, 'h1', 'var(--f1)', 'Tip of F1: drag along the baseline');
    if (bd.l1 > 0) marks.h2 = handle(bd.l2 > 0 ? t2 : [t1[0] + 30, t1[1] - 30], 'h2', 'var(--f2)', 'Tip of F2: drag to set its length and angle');
    readouts();
  }
  function handle(p, k, c, lab) {
    const g = el('g', { class: 'drag gh bh-' + k, 'data-k': k, transform: `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`, 'aria-label': lab }, gH);
    el('circle', { r: 22, fill: 'transparent' }, g);
    el('circle', { r: 9, fill: 'rgba(255,255,255,.55)', stroke: c, 'stroke-width': 2.4 }, g);
    el('circle', { r: 2.4, fill: c }, g);
    return g;
  }
  const NUM = (id, v) => `<b id="${id}">${v}</b>`;
  function readouts() {
    const s = bd.src, sc = scale();
    const tgt = (F) => s ? ` <small>(${F.toFixed(2)} ÷ ${sc} = ${(F / sc).toFixed(2)})</small>` : '';
    const lr = lrRead(), al = alRead();
    read.innerHTML = `<div><span>Scale</span>${NUM('bd-s', '1 cm = ' + sc + ' N')}</div>
      <div><span>ℓ<sub>1</sub> (F₁)</span>${NUM('bd-l1', bd.l1 ? bd.l1.toFixed(1) : '—')} cm${s ? tgt(s.F1) : ''}</div>
      <div><span>ℓ<sub>2</sub> (F₂)</span>${NUM('bd-l2', bd.l2 ? bd.l2.toFixed(1) : '—')} cm${s ? tgt(s.F2) : ''}</div>
      <div><span>θ drawn</span>${NUM('bd-th', bd.l2 ? bd.th : '—')}°${s ? ` <small>(table: ${s.th}°)</small>` : ''}</div>
      <div><span>ℓ<sub>R</sub> (ruler)</span>${NUM('bd-lr', lr != null ? lr.toFixed(1) : '—')} cm</div>
      <div><span>α from F₁</span>${NUM('bd-al', lr != null ? al : '—')}°</div>
      <div><span>F<sub>G</sub> = ℓ<sub>R</sub> × scale</span>${NUM('bd-fg', lr != null ? (lr * sc).toFixed(2) : '—')} N</div>`;
    L.BD.changed.forEach(f => f());
  }
  /* pointer */
  let dr = null;
  svg.addEventListener('pointerdown', e => {
    if (L.tut && L.tut.on) return;
    const h = e.target.closest('.gh, .rh'); if (!h) return;
    e.preventDefault(); svg.setPointerCapture(e.pointerId); L.cursorTick && L.cursorTick();
    dr = h.classList.contains('rh') ? 'ruler' : h.dataset.k;
  });
  svg.addEventListener('pointermove', e => {
    if (!dr) return; const p = svgPoint(svg, e);
    if (dr === 'h1') { bd.l1 = clamp(r1((p.x - O[0]) / PX), 0, 14.5); if (!bd.l1) { bd.l2 = 0; bd.R = false; } }
    else if (dr === 'h2') { const t = tip1(), dx = (p.x - t[0]) / PX, dy = (t[1] - p.y) / PX; bd.l2 = clamp(r1(Math.hypot(dx, dy)), 0, 14.5); bd.th = clamp(Math.round(deg(Math.atan2(dy, dx))), 0, 180); }
    else if (dr === 'ruler') { let a = deg(Math.atan2(O[1] - p.y, p.x - O[0])); a = clamp(a, 0, 90); if (bd.R && Math.abs(a - rGeom().ang) < 0.8) a = rGeom().ang; bd.ruler = a; }
    draw();
  });
  const up = () => { dr = null; };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);

  /* actions */
  function setSrc(s) { bd.src = s; draw(); }
  function drawF1(v) { bd.l1 = v != null ? v : bd.src ? r1(bd.src.F1 / scale()) : 4; draw(); }
  function drawF2(v, th) { if (!bd.l1) drawF1(); bd.l2 = v != null ? v : bd.src ? r1(bd.src.F2 / scale()) : 5; bd.th = th != null ? th : bd.src ? bd.src.th : 60; draw(); }
  function closeR() { if (!bd.l1 || !bd.l2) return false; bd.R = true; draw(); return true; }
  function layRuler(a) { if (!bd.R) return false; bd.ruler = a != null ? a : rGeom().ang; draw(); return true; }
  function setPara(on) { bd.para = on; $('bd-para').setAttribute('aria-pressed', on ? 'true' : 'false'); draw(); }
  function clear() { const s = bd.src; Object.assign(bd, DEF()); bd.src = s; $('bd-para').setAttribute('aria-pressed', 'false'); draw(); }
  function set(o) { Object.assign(bd, o); draw(); }
  const msg = t => L.BD.say && L.BD.say(t);
  const guard = f => () => { if (!(L.tut && L.tut.on)) f(); };
  $('bd-f1').addEventListener('click', guard(() => drawF1()));
  $('bd-f2').addEventListener('click', guard(() => drawF2()));
  $('bd-r').addEventListener('click', guard(() => { if (!closeR()) msg('Draw F₁ and F₂ first.'); }));
  $('bd-ruler').addEventListener('click', guard(() => { if (!layRuler()) msg('Close the triangle with F_R first.'); }));
  $('bd-para').addEventListener('click', guard(() => setPara(!bd.para)));
  $('bd-clear').addEventListener('click', guard(clear));
  const box = {
    board: () => [0, 0, W, H],
    scale: () => [W - 274, 484, 260, 66],
    f1: () => { const t = tip1(); return [O[0] - 20, O[1] - 30, t[0] - O[0] + 50, 70]; },
    f2: () => { const a = tip1(), b = tip2(); const x0 = Math.min(a[0], b[0]) - 30, y0 = Math.min(a[1], b[1]) - 30; return [x0, y0, Math.abs(b[0] - a[0]) + 60, Math.abs(b[1] - a[1]) + 60]; },
    fr: () => { const b = tip2(); return [O[0] - 30, b[1] - 30, b[0] - O[0] + 60, O[1] - b[1] + 60]; },
    prot1: () => { const t = tip1(); return [t[0] - 84, t[1] - 84, 168, 96]; },
    tip: () => { const t = tip2(); return [t[0] - 40, t[1] - 56, 170, 96]; },
    protO: () => [O[0] - 76, O[1] - 80, 160, 96]
  };
  L.BD = { bd, draw, setSrc, drawF1, drawF2, closeR, layRuler, setPara, clear, set, scale, rGeom, lrRead, alRead, tip1, tip2, box, svg, changed: [], say: null, O, PX, r1, marks };
  draw();
})(window.SOL);

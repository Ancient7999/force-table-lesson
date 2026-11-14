/* Force table practical: controls, observation table, calculation with traceable symbols, and the tutorial */
(function (L) {
  'use strict';
  const { $, el, parseNum, NUM, setWork, tween, ease } = L;
  const FT = L.FT, BD = L.BD, G = FT.G;
  const f2 = v => v.toFixed(2), f3 = v => v.toFixed(3), f1 = v => v.toFixed(1);
  const guard = f => (...a) => { if (!L.tut.on) f(...a); };
  const msgEl = $('ft-msg'), recMsg = $('ft-recmsg');
  const rsay = (t, c) => { recMsg.className = 'rec-msg' + (c ? ' ' + c : ''); recMsg.innerHTML = t || ''; };
  L.FTmsg = rsay;
  BD.say = t => rsay(t, 'warn');

  /* ---------- load rows: angle and mass for each pulley ---------- */
  const rows = $('ft-rows');
  rows.innerHTML = [0, 1, 2].map(i => `
    <div class="load-row" data-i="${i}">
      <span class="fchip f${i + 1}">${FT.NAME[i]}${i === 2 ? '<small>equilibrant</small>' : ''}</span>
      <div class="lr-grp"><span class="lr-k">Angle</span><span class="lcd" id="ft-a${i}">000°</span>
        <span class="nudge-btns"><button type="button" class="btn-quiet" data-ang="${i}" data-d="-10" aria-label="${FT.NAME[i]} pulley 10 degrees back">−10</button><button type="button" class="btn-quiet" data-ang="${i}" data-d="-1" aria-label="${FT.NAME[i]} pulley 1 degree back">−1</button><button type="button" class="btn-quiet" data-ang="${i}" data-d="1" aria-label="${FT.NAME[i]} pulley 1 degree on">+1</button><button type="button" class="btn-quiet" data-ang="${i}" data-d="10" aria-label="${FT.NAME[i]} pulley 10 degrees on">+10</button></span></div>
      <div class="lr-grp"><span class="lr-k">Mass</span><span class="lcd" id="ft-m${i}">0.050 kg</span>
        <span class="add-btns">${FT.SLOTS.map(m => `<button type="button" class="btn-quiet sm" data-add="${i}" data-m="${m}" aria-label="Add ${m} g to ${FT.NAME[i]}">+${m}</button>`).join('')}<button type="button" class="btn-quiet sm" data-lift="${i}" aria-label="Lift the top mass off ${FT.NAME[i]}">Lift top</button></span></div>
    </div>`).join('');
  rows.addEventListener('click', guard(e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.ang != null) { if (!FT.nudge(+b.dataset.ang, +b.dataset.d)) rsay('The clamps would touch: pulleys must stay at least 14° apart.', 'warn'); }
    else if (b.dataset.add != null) { if (!FT.addMass(+b.dataset.add, +b.dataset.m)) rsay(`That hanger is full: at most ${FT.MAXSLOT} g of slotted masses.`, 'warn'); }
    else if (b.dataset.lift != null) FT.liftTop(+b.dataset.lift);
  }));
  $('ft-spinL').addEventListener('click', guard(() => FT.setPhi(FT.st.phi + 15)));
  $('ft-spinR').addEventListener('click', guard(() => FT.setPhi(FT.st.phi - 15)));
  $('ft-front').addEventListener('click', guard(() => FT.setPhi(-18)));
  document.querySelectorAll('[data-screw]').forEach(b => b.addEventListener('click', guard(() => FT.turnScrew(+b.dataset.screw, +b.dataset.d))));
  const pad3 = a => String(a).padStart(3, '0');
  function status() {
    for (let i = 0; i < 3; i++) { $('ft-a' + i).textContent = pad3(FT.st.a[i]) + '°'; $('ft-m' + i).textContent = f3(FT.massKg(i)) + ' kg'; }
    const lv = FT.level(), ok = FT.balanced(), n = FT.net(), tg = FT.target(), slant = Math.atan2(Math.hypot(tg.x, tg.y), 222) * 180 / Math.PI;
    $('ft-lamp').className = 'lamp' + (ok && lv ? ' on' : '');
    $('ft-status-t').textContent = ok && lv ? 'Balanced · thread straight' : ok ? 'Balanced, but the table is not level' : `Not balanced · thread slant ${f1(slant)}°`;
    if (!lv) { msgEl.className = 'rig-msg warn'; msgEl.textContent = 'The table is not level: the bubble sits towards the high side, and the ring is pulled downhill by the slope as well as by the strings.'; }
    else if (ok) { msgEl.className = 'rig-msg ok'; msgEl.textContent = 'Balanced: the ring sits centred on the pin and the thread above it hangs straight. The three forces add to zero.'; }
    else { msgEl.className = 'rig-msg'; msgEl.textContent = `The ring is pulled off the centre and the thread slants by ${f1(slant)}°. The bigger the imbalance, the bigger the slant.`; }
    void n;
  }
  FT.listeners.push(status);

  /* ---------- observation ---------- */
  const st = { rec: null };
  const table = $('ft-table'), eqt = $('ft-eqtable');
  const thOf = (a1, a2) => { const d = Math.abs(a2 - a1) % 360; return d > 180 ? 360 - d : d; };
  function frCalc(F1, F2, th) { return Math.sqrt(F1 * F1 + F2 * F2 + 2 * F1 * F2 * Math.cos(th * Math.PI / 180)); }
  function alphaOf(F1, F2, th) { const t = th * Math.PI / 180; return Math.atan2(F2 * Math.sin(t), F1 + F2 * Math.cos(t)) * 180 / Math.PI; }
  const fgVal = () => { const lr = BD.lrRead(); return lr != null ? lr * BD.scale() : null; };
  const cell = c => table.querySelector(`td[data-c="${c}"]`) || eqt.querySelector(`td[data-c="${c}"]`);
  function renderTable(fresh) {
    const r = st.rec, v = (x, d) => r ? x : '';
    const fg = r ? fgVal() : null;
    table.innerHTML = `<thead><tr><th>Force</th><th>Mass <i>m</i><span class="u">kg</span></th><th>Force = <i>mg</i><span class="u">N</span></th><th>Angle <i>θ</i><span class="u">degree</span></th><th>Resultant <i>F</i><sub>R</sub><span class="fx">theoretical · √(<i>F</i><sub>1</sub>² + <i>F</i><sub>2</sub>² + 2<i>F</i><sub>1</sub><i>F</i><sub>2</sub> cos <i>θ</i>)</span><span class="u">N</span></th><th>Resultant <i>F</i><sub>E</sub><span class="fx">experimental · <i>m</i><sub>3</sub><i>g</i></span><span class="u">N</span></th><th>Resultant <i>F</i><sub>G</sub><span class="fx">graphical</span><span class="u">N</span></th></tr></thead>
      <tbody><tr><td class="grp"><i>F</i><sub>1</sub></td><td data-c="m1">${v(r && f3(r.m[0]))}</td><td data-c="F1">${v(r && f2(r.F[0]))}</td><td data-c="th" rowspan="2">${v(r && r.th)}</td><td data-c="FR" rowspan="2" class="calc-c">${v(r && f2(r.FR))}</td><td data-c="FE" rowspan="2" class="calc-c">${v(r && f2(r.FE))}</td><td data-c="FG" rowspan="2" class="calc-c">${fg != null ? f2(fg) : ''}</td></tr>
      <tr><td class="grp"><i>F</i><sub>2</sub></td><td data-c="m2">${v(r && f3(r.m[1]))}</td><td data-c="F2">${v(r && f2(r.F[1]))}</td></tr></tbody>`;
    eqt.innerHTML = `<thead><tr><th>Pulley</th><th>Position on the scale<span class="u">degree</span></th><th>Hanging mass <i>m</i><span class="fx">hanger + slotted masses</span><span class="u">kg</span></th><th>Force <i>mg</i><span class="u">N</span></th></tr></thead><tbody>
      ${[0, 1, 2].map(i => `<tr><td class="grp"><i>F</i><sub>${i + 1}</sub>${i === 2 ? ' <small>equilibrant</small>' : ''}</td><td data-c="a${i + 1}">${v(r && r.a[i])}</td><td data-c="mm${i + 1}">${v(r && f3(r.m[i]))}</td><td data-c="FF${i + 1}">${v(r && f2(r.F[i]))}</td></tr>`).join('')}
      </tbody><tfoot><tr><td class="lbl" colspan="4">${r ? `Direction of <i>F</i><sub>R</sub> from <i>F</i><sub>1</sub>: α = tan⁻¹(<i>F</i><sub>2</sub> sin <i>θ</i> ÷ (<i>F</i><sub>1</sub> + <i>F</i><sub>2</sub> cos <i>θ</i>)) = <b data-c="al">${f1(r.alpha)}°</b>, so the equilibrant is expected at <b data-c="exp">${f1(r.expect)}°</b>; it balanced at <b>${r.a[2]}°</b>.` : 'Record a balanced reading to fill the table.'}</td></tr></tfoot>`;
    if (fresh) table.querySelectorAll('td[data-c]').forEach(td => { if (td.textContent) td.classList.add('fresh'); });
  }
  function record() {
    if (!FT.level()) { rsay('Level the table first: on a tilted top the slope adds a fourth force.', 'warn'); return false; }
    if (!FT.balanced()) { rsay('Not balanced yet: adjust the mass and the angle of F₃ until the thread hangs straight.', 'warn'); return false; }
    const s = FT.st, m = [0, 1, 2].map(FT.massKg), F = m.map(x => x * G);
    if (FT.st.stack[0].length + FT.st.stack[1].length === 0) { rsay('Hang some masses on F₁ and F₂ first: empty hangers make a dull reading.', 'warn'); return false; }
    const th = thOf(s.a[0], s.a[1]), FR = frCalc(F[0], F[1], th);
    /* α measured from F1 towards F2 */
    const sgn = ((s.a[1] - s.a[0] + 360) % 360) <= 180 ? 1 : -1;
    const alpha = alphaOf(F[0], F[1], th), expect = FT.norm(s.a[0] + sgn * alpha + 180);
    st.rec = { m, F, a: s.a.slice(), th, FR, FE: F[2], alpha, expect: (s.a[0] + sgn * alpha + 180 + 360) % 360 };
    void expect;
    BD.setSrc({ F1: F[0], F2: F[1], th });
    renderTable(true); workAll();
    rsay(`Recorded: m₁ = ${f3(m[0])} kg, m₂ = ${f3(m[1])} kg, θ = ${th}°, m₃ = ${f3(m[2])} kg.`);
    return true;
  }
  $('ft-record').addEventListener('click', guard(record));
  BD.changed.push(() => { if (st.rec) { const td = cell('FG'), fg = fgVal(); if (td) td.textContent = fg != null ? f2(fg) : ''; } workAll(); });

  /* ---------- calculation ---------- */
  const KEYS = ['F1', 'F2', 'th', 'FR', 'FE', 'FG', 'e1', 'e2'];
  const IN = {}; KEYS.forEach(k => { IN[k] = $('in-' + k); });
  const wk = k => $('w-' + k), chk = $('ft-chk'), res = $('ft-result');
  const val = k => parseNum(IN[k].value), str = k => IN[k].value.trim(), ok = k => str(k) !== '' && isFinite(val(k));
  function workAll() {
    const r = st.rec;
    setWork(wk('F1'), r ? `= ${NUM('m1v', f3(r.m[0]))} × ${NUM('gv', '9.8')} = ${NUM('r-F1', f2(r.F[0]))}` : '');
    setWork(wk('F2'), r ? `= ${NUM('m2v', f3(r.m[1]))} × ${NUM('gv2', '9.8')} = ${NUM('r-F2', f2(r.F[1]))}` : '');
    if (r) { const d = Math.abs(r.a[1] - r.a[0]); setWork(wk('th'), d > 180 ? `= 360 − |${NUM('a2v', r.a[1])} − ${NUM('a1v', r.a[0])}| = ${NUM('r-th', r.th)}` : `= |${NUM('a2v', r.a[1])} − ${NUM('a1v', r.a[0])}| = ${NUM('r-th', r.th)}`); } else setWork(wk('th'), '');
    if (ok('F1') && ok('F2') && ok('th')) {
      const a = val('F1'), b = val('F2'), t = val('th'), A = a * a, B = b * b, Cc = 2 * a * b * Math.cos(t * Math.PI / 180), S = A + B + Cc;
      setWork(wk('FR'), `= √(${NUM('f1q', str('F1'))}² + ${NUM('f2q', str('F2'))}² + 2 × ${NUM('f1q', str('F1'))} × ${NUM('f2q', str('F2'))} × cos ${NUM('thq', str('th'))}°) = √(${A.toFixed(4)} + ${B.toFixed(4)} + ${Cc.toFixed(4)}) = √${S.toFixed(4)} = ${NUM('r-FR', f2(Math.sqrt(Math.max(0, S))))}`);
    } else setWork(wk('FR'), '');
    setWork(wk('FE'), r ? `= ${NUM('m3v', f3(r.m[2]))} × ${NUM('gv3', '9.8')} = ${NUM('r-FE', f2(r.FE))}` : '');
    const lr = BD.lrRead(); setWork(wk('FG'), lr != null ? `= ${NUM('lrv', f1(lr))} cm × ${NUM('sv', BD.scale())} N/cm = ${NUM('r-FG', f2(lr * BD.scale()))}` : '');
    setWork(wk('e1'), ok('FE') && ok('FR') && val('FR') ? `= |${NUM('e1E', str('FE'))} − ${NUM('e1R', str('FR'))}| ÷ ${NUM('e1R', str('FR'))} × 100 = ${NUM('r-e1', f2(Math.abs(val('FE') - val('FR')) / val('FR') * 100))}` : '');
    setWork(wk('e2'), ok('FG') && ok('FR') && val('FR') ? `= |${NUM('e2G', str('FG'))} − ${NUM('e2R', str('FR'))}| ÷ ${NUM('e2R', str('FR'))} × 100 = ${NUM('r-e2', f2(Math.abs(val('FG') - val('FR')) / val('FR') * 100))}` : '');
  }
  Object.values(IN).forEach(i => i.addEventListener('input', () => { i.classList.remove('flag', 'okf'); workAll(); }));
  function check() {
    const r = st.rec, notes = [];
    Object.values(IN).forEach(i => i.classList.remove('flag', 'okf'));
    if (!r) { chk.className = 'check-msg nudge'; chk.innerHTML = 'Record a balanced reading first; the calculation uses its masses and angles.'; res.hidden = true; return false; }
    const flag = (k, t) => { IN[k].classList.add('flag'); notes.push(t); }, good = k => IN[k].classList.add('okf');
    const near = (a, b, t) => isFinite(a) && Math.abs(a - b) <= t;
    [['F1', 0, 'm1'], ['F2', 1, 'm2']].forEach(([k, i]) => {
      const v = val(k), F = r.F[i];
      if (near(v, F, .011)) good(k);
      else if (near(v, F * 1000, 12)) flag(k, `${k === 'F1' ? 'F₁' : 'F₂'}: the mass must be in kg, not grams.`);
      else if (near(v, (r.m[i] - .05) * G, .011)) flag(k, `${k === 'F1' ? 'F₁' : 'F₂'}: the 50 g hanger is part of the hanging mass.`);
      else flag(k, `${k === 'F1' ? 'F₁' : 'F₂'} = m × 9.8 with m in kg: ${f3(r.m[i])} × 9.8.`);
    });
    if (near(val('th'), r.th, .5)) good('th'); else if (near(val('th'), 180 - r.th, .5)) flag('th', 'That is the inside angle of the triangle. θ is the angle between the two strings.'); else flag('th', 'θ is the angle between the strings of F₁ and F₂, from the pulley positions.');
    const a = val('F1'), b = val('F2'), t = val('th'), frT = (ok('F1') && ok('F2') && ok('th')) ? frCalc(a, b, t) : r.FR;
    if (near(val('FR'), frT, .015) || near(val('FR'), r.FR, .015)) good('FR');
    else if (near(val('FR'), frT * frT, .05)) flag('FR', 'That is F_R²; take the square root.');
    else if (near(val('FR'), Math.sqrt(Math.max(0, a * a + b * b + 2 * a * b * Math.cos(t))), .015)) flag('FR', 'The calculator was in radians: cos θ must be taken in degrees.');
    else flag('FR', 'Put F₁, F₂ and θ into √(F₁² + F₂² + 2F₁F₂ cos θ).');
    if (near(val('FE'), r.FE, .011)) good('FE'); else flag('FE', `F_E is the weight of the whole third hanger: ${f3(r.m[2])} × 9.8.`);
    const fg = fgVal();
    if (fg == null) flag('FG', 'Measure F_R on the drawing board first: ruler laid on F_R.');
    else if (near(val('FG'), fg, .011)) good('FG');
    else if (near(val('FG'), BD.lrRead() / BD.scale(), .02)) flag('FG', 'Multiply the length by the scale (N per cm), do not divide.');
    else flag('FG', `F_G = length × scale = ${f1(BD.lrRead())} × ${BD.scale()}.`);
    const pe = (x, y) => Math.abs(x - y) / y * 100;
    if (ok('FE') && ok('FR') && near(val('e1'), pe(val('FE'), val('FR')), .03)) good('e1'); else flag('e1', '% difference = |F_E − F_R| ÷ F_R × 100.');
    if (ok('FG') && ok('FR') && near(val('e2'), pe(val('FG'), val('FR')), .03)) good('e2'); else flag('e2', '% difference = |F_G − F_R| ÷ F_R × 100.');
    if (!notes.length) { chk.className = 'check-msg ok'; chk.innerHTML = 'All eight lines agree with the readings, the drawing and the formula.'; res.hidden = false; updResult(); return true; }
    chk.className = 'check-msg nudge'; chk.innerHTML = `<ul>${notes.map(n => `<li>${n}</li>`).join('')}</ul>`; res.hidden = true; return false;
  }
  function updResult() {
    res.innerHTML = `<h3>Result</h3><table class="res-t"><thead><tr><th>Resultant</th><th>Value</th><th>Against theoretical</th></tr></thead><tbody>
      <tr><td>Theoretical, by formula</td><td><i>F</i><sub>R</sub> = ${NUM('resR', str('FR'))} N</td><td>—</td></tr>
      <tr><td>Experimental, the equilibrant <i>m</i><sub>3</sub><i>g</i></td><td><i>F</i><sub>E</sub> = ${NUM('resE', str('FE'))} N</td><td>${NUM('resE1', str('e1'))} %</td></tr>
      <tr><td>Graphical, scale drawing</td><td><i>F</i><sub>G</sub> = ${NUM('resG', str('FG'))} N</td><td>${NUM('resE2', str('e2'))} %</td></tr></tbody></table>`;
  }
  $('ft-check').addEventListener('click', guard(check));

  /* ---------- traceable symbols ---------- */
  const calc = $('ft-calc');
  const lSym = (row, k) => document.querySelector(`#cr-${row} label .sym[data-sym="${k}"]`);
  const wNum = (k, ref) => wk(k) && wk(k).querySelector(`.num[data-ref="${ref}"]`);
  const rNum = k => res.querySelector(`.num[data-ref="${k}"]`);
  const bdEl = id => $(id);
  const gcTag = () => calc.querySelector('.panel-tag .sym');
  function INFO(k) {
    switch (k) {
      case 'gc': case 'g': case 'g2': case 'gv': case 'gv2': case 'gv3': return { title: '<i>g</i> = 9.8 m/s²', nm: 'g in m/s²', where: 'The acceleration of free fall used in the manual. Every hanging weight is m × g.', src: k === 'gc' ? () => null : gcTag };
      case 'F1': return { title: '<i>F</i><sub>1</sub>: the first force, in N', nm: 'F₁', where: 'The weight hanging over the first pulley. Worked out in the line below; the result goes into lines 4 and the table.', src: () => wNum('F1', 'r-F1') || IN.F1 };
      case 'F2': return { title: '<i>F</i><sub>2</sub>: the second force, in N', nm: 'F₂', where: 'The weight hanging over the second pulley.', src: () => wNum('F2', 'r-F2') || IN.F2 };
      case 'm1': case 'm1v': return { title: '<i>m</i><sub>1</sub>: hanging mass on F₁, in kg', nm: 'm₁ in kg', where: 'Observation table, F₁ row, mass column: the 50 g hanger plus its slotted masses.', src: () => cell('m1') };
      case 'm2': case 'm2v': return { title: '<i>m</i><sub>2</sub>: hanging mass on F₂, in kg', nm: 'm₂ in kg', where: 'Observation table, F₂ row, mass column.', src: () => cell('m2') };
      case 'm3': case 'm3v': return { title: '<i>m</i><sub>3</sub>: hanging mass on the equilibrant, in kg', nm: 'm₃ in kg', where: 'Pulley table, F₃ row: the mass that balanced the ring.', src: () => cell('mm3') };
      case 'th': return { title: '<i>θ</i>: angle between F₁ and F₂, in degrees', nm: 'θ', where: 'The difference of the two pulley positions on the scale (never more than 180°).', src: () => wNum('th', 'r-th') || IN.th };
      case 'a1v': return { title: '', nm: 'position of F₁ in degrees', where: 'Pulley table, F₁ row, read on the degree scale at the string.', src: () => cell('a1') };
      case 'a2v': return { title: '', nm: 'position of F₂ in degrees', where: 'Pulley table, F₂ row.', src: () => cell('a2') };
      case 'r-F1': return { title: '', nm: 'F₁ in N', where: 'The result of line 1. It goes into the answer box and into line 4.', src: () => wNum('FR', 'f1q') || lSym('FR', 'F1p') };
      case 'r-F2': return { title: '', nm: 'F₂ in N', where: 'The result of line 2. It goes into line 4.', src: () => wNum('FR', 'f2q') || lSym('FR', 'F2p') };
      case 'r-th': return { title: '', nm: 'θ in degrees', where: 'The result of line 3. It goes into cos θ in line 4.', src: () => wNum('FR', 'thq') || lSym('FR', 'thp') };
      case 'F1p': case 'f1q': case 'f1q2': return { title: '<i>F</i><sub>1</sub> from line 1', nm: 'F₁ in N', where: 'From the answer box of line 1.', src: () => IN.F1 };
      case 'F2p': case 'f2q': case 'f2q2': return { title: '<i>F</i><sub>2</sub> from line 2', nm: 'F₂ in N', where: 'From the answer box of line 2.', src: () => IN.F2 };
      case 'thp': case 'thq': return { title: '<i>θ</i> from line 3', nm: 'θ in degrees', where: 'From the answer box of line 3. The calculator must be in degree mode.', src: () => IN.th };
      case 'FR': return { title: '<i>F</i><sub>R</sub>: theoretical resultant, in N', nm: 'F_R', where: 'By the formula, from F₁, F₂ and θ. Worked out below.', src: () => wNum('FR', 'r-FR') || IN.FR };
      case 'r-FR': return { title: '', nm: 'F_R in N', where: 'The result of line 4. It is the reference value in lines 7 and 8, and matches the F_R column of the table.', src: () => cell('FR') };
      case 'FE': return { title: '<i>F</i><sub>E</sub>: experimental resultant, in N', nm: 'F_E', where: 'The equilibrant balances F₁ and F₂, so its weight equals the resultant.', src: () => wNum('FE', 'r-FE') || IN.FE };
      case 'r-FE': return { title: '', nm: 'F_E in N', where: 'The result of line 5. It goes into line 7.', src: () => wNum('e1', 'e1E') || IN.FE };
      case 'FG': return { title: '<i>F</i><sub>G</sub>: graphical resultant, in N', nm: 'F_G', where: 'Length of F_R on the drawing, turned back into newtons with the scale.', src: () => wNum('FG', 'r-FG') || IN.FG };
      case 'lr': case 'lrv': return { title: '<i>ℓ</i><sub>R</sub>: length of F<sub>R</sub> on the drawing, in cm', nm: 'ℓ_R in cm', where: 'Read on the ruler laid along F_R. Drawing board, ruler reading.', src: () => (BD.marks.lr && BD.marks.lr.isConnected ? BD.marks.lr : bdEl('bd-lr')) };
      case 's': case 'sv': return { title: 'Scale of the drawing', nm: 'scale in N per cm', where: 'Chosen before drawing: 1 cm of line stands for this many newtons. Drawing board, scale key.', src: () => BD.marks.scale };
      case 'r-FG': return { title: '', nm: 'F_G in N', where: 'The result of line 6. It goes into line 8 and the F_G column of the table.', src: () => cell('FG') };
      case 'e1': return { title: 'Experimental % difference', nm: '% difference', where: 'How far the equilibrant is from the formula value, as a percentage of it.', src: () => wNum('e1', 'r-e1') || IN.e1 };
      case 'e2': return { title: 'Graphical % difference', nm: '% difference', where: 'How far the drawing is from the formula value, as a percentage of it.', src: () => wNum('e2', 'r-e2') || IN.e2 };
      case 'e1E': case 'e2G': return { title: '', nm: k === 'e1E' ? 'F_E in N' : 'F_G in N', where: `From the answer box of line ${k === 'e1E' ? 5 : 6}.`, src: () => IN[k === 'e1E' ? 'FE' : 'FG'] };
      case 'e1R': case 'e1R2': case 'e2R': case 'e2R2': return { title: '', nm: 'F_R in N', where: 'From the answer box of line 4.', src: () => IN.FR };
      case 'r-e1': case 'r-e2': return { title: '', nm: '% difference', where: 'The result of this line. It goes into the answer box and the Result.', src: () => IN[k.slice(2)] };
      case 'resR': return { title: '', nm: 'theoretical F_R in N', where: 'From line 4.', src: () => IN.FR };
      case 'resE': return { title: '', nm: 'experimental F_E in N', where: 'From line 5.', src: () => IN.FE };
      case 'resG': return { title: '', nm: 'graphical F_G in N', where: 'From line 6.', src: () => IN.FG };
      case 'resE1': return { title: '', nm: '% difference, experimental', where: 'From line 7.', src: () => IN.e1 };
      case 'resE2': return { title: '', nm: '% difference, graphical', where: 'From line 8.', src: () => IN.e2 };
    }
    return null;
  }
  L.registerTrace(calc, INFO);

  /* ---------- start over ---------- */
  function reset() {
    FT.reset(); BD.clear(); BD.setSrc(null); st.rec = null;
    Object.values(IN).forEach(i => { i.value = ''; i.classList.remove('flag', 'okf'); });
    L.traceHide(); chk.className = 'check-msg'; chk.innerHTML = ''; res.hidden = true; res.innerHTML = ''; rsay('');
    renderTable(); workAll(); status();
  }
  $('ft-reset').addEventListener('click', guard(reset));
  L.onLeave['ft-practical'] = () => L.tutStop();

  /* ---------- tutorial ---------- */
  const rig = $('ft-frame'), bench = $('ft-bench-frame'), board = $('ft-board-frame');
  const SR = b => ({ svg: FT.svg, box: b }), SB = b => ({ svg: FT.bsvg, box: b }), SD = b => ({ svg: BD.svg, box: b });
  /* a pointer hand that shows where each action happens */
  const hands = new Map();
  function hand(svg, p) {
    let h = hands.get(svg);
    if (!h) { h = el('g', { class: 'tut-hand', 'pointer-events': 'none' }, svg); el('path', { d: 'M0 0 L0 26 L7 20 L12 31 L17 29 L12 18 L21 18 Z', fill: '#fbf1e8', stroke: '#12181d', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, h); hands.set(svg, h); }
    if (!p) { h.style.display = 'none'; return; }
    svg.appendChild(h); h.style.display = ''; h.setAttribute('transform', `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);
  }
  const hideHands = () => hands.forEach(h => { h.style.display = 'none'; });
  const pulleyP = i => { const b = FT.box.pulley(i); return [b[0] + b[2] / 2, b[1] + b[3] / 2]; };
  async function dragPulley(i, to, ms) {
    const from = FT.st.a[i]; let d = ((to - from + 540) % 360) - 180;
    await tween(ms, k => { FT.setAngle(i, Math.round(from + d * ease(k))); hand(FT.svg, pulleyP(i)); });
    FT.setAngle(i, to); hand(FT.svg, pulleyP(i));
  }
  async function spin(to, ms) { const from = FT.st.phi; await tween(ms, k => { FT.setPhi(from + (to - from) * ease(k)); const b = FT.box.disc(); hand(FT.svg, [b[0] + b[2] * .5 + 160, b[1] + b[3] * .82]); }); }
  async function screw(i, d, n, Tt) { for (let k = 0; k < n; k++) { const b = FT.box.screw(i); hand(FT.svg, [b[0] + 44, b[1] + 46]); FT.turnScrew(i, d); await Tt.wait(260); } }
  async function addT(i, m, Tt) { const b = FT.bbox.trayPiece(m); hand(FT.bsvg, [b[0] + 60, b[1] + 20]); await FT.tutAdd(i, m, 1300); const h = FT.bbox.hanger(i); hand(FT.bsvg, [h[0] + 100, h[1] + 230]); await Tt.wait(300); }
  async function liftT(i, Tt) { const b = FT.bbox.stackTop(i); hand(FT.bsvg, [b[0] + 80, b[1] + 30]); await FT.tutRemove(i, 1300); await Tt.wait(300); }
  const benchAndRing = () => [bench, rig];
  async function run(Tt) {
    const T = (title, text, o) => { const f = (o && o.focus) || [], pair = f.includes(bench) && f.includes(rig); document.body.classList.toggle('tut-pair', pair); FT.setView((o && o.view) || (pair ? 'pair' : 'top')); return Tt.teach(title, text, o); };
    hideHands();
    await T('Force table', 'A round table with a degree scale, three pulleys on its rim, and strings that pull on one small ring. Each part is shown before it is used.', { el: rig, view: 'full' });
    await T('Table top', 'A flat aluminium disc on a heavy tripod. The strings run across it from the ring to the pulleys.', { box: SR(FT.box.disc), label: 'table top' });
    await T('Degree scale', 'Engraved round the rim: a line every degree, longer lines every 5° and 10°, and numbers every 10° from 0 to 350.', { box: SR(FT.box.scale), label: 'degree scale' });
    await T('Tripod and levelling screws', 'Three feet, each on a levelling screw, A, B and C. Turning a screw raises or lowers that side of the table.', { box: SR(FT.box.tripod), label: 'screws A, B, C', view: 'full' });
    await T('Pulley on a clamp', 'Each pulley is clamped to the rim and can be slid round it to any angle. A coloured index line on the scale shows where its string leaves the table.', { box: SR(FT.box.pulley(1)), label: 'pulley F₂' });
    await T('Strings and ring', 'Three strings are tied to a light ring. Each runs out to a pulley, over it, and down to a hanger.', { box: SR(FT.box.ring), label: 'ring' });
    await T('Thread above the ring', 'A fine thread runs from the ring straight up to a hook on a stand arm, directly above the centre pin. When the forces balance, the ring sits on the centre and this thread hangs perfectly straight.', { box: SR(FT.box.thread), label: 'thread to the hook' });
    await T('Hangers and slotted masses', 'Each hanger has a mass of 50 g of its own. Slotted masses of 200, 100, 50, 20 and 10 g slide onto it. The hanging mass m is hanger plus slots.', { el: bench, label: 'hangers' });
    await T('Ring from above', 'This panel shows the ring as seen from above, enlarged, with the centre pin as a dot. The lamp lights when the ring is centred and the thread is straight.', { box: SR(FT.box.plan), label: 'plan view' });
    /* level */
    await T('Is the table level?', 'Three bare hangers at 0°, 120° and 240° pull equally, so they balance. Yet the ring has drifted: the table is tilted, and the slope pulls the ring downhill.', { box: SR(FT.box.ring), label: 'ring drifting' });
    await T('Spirit level', 'The bubble of the bull\'s-eye level floats to the high side. It sits well outside the inner circle, towards foot B.', { box: SR(FT.box.levelInset), label: 'bubble off-centre' });
    await T('Lower screw B', 'Screw B is turned down one step at a time. Watch the bubble move towards the centre and the ring come back.', { box: SR(FT.box.screw(1)), label: 'screw B ▼', ms: 3200, view: 'full' });
    await screw(1, -0.1, 9, Tt);
    await T('Raise screw C', 'Now foot C is slightly low: it is raised three steps.', { box: SR(FT.box.screw(2)), label: 'screw C ▲', ms: 2800, view: 'full' });
    await screw(2, 0.1, 3, Tt); hideHands();
    await T('Level', 'The bubble sits in the inner circle. With no slope, the three equal hangers balance and the ring settles on the centre: the lamp is lit.', { box: SR(FT.box.levelInset), focus: [rig], label: 'level' });
    /* turning the table */
    await T('Turning the table', 'Dragging the table top turns the whole table, scale, pulleys and all, so it can be read from another side. The angles between the strings do not change.', { box: SR(FT.box.disc), label: 'drag to turn', ms: 3600 });
    await spin(24, 2600); await Tt.wait(500); await spin(-18, 2200); hideHands();
    /* F1 */
    await T('First force: F₁ at 0°', 'The F₁ pulley stays at the 0° mark. Masses are now added to its hanger.', { box: SR(FT.box.pulley(0)), label: 'F₁ at 0°' });
    await T('Add 100 g to F₁', 'A 100 g slotted mass is lifted from the tray and slid onto the F₁ hanger.', { box: SB(FT.bbox.hanger(0)), focus: benchAndRing(), label: '+100 g', ms: 2600 });
    await addT(0, 100, Tt);
    await T('The ring moves', 'F₁ now pulls harder than the others: the ring is drawn towards 0° and the thread above it slants.', { box: SR(FT.box.thread), label: 'thread slants' });
    await T('Add 50 g to F₁', 'A 50 g mass goes on as well.', { box: SB(FT.bbox.hanger(0)), focus: benchAndRing(), label: '+50 g', ms: 2200 });
    await addT(0, 50, Tt); hideHands();
    await T('m₁ and F₁', 'm₁ = 0.050 + 0.100 + 0.050 = 0.200 kg, so F₁ = m₁g = 0.200 × 9.8 = 1.96 N.', { el: $('ft-m0'), label: 'm₁ = 0.200 kg', f: '<i>F</i><sub>1</sub> = 0.200 × 9.8 = 1.96 N' });
    /* F2 */
    await T('Second force: move F₂ to 60°', 'The F₂ pulley is dragged round the rim from 120° towards 60°. Its readout follows in 1° steps.', { box: SR(FT.box.sector(55, 125)), label: 'drag F₂', ms: 3000 });
    await dragPulley(1, 62, 2400);
    await T('Fine adjust', 'The last two degrees are set with the −1 button: 62°, 61°, 60°.', { el: rows.querySelector('[data-ang="1"][data-d="-1"]'), focus: [rig], alt: SR(FT.box.pulley(1)), label: '−1°', ms: 2600 });
    hand(FT.svg, pulleyP(1)); FT.nudge(1, -1); await Tt.wait(700); FT.nudge(1, -1); await Tt.wait(700); hideHands();
    await T('F₂ at 60°', 'F₂ sits at 60°, so the angle between F₁ and F₂ is θ = 60° − 0° = 60°.', { box: SR(FT.box.pulley(1)), label: 'θ = 60°' });
    await T('Add 200 g to F₂', 'A 200 g mass goes onto the F₂ hanger.', { box: SB(FT.bbox.hanger(1)), focus: benchAndRing(), label: '+200 g', ms: 2400 });
    await addT(1, 200, Tt); hideHands();
    await T('m₂ and F₂', 'm₂ = 0.050 + 0.200 = 0.250 kg, so F₂ = 0.250 × 9.8 = 2.45 N.', { el: $('ft-m1'), label: 'm₂ = 0.250 kg', f: '<i>F</i><sub>2</sub> = 0.250 × 9.8 = 2.45 N' });
    await T('Unbalanced', 'F₁ and F₂ together now far outweigh the bare F₃ hanger. The ring is pulled well off the centre, between 0° and 60°, and the thread slants steeply.', { box: SR(FT.box.thread), focus: [rig], label: 'large slant' });
    /* where the equilibrant goes */
    await T('Where must F₃ go?', 'The resultant of F₁ and F₂ is F_R = √(1.96² + 2.45² + 2 × 1.96 × 2.45 × cos 60°) = 3.83 N, at α = 33.7° from F₁. The equilibrant must point the opposite way: 33.7° + 180° = 213.7°, so about 214°.', { box: SR(FT.box.plan), label: 'F₃ near 214°', f: 'tan α = 2.45 sin 60° ÷ (1.96 + 2.45 cos 60°) = 0.666 → α = 33.7°' });
    await T('Move F₃ to 214°', 'The F₃ pulley is dragged from 240° to 214°.', { box: SR(FT.box.sector(205, 245)), label: 'drag F₃', ms: 2400 });
    await dragPulley(2, 214, 2400); hideHands();
    await T('Load F₃', 'Now its mass is built up until the ring is centred. A 200 g mass first.', { box: SB(FT.bbox.hanger(2)), focus: benchAndRing(), label: '+200 g', ms: 2200 });
    await addT(2, 200, Tt);
    await T('Still too light', 'm₃ = 0.250 kg is not enough: the thread still slants towards F₁ and F₂.', { box: SR(FT.box.thread), label: 'slant smaller' });
    await T('Add 100 g', 'A 100 g mass: m₃ = 0.350 kg.', { box: SB(FT.bbox.hanger(2)), focus: benchAndRing(), label: '+100 g', ms: 1800 });
    await addT(2, 100, Tt);
    await T('Closer', 'The slant is much smaller now, but the ring is still a little off the centre.', { box: SR(FT.box.thread), label: 'nearly' });
    await T('Add 50 g', 'Try another 50 g: m₃ = 0.400 kg.', { box: SB(FT.bbox.hanger(2)), focus: benchAndRing(), label: '+50 g', ms: 1800 });
    await addT(2, 50, Tt);
    await T('Too much', 'Now F₃ wins: the ring is pulled slightly the other way, towards 214°. 0.400 kg overshoots.', { box: SR(FT.box.thread), label: 'overshoot' });
    await T('Lift it off', 'The 50 g mass is lifted off the top of the stack and returned to the tray.', { box: SB(FT.bbox.stackTop(2)), focus: benchAndRing(), label: 'lift off', ms: 2000 });
    await liftT(2, Tt);
    await T('Add 20 g, twice', 'Two 20 g masses instead: 0.350 → 0.370 → 0.390 kg.', { box: SB(FT.bbox.hanger(2)), focus: benchAndRing(), label: '+20 g', ms: 2000 });
    await addT(2, 20, Tt); await Tt.wait(700); await addT(2, 20, Tt); hideHands();
    await T('Balanced', 'm₃ = 0.390 kg at 214°: the ring sits centred on the pin and the thread hangs perfectly straight. The lamp is lit.', { box: SR(FT.box.thread), focus: [rig], label: 'straight' });
    await T('How sensitive?', 'Moving F₃ just 1°, to 213°, is enough to pull the ring off again.', { box: SR(FT.box.pulley(2)), label: '213°', ms: 2400 });
    hand(FT.svg, pulleyP(2)); FT.nudge(2, -1); await Tt.wait(2200);
    await T('Back to 214°', 'Back to 214° and the thread is straight again.', { box: SR(FT.box.thread), label: '214°', ms: 2400 });
    FT.nudge(2, 1); hideHands(); await Tt.wait(1600);
    await T('Equilibrant', 'F₃ = m₃g = 0.390 × 9.8 = 3.82 N. It is the equilibrant: equal and opposite to the resultant of F₁ and F₂, so the experimental resultant is F_E = 3.82 N.', { el: $('ft-m2'), label: 'm₃ = 0.390 kg', f: '<i>F</i><sub>E</sub> = 0.390 × 9.8 = 3.82 N' });
    /* record */
    await T('Record the reading', 'With the table level and the ring balanced, the masses and angles go into the observation table.', { el: $('ft-record'), label: 'Record', ms: 2600 });
    record();
    const tp = $('ft-tpanel');
    await T('Observation table', 'The columns of the manual: mass, force mg, the angle θ, and the three resultants. F_R is the formula value; F_G fills in after the drawing.', { el: tp });
    await T('Masses and forces', 'm₁ = 0.200 kg → F₁ = 1.96 N; m₂ = 0.250 kg → F₂ = 2.45 N.', { el: cell('F1'), focus: [tp], label: 'F = mg' });
    await T('Resultants', 'F_R = 3.83 N from the formula and F_E = 0.390 × 9.8 = 3.82 N from the equilibrant.', { el: cell('FE'), focus: [tp], label: 'F_R · F_E' });
    await T('Pulley positions', 'The three positions, and the direction check: α = 33.7°, so F₃ was expected at 213.7°; it balanced at 214°.', { el: eqt, label: 'positions' });
    /* drawing board */
    await T('Graphical method', 'Now the same addition by a scale drawing on graph paper, head to tail.', { el: board });
    await T('Scale', 'A scale is chosen first so that the triangle is large: 1 cm of line stands for 0.5 N.', { box: SD(BD.box.scale()), label: '1 cm = 0.5 N' });
    await T('Draw F₁', 'F₁ = 1.96 N becomes 1.96 ÷ 0.5 = 3.92 cm, drawn as 3.9 cm along the baseline from O.', { box: SD([BD.O[0] - 20, BD.O[1] - 40, 220, 80]), label: 'F₁ = 3.9 cm', ms: 3600, f: '1.96 ÷ 0.5 = 3.92 cm ≈ 3.9 cm' });
    await tween(2200, k => { BD.set({ l1: BD.r1(3.9 * ease(k)) }); hand(BD.svg, BD.tip1()); });
    await T('Draw F₂ at θ', 'From the tip of F₁, F₂ = 2.45 ÷ 0.5 = 4.9 cm is drawn at θ = 60° to the line of F₁, set with the protractor.', { box: SD(BD.box.prot1()), focus: [board], label: 'θ = 60°', ms: 3800, f: '2.45 ÷ 0.5 = 4.9 cm at 60°' });
    await tween(2600, k => { const e = ease(k); BD.set({ l2: BD.r1(0.4 + 4.5 * e), th: Math.round(20 + 40 * e) }); hand(BD.svg, BD.tip2()); });
    hideHands();
    await T('F₂ drawn', 'F₂ runs 4.9 cm at 60°. Its tail sits on the tip of F₁: head to tail.', { box: SD(BD.box.f2()), focus: [board], label: 'head to tail' });
    await T('Close the triangle', 'The resultant runs from the tail of F₁ (O) to the tip of F₂.', { box: SD(BD.box.fr()), focus: [board], label: 'F_R', ms: 2400 });
    BD.closeR();
    await T('Lay the ruler', 'The ruler is turned about O until its edge lies along F_R.', { box: SD(BD.box.fr()), focus: [board], label: 'ruler', ms: 2400 });
    const ang = BD.rGeom().ang;
    await tween(2400, k => { BD.set({ ruler: ang * ease(k) }); });
    BD.set({ ruler: ang });
    await T('Read the length', `The tip of F_R reaches ${f1(BD.lrRead())} cm on the ruler, so F_G = ${f1(BD.lrRead())} × 0.5 = ${f2(fgVal())} N.`, { box: SD(BD.box.tip()), focus: [board], label: `ℓ_R = ${f1(BD.lrRead())} cm`, f: `<i>F</i><sub>G</sub> = ${f1(BD.lrRead())} × 0.5 = ${f2(fgVal())} N` });
    await T('Its direction', `The protractor at O gives α = ${BD.alRead()}° from F₁, close to the 33.7° from the formula.`, { box: SD(BD.box.protO()), focus: [board], label: `α = ${BD.alRead()}°` });
    await T('Parallelogram view', 'The same result as a parallelogram: F₂ drawn from O as well, the dashed sides completing it. F_R is the diagonal.', { el: $('bd-para'), focus: [board], alt: SD(BD.box.board()), label: 'parallelogram', ms: 2600 });
    BD.setPara(true);
    await T('Same triangle', 'The upper triangle of the parallelogram is the head-to-tail triangle.', { box: SD(BD.box.board()), ms: 3200 });
    await T('Readouts', `Lengths, angles and F_G = ${f2(fgVal())} N, now also in the F_G column of the observation table.`, { el: $('ft-bread'), label: 'readouts' });
    /* calculation */
    const r = st.rec, F1s = f2(r.F[0]), F2s = f2(r.F[1]), ths = String(r.th), FRs = f2(frCalc(+F1s, +F2s, r.th)), FEs = f2(r.FE), FGs = f2(fgVal());
    const e1 = f2(Math.abs(+FEs - +FRs) / +FRs * 100), e2 = f2(Math.abs(+FGs - +FRs) / +FRs * 100);
    await T('Calculation', 'In the order of the manual: the two forces, the angle between them, the resultant by formula, by experiment and by drawing, then the percentage differences. A dotted line runs from each symbol or number to its source.', { el: calc });
    const type = async (k, v, title, text, f) => { await T(title, text, { el: IN[k], ms: 1600, f }); await Tt.typeInto(IN[k], v); await Tt.wait(400); };
    await T('', '', { trace: lSym('F1', 'm1') });
    await Tt.traceLine(wk('F1'));
    await type('F1', F1s, 'F₁', 'Mass in kg times g.', `${f3(r.m[0])} × 9.8 = ${F1s} N`);
    await Tt.traceLine(wk('F2'));
    await type('F2', F2s, 'F₂', 'The same for the second hanger.', `${f3(r.m[1])} × 9.8 = ${F2s} N`);
    await T('', '', { trace: lSym('th', 'th') });
    await Tt.traceLine(wk('th'));
    await type('th', ths, 'θ', 'The difference of the two pulley positions.', `|${r.a[1]} − ${r.a[0]}| = ${ths}°`);
    await T('', '', { trace: lSym('FR', 'FR') });
    await Tt.traceLine(wk('FR'));
    const A = (+F1s) ** 2, B = (+F2s) ** 2, Cc = 2 * +F1s * +F2s * Math.cos(r.th * Math.PI / 180);
    await type('FR', FRs, 'F_R by formula', `Square each force, add twice their product times cos θ, then take the square root. cos 60° = 0.5 in degree mode.`, `√(${A.toFixed(4)} + ${B.toFixed(4)} + ${Cc.toFixed(4)}) = √${(A + B + Cc).toFixed(4)} = ${FRs} N`);
    await Tt.traceLine(wk('FE'));
    await type('FE', FEs, 'F_E from the equilibrant', 'The whole third hanging mass times g.', `${f3(r.m[2])} × 9.8 = ${FEs} N`);
    await T('', '', { trace: lSym('FG', 'lr') });
    await Tt.traceLine(wk('FG'));
    await type('FG', FGs, 'F_G from the drawing', 'Length times the scale.', `${f1(BD.lrRead())} × 0.5 = ${FGs} N`);
    await Tt.traceLine(wk('e1'));
    await type('e1', e1, '% difference, experimental', 'The equilibrant against the formula.', `|${FEs} − ${FRs}| ÷ ${FRs} × 100 = ${e1} %`);
    await Tt.traceLine(wk('e2'));
    await type('e2', e2, '% difference, graphical', 'The drawing against the formula.', `|${FGs} − ${FRs}| ÷ ${FRs} × 100 = ${e2} %`);
    await T('Check', 'Check compares each line with the readings and the drawing, and catches the usual slips: grams instead of kg, the hanger left out, the inside angle, radians, a missing square root, the scale divided instead of multiplied.', { el: $('ft-check'), label: 'Check', ms: 4400 });
    check();
    await T('Result', 'The three resultants side by side with their differences from the formula value.', { el: res, label: 'Result' });
    for (const k of ['resR', 'resE', 'resG']) { const n = rNum(k); if (n) await T('', '', { trace: n }); }
    await T('Done', `F_R = ${FRs} N by formula, ${FEs} N from the equilibrant (${e1} %) and ${FGs} N from the drawing (${e2} %). Hovering or tapping any symbol or number in the Calculation shows its meaning and source. Start over to do it by hand.`, { el: chk });
  }
  L.registerLab('ft', {
    btn: $('ft-tut'), scope: $('view-ft-practical'), reset,
    seed: () => {}, run, cleanup: () => { hideHands(); document.body.classList.remove('tut-pair'); FT.setView('full'); }
  });
  reset();
  L.LAB = { st, record, check, reset, renderTable, IN, cell, INFO, workAll, frCalc, alphaOf };
})(window.SOL);

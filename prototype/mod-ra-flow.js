/* ==========================================================================
   Risk assessment workflow, in the order it is done
   --------------------------------------------------------------------------
   1. Details: title, type, branch, activity, assessor and team.
   2. Hazards: each hazard is assessed in one form, in this order:
        hazard → risk (what can happen) → consequence → risk rating BEFORE
        controls → hierarchy of control and the controls → risk rating AFTER
        controls (residual risk).
      Every hazard needs at least one control (or a statement that the
      existing controls are adequate) and a residual rating.
   3. Team sign-off: "Submit for sign-off" checks that every hazard is
      complete. The assessor and each team member then read and sign it.
   4. Approval: once everyone has signed, a manager approves it, accepts the
      residual risks (with a reason) and sets the review date.
   5. Implementation: on approval every control that is not in place yet is
      sent to Corrective Actions — the responsible person gets the action,
      uploads evidence that the control is in place, and someone else
      verifies it. The control's status follows its action, so the risk
      assessment shows which controls are implemented and verified.
   ========================================================================== */
'use strict';

const RA_DONE = ['Implemented', 'Verified'];
const HIER_HINT = { 'Elimination': 'Remove the hazard completely', 'Substitution': 'Replace it with something less hazardous', 'Engineering controls': 'Isolate people from the hazard (guards, ventilation, barriers)', 'Administrative controls': 'Change the way people work (procedures, training, signs, permits)', 'PPE': 'Protect the worker (last line of defence)' };

/* ---------------- Controls follow their corrective action ---------------- */
function ctrlFromAction(c) {
  const x = c.action && byId('actions', c.action); if (!x) return;
  const st = ['Verified', 'Closed'].includes(x.status) ? 'Verified' : x.status === 'Submitted for Verification' ? 'Implemented' : (x.progress || []).length || x.status === 'In Progress' ? 'In progress' : 'Planned';
  if (st !== c.status) { c.status = st; if (st === 'Verified') { c.verifiedBy = (x.verification || {}).by || c.verifiedBy || null; c.verifiedOn = (x.verification || {}).on || TODAY; } }
}
function raSyncControls() { (S.riskAssessments || []).forEach(a => (a.rows || []).forEach(r => (r.controls || []).forEach(ctrlFromAction))); }
const _rerenderBeforeRaFlow = rerender;
rerender = function (k) { try { raSyncControls(); } catch (e) { console.error(e); } _rerenderBeforeRaFlow(k); };

/* ---------------- Is a hazard complete? ---------------- */
function raRowGaps(r) {
  const g = [];
  if (!(r.risk || '').trim()) g.push('the risk (what can happen)');
  if (!(r.consequences || '').trim()) g.push('the consequence');
  if (!rScore(r.initial)) g.push('the risk rating before controls');
  if (!(r.controls || []).length && !(r.existingAdequate && (r.existing || '').trim())) g.push('at least one control');
  if (!rScore(r.residual)) g.push('the risk rating after controls');
  return g;
}
const raIncomplete = a => (a.rows || []).map((r, k) => ({ k, r, g: raRowGaps(r) })).filter(x => x.g.length);
const raAllCtrls = a => (a.rows || []).flatMap(r => r.controls || []);
const raTeam = a => [a.assessor, ...(a.participants || [])].filter((x, i, arr) => x && arr.indexOf(x) === i);

/* ---------------- The hazard form, in the order of the assessment ---------------- */
function raRateHtml(prefix, r, label, hint) {
  return `<div class="ra-rate"><div class="form-grid">${lsFields(prefix, r, label)}</div><div class="ra-rate-out" id="rr_${prefix}">${r && r.l ? rChip(r) : '<span class="muted">Choose probability and impact</span>'}</div>${hint ? `<p class="t-sub">${hint}</p>` : ''}</div>`;
}
function raCtrlRowHtml(c, i, a, locked) {
  const owners = personOptions(c ? c.owner : (site(a.site) || {}).manager, p => !!p.sysRole);
  return `<div class="ra-ctl" data-i="${i}">${c && c._ci != null ? `<input type="hidden" name="cx_${i}" value="${c._ci}">` : ''}
    <div class="field"><label for="cc_${i}">Hierarchy of control</label><select id="cc_${i}" name="cc_${i}" ${locked ? 'disabled' : ''}>${opts(HIERARCHY.map(h => ({ value: h, label: h })), c ? c.category : '', '— Choose —')}</select></div>
    <div class="field ra-ctl-d"><label for="cd_${i}">Control</label><input type="text" id="cd_${i}" name="cd_${i}" value="${esc(c ? c.desc : '')}" placeholder="e.g. Install barriers between walkways and racking" ${locked ? 'disabled' : ''}></div>
    <div class="field"><label for="co_${i}">Responsible</label><select id="co_${i}" name="co_${i}" ${locked ? 'disabled' : ''}>${owners}</select></div>
    <div class="field"><label for="cu_${i}">Target date</label><input type="date" id="cu_${i}" name="cu_${i}" value="${c ? c.due || '' : addDays(TODAY, 30)}" ${locked ? 'disabled' : ''}></div>
    ${locked ? `<span class="ra-ctl-x">${badge(c.status, c.status === 'Verified' ? 'green' : 'blue', true)}</span>` : `<button type="button" class="btn sm ghost ra-ctl-x" data-rm="${i}" aria-label="Remove this control">${icon('x', 'sm')}</button>`}</div>`;
}
ACT.raRow = (el) => { const a = byId('riskAssessments', el.dataset.id), k = el.dataset.k != null ? +el.dataset.k : null, r = k != null ? a.rows[k] : null;
  const hz = (S.hazards || []).filter(h => h.org === a.org && (h.site === a.site || h.site === 'ALL'));
  const ctrls = ((r && r.controls) || []).map((c, ci) => Object.assign({}, c, { _ci: ci }));
  let n = 0; const ctrlRows = ctrls.map(c => raCtrlRowHtml(c, n++, a, !!c.action || RA_DONE.includes(c.status))).join('');
  openModal({ title: r ? `Hazard ${k + 1}: ${r.title}` : 'Assess a hazard', sub: `${a.id} ${a.title} · work through the steps in order`, size: 'wide', body: `
    <div class="ra-step"><h3><span>1</span> Hazard</h3><div class="form-grid">
      ${fld({ name: 'hazard', label: 'From the hazard register (optional)', type: 'select', options: opts(hz.map(h => ({ value: h.id, label: `${h.id} — ${h.title}` })), r ? r.hazard || '' : '', '— Not from the register —'), full: true })}
      ${fld({ name: 'step', label: 'Activity / task step', value: r ? r.step || '' : '', full: true, placeholder: 'e.g. Travel in picking aisles with MHE' })}
      ${fld({ name: 'title', label: 'Hazard (what can cause harm?)', value: r ? r.title : '', required: true, full: true })}
      ${fld({ name: 'category', label: 'Category', type: 'select', options: opts(S.config.hazardCats, r ? r.category : '') })}${fld({ name: 'exposed', label: 'Exposed persons', value: r ? r.exposed || '' : '' })}</div></div>
    <div class="ra-step"><h3><span>2</span> Risk</h3><div class="form-grid">${fld({ name: 'risk', label: 'Risk (what can happen?)', value: r ? r.risk || '' : '', required: true, full: true, placeholder: 'e.g. Forklift strikes a pedestrian' })}</div></div>
    <div class="ra-step"><h3><span>3</span> Consequence of the risk</h3><div class="form-grid">${fld({ name: 'consequences', label: 'Consequence (how bad can it be?)', type: 'textarea', rows: 2, value: r ? r.consequences || '' : '', required: true, full: true, placeholder: 'e.g. Crushed foot, fractures, fatality' })}</div></div>
    <div class="ra-step"><h3><span>4</span> Risk rating before controls</h3>${raRateHtml('i', r && r.initial, 'Before controls', '')}</div>
    <div class="ra-step"><h3><span>5</span> Hierarchy of control and controls</h3>
      <div class="ra-hier-hint">${HIERARCHY.map((h, i) => `<span><b>${i + 1}. ${esc(h)}</b> ${esc(HIER_HINT[h])}</span>`).join('')}</div>
      <div class="form-grid">${fld({ name: 'existing', label: 'Controls already in place', type: 'textarea', rows: 2, value: r ? r.existing || '' : '', full: true })}</div>
      <h4 class="mt-s">Controls to put in place</h4><div id="raCtls">${ctrlRows}</div>
      <button type="button" class="btn sm" id="raCtlAdd">${icon('plus', 'sm')} Add a control</button>
      <label class="check mt-s"><input type="checkbox" name="adequate" ${r && r.existingAdequate ? 'checked' : ''}> <span>No further controls are needed: the controls already in place are adequate</span></label>
      <p class="t-sub">Start at the top of the hierarchy: eliminate or substitute the hazard before relying on procedures and PPE. Once the assessment is approved, each control goes to Corrective Actions so the responsible person can upload evidence that it is in place.</p></div>
    <div class="ra-step"><h3><span>6</span> Risk rating after controls (residual risk)</h3>${raRateHtml('r', r && r.residual, 'After controls', 'The risk expected once the controls above are in place.')}</div>`,
    onOpen: m => {
      const s = m.querySelector('[name=hazard]'); s.addEventListener('change', () => { const h = byId('hazards', s.value); if (!h) return; m.querySelector('[name=title]').value = h.title; m.querySelector('[name=category]').value = h.category; if (!m.querySelector('[name=exposed]').value) m.querySelector('[name=exposed]').value = h.exposed || ''; });
      const live = p => { const l = +m.querySelector(`[name=${p}l]`).value, sv = +m.querySelector(`[name=${p}s]`).value; m.querySelector('#rr_' + p).innerHTML = l && sv ? rChip({ l, s: sv }) : '<span class="muted">Choose probability and impact</span>'; };
      ['i', 'r'].forEach(p => ['l', 's'].forEach(x => m.querySelector(`[name=${p}${x}]`).addEventListener('change', () => live(p))));
      const box = m.querySelector('#raCtls');
      m.querySelector('#raCtlAdd').addEventListener('click', () => { box.insertAdjacentHTML('beforeend', raCtrlRowHtml(null, n++, a, false)); const last = box.lastElementChild.querySelector('select'); if (last) last.focus(); });
      box.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) b.closest('.ra-ctl').remove(); });
      if (!r) box.insertAdjacentHTML('beforeend', raCtrlRowHtml(null, n++, a, false));
    },
    buttons: [{ label: 'Save hazard', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false; const v = readForm(m);
      if (!v.il || !v.is) { toast('Rate the risk before controls (step 4).', 'error'); return false; }
      // the controls, as entered
      const rows = [...m.querySelectorAll('.ra-ctl')], out = []; let bad = '';
      rows.forEach(el2 => { const i = el2.dataset.i, cx = m.querySelector(`[name=cx_${i}]`), prev = cx ? (r.controls || [])[+cx.value] : null;
        if (prev && (prev.action || RA_DONE.includes(prev.status))) { out.push(prev); return; }
        const desc = (m.querySelector(`[name=cd_${i}]`).value || '').trim(), cat = m.querySelector(`[name=cc_${i}]`).value, owner = m.querySelector(`[name=co_${i}]`).value, due = m.querySelector(`[name=cu_${i}]`).value;
        if (!desc && !cat && !prev) return;   // an empty row is ignored
        if (!desc || !cat || !owner || !due) { bad = bad || 'Each control needs its hierarchy level, the control, a responsible person and a target date.'; return; }
        out.push(Object.assign(prev || { status: 'Planned', evidence: [] }, { desc, category: cat, owner, due })); });
      if (bad) { toast(bad, 'error'); return false; }
      if (!out.length && !(v.adequate && (v.existing || '').trim())) { toast('Add at least one control (step 5), or describe the controls in place and tick that they are adequate.', 'error'); return false; }
      if (!v.rl || !v.rs) { toast('Rate the risk after controls (step 6).', 'error'); return false; }
      if (+v.rl * +v.rs > +v.il * +v.is) { toast('The risk after controls cannot be higher than before controls.', 'error'); return false; }
      out.sort((x, y) => HIERARCHY.indexOf(x.category) - HIERARCHY.indexOf(y.category));
      const row = Object.assign(r || { id: 'r' + Math.random().toString(36).slice(2, 7) }, { hazard: v.hazard || null, step: v.step, risk: v.risk, title: v.title, category: v.category, exposed: v.exposed, consequences: v.consequences, existing: v.existing, existingAdequate: !!v.adequate, initial: { l: +v.il, s: +v.is }, residual: { l: +v.rl, s: +v.rs }, controls: out });
      if (r && r.accepted && JSON.stringify(r.accepted.residual || null) !== JSON.stringify(row.residual) && r.accepted.residual) delete row.accepted;
      if (!r) a.rows.push(row);
      if (row.hazard) { const h = byId('hazards', row.hazard); if (h) { h.assessments = [...new Set((h.assessments || []).concat(a.id))]; if (h.status === 'Open') h.status = 'Assessed'; } }
      if (escalates(row.initial) && !row.escalated) { row.escalated = TODAY; const to = hseqManagers(a.org).concat(S.people.filter(p => p.org === a.org && p.sysRole === 'Managing Director').map(p => p.id)); queueEmail(to, 'actions', `${rBand(row.initial).name} risk: ${row.title} (${a.id})`, `${pname(S.ui.user)} rated "${row.title}" in ${a.id} ${a.title} as ${rBand(row.initial).name} (${rScore(row.initial)}) before controls; ${rScore(row.residual)} (${rBand(row.residual).name}) after the planned controls. ${rBand(row.initial).action || ''}`, '#/risk/' + a.id); addEvent('red', 'risk', `${rBand(row.initial).name} risk recorded`, `${row.title} — ${a.title}`, '#/risk/' + a.id, a.site, to); }
      // an approved assessment that gets new controls: send them to Corrective Actions straight away
      if (a.status === 'Approved') raControlsToActions(a);
      log(`${r ? 'Updated' : 'Assessed'} hazard "${row.title}" in ${a.id} (${out.length} control(s))`, '#/risk/' + a.id); save(); rerender(); } }] }); };
// "Add control" on a hazard opens the same form
ACT.raCtrl = (el) => ACT.raRow(el);

/* ---------------- Controls go to Corrective Actions ---------------- */
function raControlsToActions(a) {
  let n = 0; (a.rows || []).forEach(r => (r.controls || []).forEach(c => { if (c.action || RA_DONE.includes(c.status)) return;
    c.action = createAction({ source: 'Risk assessment', sourceId: a.id, title: `${a.title}: ${c.desc}`.slice(0, 140), action: `Put this control in place (${c.category}) for "${r.title}": ${c.desc}. Upload evidence that it is in place (photo, record or document) and submit it for verification.`, owner: c.owner, due: c.due, priority: escalates(r.initial) ? 'High' : 'Medium', site: a.site }).id; n++; }));
  return n;
}

/* ---------------- Submit for sign-off → sign → approve ---------------- */
ACT.raSubmit = (el) => { const a = byId('riskAssessments', el.dataset.id);
  if (!(a.rows || []).length) { toast('Assess at least one hazard first.', 'error'); return; }
  const inc = raIncomplete(a); if (inc.length) { toast(`Complete hazard ${inc.map(x => x.k + 1).join(', ')} first: ${inc[0].g.join(', ')}.`, 'error'); return; }
  const team = raTeam(a);
  confirmBox('Submit for sign-off?', `${team.map(pname).join(', ')} will be asked to read and sign ${a.id}. It cannot be changed while it is being signed; take it back to draft to change it.`, 'Submit for sign-off', () => {
    a.status = 'Awaiting sign-off'; a.submitted = { by: S.ui.user, on: TODAY };
    const to = raSignNeeded(a); if (to.length) { queueEmail(to, 'actions', `Please sign risk assessment ${a.id}: ${a.title}`, `Risk assessment ${a.id} "${a.title}" is ready for sign-off. Please open it, read the hazards, risks and controls, and sign it.`, '#/myra/' + a.id); addEvent('amber', 'risk', 'Risk assessment to sign', `${a.id} ${a.title}`, '#/myra/' + a.id, a.site, to); }
    log(`Submitted risk assessment ${a.id} for sign-off`, '#/risk/' + a.id); save(); toast('Submitted for sign-off.'); rerender(); }); };
ACT.raBackToDraft = (el) => { const a = byId('riskAssessments', el.dataset.id);
  confirmBox('Back to draft?', `Take ${a.id} back to draft to change it? The signatures collected so far are removed, because the team must sign the changed assessment.`, 'Back to draft', () => {
    a.status = 'Draft'; a.signatures = {}; log(`Took risk assessment ${a.id} back to draft`, '#/risk/' + a.id); save(); rerender(); }); };
const _raApproveBeforeFlow2 = ACT.raApprove;
ACT.raApprove = (el) => { const a = byId('riskAssessments', el.dataset.id);
  if (a.status !== 'Awaiting sign-off') { if (a.status === 'Draft') { ACT.raSubmit(el); return; } return _raApproveBeforeFlow2(el); }
  const need = raSignNeeded(a); if (need.length) { toast(`Still to sign: ${need.map(pname).join(', ')}. Approval comes after the team has signed.`, 'error'); return; }
  const open = (a.rows || []).filter(r => !r.accepted), nC = raAllCtrls(a).filter(c => !c.action && !RA_DONE.includes(c.status)).length;
  openModal({ title: 'Approve the risk assessment', sub: `${a.id} ${a.title} · signed by the whole team`, body: `<div class="form-grid">
      ${open.length ? `<div class="field full"><label>Residual risks to accept</label><ul class="ra-acc-list">${open.map(r => `<li>${esc(r.title)} ${rChip(r.residual)}</li>`).join('')}</ul></div>${fld({ name: 'reason', label: 'Why the residual risks are acceptable (professional judgement)', type: 'textarea', rows: 2, required: true, full: true })}` : ''}
      ${fld({ name: 'reviewDate', label: 'Review by', type: 'date', value: addMonths(TODAY, 12), required: true })}
      <label class="check full"><input type="checkbox" name="ok"> <span>I have reviewed the hazards, risks, ratings and controls, and approve this risk assessment.</span></label></div>
      ${nC ? `<p class="t-sub">${nC} control(s) are not in place yet. On approval each one goes to <b>Corrective Actions</b>: the responsible person uploads evidence that it is in place, and someone else verifies it.</p>` : ''}`,
    buttons: [{ label: 'Approve', cls: 'primary', onClick: m => { if (!validateForm(m)) return false; const v = readForm(m); if (!v.ok) { toast('Tick that you reviewed and approve the assessment.', 'error'); return false; }
      open.forEach(r => { r.accepted = { by: S.ui.user, on: TODAY, reason: v.reason, recordedBy: S.ui.user, residual: Object.assign({}, r.residual) }; });
      Object.assign(a, { status: 'Approved', approvedBy: S.ui.user, approvedOn: TODAY, reviewDate: v.reviewDate });
      const n = raControlsToActions(a);
      log(`Approved risk assessment ${a.id}${n ? `; ${n} control(s) sent to Corrective Actions` : ''}`, '#/risk/' + a.id); save(); toast(n ? `Approved. ${n} control(s) sent to Corrective Actions for implementation and evidence.` : 'Approved.'); rerender(); } }] }); };
// tasks: nobody is asked to sign a draft
const _myTasksBeforeRaFlow = myTasks;
myTasks = function () { return _myTasksBeforeRaFlow().filter(t => { const m = /^#\/myra\/(RA-\d+)$/.exec(t.link || ''); if (!m) return true; const a = byId('riskAssessments', m[1]); return !a || a.status !== 'Draft'; }); };

/* ---------------- The assessment page: the steps, and the right buttons for the step ---------------- */
function raStepsHtml(a) {
  const rows = a.rows || [], inc = raIncomplete(a), team = raTeam(a), sigs = team.filter(x => (a.signatures || {})[x]), C = raAllCtrls(a), ver = C.filter(c => c.status === 'Verified').length, impl = C.filter(c => RA_DONE.includes(c.status)).length;
  const st = a.status, after = st === 'Approved';
  const S1 = [['Details', 'done', `${esc(a.type)} · ${esc(pname(a.assessor))}`],
    ['Hazards, risks and controls', rows.length && !inc.length ? 'done' : st === 'Draft' ? 'now' : 'done', rows.length ? `${rows.length - inc.length} of ${rows.length} complete` : 'None yet'],
    ['Team sign-off', st === 'Draft' ? 'todo' : sigs.length === team.length ? 'done' : 'now', `${sigs.length} of ${team.length} signed`],
    ['Approval', after ? 'done' : st === 'Awaiting sign-off' && sigs.length === team.length ? 'now' : 'todo', after ? `${fmt(a.approvedOn)} · ${esc(pname(a.approvedBy))}` : 'After the team has signed'],
    ['Controls in place', !after ? 'todo' : C.length && ver === C.length ? 'done' : C.length ? 'now' : 'done', C.length ? `${impl} of ${C.length} implemented · ${ver} verified` : 'No new controls']];
  return `<ol class="ra-steps">${S1.map(([t, s, sub], i) => `<li class="${s}"><span class="n">${s === 'done' ? icon('check', 'sm') : i + 1}</span><div><b>${t}</b><small>${sub}</small></div></li>`).join('')}</ol>`;
}
const _riskBeforeRaFlow = ROUTES.risk;
ROUTES.risk = (p, q) => { const r = _riskBeforeRaFlow(p, q);
  if (!r || !r.html || !p[0] || !/^RA-/.test(p[0]) || p[1]) return r; const a = byId('riskAssessments', p[0]); if (!a || a.status === 'Superseded') return r;
  const edit = canRisk(), st = a.status, inc = raIncomplete(a), need = raSignNeeded(a);
  // buttons for the step the assessment is in
  r.html = r.html.replace(/<button class="btn primary" data-act="raApprove"[^>]*>Approve<\/button>/, '')
    .replace(`<button class="btn" data-act="raRow" data-id="${a.id}">${icon('plus', 'sm')} Add hazard</button>`, '')
    .replace('No hazards assessed yet. Use "Add hazard".', `No hazards assessed yet.${edit && st === 'Draft' ? ` <button class="btn sm primary" data-act="raRow" data-id="${a.id}">${icon('plus', 'sm')} Assess the first hazard</button>` : ''}`);
  const addH = `<button class="btn ${st === 'Draft' && (!(a.rows || []).length || inc.length) ? 'primary' : ''}" data-act="raRow" data-id="${a.id}">${icon('plus', 'sm')} Assess a hazard</button>`;
  if (edit && st === 'Draft') r.html = r.html.replace(/(<div class="sh-actions">(?:<a class="btn keep"[^>]*>[\s\S]*?<\/a>)?)/, `$1${addH}<button class="btn ${(a.rows || []).length && !inc.length ? 'primary' : ''}" data-act="raSubmit" data-id="${a.id}">${icon('check', 'sm')} Submit for sign-off</button>`);
  if (edit && st === 'Approved') r.html = r.html.replace(/(<div class="sh-actions">(?:<a class="btn keep"[^>]*>[\s\S]*?<\/a>)?)/, `$1${addH}`);
  if (edit && st === 'Awaiting sign-off') r.html = r.html.replace('<div class="sh-actions">', `<div class="sh-actions"><button class="btn primary" data-act="raApprove" data-id="${a.id}" ${need.length ? 'title="After the team has signed"' : ''}>${icon('checkCircle', 'sm')} Approve</button><button class="btn" data-act="raBackToDraft" data-id="${a.id}">Back to draft</button>`);
  if (st === 'Awaiting sign-off') r.html = r.html.replace(/data-act="raRow" data-id="[^"]+" data-k="\d+">[\s\S]*?<\/button>/g, m => m.replace('data-act="raRow"', 'data-act="raLocked"'))
    .replace(/<button class="btn sm mt-s" data-act="raCtrl"[^>]*>[\s\S]*?<\/button>/g, '');
  r.html = r.html.replace('badge b-red">Awaiting sign-off', 'badge b-amber">Awaiting sign-off');
  // the steps and what to do next
  const next = st === 'Draft' ? (!(a.rows || []).length ? 'Next: assess the hazards. For each hazard record the risk, its consequence, the rating before controls, the controls (hierarchy of control) and the rating after controls.' : inc.length ? `Next: complete hazard ${inc.map(x => x.k + 1).join(', ')} (${inc[0].g.join(', ')}).` : 'All hazards are complete. Next: submit it for sign-off by the team.')
    : st === 'Awaiting sign-off' ? (need.length ? `Waiting for signatures: ${need.map(pname).map(esc).join(', ')}.` : 'Everyone has signed. Next: a manager approves it.')
    : (() => { const C = raAllCtrls(a), open = C.filter(c => c.status !== 'Verified'); return C.length ? (open.length ? `${open.length} control(s) still to be implemented and verified through Corrective Actions.` : 'All controls are implemented and verified.') : ''; })();
  r.html = r.html.replace('<div class="detail">', `${raStepsHtml(a)}${next ? `<div class="alert ${st === 'Approved' && !/still/.test(next) ? 'success' : 'info'} ra-next">${icon(st === 'Approved' ? 'checkCircle' : 'info')}<div>${next}</div></div>` : ''}<div class="detail">`);
  // incomplete hazards are marked
  inc.forEach(({ k, g }) => { r.html = r.html.replace(new RegExp(`(<div class="card ra-row cq-card">)(<div class="card-head"><div><h2>${k + 1}\\. )`), `<div class="card ra-row cq-card ra-inc">$2`).replace(`<div class="card ra-row cq-card ra-inc"><div class="card-head"><div><h2>${k + 1}. `, `<div class="card ra-row cq-card ra-inc"><div class="alert warn ra-inc-note">${icon('alert', 'sm')}<div>Still to record: ${esc(g.join(', '))}.</div></div><div class="card-head"><div><h2>${k + 1}. `); });
  // controls: their corrective action and evidence
  r.html = r.html.replace(/<h3 class="ra-h3">Additional controls<\/h3>/g, '<h3 class="ra-h3">Controls (hierarchy of control) and their implementation</h3>');
  (a.rows || []).forEach((row, k) => (row.controls || []).forEach((c, i) => { const x = c.action && byId('actions', c.action); if (!x) return;
    r.html = r.html.replace(`<button class="btn sm" data-act="raCtrlUpd" data-id="${a.id}" data-k="${k}" data-i="${i}">Update</button>`, `<a class="btn sm" href="#/actions/${x.id}">${(x.evidence || []).length ? `Evidence (${x.evidence.length})` : 'Open action'}</a>`)
      .replace(`Tracked as <a href="#/actions/${x.id}">${x.id}</a>`, `Corrective action <a href="#/actions/${x.id}">${x.id}</a> · ${esc(x.status)}${(x.evidence || []).length ? ` · ${x.evidence.length} evidence file(s)` : ' · no evidence yet'}`); }));
  r.html = r.html.replace(/<span class="t-sub">Initial risk<\/span>/g, '<span class="t-sub">Risk before controls</span>').replace(/<span class="t-sub">Residual risk \(after additional controls\)<\/span>/g, '<span class="t-sub">Risk after controls (residual)</span>');
  return r; };
ACT.raLocked = () => toast('It is being signed. Take it back to draft to change it.', 'error');
const _raCtrlUpdBeforeFlow = ACT.raCtrlUpd;
ACT.raCtrlUpd = (el) => { const a = byId('riskAssessments', el.dataset.id), c = a.rows[+el.dataset.k].controls[+el.dataset.i]; if (c.action) { navigate('#/actions/' + c.action); return; } _raCtrlUpdBeforeFlow(el); };
// the status badge tone in lists
if (typeof STATUS_COLOURS === 'object') STATUS_COLOURS['Awaiting sign-off'] = 'amber';

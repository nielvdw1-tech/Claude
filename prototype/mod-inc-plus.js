/* ==========================================================================
   Incidents: guided root cause (5 Whys), witness statements, external reporting
   --------------------------------------------------------------------------
   5 Whys: the investigator starts from what happened and asks "why?" until
   the answer is a failure of the system (procedure, training, supervision,
   equipment, planning), not only a person's behaviour. The last answer is
   the root cause. A root cause that only blames a person is queried.

   Witness statements: taken on the phone, in the witness's words, and signed
   by the witness. A signed statement cannot be changed.

   External reporting: a competent person decides whether the incident must
   be reported, and by when; each report made (to whom, when, how, reference,
   the form sent) is logged. The system does not decide what is reportable.
   ========================================================================== */
'use strict';

/* ---------------- 5 Whys ---------------- */
const BLAME = /careless|not careful|human error|negligen|did ?n.?t pay attention|not concentrating|lazy|stupid|ignored the rule|own fault/i;
function whyChain(inv) {
  if (!inv) return [];
  if (inv.whys && inv.whys.length) return inv.whys;
  return [inv.immediate, inv.underlying].filter(Boolean);   // investigations recorded before the 5 Whys
}
function invCardHtml(i) {
  const inv = i.investigation;
  const head = `<div class="card"><div class="card-head"><h2>Investigation & root cause</h2>${i.investigator ? `<span class="ch-sub">Investigator: ${esc(pname(i.investigator))}</span>` : ''}</div><div class="card-body">`;
  if (!inv) return head + `<p class="muted">${i.investigator ? 'Investigation not yet recorded.' : 'No investigator assigned yet.'}</p></div></div>`;
  const whys = whyChain(inv);
  return head + `<div class="kv"><div>Findings</div><div>${esc(inv.findings)}</div></div>
    <ol class="why-chain"><li class="wc-problem"><span class="wc-tag">What happened</span>${esc(inv.problem || i.title)}</li>
      ${whys.map((w, k) => `<li><span class="wc-tag">Why ${k + 1}?</span>${esc(w)}</li>`).join('')}
      <li class="wc-root"><span class="wc-tag">Root cause</span><b>${esc(inv.root)}</b></li></ol>
    <div class="kv mt-s"><div>Cause categories</div><div>${(inv.categories || []).map(c => `<span class="tag">${esc(c)}</span>`).join(' ') || '—'}</div><div>Completed</div><div>${inv.completed ? fmt(inv.completed) : '<span class="due amber">In progress</span>'}</div></div></div></div>`;
}
ACT.incInvestigate = (el) => {
  const i = byId('incidents', el.dataset.id), inv = i.investigation || {}, whys = whyChain(inv);
  const whyRow = k => `<div class="field full why-row"><label for="why${k}">Why ${k + 1}?${k < 2 ? '<span class="req">*</span>' : ''}</label><input type="text" id="why${k}" name="why${k}" value="${esc(whys[k] || '')}" ${k < 2 ? 'required' : ''} placeholder="${['e.g. The forklift reversed without warning', 'e.g. The reversing alarm was not working', 'e.g. The pre-use check did not include the alarm', 'e.g. The checklist was not reviewed after the new forklifts arrived', 'e.g. No one owns the review of checklists'][k]}"></div>`;
  openModal({ title: 'Record investigation', sub: `${i.id} — ask "why?" until you reach what in the system allowed it to happen.`, size: 'wide', body: `<div class="form-grid">
    ${fld({ name: 'findings', label: 'Investigation findings (facts, evidence, interviews)', type: 'textarea', value: inv.findings || '', required: true, full: true })}
    ${fld({ name: 'problem', label: 'What happened (the problem)', value: inv.problem || i.title, required: true, full: true })}
    <div class="field full"><div class="why-help">${icon('info', 'sm')} Answer each "why?" with a fact. Stop when the answer is something the company controls (a procedure, training, supervision, equipment, planning). Two to five whys are usual.</div></div>
    ${[0, 1, 2, 3, 4].map(whyRow).join('')}
    ${fld({ name: 'root', label: 'Root cause (filled in from your last answer; change it if needed)', type: 'textarea', value: inv.root || '', required: true, full: true, rows: 2 })}
    <div class="field full hidden" id="blameWarn"><div class="alert warn" style="margin:0">${icon('alert')}<div>This root cause blames a person. Ask once more <b>why</b> the system allowed it (training, supervision, procedure, equipment, workload). Click <b>Save investigation</b> again to keep it as it is.</div></div></div>
    <div class="field full"><label>Cause categories</label><div class="grid g3">${RC_CATEGORIES.map(c => `<label class="check"><input type="checkbox" name="cat_${c}" ${(inv.categories || []).includes(c) ? 'checked' : ''}> ${esc(c)}</label>`).join('')}</div></div>
    ${fld({ name: 'complete', label: 'Investigation complete — proceed to corrective actions', type: 'checkbox', value: !!inv.completed, full: true })}</div>`,
    onOpen: m => {
      const root = m.querySelector('[name=root]'); let touched = !!inv.root;
      root.addEventListener('input', () => { touched = true; m._warned = false; });
      const sync = () => { if (touched) return; const last = [4, 3, 2, 1, 0].map(k => m.querySelector(`[name=why${k}]`).value.trim()).find(Boolean); root.value = last || ''; };
      m.querySelectorAll('.why-row input').forEach(x => x.addEventListener('input', sync));
    },
    buttons: [{ label: 'Save investigation', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false; const v = readForm(m); const cats = RC_CATEGORIES.filter(c => v['cat_' + c]);
      const w = [0, 1, 2, 3, 4].map(k => (v['why' + k] || '').trim());
      const gap = w.findIndex((x, k) => !x && w.slice(k + 1).some(Boolean));
      if (gap >= 0) { toast(`Fill in Why ${gap + 1} or remove the answers after it.`, 'error'); return false; }
      if (BLAME.test(v.root) && !m._warned) { m._warned = true; m.querySelector('#blameWarn').classList.remove('hidden'); m.querySelector('#blameWarn').scrollIntoView({ block: 'center' }); return false; }
      const whys = w.filter(Boolean);
      i.investigation = { findings: v.findings, problem: v.problem, whys, immediate: whys[0], underlying: whys.slice(1).join(' → '), root: v.root, categories: cats, completed: v.complete ? TODAY : null, blameKept: BLAME.test(v.root) || undefined };
      i.history.push({ ts: nowTs(), by: S.ui.user, action: v.complete ? 'Investigation completed — root cause identified' : 'Investigation updated', comment: `${whys.length} whys · Root cause: ${v.root}` });
      if (v.complete && i.status === 'Under Investigation') i.status = 'Actions in Progress';
      log(`Investigation ${v.complete ? 'completed' : 'updated'} for ${i.id}`, '#/incidents/' + i.id); save(); toast(v.complete ? 'Investigation complete. Now raise corrective actions for the root cause.' : 'Investigation saved.'); rerender();
      if (v.complete && !incActions(i).length) setTimeout(() => ACT.incAction({ dataset: { id: i.id } }), 60);
    } }] });
};

/* ---------------- Witness statements ---------------- */
const WS = { sig: null };
function witnessCardHtml(i) {
  const list = i.statements || [];
  return `<div class="card" id="wsCard"><div class="card-head"><h2>Witness statements</h2>${i.status !== 'Closed' ? permBtn('incident.investigate', `<button class="btn sm" data-act="wsNew" data-id="${i.id}">${icon('plus', 'sm')} Take statement</button>`) : ''}</div><div class="card-body">
    ${list.length ? `<ul class="ws-list">${list.map(w => `<li><div class="ws-top"><b>${esc(w.name)}</b><span class="t-sub">${esc(w.role || '')}${w.contact ? ' · ' + esc(w.contact) : ''}</span>${w.sig ? badge('Signed', 'green', true) : badge('Demo record — no signature', 'grey', true)}</div>
      <blockquote>${esc(w.statement)}</blockquote>
      <div class="ws-foot">${w.sig ? `<img class="ws-sig" src="${w.sig}" alt="Signature of ${esc(w.name)}">` : ''}<span class="t-sub">${w.sig ? 'Signed by ' + esc(w.name) : 'Recorded'} · ${fmtTs(w.ts)} · taken by ${esc(pname(w.takenBy))}</span></div></li>`).join('')}</ul>` : `<p class="muted">No statements yet.${i.witnesses ? ` Witnesses named in the report: ${esc(i.witnesses)}.` : ''}</p>`}
  </div></div>`;
}
ACT.wsNew = (el) => {
  const i = byId('incidents', el.dataset.id); WS.sig = null;
  const ppl = S.people.filter(p => p.org === i.org && p.status !== 'Deactivated');
  openModal({ title: 'Take a witness statement', sub: `${i.id} — in the witness's own words. Read it back to them before they sign.`, size: 'wide', body: `<div class="form-grid">
      ${fld({ name: 'who', label: 'Witness', type: 'select', options: opts([{ value: '', label: 'Someone else (type the name)' }].concat(ppl.map(p => ({ value: p.id, label: `${p.name} — ${p.jobTitle}` }))), '') })}
      ${fld({ name: 'name', label: 'Name (if not in the list)' })}
      ${fld({ name: 'role', label: 'Job title / company' })}
      ${fld({ name: 'contact', label: 'Phone or e-mail' })}
      ${fld({ name: 'statement', label: 'Statement: what did you see and hear?', type: 'textarea', required: true, full: true, rows: 6 })}
      ${fld({ name: 'confirm', label: 'The statement was read back to the witness, who confirms it is true and correct', type: 'checkbox', required: true, full: true })}
      <div class="field full" id="wsSigField"><label for="wsPad">Witness signature<span class="req">*</span></label><div class="sig-wrap"><canvas id="wsPad" class="sig-pad" aria-label="Signature pad for the witness"></canvas><div class="sig-foot"><span>The witness signs with a finger or mouse</span><button type="button" class="btn sm" data-act="wsSigClear">Clear</button></div></div></div>
    </div>`,
    onOpen: m => { setTimeout(() => initSigPad('wsPad', WS, 'sig', 'wsSigField'), 30); const who = m.querySelector('[name=who]'); who.addEventListener('change', () => { const p = person(who.value); if (p) { m.querySelector('[name=name]').value = p.name; m.querySelector('[name=role]').value = p.jobTitle; m.querySelector('[name=contact]').value = p.email || ''; } }); },
    buttons: [{ label: 'Save signed statement', cls: 'primary', onClick: m => {
      if (!validateForm(m, fail => { const n = m.querySelector('[name=name]'); if (!n.value.trim()) fail(n, 'Enter the witness\'s name.'); })) return false;
      if (!WS.sig) { const f = m.querySelector('#wsSigField'); f.classList.add('invalid'); toast('The witness must sign the statement.', 'error'); return false; }
      const v = readForm(m); i.statements = i.statements || [];
      const w = { id: `${i.id}-W${i.statements.length + 1}`, person: v.who || null, name: v.name.trim(), role: v.role, contact: v.contact, statement: v.statement.trim(), sig: WS.sig, ts: nowTs(), takenBy: S.ui.user };
      i.statements.push(w);
      i.history.push({ ts: nowTs(), by: S.ui.user, action: `Witness statement signed by ${w.name}`, comment: '' });
      log(`Took a signed witness statement from ${w.name} for ${i.id}`, '#/incidents/' + i.id); save(); toast('Signed statement saved. It cannot be changed.'); rerender();
    } }] });
};
ACT.wsSigClear = () => { WS.sig = null; const c = document.getElementById('wsPad'); if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height); };

/* ---------------- External reporting ---------------- */
const REPORT_TO = ['Department of Employment and Labour (inspector)', 'Compensation Fund / mutual association (COIDA claim)', 'Insurer', 'Client / principal contractor', 'Other'];
function rep(i) { i.reporting = i.reporting || { required: 'To be determined', status: 'Not assessed', ref: '' }; i.reporting.submissions = i.reporting.submissions || []; return i.reporting; }
function reportingState(i) {
  const r = rep(i);
  if (r.required === 'No') return { label: 'Not reportable', colour: 'grey' };
  if (r.required === 'Yes') return r.submissions.length ? { label: 'Reported', colour: 'green' } : r.due && daysTo(r.due) < 0 ? { label: 'Report overdue', colour: 'red' } : { label: 'To be reported', colour: 'amber' };
  return { label: 'Decision needed', colour: ['Lost Time Injury', 'Fatality'].includes(injClass(i)) ? 'red' : 'amber' };
}
function reportingCardHtml(i) {
  const r = rep(i), st = reportingState(i), serious = ['Lost Time Injury', 'Fatality'].includes(injClass(i));
  return `<div class="card" id="repCard"><div class="card-head"><h2>External reporting</h2>${badge(st.label, st.colour)}</div><div class="card-body">
    ${r.decision ? `<p><b>${r.required === 'Yes' ? 'Must be reported' : 'Not reportable'}</b>${r.required === 'Yes' && r.due ? ` · by <b>${fmt(r.due)}</b>` : ''}<br><span class="t-sub">Decided by ${esc(pname(r.decision.by))}, ${fmt(r.decision.on)}: ${esc(r.decision.reason)}</span></p>` : (serious ? `<div class="alert warn" style="margin:0 0 8px">${icon('alert')}<div><b>${esc(injClass(i))}:</b> check whether this incident must be reported, to whom and by when, and record the decision here.</div></div>` : `<p class="muted">A competent person must decide whether this incident has to be reported, to whom and by when.</p>`)}
    ${r.submissions.length ? `<ul class="rep-list">${r.submissions.map(x => `<li><b>${esc(x.to)}</b><div class="t-sub">${fmt(x.date)} · ${esc(x.method)}${x.ref ? ` · ref <span class="mono">${esc(x.ref)}</span>` : ''} · by ${esc(pname(x.by))}</div>${x.file ? fileChip(x.file) : ''}</li>`).join('')}</ul>` : ''}
    ${r.status && !r.decision && r.status !== 'Not assessed' ? `<p class="t-sub">Earlier note: ${esc(r.status)}${r.ref ? ' · ref ' + esc(r.ref) : ''}</p>` : ''}
    <div class="btn-row mt-s">${permBtn('incident.investigate', `<button class="btn sm" data-act="repDecide" data-id="${i.id}">${r.decision ? 'Change decision' : 'Record decision'}</button>`)}${r.required === 'Yes' ? permBtn('incident.investigate', `<button class="btn sm primary" data-act="repLog" data-id="${i.id}">${icon('plus', 'sm')} Log a report made</button>`) : ''}</div>
    <p class="muted mt-s" style="font-size:12px">Whether an incident must be reported to the authorities (e.g. under section 24 of the OHS Act or COIDA) must be determined by a competent person. The system records the decision and the reports made; it does not decide.</p>
  </div></div>`;
}
ACT.repDecide = (el) => {
  const i = byId('incidents', el.dataset.id), r = rep(i);
  openModal({ title: 'Must this incident be reported?', sub: `${i.id} — decision by a competent person`, body: `<div class="form-grid">
      ${fld({ name: 'required', label: 'Reportable', type: 'select', options: opts(['Yes', 'No'], r.required === 'No' ? 'No' : 'Yes'), required: true })}
      ${fld({ name: 'due', label: 'Report by (if reportable)', type: 'date', value: r.due || '' })}
      ${fld({ name: 'reason', label: 'Reason / basis for the decision', type: 'textarea', required: true, full: true, value: r.decision ? r.decision.reason : '' })}
    </div>`,
    buttons: [{ label: 'Save decision', cls: 'primary', onClick: m => {
      if (!validateForm(m, fail => { if (m.querySelector('[name=required]').value === 'Yes' && !m.querySelector('[name=due]').value) fail(m.querySelector('[name=due]'), 'Set the date it must be reported by.'); })) return false;
      const v = readForm(m);
      Object.assign(r, { required: v.required, due: v.required === 'Yes' ? v.due : null, decision: { by: S.ui.user, on: TODAY, reason: v.reason.trim() }, status: v.required === 'Yes' ? 'To be reported' : 'Not reportable' });
      i.history.push({ ts: nowTs(), by: S.ui.user, action: v.required === 'Yes' ? `External reporting: must be reported by ${fmt(v.due)}` : 'External reporting: not reportable', comment: v.reason.trim() });
      log(`Recorded the external reporting decision for ${i.id}`, '#/incidents/' + i.id); save(); toast('Decision saved.'); rerender();
    } }] });
};
ACT.repLog = (el) => {
  const i = byId('incidents', el.dataset.id), r = rep(i);
  openModal({ title: 'Log a report made', sub: i.id, body: `<div class="form-grid">
      ${fld({ name: 'to', label: 'Reported to', type: 'select', options: opts(REPORT_TO, REPORT_TO[0]), required: true, full: true })}
      ${fld({ name: 'date', label: 'Date reported', type: 'date', value: TODAY, required: true })}
      ${fld({ name: 'method', label: 'How', type: 'select', options: opts(['Online submission', 'E-mail', 'Hand delivered', 'Registered post', 'Telephone (followed up in writing)']), required: true })}
      ${fld({ name: 'ref', label: 'Reference / claim number' })}
      ${fld({ name: 'file', label: 'Copy of the form or letter sent', type: 'file', full: true })}
    </div>`,
    buttons: [{ label: 'Save', cls: 'primary', onClick: m => {
      if (!validateForm(m)) return false; const v = readForm(m);
      r.submissions.push({ to: v.to, date: v.date, method: v.method, ref: v.ref, file: v.file || null, by: S.ui.user, ts: nowTs() });
      r.status = 'Reported'; if (v.ref) r.ref = v.ref;
      i.history.push({ ts: nowTs(), by: S.ui.user, action: `Reported to ${v.to}`, comment: [fmt(v.date), v.method, v.ref && 'ref ' + v.ref].filter(Boolean).join(' · ') });
      log(`Logged an external report for ${i.id} (${v.to})`, '#/incidents/' + i.id); save(); toast('Report logged.'); rerender();
    } }] });
};
ACT.incReporting = (el) => ACT.repDecide(el);   // older buttons

// Tasks: decisions needed for serious injuries, and reports due
const _myTasksBeforeInc = myTasks;
myTasks = function () {
  const out = _myTasksBeforeInc();
  if (can('incident.investigate')) S.incidents.filter(i => inSite(i, S.ui.site) && (i.investigator === S.ui.user || hseqManagers(i.org).includes(S.ui.user))).forEach(i => {
    const r = rep(i), st = reportingState(i);
    if (st.label === 'Decision needed' && ['Lost Time Injury', 'Fatality'].includes(injClass(i))) out.push({ title: `Decide on external reporting: ${i.id}`, sub: `${injClass(i)} — record whether it must be reported`, link: '#/incidents/' + i.id, sev: 'red' });
    if (r.required === 'Yes' && !r.submissions.length) out.push({ title: `Report ${i.id} externally`, sub: `Due ${fmt(r.due)}`, link: '#/incidents/' + i.id, sev: daysTo(r.due) < 0 ? 'red' : 'amber' });
  });
  return out;
};

/* ---------------- Demo data ---------------- */
MIGRATIONS.push(() => {
  if (S.migr && S.migr.incPlus) return; S.migr = S.migr || {}; S.migr.incPlus = true;
  const a = byId('incidents', 'INC-2026-001');
  if (a && a.investigation && !a.investigation.whys) Object.assign(a.investigation, { problem: a.title, whys: ['A pedestrian walked outside the walkway at the dispatch bay', 'The walkway markings had faded and there was no warning of a reversing forklift', 'Neither the markings nor the warning lights were checked in inspections', 'The inspection checklist had not been reviewed when the dispatch bay layout changed'] });
  const b = byId('incidents', 'INC-2026-004');
  if (b && !b.statements) b.statements = [{ id: 'INC-2026-004-W1', person: 'P-013', name: 'Grace Adams', role: 'Storeperson', contact: 'grace.a@kestrel.demo', statement: 'I was picking in aisle B. I heard a bang and saw FL-07 stopped against the upright at the end of aisle C with the forks raised about two metres. The driver got off straight away and called the supervisor. Nobody was in the aisle.', sig: null, ts: T_(-48, 16, 5), takenBy: 'P-016' }];
  const c = byId('incidents', 'INC-2026-005');
  if (c) { const r = rep(c); if (!r.decision) { Object.assign(r, { required: 'Yes', due: addDays(c.date, 7), decision: { by: 'P-006', on: addDays(c.date, 1), reason: 'Lost time injury: competent person assessed it as reportable (demo).' }, status: 'Reported' }); r.submissions = [{ to: REPORT_TO[1], date: addDays(c.date, 3), method: 'Online submission', ref: 'Demo-ref', file: null, by: 'P-003', ts: T_(-72, 10, 0) }]; } }
});

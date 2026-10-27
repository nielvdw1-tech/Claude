// End-to-end workflow tests for the VDW HSEQ prototype (drives the real UI in a headless browser).
// Usage (developers only):  npm install playwright  &&  node tests/workflows.test.js
const { chromium } = require('playwright');
const path = require('path'); const os = require('os');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const results = []; const errs = [];
const ok = (name, cond, info = '') => { results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${info ? ' — ' + info : ''}`); };

(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1400, height: 950 }, acceptDownloads: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.goto(URL); await p.waitForTimeout(300);

  const go = async (h) => { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(120); };
  const S = (fn) => p.evaluate(fn);
  const act = async (sel) => { await p.click(sel); await p.waitForTimeout(120); };
  const btn = async (text) => { await p.click(`.sh-actions button:has-text("${text}"), .page-head button:has-text("${text}"), .alert button:has-text("${text}")`); await p.waitForTimeout(150); };
  const mbtn = async (text) => { await p.click(`.modal-foot button:has-text("${text}")`); await p.waitForTimeout(150); };
  const mfill = async (name, val) => { await p.fill(`.modal [name="${name}"]`, val); };
  const msel = async (name, val) => { await p.selectOption(`.modal [name="${name}"]`, val); };
  const mfile = async (sel = '.modal input[type=file]', name = 'evidence.pdf') => { await p.setInputFiles(sel, { name, mimeType: 'application/pdf', buffer: Buffer.from('demo evidence') }); };
  const asUser = async (id) => { await act('[data-act=userMenu]'); await act(`.dropdown [data-act=switchUser][data-id="${id}"]`); };
  const modalOpen = async () => (await p.$('.modal')) !== null;
  // Drive an action from its current state to Submitted for Verification as the owner
  const ownerCompletes = async (aid) => {
    await go('#/actions/' + aid);
    const owner = await S(`S.actions.find(a=>a.id==='${aid}').owner`);
    await asUser(owner); await go('#/actions/' + aid);
    if (await p.$('.sh-actions button:has-text("Acknowledge")')) await btn('Acknowledge');
    if (await p.$('.sh-actions button:has-text("Start work")')) await btn('Start work');
    await btn('Add progress note'); await mfill('note', 'Work underway'); await mbtn('Add note');
    await btn('Upload evidence'); await mfile('#f_ev', 'completion_photo.jpg'); await mbtn('Upload');
    await btn('Submit for verification'); await mfill('comment', 'Completed — see evidence.'); await mbtn('Submit for verification');
    return S(`S.actions.find(a=>a.id==='${aid}').status`);
  };
  const verify = async (aid, verifier, accept = true, extra) => {
    await asUser(verifier); await go('#/actions/' + aid); await btn('Review evidence & verify');
    await msel('decision', accept ? 'Verified' : 'Rejected'); await mfill('comment', accept ? 'Evidence reviewed and accepted.' : 'Insufficient evidence.');
    if (extra) await extra(); await mbtn('Record decision');
    return S(`S.actions.find(a=>a.id==='${aid}').status`);
  };

  /* ---------------- Workflow A — compliance gap ---------------- */
  {
    await asUser('P-002');
    const before = await S(`compliance('ALL').parts.legal`);
    await go('#/legal/LR-013'); await btn('Assess requirement');
    await msel('status', 'Non-Compliant'); await mfill('note', 'No CoC on file for leased premises.'); await mfill('gaps', 'Certificate of compliance not obtained from landlord.');
    await mfill('aAction', 'Obtain electrical CoC from landlord / registered person and file it.'); await msel('aOwner', 'P-003'); await msel('aPriority', 'High');
    await mbtn('Save assessment');
    const st = await S(`S.legal.find(l=>l.id==='LR-013').status`);
    const aid = await S(`S.actions.filter(a=>a.source==='Legal'&&a.sourceId==='LR-013').pop().id`);
    ok('A1 assess requirement → Non-Compliant + action generated', st === 'Non-Compliant' && !!aid, aid);
    ok('A2 action assigned to owner', (await S(`S.actions.find(a=>a.id==='${aid}').status`)) === 'Assigned' && (await S(`S.actions.find(a=>a.id==='${aid}').owner`)) === 'P-003');
    const mid = await S(`compliance('ALL').parts.legal`);
    const sub = await ownerCompletes(aid);
    ok('A3 owner acknowledges, works, uploads evidence, submits', sub === 'Submitted for Verification');
    ok('A4 legal status → Awaiting Verification', (await S(`S.legal.find(l=>l.id==='LR-013').status`)) === 'Awaiting Verification');
    // Rejection path first
    const rej = await verify(aid, 'P-002', false);
    ok('A5 verifier can return evidence (Rejected) and legal status reverts', rej === 'Rejected' && (await S(`S.legal.find(l=>l.id==='LR-013').status`)) === 'Non-Compliant');
    await ownerCompletes(aid);
    const v = await verify(aid, 'P-002', true);
    ok('A6 verifier accepts evidence → Verified', v === 'Verified');
    ok('A7 legal requirement updated to Compliant with next review', (await S(`S.legal.find(l=>l.id==='LR-013').status`)) === 'Compliant' && !!(await S(`S.legal.find(l=>l.id==='LR-013').nextReview`)));
    await go('#/actions/' + aid); await btn('Close action');
    ok('A8 action closed separately after verification', (await S(`S.actions.find(a=>a.id==='${aid}').status`)) === 'Closed');
    const after = await S(`compliance('ALL').parts.legal`);
    await go('#/dashboard'); const dashTxt = await p.innerText('#content');
    ok('A9 dashboard legal score reflects change', after > mid && dashTxt.includes(after + '%'), `legal ${before}% → gap ${mid}% → after ${after}%`);
  }

  /* ---------------- Workflow B — document approval ---------------- */
  {
    await asUser('P-002'); await go('#/documents'); await btn('New / upload document');
    await msel('category', 'Procedure'); await mfill('title', 'Working at Height Procedure'); await mfile('.modal [name=file]', 'WAH_procedure_draft.docx');
    await mbtn('Create document');
    const did = await S(`S.documents[S.documents.length-1].id`);
    ok('B1 create procedure with selected file (Draft)', (await S(`docStatus(S.documents.find(d=>d.id==='${did}'))`)) === 'Draft', did);
    await btn('Submit for review'); await mbtn('Submit for review');
    ok('B2 submitted for review', (await S(`docStatus(byId('documents','${did}'))`)) === 'Submitted for Review');
    await btn('Start review'); await btn('Return for correction'); await mfill('comment', 'Add rescue plan section.'); await mbtn('Return for correction');
    ok('B3 returned for correction with comment', (await S(`docStatus(byId('documents','${did}'))`)) === 'Returned for Correction');
    await btn('Revise & resubmit'); await mfile('.modal [name=file]', 'WAH_procedure_v2.docx'); await mfill('notes', 'Rescue plan added.'); await mbtn('Resubmit for review');
    ok('B4 revised and resubmitted (new draft iteration, old retained)', (await S(`byId('documents','${did}').revisions.length`)) === 2 && (await S(`byId('documents','${did}').revisions[0].status`)) === 'Superseded draft');
    await btn('Start review'); await btn('Approve'); await mfill('comment', 'OK'); await mbtn('Approve');
    ok('B5 approved', (await S(`docStatus(byId('documents','${did}'))`)) === 'Approved');
    await btn('Issue for use'); await mbtn('Issue for use');
    ok('B6 issued for use with next review date', (await S(`docStatus(byId('documents','${did}'))`)) === 'Issued for Use' && !!(await S(`byId('documents','${did}').nextReview`)));
    await btn('Start new revision'); await mfile('.modal [name=file]', 'WAH_rev2.docx'); await mfill('notes', 'Annual update'); await mbtn('Create draft revision');
    const txt = await p.innerText('#content');
    ok('B7 current revision stays issued while new revision drafted; history visible', txt.includes('Current issued: Rev 1') && txt.includes('Rev 2 (draft 1)') && txt.includes('Superseded draft'));
  }

  /* ---------------- Workflow C — risk assessment ---------------- */
  {
    await asUser('P-002'); await go('#/risks'); await btn('New risk assessment');
    await mfill('activity', 'Loading trucks at dispatch'); await mfill('hazard', 'Truck drive-away during loading'); await mfill('consequence', 'Crush injury');
    await msel('L1', '4'); await msel('S1', '5'); await mfill('ctrl', 'Install dock interlock / wheel chocks procedure');
    await mbtn('Save as draft');
    const rid = await S(`S.risks[S.risks.length-1].id`); const aid = await S(`S.risks[S.risks.length-1].controls[0].action`);
    ok('C1 risk created with missing control → action generated', !!aid, `${rid} / ${aid}`);
    await ownerCompletes(aid);
    const v = await verify(aid, 'P-006');
    ok('C2 action completed and verified by independent verifier', v === 'Verified');
    ok('C3 control marked Implemented and review flagged', (await S(`byId('risks','${rid}').controls[0].status`)) === 'Implemented' && (await S(`byId('risks','${rid}').needsReview`)) === true);
    await asUser('P-002'); await go('#/risks/' + rid); await btn('Review assessment'); await msel('L2', '1'); await msel('S2', '5'); await mfill('note', 'Interlock fitted.'); await mbtn('Save review');
    ok('C4 assessment reviewed: residual updated, review date set, approved', (await S(`byId('risks','${rid}').L2`)) === 1 && (await S(`byId('risks','${rid}').approval`)) === 'Approved' && (await S(`byId('risks','${rid}').needsReview`)) === false);
  }

  /* ---------------- Workflow D — asset inspection ---------------- */
  {
    await asUser('P-007'); await go('#/assets/AS-002?tab=documents');
    const docsTxt = await p.innerText('#content');
    ok('D1 asset required documents shown by type', docsTxt.includes('Lifting machine examination & load test certificate'));
    await go('#/inspect/ISCH-02');
    const qs = await S(`tplCurrent(byId('templates','TPL-FL')).questions.map(q=>q.id)`);
    for (const q of qs) await p.click(`[data-act=qAns][data-q="${q}"][data-v="${q === 'q1' ? 'Fail' : 'Pass'}"]`);
    await p.fill('#c-q1', 'Parking brake does not hold on ramp.');
    const oosChecked = await p.isChecked('[data-qf="q1"][data-k="oos"]');
    await p.check('[name=declare]'); await p.click('[data-act=inspSubmit]'); await p.waitForTimeout(200);
    const ins = await S(`S.inspections[S.inspections.length-1]`);
    ok('D2 inspection submitted on current template revision', ins.template.rev === 3 && ins.results.find(r => r.qid === 'q1').result === 'Fail', ins.id);
    ok('D3 failed critical item → action + defect, asset OUT OF SERVICE', oosChecked && ins.actions.length === 1 && (await S(`byId('assets','AS-002').status`)) === 'Out of Service');
    ok('D4 schedule next due advanced', (await S(`byId('schedules','ISCH-02').nextDue`)) === (await S(`addDays(TODAY,30)`)));
    await asUser('P-002'); await go('#/assets/AS-002'); await btn('Return to service');
    const blocked = (await p.innerText('.modal')).includes('must be completed');
    ok('D5 return to service blocked while corrective action unverified', blocked); await p.keyboard.press('Escape');
    const aid = ins.actions[0];
    await ownerCompletes(aid);
    const v = await verify(aid, 'P-002', true, async () => { await p.check('.modal [name=rts]'); });
    ok('D6 verified with return-to-service authorisation', v === 'Verified' && (await S(`byId('assets','AS-002').status`)) === 'In Service');
    await go('#/assets/AS-002?tab=history'); const h = await p.innerText('#content');
    ok('D7 asset history shows inspection, out-of-service, defect closure and return', h.includes('OUT OF SERVICE') && h.includes('Returned to service') && h.includes(ins.id));
    await go('#/print/' + ins.id); const pr = await p.innerText('#content');
    ok('D8 controlled report has header from template', pr.includes('KIE-FRM-031') && pr.includes('Revision no: 3'));
  }

  /* ---------------- Workflow E — incident investigation ---------------- */
  {
    await asUser('P-009'); await go('#/incidents/new');
    await p.selectOption('#incForm [name=type]', 'Injury'); await p.fill('#incForm [name=title]', 'Foot struck by pallet jack'); await p.fill('#incForm [name=location]', 'Aisle 3');
    await p.fill('#incForm [name=description]', 'Pallet jack rolled over right foot.'); await p.fill('#incForm [name=immediate]', 'First aid; ice pack.'); await p.fill('#incForm [name=nature]', 'Bruising');
    await p.setInputFiles('#incForm [name=photos]', { name: 'scene.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('x') });
    await p.click('[data-act=incSubmit]'); await p.waitForTimeout(200);
    const iid = await S(`S.incidents[S.incidents.length-1].id`);
    ok('E1 incident reported', (await S(`byId('incidents','${iid}').status`)) === 'Reported', iid);
    await asUser('P-002'); await go('#/incidents/' + iid); await btn('Assign investigator'); await msel('inv', 'P-002'); await mbtn('Assign & start investigation');
    await btn('Record investigation'); await mfill('findings', 'Jack left on slope.'); await mfill('immediate', 'Jack rolled'); await mfill('underlying', 'No parking brake used'); await mfill('root', 'Pallet jacks not included in pre-use checks'); await p.check('.modal [name="cat_Procedure"]'); await p.check('.modal [name=complete]'); await mbtn('Save investigation');
    await p.waitForTimeout(200);
    ok('E2 investigation with root cause recorded; action modal prompted', (await S(`!!byId('incidents','${iid}').investigation.completed`)) && await modalOpen());
    await mfill('action', 'Add pallet jacks to pre-use checklist and brief staff.'); await msel('owner', 'P-007'); await mbtn('Raise action');
    const aid = await S(`S.actions.filter(a=>a.source==='Incident'&&a.sourceId==='${iid}').pop().id`);
    ok('E3 action generated from incident', !!aid && (await S(`byId('incidents','${iid}').status`)) === 'Actions in Progress', aid);
    await ownerCompletes(aid); await verify(aid, 'P-002');
    ok('E4 action verified → incident awaiting closure', (await S(`byId('incidents','${iid}').status`)) === 'Awaiting Closure');
    await go('#/incidents/' + iid); await btn('Review & close'); await mfill('comment', 'Effective.'); await mbtn('Close incident');
    ok('E5 incident closed', (await S(`byId('incidents','${iid}').status`)) === 'Closed');
    await go('#/reports/incidents'); ok('E6 incident appears in management reporting', (await p.innerText('#content')).includes(iid));
  }

  /* ---------------- Workflow F — branch comparison ---------------- */
  {
    await go('#/dashboard'); await p.selectOption('#siteSel', 'S-DBN'); await p.waitForTimeout(200);
    const t1 = await p.innerText('#content');
    await go('#/actions'); const aD = await p.innerText('#lvn-acts');
    await p.selectOption('#siteSel', 'S-CPT'); await p.waitForTimeout(200); const aC = await p.innerText('#lvn-acts');
    await go('#/dashboard'); const t2 = await p.innerText('#content');
    ok('F1 branch selection scopes dashboard and lists', t1.includes('Kestrel Industrial — Pinetown') && t2.includes('Kestrel Industrial — Montague Gardens') && aD !== aC, `DBN ${aD} | CPT ${aC}`);
    await go('#/reports/branches'); const rb = await p.innerText('#content');
    ok('F2 branch comparison report lists all branches', ['Germiston', 'Pinetown', 'Montague Gardens'].every(x => rb.includes(x)));
    await go('#/dashboard'); await p.click('[data-act=focusSite][data-site=ALL]'); await p.waitForTimeout(200);
    ok('F3 return to organisation-wide view', (await S(`S.ui.site`)) === 'ALL');
  }

  /* ---------------- Workflow G — maintained compliance ---------------- */
  {
    await asUser('P-007'); await go('#/notifications/tasks');
    const tasks = await p.innerText('#content');
    ok('G1 overdue inspection appears in task centre', tasks.includes('Inspect: Germiston warehouse & workshop'));
    await p.click('a[href="#/inspect/ISCH-05"]'); await p.waitForTimeout(200);
    const qs = await S(`tplCurrent(byId('templates','TPL-WS')).questions.map(q=>q.id)`);
    for (const q of qs) await p.click(`[data-act=qAns][data-q="${q}"][data-v="${q === 'q3' ? 'Fail' : q === 'q7' ? 'N/A' : 'Pass'}"]`);
    await p.fill('#c-q3', 'Housekeeping poor at returns bay.'); await p.setInputFiles('#ph-q3', { name: 'returns_bay.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('x') });
    await p.check('[name=declare]'); await p.click('[data-act=inspSubmit]'); await p.waitForTimeout(200);
    const ins = await S(`S.inspections[S.inspections.length-1]`);
    ok('G2 activity completed with evidence; gap → action', ins.actions.length === 1 && !!ins.results.find(r => r.qid === 'q3').photo);
    ok('G3 next inspection scheduled', (await S(`byId('schedules','ISCH-05').nextDue`)) === (await S(`addDays(TODAY,30)`)));
    ok('G4 overdue notification cleared, new action visible system-wide', !(await S(`buildNotifs().some(n=>n.key.startsWith('ins-od-ISCH-05'))`)) && (await S(`buildNotifs().some(n=>n.link==='#/actions/${ins.actions[0]}') || S.actions.some(a=>a.id==='${ins.actions[0]}')`)));
    // Legal review due → reassess and schedule next
    await asUser('P-002'); await go('#/legal/LR-007'); await btn('Assess requirement'); await msel('status', 'Compliant'); await mfill('note', 'Procedure reviewed; register complete.'); await mbtn('Save assessment');
    ok('G5 overdue legal review completed and next review scheduled', (await S(`daysTo(byId('legal','LR-007').nextReview)`)) > 300);
    // SDS overdue review → notification → review
    ok('G6 overdue SDS raises notification', await S(`buildNotifs().some(n=>n.key.startsWith('sds-od-CH-001'))`));
    await go('#/chemicals/CH-001'); await btn('Review / update SDS'); await mfile('.modal [name=file]', 'Solvex300_SDS_2026.pdf'); await mfill('note', 'Hazards unchanged.'); await mbtn('Save SDS review');
    ok('G7 SDS reviewed → new revision in Document Control, notification cleared', (await S(`docIssued(byId('documents','DOC-018')).rev`)) === 2 && !(await S(`buildNotifs().some(n=>n.key.startsWith('sds-od-CH-001'))`)));
  }

  /* ---------------- Other checks ---------------- */
  {
    // Validation
    await go('#/legal'); await btn('Add requirement'); await mbtn('Add requirement');
    ok('V1 form validation blocks empty required fields', await modalOpen() && (await p.$$('.modal .field.invalid')).length > 0); await p.keyboard.press('Escape');
    // Permissions: employee cannot approve docs / see medical
    await asUser('P-009'); await go('#/documents/DOC-005');
    ok('V2 role permissions disable approval for Employee', await p.isDisabled('.sh-actions button:has-text("Approve")'));
    await go('#/people/medical'); ok('V3 medical records restricted for Employee', (await p.innerText('#content')).includes('Restricted information'));
    await asUser('P-002'); await go('#/people/medical'); ok('V4 medical records visible to HSEQ Manager', (await p.innerText('#content')).includes('Fit with restrictions'));
    // Persistence across reload
    await p.reload(); await p.waitForTimeout(300); ok('V5 data persists in localStorage after reload', (await S(`byId('assets','AS-002').status`)) === 'In Service' && (await S(`S.documents.length`)) >= 30);
    // CSV export
    await go('#/reports/overdue'); const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=repCsv]')]); ok('V6 CSV export downloads', /\.csv$/.test(dl.suggestedFilename()), dl.suggestedFilename());
    // Search
    await p.fill('#globalSearch', 'FL-07'); await p.waitForTimeout(150); ok('V7 global search finds records', (await p.innerText('#searchResults')).includes('FL-07'));
    // Reset
    await act('[data-act=userMenu]'); await act('.dropdown [data-act=resetDemo]'); await mbtn('Reset demo data');
    ok('V8 reset demo data restores seed', (await S(`S.documents.length`)) === 29 && (await S(`byId('assets','AS-002').status`)) === 'In Service');
  }

  /* ---------------- Print output ---------------- */
  {
    await go('#/print/INS-1087'); await p.emulateMedia({ media: 'print' });
    await p.pdf({ path: path.join(os.tmpdir(), 'vdw_inspection_report.pdf'), format: 'A4', printBackground: true });
    await p.emulateMedia({ media: 'screen' });
  }
  console.log(results.join('\n'));
  console.log(errs.length ? '\nJS ERRORS:\n' + errs.join('\n') : '\nNo JavaScript errors.');
  console.log(`\nPrint preview PDF written to ${path.join(os.tmpdir(), 'vdw_inspection_report.pdf')}`);
  console.log(`\n${results.filter(r => r.startsWith('PASS')).length}/${results.length} checks passed`);
  if (errs.length || results.some(r => r.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})().catch(e => { console.log(results.join('\n')); console.error('TEST CRASH', e); process.exit(1); });

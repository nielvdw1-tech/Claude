// End-to-end workflow tests for the VDW prototype (drives the real UI in a headless browser).
// Scope: Document Control with sequential approvals · Assets & Inspections with corrective actions · Incident Management.
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
  const has = async (sel) => (await p.$(sel)) !== null;
  const ownerCompletes = async (aid) => {
    await go('#/actions/' + aid);
    const owner = await S(`S.actions.find(a=>a.id==='${aid}').owner`);
    await asUser(owner); await go('#/actions/' + aid);
    if (await has('.sh-actions button:has-text("Acknowledge")')) await btn('Acknowledge');
    if (await has('.sh-actions button:has-text("Start work")')) await btn('Start work');
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
  const docSt = (id) => S(`docStatus(byId('documents','${id}'))`);
  const curApprover = (id) => S(`(curStep(docLatest(byId('documents','${id}'))) || {}).person || null`);

  /* ---------------- A. Document upload and sequential multi-person approval ---------------- */
  {
    await asUser('P-003'); await go('#/documents'); await btn('Upload document');
    await msel('category', 'Safe Work Procedure'); await p.waitForTimeout(80);
    await mfill('title', 'Working at Height Safe Work Procedure'); await mfile('.modal [name=file]', 'WAH_SWP_draft.docx');
    const route = await p.$$eval('#routeEd select', s => s.map(x => x.value));
    ok('A1 category default route loaded in order (operational review → HSEQ → final)', route.join(',') === 'P-005,P-002,P-001', route.join(' → '));
    await mbtn('Save document');
    const did = await S(`S.documents[S.documents.length-1].id`);
    ok('A2 uploaded and submitted — step 1 approver is current', (await docSt(did)) === 'In Approval' && (await curApprover(did)) === 'P-005', did);
    ok('A3 approver at step 1 notified (task in their task list)', await S(`(() => { S.ui.user='P-005'; const t = myTasks().some(x => x.link === '#/documents/${did}'); S.ui.user='P-003'; return t; })()`));
    await go('#/documents/' + did);
    ok('A4 author cannot approve — only the current approver sees the decision buttons', !(await has('.sh-actions button:has-text("Approve step")')) && await has('.sh-actions button:has-text("Act as current approver")'));
    await btn('Act as current approver'); await go('#/documents/' + did); await btn('Approve step 1'); await mbtn('Approve');
    ok('A5 step 1 approved → passes to step 2 (HSEQ)', (await curApprover(did)) === 'P-002' && (await docSt(did)) === 'In Approval');
    await btn('Act as current approver'); await go('#/documents/' + did); await btn('Return for correction'); await mfill('comment', 'Add rescue plan section.'); await mbtn('Return for correction');
    ok('A6 step 2 returns for correction with comment; remaining step cancelled', (await docSt(did)) === 'Returned for Correction' && (await S(`docLatest(byId('documents','${did}')).route[2].status`)) === 'Cancelled');
    await asUser('P-003'); await go('#/documents/' + did); await btn('Revise & resubmit'); await mfile('.modal [name=file]', 'WAH_SWP_v2.docx'); await mfill('notes', 'Rescue plan added.'); await mbtn('Resubmit for approval');
    ok('A7 resubmitted as new draft; route restarts at step 1; returned draft retained', (await curApprover(did)) === 'P-005' && (await S(`byId('documents','${did}').revisions.length`)) === 2 && (await S(`byId('documents','${did}').revisions[0].status`)) === 'Superseded draft');
    for (const who of ['P-005', 'P-002', 'P-001']) { await asUser(who); await go('#/documents/' + did); await btn('Approve step'); await mfill('comment', 'OK'); await mbtn('Approve'); }
    ok('A8 all three approvers signed off in sequence → Approved', (await docSt(did)) === 'Approved' && (await S(`docLatest(byId('documents','${did}')).route.every(s => s.status === 'Approved')`)));
    await asUser('P-002'); await go('#/documents/' + did); await btn('Issue for use'); await mbtn('Issue for use');
    ok('A9 issued for use with next review date', (await docSt(did)) === 'Issued for Use' && !!(await S(`byId('documents','${did}').nextReview`)));
    const trail = await p.innerText('#content');
    ok('A10 approval trail records every decision with names', ['Approved — step 1', 'Returned for correction — step 2', 'Approved — step 3', 'Issued for use'].every(t => trail.includes(t)));
    await btn('Start new revision'); await mfile('.modal [name=file]', 'WAH_rev2.docx'); await mfill('notes', 'Annual update'); await mbtn('Create draft revision');
    const t2 = await p.innerText('#content');
    ok('A11 new revision drafted while Rev 1 stays current; history retained', t2.includes('Current issued: Rev 1') && t2.includes('Rev 2 (draft 1)') && t2.includes('Superseded draft'));
    // Author cannot be placed on own route
    await go('#/documents'); await btn('Upload document'); await mfill('title', 'Self-approval test'); await mfile('.modal [name=file]', 'x.pdf');
    const me = await S('S.ui.user'); const offered = await p.$$eval('#routeEd select >> nth=0', s => [...s[0].options].map(o => o.value));
    await p.selectOption('#routeEd select >> nth=0', { index: 0 }); await mbtn('Save document');
    ok('A12 author is never offered as an approver; a step without an approver blocks submission', !offered.includes(me) && await modalOpen()); await p.keyboard.press('Escape');
    // Admin changes a category route → used for new submissions
    await asUser('P-002'); await go('#/admin/approvals'); await p.click('[data-act=routeEdit][data-cat="Policy"]'); await p.waitForTimeout(100);
    await p.click('#routeEd [data-re=add]'); await p.selectOption('#routeEd select >> nth=2', 'P-006'); await p.fill('#routeEd input >> nth=2', 'Consultant check'); await mbtn('Save route');
    ok('A13 administrator edits a category approval route', (await S(`S.config.approvalRoutes['Policy'].map(s=>s.person).join(',')`)) === 'P-002,P-001,P-006');
  }

  /* ---------------- B. Seeded approval in progress ---------------- */
  {
    await asUser('P-002'); await go('#/documents?status=mine');
    const n = await p.innerText('#lvn-docs');
    ok('B1 "Awaiting my approval" filter lists documents where it is my turn', /^1 of/.test(n) && (await p.innerText('#lvb-docs')).includes('KIE-SWP-022'), n);
    await go('#/documents/DOC-005'); await btn('Approve step 2'); await mbtn('Approve');
    ok('B2 seeded SWP-022 moves from HSEQ (step 2) to MD (step 3)', (await curApprover('DOC-005')) === 'P-001');
  }

  /* ---------------- C. Asset inspection → defect → corrective action → verification ---------------- */
  {
    await asUser('P-007'); await go('#/assets/AS-002?tab=documents');
    ok('C1 asset shows type-specific required documents', (await p.innerText('#content')).includes('Lifting machine examination & load test certificate'));
    await go('#/inspect/ISCH-02');
    const qs = await S(`tplCurrent(byId('templates','TPL-FL')).questions.map(q=>q.id)`);
    for (const q of qs) await p.click(`[data-act=qAns][data-q="${q}"][data-v="${q === 'q1' ? 'Fail' : 'Pass'}"]`);
    await p.fill('#c-q1', 'Parking brake does not hold on ramp.');
    const oosChecked = await p.isChecked('[data-qf="q1"][data-k="oos"]');
    await p.check('[name=declare]'); await p.click('[data-act=inspSubmit]'); await p.waitForTimeout(200);
    const ins = await S(`S.inspections[S.inspections.length-1]`);
    ok('C2 inspection submitted on the current controlled template revision', ins.template.rev === 3 && ins.results.find(r => r.qid === 'q1').result === 'Fail', ins.id);
    ok('C3 failed critical item → defect + corrective action; asset OUT OF SERVICE', oosChecked && ins.actions.length === 1 && ins.defects.length === 1 && (await S(`byId('assets','AS-002').status`)) === 'Out of Service');
    ok('C4 next inspection scheduled automatically', (await S(`byId('schedules','ISCH-02').nextDue`)) === (await S(`addDays(TODAY,30)`)));
    await asUser('P-002'); await go('#/assets/AS-002'); await btn('Return to service');
    ok('C5 return to service blocked while action unverified', (await p.innerText('.modal')).includes('must be completed')); await p.keyboard.press('Escape');
    const aid = ins.actions[0];
    ok('C6 owner works the action and submits evidence', (await ownerCompletes(aid)) === 'Submitted for Verification' && (await S(`S.defects.find(d=>d.action==='${aid}').status`)) === 'Repaired – awaiting verification');
    ok('C7 verifier returns insufficient evidence (Rejected) — not closed', (await verify(aid, 'P-002', false)) === 'Rejected' && (await S(`byId('assets','AS-002').status`)) === 'Out of Service');
    await ownerCompletes(aid);
    const v = await verify(aid, 'P-002', true, async () => { await p.check('.modal [name=rts]'); });
    ok('C8 verified with return-to-service authorisation', v === 'Verified' && (await S(`byId('assets','AS-002').status`)) === 'In Service' && (await S(`S.defects.find(d=>d.action==='${aid}').status`)) === 'Closed');
    await go('#/actions/' + aid); await btn('Close action');
    ok('C9 action closed only after verification', (await S(`byId('actions','${aid}').status`)) === 'Closed');
    await go('#/assets/AS-002?tab=history'); const h = await p.innerText('#content');
    ok('C10 asset history: inspection, out of service, defect closed, returned to service', h.includes('OUT OF SERVICE') && h.includes('Returned to service') && h.includes(ins.id));
    await go('#/print/' + ins.id); const pr = await p.innerText('#content');
    ok('C11 printable report carries controlled template header', pr.includes('KIE-FRM-031') && pr.includes('Revision no: 3'));
    // Report a defect directly (e.g. from QR page)
    await asUser('P-016'); await go('#/qr/AS-012'); await act('.big-actions button:has-text("Report defect")');
    await mfill('description', 'Guard cracked on grinder'); await msel('severity', 'Critical'); await mbtn('Report defect');
    ok('C12 defect reported from QR page: critical → out of service + action', (await S(`byId('assets','AS-012').status`)) === 'Out of Service' && (await S(`S.actions.some(a => a.source==='Asset Defect' && S.defects.find(d=>d.id===a.sourceId && d.asset==='AS-012'))`)));
  }

  /* ---------------- D. Incident management ---------------- */
  {
    await asUser('P-009'); await go('#/report');
    await p.selectOption('#incForm [name=type]', 'Injury'); await p.fill('#incForm [name=title]', 'Foot struck by pallet jack'); await p.fill('#incForm [name=location]', 'Aisle 3');
    await p.fill('#incForm [name=description]', 'Pallet jack rolled over right foot.'); await p.fill('#incForm [name=immediate]', 'First aid; ice pack.'); await p.fill('#incForm [name=nature]', 'Bruising');
    await p.setInputFiles('#incForm [name=photos]', { name: 'scene.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('x') });
    await p.click('[data-act=incSubmit]'); await p.waitForTimeout(200);
    const iid = await S(`S.incidents[S.incidents.length-1].id`);
    ok('D1 incident reported by employee', (await S(`byId('incidents','${iid}').status`)) === 'Reported', iid);
    await asUser('P-002'); await go('#/notifications/tasks');
    ok('D2 investigator assignment appears in HSEQ manager task list', (await p.innerText('#content')).includes('Assign investigator: ' + iid));
    await go('#/incidents/' + iid); await btn('Assign investigator'); await msel('inv', 'P-002'); await mbtn('Assign & start investigation');
    await btn('Record investigation'); await mfill('findings', 'Jack left on slope.'); await mfill('immediate', 'Jack rolled'); await mfill('underlying', 'No parking brake used'); await mfill('root', 'Pallet jacks not included in pre-use checks'); await p.check('.modal [name="cat_Procedure"]'); await p.check('.modal [name=complete]'); await mbtn('Save investigation');
    await p.waitForTimeout(200);
    ok('D3 investigation and root cause recorded; corrective action prompted', (await S(`!!byId('incidents','${iid}').investigation.completed`)) && await modalOpen());
    await mfill('action', 'Add pallet jacks to pre-use checklist and brief staff.'); await msel('owner', 'P-007'); await mbtn('Raise action');
    const aid = await S(`S.actions.filter(a=>a.source==='Incident'&&a.sourceId==='${iid}').pop().id`);
    ok('D4 action raised from incident', !!aid && (await S(`byId('incidents','${iid}').status`)) === 'Actions in Progress', aid);
    await go('#/incidents/' + iid); await btn('Review & close');
    ok('D5 incident cannot close while actions are open', (await S(`byId('incidents','${iid}').status`)) !== 'Closed');
    await ownerCompletes(aid); await verify(aid, 'P-002');
    ok('D6 action verified → incident awaiting closure', (await S(`byId('incidents','${iid}').status`)) === 'Awaiting Closure');
    // Injury classification (J): the reporter only described the injury; the HSEQ team classifies it.
    ok('J1 the reporter does not classify the injury', !(await S(`byId('incidents','${iid}').injury.classification`)) && (await S(`byId('incidents','${iid}').injury.nature`)) === 'Bruising');
    await go('#/notifications/tasks');
    ok('J2 an unclassified injury appears as a task', (await p.innerText('#content')).includes('Classify injury: ' + iid));
    await go('#/incidents/' + iid); await btn('Review & close');
    ok('J3 the incident cannot close until the injury is classified', (await S(`byId('incidents','${iid}').status`)) === 'Awaiting Closure' && !(await modalOpen()));
    await act('[data-act=injClassify]'); await mfill('daysLost', '2'); await p.waitForTimeout(100);
    const sug = await p.$eval('.modal [name=classification]', e => e.value);
    await mfill('rtw', await S('TODAY')); await mbtn('Save classification');
    ok('J4 the system suggests Lost Time Injury from the facts and it is saved', sug === 'Lost Time Injury' && (await S(`byId('incidents','${iid}').injury.classification`)) === 'Lost Time Injury', sug);
    ok('J5 a lost time injury prompts a check on external reporting', (await p.innerText('#content')).includes('check whether this incident must be reported'));
    await act('[data-act=injClassify]'); await msel('classification', 'Medical Treatment Case'); await mbtn('Save classification');
    const blocked = await modalOpen();
    await mfill('reason', 'Shifts lost were for an unrelated illness, confirmed by the doctor.'); await mbtn('Save classification');
    ok('J6 overriding the suggestion needs a reason; the change is kept in the history', blocked && (await S(`byId('incidents','${iid}').injury.classification`)) === 'Medical Treatment Case' && (await S(`byId('incidents','${iid}').injury.classHistory.length`)) === 2 && (await p.innerText('#content')).includes('Lost Time Injury → Medical Treatment Case'));
    await go('#/incidents/' + iid); await btn('Review & close'); await mfill('comment', 'Effective.'); await mbtn('Close incident');
    ok('D7 incident closed', (await S(`byId('incidents','${iid}').status`)) === 'Closed');
    await go('#/reports/incidents'); ok('D8 incident appears in reporting', (await p.innerText('#content')).includes(iid));
    ok('J7 the incident report counts injuries by final classification', /Lost Time Injury\s*1/.test(await p.innerText('#content')) && (await p.innerText('#content')).includes('Medical Treatment Case'));
    await go('#/admin/injury'); await p.fill('#injForm [name=d3]', 'Our definition: off work for a full shift after the injury day.'); await act('[data-act=saveInjDefs]');
    ok('J8 the company sets its own definitions in Administration', (await S("S.config.injuryClasses[3].desc")).startsWith('Our definition'));
  }

  /* ---------------- E. Branches, tasks, platform checks ---------------- */
  {
    await go('#/dashboard'); await p.selectOption('#siteSel', 'S-DBN'); await p.waitForTimeout(200);
    const t1 = await p.innerText('#content'); await go('#/actions');
    const ids = () => p.$$eval('#lvb-acts .mono', e => e.map(x => x.textContent));
    const aD = await ids();
    await p.selectOption('#siteSel', 'S-CPT'); await p.waitForTimeout(200); const aC = await ids();
    const okD = await S(`${JSON.stringify(aD)}.every(id => byId('actions', id).site === 'S-DBN')`), okC = await S(`${JSON.stringify(aC)}.every(id => byId('actions', id).site === 'S-CPT')`);
    ok('E1 branch selection scopes dashboard and lists', t1.includes('Kestrel Industrial — Pinetown') && aD.length > 0 && aC.length > 0 && okD && okC && aD.join() !== aC.join(), `DBN ${aD.join(', ')} | CPT ${aC.join(', ')}`);
    await go('#/reports/branches'); const rb = await p.innerText('#content');
    ok('E2 branch comparison report lists every branch', ['Germiston', 'Pinetown', 'Montague Gardens'].every(x => rb.includes(x)));
    await p.selectOption('#siteSel', 'ALL'); await p.waitForTimeout(150);
    await asUser('P-007'); await go('#/notifications/tasks');
    ok('E3 overdue inspection appears in the assignee task centre', (await p.innerText('#content')).includes('Inspect: Germiston warehouse & workshop'));
    await go('#/legal'); ok('E4 removed modules are no longer reachable', (await p.innerText('#content')).includes('Page not found'));
    ok('E5 navigation shows only the focused modules', (await p.$$eval('.nav-item span:not(.count)', e => e.map(x => x.textContent))).join('|') === 'Dashboard|Notifications & Tasks|Company Notices|Document Manager|Assets & Equipment|Inspections|Maintenance & Defects|Incident Management|Corrective Actions|Reports|Administration');
    await asUser('P-002'); await go('#/incidents'); await go('#/actions'); await btn('New action'); await mbtn('Continue'); await p.waitForTimeout(100); await mbtn('Raise action');
    ok('E6 form validation blocks empty required fields', await modalOpen() && (await p.$$('.modal .field.invalid')).length > 0); await p.keyboard.press('Escape');
    await asUser('P-009'); await go('#/documents/DOC-007');
    ok('E7 employee sees no approval buttons on a document not routed to them', !(await has('.sh-actions button:has-text("Approve step")')));
    await asUser('P-002'); await p.reload(); await p.waitForTimeout(300);
    ok('E8 data persists in local storage after reload', (await S(`byId('assets','AS-002').status`)) === 'In Service' && (await S(`S.documents.length`)) >= 30);
    await go('#/reports/approvals'); const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=repCsv]')]); ok('E9 CSV export downloads', /\.csv$/.test(dl.suggestedFilename()), dl.suggestedFilename());
    await p.fill('#globalSearch', 'FL-07'); await p.waitForTimeout(150); ok('E10 global search finds records', (await p.innerText('#searchResults')).includes('FL-07'));
    await act('[data-act=userMenu]'); await act('.dropdown [data-act=resetDemo]'); await mbtn('Reset demo data');
    ok('E11 reset demo data restores seed', (await S(`S.documents.length`)) === 29 && (await S(`byId('assets','AS-002').status`)) === 'In Service');
  }

  /* ---------------- F. Viewing documents and files ---------------- */
  {
    // Use a real PDF produced earlier in this run (print of an inspection) — or build one now
    await go('#/print/INS-1087'); await p.emulateMedia({ media: 'print' }); const pdfBuf = await p.pdf({ format: 'A4' }); await p.emulateMedia({ media: 'screen' });
    await asUser('P-003'); await go('#/documents'); await btn('Upload document');
    await mfill('title', 'Viewer test procedure'); await p.setInputFiles('.modal [name=file]', { name: 'viewer_test.pdf', mimeType: 'application/pdf', buffer: pdfBuf });
    await mbtn('Save document'); await p.waitForTimeout(300);
    const did = await S(`S.documents[S.documents.length-1].id`);
    ok('F1 uploaded file content kept in browser storage', !!(await S(`docLatest(byId('documents','${did}')).file.blobId`)));
    await asUser('P-006'); await go('#/documents/' + did);
    await btn('Open document'); await p.waitForSelector('.fv-page canvas', { timeout: 15000 }).catch(() => {});
    const pages = await p.$$eval('.fv-page canvas', c => c.filter(x => x.width > 100 && x.height > 100).length);
    ok('F2 approver opens the PDF inside the system (pages rendered)', pages >= 1, `${pages} page(s)`);
    const inked = await p.$eval('.fv-page canvas', c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4 * 97) if (d[i] < 200) n++; return n; }).catch(() => 0);
    ok('F3 rendered page contains the document content (not blank)', inked > 50, `${inked} dark samples`);
    await p.keyboard.press('Escape');
    await p.reload(); await p.waitForTimeout(400); await go('#/documents/' + did); await btn('Open document'); await p.waitForSelector('.fv-page canvas', { timeout: 15000 }).catch(() => {});
    ok('F4 file still opens after reloading the page', (await p.$$('.fv-page canvas')).length >= 1); await p.keyboard.press('Escape');
    await go('#/documents/DOC-005'); await btn('Open document'); await p.waitForTimeout(200);
    const sheet = await p.innerText('#fvBody');
    ok('F5 demo document opens a sample sheet with its controlled header and approval route', sheet.includes('KIE-SWP-022') && sheet.includes('HSEQ approval') && sheet.includes('Sample sheet'));
    await p.keyboard.press('Escape');
    ok('F6 the revision in use can be opened separately from the draft under approval', await has('.sh-actions button:has-text("Open Rev 1 (in use)")'));
    // Image evidence on a corrective action
    await asUser('P-003'); await go('#/actions/ACT-1014'); await asUser(await S(`byId('actions','ACT-1014').owner`)); await go('#/actions/ACT-1014');
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVR42mNk+M9Qz0AEYBxVSF+FAP5FDvcfRYWgAAAAAElFTkSuQmCC', 'base64');
    await btn('Upload evidence'); await p.setInputFiles('#f_ev', { name: 'repair_photo.png', mimeType: 'image/png', buffer: png }); await mbtn('Upload'); await p.waitForTimeout(250);
    await p.click('button.file-chip:has-text("repair_photo.png")'); await p.waitForSelector('.fv-img img', { timeout: 5000 }).catch(() => {});
    ok('F7 photo evidence opens in the viewer', await has('.fv-img img')); await p.keyboard.press('Escape');
  }

  /* ---------------- G. Printing documents ---------------- */
  {
    await p.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
    // A 2-page PDF: print a long report to PDF first
    await go('#/reports/documents'); await p.emulateMedia({ media: 'print' }); const pdf2 = await p.pdf({ format: 'A4' }); await p.emulateMedia({ media: 'screen' });
    await asUser('P-003'); await go('#/documents'); await btn('Upload document');
    await mfill('title', 'Print test procedure'); await p.setInputFiles('.modal [name=file]', { name: 'print_test.pdf', mimeType: 'application/pdf', buffer: pdf2 });
    await mbtn('Save document'); await p.waitForTimeout(300);
    const did = await S(`S.documents[S.documents.length-1].id`);
    await btn('Print'); await p.waitForFunction(() => window.__printed > 0, null, { timeout: 15000 }).catch(() => {});
    const srcPages = await S(`(async () => (await pdfjsLib.getDocument({ data: new Uint8Array(await (await idbGet(docLatest(byId('documents','${did}')).file.blobId)).arrayBuffer()) }).promise).numPages)()`);
    const printPages = await p.$$eval('#printArea .pa-page canvas', c => c.length);
    ok('G1 Print lays out every page of the PDF for the printer', (await S('window.__printed')) === 1 && printPages === srcPages && srcPages >= 1, `${printPages} of ${srcPages} pages`);
    const stamp = await p.$eval('#printArea .pa-stamp', e => e.textContent);
    ok('G2 draft copies are stamped DRAFT — NOT FOR USE with document number and printer', stamp.includes('DRAFT — NOT FOR USE') && stamp.includes(await S(`byId('documents','${did}').number`)) && stamp.includes('Sipho Ndlovu'));
    await p.emulateMedia({ media: 'print' }); const out = await p.pdf({ format: 'A4' }); await p.emulateMedia({ media: 'screen' });
    const outPages = (out.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    ok('G3 printed output contains only the document pages (no app screens)', outPages === srcPages, `${outPages} printed page(s)`);
    ok('G4 the print is recorded in the document trail', await S(`docLatest(byId('documents','${did}')).history.some(h => /Draft printed/.test(h.action))`));
    await p.evaluate(() => { document.body.classList.remove('printing-file'); });
    await go('#/documents/DOC-001'); await btn('Print'); await p.waitForTimeout(400);
    const st2 = await p.$eval('#printArea .pa-stamp', e => e.textContent);
    ok('G5 issued documents are stamped UNCONTROLLED WHEN PRINTED', st2.includes('UNCONTROLLED WHEN PRINTED') && st2.includes('KIE-POL-001'));
    await p.evaluate(() => { document.body.classList.remove('printing-file'); });
    // Inside a frame (like the online preview) the print dialog is blocked → explanation instead
    const wrap = path.join(os.tmpdir(), 'vdw_frame_test.html'); require('fs').writeFileSync(wrap, `<iframe src="${URL}#/documents/DOC-001" style="width:1300px;height:900px"></iframe>`);
    const fp = await ctx.newPage(); await fp.goto('file://' + wrap); await fp.waitForTimeout(1000);
    const fr = fp.frames().find(f => f.url().includes('index.html'));
    await fr.click('.sh-actions button:has-text("Print")'); await fp.waitForTimeout(200);
    ok('G6 in an embedded preview the user is told where to print from', (await fr.innerText('.modal')).includes('Printing is not available in the online preview')); await fp.close();
  }

  /* ---------------- H. Roles: Safety Consultant full access; Employee field access only ---------------- */
  {
    await p.evaluate(() => { document.body.classList.remove('printing-file'); });
    await asUser('P-006'); await go('#/admin/approvals');
    ok('H1 Safety Consultant can use Administration', !(await p.innerText('#content')).includes('Read-only') && await has('[data-act=routeEdit]'));
    await go('#/documents/DOC-017');
    ok('H2 Safety Consultant can issue approved documents', await has('.sh-actions button:has-text("Issue for use"):not([disabled])'));
    await asUser('P-014'); await p.waitForTimeout(150);
    const nav = await p.$$eval('.nav-item span:not(.count)', e => e.map(x => x.textContent));
    ok('H3 Employee sees only the field screens', nav.join('|') === 'Scan & inspect|Report incident|Notices' && !(await has('#globalSearch')), nav.join(' | '));
    await go('#/documents');
    ok('H4 other pages are closed to employees', (await p.innerText('#content')).includes('not available for your role'));
    await go('#/inspect/ISCH-04');
    ok('H5 an employee cannot start an inspection without scanning the asset QR', (await p.innerText('#content')).includes("Scan the asset's QR code to start"));
    await go('#/field'); await act('.big-actions button:has-text("Scan asset QR code")'); await msel('pick', 'AS-004'); await mbtn('Open asset');
    const qrTxt = await p.innerText('#content');
    ok('H6 employee QR page offers only inspection and incident reporting', qrTxt.includes('Start inspection') && qrTxt.includes('Report incident') && !qrTxt.includes('Report defect') && !qrTxt.includes('Open full asset record'));
    await act('.big-actions button:has-text("Start inspection")');
    const qv = await S(`tplCurrent(byId('templates','TPL-VEH')).questions.map(q=>q.id)`);
    for (const q of qv) await p.click(`[data-act=qAns][data-q="${q}"][data-v="Pass"]`);
    await p.check('[name=declare]'); await p.click('[data-act=inspSubmit]'); await p.waitForTimeout(250);
    const lastIns = await S('S.inspections[S.inspections.length-1]');
    ok('H7 employee completes the inspection after scanning and returns to the QR page', lastIns.inspector === 'P-014' && lastIns.asset === 'AS-004' && (await p.evaluate(() => location.hash)) === '#/qr/AS-004');
    await go('#/field'); await act('.big-actions button:has-text("Report incident")');
    await p.fill('#incForm [name=title]', 'Oil on floor at bay 4'); await p.fill('#incForm [name=location]', 'Bay 4'); await p.fill('#incForm [name=description]', 'Slippery patch.'); await p.fill('#incForm [name=immediate]', 'Cordoned off.');
    await p.click('[data-act=incSubmit]'); await p.waitForTimeout(250);
    ok('H8 employee reports an incident and sees it on their home screen', (await S('S.incidents[S.incidents.length-1].reporter')) === 'P-014' && (await p.innerText('#content')).includes('Oil on floor at bay 4'));
    await asUser('P-002'); await go('#/actions'); await btn('New action'); await mbtn('Continue'); await p.waitForTimeout(100);
    const owners = await p.$$eval('.modal [name=owner] option', o => o.map(x => x.value));
    ok('H9 employees are not offered as corrective action owners', !owners.includes('P-009') && !owners.includes('P-014') && owners.includes('P-007'));
    await p.keyboard.press('Escape');
  }

  /* ---------------- N. Company notices ---------------- */
  {
    await asUser('P-002'); await go('#/notices'); await btn('Publish notice');
    await mfill('title', 'Hearing protection in the workshop'); await mfill('body', 'Hearing protection must be worn in the workshop from today.');
    await msel('audience', 'S-JHB'); await msel('priority', 'Important'); await p.check('.modal [name=ackRequired]');
    await mfile('.modal [name=attachment]', 'Memo_Hearing_Protection.pdf'); await mbtn('Publish notice');
    const nid = await S('S.notices[S.notices.length-1].id');
    ok('N1 manager publishes a notice to one branch with acknowledgement required', (await S(`S.notices.find(n=>n.id==='${nid}').audience`)) === 'S-JHB', nid);
    await asUser('P-014'); await p.waitForTimeout(150);
    const cnt = await p.$eval('.nav-item[href="#/notices"] .count', e => +e.textContent).catch(() => 0);
    const home = await p.innerText('#content');
    ok('N2 employee at that branch sees an unread count and the notice on the home screen', cnt >= 1 && home.includes('Hearing protection in the workshop') && home.includes('Please acknowledge'), `${cnt} unread`);
    await p.click(`a.notice[href="#/notices/${nid}"]`); await p.waitForTimeout(150);
    ok('N3 opening the notice marks it read; attachment can be opened', !!(await S(`S.notices.find(n=>n.id==='${nid}').reads['P-014']`)) && await has('.notice-sheet button.file-chip'));
    await act('[data-act=noticeAck]');
    ok('N4 employee acknowledges "read and understood"', !!(await S(`S.notices.find(n=>n.id==='${nid}').acks['P-014']`)) && (await p.innerText('#content')).includes('You acknowledged this notice'));
    await asUser('P-012'); await go('#/notices');
    ok('N5 employees at other branches do not receive branch notices', !(await p.innerText('#content')).includes('Hearing protection in the workshop'));
    await asUser('P-002'); await go('#/notices/' + nid);
    const track = await p.innerText('#content');
    ok('N6 publisher sees who read and acknowledged the notice', /Tebogo Molefe[\s\S]*\d{1,2} \w{3} \d{4}/.test(track) && track.includes('Outstanding'));
    await asUser('P-007'); await go('#/notifications/tasks');
    ok('N7 notices awaiting acknowledgement appear in a manager or supervisor task list', (await p.innerText('#content')).includes('Acknowledge notice: Hearing protection in the workshop'));
  }

  /* ---------------- S. Incident safety alerts (approval before staff see them) ---------------- */
  {
    const iid = await S("S.incidents.find(i=>i.title==='Oil on floor at bay 4').id");
    const aid = await S(`S.notices.find(n=>n.source&&n.source.id==='${iid}').id`);
    ok('S1 reporting an incident creates a draft safety alert awaiting HSEQ Manager approval', (await S(`S.notices.find(n=>n.id==='${aid}').status`)) === 'Pending approval' && (await S(`S.notices.find(n=>n.id==='${aid}').approvals.map(s=>s.person+':'+s.status).join()`)) === 'P-002:Current,P-006:Pending', aid);
    await asUser('P-014'); await go('#/notices');
    ok('S2 staff cannot see the alert before approval', !(await p.innerText('#content')).includes('Oil on floor at bay 4'));
    await asUser('P-002'); await go('#/notifications/tasks');
    ok('S3 the HSEQ Manager gets an approval task', (await p.innerText('#content')).includes('Approve safety alert: Oil on floor at bay 4'));
    await go('#/notices/' + aid); await btn('Review & approve'); await mfill('body', 'Oil was spilled at bay 4. Report spills immediately.'); await mbtn('Approve');
    ok('S4 after the HSEQ Manager approves it goes to the Safety Consultant, still hidden from staff', (await S(`S.notices.find(n=>n.id==='${aid}').approvals.map(s=>s.status).join()`)) === 'Approved,Current' && (await S(`S.notices.find(n=>n.id==='${aid}').status`)) === 'Pending approval');
    await asUser('P-006'); await go('#/notices/' + aid); await btn('Review & approve'); await mbtn('Approve & publish');
    ok('S5 after the Safety Consultant approves, the edited alert is published', (await S(`S.notices.find(n=>n.id==='${aid}').status`)) === 'Published' && (await S(`S.notices.find(n=>n.id==='${aid}').body`)).startsWith('Oil was spilled'));
    await asUser('P-014'); await p.waitForTimeout(150);
    ok('S6 employees at the branch now see the alert on their home screen', (await p.innerText('#content')).includes('Safety alert: Oil on floor at bay 4'));
    await asUser('P-006'); await go('#/notices/NT-004'); await btn('Do not share'); await mfill('comment', 'Already covered in the toolbox talk.'); await mbtn('Do not share');
    ok('S7 an approver can decide not to share an alert; recorded on the incident', (await S("S.notices.find(n=>n.id==='NT-004').status")) === 'Not shared' && (await S("S.incidents.find(i=>i.id==='INC-2026-007').history.some(h=>h.action.includes('not shared'))")));
    await go('#/incidents/INC-2026-007');
    ok('S8 the incident page shows the alert status', (await p.innerText('#content')).includes('Safety alert to staff'));
  }

  /* ---------------- L. Company logo ---------------- */
  {
    await asUser('P-002'); await go('#/dashboard');
    const brand = await p.innerText('.sidebar');
    ok('L1 menu shows the client company with "Powered by VDW HSEQ"', brand.includes('Kestrel Industrial') && brand.includes('Powered by'));
    await go('#/admin/orgs');
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click('[data-act=orgLogo][data-id="ORG-1"]')]);
    await fc.setFiles({ name: 'kestrel-logo.png', mimeType: 'image/png', buffer: png }); await p.waitForTimeout(400);
    ok('L2 administrator uploads the company logo', (await S("(S.orgs.find(o=>o.id==='ORG-1').logo||'').startsWith('data:image/png')")) && await has('.sidebar .sb-brand .org-logo img'));
    await go('#/documents/DOC-001'); await btn('Open document'); await p.waitForTimeout(300);
    ok('L3 the logo appears in the company block of document headers', await has('.modal .print-logo .org-logo img')); await p.keyboard.press('Escape');
    await go('#/print/INS-1087');
    ok('L4 the logo appears on inspection reports', await has('.print-logo .org-logo img'));
    await go('#/admin/orgs'); await act('[data-act=orgLogoRemove][data-id="ORG-1"]'); await p.click('.modal-foot button:has-text("Remove")'); await p.waitForTimeout(150);
    ok('L5 removing the logo falls back to the company initials', !(await S("S.orgs.find(o=>o.id==='ORG-1').logo")) && (await p.innerText('.sb-brand .org-initials')) === 'KI');
  }

  /* ---------------- Print output ---------------- */
  { await go('#/print/INS-1087'); await p.emulateMedia({ media: 'print' }); await p.pdf({ path: path.join(os.tmpdir(), 'vdw_inspection_report.pdf'), format: 'A4', printBackground: true }); await p.emulateMedia({ media: 'screen' }); }

  console.log(results.join('\n'));
  console.log(errs.length ? '\nJS ERRORS:\n' + errs.join('\n') : '\nNo JavaScript errors.');
  console.log(`\nPrint preview PDF written to ${path.join(os.tmpdir(), 'vdw_inspection_report.pdf')}`);
  console.log(`\n${results.filter(r => r.startsWith('PASS')).length}/${results.length} checks passed`);
  if (errs.length || results.some(r => r.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})().catch(e => { console.log(results.join('\n')); console.error('TEST CRASH', e); process.exit(1); });

# VDW Compliance Control System — Interactive Prototype

A clickable, working prototype focused on the three parts VDW needs most:

1. **Document control with multi-person approval.** Upload documents and send them through a set **sequence of approvers**. Then issue them, control revisions and review them periodically.
2. **Assets and inspections with corrective actions.** Load assets and inspect them against controlled checklists. Failed items become defects and **corrective actions** that run through to independent verification. A critical failure takes the asset **out of service** until the fix is verified.
3. **Incident management.** Report incidents, investigate them and find the root cause. Then raise corrective actions, verify them and close the incident.

> **Prototype only — demonstration data.** The companies (Kestrel Industrial Equipment and Ridgeway Pumps & Valves), people and records are fictional. Data is stored only in your browser. There is no server, no real sign-in, no permanent file storage, no email or SMS, and no real security.

---

## 1. How to open it

1. Open the `prototype` folder.
2. Double-click **`index.html`**. It opens in your browser; Chrome or Edge is recommended.
3. You don't need to install anything, sign in or be online.

To start again, open the user menu (top right) and choose **Reset demo data**.

## 2. Finding your way around

- **Sidebar:** organisation and branch selectors, plus the pages: Dashboard, Notifications & Tasks, Documents & Approvals, Assets & Equipment, Inspections, Maintenance & Defects, Incident Management, Corrective Actions, Reports and Administration.
- **Top bar:** global search (press `/`), **My tasks** (✓ icon), notifications and the user menu.
- **Switch demo user:** use the user menu to act as someone else. Approvals and corrective actions depend on *who* you are, so this is how you see each step. Where a step belongs to someone else, the page offers **Act as current approver** or **Act as owner** to switch in one click.

| Demo user | Role | Typical part in the demos |
|---|---|---|
| Johan van Wyk (default) | HSEQ Manager | Approver, issues documents, verifies actions, investigates incidents |
| Thandi Mokoena | Managing Director | Final approver for policies and safe work procedures |
| Pieter Botha | Operations Manager | Operational reviewer on approval routes |
| Ayesha Khan | VDW Safety Consultant | Technical reviewer; verifier |
| Sipho Ndlovu / Lerato Dlamini | Branch Managers | Document authors; action owners |
| Bongani Zulu / Fatima Patel | Supervisors | Inspections; action owners |
| Nomvula Sithole | Employee | Reports incidents |

## 3. Guided demonstrations

### A. Upload a document and route it through several approvers
1. Switch to **Sipho Ndlovu**. Go to **Documents & Approvals → Upload document**.
2. Choose category **Safe Work Procedure**, enter a title and **select a file**.
3. The **approval route** loads from the category default: *Operational review (Pieter Botha) → HSEQ approval (Johan van Wyk) → Final approval (Thandi Mokoena)*. You can rename, reorder, add or remove steps. The author can never be an approver on their own document.
4. Save. The document is **In Approval at step 1**, and Pieter Botha gets a task.
5. On the document, click **Act as current approver**, then **Approve step 1**. It passes to Johan.
6. As Johan, choose **Return for correction** (a comment is required). The remaining step is cancelled.
7. As Sipho, choose **Revise & resubmit** with a new file. A new draft iteration starts and the route **restarts at step 1**. The returned draft is kept in the history.
8. Approve all three steps in turn. The document is **Approved**. As Johan, **Issue for use**.
9. The **approval route**, **revision history** and **approval trail** show every decision, comment and timestamp.

**Viewing documents:** use **Open document** on any document page, or click any file anywhere in the system: revisions, action evidence, inspection photos, certificates and incident attachments.
- **PDFs** open page by page inside the system. **Images** and **text files** display directly.
- **Approvers** see the button highlighted when it is their turn.
- **Revision in use:** while a new draft is in approval, the issued revision can be opened separately with **Open Rev 1 (in use)**.
- **Demo documents** have no real file content, so they open as a sample sheet built from the record: controlled header, change summary and approval route.
- **Storage:** uploaded files are kept in your browser only (up to 20 MB each). Production uses secure document storage.

**Printing documents:** use **Print** on a document page, or in the file viewer.
- Every page of the document prints, with a control stamp at the top of each page:
  - **"UNCONTROLLED WHEN PRINTED"** for issued documents;
  - **"DRAFT — NOT FOR USE"** for drafts and revisions still in approval.
- The stamp also shows the document number, revision, who printed it and when, and each print is recorded in the document's approval trail.
- PDFs, images, text files and demo sample sheets can be printed. Inspection reports and management reports have their own Print buttons.
- **Note:** the online preview link (claude.ai) blocks the browser's print dialog for everyone. There, Print explains this. To print, open the prototype from its folder on your computer (double-click `index.html`).

Seeded examples:
- **KIE-SWP-022** is waiting at step 2 for Johan. It is in his tasks, and on the Documents page under **Awaiting my approval**.
- **KIE-MS-003** is at step 1 with Ayesha.
- **KIE-PRO-018** was returned for correction.
- **KIE-TRN-003** is approved and ready to issue.

Default routes per category are set in **Administration → Approval routes**.

### B. Inspect an asset → failure → corrective action → verification
1. **Assets & Equipment → FL-02**. The *Required documents* tab shows forklift-specific certificates.
2. **Start inspection**. The controlled header comes from the approved template and cannot be edited. **Fail** item 1 (a critical item) with a comment and an optional photo. "Remove FL-02 from service" is ticked automatically.
3. Submit. A **defect** and a **corrective action** are raised, **FL-02 is OUT OF SERVICE**, and the next inspection is scheduled.
4. **Return to service** is blocked until the action is verified.
5. Open the action. Use **Act as owner** to work it: **Acknowledge → Start work → Upload evidence → Submit for verification**.
6. Switch back to Johan and choose **Review evidence & verify**. You can **return it** for further work (Rejected), or **accept** it and tick **Authorise return to service**. Then **Close action**. Completing an action never closes it on its own.
7. The asset's **history** shows the whole story. **Controlled report / print** produces the inspection report with "Page X of Y" on every page.

Defects can also be reported directly from the asset page or its **QR page** (e.g. `#/qr/AS-012`).

### C. Incident management
1. As **Nomvula Sithole**, go to **Incident Management → Report incident**. This form is designed for a phone.
2. As Johan, **Assign investigator → Record investigation**: findings, immediate, underlying and root cause, and cause categories. Tick *Investigation complete*, and you are prompted to raise a corrective action.
3. Work and verify the action as above. The incident moves to **Awaiting closure**.
4. **Review & close**. The incident can't be closed while any action is still open. Check **Reports → Incident trends**.

### D. Branches and tasks
- Use the **Branch / site** selector to scope everything to one branch. **Reports → Branch comparison** shows them side by side.
- **Notifications & Tasks → My tasks** shows each person their own work: documents awaiting their approval, actions to complete or verify, inspections due and investigations.

## 4. What works and what is simulated

| Works in the browser | Simulated / not provided |
|---|---|
| Upload form with file selection, sequential approval routes, return / reject / resubmit, issue, revisions; **in-app viewing of PDFs, images and text files** | **Files:** kept in this browser only (up to 20 MB each); Word/Excel files have no in-app preview |
| Asset register, QR pages, type-specific certificates, scheduled inspections, controlled templates, defects, out-of-service control | **QR codes:** a simulated pattern and a "scan" dialog |
| Corrective actions with owner workflow, evidence, independent verification, rejection, reopening, escalation | **Sign-in & security:** user switching is a demo; permissions are applied in the browser only |
| Incident reporting, investigation, root cause, actions, closure | **Email / SMS:** in-app notifications only |
| Dashboard, task centre, reports (print + CSV), administration incl. approval routes | **Audit trail:** kept in browser storage and editable |

## 5. Next steps for production

1. Move the data into the Supabase database. The existing app in `/app` and `/supabase` already has tables for assets, inspections, corrective actions and documents.
2. Add real sign-in, with server-side permissions per organisation, branch and role.
3. Store documents and evidence securely, with version history.
4. Send approval and action notifications by email.
5. Keep a server-side audit trail that can't be altered.
6. Add electronic signatures on approvals.
7. Generate printable QR labels.
8. Support offline mobile inspections.

## 6. Files

```
prototype/
├── index.html                    Application shell (open this)
├── styles.css                    Styling incl. responsive and print styles
├── data.js                       Fictional demonstration data (seed)
├── app.js                        Core: state, routing, layout, notifications & tasks,
│                                 corrective-action workflow, dashboard
├── mod-documents.js              Document control & sequential approval routes
├── mod-operations.js             Assets, QR pages, maintenance & defects
├── mod-inspections-incidents.js  Inspections, controlled templates & print report, incidents
├── mod-actions-reports-admin.js  Corrective actions, reports, administration
├── mod-files.js                  File storage (browser) and in-app file viewer
├── vendor/pdfjs/                 PDF.js 3.11.174 (Apache-2.0) for viewing PDFs, works offline
├── tests/workflows.test.js       Automated end-to-end test (developers)
├── CHECKLIST.md                  Requirements checklist with status
└── README.md                     This file
```

**For developers:** `npm install playwright`, then run `node tests/workflows.test.js`. It drives the real interface in a headless browser and checks 59 workflow outcomes.

The earlier full HSEQ prototype, with legal, risk, people, PPE, chemicals, emergency and audits, is preserved in git history at commit `26b59bc`.

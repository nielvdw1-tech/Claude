# VDW HSEQ Management System — Interactive Prototype

A clickable, working prototype of the **VDW HSEQ Management System** by VDW Health & Safety Solutions. It shows how a South African industrial company can **establish** legal compliance, **implement** controls, **monitor** performance, **correct** gaps, **verify** evidence, **maintain** compliance and **report** to management, across all of its branches.

> **Prototype only — demonstration data.**
> - The companies (Kestrel Industrial Equipment and Ridgeway Pumps & Valves), people and records are fictional.
> - Legal register entries are **illustrative**. The legislation names are real South African instruments, but section and regulation references, wording and applicability **must be verified by a competent person**. The prototype does not guarantee legal compliance.
> - Data is stored only in your browser. There is no server, no real sign-in, no permanent document storage, no email or SMS, and no real security.

---

## 1. How to open it

1. Open the `prototype` folder.
2. Double-click **`index.html`**. It opens in your web browser. Chrome or Edge is recommended; Firefox and Safari also work.
3. That's it. There is nothing to install, no internet connection is needed and there are no passwords.

On a phone or tablet, copy the `prototype` folder to the device (or host it on any web server) and open `index.html`.

**Starting again:** open the user menu (top right) → **Reset demo data**. This restores every record to its original state. The same option is under *Administration → Demo data*.

---

## 2. Finding your way around

| Area | What it is for |
|---|---|
| **Left sidebar** | VDW HSEQ logo, **Organisation** selector, **Branch / site** selector, and the 16 pages grouped by lifecycle stage. Click a group title to collapse it. |
| **Top bar** | Breadcrumbs, **global search** (press `/`), **My tasks** (✓ icon), **Notifications** (bell) and the **user menu**. |
| **User menu** | **Switch demo user** to see the system through another role (Managing Director, HSEQ Manager, VDW Safety Consultant, Branch Manager, Supervisor, Employee). This also includes Reset demo data. |
| **Dashboard tiles** | Every tile opens the matching filtered list. For example, "Overdue corrective actions" opens the action register already filtered to overdue actions. |

The dates in the demo data are set relative to **today**, so there are always overdue, due-soon and current items to look at.

### Demo users

| Person | Role | Useful for |
|---|---|---|
| Johan van Wyk (default) | HSEQ Manager | Full access: approves, verifies, configures, sees medical records |
| Thandi Mokoena | Managing Director | Management view and approvals |
| Ayesha Khan | VDW Safety Consultant | Assessing, reviewing and independently verifying |
| Sipho Ndlovu / Lerato Dlamini / Pieter Botha | Branch Managers | Branch-level work; owners of many actions |
| Bongani Zulu / Zanele Mthembu / Fatima Patel | Supervisors | Inspections and action updates |
| Nomvula Sithole and others | Employees | Incident reporting; restricted views |

Some steps can only be done by the **action owner**. When that is the case, the action page shows an **"Act as owner"** button that switches you to the owner in one click.

---

## 3. Guided demonstrations (Workflows A–G)

All seven workflows use the same shared records you see in the individual modules.

### A. Compliance gap → verified compliance
1. **Legal Compliance** → open **LR-013** (Electrical Installation Regulations, Pinetown, *Not Assessed*).
2. **Assess requirement** → choose *Non-Compliant*, describe the finding and the gap. Leave **Generate a corrective action** ticked, choose an owner (e.g. Sipho Ndlovu) and save.
3. Click the new action number in the confirmation message, or find it under **Actions (CAPA)**.
4. **Act as owner** → **Acknowledge** → **Start work** → **Upload evidence** → **Submit for verification**. The legal requirement now shows *Awaiting Verification*.
5. Switch back to Johan van Wyk (user menu) → **Review evidence & verify**. Accept the evidence, or return it to see the rejection loop. The requirement becomes **Compliant** and gets a new review date.
6. **Close action**, then open the **Dashboard**: the legal compliance score has changed.

### Adding legal requirements from the library
1. **Legal Compliance** → **Add requirement**. Choose the **site** and the **responsible person**.
2. Pick an **Act or Regulation** from the dropdown (Acts, Regulations and other requirements such as ISO 45001).
3. Click a **section / regulation** to open it, then tick the **sub-regulations** that apply. Tick the box on the section row to select all of its sub-regulations.
4. For each ticked item the system shows:
   - **To be compliant:** each obligation, checked against existing records (documents, appointments, training, asset certificates, inspections, drills, SDSs, risk assessments, PPE, incidents, audits and actions). It is marked ✓ met, ⚠ gap (with the reason) or 🕒 needs confirming with evidence.
   - **To maintain compliance:** the recurring activities and when each is next due.
   - A **proposed status**.
5. Leave the options ticked to **raise a corrective action for each gap** and **create any missing recurring inspections or drills**, then **Add to register**.
6. On the requirement page, **What is needed to be compliant** stays live. Confirm manual items with evidence, raise actions for gaps, or **Apply** the system's view to update the status.

Sub-regulations already in the register for that site are greyed out, so they can't be added twice. Requirements that aren't in the library can still be added with **Add a custom requirement instead**. The library is illustrative: references marked "(verify)" in particular need checking by a competent person.

### B. Document approval
1. **Document Control** → **New / upload document**. Choose *Procedure*, enter a title, **select any file** and create the document (Draft, Rev 1).
2. **Submit for review** → **Start review** → **Return for correction** (a comment is required).
3. **Revise & resubmit** with a new file. The returned draft is kept as *Superseded draft*.
4. **Start review** → **Approve** → **Issue for use**. Rev 1 is now the controlled copy and has a review date.
5. **Start new revision**. Rev 1 stays "Current issued" while Rev 2 is drafted. The revision history and approval trail show every version, decision, comment and timestamp.

You can also see seeded examples: **KIE-SWP-022** (under review while Rev 1 is in use), **KIE-PRO-018** (returned for correction), **KIE-TRN-003** (approved, awaiting issue), **KIE-PRO-020** (obsolete) and **KIE-FRM-002** (archived).

### C. Risk assessment
1. **Risk Management** → **New risk assessment**. Rate the initial risk and enter a *missing control*, leaving "Generate a corrective action" ticked.
2. Complete the generated action as its owner, then verify it as a different user (e.g. Ayesha Khan).
3. The control becomes **Implemented** and the risk is flagged **Review required**.
4. As Johan, open the risk → **Review assessment** → re-rate the residual risk and set the next review date.

The heat map is clickable and filters the register. Matrix labels and bands can be changed under *Administration → Risk matrix*.

### D. Asset inspection & out-of-service control
1. **Assets & Equipment** → **FL-02**. The *Required documents* tab shows forklift-specific certificates. Compare it with **LDV-03** (vehicle licence disc, roadworthy).
2. **Start inspection**. The controlled header comes from approved template KIE-FRM-031 Rev 3 and cannot be edited. Answer every item, and **Fail** item 1 (critical) with a comment. "Remove FL-02 from service" is ticked automatically.
3. Submit. A defect and a corrective action are created, and **FL-02 is OUT OF SERVICE**.
4. Try **Return to service**: it is blocked until the action is verified.
5. Complete the action as its owner, then verify it as Johan with **Authorise return to service** ticked.
6. The asset's **Asset history** tab shows the inspection, out-of-service event, defect closure and return to service.
7. Open the inspection → **Controlled report / print** → **Print / save as PDF**. Every printed page shows the controlled header and "Page X of Y". Seeded example **CMP-02** (Pinetown) is already out of service.

### E. Incident investigation
1. **Incidents & Injuries** → **Report incident**. This form is designed for a phone. Submit it.
2. **Assign investigator** → **Record investigation** (findings, immediate / underlying / root cause, categories) → tick *Investigation complete*. You are then prompted to raise a corrective action.
3. Complete and verify the action. The incident moves to *Awaiting closure*.
4. **Review & close**, then check **Management Reports → Incident trends**.

### F. Branch comparison
1. In the sidebar, set **Branch / site** to *Pinetown*. The dashboard, lists, notifications and reports are scoped to that branch.
2. Switch to *Montague Gardens* and compare.
3. Use **Management Reports → Compliance by branch** for a side-by-side table.
4. Choose *All branches* (or **Return to organisation-wide view** on the dashboard).
5. Switch **Organisation** to *Ridgeway Pumps* to see a second client.

### G. Maintained compliance
1. Switch to **Bongani Zulu** → **My tasks** (✓ icon). *Inspect: Germiston warehouse & workshop* is overdue.
2. Open it, complete the inspection, fail an item with a comment and photo, and submit.
3. The next inspection is automatically scheduled 30 days ahead. The overdue alert disappears and the new action appears in the central register.
4. Other "maintain" loops to try: legal re-assessment (**LR-007**, overdue), periodic document review (**Record periodic review** on an issued document), SDS review (**Hazardous Chemicals → Solvex 300**, which creates a new SDS revision in Document Control), drill results (**Emergency → Drills → Record results**, which schedules the next drill) and maintenance completion (which schedules the next service).

---

## 4. What is real in this prototype and what is simulated

| Works for real in the browser | Simulated / not provided |
|---|---|
| All screens, navigation, search, filters, forms and validation | **Authentication**: user switching is a demo, not sign-in |
| Workflow state changes and cross-module updates (legal ↔ actions ↔ dashboard, risk controls, asset service status, incidents) | **Security**: role permissions are applied in the browser only. Anyone can edit local data |
| Compliance scores, notifications and reports computed from the records | **File storage**: only the file *name and size* are kept. Files are not uploaded or stored |
| Revision control (no overwriting), template revisions retained by historical inspections | **Email / SMS notifications**: in-app only. Settings exist but nothing is sent |
| Printable controlled inspection reports with Page X of Y; printable management reports; CSV export | **Audit trail**: kept in browser storage and editable, so not tamper-evident |
| Saving data in this browser (localStorage) and Reset demo data | **QR codes**: a simulated pattern and a simulated "scan" dialog, not scannable codes |
| Responsive desktop / tablet / mobile layouts | **Legal content**: illustrative, needs professional verification |

---

## 5. What remains to be built for production

1. **Backend & database.** Move the data model into Postgres (Supabase), with migrations, referential integrity and the same stable IDs. The prototype's records map directly onto tables.
2. **Authentication & authorisation.** Supabase Auth (or SSO). Enforce organisation, branch and role permissions on the server with row-level security. Never rely on client-side checks.
3. **Document storage.** Secure, versioned object storage for documents, evidence and photos. Add virus scanning, retention rules, access logging and controlled-copy watermarking.
4. **Tamper-evident audit trail.** Server-side, append-only history of every create, change, decision and electronic signature.
5. **Notifications engine.** Scheduled server jobs for reminders, escalations (including automatic escalation of overdue actions) and email/SMS/WhatsApp delivery with per-user preferences.
6. **Real QR labels.** Generate printable QR labels that open a secure, mobile asset page.
7. **Offline-capable mobile inspections.** A PWA with offline capture and sync, camera photos and GPS/time stamps.
8. **Verified legal content.** A legal register library maintained and verified by competent persons, with applicability questionnaires and change alerts when legislation is amended.
9. **Reporting.** Scheduled PDF management packs, configurable KPIs, trend periods, and export to Excel/Power BI.
10. **Administration depth.** Full create/edit/deactivate for organisations, users, roles and permissions. Configurable risk matrix *size*, custom asset fields captured per asset, workflow configuration and data import (spreadsheets of assets, people, legal registers).
11. **Privacy & compliance.** POPIA-aligned handling of personal and medical information, data residency, backups, disaster recovery and penetration testing.
12. **Integration** with the existing VDW Compliance Control application in this repository (`/app`, `/supabase`). This prototype was built separately and does not modify it.

---

## 6. Files

```
prototype/
├── index.html                    Application shell (open this)
├── styles.css                    All styling incl. responsive and print styles
├── data.js                       Fictional demonstration data model (seed)
├── app.js                        Core: state, routing, layout, compliance & notification engines,
│                                 central action workflow, dashboard, notifications & tasks
├── mod-documents.js              Document Control
├── mod-legal-risk.js             Legal Compliance + Risk Management
├── mod-people.js                 People, Appointments & Competency
├── mod-operations.js             Assets, Maintenance & Defects, PPE, Chemicals, Emergency
├── mod-incidents-audits.js       Incidents, Audits & Inspections, controlled print report
├── mod-actions-reports-admin.js  Actions (CAPA), Management Reports, Administration
├── mod-legal-library.js          Legal library picker (Act → regulation → sub-regulation) and live obligation checks
├── tests/workflows.test.js       Automated end-to-end test of Workflows A–G (developers)
├── CHECKLIST.md                  Requirements checklist with implementation status
└── README.md                     This file
```

**For developers:** the automated test drives the real interface in a headless browser and checks 56 workflow outcomes:

```bash
cd prototype
npm install playwright   # once
node tests/workflows.test.js
```

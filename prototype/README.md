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
3. You don't need to install anything or be online.
4. **Sign in.** The sign-in page lists the demo accounts: click a person to sign in as them. Every demo account uses the password **demo1234**. You can also type the e-mail address and password.

To start again, open the user menu (top right) and choose **Reset demo data**.

## 2. Finding your way around

- **Sidebar:** organisation and branch selectors, plus the pages: Dashboard, Notifications & Tasks, Document Manager, Assets & Equipment, Inspections, Maintenance & Defects, Incident Management, Corrective Actions, Reports and Administration.
- **Top bar:** global search (press `/`), **My tasks** (✓ icon), notifications and the user menu.
- **Own branch only:** branch managers, supervisors and employees work in their own branch.
  - Their branch selector is fixed, and lists, the dashboard, reports and search show that branch only, plus company-wide documents such as policies.
  - Records from another branch stay visible to them only if they are part of the record: for example asked to approve it, owning an action on it, or investigating it. Those also appear in their tasks.
  - The Managing Director, HSEQ Manager and Safety Consultant see all branches.
- **Back:** every page below the main menu level has a **Back** button at the top left. It returns to the page you came from, or, if you opened the page directly (for example from a QR code), to the page above it.
- **User menu (top right):** change your password, set which e-mails you receive (**Notification settings**), **sign out**, or, for demos, sign in as someone else in one click.
- **Switch demo user:** use the user menu to act as someone else. Approvals and corrective actions depend on *who* you are, so this is how you see each step. Where a step belongs to someone else, the page offers **Act as current approver** or **Act as owner** to switch in one click.

| Demo user | Role | Typical part in the demos |
|---|---|---|
| Johan van Wyk (default) | HSEQ Manager | Approver, issues documents, verifies actions, investigates incidents |
| Thandi Mokoena | Managing Director | Final approver for policies and safe work procedures; raises, assigns and verifies corrective actions; reports incidents |
| Pieter Botha | Operations Manager | Operational reviewer on approval routes |
| Marius Venter | System Administrator | **Everything**, including anything added later; manages roles and users |
| Ayesha Khan | VDW Safety Consultant | **Full access** (same as HSEQ Manager): approvals, issuing, verification, investigations, administration |
| Sipho Ndlovu / Lerato Dlamini | Branch Managers | Document authors; action owners |
| Bongani Zulu / Fatima Patel | Supervisors | Inspections; action owners |
| Nomvula Sithole, Tebogo Molefe | Employee | **Field access only:** scans an asset's QR code to inspect it, and reports incidents |

**Company logo.** The company using the system appears at the top of the menu, with a small *Powered by VDW HSEQ* line underneath. To add the logo, go to **Administration → Organisations & sites → Upload logo**. PNG, JPG, SVG or WebP files are accepted.
- The logo then appears in the company block of document headers, inspection checklists, printed inspection reports and printed management reports.
- Each organisation has its own logo. Until one is uploaded, the company's initials are shown.

**Dashboard.** Built so a managing director sees the picture at a glance, in three sections:
**Quick links** sit at the top of the dashboard and depend on who is signed in. Links with work waiting come first, with a count: my tasks, documents to approve, actions to verify, my corrective actions, defects to review, inspections due, investigations, safety alerts to approve and unread notices. After those come the shortcuts the person's role allows: report an incident, raise a corrective action, upload a document, publish a notice, Reports and Administration. For example, a supervisor sees their inspections and actions but not Administration or document upload. "My inspections due" only appears for people who are assigned scheduled inspections.

1. **Compliance status (top).**
   - The overall control score, with a status label: **On track** (85% and above), **Needs attention** (70–84%) or **At risk** (below 70%).
   - The overall score and each area (documents, assets and inspections, corrective actions, incidents) are shown as **pie charts**: the coloured share is the score, the rest is what is still to close. Each area card also shows its weighting and what is pulling it down, for example "4 inspections overdue".
   - A **status by branch** table. Click a branch to focus the whole dashboard on it.
2. **Trends over the last 12 months:**
   - incidents per month;
   - incidents by type, and injuries by classification;
   - **lost time injuries (LTI):** days since the last LTI, LTIs in the last 12 months and this year, injuries not yet classified, and LTIs and shifts lost per month. These use the final injury classification. An LTI frequency rate needs hours worked, which the system does not record yet;
   - corrective actions raised against completed (verified) per month;
   - open corrective actions split by due date (on time, due within 7 days, overdue up to 30 days, overdue more than 30 days).

   Hover over (or tab to) any bar or point to see the figures. Each chart has a **Data table** with the numbers.
3. **Detail:** the operational tiles for documents, assets, incidents and actions, upcoming deadlines and recent activity.

## 3. Guided demonstrations

### A. Upload a document and route it through several approvers
1. Switch to **Sipho Ndlovu**. Go to **Document Manager → Upload document**.
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

**Documents with their own header:** most documents already carry a header with the logo, number, title and revision.
- **Reading the header:** when you choose a PDF (new document, new revision or corrected draft), the system reads the top of the first page and fills in the number, title and revision.
- **Mismatches:** anything that doesn't match the record is shown, for example a different number, a different title, or a file still saying Rev 3 while the system records Rev 4. Saving then needs **"The header does not match — save anyway"**, and that confirmation is recorded in the document history.
- **Revision numbering:** **Revision number of this file** keeps an existing document's numbering, for example Rev 4, instead of starting at Rev 1.
- **What can't be read:** scanned PDFs without text, Word and Excel files. Nothing is filled in or checked for those.
- **The file itself** is never changed; it opens exactly as uploaded.

**Printing documents:** use **Print** on a document page, or in the file viewer.
- Every page of the document prints, with a control stamp in a strip above each page (the document's own header is never covered; the same applies to downloads):
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
6. Switch back to Johan and choose **Review evidence & verify**. **Verification must be independent:** the owner of an action can never verify it, even if their role allows verifying. The owner sees who can verify instead. You can **return it** for further work (Rejected), or **accept** it and tick **Authorise return to service**. Then **Close action**. Completing an action never closes it on its own.
7. The asset's **history** shows the whole story. **Controlled report / print** produces the inspection report with "Page X of Y" on every page.

Defects can also be reported directly from the asset page or its **QR page** (e.g. `#/qr/AS-012`).

**Who raises the corrective action.**
- **Operators and employees only report.** When they fail an item, they describe the failure, add a photo and can mark the asset **unsafe to use**, which takes it out of service at once. They don't choose an owner or priority.
- Each failure becomes a defect **awaiting review**. The asset's responsible supervisor (if they can raise actions) and the branch manager get a task to review it within the review period (default 2 days). The reviewer can:
  - **raise a corrective action**, choosing the owner, priority and due date;
  - close the defect as **fixed on the spot**, which needs a comment and evidence;
  - **add it to an existing corrective action** on the same asset.
- A review that is not done in time turns red, goes to the HSEQ Manager and lowers the asset score.
- Supervisors and managers who inspect still raise the action directly from the checklist.
- **Example:** defect **DF-303** on LDV-03 is waiting for review by Pieter Botha.

### C. Incident management
1. As **Nomvula Sithole**, go to **Incident Management → Report incident**. This form is designed for a phone. Under **Photographs / attachments**, **Take photo** opens the phone camera and **Upload** adds photos or PDFs (for example a witness statement) from the phone or computer. Up to 10 files can be attached, and each can be removed before submitting. Photos show as thumbnails on the incident and open full size.
2. As Johan, **Assign investigator → Record investigation**: findings, immediate, underlying and root cause, and cause categories. Tick *Investigation complete*, and you are prompted to raise a corrective action.
3. Work and verify the action as above. The incident moves to **Awaiting closure**.
4. **Review & close**. The incident can't be closed while any action is still open. Check **Reports → Incident trends**.

**Incident trends at the top.** Incident Management opens with one panel of incident trends for the last 12 months. It is limited to your branch if you are a branch manager or supervisor, and **Hide** folds it away.
- Three figures across the top: incidents (with the last 6 months compared to the 6 before), days since the last lost time injury, and the **LTI frequency rate** (rolling 12 months). If last month's hours worked are not in yet, the LTIFR shows the latest month that can be calculated and says which month is missing.
- Four charts below: incidents per month; the **LTI frequency rate line** with the **Previous year** button (a month without hours worked is a gap, not a zero); incidents by type, with injuries by classification; and open incidents by stage. Click a type or a stage to filter the list below.
- **Data tables** at the bottom of the panel hold the figures behind every chart.

**Controls after an incident is logged.**
- **Escalation:** an incident with no investigator after the set number of days (default 3), or an investigation past its due date, is **escalated automatically** to the branch manager and the HSEQ Manager. An overdue investigation is escalated above the investigator. The escalation is recorded in the incident history, shown on the incident and added to their tasks.
- **Corrections:** investigators can **correct the type and severity** set by the reporter, with a reason. The original values stay in the history.
- **Effectiveness review:** a set number of days after closure (default 30), the investigator and HSEQ Manager are asked to confirm that the corrective actions **worked**. *Not effective* reopens the incident and prompts a new corrective action. An overdue effectiveness review is escalated and lowers the score.
- The review periods are set in **Administration → Review periods**.
- **Examples:** INC-2026-006 (no investigator) and INC-2026-007 (investigation overdue) are escalated. INC-2026-003 has an effectiveness review due.

**Injury classification.** The person reporting an injury only describes it: what the injury is, the body part, the first aid given, and whether the person was sent for medical treatment. **They do not classify it.**
- An investigator or HSEQ role uses **Classify injury** on the incident to record the facts: treated beyond first aid, full shifts lost, shifts on restricted work, the date back at normal work, and whether the injury was fatal.
- **The system suggests the class** from those facts, in this order: Fatality → Lost Time Injury → Restricted Work Case → Medical Treatment Case → First Aid Case.
- Choosing a different class needs a reason. Reclassifying, for example when a first aid case later needs a doctor, also needs a reason, and every change is kept in the classification history.
- **An injury must be classified before the incident can close.** Unclassified injuries appear in the HSEQ team's tasks.
- **Lost time injuries and fatalities** prompt a check on external reporting. Whether to report remains a decision for a competent person.
- The **definitions** of each class are set by the company in **Administration → Injury classification**. The default wording is the system's suggestion, not a legal definition.
- Reports and incident totals count injuries by the final classification.
- **Example:** INC-2026-005 was first classified as a Medical Treatment Case and later reclassified as a Lost Time Injury.

### Employees (field access)
Switch to **Tebogo Molefe** (Employee). The menu shows only **Scan & inspect** and **Report incident**.
1. **Scan asset QR code**, then choose **LDV-03**. The asset's QR page shows its safety status, **Start inspection** and **Report defect**. (Incidents are reported from the home screen or the menu, not from an asset's QR page.)
2. Complete the inspection. Failed items become defects that a supervisor or branch manager reviews and turns into corrective actions.
   - **Photos:** each checklist item has **Take photo**, which opens the phone camera, and **Upload**, which picks one or more photos from the phone or computer. Up to 6 photos can be added per item. Thumbnails show straight away and can be removed before submitting. The photos are saved with the inspection and the defect, so the reviewing supervisor sees them. They also show on the inspection record (tap to view full size) and print on the inspection report.
   - Before submitting, the inspector ticks the declaration and **signs on screen** with a finger or mouse. **An inspection can't be submitted without a signature.** The signature is stored with the record, with the inspector's name and the time, and appears on the inspection record and in the *Inspector signature* box of the printed report.
3. **Report incident** opens the phone-friendly form. Reported incidents are listed on the employee's home screen.

Other pages are closed to employees. An inspection can only be started from the QR page of that asset. Employees are not offered as owners of corrective actions.

### Company notices (memos and important information)
- **Who publishes:** the HSEQ Manager, Managing Director, Safety Consultant and Branch Managers. Go to **Company Notices → Publish notice**.
- **What a notice holds:** a title and message, sent to all staff or to one branch, marked Normal or **Important**. It can carry an attachment (e.g. a memo PDF) and can require a **"read and understood"** acknowledgement.
- **What staff see:**
  - Everyone sees notices addressed to them under **Notices**, with an unread count.
  - Employees also see unread and important notices at the top of their home screen.
  - Opening a notice marks it as read, and staff acknowledge it with one tap.
- **Tracking:** the publisher sees, for each notice, who has read it and who has acknowledged it, with times. They can send a reminder (simulated, in-app only) or withdraw the notice.
- **Example:** switch to **Tebogo Molefe** (Employee, Germiston) to see the *New pedestrian walkways* notice waiting for acknowledgement.

**Incident safety alerts.** When an incident is reported, the system drafts a safety alert notice automatically. The alert gives the type, place and date, what happened and the immediate action taken. It leaves out names and injury details.
- Staff **do not see the alert until it has been approved in sequence**: first by the **HSEQ Manager**, then by the **Safety Consultant**.
- Each approver can edit the wording, audience, priority and acknowledgement before approving. Either approver can choose **Do not share**, giving a reason.
- The final approval publishes the alert to the incident's branch, or to all staff if the approver chooses that.
- Approvers get a task. The incident page shows the alert's status, and every decision is recorded in the incident history.
- For incidents without an alert, **Prepare alert** on the incident page creates one.
- **Example:** *NT-004* (from INC-2026-007) was approved by Johan and is waiting for Ayesha. Open it from **Company Notices** and use **Act as current approver**.

### D. Branches and tasks
- Use the **Branch / site** selector to scope everything to one branch. **Reports → Branch comparison** shows them side by side.
- **Notifications & Tasks → My tasks** shows each person their own work: documents awaiting their approval, actions to complete or verify, inspections due and investigations.

### E. Built-in controls (towards going live)
- **Sign-in and accounts** (Administration → Users & roles):
  - Administrators **add users**, who get a temporary password and must choose their own at first sign-in.
  - Administrators can **reset passwords** and **deactivate** people who leave. Deactivated people can't sign in and aren't offered as owners or approvers. Before deactivating, the system warns about the person's open work.
  - Five wrong passwords lock an account for 15 minutes.
- **Locked records and amendments:** closed incidents, verified or closed corrective actions and submitted inspections are **locked**. Corrections are added as **amendments** with a reason, and the original stays unchanged.
- **Tamper-evident audit trail** (Administration → Audit trail):
  - Every event is chained to the one before it, and every locked record has a fingerprint.
  - **Check integrity** shows whether anything was changed or removed. A demo button tampers with a closed incident so you can see it detected; a changed record is also flagged on its own page.
- **E-mail outbox:**
  - Everything the live system would e-mail is recorded with its recipient and full text: approvals, assignments, verification requests, returned evidence, escalations, defect reviews, out-of-service assets, notices, safety alerts and account changes.
  - Each person sees theirs under **Notifications & Tasks → My e-mail**, and administrators see all of them under **Administration → E-mail outbox**.
  - People choose which e-mails they get under **Notification settings**. **Nothing is actually sent.**
- **Backup and restore** (Administration → Backup & data):
  - One file holds all records and all uploaded files, with a checksum.
  - Restoring shows what is in the backup first. A damaged or edited backup, or one from another version, is refused.
  - Use it to keep a copy or to move the prototype to another computer.

**The equipment QR page** is what anybody sees after scanning a label:
- the equipment's details and safety status;
- its documents (certificates and the related procedure), view only;
- when it was last inspected, by whom, the result and when the next inspection is due.

Who sees what:
- **Anyone not signed in** gets this page read-only, with a **Sign in** button that brings them back to the same equipment.
- **Inspectors** (supervisors, branch and HSEQ managers, and employees) also get **Start inspection** and **Report defect**. Employees describe the defect and add photos, and a supervisor or manager reviews it.
- **Everyone else**, such as the Managing Director, sees the page view only.
- **Nobody** uploads documents from the QR page. On the asset record, only people who manage documents (HSEQ Manager, Safety Consultant, Branch Manager) can upload certificates.

### F. Getting a client set up (towards a pilot)
- **Real QR codes and labels:**
  - Every asset has a real, scannable QR code that links to its QR page.
  - **Assets → Print QR labels** prints small (50 × 30 mm) or large (70 × 50 mm) labels for all or chosen assets. Each label shows the company logo, the asset tag and name, and "Scan to inspect or report". An asset's own page has **Print label**.
- **Scanning:**
  - **Scan asset QR** uses the phone or laptop camera.
  - Where the camera can't be used (for example in the online preview), **Take a photo of the label** reads the code from a photo.
  - A QR code that isn't one of the system's labels is refused.
- **Bulk import from Excel or CSV** (Administration → Import data):
  - You can load **assets**, **people**, **inspection schedules** and an **existing document register** from a spreadsheet (.xlsx or .csv, including semicolon-separated files).
  - **Download template** gives the column headings.
  - Every row is checked and shown in a preview first: *Ready*, *Error* (with the reason) or *Exists* (skipped, never duplicated).
  - **Imported people** get temporary passwords, shown once to the administrator.
  - **Imported assets** get their inspection schedule automatically.
  - **Imported documents** are recorded as issued, with revision and review dates. Attach each current file afterwards.
- **Downloads in the online preview:** backups, import templates and report CSV exports now ask you to confirm the download instead of being blocked.

### G. More controls for running real clients
- **Hours worked and LTIFR** (Administration → Hours worked):
  - Enter hours worked per branch per month. Administrators get a task when last month is missing.
  - The dashboard's LTI section shows the **rolling 12-month LTI frequency rate** per 200 000 hours (or 1 000 000, your choice), with a trend chart. Months without hours show as gaps.
  - The **Previous year** button next to the chart adds an orange line with the rolling LTIFR for the same months a year earlier; click it again to hide it.
- **Control score history:**
  - The score is saved every month for the company and each branch.
  - The dashboard shows a **12-month trend** against the "on track" level, and the change since last month.
  - The earlier months in the demo are fictional and labelled as such.
- **Reviewer signature:**
  - The manager who signs off an inspection must sign on screen.
  - The signature appears on the record and in the printed report's reviewer box.
  - Nobody can sign off an inspection they carried out themselves.
- **Stamped downloads:** **Download** on a document (and in the viewer) gives a PDF with the control stamp on every page: *UNCONTROLLED WHEN PRINTED* or *DRAFT — NOT FOR USE*, with number, revision, who and when.
  - Images are placed on a stamped page.
  - Word and Excel files can't carry a stamp, so they download with *DRAFT* or *UNCONTROLLED* in the file name, after a warning.
  - Every download is recorded in the document history.
- **Several clients:**
  - Everyone works in their own company only; the organisation selector offers nothing else.
  - VDW safety consultants get **My clients**: each client's control score, open and overdue actions, open incidents and LTIs side by side. They can open any client, or set up a **new client** (company, branches, first administrator with a temporary password).
- **Privacy (POPIA)** (Administration → Privacy):
  - **Medical details:** injury details stay hidden until someone allowed to see them opens them, and every opening is recorded.
  - **Retention:** you set retention periods per type of record, and records past them are listed for review (never deleted automatically).
  - **Former employees:** their personal details can be removed on request, while the safety records stay and show *Former employee*.
  - Which records to keep, and for how long, is for your company and its legal adviser to decide.

### H. Roles and areas (Administration → Roles & permissions)
- **System Administrator** can do everything, including permissions added later. This role can't be changed or deleted.
- **Two layers per role:**
  - **Areas of the system it can open:** Dashboard, Company notices, Document Manager, Assets, Inspections, Maintenance, Incidents, Corrective actions, Reports, Administration.
  - **What it can do:** for example approve documents, verify actions, investigate incidents or publish notices.
- **Creating and editing roles:**
  - **New role** starts empty; **Copy** starts from an existing role.
  - **Edit** opens or closes areas and permissions; people with that role get the change straight away.
  - Custom roles can be renamed or deleted (once nobody has them). Built-in role names are fixed.
- **Field-screen roles** (such as Employee) keep their simple phone screens. Any area opened for them is added to their menu under **Opened for your role**. For example, open the Document Manager for employees so they can read issued procedures without being able to upload or approve.
- **Closed areas** are not shown in a person's menu, and opening one by link explains it is not open for their role.
- **At least one person** must always be able to configure the system; the last such person can't lose that permission.

## 4. What works and what is simulated

| Works in the browser | Simulated / not provided |
|---|---|
| Upload form with file selection, sequential approval routes, return / reject / resubmit, issue, revisions; **in-app viewing of PDFs, images and text files** | **Files:** kept in this browser only (up to 20 MB each); Word/Excel files have no in-app preview |
| Asset register, real QR codes and printable labels, camera / photo scanning, type-specific certificates, scheduled inspections, controlled templates, defects, out-of-service control | **Camera in the online preview:** not available there; scan from a photo of the label instead |
| Corrective actions with owner workflow, evidence, independent verification, rejection, reopening, escalation | **Sign-in & security:** sign-in, passwords and permissions are checked in the browser only, so they are not secure |
| Incident reporting, investigation, root cause, actions, closure | **Email / SMS:** e-mails are written to an outbox but not sent; no SMS |
| Dashboard, task centre, reports (print + CSV), administration incl. approval routes | **Audit trail:** hash-chained so changes are detected, but kept in the browser, where someone could rebuild it |
| Sign-in with accounts, locked records with amendments, tamper-evident audit trail, e-mail outbox, backup and restore | **Backups:** made by hand; the live system backs up automatically |

## 5. Next steps for production

1. Move the data into the Supabase database. The existing app in `/app` and `/supabase` already has tables for assets, inspections, corrective actions and documents.
2. Move sign-in to a secure server (the prototype shows the flow), with server-side permissions per organisation, branch and role.
3. Store documents and evidence securely, with version history.
4. Send the e-mails that the prototype writes to its outbox, from the server.
5. Keep the audit trail on the server, signed and out of users' reach (the prototype shows the hash chain and locked records).
6. Add electronic signatures on approvals.
7. Host the system at a short web address, so the links in printed QR labels open directly on any phone.
8. Support offline mobile inspections.

## 6. Files

```
prototype/
├── index.html                    Application shell (open this)
├── styles.css                    Styling incl. responsive and print styles
├── data.js                       Fictional demonstration data (seed)
├── app.js                        Core: state, routing, layout, notifications & tasks,
│                                 corrective-action workflow, dashboard
├── mod-auth.js                   Sign-in (simulated): accounts, passwords, deactivation
├── mod-roles.js                  Roles: areas of the system and permissions per role
├── mod-audit.js                  Locked records, amendments, hash-chained audit trail
├── mod-mail.js                   E-mail outbox (simulated) and notification settings
├── mod-backup.js                 Backup and restore of all records and stored files
├── mod-qr.js                     Real QR codes, printable labels, camera / photo scanning
├── mod-import.js                 Bulk import from Excel (.xlsx) or CSV with preview
├── mod-hours.js                  Hours worked per branch and the LTI frequency rate
├── mod-history.js                Monthly control score snapshots and trend
├── mod-stamp.js                  Stamped (controlled) downloads of documents
├── mod-docread.js                Reads number, title and revision from a PDF's own header on upload
├── mod-clients.js                Several clients: separation, overview, new-client wizard
├── mod-privacy.js                Privacy (POPIA): medical-detail access log, retention, removal
├── mod-documents.js              Document control & sequential approval routes
├── mod-operations.js             Assets, QR pages, maintenance & defects
├── mod-inspections-incidents.js  Inspections, controlled templates & print report, incidents
├── mod-actions-reports-admin.js  Corrective actions, reports, administration
├── mod-files.js                  File storage (browser) and in-app file viewer
├── mod-notices.js                Company notices: publish, read, acknowledge, track
├── mod-dashboard.js              Dashboard: compliance status, 12-month trends, detail
├── vendor/pdfjs/                 PDF.js 3.11.174 (Apache-2.0) for viewing PDFs, works offline
├── vendor/qr/                    QR code generator (MIT) and reader jsQR (Apache-2.0)
├── vendor/pdf-lib/               pdf-lib 1.17.1 (MIT) for stamped PDF downloads
├── tests/workflows.test.js       Automated end-to-end test (developers)
├── CHECKLIST.md                  Requirements checklist with status
└── README.md                     This file
```

**For developers:** `npm install playwright`, then run `node tests/workflows.test.js`. It drives the real interface in a headless browser and checks 219 workflow outcomes.

The earlier full HSEQ prototype, with legal, risk, people, PPE, chemicals, emergency and audits, is preserved in git history at commit `26b59bc`.

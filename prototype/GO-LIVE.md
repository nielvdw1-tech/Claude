# Going live: what has to be built

This is a plan, not a change. Nothing in the production application (`app/`, `supabase/`, root `index.html`) has been modified, and nothing is connected to Supabase. The prototype stays a prototype until the owner decides to start this work.

## 1. Where things stand

| | Prototype (`prototype/`) | Production app (`app/` + `supabase/`) |
|---|---|---|
| Scope | All modules (documents, assets, inspections, maintenance, incidents, actions, audits, legal, people, training, risk, PPE, substances, emergency, contractors, committee, toolbox talks, permits, medical, change, reports, admin) | Clients, branches, users, inspection templates, assets, inspections, corrective actions, documents, notifications |
| Data | The browser's local storage, demonstration data | Still the browser's local storage; Supabase **schema and security rules exist (Phase 1)** but are not connected |
| Sign-in | Simulated (demo passwords) | Simulated |
| Files | Kept in the browser (IndexedDB) | Base64 in local storage |
| E-mail | Written to an outbox, never sent | None |
| Security | Enforced in the browser only (not secure) | Row Level Security written, not yet in use |

**Recommendation:** treat the prototype as the agreed specification and screen design, and build the live system on Supabase, continuing the plan already in `supabase/README.md`. The prototype's code is not suitable to deploy as it is: everything runs in the browser, all rules are checked in the browser, and the data model was built for speed of testing, not for many users at once.

## 2. What the live system needs

### 2.1 Sign-in and accounts
- Supabase Auth: e-mail and password, password reset, invitations from Administration (no shared or demo passwords).
- Two-factor sign-in at least for administrators, HSEQ managers and consultants.
- A `profiles` table (already designed) extended with: organisation, branch, role, job title, department, reporting line, employee/office type, status.
- Consultants who look after several client companies: a link table (person ↔ organisation) instead of one `client_id`.
- Session time-out and sign-out on all devices.

### 2.2 Database
Every prototype collection becomes a table (or a few). Phase 1 already covers the first column.

| Already in `schema.sql` | Still to design |
|---|---|
| clients, branches, profiles | departments, roles, permissions, role-permissions, organisation settings (`config`) |
| inspection_templates, template_questions, inspections, inspection_items | inspection schedules, template revisions, amendments |
| assets | asset types, asset documents/certificates, maintenance, defects, lifting equipment fields |
| corrective_actions | action history, evidence, verification, follow-up checks |
| documents | document revisions, approval routes and steps, read-and-sign, change requests, external documents |
| notifications | company notices, acknowledgements, task snoozes, notification settings, e-mail outbox |
| | incidents (injury, investigation, root cause, witnesses, costs, lessons, reporting) |
| | audits: checklists, programme, audits, answers, findings |
| | legal: legislation library, sections, requirements register, assessments, evidence, changes |
| | people: employees, appointments (versions, acceptance with signature), responsibilities, competencies |
| | training: courses, requirements, records, sessions, attendance |
| | risk: hazards, risk assessments, rows, controls, reviews, signatures, risk matrix |
| | PPE: types, requirements, issues with signatures, stock |
| | hazardous substances, safety data sheets, exposure monitoring |
| | emergency arrangements, drills, findings |
| | contractors, their documents, inductions, findings |
| | H&S committees, meetings, representative inspections |
| | toolbox talks and attendance signatures |
| | permits to work, precautions, extensions, close-out |
| | medical examination types and records (restricted — see 2.3) |
| | management of change, impacts, approvals |
| | consultant visits, hours worked, control-score history, audit trail |

Rules for the design:
- Every row carries `organisation_id` (and `branch_id` where it belongs to a branch), `created_by`, `created_at`, `updated_at`.
- Signatures are stored as image files (see 2.4) with who signed, when, and on whose device they were collected.
- Closed and approved records are locked in the database (not only on the screen), and changes go through amendments, as in the prototype.

### 2.3 Who may see what (Row Level Security)
- The prototype's roles and permissions become database policies: organisation → branch → role → permission.
- Employees (field users) see only their own appointments, PPE, training, risk assessments to sign, reading, inspections they do and incidents they reported.
- **Medical surveillance** is readable only by roles with "Manage medical surveillance". Only fitness outcomes and restrictions are stored — never clinical results.
- Consultants see only the organisations they are linked to.
- Every policy gets an automated test that a user from another organisation, branch or role cannot read or change the data.

### 2.4 Files
- Supabase Storage, private buckets: documents and revisions, evidence and photos, certificates, signatures, safety data sheets, appointment letters, minutes.
- Files are opened through short-lived signed links; the stamped download ("Uncontrolled when printed") stays as it works in the prototype.
- Size limits and allowed file types; a virus scan on upload is advisable.

### 2.5 E-mail and reminders
- An e-mail provider through a Supabase Edge Function; the prototype's outbox becomes a real queue with sent/failed status.
- The reminders that the prototype works out when someone opens it (overdue actions, expiries, drills, permits, medical examinations, review dates, monthly report, weekly summary) must run on a schedule on the server (e.g. a daily job), so they go out even if nobody opens the system.
- Respect each person's notification settings.

### 2.6 Audit trail
- The tamper-evident trail (each entry linked to the previous one) is written by the database, not by the browser.
- An "integrity check" report for administrators and auditors.

### 2.7 Phones and offline work
- Keep the installable app (manifest, icons, service worker).
- Offline inspections and incident reports are queued on the phone and sent when there is signal; conflicts are resolved on the server.

### 2.8 Privacy (POPIA) and hosting
- An operator agreement with the hosting provider, and a decision on where the data is hosted. If it is hosted outside South Africa, check the rules on cross-border transfers with your legal adviser before going live.
- Retention periods (already configurable in the prototype) enforced by a scheduled job.
- A privacy notice for employees, and a process for access and correction requests.

### 2.9 Legal content
- Load the official wording of the Act and the regulations from an official source (SAFLII, gov.za, Department of Employment and Labour) or from documents the owner provides, by a competent person, as the prototype's legal library requires.
- Keep the system's derived obligations separate from the legal text and labelled as the system's interpretation.
- The system shows what was recorded; it does not by itself guarantee legal compliance.

### 2.10 Quality
- The prototype's automated workflow checks (`prototype/tests/workflows.test.js`, 468 checks) become the acceptance tests for the live system, rewritten against the real screens.
- A security review (and ideally an external penetration test) before the first client goes live.
- Daily backups with a tested restore; monitoring and error alerts.

## 3. Suggested order

1. **Foundation:** sign-in, organisations, branches, people, roles and permissions, Row Level Security, file storage, audit trail.
2. **Owner's priority modules** (as in `CLAUDE.md`): document control with sequential approval; assets, inspections, defects and corrective actions; incidents; audits.
3. **Compliance modules:** legal register (with official wording), people and appointments, training, risk, PPE, substances, emergency, contractors.
4. **New modules:** H&S committee, toolbox talks, permits to work, medical surveillance, management of change.
5. **Server jobs:** e-mail, reminders, escalations, monthly and weekly reports.
6. **Data migration:** import each client's assets, people, documents and schedules (the prototype's Excel import templates can be reused).
7. **Pilot** with one client and one branch, then the rest.

## 4. Decisions needed from the owner

- Hosting region and provider agreement (POPIA).
- E-mail provider and sending address.
- Who loads and signs off the official legal wording.
- Which client pilots first.
- Whether to keep `app/` as the starting point or start a new codebase from the prototype's design.

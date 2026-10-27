# Requirements checklist — VDW HSEQ Prototype

Status key: **Implemented** = works end-to-end in the prototype and was tested · **Partial** = present but limited or simulated (reason given) · **Not implemented**.

A feature is only marked Implemented if it works, not just because its screen exists. "Tested" means it was exercised by the automated browser test (`tests/workflows.test.js`, 52/52 passing), by the route smoke test (89 routes, no JavaScript errors), or by manual screenshot review at desktop (1440 px), tablet (820 px) and mobile (390 px) widths.

## Build & technical
| Requirement | Status | Notes |
|---|---|---|
| Separate `prototype` folder; production app, migrations, env & config untouched | Implemented | `git status` shows changes only under `prototype/` |
| HTML + CSS + vanilla JS; `index.html`, `styles.css`, `app.js`, `README.md` | Implemented | Plus `data.js` and six module files |
| Opens locally from `index.html`, no backend/build/API keys | Implemented | No external network requests (no CDNs, fonts or APIs) |
| Consistent demo data model; browser local storage | Implemented | Single state object in localStorage; stable IDs across modules |
| Reset Demo Data | Implemented | User menu and Administration → Demo data |
| No Supabase connection / credentials | Implemented | |

## Design & layout
| Requirement | Status | Notes |
|---|---|---|
| Brand colours (#005FEF, #1677FF, #0A2A6B, #F26A21; green/amber/red states) | Implemented | Defined as CSS variables |
| Sidebar: wordmark, org selector, branch selector, icon nav, expandable groups, user & role | Implemented | |
| Top bar: breadcrumbs, global search, notifications, tasks, user menu | Implemented | |
| Workspace: title, explanation, primary actions, metrics, filters, tables, detail panels, status, activity | Implemented | |
| Responsive desktop / tablet / mobile | Implemented | No horizontal overflow on 39 checked routes at 390 px; tables stack into cards |
| Mobile-first inspections, QR access, incident reporting, action updates | Implemented | Large touch targets, single-column forms, camera-capable file inputs |

## Modules
| # | Requirement | Status | Notes |
|---|---|---|---|
| 1 | Dashboard: overall compliance, by branch, legal gaps, high risks, overdue/awaiting-verification actions, docs awaiting approval/review, expiring appointments/training, overdue inspections/maintenance, open incidents/findings, SDS status, drills, deadlines, activity | Implemented | All figures computed live from the records; every tile opens a filtered list |
| 2 | Document library: browse/search/filter all listed categories; full metadata incl. owner, revision, dates, approval, access class, file, history, related records | Implemented | Access classification is displayed but not enforced (no server) |
| 2 | Upload form with browser file selection | Partial | File chosen via the file picker; only the name and size are kept (clearly labelled "Local demo file") |
| 2 | Draft → Submit → Under Review → Approved → Issued; reject, return, resubmit, obsolete, archive; comments, timestamps, revision numbering, reminders; no overwriting | Implemented | Tested (Workflow B); returned drafts kept as "Superseded draft" |
| 3 | Legal register with all listed fields and all six statuses (N/A requires justification) | Implemented | Illustrative data, labelled "verify" throughout |
| 3 | Assess, record evidence, identify gaps, generate central action | Implemented | Tested (Workflow A) |
| 4 | Risk register with all listed fields; configurable matrix; create/edit; review; link legal/procedures/assets; actions for missing controls; upload existing assessments | Implemented | Matrix labels and band thresholds configurable; **matrix size fixed at 5×5** (Partial for size) |
| 5 | Employee/contractor register, branch allocation, roles | Implemented | |
| 5 | Legal appointments, letters, acceptance, validity/expiry | Implemented | |
| 5 | Training matrix, required courses by role, providers, attendance/certificates, induction/refresher, expiry reminders, gaps → actions | Implemented | Matrix cells open "record training" or "raise gap action" |
| 5 | Competency verification | Implemented | |
| 5 | Restricted medical fitness interface | Partial | Restricted by role in the UI (tested); client-side only, not real protection |
| 6A | Asset register, configurable types, serials, site/location, responsible, status, type-specific required documents, schedules, maintenance, defects, actions, history | Implemented | Different requirements per type (forklift vs vehicle, etc.) |
| 6A | Configurable asset type custom fields | Partial | Fields defined per type and shown on seeded assets; the Add-asset form does not yet capture them |
| 6A | QR identifier | Partial | Unique QR ID, mobile QR page and simulated scan dialog; the drawn code is a **simulated pattern, not scannable** |
| 6B | Planned maintenance, records, defects, owners, due dates, evidence, verification, return-to-service; critical defect → out of service | Implemented | Tested (Workflow D); return to service is blocked until verification |
| 6C | PPE types, requirements, issue records, replacement dates, inspections, replenishment | Implemented | |
| 6D | Chemical register incl. SDS, review dates, controls, PPE, risks, training, emergency; overdue SDS review + notification | Implemented | SDS review creates a new revision in Document Control (tested) |
| 6E | Emergency plans (linked to Document Control), contacts, assembly points, first aid, equipment, inspections, drills, results, findings, actions | Partial | All present and linked; contacts and assembly points are read-only (no edit form) |
| 7 | Incident reporting (all listed fields, four types), investigation, root cause, actions, reporting status, review & closure; links to risks/assets/procedures/training/actions | Implemented | Tested (Workflow E); photos kept as file names only |
| 8 | Audit programme, schedules, controlled template revisions, Pass/Fail/N/A, comments, photos, findings, inspector/reviewer, evidence, actions, history, reports | Implemented | Photos stored as file names only |
| 8 | Failed items generate central actions | Implemented | Tested |
| 8 | Printable controlled report: logo, title, doc no., revision, revision date, Page X of Y, details, results, findings, sign-off; header from approved template, not editable; history keeps template revision | Implemented | Verified via print-to-PDF: header and "Page X of Y" repeat on all 5 pages of a long report. Page numbers need a current Chromium-based browser (Chrome/Edge); other browsers print without them |
| 9 | One central register; actions from all 11 source types; all listed fields | Implemented | |
| 9 | Created → Assigned → Acknowledged → In Progress → Submitted → Verified → Closed; rejection; reopening; completion ≠ closure; verifier approves or returns | Implemented | Tested (rejection loop included) |
| 9 | Overdue escalation | Partial | Manual "Escalate" plus a seeded escalated example; automatic scheduled escalation needs a server |
| 10 | All 16 listed reports, from live data | Implemented | |
| 10 | Filters, branch comparison, printable, CSV export | Implemented | CSV export tested |
| 10 | Date ranges | Partial | Date range applies to incident trends and corrective-action performance; other reports show the current position |
| 11 | Task & notification centre with all 12 alert types, each linking to the record | Implemented | Alerts generated from the data by rule |
| 11 | Delivery channels | Partial | In-app only; email/SMS settings simulated |
| 12 | Organisations & sites, departments | Partial | View, add, select; no edit or delete |
| 12 | Users & roles, permission definitions | Partial | Change a user's role, permission matrix, role switching; no user creation with login. Client-side only, clearly labelled |
| 12 | Asset types & fields, document categories, inspection templates, risk matrix, training categories, priorities, review schedules, notification settings | Implemented | Templates: new revision + approval. Training: role requirement matrix editable |

## Cross-module links (section 6)
| Requirement | Status |
|---|---|
| Legal requirement ↔ evidence, procedures, risks, actions | Implemented |
| Risk ↔ legal, assets, procedures, controls, actions, incidents | Implemented |
| Procedure ↔ risk assessment, inspection checklist, training course | Implemented |
| Asset ↔ certificates, inspections, maintenance, defects, actions, history | Implemented |
| Incident ↔ investigation, risks, assets, procedures, training, actions | Implemented |
| Inspection finding → action linked to originating inspection | Implemented |
| Action keeps source, owner, evidence, verification decision, closure history | Implemented |
| Reports reflect linked records | Implemented |

## Required workflows (section 7) — automated test results
| Workflow | Status | Checks |
|---|---|---|
| A Compliance gap → verified → dashboard updated | Implemented | 9/9 pass |
| B Document approval incl. return for correction, revision history | Implemented | 7/7 pass |
| C Risk → missing control → action verified → risk reviewed | Implemented | 4/4 pass |
| D Asset inspection → fail → action → out of service → verified → history | Implemented | 8/8 pass |
| E Incident → investigation → root cause → actions verified → reporting | Implemented | 6/6 pass |
| F Branch selection, switching, comparison, return to organisation view | Implemented | 3/3 pass |
| G Task centre → complete activity → evidence → action → next review scheduled | Implemented | 7/7 pass |
| Validation, permissions, persistence, CSV, search, reset | Implemented | 8/8 pass |

## Functional expectations (section 9)
| Requirement | Status |
|---|---|
| Sidebar navigation, search & filters, working primary buttons, create/view/edit | Implemented |
| Form validation, file selection, approvals/rejections, status changes, linked records | Implemented |
| Notifications & overdue indicators, printable reports, responsive, persistence, reset, success/error feedback | Implemented |
| No dead buttons or empty pages | Implemented (89 routes smoke-tested; permission-restricted buttons are disabled with an explanation, not dead) |
| Simulated operations clearly labelled | Implemented |

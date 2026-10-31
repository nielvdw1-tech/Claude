# Requirements checklist — focused prototype

Scope agreed with the owner: **Document control with multi-person approval · Assets and inspections with corrective actions · Incident management.**

Status key:
- **Implemented:** works end to end and was tested.
- **Partial:** present but limited or simulated; the reason is given.
- **Not implemented**

"Tested" means one of the following:
- the automated browser test (`tests/workflows.test.js`, **106/106 passing**, no JavaScript errors);
- the route smoke test (77 routes plus a second organisation, no errors);
- the mobile layout check (31 routes at 390 px, no horizontal overflow).

## Document control
| Requirement | Status | Notes |
|---|---|---|
| Upload documents with browser file selection | Implemented | File content kept in browser storage (up to 20 MB) — production uses secure storage |
| View documents and files in the system | Implemented | PDFs rendered page by page, images and text shown; issued revision and draft open separately; demo records open a generated sample sheet (F1–F7). Word/Excel: no in-app preview yet |
| Document register: search, filter by category / status / branch / review date | Implemented | Includes an "Awaiting my approval" filter |
| Approval by a number of people, **in sequence** | Implemented | Ordered route; only the current approver can decide; tested with a 3-step route (A1–A8) |
| Default route per category, adjustable per document on submit | Implemented | Administration → Approval routes (A13) |
| Author cannot approve their own document; each approver once per route | Implemented | A12 |
| Return for correction (comment required) → revise & resubmit → route restarts at step 1 | Implemented | A6–A7; returned draft retained |
| Reject | Implemented | |
| Print documents | Implemented | Every page printed, stamped UNCONTROLLED WHEN PRINTED / DRAFT — NOT FOR USE with number, revision, printer and time; logged in the trail (G1–G5). The online preview link blocks printing; it works when opened from the folder (G6) |
| Issue for use; previous revision superseded; current issued revision stays in use while a new one is approved | Implemented | A9, A11 |
| Approval trail: every decision, comment, timestamp | Implemented | A10 |
| Tasks / notifications to the approver whose turn it is | Partial | In-app task list and notifications (A3); email simulated |
| Periodic review reminders, record review, obsolete, archive | Implemented | |

## Assets, inspections and corrective actions
| Requirement | Status | Notes |
|---|---|---|
| Load assets onto the system; asset types with required certificates | Implemented | |
| QR identifier and mobile asset page | Partial | Simulated QR pattern and scan dialog |
| Scheduled inspections against controlled, revisioned checklist templates | Implemented | Header locked; history keeps the template revision used |
| Pass / Fail / N/A, comments, photos | Implemented | Photos kept as file names only |
| Failed item → defect + corrective action | Implemented | C3 |
| Critical failure → asset out of service; return to service only after verification | Implemented | C3, C5, C8 |
| Defects reported directly (asset / QR page) | Implemented | C12 |
| Operators only report failures; a supervisor or manager reviews each defect and raises the corrective action, closes it as fixed on the spot (with evidence) or links it to an existing action; review period with escalation | Implemented | R1–R4, R10 |
| Corrective action workflow: Assigned → Acknowledged → In progress → Evidence → Submitted → Verified → Closed | Implemented | C6–C9 |
| Verifier can return insufficient evidence; completion ≠ closure | Implemented | C7 |
| Overdue tracking and escalation | Partial | Overdue flags plus manual escalation; automatic escalation needs a server |
| Printable controlled inspection report with Page X of Y | Implemented | Page numbers need Chrome or Edge |
| Maintenance scheduling and completion | Implemented | |

## Incident management
| Requirement | Status | Notes |
|---|---|---|
| Report incident (mobile-friendly), four incident types, injury details, photos | Implemented | D1 |
| Assign investigator; investigation and root-cause analysis | Implemented | D2–D3 |
| Corrective actions from the incident, tracked through verification | Implemented | D4, D6 |
| Closure only when all actions are verified | Implemented | D5, D7 |
| External reporting status | Implemented | Reportability is decided by a competent person |
| Incident trends in reporting | Implemented | D8 |
| Automatic escalation of incidents without an investigator or with an overdue investigation | Partial | R5–R6; checked when the system is opened (a server job in production) |
| Investigator corrects type and severity with a reason | Implemented | R7 |
| Effectiveness review after closure; "not effective" reopens the incident | Implemented | R8–R9 |
| Injury classification (first aid, medical treatment, restricted work, lost time, fatality) set by the HSEQ team from recorded facts; system suggestion, override with reason, reclassification history; required before closure; company-defined definitions | Implemented | J1–J8 |

## Supporting features
| Requirement | Status | Notes |
|---|---|---|
| Dashboard focused on the three areas; tiles open filtered records | Implemented | |
| Branch / organisation selection and comparison | Implemented | E1–E2 |
| Task centre per user | Implemented | E3 |
| Reports with print and CSV | Implemented | E9 |
| Safety Consultant has full access; Employee limited to QR inspections and incident reporting | Implemented | H1–H9 (client-side demonstration of the intended permissions) |
| Company notices (memos) to all staff or a branch, with optional attachment and read-and-understood acknowledgement; read/acknowledgement tracking | Implemented | N1–N7; reminders are in-app only (email/SMS simulated) |
| Incident safety alerts: draft notice created on each incident, published only after sequential approval by the HSEQ Manager and the Safety Consultant; approvers can edit or decline | Implemented | S1–S8 |
| Company branding: client company name and logo in the menu ("Powered by VDW HSEQ"); logo in the company block of document, checklist and report headers | Implemented | L1–L5; logo kept in browser storage in the prototype |
| Roles and permissions | Partial | Client-side demonstration only; production must enforce them on the server |
| Persistence and reset | Implemented | E8, E11 |
| Out-of-scope modules removed (legal, risk, people, PPE, chemicals, emergency, audits) | Implemented | E4–E5; preserved in git history (commit `26b59bc`) |

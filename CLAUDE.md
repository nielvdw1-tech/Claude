# VDW Compliance Control System — project notes

## Product purpose (from the owner)
This is a **compliance control system**. It helps companies:
1. **Know what they need to comply with** under the **Occupational Health and Safety Act 85 of 1993 and its relevant regulations** (South Africa).
2. **Stay compliant** over time.

Every feature should serve one of those two goals. Judge new work against this purpose.

## Current build focus (owner's decision)
Build only these parts for now. They are the owner's biggest need:
1. **Document control:** upload documents; approval by several people **in sequence** (an ordered route, each approver in turn); then issue, revisions and periodic review.
2. **Assets and inspections:** load assets, inspect them against checklists, turn failed items into defects and **corrective actions** with independent verification. A critical failure puts the asset out of service until the fix is verified.
3. **Incident management:** report, investigate, find the root cause, raise corrective actions and close.

The legal-library flow below is the longer-term vision and is **not** in the current build. The full HSEQ prototype with legal, risk, people, PPE, chemicals, emergency and audits is preserved in git history at commit `26b59bc`.

## Intended user flow (longer term)
1. A competent professional (e.g. a VDW safety consultant) identifies the applicable legislation by picking the Act or Regulations and ticking the sections and sub-regulations that apply. There is **no applicability questionnaire**: the professional knows what to select.
2. The system then works out what is required to **show compliance** (documents, appointments, training, certificates, inspections, records) and what is required to **maintain compliance** (recurring inspections, drills, reviews, renewals). It sets those up in the operational modules.
3. The operational side then runs: inspections, incident investigations, training, maintenance and corrective actions. That work feeds back live into the compliance status.

## Legal content rules
- Sub-regulations must show the **exact official wording** of the legislation. Never paraphrase it or write it from memory as if it were official. Load it from an official source (SAFLII, gov.za, Department of Employment and Labour) or from documents the owner provides.
- Keep the system's derived obligations clearly separate from the legal text, labelled as the system's interpretation.

## Repository layout
- `app/`, `supabase/`, root `index.html`: existing production application. Do not modify these unless asked.
- `prototype/`: standalone HTML/CSS/JS prototype of the full HSEQ system. See `prototype/README.md`. The tests are in `prototype/tests/workflows.test.js`.

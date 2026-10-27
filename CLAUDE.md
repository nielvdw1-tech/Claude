# VDW Compliance Control System — project notes

## Product purpose (from the owner)
This is a **compliance control system**. It helps companies:
1. **Know what they need to comply with** under the **Occupational Health and Safety Act 85 of 1993 and its relevant regulations** (South Africa).
2. **Stay compliant** over time.

Every feature should serve one of those two goals. Judge new work against this purpose.

## Intended user flow
1. A competent professional (e.g. a VDW safety consultant) identifies the applicable legislation by picking the Act or Regulations and ticking the sections and sub-regulations that apply. There is **no applicability questionnaire**: the professional knows what to select.
2. The system then works out what is required to **show compliance** (documents, appointments, training, certificates, inspections, records) and what is required to **maintain compliance** (recurring inspections, drills, reviews, renewals). It sets those up in the operational modules.
3. The operational side then runs: inspections, incident investigations, training, maintenance and corrective actions. That work feeds back live into the compliance status.

## Legal content rules
- Sub-regulations must show the **exact official wording** of the legislation. Never paraphrase it or write it from memory as if it were official. Load it from an official source (SAFLII, gov.za, Department of Employment and Labour) or from documents the owner provides.
- Keep the system's derived obligations clearly separate from the legal text, labelled as the system's interpretation.

## Repository layout
- `app/`, `supabase/`, root `index.html`: existing production application. Do not modify these unless asked.
- `prototype/`: standalone HTML/CSS/JS prototype of the full HSEQ system. See `prototype/README.md`. The tests are in `prototype/tests/workflows.test.js`.

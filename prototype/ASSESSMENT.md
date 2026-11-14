# Free Compliance Check: Review and Rebuild

## 1. Review of the current Zite assessment (vdwassessment.zite.so)

**How it works today**
1. **Intro page:** "Are You Safety Compliant — Or One Inspection Away from a Shutdown?" Fear-led: DOL fines "up to R50,000 per violation", Section 37 director liability, site shutdowns, lost contracts. Promises "2–3 minutes" and "instant results".
2. **Contact details first:** name, company, email, phone, industry (19 options) and number of employees (1–10 up to 100+), all before a single question is asked.
3. **18 Yes / No / N/A questions** in 5 sections: Policy & legal appointments (7), Risk management & training (4), First aid & emergency (4), Equipment (1) and Incident reporting (2). Each question has an OHS Act reference, a "what's missing" line, "why it matters" and a corrective action. There's also an optional voice-answer mode.
4. **Score** = Yes ÷ (questions answered, excluding N/A). Under 50% = High Risk, 50–79% = Moderate Risk, 80%+ = Lower Risk ("Full audit still required").
5. **Results page:** score, risk level, list of gaps, a "Book a Free Discovery Call with Niel" button and a feedback form. Behind the scenes it notifies VDW (`notifyAssessmentComplete`) and emails the visitor.

**What works well**
- The question content is strong. It's specific, references the right sections of the OHS Act and gives a clear fix for each gap. **We kept all 18 questions and their references, gaps and fixes.**
- Instant scoring with clear risk bands.
- The discovery call is the natural next step.

**What doesn't fit the new direction**
- **Wrong problem.** It's about a DOL inspector visiting one site. Your ideal client's problem is **client audits across multiple branches**, scattered documents and no visibility for the MD. None of the questions cover that.
- **Contact details before any questions.** Asking for name, email and phone first, before the visitor gets any value, usually loses a large share of people. It's better to ask once they've answered the questions and want their results.
- **Fear-heavy claims.** "R50,000 per violation" and shutdown warnings need to be checked against the current Act before they're used anywhere. The new site leads with control and confidence instead.
- **Mixed message.** The intro says results are instant, but also that assessments are "personally reviewed". Pick one.
- **Industries list** is broad (agriculture, education, healthcare and so on) rather than the suppliers you want to attract.
- **Separate look.** It uses different branding from the new site.

## 2. The new Multi-Branch Compliance Check (`assessment.html`)

**Flow:** intro → about your company (not personal details) → 5 question sections → contact details → instant results.

| Step | What's asked |
|---|---|
| About your company | Number of branches, employees, type of company (supplier-focused list) and whether clients audit you |
| 1. Central system & audit readiness *(new)* | 5 questions: one central place, one standard for all branches, documents within a day for a client, expiry tracking, MD reporting |
| 2. Policy & legal appointments | Original questions 1–7, reworded for "every branch" where relevant |
| 3. Risk management & training | Original questions 8–11 |
| 4. First aid & emergencies | Original questions 12–15 |
| 5. Equipment & incidents | Original questions 16–18 |
| Contact details | Name, role, company, phone, work email, and a consent tick box (POPIA) |

**Results:** overall score and the same risk bands as Zite, plus two new sub-scores (**Audit readiness** and **Legal compliance**), a score for each area, and every gap with its OHS Act reference, why it matters and how to fix it. It ends with a "Book a free 15-minute discovery call" button.

**Editing the questions:** all wording is in `assessment-data.js`. Change the text there and the page and scoring update automatically.

## 3. Before it can replace Zite

- [ ] **Connect a backend (most important).** Right now results show on screen but are **not sent anywhere**: VDW isn't notified and the visitor isn't emailed. The `submitResults` function in `assessment.js` already builds everything needed (contact details, company details, score, gaps and answers). It needs connecting to something that stores the lead and sends emails. The repo already uses Supabase for the Compliance Portal, which is one option.
- [ ] **Booking link.** The "Book My Discovery Call" button opens an email. A calendar booking link (such as Calendly or Microsoft Bookings) would convert better.
- [ ] **Check the legal wording** of the 18 original questions after the "every branch" edits.
- [ ] **Credentials.** The landing page now mentions your SAMTRAC, ISO 9001 Lead Auditor and ISO 31000 credentials, taken from the Zite intro. Confirm they're current.

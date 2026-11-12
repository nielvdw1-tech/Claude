# The Lantern Trail: start here

Hand this folder to Claude at the start of a new session, in your new `lantern-trail` repository.

## What's in this folder
- `index.html`: the original 56-night devotional (English, boy aged 5)
- `afrikaans.html`: *Die Lanternpad*, the same devotional in Afrikaans
- `girls.html`: the Starlight Edition (English, girl aged 7)
- `docs/PLAN.md`: product plan, every decision made so far, roadmap and open items
- `docs/CONTENT-GUIDE.md`: doctrine, the Five Lights, tone rules, age bands and review checklist
- `docs/content-model.ts`: the data format every devotional night is stored in
- `docs/schedule.ts`: which night a family sees (endless journey, plus Christmas and Easter by date). Tested.

## Message to Claude for the new session
"This is The Lantern Trail, a subscription devotional app for children aged 2–12, in English and
Afrikaans. Read START-HERE.md, docs/PLAN.md and docs/CONTENT-GUIDE.md first. We have finished
roadmap step 1 (foundations). Next is step 2: move these files into the repo structure, then build
the content engine (React + TypeScript + Vite PWA) that renders any night from content-model data,
with the Adventure and Starlight looks, and convert the existing 56 nights into the new format in
both languages. Rhema Bible Church's statement of faith still needs to go into Appendix A of the
content guide: I will paste it."

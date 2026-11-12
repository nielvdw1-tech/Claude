# The Lantern Trail (separate project)

> **This folder is a separate project.** It is not part of VDW Safety Consulting.
> Nothing in here is used by the VDW website or app, and nothing outside this folder belongs to
> The Lantern Trail. All Lantern Trail work stays inside `lantern-trail/`.

**The Lantern Trail** is a subscription bedtime-devotional app for children aged 2–12, in English and
Afrikaans. It helps children know God as their Father and live as a child of God and a friend of Jesus.

## Folder map
| Path | What it is |
|---|---|
| `docs/PLAN.md` | Product plan: decisions, roadmap, open items. **Read first.** |
| `docs/CONTENT-GUIDE.md` | Doctrine (Rhema Bible Church), the Five Lights, tone rules, age bands, review checklist |
| `docs/content-model.ts` | Data format for every devotional night |
| `docs/schedule.ts` | Which night a family sees: endless journey, plus Christmas and Easter by date (tested) |
| `prototypes/` | The three finished 56-night devotionals (English age 5, Afrikaans age 5, Starlight girl age 7) |
| `app/` | *(coming in roadmap step 2)* the app itself |

## Notes for future Claude sessions
- Work only inside this folder. Never change files outside `lantern-trail/`.
- The project owner is the wife of the repository owner, working here with his permission.
- Read `docs/PLAN.md` and `docs/CONTENT-GUIDE.md` before writing any code or content.
- When deploying, point the hosting at this folder (or `app/`) only, so the VDW site is never affected.

# The Lantern Trail app

React + TypeScript + Vite, installable as a web app (PWA). Content is loaded from `public/content/*.json`
in the shape defined in `src/lib/model.ts`.

## Commands
```bash
npm install
npm run dev              # local development
npm test                 # unit tests (schedule, personalisation, band fallback)
npm run build            # type-check and build to dist/
npm run content:convert  # regenerate public/content from ../prototypes
```

## How it fits together
| File | Job |
|---|---|
| `src/lib/model.ts` | Content types, pronoun/name personalisation, age → band, band/language fallback |
| `src/lib/schedule.ts` | Tonight's night: journey position, Christmas (ends 25 Dec) and Easter (ends Easter Sunday) by date |
| `src/lib/content.ts` | Loads the published trails |
| `src/lib/store.ts` | Family, children and progress (on the device for now; accounts come in roadmap step 3) |
| `src/lib/i18n.ts` | Screen text in English and Afrikaans |
| `src/lib/art.ts` | Scene illustrations, gems, hero art |
| `src/components/` | Home (tonight + map), NightView, Family (onboarding + family), Pages (guide + compass) |

Testing tip: add `?date=2026-12-20` to the URL to preview another day (for example, the Christmas trail).

## Content status
| Band | English | Afrikaans |
|---|---|---|
| 2–3 | – (shows 4–5) | – (shows 4–5) |
| 4–5 | 56 nights | 56 nights |
| 6–7 | 56 nights | – (shows 4–5) |
| 8–9 | – (shows 6–7) | – (shows 4–5) |
| 10–12 | – (shows 6–7) | – (shows 4–5) |

# The Lantern Trail: Product Plan

A monthly-subscription devotional app that helps parents (and, from 10, children on their own)
discover who God is and grow in relationship with Him: child of God, friend of Jesus.

## Decisions (agreed 12 November 2026)

| Topic | Decision |
|---|---|
| Name | **The Lantern Trail** |
| Languages at launch | **English and Afrikaans** |
| Age bands | **2–3, 4–5, 6–7, 8–9, 10–12** (10–12 are self-guided) |
| Child profile | Parent enters the child's **name, age and gender**. Gender sets he/she throughout. The parent then **picks a look**: *Adventure* or *Starlight* (one is suggested from the gender, and either can be chosen). |
| Pricing | **Family plan, up to 4 children: about US$3.99/month or US$29.99/year, 7-day free trial.** Local prices per country. |
| Doctrine | **Rhema Bible Church** statement of faith and the *rhema* teaching. See CONTENT-GUIDE.md: Trinity, Jesus God in the flesh, new birth, God as Father, open access through the cross, God speaks today, and obedience flowing from love, not fear. |
| Where the work lives | In this repository (the owner's husband's GitHub, with permission), **only inside the `lantern-trail/` folder**, on its own branch. One Claude account, no separate subscription. |
| Launch order | **Web first** (installable web app), then iPhone and Android |

## How the content never runs out

- **Journey trails** play in order and advance only when a night is completed. There are no
  calendar dates and no lost progress. After the last trail the cycle repeats, and we keep adding new trails.
- **Seasonal trails override by date:** Christmas runs 1–25 December, Easter runs from Palm Sunday to
  Easter Sunday. Then the journey resumes where it paused. (Logic and tests: `app/src/lib/schedule.ts`.)
- **One family position:** siblings hear the same Bible story each night, each in their own band.
- Content is published to the server, so new trails appear without an app update.

## Year 1 content shape

- About 47 weeks of journey trails (6 story nights + 1 campfire night a week), plus Christmas (25 nights)
  and Easter (8 nights).
- The existing 56 nights split into **Journey Trail 1** (the current Expeditions 1–6 and 8) and the
  start of the **Christmas Trail** (current Expedition 7, to be extended from 8 nights to 25).
- Launch minimum: **3 months of journey content in every band and both languages**, and the
  Christmas trail. Then stay at least 2 months ahead of the earliest subscriber.

## Technology

| Part | Choice |
|---|---|
| App | React + TypeScript (Vite), installable web app (PWA). Later wrapped with Capacitor for iPhone and Android. |
| Accounts, data, storage | Supabase (Auth, Postgres with row-level security, Storage, Edge Functions) |
| Web payments | Paddle as merchant of record: handles global tax and VAT. *Confirm South African seller support before setup.* |
| Store payments (later) | Apple and Google in-app purchase through RevenueCat, sharing one entitlement with web |
| Hosting | Static hosting (for example Cloudflare Pages or Vercel) |
| Content | Authored as structured files (`app/src/lib/model.ts`), validated, then published to Supabase |

## Roadmap

1. **Foundations:** project folder · content guide · content model · scheduling rules *(done)*
2. **Content engine:** one app that renders any night from data; the existing 56 nights converted; Adventure and Starlight looks *(done 12 November 2026)*
3. **Accounts:** sign-up, family and child profiles, onboarding, progress synced across devices
4. **Subscriptions:** trial, paywall, Paddle checkout and webhooks, entitlement checks
5. **Content scale-up:** Year 1 story plan, all five bands, both languages, review workflow
6. **App stores:** Capacitor build, RevenueCat, store listings and review
7. **Growth:** audio narration, bedtime reminders, parent dashboard, gift subscriptions

## Open items

- [x] Project location: the `lantern-trail/` folder in this repository *(decided 12 November 2026)*.
- [x] Doctrine: Rhema Bible Church statement of faith plus the *rhema* teaching *(Appendix A of the content guide)*.
- [ ] Never merge the Lantern Trail branch into the VDW site's main branch without checking how that site is
      hosted. If it is published straight from the repository, these files could become public.
- [ ] **Owner:** find a content reviewer (pastor or children's ministry leader).
- [ ] Confirm Paddle supports a South African seller, and its payout terms.
- [ ] Confirm which Afrikaans Bible translation may be quoted commercially.
- [ ] Owner accounts, when we reach each phase: Supabase, Paddle, domain, hosting; later Apple Developer and Google Play.
- [ ] Privacy policy and terms (children's privacy: COPPA, GDPR, POPIA). The parent owns the account, and we store only the child's first name, age and gender.

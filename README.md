# VDW Health & Safety Solutions — Website

A multi-page marketing site for VDW Health & Safety Solutions (vdwsafety.com), an
OHS compliance consultancy serving manufacturing, warehousing, and engineering
SMEs across Gauteng and Limpopo, South Africa.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Fonts:** Inter (body) + Playfair Display (headings)

## Pages

- `/` — Homepage
- `/services` — Detailed service breakdown
- `/free-assessment` — Standalone landing page for the free compliance assessment (no nav, single CTA)
- `/about` — About / credibility page
- `/contact` — Contact page with low-friction form

## Configuration

Site-wide constants (WhatsApp number, assessment link, contact email, services,
FAQs, etc.) live in `src/lib/data.ts`. Update `SITE.whatsappNumber` with the real
WhatsApp number before launch.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

```bash
npm run build
npm run start
```

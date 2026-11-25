# VDW website: test locally, then deploy to Vercel

The website is the `prototype/` folder. When someone completes the free compliance check, their
browser turns the results page into a PDF report, and `api/compliance-check.js` (a Vercel function)
emails it, with [Resend](https://resend.com), to you (with their contact details) and to the client.

**Booking calendar:** "Book a Consultation" buttons open `book.html`. Paste your Calendly,
Microsoft Bookings or Google Calendar booking link into `prototype/booking-config.js`, and the
calendar appears on that page.

## 1. Get the files on your computer

Download and unzip the project, or clone it from GitHub:

```bash
git clone https://github.com/nielvdw1-tech/Claude.git vdw-website
cd vdw-website
git checkout claude/loving-meitner-j13m5i
```

You need [Node.js](https://nodejs.org) (version 18 or newer) installed.

## 2. Quick look (pages only)

From the project folder:

```bash
npx serve prototype
```

Open the address it prints (usually http://localhost:3000). All pages work, but the free check
can't send emails this way (the email function only runs with `vercel dev`, below).

## 3. Full test, including the free check emails

1. Create a free account at https://resend.com and create an API key.
2. In the project folder, copy `.env.example` to `.env.local` and fill in:
   - `RESEND_API_KEY`: your key
   - `FROM_EMAIL`: leave as `onboarding@resend.dev` for now
   - `LEAD_TO_EMAIL`: the email you signed up to Resend with (the test sender can only send there)
3. Install the Vercel command-line tool and log in (free Vercel account, sign in with GitHub):

```bash
npm install -g vercel
```

```bash
vercel login
```

4. Start the local server:

```bash
vercel dev
```

When it asks to set up the project, accept the defaults. It reads `vercel.json`, so it serves
the `prototype` folder and the email function. Open http://localhost:3000, complete the free
check and confirm both emails arrive with the PDF report attached.

## 4. Deploy

1. Push or merge the changes to GitHub (pull request #2 into your main branch).
2. In Vercel: **Add New > Project**, import `nielvdw1-tech/Claude`. Framework preset: **Other**.
   Leave the root directory as the repository root; `vercel.json` already sets the output folder.
3. Under **Settings > Environment Variables**, add `RESEND_API_KEY`, `FROM_EMAIL` and `LEAD_TO_EMAIL`.
4. In Resend, **verify your domain** (vdwsafety.com) by adding the DNS records it gives you, then
   set `FROM_EMAIL` to something like `VDW Health & Safety Solutions <check@vdwsafety.com>`.
   Until then visitors won't receive their copy, because the test sender can only email you.
5. In Vercel, **Settings > Domains**, add `vdwsafety.com` and `www.vdwsafety.com`, and add the
   DNS records Vercel shows at your domain registrar. Only change the website records: don't
   touch the MX records, or your niel@vdwsafety.com email will stop working.
6. Redeploy, then complete the free check on the live site to confirm the email arrives.

Every push to the main branch after that updates the live site automatically.

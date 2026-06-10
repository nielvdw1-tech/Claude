# VDW Compliance Control System - Database (Phase 1)

This directory contains the Postgres schema for migrating the system off
the browser-localStorage mock DB (`app/js/db.js`) onto a real
[Supabase](https://supabase.com) project (managed Postgres + Auth + Storage).

This is **Phase 1 only**: schema + Row Level Security. The frontend has not
been changed yet and still runs on localStorage.

## Files

- `schema.sql` - tables for clients, branches, profiles (users), inspection
  templates/questions, assets, inspections, inspection items, corrective
  actions, documents and notifications. Mirrors the shape of the data in
  `app/js/db.js`'s `seedData()`.
- `policies.sql` - Row Level Security policies that enforce the
  Owner / Admin / Manager scoping the frontend currently does client-side
  (Owner = everything, Admin = own client, Manager = own branch).
- `seed.sql` - the same demo clients/branches/templates/assets currently
  hardcoded in `seedData()`, for testing against a fresh project.

## Setup (one-time)

1. Create a project at supabase.com (free tier is fine to start).
2. In the SQL Editor, run in order:
   ```
   schema.sql
   policies.sql
   seed.sql   (optional - demo data for testing)
   ```
3. Create the real users via **Authentication > Users > Add user** (or the
   `supabase.auth.admin.createUser` API), then insert a matching row into
   `profiles` with the correct `role`, `client_id`, and `branch_id`.

## Why `profiles` instead of a `users` table

Supabase Auth manages `auth.users` (email, hashed password, sessions) for
you - that's the real authentication Phase 2 will wire up. `profiles` is a
1:1 extension table (same `id`, a `uuid`) that stores only the
app-specific fields the frontend needs: `full_name`, `role`, `client_id`,
`branch_id`, `active`, `last_login`.

Anywhere the current frontend stores a numeric `user.id` (e.g.
`branches.manager_id`, `inspections.inspector_id`,
`corrective_actions.assigned_to`, `documents.uploaded_by`), this schema
uses a `uuid` referencing `profiles.id` instead.

## What's NOT done yet (later phases)

- **Phase 2 - Auth**: wire up Supabase Auth in `login.js` / `db.js`'s
  `Auth` object, replace the hardcoded demo passwords.
- **Phase 3 - Data layer**: rewrite `DB.getAll/getById/query/insert/update/remove`
  in `db.js` to call `supabase.from(...)` instead of localStorage, and make
  the calling views `async`.
- **Phase 4 - File storage**: move `documents.file_url`, `corrective_actions.evidence`,
  `inspection_items.photo` and `clients.logo_url` from base64 data URLs to
  Supabase Storage buckets.
- **Phase 5 - Hosting**: deploy the static frontend (Netlify/Vercel/Cloudflare
  Pages) pointed at this Supabase project.
- **Phase 6 - Real data migration**: replace `seed.sql` demo data with your
  actual clients/branches/assets/users.

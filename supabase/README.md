# VDW Compliance Control System - Database (Phases 1-3)

This directory contains the Postgres schema for migrating the system off
the browser-localStorage mock DB onto a real [Supabase](https://supabase.com)
project (managed Postgres + Auth). The frontend (`app/js/db.js` and friends)
now reads/writes Supabase directly - **you need to create a Supabase project
and fill in your credentials before the app will work**.

## Files

- `schema.sql` - tables for clients, branches, profiles (users), inspection
  templates/questions, assets, inspections, inspection items, corrective
  actions, documents and notifications, plus a trigger that auto-creates a
  `profiles` row whenever a new user is added in Supabase Auth.
- `policies.sql` - Row Level Security policies that enforce the
  Owner / Admin / Manager scoping the frontend currently does client-side
  (Owner = everything, Admin = own client, Manager = own branch), plus
  narrow anonymous-access policies for the public QR-code inspection flow.
- `seed.sql` - demo clients/branches/templates/assets, for testing against a
  fresh project.

## Setup (one-time)

1. Create a project at [supabase.com](https://supabase.com) (free tier is
   fine to start).
2. In the SQL Editor, run in order:
   ```
   schema.sql
   policies.sql
   seed.sql   (optional - demo data for testing)
   ```
3. Get your API credentials from **Project Settings > API**:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon public** key (a long JWT string)
4. Open `app/js/supabaseClient.js` and replace the placeholder values:
   ```js
   window.SUPABASE_CONFIG = {
     url: 'https://YOUR-PROJECT-REF.supabase.co',
     anonKey: 'YOUR-ANON-PUBLIC-KEY'
   };
   ```
   The anon key is safe to commit/expose in client-side code - Row Level
   Security policies (`policies.sql`) control what each signed-in user can
   actually read or write.
5. Create your real users via **Authentication > Users > Add user** (set
   their email + a temporary password). The `on_auth_user_created` trigger
   in `schema.sql` automatically creates a matching `profiles` row with the
   `Manager` role and no client/branch assigned.
6. Sign in to the app as the first user, go to **Settings > System** and
   click **Reload Data from Database**, then go to **User Management** and
   edit each new user's role/client/branch. (To make the very first user an
   `Owner`, run a one-off update in the SQL Editor:
   `update public.profiles set role = 'Owner', client_id = null, branch_id = null where email = '...';`)

## Why `profiles` instead of a `users` table

Supabase Auth manages `auth.users` (email, hashed password, sessions) for
you. `profiles` is a 1:1 extension table (same `id`, a `uuid`) that stores
only the app-specific fields the frontend needs: `full_name`, `role`,
`client_id`, `branch_id`, `active`, `last_login`. The frontend exposes this
table as `DB.getAll('users')` / `DB.getById('users', id)` for backward
compatibility.

Anywhere the frontend stores a `user.id` (e.g. `branches.manager_id`,
`inspections.inspector_id`, `corrective_actions.assigned_to`,
`documents.uploaded_by`), this schema uses a `uuid` referencing
`profiles.id`.

## How the frontend talks to Supabase (Phases 2 & 3)

- `app/js/supabaseClient.js` creates the Supabase client (`window.sb`) from
  `SUPABASE_CONFIG`.
- `DB.load()` (called on app startup and after login/logout) fetches all
  tables in parallel into an in-memory cache (`DB.data`), respecting RLS for
  the current user. `DB.getAll/getById/query` remain **synchronous** reads
  over this cache, so the ~15 view files didn't need a full rewrite.
- `DB.insert/update/remove` are now **async** - they write to Supabase first,
  then patch the local cache from the server's response.
- `Auth.login/logout` use Supabase Auth (`signInWithPassword`/`signOut`).
  `Auth.restoreSession()` re-hydrates the signed-in user on page reload.
- `Automations.*` (inspection start/complete, corrective action creation,
  overdue checks) are now async since they call `DB.insert/update`
  internally.

## Known limitations / what's still manual

- **Adding users**: must be done via the Supabase dashboard
  (Authentication > Users), not the in-app "Add User" button - creating an
  Auth user requires the service-role key, which must never be shipped to
  the browser. The in-app form now only edits existing profiles
  (role/client/branch/active).
- **Password resets**: not wired up yet - use Supabase's dashboard or
  built-in password-reset email flow.
- **"Reset Demo Data"**: removed (can't safely reset a shared Postgres DB
  from the browser). Use **Settings > Reload Data from Database** to refresh
  the local cache instead, or re-run `seed.sql` in the SQL Editor.

## What's NOT done yet (later phases)

- **Phase 4 - File storage**: move `documents.file_url`,
  `corrective_actions.evidence`, `inspection_items.photo` and
  `clients.logo_url` from base64 data URLs to Supabase Storage buckets.
- **Phase 5 - Hosting**: deploy the static frontend (Netlify/Vercel/Cloudflare
  Pages) pointed at this Supabase project.
- **Phase 6 - Real data migration**: replace `seed.sql` demo data with your
  actual clients/branches/assets/users.

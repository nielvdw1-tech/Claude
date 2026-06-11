-- =====================================================================
-- VDW Compliance Control System - Supabase/Postgres Schema (Phase 1)
-- =====================================================================
-- This schema replaces the localStorage-based mock DB in app/js/db.js.
-- Run this against a fresh Supabase project (SQL Editor or `supabase db push`).
--
-- Design notes:
--  - `profiles` extends Supabase's built-in `auth.users` (1:1, same uuid).
--    Real authentication (passwords, sessions) is handled by Supabase Auth;
--    this table only stores app-specific role/scope data.
--  - All other tables keep simple bigint identity ids, matching the
--    numeric ids used throughout the existing frontend code.
--  - Row Level Security (RLS) enforces the Owner/Admin/Manager scoping
--    that the frontend currently only enforces client-side.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. CLIENTS
-- ---------------------------------------------------------------------
create table public.clients (
  id              bigint generated always as identity primary key,
  client_name     text not null,
  client_code     text not null unique,
  contact_person  text,
  contact_email   text,
  contact_phone   text,
  contract_end_date date,
  logo_url        text,
  status          text not null default 'Active' check (status in ('Active','Inactive')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. BRANCHES
-- ---------------------------------------------------------------------
-- manager_id -> profiles(id) is added via ALTER TABLE after profiles exists
-- (avoids a circular forward-reference between branches and profiles).
create table public.branches (
  id              bigint generated always as identity primary key,
  client_id       bigint not null references public.clients(id) on delete cascade,
  branch_name     text not null,
  branch_code     text not null,
  address         text,
  region          text,
  manager_id      uuid,
  status          text not null default 'Active' check (status in ('Active','Inactive')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (client_id, branch_code)
);

-- ---------------------------------------------------------------------
-- 3. PROFILES (extends auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null unique,
  role        text not null check (role in ('Owner','Admin','Manager')),
  client_id   bigint references public.clients(id) on delete set null,
  branch_id   bigint references public.branches(id) on delete set null,
  active      boolean not null default true,
  last_login  timestamptz,
  created_at  timestamptz not null default now()
);

alter table public.branches
  add constraint branches_manager_id_fkey
  foreign key (manager_id) references public.profiles(id) on delete set null;

-- ---------------------------------------------------------------------
-- 4. INSPECTION TEMPLATES (global, shared across clients)
-- ---------------------------------------------------------------------
create table public.inspection_templates (
  id                    bigint generated always as identity primary key,
  template_name         text not null,
  asset_type            text not null,
  inspection_frequency  integer not null default 30, -- days
  active                boolean not null default true,
  created_at            timestamptz not null default now()
);

create table public.template_questions (
  id                          bigint generated always as identity primary key,
  template_id                 bigint not null references public.inspection_templates(id) on delete cascade,
  question_text               text not null,
  category                     text,
  legal_reference              text,
  risk_level                   text check (risk_level in ('Low','Medium','High','Critical')),
  default_corrective_action    text,
  photo_required               boolean not null default false,
  critical                     boolean not null default false,
  weight                       integer not null default 1,
  active                       boolean not null default true
);

-- ---------------------------------------------------------------------
-- 5. ASSETS
-- ---------------------------------------------------------------------
create table public.assets (
  id                     bigint generated always as identity primary key,
  asset_name             text not null,
  asset_tag              text not null,
  serial_number          text,
  asset_type             text not null,
  client_id              bigint not null references public.clients(id) on delete cascade,
  branch_id              bigint not null references public.branches(id) on delete cascade,
  template_id            bigint references public.inspection_templates(id) on delete set null,
  location_description   text,
  qr_code_url            text,
  status                 text not null default 'Active' check (status in ('Active','Inactive','Decommissioned')),
  last_inspection_date   date,
  next_inspection_date   date,
  compliance_status      text not null default 'Pending' check (compliance_status in ('Compliant','Non-Compliant','Pending')),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (client_id, asset_tag)
);

-- ---------------------------------------------------------------------
-- 6. INSPECTIONS
-- ---------------------------------------------------------------------
create table public.inspections (
  id                  bigint generated always as identity primary key,
  inspection_number   text not null unique,
  asset_id            bigint not null references public.assets(id) on delete cascade,
  branch_id           bigint not null references public.branches(id) on delete cascade,
  client_id           bigint not null references public.clients(id) on delete cascade,
  inspector_id        uuid references public.profiles(id) on delete set null,
  inspector_name      text, -- fallback for public/anonymous QR inspections
  inspection_date     date not null default current_date,
  completion_date     date,
  due_date            date not null,
  status              text not null default 'In Progress' check (status in ('Draft','In Progress','Completed','Overdue')),
  total_items         integer not null default 0,
  pass_count          integer not null default 0,
  fail_count          integer not null default 0,
  compliance_score    integer,
  items_created       boolean not null default false,
  completed           boolean not null default false,
  created_at          timestamptz not null default now()
);

create table public.inspection_items (
  id                          bigint generated always as identity primary key,
  inspection_id               bigint not null references public.inspections(id) on delete cascade,
  asset_id                    bigint not null references public.assets(id) on delete cascade,
  template_question_id        bigint references public.template_questions(id) on delete set null,
  question_text               text not null,
  category                     text,
  legal_reference              text,
  result                       text check (result in ('Pass','Fail')),
  comment                      text default '',
  photo                        text, -- data URL or storage path
  score_value                  integer not null default 1,
  corrective_action_required   boolean not null default false,
  corrective_action_created    boolean not null default false,
  completed                    boolean not null default false,
  created_at                   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. CORRECTIVE ACTIONS (CARs)
-- ---------------------------------------------------------------------
create table public.corrective_actions (
  id                  bigint generated always as identity primary key,
  car_number          text not null unique,
  inspection_id       bigint references public.inspections(id) on delete set null,
  inspection_item_id  bigint references public.inspection_items(id) on delete set null,
  asset_id            bigint not null references public.assets(id) on delete cascade,
  assigned_to         uuid references public.profiles(id) on delete set null,
  priority            text not null check (priority in ('Critical','High','Medium','Low')),
  issue_description   text not null,
  corrective_action   text,
  due_date            date not null,
  completion_date     date,
  status              text not null default 'Open' check (status in ('Open','In Progress','Overdue','Closed')),
  evidence            text, -- data URL or storage path
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8. DOCUMENTS
-- ---------------------------------------------------------------------
create table public.documents (
  id              bigint generated always as identity primary key,
  document_name   text not null,
  document_type   text not null,
  file_url        text not null, -- Supabase Storage path/URL
  asset_id        bigint references public.assets(id) on delete cascade,
  inspection_id   bigint references public.inspections(id) on delete set null,
  expiry_date     date,
  uploaded_by     uuid references public.profiles(id) on delete set null,
  uploaded_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 9. NOTIFICATIONS (reserved for future use)
-- ---------------------------------------------------------------------
create table public.notifications (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  message     text not null,
  link        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------
create index on public.branches (client_id);
create index on public.profiles (client_id);
create index on public.profiles (branch_id);
create index on public.assets (client_id);
create index on public.assets (branch_id);
create index on public.inspections (asset_id);
create index on public.inspections (branch_id);
create index on public.inspections (client_id);
create index on public.inspection_items (inspection_id);
create index on public.corrective_actions (asset_id);
create index on public.corrective_actions (status);
create index on public.documents (asset_id);
create index on public.template_questions (template_id);

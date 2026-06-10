-- =====================================================================
-- VDW Compliance Control System - Row Level Security (Phase 1)
-- =====================================================================
-- Run after schema.sql. Enforces the same Owner/Admin/Manager scoping
-- the frontend currently does client-side, at the database level.
--
--   Owner   - full access to everything
--   Admin   - full access scoped to their own client_id
--   Manager - full access scoped to their own branch_id (read access to
--             their client's other branches where noted)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper functions (security definer = bypass RLS on profiles to avoid
-- infinite recursion when policies query profiles for the current user)
-- ---------------------------------------------------------------------
create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.current_client_id()
returns bigint language sql stable security definer set search_path = public as $$
  select client_id from profiles where id = auth.uid();
$$;

create or replace function public.current_branch_id()
returns bigint language sql stable security definer set search_path = public as $$
  select branch_id from profiles where id = auth.uid();
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role() = 'Owner', false);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role() = 'Admin', false);
$$;

create or replace function public.is_manager()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role() = 'Manager', false);
$$;

-- ---------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------
alter table public.clients enable row level security;
alter table public.branches enable row level security;
alter table public.profiles enable row level security;
alter table public.inspection_templates enable row level security;
alter table public.template_questions enable row level security;
alter table public.assets enable row level security;
alter table public.inspections enable row level security;
alter table public.inspection_items enable row level security;
alter table public.corrective_actions enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;

-- ---------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------
-- Everyone can read their own profile; Owner/Admin can read all/scoped.
create policy profiles_select on public.profiles for select using (
  id = auth.uid()
  or public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id())
);

-- Only Owner/Admin can create or edit users; Admin limited to own client
-- and cannot grant the Owner role.
create policy profiles_insert on public.profiles for insert with check (
  public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id() and role <> 'Owner')
);

create policy profiles_update on public.profiles for update using (
  id = auth.uid()
  or public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id())
) with check (
  public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id() and role <> 'Owner')
  or id = auth.uid()
);

create policy profiles_delete on public.profiles for delete using (
  public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id())
);

-- ---------------------------------------------------------------------
-- CLIENTS
-- ---------------------------------------------------------------------
create policy clients_select on public.clients for select using (
  public.is_owner()
  or id = public.current_client_id()
);

create policy clients_insert on public.clients for insert with check (
  public.is_owner()
);

create policy clients_update on public.clients for update using (
  public.is_owner()
  or (public.is_admin() and id = public.current_client_id())
);

create policy clients_delete on public.clients for delete using (
  public.is_owner()
);

-- ---------------------------------------------------------------------
-- BRANCHES
-- ---------------------------------------------------------------------
create policy branches_select on public.branches for select using (
  public.is_owner()
  or client_id = public.current_client_id()
  or id = public.current_branch_id()
);

create policy branches_insert on public.branches for insert with check (
  public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id())
);

create policy branches_update on public.branches for update using (
  public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id())
);

create policy branches_delete on public.branches for delete using (
  public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id())
);

-- ---------------------------------------------------------------------
-- INSPECTION TEMPLATES & QUESTIONS (global, Owner/Admin managed)
-- ---------------------------------------------------------------------
create policy templates_select on public.inspection_templates for select using (true);
create policy templates_write on public.inspection_templates for all using (
  public.is_owner() or public.is_admin()
) with check (
  public.is_owner() or public.is_admin()
);

create policy questions_select on public.template_questions for select using (true);
create policy questions_write on public.template_questions for all using (
  public.is_owner() or public.is_admin()
) with check (
  public.is_owner() or public.is_admin()
);

-- ---------------------------------------------------------------------
-- ASSETS
-- ---------------------------------------------------------------------
create policy assets_select on public.assets for select using (
  public.is_owner()
  or client_id = public.current_client_id()
  or branch_id = public.current_branch_id()
);

create policy assets_insert on public.assets for insert with check (
  public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id())
  or (public.is_manager() and branch_id = public.current_branch_id())
);

create policy assets_update on public.assets for update using (
  public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id())
  or (public.is_manager() and branch_id = public.current_branch_id())
);

create policy assets_delete on public.assets for delete using (
  public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id())
);

-- ---------------------------------------------------------------------
-- INSPECTIONS
-- ---------------------------------------------------------------------
create policy inspections_select on public.inspections for select using (
  public.is_owner()
  or client_id = public.current_client_id()
  or branch_id = public.current_branch_id()
);

create policy inspections_insert on public.inspections for insert with check (
  public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id())
  or (public.is_manager() and branch_id = public.current_branch_id())
);

create policy inspections_update on public.inspections for update using (
  public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id())
  or (public.is_manager() and branch_id = public.current_branch_id())
);

create policy inspections_delete on public.inspections for delete using (
  public.is_owner()
  or (public.is_admin() and client_id = public.current_client_id())
);

-- ---------------------------------------------------------------------
-- INSPECTION ITEMS (scoped via parent inspection)
-- ---------------------------------------------------------------------
create policy inspection_items_select on public.inspection_items for select using (
  public.is_owner()
  or exists (
    select 1 from public.inspections i
    where i.id = inspection_id
      and (i.client_id = public.current_client_id() or i.branch_id = public.current_branch_id())
  )
);

create policy inspection_items_write on public.inspection_items for all using (
  public.is_owner()
  or exists (
    select 1 from public.inspections i
    where i.id = inspection_id
      and (
        (public.is_admin() and i.client_id = public.current_client_id())
        or (public.is_manager() and i.branch_id = public.current_branch_id())
      )
  )
) with check (
  public.is_owner()
  or exists (
    select 1 from public.inspections i
    where i.id = inspection_id
      and (
        (public.is_admin() and i.client_id = public.current_client_id())
        or (public.is_manager() and i.branch_id = public.current_branch_id())
      )
  )
);

-- ---------------------------------------------------------------------
-- CORRECTIVE ACTIONS (scoped via parent asset)
-- ---------------------------------------------------------------------
create policy cars_select on public.corrective_actions for select using (
  public.is_owner()
  or exists (
    select 1 from public.assets a
    where a.id = asset_id
      and (a.client_id = public.current_client_id() or a.branch_id = public.current_branch_id())
  )
);

create policy cars_write on public.corrective_actions for all using (
  public.is_owner()
  or exists (
    select 1 from public.assets a
    where a.id = asset_id
      and (
        (public.is_admin() and a.client_id = public.current_client_id())
        or (public.is_manager() and a.branch_id = public.current_branch_id())
      )
  )
) with check (
  public.is_owner()
  or exists (
    select 1 from public.assets a
    where a.id = asset_id
      and (
        (public.is_admin() and a.client_id = public.current_client_id())
        or (public.is_manager() and a.branch_id = public.current_branch_id())
      )
  )
);

-- ---------------------------------------------------------------------
-- DOCUMENTS (scoped via parent asset; client-wide docs have asset_id null)
-- ---------------------------------------------------------------------
create policy documents_select on public.documents for select using (
  public.is_owner()
  or asset_id is null
  or exists (
    select 1 from public.assets a
    where a.id = asset_id
      and (a.client_id = public.current_client_id() or a.branch_id = public.current_branch_id())
  )
);

create policy documents_write on public.documents for all using (
  public.is_owner()
  or asset_id is null
  or exists (
    select 1 from public.assets a
    where a.id = asset_id
      and (
        (public.is_admin() and a.client_id = public.current_client_id())
        or (public.is_manager() and a.branch_id = public.current_branch_id())
      )
  )
) with check (
  public.is_owner()
  or asset_id is null
  or exists (
    select 1 from public.assets a
    where a.id = asset_id
      and (
        (public.is_admin() and a.client_id = public.current_client_id())
        or (public.is_manager() and a.branch_id = public.current_branch_id())
      )
  )
);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS (own only)
-- ---------------------------------------------------------------------
create policy notifications_select on public.notifications for select using (
  user_id = auth.uid() or public.is_owner()
);

create policy notifications_update on public.notifications for update using (
  user_id = auth.uid()
);

create policy notifications_insert on public.notifications for insert with check (true);

-- ---------------------------------------------------------------------
-- ANONYMOUS QR-CODE INSPECTION FLOW
-- ---------------------------------------------------------------------
-- The /start-inspection/:id and /inspections/:id/form routes are public
-- (no login) so that anyone scanning an asset's QR code can run an
-- inspection. Grant the anon role narrow access for that flow only.
grant select on public.assets to anon;
grant update (last_inspection_date, next_inspection_date, compliance_status, updated_at) on public.assets to anon;
grant select, insert, update on public.inspections, public.inspection_items to anon;
grant insert on public.corrective_actions to anon;
grant usage on schema public to anon;
grant usage, select on all sequences in schema public to anon;

create policy assets_select_anon on public.assets for select to anon using (true);
create policy assets_update_anon on public.assets for update to anon using (true);

create policy inspections_anon_select on public.inspections for select to anon using (true);
create policy inspections_anon_insert on public.inspections for insert to anon with check (inspector_id is null);
create policy inspections_anon_update on public.inspections for update to anon using (inspector_id is null);

create policy inspection_items_anon_select on public.inspection_items for select to anon using (true);
create policy inspection_items_anon_insert on public.inspection_items for insert to anon with check (true);
create policy inspection_items_anon_update on public.inspection_items for update to anon using (true);

create policy cars_anon_insert on public.corrective_actions for insert to anon with check (assigned_to is null);

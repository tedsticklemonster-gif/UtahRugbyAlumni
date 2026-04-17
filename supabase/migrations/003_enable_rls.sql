-- 003_enable_rls.sql
-- Row-Level Security policies for all tables.

-- ============================================================
-- Enable RLS
-- ============================================================

alter table alumni enable row level security;
alter table email_sends enable row level security;
alter table forward_tokens enable row level security;

-- ============================================================
-- Helper: check if current user is an admin
-- ============================================================

create or replace function is_admin()
returns boolean as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$ language sql security definer;

-- ============================================================
-- alumni policies
-- ============================================================

-- Anon: read only visible+verified rows.
-- Columns are restricted by the alumni_public view; this policy
-- is a defense-in-depth safety net.
create policy "Public read visible verified alumni"
  on alumni for select to anon
  using (directory_visible = true and verified = true);

-- Authenticated: read visible+verified rows, own row, or everything if admin.
create policy "Authenticated read alumni"
  on alumni for select to authenticated
  using (
    is_admin()
    or (directory_visible = true and verified = true)
    or (email = auth.jwt() ->> 'email')
  );

-- No direct INSERT from anon — use register_alumni RPC (see 004).

-- Authenticated non-admin: update own row only (matched by email).
create policy "Alumni update own row"
  on alumni for update to authenticated
  using (email = auth.jwt() ->> 'email')
  with check (email = auth.jwt() ->> 'email');

-- Admin: update any row.
create policy "Admin update any alumni"
  on alumni for update to authenticated
  using (is_admin())
  with check (is_admin());

-- Admin: delete any row.
create policy "Admin delete alumni"
  on alumni for delete to authenticated
  using (is_admin());

-- Admin: insert (CSV import, manual add).
create policy "Admin insert alumni"
  on alumni for insert to authenticated
  with check (is_admin());

-- ============================================================
-- email_sends policies (admin only)
-- ============================================================

create policy "Admin full access email_sends"
  on email_sends for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- forward_tokens policies
-- ============================================================

-- Public: read tokens for validation on /forward/[token].
create policy "Public read forward_tokens"
  on forward_tokens for select to anon
  using (true);

-- Authenticated: read tokens.
create policy "Authenticated read forward_tokens"
  on forward_tokens for select to authenticated
  using (true);

-- Admin: full access (create tokens, update attribution).
create policy "Admin full access forward_tokens"
  on forward_tokens for all to authenticated
  using (is_admin())
  with check (is_admin());

-- 011_directory_visibility.sql
-- Loosen directory visibility so self-registered (but not-yet-verified) alumni
-- are discoverable. The `verified` flag remains a trust indicator surfaced in
-- the UI, but isn't a gate on showing up.

-- Drop and replace anon SELECT policy
drop policy if exists "Public read visible verified alumni" on alumni;
create policy "Public read visible discoverable alumni"
  on alumni for select to anon
  using (
    directory_visible = true
    and status in ('self_registered', 'imported')
  );

-- Drop and replace authenticated SELECT policy
drop policy if exists "Authenticated read alumni" on alumni;
create policy "Authenticated read alumni"
  on alumni for select to authenticated
  using (
    is_admin()
    or (directory_visible = true and status in ('self_registered', 'imported'))
    or (email = auth.jwt() ->> 'email')
  );

-- Rebuild alumni_public view without the verified gate
drop view if exists alumni_public;
create view alumni_public as
  select
    id,
    first_name,
    last_name,
    grad_year,
    position,
    profession,
    company,
    city,
    state,
    verified
  from alumni
  where directory_visible = true
    and status in ('self_registered', 'imported');

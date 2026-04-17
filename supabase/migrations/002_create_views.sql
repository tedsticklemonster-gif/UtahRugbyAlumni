-- 002_create_views.sql
-- Public directory view: restricts columns visible to anonymous/public users.
-- Email, phone, photo_url, linkedin_url, bio are NEVER exposed here.

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
    state
  from alumni
  where directory_visible = true
    and verified = true;

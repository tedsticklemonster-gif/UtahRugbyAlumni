-- 012_professional_fields.sql
-- Add professional-availability fields so the directory can act as a
-- hire-me / hire-them network. All additive, nullable, safe to apply.

alter table alumni
  add column if not exists availability text
    check (
      availability in (
        'employed',
        'self_employed',
        'open_to_work',
        'looking_for_work',
        'student',
        'retired',
        'not_specified'
      )
    )
    default 'not_specified';

alter table alumni
  add column if not exists hiring boolean default false;

alter table alumni
  add column if not exists services text[];

alter table alumni
  add column if not exists industries text[];

alter table alumni
  add column if not exists years_experience int
    check (years_experience is null or (years_experience >= 0 and years_experience <= 80));

alter table alumni
  add column if not exists willing_to_mentor boolean default false;

alter table alumni
  add column if not exists website_url text;

alter table alumni
  add column if not exists instagram_handle text;

alter table alumni
  add column if not exists last_active_at timestamptz;

-- Indexes for directory rail filters
create index if not exists idx_alumni_availability on alumni (availability) where directory_visible = true;
create index if not exists idx_alumni_hiring on alumni (hiring) where directory_visible = true and hiring = true;
create index if not exists idx_alumni_willing_to_mentor on alumni (willing_to_mentor) where directory_visible = true and willing_to_mentor = true;

-- GIN indexes for array filters
create index if not exists idx_alumni_services_gin on alumni using gin (services);
create index if not exists idx_alumni_industries_gin on alumni using gin (industries);

-- Rebuild alumni_public to expose the new non-sensitive signals.
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
    verified,
    availability,
    hiring,
    services,
    industries,
    years_experience,
    willing_to_mentor,
    website_url,
    instagram_handle
  from alumni
  where directory_visible = true
    and status in ('self_registered', 'imported');

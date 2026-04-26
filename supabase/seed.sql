-- Seed file for local dev / staging.
-- Run after migrations: supabase db reset (which runs migrations then this file).
-- Uses fixed UUIDs so re-seeding is idempotent.

-- ─── Test alumni ─────────────────────────────────────────────────────────────

insert into alumni (
  id, first_name, last_name, email, grad_year, position,
  profession, job_title, company, city, state,
  bio, status, directory_visible, verified,
  availability, hiring, willing_to_mentor,
  services, industries, years_experience,
  website_url, instagram_handle
)
values

-- Verified admin (hiring)
(
  '00000000-0000-0000-0000-000000000001',
  'Moose', 'Christensen', 'moose@utah-rugby.com', 2004, 'prop',
  'Construction', 'Owner', 'Tuff & Co', 'Salt Lake City', 'UT',
  'Played at Utah 2001–2004. Started a construction company after graduation — always looking for hard workers.',
  'self_registered', true, true,
  'open_to_work', true, true,
  array['General Contracting', 'Project Management', 'Commercial Build-out'],
  array['Construction', 'Real Estate'],
  20,
  'https://tuffandco.com', 'tuffandco'
),

-- Open to work, mentor
(
  '00000000-0000-0000-0000-000000000002',
  'Jake', 'Randall', 'jake.randall@example.com', 2010, 'flanker',
  'Software Engineering', 'Senior Engineer', 'Stripe', 'San Francisco', 'CA',
  'Utah rugby 2007–2010. Building fintech infrastructure at Stripe. Happy to talk shop with anyone breaking into tech.',
  'self_registered', true, false,
  'open_to_work', false, true,
  array['Software Development', 'API Design', 'Technical Interviews'],
  array['Technology', 'Fintech'],
  14,
  null, 'jakerandall_rugby'
),

-- Self-employed
(
  '00000000-0000-0000-0000-000000000003',
  'Ryan', 'Espinoza', 'ryan.espinoza@example.com', 2015, 'hooker',
  'Legal', 'Attorney', 'Espinoza Law', 'Denver', 'CO',
  'Utah rugby 2012–2015. Solo practice specializing in business law and contracts. Former lock, now locking in deals.',
  'self_registered', true, true,
  'self_employed', false, false,
  array['Business Law', 'Contracts', 'Real Estate Law'],
  array['Legal'],
  9,
  'https://espinozalaw.com', null
),

-- Employed, no special status
(
  '00000000-0000-0000-0000-000000000004',
  'Brett', 'Hansen', 'brett.hansen@example.com', 2008, 'wing',
  'Healthcare', 'Physician Assistant', 'Intermountain Health', 'Murray', 'UT',
  'Utah rugby 2005–2008. Working in urgent care. Still play club rugby on weekends.',
  'self_registered', true, true,
  'employed', false, true,
  array['Primary Care', 'Sports Medicine'],
  array['Healthcare'],
  16,
  null, null
),

-- Recently joined, looking for work
(
  '00000000-0000-0000-0000-000000000005',
  'Austin', 'Nguyen', 'austin.nguyen@example.com', 2022, 'fly half',
  'Finance', null, null, 'Provo', 'UT',
  'Just graduated. Utah rugby 2019–2022. Looking for my first finance role.',
  'self_registered', true, false,
  'looking_for_work', false, false,
  array['Financial Analysis', 'Excel', 'Accounting'],
  array['Finance', 'Banking'],
  2,
  null, 'austin.nguyenrugby'
),

-- Hiring, no photo, veteran
(
  '00000000-0000-0000-0000-000000000006',
  'Dave', 'Mortensen', 'dave.mortensen@example.com', 1998, 'lock',
  'Real Estate', 'Broker/Owner', 'Mortensen Realty', 'Ogden', 'UT',
  'Played in the late 90s. Running a brokerage in Ogden — always hiring driven people.',
  'imported', true, true,
  'employed', true, true,
  array['Residential Real Estate', 'Commercial Real Estate', 'Property Management'],
  array['Real Estate'],
  25,
  'https://mortsenrealty.com', null
),

-- Student
(
  '00000000-0000-0000-0000-000000000007',
  'Tyler', 'Shaw', 'tyler.shaw@example.com', 2025, 'center',
  'Engineering', null, null, 'Salt Lake City', 'UT',
  'Current U of U student. Playing on the team now. Studying mechanical engineering.',
  'self_registered', true, false,
  'student', false, false,
  array['CAD Design', 'Mechanical Engineering'],
  array['Engineering', 'Manufacturing'],
  0,
  null, 'tyler.shaw.rugby'
)

on conflict (id) do nothing;

-- ─── Forward tokens for test users ───────────────────────────────────────────

insert into forward_tokens (id, token, referrer_alumni_id, signups_attributed)
values
  ('10000000-0000-0000-0000-000000000001', 'moose-ref-token-2024',  '00000000-0000-0000-0000-000000000001', 3),
  ('10000000-0000-0000-0000-000000000002', 'jake-ref-token-2024',   '00000000-0000-0000-0000-000000000002', 1),
  ('10000000-0000-0000-0000-000000000003', 'dave-ref-token-2024',   '00000000-0000-0000-0000-000000000006', 0)
on conflict (id) do nothing;

-- ─── Sample event ─────────────────────────────────────────────────────────────

insert into events (id, title, description, starts_at, ends_at, location, kind, creator_id)
values (
  '20000000-0000-0000-0000-000000000001',
  'Spring Alumni Game Watch',
  'Watching the Utes take on BYU — come out and rep the alumni. Food and drinks on us.',
  (now() + interval '10 days')::timestamptz,
  (now() + interval '10 days' + interval '3 hours')::timestamptz,
  'The Pub at Beer Bar, Salt Lake City',
  'game_watch',
  '00000000-0000-0000-0000-000000000001'
)
on conflict (id) do nothing;

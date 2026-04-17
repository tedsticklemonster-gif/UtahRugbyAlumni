-- 001_create_tables.sql
-- Creates the core tables for Utah Rugby Alumni Network Phase 1.

create table alumni (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  first_name        text not null,
  last_name         text not null,
  grad_year         int check (grad_year >= 1960 and grad_year <= extract(year from now()) + 1),
  position          text,
  email             text unique not null,
  phone             text,
  profession        text,
  job_title         text,
  company           text,
  city              text,
  state             text,
  linkedin_url      text,
  photo_url         text,
  bio               text check (char_length(bio) <= 500),

  -- SMS CONSENT: Legally critical (TCPA). Phase 1 collects consent only.
  -- NEVER send automated SMS to a number where sms_consent = false.
  sms_consent       boolean not null default false,
  sms_consent_at    timestamptz,

  directory_visible boolean not null default true,
  verified          boolean not null default false,
  status            text not null default 'imported'
                    check (status in (
                      'self_registered',
                      'imported',
                      'needs_research',
                      'unreachable',
                      'opted_out'
                    )),
  source            text check (source in ('form', 'csv_import', 'forwarded_link', 'manual')),
  referred_by_token text,
  notes             text
);

create index idx_alumni_email on alumni (email);
create index idx_alumni_verified on alumni (verified);
create index idx_alumni_status on alumni (status);

create table email_sends (
  id              uuid primary key default gen_random_uuid(),
  alumni_id       uuid references alumni(id) on delete set null,
  recipient_email text not null,
  campaign        text not null check (campaign in ('moose_intro', 'welcome', 'forward_share')),
  sent_at         timestamptz not null default now(),
  opened_at       timestamptz,
  clicked_at      timestamptz,
  resend_id       text
);

create index idx_email_sends_alumni on email_sends (alumni_id);
create index idx_email_sends_campaign on email_sends (campaign);

create table forward_tokens (
  id                   uuid primary key default gen_random_uuid(),
  token                text unique not null,
  referrer_alumni_id   uuid references alumni(id) on delete set null,
  created_at           timestamptz not null default now(),
  signups_attributed   int not null default 0
);

create index idx_forward_tokens_token on forward_tokens (token);

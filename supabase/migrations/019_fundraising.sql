-- 019_fundraising.sql
-- Pledge tracking for the board's fundraising campaigns.
-- Offline-only for now (no payment processor). Stripe slot noted in comments.

-- ── Campaigns ─────────────────────────────────────────────────────────────
create table campaigns (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  goal_cents  bigint,               -- null = no public goal
  starts_at   timestamptz,
  ends_at     timestamptz,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table campaigns enable row level security;

create policy "Admin full access campaigns"
  on campaigns for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ── Pledges ───────────────────────────────────────────────────────────────
create table pledges (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid not null references campaigns(id) on delete cascade,
  alumni_id       uuid references alumni(id) on delete set null,  -- nullable: non-alumni donors
  donor_name      text not null,
  donor_email     text not null,
  amount_cents    bigint not null check (amount_cents > 0),
  currency        text not null default 'USD',
  status          text not null default 'pledged'
                  check (status in ('pledged', 'paid', 'declined', 'cancelled')),
  payment_method  text check (payment_method in ('check', 'cash', 'venmo', 'zelle', 'other')),
  pledged_at      timestamptz not null default now(),
  paid_at         timestamptz,
  notes           text,
  created_by      uuid references auth.users(id) on delete set null,
  updated_at      timestamptz not null default now()
  -- Stripe slot: add payment_intent_id text, payment_url text
  -- when Stripe Checkout is wired in (see src/jobs/pledge-reminders.ts).
);

create index pledges_campaign_id_idx on pledges (campaign_id);
create index pledges_status_idx      on pledges (status);
create index pledges_alumni_id_idx   on pledges (alumni_id);

alter table pledges enable row level security;

create policy "Admin full access pledges"
  on pledges for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ── Extend email_sends campaign constraint ────────────────────────────────
-- Drop the old check, recreate with thank_you added.
alter table email_sends
  drop constraint if exists email_sends_campaign_check;

alter table email_sends
  add constraint email_sends_campaign_check
  check (campaign in ('moose_intro', 'welcome', 'forward_share', 'thank_you'));

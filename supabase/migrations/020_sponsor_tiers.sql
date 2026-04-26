-- 020_sponsor_tiers.sql
-- Sponsor tiers: bronze/silver/gold halo for alumni based on lifetime paid giving.

-- Per-pledge anonymity flag
alter table pledges
  add column if not exists anonymous boolean not null default false;

-- Per-alumnus computed fields (maintained by trigger below)
alter table alumni
  add column if not exists lifetime_giving_cents bigint not null default 0,
  add column if not exists sponsor_tier text
    check (sponsor_tier in ('bronze', 'silver', 'gold'));

-- ── Recompute helper ────────────────────────────────────────────────────────

create or replace function recompute_alumni_sponsor_tier(p_alumni_id uuid)
returns void as $$
declare
  v_total bigint;
  v_tier  text;
begin
  if p_alumni_id is null then return; end if;

  select coalesce(sum(amount_cents), 0)
    into v_total
    from pledges
   where alumni_id = p_alumni_id
     and status = 'paid'
     and anonymous = false;

  v_tier := case
    when v_total >= 100000 then 'gold'    -- $1,000
    when v_total >=  50000 then 'silver'  -- $500
    when v_total >=  10000 then 'bronze'  -- $100
    else null
  end;

  update alumni
     set lifetime_giving_cents = v_total,
         sponsor_tier          = v_tier
   where id = p_alumni_id;
end;
$$ language plpgsql security definer;

-- ── Trigger: recompute on any pledge change ─────────────────────────────────

create or replace function trg_pledges_recompute_tier()
returns trigger as $$
begin
  if (TG_OP = 'DELETE') then
    perform recompute_alumni_sponsor_tier(OLD.alumni_id);
    return OLD;
  end if;
  perform recompute_alumni_sponsor_tier(NEW.alumni_id);
  if (TG_OP = 'UPDATE' and NEW.alumni_id is distinct from OLD.alumni_id) then
    perform recompute_alumni_sponsor_tier(OLD.alumni_id);
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists pledges_recompute_tier on pledges;
create trigger pledges_recompute_tier
  after insert or update or delete on pledges
  for each row execute function trg_pledges_recompute_tier();

-- ── Backfill: link existing pledges to alumni by email ──────────────────────

update pledges p
   set alumni_id = a.id
  from alumni a
 where p.alumni_id is null
   and lower(p.donor_email) = lower(a.email);

-- ── Backfill: recompute totals + tiers for all linked alumni ────────────────

do $$
declare r record;
begin
  for r in select distinct alumni_id from pledges where alumni_id is not null loop
    perform recompute_alumni_sponsor_tier(r.alumni_id);
  end loop;
end $$;

-- ── Update alumni_public view to expose sponsor_tier ───────────────────────

create or replace view alumni_public as
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
    sponsor_tier
  from alumni
  where directory_visible = true
    and verified = true;

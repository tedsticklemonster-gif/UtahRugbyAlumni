-- 004_create_functions.sql
-- RPC functions and triggers.

-- ============================================================
-- Auto-update updated_at on alumni
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger alumni_updated_at
  before update on alumni
  for each row execute function update_updated_at();

-- ============================================================
-- register_alumni: secure signup RPC
-- ============================================================
-- Called from server actions with the service role client.
-- Runs as SECURITY DEFINER to bypass RLS for anon signups.
-- Input is validated by Zod in the server action before calling this.

create or replace function register_alumni(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_grad_year int default null,
  p_position text default null,
  p_phone text default null,
  p_profession text default null,
  p_job_title text default null,
  p_company text default null,
  p_city text default null,
  p_state text default null,
  p_linkedin_url text default null,
  p_bio text default null,
  p_photo_url text default null,
  p_sms_consent boolean default false,
  p_directory_visible boolean default true,
  p_referred_by_token text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_id uuid;
begin
  insert into alumni (
    first_name, last_name, email, grad_year, position, phone,
    profession, job_title, company, city, state, linkedin_url,
    bio, photo_url,
    -- SMS CONSENT: Store consent state and timestamp.
    -- NEVER send SMS unless sms_consent = true.
    sms_consent, sms_consent_at,
    directory_visible, status, source, referred_by_token
  ) values (
    p_first_name, p_last_name, p_email, p_grad_year, p_position, p_phone,
    p_profession, p_job_title, p_company, p_city, p_state, p_linkedin_url,
    p_bio, p_photo_url,
    p_sms_consent,
    case when p_sms_consent then now() else null end,
    p_directory_visible,
    'self_registered', 'form', p_referred_by_token
  )
  returning id into v_id;

  -- Increment forward token attribution if this signup was referred
  if p_referred_by_token is not null then
    update forward_tokens
      set signups_attributed = signups_attributed + 1
      where token = p_referred_by_token;
  end if;

  return v_id;
end;
$$;

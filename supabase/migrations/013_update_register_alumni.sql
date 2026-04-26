-- 013_update_register_alumni.sql
-- Extend register_alumni RPC to accept the professional-availability fields
-- added in migration 012. All new parameters are optional with safe defaults.

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
  p_referred_by_token text default null,
  p_availability text default 'not_specified',
  p_hiring boolean default false,
  p_services text[] default null,
  p_industries text[] default null,
  p_years_experience int default null,
  p_willing_to_mentor boolean default false,
  p_website_url text default null,
  p_instagram_handle text default null
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
    sms_consent, sms_consent_at,
    directory_visible, status, source, referred_by_token,
    availability, hiring, services, industries,
    years_experience, willing_to_mentor,
    website_url, instagram_handle
  ) values (
    p_first_name, p_last_name, p_email, p_grad_year, p_position, p_phone,
    p_profession, p_job_title, p_company, p_city, p_state, p_linkedin_url,
    p_bio, p_photo_url,
    p_sms_consent,
    case when p_sms_consent then now() else null end,
    p_directory_visible,
    'self_registered', 'form', p_referred_by_token,
    coalesce(p_availability, 'not_specified'),
    coalesce(p_hiring, false),
    p_services,
    p_industries,
    p_years_experience,
    coalesce(p_willing_to_mentor, false),
    p_website_url,
    p_instagram_handle
  )
  returning id into v_id;

  if p_referred_by_token is not null then
    update forward_tokens
      set signups_attributed = signups_attributed + 1
      where token = p_referred_by_token;
  end if;

  return v_id;
end;
$$;

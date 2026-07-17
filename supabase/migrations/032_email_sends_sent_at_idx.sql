-- Admin dashboard and digest jobs filter email_sends by sent_at ranges;
-- only campaign/alumni_id were indexed.
create index if not exists email_sends_sent_at_idx
  on public.email_sends (sent_at desc);

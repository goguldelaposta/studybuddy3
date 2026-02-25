-- Schedule AI agent to run daily at 06:00 UTC (08:00 Romania time)
-- Requires pg_cron extension enabled in Supabase Dashboard

-- First enable the extension
create extension if not exists pg_cron;
grant usage on schema cron to postgres;

-- Remove existing schedule if any
select cron.unschedule('ai-agent-daily') where exists (
  select 1 from cron.job where jobname = 'ai-agent-daily'
);

-- Schedule daily at 06:00 UTC
select cron.schedule(
  'ai-agent-daily',
  '0 6 * * *',
  $$
  select
    net.http_post(
      url := (select value from vault.secrets where name = 'supabase_url' limit 1) || '/functions/v1/ai-agent',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select value from vault.secrets where name = 'service_role_key' limit 1)
      ),
      body := '{}'::jsonb
    );
  $$
);

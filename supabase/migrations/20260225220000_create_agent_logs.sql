-- Enable pg_net extension (needed for HTTP calls from cron)
create extension if not exists pg_net;

-- Agent logs table
create table if not exists public.agent_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null default gen_random_uuid(),
  action text not null,
  details jsonb,
  result text,
  success boolean default true,
  created_at timestamptz default now()
);

-- RLS
alter table public.agent_logs enable row level security;

-- Only admins can read logs
create policy "Admins can read agent logs"
  on public.agent_logs for select
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Service role can insert
create policy "Service role can insert agent logs"
  on public.agent_logs for insert
  with check (true);

-- Index for performance
create index agent_logs_created_at_idx on public.agent_logs(created_at desc);

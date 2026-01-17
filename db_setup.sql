-- 1. Create NOTES table
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  file_url text not null,
  user_id uuid references auth.users not null,
  faculty text,
  year integer,
  subject text,
  price numeric default 0,
  downloads integer default 0,
  created_at timestamp with time zone default now()
);

-- 2. Create EXAMS table
create table if not exists exams (
  id uuid default gen_random_uuid() primary key,
  subject text not null,
  exam_date timestamp not null,
  location text,
  faculty text not null,
  year integer,
  series text,
  created_by uuid references auth.users,
  created_at timestamp with time zone default now()
);

-- 3. Enable RLS (Security)
alter table notes enable row level security;
alter table exams enable row level security;

-- 4. Create Policies (Notes)
create policy "Oricine poate vedea notițele" on notes for select using (true);
create policy "Userii autentificați pot uploada" on notes for insert with check (auth.role() = 'authenticated');
create policy "Autorii pot șterge notițele proprii" on notes for delete using (auth.uid() = user_id);

-- 5. Create Policies (Exams)
create policy "Oricine poate vedea examenele" on exams for select using (true);
create policy "Userii autentificați pot adăuga examene" on exams for insert with check (auth.role() = 'authenticated');

-- 6. Create Storage Bucket for Files
insert into storage.buckets (id, name, public) 
values ('notes-files', 'notes-files', true)
on conflict (id) do nothing;

create policy "Fisiere publice" on storage.objects for select using (bucket_id = 'notes-files');
create policy "Upload useri" on storage.objects for insert with check (bucket_id = 'notes-files' and auth.role() = 'authenticated');

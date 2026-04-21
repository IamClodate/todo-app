-- Biko Workspace backend setup
-- Run this in the Supabase SQL editor for the project tied to this app.

create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = check_user_id
  );
$$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  details text,
  target_task_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.tasks add column if not exists description text;
alter table public.tasks add column if not exists priority text not null default 'medium';
alter table public.tasks add column if not exists due_date date;
alter table public.tasks add column if not exists completed boolean not null default false;
alter table public.tasks add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.tasks add column if not exists updated_at timestamptz not null default timezone('utc', now());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.user_profiles;
create trigger set_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, full_name, role, last_seen_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'user',
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    last_seen_at = excluded.last_seen_at;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.tasks enable row level security;
alter table public.user_profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "tasks_select_own_or_admin" on public.tasks;
create policy "tasks_select_own_or_admin"
on public.tasks
for select
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "tasks_insert_own_or_admin" on public.tasks;
create policy "tasks_insert_own_or_admin"
on public.tasks
for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "tasks_update_own_or_admin" on public.tasks;
create policy "tasks_update_own_or_admin"
on public.tasks
for update
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "tasks_delete_own_or_admin" on public.tasks;
create policy "tasks_delete_own_or_admin"
on public.tasks
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "profiles_select_own_or_admin" on public.user_profiles;
create policy "profiles_select_own_or_admin"
on public.user_profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_update_own_or_admin" on public.user_profiles;
create policy "profiles_update_own_or_admin"
on public.user_profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin(auth.uid()))
with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_insert_self_or_admin" on public.user_profiles;
create policy "profiles_insert_self_or_admin"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "admin_users_select_admin_only" on public.admin_users;
create policy "admin_users_select_admin_only"
on public.admin_users
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "admin_users_insert_admin_only" on public.admin_users;
create policy "admin_users_insert_admin_only"
on public.admin_users
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "activity_select_own_or_admin" on public.activity_logs;
create policy "activity_select_own_or_admin"
on public.activity_logs
for select
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "activity_insert_own_or_admin" on public.activity_logs;
create policy "activity_insert_own_or_admin"
on public.activity_logs
for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create index if not exists idx_tasks_user_id on public.tasks (user_id);
create index if not exists idx_tasks_created_at on public.tasks (created_at desc);
create index if not exists idx_activity_logs_user_id on public.activity_logs (user_id);
create index if not exists idx_activity_logs_created_at on public.activity_logs (created_at desc);

-- After running this script, promote your admin account manually:
-- replace the email first to confirm the correct profile exists
-- then insert that profile id into admin_users
--
-- example:
-- insert into public.admin_users (user_id)
-- select id
-- from public.user_profiles
-- where email = 'clodatemnisi@gmail.com'
-- on conflict do nothing;

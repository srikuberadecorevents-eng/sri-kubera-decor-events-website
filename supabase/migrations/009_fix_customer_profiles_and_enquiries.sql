-- ============================================================
-- Migration 009: Fix Customer Profiles, Enquiries RLS and Auto-Create Trigger
-- Run in the Supabase SQL Editor
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Ensure Table Structure & Foreign Key Constraints
-- ----------------------------------------------------------------
alter table public.profiles
  alter column phone drop not null;

alter table public.profiles
  alter column name set default 'Customer';

-- ----------------------------------------------------------------
-- 2. Profiles RLS Policies
-- ----------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles: own read" on public.profiles;
drop policy if exists "profiles: admin read all" on public.profiles;
drop policy if exists "profiles: own update" on public.profiles;
drop policy if exists "profiles: admin update all" on public.profiles;
drop policy if exists "profiles: insert own" on public.profiles;

-- Authenticated users can read their own profile; admins can read all
create policy "profiles: own read"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

-- Authenticated users can insert their own profile
create policy "profiles: insert own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Authenticated users can update their own profile
create policy "profiles: own update"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Ensure non-admins cannot escalate their own role
create or replace function public.prevent_self_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Unauthorized: Customers cannot modify account role';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_self_role_escalation on public.profiles;
create trigger trg_prevent_self_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_self_role_escalation();

-- ----------------------------------------------------------------
-- 3. Bookings (Enquiries) RLS Policies
-- ----------------------------------------------------------------
alter table public.bookings enable row level security;

drop policy if exists "bookings: own read" on public.bookings;
drop policy if exists "bookings: own insert" on public.bookings;
drop policy if exists "bookings: insert" on public.bookings;
drop policy if exists "bookings: admin full" on public.bookings;

-- Authenticated customers can read their own enquiries; admin can read all
create policy "bookings: own read"
  on public.bookings for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- Customers (authenticated) and guests (anon) can insert enquiries
create policy "bookings: insert"
  on public.bookings for insert
  to authenticated, anon
  with check (user_id is null or auth.uid() = user_id or public.is_admin());

-- Admin full control for bookings updates/deletes
create policy "bookings: admin full"
  on public.bookings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------
-- 4. Auto-Create Profile Trigger on auth.users
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_name text;
  user_phone text;
  user_role text;
  user_gender text;
  user_address text;
  user_pincode text;
begin
  user_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'user_name'), ''),
    nullif(trim(split_part(new.email, '@', 1)), ''),
    'Customer'
  );

  user_phone := coalesce(new.raw_user_meta_data->>'phone', '');
  user_role := coalesce(new.raw_user_meta_data->>'role', 'user');
  user_gender := new.raw_user_meta_data->>'gender';
  user_address := coalesce(new.raw_user_meta_data->>'address', '');
  user_pincode := coalesce(new.raw_user_meta_data->>'pincode', '');

  insert into public.profiles (
    id,
    email,
    name,
    phone,
    role,
    gender,
    address,
    pincode,
    created_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    user_name,
    user_phone,
    user_role,
    case when user_gender in ('male', 'female') then user_gender else null end,
    user_address,
    user_pincode,
    coalesce(new.created_at, now())
  )
  on conflict (id) do update set
    email = excluded.email,
    name = case
      when public.profiles.name is null or public.profiles.name = '' or public.profiles.name = 'User'
      then excluded.name
      else public.profiles.name
    end,
    phone = case
      when public.profiles.phone is null or public.profiles.phone = ''
      then excluded.phone
      else public.profiles.phone
    end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------
-- 5. Backfill/Create Missing Profiles for All Existing Auth Users
-- ----------------------------------------------------------------
insert into public.profiles (
  id,
  email,
  name,
  phone,
  role,
  created_at
)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'name'), ''),
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(split_part(u.email, '@', 1)), ''),
    'Customer'
  ) as name,
  coalesce(u.raw_user_meta_data->>'phone', '') as phone,
  coalesce(u.raw_user_meta_data->>'role', 'user') as role,
  coalesce(u.created_at, now()) as created_at
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;

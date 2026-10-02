-- ============================================================
-- Sri Kubera Decor & Events -- Supabase Migration
-- Run in the Supabase SQL Editor
-- ============================================================

-- ----------------------------------------------------------------
-- 1. PROFILES
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'user' check (role in ('admin','user')),
  name        text not null,
  phone       text not null,
  email       text not null,
  gender      text check (gender in ('male','female')),
  address     text,
  pincode     text,
  created_at  timestamptz default now()
);

-- Helper: Check if current user is an admin without triggering RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

-- Users can read/update their own profile
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id);

-- Admin can read/update all profiles
create policy "profiles: admin read all"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles: admin update all"
  on public.profiles for update
  using (public.is_admin());

-- Allow insert for newly registered users (trigger handles this)
create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ----------------------------------------------------------------
-- 2. CATEGORIES
-- ----------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz default now()
);

alter table public.categories enable row level security;

create policy "categories: public read"
  on public.categories for select
  using (true);

create policy "categories: admin write"
  on public.categories for all
  using (public.is_admin());

-- ----------------------------------------------------------------
-- 3. DESIGNS
-- ----------------------------------------------------------------
create table if not exists public.designs (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  category_id  uuid references public.categories(id) on delete set null,
  image_url    text not null,
  price        numeric,
  inclusions   text,
  created_at   timestamptz default now()
);

alter table public.designs enable row level security;

create policy "designs: public read"
  on public.designs for select
  using (true);

create policy "designs: admin write"
  on public.designs for all
  using (public.is_admin());

-- ----------------------------------------------------------------
-- 4. BOOKINGS (enquiries)
-- ----------------------------------------------------------------
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  enquiry_id    text not null unique,
  user_id       uuid references public.profiles(id) on delete cascade,
  design_id     uuid references public.designs(id) on delete set null,
  status        text not null default 'pending'
                  check (status in ('pending','contacted','confirmed','rejected')),
  booking_date  timestamptz default now(),
  admin_notes   text
);

alter table public.bookings enable row level security;

-- Users can read their own bookings
create policy "bookings: own read"
  on public.bookings for select
  using (auth.uid() = user_id);

-- Users can insert bookings for themselves
create policy "bookings: own insert"
  on public.bookings for insert
  with check (auth.uid() = user_id);

-- Admin can read all bookings
create policy "bookings: admin read all"
  on public.bookings for select
  using (public.is_admin());

-- Admin can update all bookings (status, admin_notes)
create policy "bookings: admin update all"
  on public.bookings for update
  using (public.is_admin());

-- ----------------------------------------------------------------
-- 5. SERVICES
-- ----------------------------------------------------------------
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  icon        text,
  created_at  timestamptz default now()
);

alter table public.services enable row level security;

create policy "services: public read"
  on public.services for select
  using (true);

create policy "services: admin write"
  on public.services for all
  using (public.is_admin());

-- ----------------------------------------------------------------
-- 6. BUSINESS SETTINGS (single row)
-- ----------------------------------------------------------------
create table if not exists public.business_settings (
  id                int primary key default 1,
  phone             text,
  whatsapp_number   text,
  address           text,
  map_link          text,
  social_links      jsonb,
  check (id = 1)
);

alter table public.business_settings enable row level security;

create policy "business_settings: public read"
  on public.business_settings for select
  using (true);

create policy "business_settings: admin write"
  on public.business_settings for all
  using (public.is_admin());

-- ----------------------------------------------------------------
-- 7. ENQUIRY ID GENERATOR
-- Generates a unique code in the format A####
-- ----------------------------------------------------------------
create or replace function public.generate_enquiry_id()
returns text
language plpgsql
as $$
declare
  new_id text;
  counter int := 0;
begin
  loop
    new_id := 'A' || lpad(floor(random() * 9000 + 1000)::int::text, 4, '0');
    if not exists (select 1 from public.bookings where enquiry_id = new_id) then
      return new_id;
    end if;
    counter := counter + 1;
    if counter > 100 then
      raise exception 'Could not generate unique enquiry_id after 100 attempts';
    end if;
  end loop;
end;
$$;

-- ----------------------------------------------------------------
-- 8. AUTO-CREATE PROFILE ON SIGNUP
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------
-- 9. STORAGE BUCKETS
-- Run these in the Supabase dashboard Storage section, or use SQL:
-- ----------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('design-images', 'design-images', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict do nothing;

-- Storage RLS: receipts bucket -- users access only their own folder
create policy "receipts: own read"
  on storage.objects for select
  using (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "receipts: own insert"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admin can read all receipts
create policy "receipts: admin read all"
  on storage.objects for select
  using (
    bucket_id = 'receipts'
    and public.is_admin()
  );

-- ----------------------------------------------------------------
-- 10. SEED: Initial categories
-- ----------------------------------------------------------------
insert into public.categories (name) values
  ('Wedding'),
  ('Reception'),
  ('Birthday'),
  ('Housewarming'),
  ('Surprise Party'),
  ('Corporate Event')
on conflict (name) do nothing;

-- ----------------------------------------------------------------
-- 11. SEED: Initial services
-- ----------------------------------------------------------------
insert into public.services (title, description, icon) values
  ('Wedding Decoration', 'Elegant and memorable wedding stage decorations tailored to your vision, from floral arches to grand backdrops.', 'Heart'),
  ('Birthday Decoration', 'Vibrant, themed birthday setups that bring joy to every celebration, from intimate gatherings to grand parties.', 'Gift'),
  ('Surprise Parties', 'Thoughtfully planned surprise party setups that create unforgettable moments for your loved ones.', 'Star'),
  ('Corporate Events', 'Professional and polished event decoration for conferences, product launches, and corporate celebrations.', 'Briefcase')
on conflict do nothing;

-- ----------------------------------------------------------------
-- 12. SEED: Business settings
-- ----------------------------------------------------------------
insert into public.business_settings (id, phone, whatsapp_number, address, social_links)
values (
  1,
  '7373876879',
  '917373876879',
  'No. 80, Manjini Nagar, Bachanai Madam Street, Muthiyal Pettai, Puducherry',
  '{"facebook": "", "instagram": "", "youtube": ""}'::jsonb
)
on conflict (id) do nothing;

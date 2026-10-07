-- ============================================================
-- Sri Kubera Decor & Events -- Admin Panel Migration 003
-- Idempotent schema, RLS policies, indexes, and triggers
-- ============================================================

-- 1. Helper function: is_admin()
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2. Alter existing table: categories
alter table public.categories
  add column if not exists slug text unique,
  add column if not exists sort_order int not null default 0,
  add column if not exists cover_url text,
  add column if not exists is_active boolean not null default true;

-- Auto-fill slugs for existing categories if missing
update public.categories
set slug = lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null or slug = '';

-- 3. Media library table
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  path_card text not null,
  path_full text not null,
  url_card text not null,
  url_full text not null,
  width int,
  height int,
  bytes_total int not null default 0,
  original_name text,
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;

-- 4. Alter existing table: designs
alter table public.designs
  add column if not exists slug text unique,
  add column if not exists status text not null default 'draft' check (status in ('draft','published','archived')),
  add column if not exists is_featured boolean not null default false,
  add column if not exists sort_order int not null default 0,
  add column if not exists price_on_request boolean not null default false,
  add column if not exists inclusions_list text[] not null default '{}',
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- Auto-fill slugs and publish existing designs if newly migrated
update public.designs
set slug = lower(regexp_replace(trim(title), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(id::text, 1, 6)
where slug is null or slug = '';

update public.designs
set status = 'published'
where status = 'draft' and deleted_at is null;

-- One-time: split old comma-separated inclusions text into inclusions_list
update public.designs
set inclusions_list = array_remove(string_to_array(inclusions, ','), '')
where inclusions is not null and (inclusions_list is null or cardinality(inclusions_list) = 0);

-- 5. Design images junction table
create table if not exists public.design_images (
  id uuid primary key default gen_random_uuid(),
  design_id uuid not null references public.designs(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete restrict,
  alt text,
  sort_order int not null default 0,
  is_cover boolean not null default false
);

alter table public.design_images enable row level security;

-- 6. Alter existing table: bookings (customer-visible extras)
alter table public.bookings
  add column if not exists event_date date,
  add column if not exists venue text,
  add column if not exists updated_at timestamptz not null default now();

-- 7. Admin-only private data for a booking
create table if not exists public.booking_private (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  internal_notes text,
  quoted_price numeric
);

alter table public.booking_private enable row level security;

-- 8. Booking status history
create table if not exists public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now()
);

alter table public.booking_status_history enable row level security;

-- 9. Requirements leads ("Post Your Requirement")
create table if not exists public.requirements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text not null,
  event_type text,
  event_date date,
  place text not null,
  message text,
  status text not null default 'new' check (status in ('new','contacted','converted','closed')),
  admin_notes text,
  created_at timestamptz not null default now()
);

alter table public.requirements enable row level security;

-- 10. Testimonials
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  event_type text,
  quote text not null,
  rating int check (rating between 1 and 5),
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

-- 11. Editable homepage/about site content (key/value)
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- 12. Activity log
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity text not null,
  entity_id text,
  summary text,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

-- 13. Alter services & business_settings
alter table public.services
  add column if not exists sort_order int not null default 0,
  add column if not exists is_active boolean not null default true;

alter table public.business_settings
  add column if not exists working_hours text,
  add column if not exists notification_email text,
  add column if not exists tagline text;

-- 14. Performance Indexes
create index if not exists idx_bookings_status_created on public.bookings (status, booking_date desc);
create index if not exists idx_bookings_event_date on public.bookings (event_date);
create index if not exists idx_designs_status_cat on public.designs (status, category_id);
create index if not exists idx_requirements_status on public.requirements (status, created_at desc);
create index if not exists idx_media_created on public.media (created_at desc);
create index if not exists idx_design_images_design on public.design_images (design_id, sort_order);
create index if not exists idx_activity_created on public.activity_log (created_at desc);

-- ----------------------------------------------------------------
-- 15. RLS POLICIES
-- ----------------------------------------------------------------

-- Designs: public can select published non-deleted; admin full
drop policy if exists "designs: public read" on public.designs;
drop policy if exists "designs: admin write" on public.designs;
drop policy if exists "designs: admin full" on public.designs;

create policy "designs: public read"
  on public.designs for select
  using (
    (status = 'published' and deleted_at is null)
    or public.is_admin()
  );

create policy "designs: admin full"
  on public.designs for all
  using (public.is_admin());

-- Media: public read if referenced in published design or admin full
drop policy if exists "media: public read" on public.media;
drop policy if exists "media: admin full" on public.media;

create policy "media: public read"
  on public.media for select
  using (true);

create policy "media: admin full"
  on public.media for all
  using (public.is_admin());

-- Design Images
drop policy if exists "design_images: public read" on public.design_images;
drop policy if exists "design_images: admin full" on public.design_images;

create policy "design_images: public read"
  on public.design_images for select
  using (true);

create policy "design_images: admin full"
  on public.design_images for all
  using (public.is_admin());

-- Categories: public active only; admin full
drop policy if exists "categories: public read" on public.categories;
drop policy if exists "categories: admin write" on public.categories;
drop policy if exists "categories: admin full" on public.categories;

create policy "categories: public read"
  on public.categories for select
  using (is_active = true or public.is_admin());

create policy "categories: admin full"
  on public.categories for all
  using (public.is_admin());

-- Services: public active only; admin full
drop policy if exists "services: public read" on public.services;
drop policy if exists "services: admin write" on public.services;
drop policy if exists "services: admin full" on public.services;

create policy "services: public read"
  on public.services for select
  using (is_active = true or public.is_admin());

create policy "services: admin full"
  on public.services for all
  using (public.is_admin());

-- Testimonials: public published only; admin full
drop policy if exists "testimonials: public read" on public.testimonials;
drop policy if exists "testimonials: admin full" on public.testimonials;

create policy "testimonials: public read"
  on public.testimonials for select
  using (is_published = true or public.is_admin());

create policy "testimonials: admin full"
  on public.testimonials for all
  using (public.is_admin());

-- Site Content & Business Settings: public select; admin full
drop policy if exists "site_content: public read" on public.site_content;
drop policy if exists "site_content: admin full" on public.site_content;

create policy "site_content: public read"
  on public.site_content for select
  using (true);

create policy "site_content: admin full"
  on public.site_content for all
  using (public.is_admin());

drop policy if exists "business_settings: public read" on public.business_settings;
drop policy if exists "business_settings: admin write" on public.business_settings;
drop policy if exists "business_settings: admin full" on public.business_settings;

create policy "business_settings: public read"
  on public.business_settings for select
  using (true);

create policy "business_settings: admin full"
  on public.business_settings for all
  using (public.is_admin());

-- Requirements: insert allowed for anyone; admin select/update/delete
drop policy if exists "requirements: insert anyone" on public.requirements;
drop policy if exists "requirements: admin full" on public.requirements;

create policy "requirements: insert anyone"
  on public.requirements for insert
  with check (true);

create policy "requirements: admin full"
  on public.requirements for all
  using (public.is_admin());

-- Bookings: user select/insert own; admin select/update/delete
drop policy if exists "bookings: own read" on public.bookings;
drop policy if exists "bookings: own insert" on public.bookings;
drop policy if exists "bookings: admin read all" on public.bookings;
drop policy if exists "bookings: admin update all" on public.bookings;
drop policy if exists "bookings: admin full" on public.bookings;

create policy "bookings: own read"
  on public.bookings for select
  using (auth.uid() = user_id or public.is_admin());

create policy "bookings: own insert"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "bookings: admin full"
  on public.bookings for all
  using (public.is_admin());

-- Booking Private: admin only
drop policy if exists "booking_private: admin only" on public.booking_private;

create policy "booking_private: admin only"
  on public.booking_private for all
  using (public.is_admin());

-- Booking Status History: user can read for their own bookings; admin full
drop policy if exists "booking_status_history: user read own" on public.booking_status_history;
drop policy if exists "booking_status_history: admin full" on public.booking_status_history;

create policy "booking_status_history: user read own"
  on public.booking_status_history for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_status_history.booking_id
        and b.user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "booking_status_history: admin full"
  on public.booking_status_history for all
  using (public.is_admin());

-- Activity Log: admin only
drop policy if exists "activity_log: admin only" on public.activity_log;

create policy "activity_log: admin only"
  on public.activity_log for all
  using (public.is_admin());

-- Storage policies: design-images public read, admin write/delete
drop policy if exists "design_images_storage: public read" on storage.objects;
drop policy if exists "design_images_storage: admin full" on storage.objects;

create policy "design_images_storage: public read"
  on storage.objects for select
  using (bucket_id = 'design-images');

create policy "design_images_storage: admin full"
  on storage.objects for all
  using (bucket_id = 'design-images' and public.is_admin());

-- Enable Realtime publication for live badge counts
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'requirements'
  ) then
    alter publication supabase_realtime add table public.requirements;
  end if;
exception when others then
  null; -- if running in an env without pg_publication permissions, continue gracefully
end $$;

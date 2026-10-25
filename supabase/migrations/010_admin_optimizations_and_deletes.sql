-- ============================================================
-- Migration 010: Admin Optimizations, Cascade Constraints, Indexes and Delete Policies
-- Run in the Supabase SQL Editor
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Helper function: STABLE SECURITY DEFINER is_admin()
-- Evaluates once per query using (select auth.uid()) for optimal performance
-- ----------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------
-- 2. Bookings Table: Ensure Customer Name, Phone, Email & Message Columns Exist
-- ----------------------------------------------------------------
alter table public.bookings
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text,
  add column if not exists message text;

alter table public.requirements
  add column if not exists budget text,
  add column if not exists image_url text;

-- Backfill customer columns from user profile if missing
update public.bookings b
set
  customer_name = coalesce(b.customer_name, p.name, 'Customer'),
  customer_phone = coalesce(b.customer_phone, p.phone),
  customer_email = coalesce(b.customer_email, p.email)
from public.profiles p
where b.user_id = p.id
  and (b.customer_name is null or b.customer_phone is null);

-- ----------------------------------------------------------------
-- 3. Foreign Key Constraints (ON DELETE SET NULL / CASCADE)
-- Prevents constraint violation crashes when deleting users, admins, or designs
-- ----------------------------------------------------------------
-- activity_log: set actor_id to null if user is deleted
alter table public.activity_log
  drop constraint if exists activity_log_actor_id_fkey,
  add constraint activity_log_actor_id_fkey
    foreign key (actor_id) references public.profiles(id) on delete set null;

-- booking_status_history: set changed_by to null if user is deleted
alter table public.booking_status_history
  drop constraint if exists booking_status_history_changed_by_fkey,
  add constraint booking_status_history_changed_by_fkey
    foreign key (changed_by) references public.profiles(id) on delete set null;

-- bookings: cascade delete bookings if profile is deleted
alter table public.bookings
  drop constraint if exists bookings_user_id_fkey,
  add constraint bookings_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;

-- design_images: cascade delete junction rows when design is deleted
alter table public.design_images
  drop constraint if exists design_images_design_id_fkey,
  add constraint design_images_design_id_fkey
    foreign key (design_id) references public.designs(id) on delete cascade;

-- ----------------------------------------------------------------
-- 4. Admin-Only DELETE Policies for Every Table
-- ----------------------------------------------------------------

-- Profiles: admin delete only
drop policy if exists "profiles: admin delete" on public.profiles;
create policy "profiles: admin delete"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- Bookings (Enquiries): admin delete
drop policy if exists "bookings: admin delete" on public.bookings;
create policy "bookings: admin delete"
  on public.bookings for delete
  to authenticated
  using (public.is_admin());

-- Requirements: admin delete
drop policy if exists "requirements: admin delete" on public.requirements;
create policy "requirements: admin delete"
  on public.requirements for delete
  to authenticated
  using (public.is_admin());

-- Designs: admin delete
drop policy if exists "designs: admin delete" on public.designs;
create policy "designs: admin delete"
  on public.designs for delete
  to authenticated
  using (public.is_admin());

-- Categories: admin delete
drop policy if exists "categories: admin delete" on public.categories;
create policy "categories: admin delete"
  on public.categories for delete
  to authenticated
  using (public.is_admin());

-- Media: admin delete
drop policy if exists "media: admin delete" on public.media;
create policy "media: admin delete"
  on public.media for delete
  to authenticated
  using (public.is_admin());

-- Testimonials: admin delete
drop policy if exists "testimonials: admin delete" on public.testimonials;
create policy "testimonials: admin delete"
  on public.testimonials for delete
  to authenticated
  using (public.is_admin());

-- Services: admin delete
drop policy if exists "services: admin delete" on public.services;
create policy "services: admin delete"
  on public.services for delete
  to authenticated
  using (public.is_admin());

-- Site Content: admin delete
drop policy if exists "site_content: admin delete" on public.site_content;
create policy "site_content: admin delete"
  on public.site_content for delete
  to authenticated
  using (public.is_admin());

-- Storage: admin delete permissions for storage objects in buckets
drop policy if exists "storage: admin delete media" on storage.objects;
create policy "storage: admin delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('design-images', 'requirements', 'media') and public.is_admin());

-- ----------------------------------------------------------------
-- 5. High-Performance Composite and Filtering Indexes
-- ----------------------------------------------------------------
create index if not exists idx_bookings_created_at on public.bookings (booking_date desc);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_design_id on public.bookings (design_id);
create index if not exists idx_bookings_user_id on public.bookings (user_id);
create index if not exists idx_bookings_event_date on public.bookings (event_date);

create index if not exists idx_requirements_created_at on public.requirements (created_at desc);
create index if not exists idx_requirements_status on public.requirements (status);

create index if not exists idx_designs_sort_order on public.designs (sort_order);
create index if not exists idx_designs_category_id on public.designs (category_id);
create index if not exists idx_designs_status on public.designs (status);
create index if not exists idx_designs_featured on public.designs (is_featured);

create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_activity_created on public.activity_log (created_at desc);
create index if not exists idx_testimonials_sort on public.testimonials (sort_order, created_at desc);
create index if not exists idx_services_sort on public.services (sort_order);

-- ----------------------------------------------------------------
-- 6. Admin Account Password Update & Role Verification
-- Target: admin@gmail.com -> 08xmx4m7yJ*
-- ----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Update encrypted password in auth.users
update auth.users
set 
  encrypted_password = crypt('08xmx4m7yJ*', gen_salt('bf')),
  updated_at = now()
where email = 'admin@gmail.com';

-- Ensure public.profiles has role = 'admin'
update public.profiles
set role = 'admin'
where email = 'admin@gmail.com';

-- Ensure user_metadata has role = 'admin'
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'admin@gmail.com';


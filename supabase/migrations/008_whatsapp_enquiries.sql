-- Migration 008: WhatsApp Enquiries and Guest Enquiries Support

-- 1. Ensure message column exists on public.bookings
alter table public.bookings add column if not exists message text;

-- 2. Relax status check constraint on bookings to allow 'new' alongside 'pending', 'contacted', 'confirmed', 'rejected'
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending', 'new', 'contacted', 'confirmed', 'rejected'));

-- 3. Allow guest enquiries (user_id is null) as well as authenticated users to insert bookings
drop policy if exists "bookings: own insert" on public.bookings;
drop policy if exists "bookings: guest insert" on public.bookings;
drop policy if exists "bookings: insert" on public.bookings;

create policy "bookings: insert"
  on public.bookings for insert
  to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

-- 4. Ensure business_settings has whatsapp_number properly populated
update public.business_settings
set whatsapp_number = '917373876879'
where id = 1 and (whatsapp_number is null or whatsapp_number = '');

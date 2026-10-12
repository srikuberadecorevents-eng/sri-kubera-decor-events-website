-- ============================================================================
-- Migration 007: Gated Gallery Designs Access Control & Teaser Policy
-- ============================================================================

-- 1. Ensure RLS is active on designs table
alter table public.designs enable row level security;

-- 2. Public Read vs Authenticated Read Policy:
-- Unauthenticated guests can view public teaser designs (first 6 featured stages)
-- Authenticated members and admins can view the complete catalog of designs.

drop policy if exists "designs: public read" on public.designs;
drop policy if exists "designs: authenticated read full" on public.designs;

-- Teaser policy for unauthenticated users:
-- Allows reading featured teaser designs for SEO and public previews
create policy "designs: public read"
  on public.designs for select
  using (
    (status = 'published' and deleted_at is null and is_featured = true)
    or auth.role() = 'authenticated'
    or public.is_admin()
  );

-- Full read policy for logged-in users and admins
create policy "designs: authenticated read full"
  on public.designs for select
  to authenticated
  using (
    (status = 'published' and deleted_at is null)
    or public.is_admin()
  );

-- Admin write policy remains full control
drop policy if exists "designs: admin full" on public.designs;
create policy "designs: admin full"
  on public.designs for all
  using (public.is_admin());

-- Migration 006: Add requirement_prompt_dismissed_at to public.profiles
-- Tracks when a logged-in customer dismissed or interacted with the post-requirement popup.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS requirement_prompt_dismissed_at TIMESTAMPTZ;

ALTER TABLE public.requirements
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.requirement_prompt_dismissed_at IS 'Timestamp when the user dismissed the post-requirement popup prompt';
COMMENT ON COLUMN public.requirements.user_id IS 'Authenticated user who posted this requirement';

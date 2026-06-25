-- Per-user app preferences (dark appearance, haptics, default export, etc.)
-- Stored as a flexible JSON blob so new prefs don't require a migration each time.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{}'::jsonb;

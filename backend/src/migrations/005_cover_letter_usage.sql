ALTER TABLE public.usage_tracking
ADD COLUMN IF NOT EXISTS cover_letter_count INTEGER NOT NULL DEFAULT 0;
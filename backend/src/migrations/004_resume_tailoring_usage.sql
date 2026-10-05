ALTER TABLE public.usage_tracking
ADD COLUMN IF NOT EXISTS resume_tailoring_count INTEGER NOT NULL DEFAULT 0;
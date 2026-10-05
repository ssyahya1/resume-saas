CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    ai_analysis_count INTEGER NOT NULL DEFAULT 0,

    period_start DATE NOT NULL DEFAULT CURRENT_DATE,

    period_end DATE NOT NULL DEFAULT (
        CURRENT_DATE + INTERVAL '30 days'
    ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, period_start)
);
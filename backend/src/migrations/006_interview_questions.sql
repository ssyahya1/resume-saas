CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    application_id UUID
        REFERENCES public.applications(id)
        ON DELETE CASCADE,

    question TEXT NOT NULL,

    answer_guidance TEXT,

    category TEXT NOT NULL DEFAULT 'general',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
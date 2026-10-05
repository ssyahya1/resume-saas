
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    full_name TEXT,

    avatar_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS public.resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    resume_id UUID NOT NULL
        REFERENCES public.resumes(id)
        ON DELETE CASCADE,

    version_number INTEGER NOT NULL,

    content JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (resume_id, version_number)
);



CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    company_name TEXT,

    description TEXT NOT NULL,

    job_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    job_id UUID NOT NULL
        REFERENCES public.jobs(id)
        ON DELETE CASCADE,

    resume_id UUID
        REFERENCES public.resumes(id)
        ON DELETE SET NULL,

    status TEXT NOT NULL DEFAULT 'saved',

    applied_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT applications_status_check
        CHECK (
            status IN (
                'saved',
                'applied',
                'interviewing',
                'offer',
                'rejected',
                'withdrawn'
            )
        )
);



CREATE TABLE IF NOT EXISTS public.ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    application_id UUID
        REFERENCES public.applications(id)
        ON DELETE CASCADE,

    resume_id UUID
        REFERENCES public.resumes(id)
        ON DELETE SET NULL,

    job_id UUID
        REFERENCES public.jobs(id)
        ON DELETE SET NULL,

    match_score NUMERIC(5,2),

    analysis JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS public.cover_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    application_id UUID
        REFERENCES public.applications(id)
        ON DELETE CASCADE,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE INDEX IF NOT EXISTS idx_resumes_user_id
    ON public.resumes(user_id);

CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id
    ON public.resume_versions(resume_id);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id
    ON public.jobs(user_id);

CREATE INDEX IF NOT EXISTS idx_applications_user_id
    ON public.applications(user_id);

CREATE INDEX IF NOT EXISTS idx_applications_job_id
    ON public.applications(job_id);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_id
    ON public.ai_analyses(user_id);

CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id
    ON public.cover_letters(user_id);

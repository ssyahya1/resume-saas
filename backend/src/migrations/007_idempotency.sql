
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    idempotency_key TEXT NOT NULL,
    request_hash TEXT NOT NULL,

    job_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'queued', 'completed', 'failed')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_user_id
ON public.idempotency_keys(user_id);
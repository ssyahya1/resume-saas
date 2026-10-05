

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        avatar_url
    )
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS on_auth_user_created
ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;



CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());



CREATE POLICY "Users can view their own resumes"
ON public.resumes
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own resumes"
ON public.resumes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own resumes"
ON public.resumes
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own resumes"
ON public.resumes
FOR DELETE
TO authenticated
USING (user_id = auth.uid());



CREATE POLICY "Users can view their resume versions"
ON public.resume_versions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.resumes
        WHERE resumes.id = resume_versions.resume_id
        AND resumes.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create their resume versions"
ON public.resume_versions
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.resumes
        WHERE resumes.id = resume_versions.resume_id
        AND resumes.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their resume versions"
ON public.resume_versions
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.resumes
        WHERE resumes.id = resume_versions.resume_id
        AND resumes.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.resumes
        WHERE resumes.id = resume_versions.resume_id
        AND resumes.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their resume versions"
ON public.resume_versions
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.resumes
        WHERE resumes.id = resume_versions.resume_id
        AND resumes.user_id = auth.uid()
    )
);



CREATE POLICY "Users can view their own jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own jobs"
ON public.jobs
FOR DELETE
TO authenticated
USING (user_id = auth.uid());



CREATE POLICY "Users can view their own applications"
ON public.applications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own applications"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own applications"
ON public.applications
FOR DELETE
TO authenticated
USING (user_id = auth.uid());



CREATE POLICY "Users can view their own AI analyses"
ON public.ai_analyses
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own AI analyses"
ON public.ai_analyses
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own AI analyses"
ON public.ai_analyses
FOR DELETE
TO authenticated
USING (user_id = auth.uid());



CREATE POLICY "Users can view their own cover letters"
ON public.cover_letters
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own cover letters"
ON public.cover_letters
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cover letters"
ON public.cover_letters
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own cover letters"
ON public.cover_letters
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Drop all existing restrictive policies on subjects
DROP POLICY IF EXISTS "Users can view own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can insert own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can update own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can delete own subjects" ON public.subjects;

-- Drop all existing restrictive policies on study_rows
DROP POLICY IF EXISTS "Users can view own rows" ON public.study_rows;
DROP POLICY IF EXISTS "Users can insert own rows" ON public.study_rows;
DROP POLICY IF EXISTS "Users can update own rows" ON public.study_rows;
DROP POLICY IF EXISTS "Users can delete own rows" ON public.study_rows;

-- Create public access policies for subjects
CREATE POLICY "Public select subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public insert subjects" ON public.subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update subjects" ON public.subjects FOR UPDATE USING (true);
CREATE POLICY "Public delete subjects" ON public.subjects FOR DELETE USING (true);

-- Create public access policies for study_rows
CREATE POLICY "Public select study_rows" ON public.study_rows FOR SELECT USING (true);
CREATE POLICY "Public insert study_rows" ON public.study_rows FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update study_rows" ON public.study_rows FOR UPDATE USING (true);
CREATE POLICY "Public delete study_rows" ON public.study_rows FOR DELETE USING (true);

-- Make user_id nullable on subjects and study_rows
ALTER TABLE public.subjects ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.study_rows ALTER COLUMN user_id DROP NOT NULL;

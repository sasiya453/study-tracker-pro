
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📚',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, key)
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subjects" ON public.subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subjects" ON public.subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subjects" ON public.subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subjects" ON public.subjects FOR DELETE USING (auth.uid() = user_id);

-- Rows table (rounds stored as JSONB array)
CREATE TABLE public.study_rows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rounds JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.study_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows" ON public.study_rows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rows" ON public.study_rows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rows" ON public.study_rows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rows" ON public.study_rows FOR DELETE USING (auth.uid() = user_id);

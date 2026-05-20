-- PHASE 4: Stories table + profiles storage bucket

-- 1. STORIES TABLE
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('video', 'screenshot', 'stripe')),
  thumbnail_label TEXT,
  content TEXT,
  media_url TEXT,
  posted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_stories_user ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_posted ON public.stories(posted_at DESC);

-- 2. RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stories_public_read" ON public.stories FOR SELECT USING (true);
CREATE POLICY "stories_self_insert" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories_self_delete" ON public.stories FOR DELETE USING (auth.uid() = user_id);

-- 3. STORAGE BUCKET for profile avatars/covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profiles', 'profiles', true, 5242880, '{image/png,image/jpeg,image/webp,image/gif}')
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "profiles_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "profiles_authenticated_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "profiles_authenticated_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "profiles_authenticated_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

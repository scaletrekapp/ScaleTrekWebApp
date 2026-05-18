CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'dreamer' CHECK (role IN ('dreamer','investor','admin')),
  verified BOOLEAN DEFAULT false,
  reality_score INTEGER DEFAULT 0,
  momentum_score INTEGER DEFAULT 0,
  headline TEXT,
  location TEXT,
  website TEXT,
  company_name TEXT,
  sector TEXT,
  bio TEXT,
  is_pro BOOLEAN DEFAULT false,
  onboarded BOOLEAN DEFAULT false,
  avatar_url TEXT,
  cover_url TEXT,
  public_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- POSTS
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('dreamer','reality')),
  title TEXT NOT NULL,
  description TEXT,
  milestone TEXT,
  milestone_date TIMESTAMPTZ,
  risk_level INTEGER DEFAULT 50,
  reality_score TEXT CHECK (reality_score IN ('gold','platinum')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- POST MEDIA
CREATE TABLE IF NOT EXISTS public.post_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image','video')),
  "order" INTEGER DEFAULT 0
);

-- POST LIKES
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- POST SIGNALS
CREATE TABLE IF NOT EXISTS public.post_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','pro')),
  status TEXT CHECK (status IN ('active','inactive','past_due')),
  interest_registered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- INVESTOR PROFILES
CREATE TABLE IF NOT EXISTS public.investor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  risk_tolerance INTEGER DEFAULT 50,
  portfolio_size NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DEAL ROOMS (chat threads)
CREATE TABLE IF NOT EXISTS public.deal_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_stage TEXT DEFAULT 'exploring' CHECK (deal_stage IN ('exploring','negotiating','committed','closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- DEAL PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.deal_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE(room_id, user_id)
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  encrypted BOOLEAN DEFAULT false,
  nonce TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DEALS
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dreamer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage TEXT DEFAULT 'exploring' CHECK (stage IN ('exploring','negotiating','committed','closed')),
  amount NUMERIC,
  currency TEXT DEFAULT 'MAD',
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like','connect','invest','milestone','verify','message')),
  title TEXT,
  body TEXT,
  from_handle TEXT,
  from_avatar TEXT,
  read BOOLEAN DEFAULT false,
  post_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- REPORTS (admin)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('spam','fraud','inappropriate','other')),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','investigating','resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- VERIFICATION REQUESTS (admin)
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('business','identity')),
  document TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- FEATURE FLAGS (admin)
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- DEFAULT FEATURE FLAGS
INSERT INTO public.feature_flags (key, label, enabled) VALUES
  ('video_uploads', 'Video Uploads', true),
  ('realtime_chat', 'Realtime Chat', true),
  ('ai_verification', 'AI Document Verification', false),
  ('investor_api', 'Investor API Access', false),
  ('pro_subscriptions', 'Pro Subscriptions', true)
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "posts_public_read" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_self_insert" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_self_update" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_self_delete" ON public.posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "media_public_read" ON public.post_media FOR SELECT USING (true);
CREATE POLICY "likes_self_insert" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_self_delete" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "likes_public_read" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "signals_self_insert" ON public.post_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "signals_self_delete" ON public.post_signals FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "signals_public_read" ON public.post_signals FOR SELECT USING (true);
CREATE POLICY "admin_all" ON public.reports FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "reporter_insert" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_read" ON public.reports FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "admin_all_verification" ON public.verification_requests FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "self_verification_read" ON public.verification_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "self_verification_insert" ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin_flags_all" ON public.feature_flags FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "public_flags_read" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "subscriptions_self_select" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_self_insert" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_self_update" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_self" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "deals_participant" ON public.deals FOR ALL USING (auth.uid() = dreamer_id OR auth.uid() = investor_id);
CREATE POLICY "rooms_participant" ON public.deal_rooms FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.deal_participants WHERE room_id = id));
CREATE POLICY "participants_room" ON public.deal_participants FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.deal_participants WHERE room_id = room_id));
CREATE POLICY "messages_room_participant" ON public.messages FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.deal_participants WHERE room_id = room_id));

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, handle, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'dreamer')
  );
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SCALETREK PHASE 2: ENTERPRISE INFRASTRUCTURE
-- ============================================

-- 1. MOMENTUM ENGINE
-- Tracks score history for the momentum calculation engine
CREATE TABLE IF NOT EXISTS public.momentum_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  reason TEXT, -- 'milestone_completed', 'post_created', 'investor_engagement', 'verification', 'decay'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_momentum_history_user ON public.momentum_history(user_id);
CREATE INDEX IF NOT EXISTS idx_momentum_history_created ON public.momentum_history(created_at);

-- 2. ADVANCED PROFILE TABLES
CREATE TABLE IF NOT EXISTS public.profile_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.profile_achievements(user_id);

CREATE TABLE IF NOT EXISTS public.profile_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'milestone', 'verification', 'achievement', 'migration', 'post'
  title TEXT NOT NULL,
  description TEXT,
  reference_id UUID, -- polymorphic FK to milestones/posts/etc
  event_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_timeline_user ON public.profile_timeline(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created ON public.profile_timeline(created_at);

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- 3. DOSSIER ENGINE
CREATE TABLE IF NOT EXISTS public.dossier_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exporter_id UUID REFERENCES public.profiles(id),
  format TEXT NOT NULL DEFAULT 'pdf', -- 'pdf', 'csv'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  file_url TEXT,
  dossier_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_dossier_user ON public.dossier_exports(user_id);

-- 4. MESSAGING SYSTEM
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_ids UUID[] NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN(participant_ids);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  encrypted_content TEXT, -- For E2E
  message_type TEXT DEFAULT 'text', -- 'text', 'file', 'offer', 'dispute_evidence'
  metadata JSONB DEFAULT '{}',
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

CREATE TABLE IF NOT EXISTS public.message_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES public.profiles(id) NOT NULL,
  to_user_id UUID REFERENCES public.profiles(id) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DISPUTE PROTOCOL
-- Augments the existing disputes table
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS evidence_urls TEXT[] DEFAULT '{}';
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS resolution TEXT;
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at);

-- 6. WATCHLIST / PIPELINE
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_user_id)
);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON public.watchlist(user_id);

-- 7. RLS POLICIES FOR NEW TABLES

-- momentum_history
ALTER TABLE public.momentum_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "momentum_read" ON public.momentum_history FOR SELECT USING (true);
CREATE POLICY "momentum_insert" ON public.momentum_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- profile_achievements
ALTER TABLE public.profile_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_read" ON public.profile_achievements FOR SELECT USING (true);
CREATE POLICY "achievements_admin" ON public.profile_achievements FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','super_admin')));

-- profile_timeline
ALTER TABLE public.profile_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timeline_read" ON public.profile_timeline FOR SELECT USING (true);
CREATE POLICY "timeline_insert" ON public.profile_timeline FOR INSERT WITH CHECK (auth.uid() = user_id);

-- follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_read" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- dossier_exports
ALTER TABLE public.dossier_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dossier_read" ON public.dossier_exports FOR SELECT USING (auth.uid() = user_id OR auth.uid() = exporter_id);
CREATE POLICY "dossier_insert" ON public.dossier_exports FOR INSERT WITH CHECK (auth.uid() = exporter_id);

-- conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_read" ON public.conversations FOR SELECT USING (auth.uid() = ANY(participant_ids));
CREATE POLICY "conversations_insert" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));

-- messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_read" ON public.messages FOR SELECT USING (
  auth.uid() IN (SELECT unnest(participant_ids) FROM conversations WHERE id = conversation_id)
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- message_requests
ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_requests_read" ON public.message_requests FOR SELECT USING (auth.uid() IN (from_user_id, to_user_id));
CREATE POLICY "msg_requests_insert" ON public.message_requests FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "msg_requests_update" ON public.message_requests FOR UPDATE USING (auth.uid() = to_user_id);

-- audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_read" ON public.audit_log FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','super_admin')));
CREATE POLICY "audit_insert" ON public.audit_log FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- watchlist
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watchlist_read" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "watchlist_insert" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_delete" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);

-- 8. MOMENTUM ENGINE FUNCTIONS

-- Calculate and update momentum score
CREATE OR REPLACE FUNCTION calculate_momentum_score(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  milestone_count INTEGER;
  post_count INTEGER;
  recent_activity INTEGER;
  investor_engagement INTEGER;
  verification_bonus INTEGER;
  days_since_last INTEGER;
  decay_penalty INTEGER;
  total_score INTEGER;
BEGIN
  -- Count milestones
  SELECT COUNT(*) INTO milestone_count FROM public.milestones WHERE user_id = $1;
  
  -- Count posts
  SELECT COUNT(*) INTO post_count FROM public.posts WHERE user_id = $1;
  
  -- Recent activity (last 30 days)
  SELECT COUNT(*) INTO recent_activity FROM public.posts 
    WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days';
  
  -- Investor engagement (signals on posts)
  SELECT COUNT(*) INTO investor_engagement FROM public.post_signals ps
    JOIN public.posts p ON p.id = ps.post_id
    WHERE p.user_id = $1;
  
  -- Verification bonus
  SELECT CASE WHEN verified THEN 20 ELSE 0 END INTO verification_bonus 
    FROM public.profiles WHERE id = $1;
  
  -- Days since last activity (for decay)
  SELECT COALESCE(
    (SELECT EXTRACT(DAY FROM NOW() - MAX(created_at)) FROM public.posts WHERE user_id = $1),
    999
  ) INTO days_since_last;
  
  -- Decay penalty: -5 per 30 days inactive
  decay_penalty := GREATEST(0, (days_since_last / 30) * 5);
  
  -- Calculate total (capped at 100)
  total_score := LEAST(100, GREATEST(0,
    milestone_count * 10 +
    post_count * 3 +
    recent_activity * 5 +
    investor_engagement * 2 +
    verification_bonus -
    decay_penalty
  ));
  
  -- Update profile
  UPDATE public.profiles SET momentum_score = total_score WHERE id = $1;
  
  -- Record history
  INSERT INTO public.momentum_history (user_id, score, reason, metadata)
  VALUES ($1, total_score, 'recalculation', jsonb_build_object(
    'milestones', milestone_count,
    'posts', post_count,
    'recent_activity', recent_activity,
    'investor_engagement', investor_engagement,
    'days_inactive', days_since_last,
    'decay', decay_penalty
  ));
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function: auto-recalculate on relevant changes
CREATE OR REPLACE FUNCTION trigger_momentum_recalc()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_momentum_score(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers
DROP TRIGGER IF EXISTS trg_momentum_post ON public.posts;
CREATE TRIGGER trg_momentum_post AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION trigger_momentum_recalc();

DROP TRIGGER IF EXISTS trg_momentum_milestone ON public.milestones;
CREATE TRIGGER trg_momentum_milestone AFTER INSERT OR DELETE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION trigger_momentum_recalc();

DROP TRIGGER IF EXISTS trg_momentum_signal ON public.post_signals;
CREATE TRIGGER trg_momentum_signal AFTER INSERT OR DELETE ON public.post_signals
  FOR EACH ROW EXECUTE FUNCTION trigger_momentum_recalc();

-- 9. PROFILE TIMELINE AUTO-POPULATION
CREATE OR REPLACE FUNCTION add_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profile_timeline (user_id, event_type, title, description, reference_id, event_metadata)
  VALUES (
    COALESCE(NEW.user_id, NEW.id),
    TG_ARGV[0],
    CASE TG_ARGV[0]
      WHEN 'milestone' THEN 'Completed Milestone'
      WHEN 'post' THEN 'New ' || NEW.type || ' Post'
      WHEN 'verification' THEN 'Verification ' || NEW.status
      WHEN 'achievement' THEN 'Achievement Unlocked'
      ELSE 'Activity'
    END,
    COALESCE(NEW.title, NEW.description, ''),
    COALESCE(NEW.id, NEW.reference_id),
    jsonb_build_object('table', TG_TABLE_NAME)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_timeline_post ON public.posts;
CREATE TRIGGER trg_timeline_post AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION add_timeline_event('post');

DROP TRIGGER IF EXISTS trg_timeline_milestone ON public.milestones;
CREATE TRIGGER trg_timeline_milestone AFTER INSERT ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION add_timeline_event('milestone');

-- 10. AUDIT LOG AUTO-LOGGING
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    TG_ARGV[0] || '_' || TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('changes', row_to_json(COALESCE(NEW, OLD))::text)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

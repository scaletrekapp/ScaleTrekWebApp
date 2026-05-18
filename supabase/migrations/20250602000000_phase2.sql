-- Phase 2: Dossier, Disputes, Migration tables

-- MILESTONES (dedicated table)
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disputed','overridden','deleted')),
  risk_level INTEGER DEFAULT 50 CHECK (risk_level BETWEEN 0 AND 100),
  reality_score INTEGER DEFAULT 0 CHECK (reality_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_read" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "milestones_insert" ON public.milestones FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM posts WHERE id = post_id));
CREATE POLICY "milestones_admin" ON public.milestones FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','super_admin'))
);

-- DISPUTES
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','under_review','resolved','dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id)
);
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disputes_insert" ON public.disputes FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "disputes_read" ON public.disputes FOR SELECT USING (true);
CREATE POLICY "disputes_admin" ON public.disputes FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','super_admin'))
);

-- MIGRATION REQUESTS
CREATE TABLE IF NOT EXISTS public.migration_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  current_type TEXT NOT NULL CHECK (current_type IN ('dreamer','investor')),
  target_type TEXT NOT NULL CHECK (target_type IN ('reality','investor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id)
);
ALTER TABLE public.migration_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "migration_self" ON public.migration_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "migration_admin" ON public.migration_requests FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','super_admin'))
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_milestones_post_id ON public.milestones(post_id);
CREATE INDEX IF NOT EXISTS idx_disputes_milestone_id ON public.disputes(milestone_id);
CREATE INDEX IF NOT EXISTS idx_migration_requests_user_id ON public.migration_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_migration_requests_status ON public.migration_requests(status);

-- Trigger: on migration approve, update profile type
CREATE OR REPLACE FUNCTION handle_migration_approve()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE profiles SET role = NEW.target_type WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_migration_approve ON public.migration_requests;
CREATE TRIGGER trg_migration_approve
  AFTER UPDATE OF status ON public.migration_requests
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION handle_migration_approve();

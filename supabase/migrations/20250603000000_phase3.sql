-- PHASE 3: Launch readiness — payment concierge, investor vetting, invite codes, push notifications, RTL support

-- 1. INVITE CODES
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','pro','elite')),
  max_uses INTEGER DEFAULT 1,
  uses INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SUBSCRIPTIONS — add elite tier, payment fields
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_tier_check CHECK (tier IN ('free','pro','elite'));
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'none' CHECK (payment_status IN ('none','pending','paid','overdue'));
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- 3. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('pro','elite')),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'MAD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','cancelled')),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  bank_details JSONB,
  receipt_url TEXT,
  receipt_uploaded_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INVESTOR PROFILES — add vetting / KYC fields
ALTER TABLE public.investor_profiles ADD COLUMN IF NOT EXISTS investor_status TEXT DEFAULT 'pending' CHECK (investor_status IN ('pending','approved','rejected'));
ALTER TABLE public.investor_profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.investor_profiles ADD COLUMN IF NOT EXISTS credential_url TEXT;
ALTER TABLE public.investor_profiles ADD COLUMN IF NOT EXISTS company_proof_url TEXT;
ALTER TABLE public.investor_profiles ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.investor_profiles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.investor_profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
DROP POLICY IF EXISTS "investor_profiles_self_all" ON public.investor_profiles;

-- 5. PUSH NOTIFICATIONS — device tokens table
CREATE TABLE IF NOT EXISTS public.push_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('web','android','ios')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token)
);

-- 6. AUTO-PROFILE TRIGGER — handle invite code on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $func$
DECLARE
  v_role TEXT;
  v_tier TEXT;
  v_invite_code TEXT;
  v_invite_record RECORD;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'dreamer');
  v_tier := 'free';
  v_invite_code := NEW.raw_user_meta_data->>'invite_code';

  IF v_invite_code IS NOT NULL AND v_invite_code != '' THEN
    SELECT * INTO v_invite_record FROM public.invite_codes
    WHERE code = v_invite_code AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND uses < max_uses
    FOR UPDATE;

    IF FOUND THEN
      v_tier := v_invite_record.tier;
      UPDATE public.invite_codes SET uses = uses + 1 WHERE id = v_invite_record.id;
    END IF;
  END IF;

  INSERT INTO public.profiles (id, handle, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)), v_role);

  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, v_tier, 'active');

  RETURN NEW;
END;
$func$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. RLS POLICIES
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_invite_codes" ON public.invite_codes FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','super_admin')));
CREATE POLICY "public_read_active_invite" ON public.invite_codes FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_self_select" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_all_invoices" ON public.invoices FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','super_admin')));
CREATE POLICY "invoices_self_update" ON public.invoices FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investor_profiles_self_select" ON public.investor_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "investor_profiles_self_insert" ON public.investor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "investor_profiles_self_update" ON public.investor_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin_all_investor_profiles" ON public.investor_profiles FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','super_admin')));
CREATE POLICY "investor_profiles_public_read_approved" ON public.investor_profiles FOR SELECT USING (investor_status = 'approved');

ALTER TABLE public.push_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_devices_self" ON public.push_devices FOR ALL USING (auth.uid() = user_id);

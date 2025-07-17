-- ===============================================
-- SKATEBOARD CONTEST APP - QUICK SETUP SQL
-- ===============================================
-- Führe diese Datei in deinem Supabase SQL Editor aus
-- Reihenfolge: 1. Extensions, 2. Schema, 3. Security

-- ===============================================
-- 1. EXTENSIONS
-- ===============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================
-- 2. ENUMS (Datentypen)
-- ===============================================
CREATE TYPE user_role_type AS ENUM ('skater', 'judge', 'head_judge', 'admin', 'super_admin', 'commentator');
CREATE TYPE stance_type AS ENUM ('regular', 'goofy');
CREATE TYPE run_type AS ENUM ('single_run', 'jam');
CREATE TYPE contest_format AS ENUM ('street', 'bowl', 'park', 'vert');
CREATE TYPE contest_phase AS ENUM ('qualifier', 'semi', 'final');
CREATE TYPE contest_status AS ENUM ('draft', 'active', 'finished');
CREATE TYPE heat_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- ===============================================
-- 3. CORE TABLES
-- ===============================================

-- Users Tabelle (erweitert die auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  address TEXT,
  stance stance_type,
  sponsors TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contest_id UUID,
  role user_role_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contests
CREATE TABLE public.contests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  format contest_format NOT NULL,
  run_type run_type NOT NULL,
  skaters_per_jam INTEGER,
  enable_head_judge BOOLEAN DEFAULT false,
  status contest_status DEFAULT 'draft',
  current_phase contest_phase,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contest Categories
CREATE TABLE public.contest_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Registrations
CREATE TABLE public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.contest_categories(id) ON DELETE CASCADE NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  payment_id TEXT,
  total_fee DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Heats
CREATE TABLE public.heats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.contest_categories(id) ON DELETE CASCADE NOT NULL,
  phase contest_phase NOT NULL,
  heat_number INTEGER NOT NULL,
  participants UUID[] NOT NULL DEFAULT '{}',
  runs_per_skater INTEGER DEFAULT 2,
  time_per_run INTEGER DEFAULT 45,
  status heat_status DEFAULT 'pending',
  current_skater_index INTEGER,
  current_run INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Scores
CREATE TABLE public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  heat_id UUID REFERENCES public.heats(id) ON DELETE CASCADE NOT NULL,
  skater_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  judge_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  run_number INTEGER NOT NULL,
  score DECIMAL(3,1) NOT NULL CHECK (score >= 0 AND score <= 10),
  notes TEXT,
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Rankings
CREATE TABLE public.rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.contest_categories(id) ON DELETE CASCADE NOT NULL,
  skater_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phase contest_phase NOT NULL,
  position INTEGER NOT NULL,
  total_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  best_score DECIMAL(3,1) NOT NULL DEFAULT 0,
  average_score DECIMAL(3,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================
-- 4. SECURITY TABLES
-- ===============================================

-- Super Admin Setup
CREATE TABLE public.super_admin_setup (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setup_token TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES auth.users(id)
);

-- 2FA
CREATE TABLE public.user_2fa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  secret TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================
-- 5. INDEXES für Performance
-- ===============================================
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_contests_status ON public.contests(status);
CREATE INDEX idx_contests_date ON public.contests(date);
CREATE INDEX idx_scores_heat_id ON public.scores(heat_id);
CREATE INDEX idx_scores_skater_id ON public.scores(skater_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);

-- ===============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ===============================================

-- Enable RLS für alle Tabellen
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_setup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 7. RLS POLICIES
-- ===============================================

-- Users: Können ihre eigenen Daten sehen und bearbeiten
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- User Roles: Können eigene Rollen sehen
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Contests: Öffentliche Contests sind für alle sichtbar
CREATE POLICY "Public contests viewable" ON public.contests FOR SELECT USING (status IN ('active', 'finished'));
CREATE POLICY "Contest creators can manage" ON public.contests FOR ALL USING (auth.uid() = created_by);

-- Super Admin: Vollzugriff für Super Admins
CREATE POLICY "Super admins full access" ON public.user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- Audit Logs: Nur Super Admins können sehen
CREATE POLICY "Super admins view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- ===============================================
-- 8. FUNCTIONS
-- ===============================================

-- Funktion zum Erstellen eines Users in public.users beim Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für automatische User-Erstellung
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Audit Log Funktion
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    inet_client_addr()
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- 9. INITIAL DATA
-- ===============================================

-- Initial Setup Token (wird durch Environment Variable überschrieben)
INSERT INTO public.super_admin_setup (setup_token) 
VALUES ('CHANGE_ME_IN_PRODUCTION')
ON CONFLICT (setup_token) DO NOTHING;

-- ===============================================
-- SETUP COMPLETE!
-- ===============================================
-- Nächste Schritte:
-- 1. Supabase anon key und URL notieren
-- 2. Setup token in Environment Variables setzen
-- 3. Coolify deployment starten
-- 4. Super Admin über /auth/super-admin/initial-setup erstellen
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role_type AS ENUM ('skater', 'judge', 'head_judge', 'admin', 'super_admin', 'commentator');
CREATE TYPE stance_type AS ENUM ('regular', 'goofy');
CREATE TYPE run_type AS ENUM ('single_run', 'jam');
CREATE TYPE contest_format AS ENUM ('street', 'bowl', 'park', 'vert');
CREATE TYPE contest_phase AS ENUM ('qualifier', 'semi', 'final');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE contest_status AS ENUM ('draft', 'active', 'finished');
CREATE TYPE heat_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE scoring_system AS ENUM ('average', 'best', 'total');

-- Create users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    stance stance_type,
    sponsors TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    contest_id UUID,
    role user_role_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contests table
CREATE TABLE public.contests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    format contest_format NOT NULL,
    run_type run_type NOT NULL,
    skaters_per_jam INTEGER,
    enable_head_judge BOOLEAN DEFAULT FALSE,
    current_phase contest_phase,
    status contest_status DEFAULT 'draft',
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contest_categories table
CREATE TABLE public.contest_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contest_settings table
CREATE TABLE public.contest_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE NOT NULL,
    phase contest_phase NOT NULL,
    runs_per_skater INTEGER NOT NULL DEFAULT 2,
    time_per_run INTEGER NOT NULL DEFAULT 60, -- seconds
    auto_heat_threshold INTEGER NOT NULL DEFAULT 8,
    scoring_system scoring_system DEFAULT 'best',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contest_id, phase)
);

-- Create registrations table
CREATE TABLE public.registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.contest_categories(id) ON DELETE CASCADE NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    payment_id VARCHAR(255),
    total_fee DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contest_id, category_id)
);

-- Create heats table
CREATE TABLE public.heats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.contest_categories(id) ON DELETE CASCADE NOT NULL,
    phase contest_phase NOT NULL,
    heat_number INTEGER NOT NULL,
    participants UUID[] NOT NULL,
    runs_per_skater INTEGER NOT NULL DEFAULT 2,
    time_per_run INTEGER NOT NULL DEFAULT 60,
    status heat_status DEFAULT 'pending',
    current_skater_index INTEGER DEFAULT 0,
    current_run INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scores table
CREATE TABLE public.scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    heat_id UUID REFERENCES public.heats(id) ON DELETE CASCADE NOT NULL,
    skater_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    judge_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    run_number INTEGER NOT NULL,
    score DECIMAL(3,1) NOT NULL CHECK (score >= 0 AND score <= 10),
    notes TEXT,
    is_final BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(heat_id, skater_id, judge_id, run_number)
);

-- Create rankings table
CREATE TABLE public.rankings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.contest_categories(id) ON DELETE CASCADE NOT NULL,
    skater_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    phase contest_phase NOT NULL,
    position INTEGER NOT NULL,
    total_score DECIMAL(5,2) NOT NULL,
    best_score DECIMAL(3,1) NOT NULL,
    average_score DECIMAL(4,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contest_id, category_id, skater_id, phase)
);

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_contest_id ON user_roles(contest_id);
CREATE INDEX idx_contests_created_by ON contests(created_by);
CREATE INDEX idx_contests_date ON contests(date);
CREATE INDEX idx_contest_categories_contest_id ON contest_categories(contest_id);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_contest_id ON registrations(contest_id);
CREATE INDEX idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX idx_heats_contest_id ON heats(contest_id);
CREATE INDEX idx_heats_category_id ON heats(category_id);
CREATE INDEX idx_scores_heat_id ON scores(heat_id);
CREATE INDEX idx_scores_skater_id ON scores(skater_id);
CREATE INDEX idx_scores_judge_id ON scores(judge_id);
CREATE INDEX idx_rankings_contest_id ON rankings(contest_id);
CREATE INDEX idx_rankings_category_id ON rankings(category_id);
CREATE INDEX idx_rankings_skater_id ON rankings(skater_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contests_updated_at BEFORE UPDATE ON contests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contest_categories_updated_at BEFORE UPDATE ON contest_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contest_settings_updated_at BEFORE UPDATE ON contest_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_heats_updated_at BEFORE UPDATE ON heats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rankings_updated_at BEFORE UPDATE ON rankings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
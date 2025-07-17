-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles table policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin')
        )
    );

-- Contests table policies
CREATE POLICY "Anyone can view active contests" ON public.contests
    FOR SELECT USING (status IN ('active', 'finished'));

CREATE POLICY "Admins can manage contests" ON public.contests
    FOR ALL USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin')
            AND (ur.contest_id = id OR ur.role = 'super_admin')
        )
    );

-- Contest categories table policies
CREATE POLICY "Anyone can view contest categories for active contests" ON public.contest_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contests c 
            WHERE c.id = contest_id 
            AND c.status IN ('active', 'finished')
        )
    );

CREATE POLICY "Admins can manage contest categories" ON public.contest_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.contests c 
            WHERE c.id = contest_id 
            AND (
                c.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_roles ur 
                    WHERE ur.user_id = auth.uid() 
                    AND ur.role IN ('admin', 'super_admin')
                    AND (ur.contest_id = contest_id OR ur.role = 'super_admin')
                )
            )
        )
    );

-- Contest settings table policies
CREATE POLICY "Contest participants can view settings" ON public.contest_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contests c 
            WHERE c.id = contest_id 
            AND c.status IN ('active', 'finished')
        )
    );

CREATE POLICY "Admins can manage contest settings" ON public.contest_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.contests c 
            WHERE c.id = contest_id 
            AND (
                c.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_roles ur 
                    WHERE ur.user_id = auth.uid() 
                    AND ur.role IN ('admin', 'super_admin')
                    AND (ur.contest_id = contest_id OR ur.role = 'super_admin')
                )
            )
        )
    );

-- Registrations table policies
CREATE POLICY "Users can view their own registrations" ON public.registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create registrations" ON public.registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON public.registrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations for their contests" ON public.registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contests c 
            WHERE c.id = contest_id 
            AND (
                c.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_roles ur 
                    WHERE ur.user_id = auth.uid() 
                    AND ur.role IN ('admin', 'super_admin', 'judge', 'commentator')
                    AND (ur.contest_id = contest_id OR ur.role = 'super_admin')
                )
            )
        )
    );

-- Heats table policies
CREATE POLICY "Contest participants can view heats" ON public.heats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contests c 
            WHERE c.id = contest_id 
            AND c.status IN ('active', 'finished')
        )
    );

CREATE POLICY "Admins and commentators can manage heats" ON public.heats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.contests c 
            WHERE c.id = contest_id 
            AND (
                c.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_roles ur 
                    WHERE ur.user_id = auth.uid() 
                    AND ur.role IN ('admin', 'super_admin', 'commentator')
                    AND (ur.contest_id = contest_id OR ur.role = 'super_admin')
                )
            )
        )
    );

-- Scores table policies
CREATE POLICY "Anyone can view final scores" ON public.scores
    FOR SELECT USING (is_final = true);

CREATE POLICY "Judges can view all scores for their contests" ON public.scores
    FOR SELECT USING (
        auth.uid() = judge_id OR
        EXISTS (
            SELECT 1 FROM public.heats h
            JOIN public.contests c ON c.id = h.contest_id
            WHERE h.id = heat_id 
            AND (
                c.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_roles ur 
                    WHERE ur.user_id = auth.uid() 
                    AND ur.role IN ('admin', 'super_admin', 'head_judge')
                    AND (ur.contest_id = c.id OR ur.role = 'super_admin')
                )
            )
        )
    );

CREATE POLICY "Judges can create scores" ON public.scores
    FOR INSERT WITH CHECK (
        auth.uid() = judge_id AND
        EXISTS (
            SELECT 1 FROM public.heats h
            JOIN public.contests c ON c.id = h.contest_id
            WHERE h.id = heat_id 
            AND EXISTS (
                SELECT 1 FROM public.user_roles ur 
                WHERE ur.user_id = auth.uid() 
                AND ur.role IN ('judge', 'head_judge', 'admin', 'super_admin')
                AND (ur.contest_id = c.id OR ur.role = 'super_admin')
            )
        )
    );

CREATE POLICY "Judges can update their own scores" ON public.scores
    FOR UPDATE USING (
        auth.uid() = judge_id AND is_final = false
    );

CREATE POLICY "Head judges can finalize scores" ON public.scores
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.heats h
            JOIN public.contests c ON c.id = h.contest_id
            WHERE h.id = heat_id 
            AND EXISTS (
                SELECT 1 FROM public.user_roles ur 
                WHERE ur.user_id = auth.uid() 
                AND ur.role IN ('head_judge', 'admin', 'super_admin')
                AND (ur.contest_id = c.id OR ur.role = 'super_admin')
            )
        )
    );

-- Rankings table policies
CREATE POLICY "Anyone can view rankings for active contests" ON public.rankings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contests c 
            WHERE c.id = contest_id 
            AND c.status IN ('active', 'finished')
        )
    );

CREATE POLICY "System can manage rankings" ON public.rankings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.contests c 
            WHERE c.id = contest_id 
            AND (
                c.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_roles ur 
                    WHERE ur.user_id = auth.uid() 
                    AND ur.role IN ('admin', 'super_admin')
                    AND (ur.contest_id = contest_id OR ur.role = 'super_admin')
                )
            )
        )
    );
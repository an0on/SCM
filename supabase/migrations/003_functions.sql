-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate rankings
CREATE OR REPLACE FUNCTION public.calculate_rankings(
    p_contest_id UUID,
    p_category_id UUID,
    p_phase contest_phase
)
RETURNS VOID AS $$
DECLARE
    skater_record RECORD;
    rank_position INTEGER := 1;
BEGIN
    -- Delete existing rankings for this phase
    DELETE FROM public.rankings 
    WHERE contest_id = p_contest_id 
    AND category_id = p_category_id 
    AND phase = p_phase;

    -- Calculate rankings based on scoring system
    FOR skater_record IN
        WITH skater_scores AS (
            SELECT 
                s.skater_id,
                AVG(s.score) as avg_score,
                MAX(s.score) as best_score,
                SUM(s.score) as total_score,
                COUNT(s.score) as run_count
            FROM public.scores s
            JOIN public.heats h ON h.id = s.heat_id
            WHERE h.contest_id = p_contest_id 
            AND h.category_id = p_category_id 
            AND h.phase = p_phase
            AND s.is_final = true
            GROUP BY s.skater_id
        ),
        contest_settings AS (
            SELECT scoring_system
            FROM public.contest_settings
            WHERE contest_id = p_contest_id AND phase = p_phase
            LIMIT 1
        )
        SELECT 
            ss.skater_id,
            ss.avg_score,
            ss.best_score,
            ss.total_score,
            CASE 
                WHEN cs.scoring_system = 'average' THEN ss.avg_score
                WHEN cs.scoring_system = 'best' THEN ss.best_score
                WHEN cs.scoring_system = 'total' THEN ss.total_score
                ELSE ss.best_score
            END as final_score
        FROM skater_scores ss
        CROSS JOIN contest_settings cs
        ORDER BY final_score DESC
    LOOP
        INSERT INTO public.rankings (
            contest_id,
            category_id,
            skater_id,
            phase,
            position,
            total_score,
            best_score,
            average_score
        ) VALUES (
            p_contest_id,
            p_category_id,
            skater_record.skater_id,
            p_phase,
            rank_position,
            skater_record.total_score,
            skater_record.best_score,
            skater_record.avg_score
        );
        
        rank_position := rank_position + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-create heats when threshold is reached
CREATE OR REPLACE FUNCTION public.auto_create_heats(
    p_contest_id UUID,
    p_category_id UUID,
    p_phase contest_phase
)
RETURNS VOID AS $$
DECLARE
    settings_record RECORD;
    participant_count INTEGER;
    heat_count INTEGER;
    participants_per_heat INTEGER;
    heat_number INTEGER;
    skater_ids UUID[];
    current_participants UUID[];
    i INTEGER;
BEGIN
    -- Get contest settings
    SELECT * INTO settings_record
    FROM public.contest_settings
    WHERE contest_id = p_contest_id AND phase = p_phase;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contest settings not found for contest % phase %', p_contest_id, p_phase;
    END IF;

    -- Count paid participants
    SELECT COUNT(*) INTO participant_count
    FROM public.registrations r
    WHERE r.contest_id = p_contest_id 
    AND r.category_id = p_category_id
    AND r.payment_status = 'paid';

    -- Check if we should create heats
    IF participant_count < settings_record.auto_heat_threshold THEN
        RETURN;
    END IF;

    -- Delete existing heats for this phase
    DELETE FROM public.heats 
    WHERE contest_id = p_contest_id 
    AND category_id = p_category_id 
    AND phase = p_phase;

    -- Get participant IDs
    SELECT ARRAY_AGG(r.user_id) INTO skater_ids
    FROM public.registrations r
    WHERE r.contest_id = p_contest_id 
    AND r.category_id = p_category_id
    AND r.payment_status = 'paid'
    ORDER BY r.created_at;

    -- Calculate heats
    participants_per_heat := LEAST(settings_record.auto_heat_threshold, participant_count);
    heat_count := CEIL(participant_count::FLOAT / participants_per_heat::FLOAT);

    -- Create heats
    FOR heat_number IN 1..heat_count LOOP
        current_participants := '{}';
        
        -- Assign participants to this heat
        FOR i IN ((heat_number-1) * participants_per_heat + 1)..LEAST(heat_number * participants_per_heat, participant_count) LOOP
            current_participants := current_participants || skater_ids[i];
        END LOOP;

        INSERT INTO public.heats (
            contest_id,
            category_id,
            phase,
            heat_number,
            participants,
            runs_per_skater,
            time_per_run
        ) VALUES (
            p_contest_id,
            p_category_id,
            p_phase,
            heat_number,
            current_participants,
            settings_record.runs_per_skater,
            settings_record.time_per_run
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to advance contest phase
CREATE OR REPLACE FUNCTION public.advance_contest_phase(
    p_contest_id UUID
)
RETURNS contest_phase AS $$
DECLARE
    current_phase contest_phase;
    next_phase contest_phase;
BEGIN
    -- Get current phase
    SELECT current_phase INTO current_phase
    FROM public.contests
    WHERE id = p_contest_id;

    -- Determine next phase
    CASE current_phase
        WHEN 'qualifier' THEN next_phase := 'semi';
        WHEN 'semi' THEN next_phase := 'final';
        WHEN 'final' THEN next_phase := 'final'; -- Stay in final
        ELSE next_phase := 'qualifier';
    END CASE;

    -- Update contest
    UPDATE public.contests
    SET current_phase = next_phase,
        updated_at = NOW()
    WHERE id = p_contest_id;

    RETURN next_phase;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contest leaderboard
CREATE OR REPLACE FUNCTION public.get_contest_leaderboard(
    p_contest_id UUID,
    p_category_id UUID DEFAULT NULL,
    p_phase contest_phase DEFAULT NULL
)
RETURNS TABLE (
    skater_id UUID,
    skater_name VARCHAR,
    position INTEGER,
    total_score DECIMAL,
    best_score DECIMAL,
    average_score DECIMAL,
    phase contest_phase
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.skater_id,
        u.name as skater_name,
        r.position,
        r.total_score,
        r.best_score,
        r.average_score,
        r.phase
    FROM public.rankings r
    JOIN public.users u ON u.id = r.skater_id
    WHERE r.contest_id = p_contest_id
    AND (p_category_id IS NULL OR r.category_id = p_category_id)
    AND (p_phase IS NULL OR r.phase = p_phase)
    ORDER BY r.phase, r.position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
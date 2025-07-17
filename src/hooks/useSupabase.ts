import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Contest, UserRole, Registration, Heat, Score, Ranking } from '../types';

export const useContests = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select(`
          *,
          contest_categories (*)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setContests(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createContest = async (contestData: Partial<Contest>) => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .insert([contestData])
        .select()
        .single();

      if (error) throw error;
      await fetchContests();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateContest = async (id: string, updates: Partial<Contest>) => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchContests();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    contests,
    loading,
    error,
    fetchContests,
    createContest,
    updateContest,
  };
};

export const useRealtime = (table: string, callback: (payload: any) => void) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table }, 
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, callback]);
};

export const useHeats = (contestId?: string) => {
  const [heats, setHeats] = useState<Heat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contestId) {
      fetchHeats();
    }
  }, [contestId]);

  const fetchHeats = async () => {
    if (!contestId) return;
    
    try {
      const { data, error } = await supabase
        .from('heats')
        .select('*')
        .eq('contest_id', contestId)
        .order('phase', { ascending: true })
        .order('heat_number', { ascending: true });

      if (error) throw error;
      setHeats(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateHeat = async (id: string, updates: Partial<Heat>) => {
    try {
      const { data, error } = await supabase
        .from('heats')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchHeats();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    heats,
    loading,
    error,
    fetchHeats,
    updateHeat,
  };
};

export const useScores = (heatId?: string) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (heatId) {
      fetchScores();
    }
  }, [heatId]);

  const fetchScores = async () => {
    if (!heatId) return;
    
    try {
      const { data, error } = await supabase
        .from('scores')
        .select(`
          *,
          skater:users!scores_skater_id_fkey(name),
          judge:users!scores_judge_id_fkey(name)
        `)
        .eq('heat_id', heatId)
        .order('run_number', { ascending: true });

      if (error) throw error;
      setScores(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createScore = async (scoreData: Partial<Score>) => {
    try {
      const { data, error } = await supabase
        .from('scores')
        .insert([scoreData])
        .select()
        .single();

      if (error) throw error;
      await fetchScores();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateScore = async (id: string, updates: Partial<Score>) => {
    try {
      const { data, error } = await supabase
        .from('scores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchScores();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    scores,
    loading,
    error,
    fetchScores,
    createScore,
    updateScore,
  };
};
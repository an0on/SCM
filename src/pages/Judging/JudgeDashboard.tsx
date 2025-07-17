import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout/Layout';
import { Contest, Heat, Score, ContestCategory } from '../../types';
import { 
  Trophy, 
  Clock, 
  Users, 
  Star,
  Shield
} from 'lucide-react';
import ScoringInterface from '../../components/Judging/ScoringInterface';
import SkaterNotes from '../../components/Judging/SkaterNotes';

const JudgeDashboard: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [categories, setCategories] = useState<ContestCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ContestCategory | null>(null);
  const [currentHeat, setCurrentHeat] = useState<Heat | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkater, setSelectedSkater] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchJudgeContests();
    }
  }, [user]);

  useEffect(() => {
    if (selectedContest) {
      fetchCategories();
    }
  }, [selectedContest]);

  useEffect(() => {
    if (selectedContest && selectedCategory) {
      fetchCurrentHeat();
    }
  }, [selectedContest, selectedCategory]);

  // Real-time updates for heats and scores
  useRealtime('heats', (payload) => {
    if (currentHeat && payload.new.id === currentHeat.id) {
      setCurrentHeat(payload.new);
    }
  });

  useRealtime('scores', (payload) => {
    if (currentHeat && payload.new.heat_id === currentHeat.id) {
      fetchScores();
    }
  });

  const fetchJudgeContests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          contest_id,
          contests (*)
        `)
        .eq('user_id', user!.id)
        .in('role', ['judge', 'head_judge'])
        .not('contest_id', 'is', null);

      if (error) throw error;

      const contestData = data?.map((item: any) => item.contests).filter(Boolean) || [];
      setContests(contestData);
      
      if (contestData.length > 0) {
        setSelectedContest(contestData[0]);
      }
    } catch (error) {
      console.error('Error fetching judge contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!selectedContest) return;

    try {
      const { data, error } = await supabase
        .from('contest_categories')
        .select('*')
        .eq('contest_id', selectedContest.id);

      if (error) throw error;
      setCategories(data || []);
      
      if (data && data.length > 0) {
        setSelectedCategory(data[0]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCurrentHeat = async () => {
    if (!selectedContest || !selectedCategory) return;

    try {
      const { data, error } = await supabase
        .from('heats')
        .select('*')
        .eq('contest_id', selectedContest.id)
        .eq('category_id', selectedCategory.id)
        .eq('phase', selectedContest.current_phase || 'qualifier')
        .eq('status', 'in_progress')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCurrentHeat(data);
      if (data) {
        fetchScores();
      }
    } catch (error) {
      console.error('Error fetching current heat:', error);
    }
  };

  const fetchScores = async () => {
    if (!currentHeat) return;

    try {
      const { data, error } = await supabase
        .from('scores')
        .select(`
          *,
          skater:users!scores_skater_id_fkey(id, name),
          judge:users!scores_judge_id_fkey(id, name)
        `)
        .eq('heat_id', currentHeat.id);

      if (error) throw error;
      setScores(data || []);
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  const getCurrentSkater = () => {
    if (!currentHeat || !currentHeat.participants || currentHeat.current_skater_index === undefined) {
      return null;
    }
    return currentHeat.participants[currentHeat.current_skater_index];
  };


  if (!hasRole('judge') && !hasRole('head_judge')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access the judging panel.
          </p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded-apple"></div>
              <div className="h-64 bg-gray-200 rounded-apple"></div>
              <div className="h-64 bg-gray-200 rounded-apple"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (contests.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Judging Assignments</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't been assigned as a judge for any contests yet.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Judge Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Score runs and manage your judging assignments
          </p>
        </div>

        {/* Contest and Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contest</h2>
            <select
              value={selectedContest?.id || ''}
              onChange={(e) => {
                const contest = contests.find(c => c.id === e.target.value);
                setSelectedContest(contest || null);
              }}
              className="input-field"
            >
              {contests.map(contest => (
                <option key={contest.id} value={contest.id}>
                  {contest.title} - {new Date(contest.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Category</h2>
            <select
              value={selectedCategory?.id || ''}
              onChange={(e) => {
                const category = categories.find(c => c.id === e.target.value);
                setSelectedCategory(category || null);
              }}
              className="input-field"
              disabled={categories.length === 0}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedContest && selectedCategory && (
          <>
            {/* Current Heat Status */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Current Heat</h2>
                {currentHeat && (
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      currentHeat.status === 'in_progress' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {currentHeat.status === 'in_progress' ? 'Live' : 'Pending'}
                    </span>
                  </div>
                )}
              </div>

              {currentHeat ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Heat {currentHeat.heat_number}</p>
                      <p className="text-xs text-gray-500">{selectedContest.current_phase || 'Qualifier'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {currentHeat.participants?.length || 0} Skaters
                      </p>
                      <p className="text-xs text-gray-500">Participants</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{currentHeat.time_per_run}s</p>
                      <p className="text-xs text-gray-500">Per Run</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Run {currentHeat.current_run || 1} of {currentHeat.runs_per_skater}
                      </p>
                      <p className="text-xs text-gray-500">Current Run</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Heat</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Waiting for the commentator to start the next heat.
                  </p>
                </div>
              )}
            </div>

            {/* Main Judging Interface */}
            {currentHeat && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Scoring Interface */}
                <div className="lg:col-span-2">
                  <ScoringInterface
                    heat={currentHeat}
                    currentSkater={getCurrentSkater()}
                    judgeId={user!.id}
                    scores={scores}
                    onScoreSubmit={fetchScores}
                  />
                </div>

                {/* Skater Notes */}
                <div>
                  <SkaterNotes
                    heatId={currentHeat.id}
                    skaterId={selectedSkater}
                    judgeId={user!.id}
                  />
                </div>
              </div>
            )}

            {/* Participant List */}
            {currentHeat && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Heat Participants</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentHeat.participants?.map((skaterId, index) => {
                    const skaterScores = scores.filter(s => s.skater_id === skaterId);
                    const myScores = skaterScores.filter(s => s.judge_id === user!.id);
                    const isCurrentSkater = index === currentHeat.current_skater_index;
                    
                    return (
                      <div
                        key={skaterId}
                        className={`p-4 border rounded-apple cursor-pointer transition-colors ${
                          isCurrentSkater 
                            ? 'border-green-300 bg-green-50' 
                            : selectedSkater === skaterId
                            ? 'border-primary-300 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSkater(skaterId)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Skater {index + 1}
                            </p>
                            <p className="text-xs text-gray-500">
                              {myScores.length} / {currentHeat.runs_per_skater} scored
                            </p>
                          </div>
                          {isCurrentSkater && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600 font-medium">Active</span>
                            </div>
                          )}
                        </div>
                        
                        {myScores.length > 0 && (
                          <div className="mt-2 flex space-x-1">
                            {myScores.map((score, runIndex) => (
                              <span
                                key={runIndex}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {score.score}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default JudgeDashboard;
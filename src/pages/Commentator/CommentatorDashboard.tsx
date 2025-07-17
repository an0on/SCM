import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout/Layout';
import { Contest, Heat, ContestCategory } from '../../types';
import { 
  Play,
  Pause, 
  SkipForward,
  Timer,
  Users,
  Trophy,
  Shield,
  Volume2,
  AlertTriangle
} from 'lucide-react';
import CountdownTimer from '../../components/Commentator/CountdownTimer';
import HeatControl from '../../components/Commentator/HeatControl';

const CommentatorDashboard: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [categories, setCategories] = useState<ContestCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ContestCategory | null>(null);
  const [currentHeat, setCurrentHeat] = useState<Heat | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runInProgress, setRunInProgress] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchCommentatorContests();
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

  useEffect(() => {
    if (currentHeat && currentHeat.participants) {
      fetchParticipants();
    }
  }, [currentHeat]);

  // Real-time updates
  useRealtime('heats', (payload) => {
    if (currentHeat && payload.new.id === currentHeat.id) {
      setCurrentHeat(payload.new);
    }
  });

  const fetchCommentatorContests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          contest_id,
          contests (*)
        `)
        .eq('user_id', user!.id)
        .eq('role', 'commentator')
        .not('contest_id', 'is', null);

      if (error) throw error;

      const contestData = data?.map((item: any) => item.contests).filter(Boolean) || [];
      setContests(contestData as Contest[]);
      
      if (contestData.length > 0) {
        setSelectedContest(contestData[0]);
      }
    } catch (error) {
      console.error('Error fetching commentator contests:', error);
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
      // First try to get an in-progress heat
      let { data, error } = await supabase
        .from('heats')
        .select('*')
        .eq('contest_id', selectedContest.id)
        .eq('category_id', selectedCategory.id)
        .eq('phase', selectedContest.current_phase || 'qualifier')
        .eq('status', 'in_progress')
        .single();

      // If no in-progress heat, get the next pending heat
      if (error?.code === 'PGRST116') {
        const { data: pendingData, error: pendingError } = await supabase
          .from('heats')
          .select('*')
          .eq('contest_id', selectedContest.id)
          .eq('category_id', selectedCategory.id)
          .eq('phase', selectedContest.current_phase || 'qualifier')
          .eq('status', 'pending')
          .order('heat_number', { ascending: true })
          .limit(1)
          .single();

        if (pendingError && pendingError.code !== 'PGRST116') {
          throw pendingError;
        }
        data = pendingData;
      } else if (error) {
        throw error;
      }

      setCurrentHeat(data);
    } catch (error) {
      console.error('Error fetching current heat:', error);
    }
  };

  const fetchParticipants = async () => {
    if (!currentHeat || !currentHeat.participants) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, stance, sponsors')
        .in('id', currentHeat.participants);

      if (error) throw error;
      
      // Maintain the order from the heat participants array
      const orderedParticipants = currentHeat.participants.map(id => 
        data?.find(user => user.id === id)
      ).filter(Boolean);
      
      setParticipants(orderedParticipants);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const startRun = async () => {
    if (!currentHeat) return;

    try {
      // Update heat status to in_progress if it's pending
      if (currentHeat.status === 'pending') {
        await supabase
          .from('heats')
          .update({ status: 'in_progress' })
          .eq('id', currentHeat.id);
      }

      setRunInProgress(true);
      setTimeRemaining(currentHeat.time_per_run);
      
      // Start countdown
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setRunInProgress(false);
            return 0;
          }
          
          // Haptic feedback and audio alerts
          if (prev === Math.floor(currentHeat.time_per_run / 2)) {
            // Half-time alert
            playAlert('halfway');
          } else if (prev === 21) {
            // 20 second warning
            playAlert('20seconds');
          } else if (prev === 11) {
            // 10 second warning
            playAlert('10seconds');
          }
          
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting run:', error);
    }
  };

  const stopRun = () => {
    setRunInProgress(false);
    setTimeRemaining(0);
  };

  const nextSkater = async () => {
    if (!currentHeat) return;

    try {
      const nextIndex = (currentHeat.current_skater_index || 0) + 1;
      const nextRun = nextIndex >= currentHeat.participants.length 
        ? (currentHeat.current_run || 1) + 1 
        : currentHeat.current_run || 1;
      const nextSkaterIndex = nextIndex >= currentHeat.participants.length ? 0 : nextIndex;

      // Check if heat is complete
      if (nextRun > currentHeat.runs_per_skater) {
        await supabase
          .from('heats')
          .update({ 
            status: 'completed',
            current_skater_index: 0,
            current_run: 1
          })
          .eq('id', currentHeat.id);
        
        // Auto-calculate rankings
        await supabase.rpc('calculate_rankings', {
          p_contest_id: selectedContest!.id,
          p_category_id: selectedCategory!.id,
          p_phase: selectedContest!.current_phase || 'qualifier'
        });
        
        setRunInProgress(false);
        fetchCurrentHeat();
      } else {
        await supabase
          .from('heats')
          .update({ 
            current_skater_index: nextSkaterIndex,
            current_run: nextRun
          })
          .eq('id', currentHeat.id);
      }
    } catch (error) {
      console.error('Error advancing to next skater:', error);
    }
  };

  const playAlert = (type: string) => {
    // Create audio context for beeps
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = type === 'halfway' ? 800 : type === '20seconds' ? 1000 : 1200;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(type === '10seconds' ? [100, 50, 100] : 100);
      }
    } catch (error) {
      console.error('Error playing alert:', error);
    }
  };

  if (!hasRole('commentator')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access the commentator panel.
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <Volume2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Commentator Assignments</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't been assigned as a commentator for any contests yet.
          </p>
        </div>
      </Layout>
    );
  }

  const getCurrentSkater = () => {
    if (!currentHeat || !participants) return null;
    const index = currentHeat.current_skater_index || 0;
    return participants[index];
  };

  const getNextSkater = () => {
    if (!currentHeat || !participants) return null;
    const nextIndex = ((currentHeat.current_skater_index || 0) + 1) % participants.length;
    return participants[nextIndex];
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commentator Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Control contest runs and manage heat progression
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
            {/* Main Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Run Control */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Run Control</h2>
                
                {currentHeat ? (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Heat {currentHeat.heat_number} • Run {currentHeat.current_run} of {currentHeat.runs_per_skater}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          currentHeat.status === 'in_progress' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {currentHeat.status === 'in_progress' ? 'Live' : 'Ready'}
                        </span>
                      </div>
                      
                      <CountdownTimer 
                        timeRemaining={timeRemaining}
                        totalTime={currentHeat.time_per_run}
                        isRunning={runInProgress}
                      />
                    </div>

                    <div className="space-y-4">
                      {!runInProgress ? (
                        <button
                          onClick={startRun}
                          className="w-full btn-primary"
                        >
                          <Play className="h-5 w-5 mr-2" />
                          Start Run
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={stopRun}
                            className="btn-secondary"
                          >
                            <Pause className="h-5 w-5 mr-2" />
                            Stop
                          </button>
                          <button
                            onClick={nextSkater}
                            className="btn-primary"
                          >
                            <SkipForward className="h-5 w-5 mr-2" />
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Heat</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      All heats for this category have been completed.
                    </p>
                  </div>
                )}
              </div>

              {/* Current Skater Info */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Skater</h2>
                
                {getCurrentSkater() ? (
                  <div className="space-y-4">
                    <div className="bg-primary-50 rounded-apple p-4">
                      <h3 className="text-xl font-bold text-primary-900">
                        {getCurrentSkater()?.name}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-primary-700">
                        {getCurrentSkater()?.stance && (
                          <p>Stance: {getCurrentSkater()?.stance}</p>
                        )}
                        {getCurrentSkater()?.sponsors && (
                          <p>Sponsors: {getCurrentSkater()?.sponsors}</p>
                        )}
                      </div>
                    </div>

                    {getNextSkater() && (
                      <div className="bg-gray-50 rounded-apple p-4">
                        <h4 className="font-medium text-gray-900">Up Next:</h4>
                        <p className="text-gray-700">{getNextSkater()?.name}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Skater</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start a run to see the current skater.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Heat Management */}
            {currentHeat && (
              <HeatControl
                heat={currentHeat}
                participants={participants}
                onHeatUpdate={fetchCurrentHeat}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default CommentatorDashboard;
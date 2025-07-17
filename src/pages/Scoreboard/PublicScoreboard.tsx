import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useRealtime } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { Contest, ContestCategory, Ranking, Heat } from '../../types';
import { 
  Trophy, 
  Medal, 
  Star, 
  Users, 
  Calendar,
  MapPin,
  QrCode,
  RefreshCw,
  Clock,
  TrendingUp
} from 'lucide-react';

const PublicScoreboard: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [contest, setContest] = useState<Contest | null>(null);
  const [categories, setCategories] = useState<ContestCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ContestCategory | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [currentHeat, setCurrentHeat] = useState<Heat | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (contestId) {
      fetchContestData();
    }
  }, [contestId]);

  useEffect(() => {
    if (contest && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [contest, categories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchRankings();
      fetchCurrentHeat();
    }
  }, [selectedCategory, contest]);

  // Real-time updates
  useRealtime('rankings', (payload) => {
    if (selectedCategory && payload.new.category_id === selectedCategory.id) {
      fetchRankings();
      setLastUpdate(new Date());
    }
  });

  useRealtime('heats', (payload) => {
    if (selectedCategory && payload.new.category_id === selectedCategory.id) {
      fetchCurrentHeat();
      setLastUpdate(new Date());
    }
  });

  useRealtime('scores', (payload) => {
    // Refresh rankings when new scores come in
    fetchRankings();
    setLastUpdate(new Date());
  });

  const fetchContestData = async () => {
    try {
      const { data: contestData, error: contestError } = await supabase
        .from('contests')
        .select('*')
        .eq('id', contestId)
        .single();

      if (contestError) throw contestError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('contest_categories')
        .select('*')
        .eq('contest_id', contestId)
        .order('name', { ascending: true });

      if (categoriesError) throw categoriesError;

      setContest(contestData);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching contest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async () => {
    if (!contest || !selectedCategory) return;

    try {
      const { data, error } = await supabase
        .rpc('get_contest_leaderboard', {
          p_contest_id: contest.id,
          p_category_id: selectedCategory.id,
          p_phase: contest.current_phase || 'qualifier'
        });

      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    }
  };

  const fetchCurrentHeat = async () => {
    if (!contest || !selectedCategory) return;

    try {
      const { data, error } = await supabase
        .from('heats')
        .select('*')
        .eq('contest_id', contest.id)
        .eq('category_id', selectedCategory.id)
        .eq('phase', contest.current_phase || 'qualifier')
        .eq('status', 'in_progress')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCurrentHeat(data);
    } catch (error) {
      console.error('Error fetching current heat:', error);
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-6 w-6 text-gray-300" />;
    }
  };

  const getPositionColors = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
      default:
        return 'bg-white text-gray-900 border border-gray-200';
    }
  };

  const getCurrentURL = () => {
    return window.location.href;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scoreboard...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Contest not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The contest you're looking for doesn't exist or is not public.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                🛹 {contest.title}
              </h1>
              <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {contest.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(contest.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  {contest.format.charAt(0).toUpperCase() + contest.format.slice(1)}
                </div>
                {contest.current_phase && (
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {contest.current_phase.charAt(0).toUpperCase() + contest.current_phase.slice(1)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowQR(!showQR)}
                className="btn-secondary"
              >
                <QrCode className="h-5 w-5 mr-2" />
                QR Code
              </button>
              
              <div className="text-right text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
                <div className="flex items-center mt-1">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Live updates
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Modal */}
          {showQR && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-apple p-8 max-w-sm mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Scan to View Scoreboard
                </h3>
                <div className="flex justify-center mb-4">
                  <QRCode value={getCurrentURL()} size={200} />
                </div>
                <p className="text-xs text-gray-500 text-center mb-4">
                  Scan this QR code with your phone to view the live scoreboard
                </p>
                <button
                  onClick={() => setShowQR(false)}
                  className="w-full btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Selection */}
        {categories.length > 1 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-apple font-medium transition-colors ${
                    selectedCategory?.id === category.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Heat Status */}
        {currentHeat && (
          <div className="mb-8 card bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-green-900">
                  🔴 Live: Heat {currentHeat.heat_number}
                </h2>
                <p className="text-green-700">
                  Run {currentHeat.current_run} of {currentHeat.runs_per_skater} • 
                  Skater {(currentHeat.current_skater_index || 0) + 1} of {currentHeat.participants?.length || 0}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">LIVE</span>
              </div>
            </div>
          </div>
        )}

        {/* Rankings */}
        {selectedCategory && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory.name} Rankings
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{rankings.length} participants</span>
              </div>
            </div>

            {rankings.length > 0 ? (
              <div className="space-y-3">
                {rankings.map((ranking) => (
                  <div
                    key={ranking.skater_id}
                    className={`p-4 rounded-apple transition-all ${getPositionColors(ranking.position)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-20">
                          {getPositionIcon(ranking.position)}
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">
                            {ranking.skater_name}
                          </h3>
                          <p className="text-sm opacity-80">
                            Position #{ranking.position}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {ranking.best_score.toFixed(1)}
                        </div>
                        <div className="text-sm opacity-80">
                          Best Score
                        </div>
                        <div className="text-xs opacity-60 mt-1">
                          Avg: {ranking.average_score.toFixed(1)} | 
                          Total: {ranking.total_score.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Rankings Yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Rankings will appear here once scoring begins.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-500">
          <p>
            Live Skateboard Contest Scoreboard • 
            Updates automatically • 
            Powered by Supabase Realtime
          </p>
          <div className="mt-2 flex items-center justify-center space-x-4">
            <QRCode value={getCurrentURL()} size={60} />
            <div className="text-left">
              <p className="font-medium">Share this scoreboard</p>
              <p>Scan QR code or share URL</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicScoreboard;
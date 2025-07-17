import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout/Layout';
import { Contest } from '../../types';
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  Users, 
  Search,
  Filter
} from 'lucide-react';

const ContestList: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');

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
        .eq('status', 'active')
        .order('date', { ascending: true });

      if (error) throw error;
      setContests(data || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContests = contests.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contest.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = formatFilter === 'all' || contest.format === formatFilter;
    return matchesSearch && matchesFormat;
  });

  const getFormatIcon = (format: Contest['format']) => {
    return <Trophy className="h-5 w-5" />;
  };

  const getFormatColor = (format: Contest['format']) => {
    const colors = {
      street: 'bg-blue-100 text-blue-800',
      bowl: 'bg-purple-100 text-purple-800',
      park: 'bg-green-100 text-green-800',
      vert: 'bg-red-100 text-red-800',
    };
    return colors[format];
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-apple"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Skateboard Contests</h1>
          <p className="mt-2 text-gray-600">
            Find and register for upcoming skateboard contests
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search contests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="input-field w-40"
            >
              <option value="all">All Formats</option>
              <option value="street">Street</option>
              <option value="bowl">Bowl</option>
              <option value="park">Park</option>
              <option value="vert">Vert</option>
            </select>
          </div>
        </div>

        {/* Contest Grid */}
        {filteredContests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest) => (
              <div key={contest.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getFormatIcon(contest.format)}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFormatColor(contest.format)}`}>
                      {contest.format.charAt(0).toUpperCase() + contest.format.slice(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {contest.run_type.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {contest.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {contest.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(contest.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {contest.contest_categories && contest.contest_categories.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Categories:</p>
                    <div className="flex flex-wrap gap-1">
                      {contest.contest_categories.slice(0, 3).map((category: any) => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                        >
                          {category.name} - €{category.entry_fee}
                        </span>
                      ))}
                      {contest.contest_categories.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          +{contest.contest_categories.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Open Registration</span>
                  </div>
                  
                  <Link
                    to={`/contests/${contest.id}/register`}
                    className="btn-primary text-sm"
                  >
                    Register
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || formatFilter !== 'all' ? 'No contests found' : 'No contests available'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || formatFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Check back later for upcoming contests.'
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContestList;
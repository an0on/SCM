import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContests } from '../../hooks/useSupabase';
import { Contest } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  Trophy
} from 'lucide-react';

const ContestList: React.FC = () => {
  const { contests, loading, updateContest } = useContests();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredContests = contests.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contest.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (contestId: string, newStatus: Contest['status']) => {
    try {
      await updateContest(contestId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update contest status:', error);
    }
  };

  const getStatusBadge = (status: Contest['status']) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      finished: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getFormatBadge = (format: Contest['format']) => {
    const colors = {
      street: 'bg-blue-100 text-blue-800',
      bowl: 'bg-purple-100 text-purple-800',
      park: 'bg-green-100 text-green-800',
      vert: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[format]}`}>
        {format.charAt(0).toUpperCase() + format.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-apple"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contests</h1>
          <p className="mt-2 text-gray-600">
            Manage skateboard contests and their configurations
          </p>
        </div>
        <Link to="/admin/contests/new" className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          New Contest
        </Link>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="finished">Finished</option>
          </select>
        </div>
      </div>

      {/* Contest List */}
      {filteredContests.length > 0 ? (
        <div className="space-y-4">
          {filteredContests.map((contest) => (
            <div key={contest.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contest.title}
                    </h3>
                    {getStatusBadge(contest.status)}
                    {getFormatBadge(contest.format)}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Location:</span>
                      {contest.location}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Date:</span>
                      {new Date(contest.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Type:</span>
                      {contest.run_type.replace('_', ' ')}
                      {contest.run_type === 'jam' && ` (${contest.skaters_per_jam} skaters)`}
                    </div>
                    {contest.current_phase && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Phase:</span>
                        {contest.current_phase}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status Controls */}
                  {contest.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(contest.id, 'active')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-apple"
                      title="Start contest"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                  )}
                  
                  {contest.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(contest.id, 'finished')}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-apple"
                      title="Finish contest"
                    >
                      <Pause className="h-5 w-5" />
                    </button>
                  )}

                  {/* Action Buttons */}
                  <Link
                    to={`/admin/contests/${contest.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-apple"
                    title="View contest"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  
                  <Link
                    to={`/admin/contests/${contest.id}/edit`}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-apple"
                    title="Edit contest"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  
                  {contest.status === 'draft' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this contest?')) {
                          // TODO: Implement delete functionality
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-apple"
                      title="Delete contest"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}

                  <Link
                    to={`/scoreboard/${contest.id}`}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-apple"
                    title="View scoreboard"
                  >
                    <Trophy className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || statusFilter !== 'all' ? 'No contests found' : 'No contests yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first contest.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <div className="mt-6">
              <Link to="/admin/contests/new" className="btn-primary">
                <Plus className="h-5 w-5 mr-2" />
                Create Contest
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContestList;
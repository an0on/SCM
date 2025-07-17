import React from 'react';
import { Link } from 'react-router-dom';
import { useContests } from '../../hooks/useSupabase';
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp,
  Plus,
  AlertCircle
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { contests, loading } = useContests();

  const activeContests = contests.filter(c => c.status === 'active');
  const draftContests = contests.filter(c => c.status === 'draft');
  const finishedContests = contests.filter(c => c.status === 'finished');

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    change?: string; 
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, change, icon, color = 'primary' }) => (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-apple bg-${color}-500 text-white`}>
            {icon}
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-apple"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage contests, users, and system settings
          </p>
        </div>
        <Link to="/admin/contests/new" className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          New Contest
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Contests"
          value={activeContests.length}
          change="+2 this week"
          icon={<Trophy className="h-6 w-6" />}
        />
        <StatCard
          title="Draft Contests"
          value={draftContests.length}
          icon={<Calendar className="h-6 w-6" />}
          color="yellow"
        />
        <StatCard
          title="Total Contests"
          value={contests.length}
          change="+12% this month"
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Finished Contests"
          value={finishedContests.length}
          icon={<Users className="h-6 w-6" />}
          color="gray"
        />
      </div>

      {/* Recent Contests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Contests</h2>
            <Link to="/admin/contests" className="text-primary-600 text-sm font-medium">
              View all
            </Link>
          </div>
          
          {activeContests.length > 0 ? (
            <div className="space-y-3">
              {activeContests.slice(0, 5).map((contest) => (
                <div 
                  key={contest.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-apple"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{contest.title}</h3>
                    <p className="text-sm text-gray-500">{contest.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(contest.date).toLocaleDateString()}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {contest.current_phase || 'Starting'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active contests</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create a new contest to get started.
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Draft Contests</h2>
            <Link to="/admin/contests?status=draft" className="text-primary-600 text-sm font-medium">
              View all
            </Link>
          </div>
          
          {draftContests.length > 0 ? (
            <div className="space-y-3">
              {draftContests.slice(0, 5).map((contest) => (
                <div 
                  key={contest.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-apple"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{contest.title}</h3>
                    <p className="text-sm text-gray-500">{contest.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(contest.date).toLocaleDateString()}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Draft
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No draft contests</h3>
              <p className="mt-1 text-sm text-gray-500">
                All contests are either active or finished.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/admin/contests/new"
            className="flex items-center p-4 border border-gray-200 rounded-apple hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-8 w-8 text-primary-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Create Contest</h3>
              <p className="text-sm text-gray-500">Set up a new skateboard contest</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-apple hover:bg-gray-50 transition-colors"
          >
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">View and edit user accounts</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/roles"
            className="flex items-center p-4 border border-gray-200 rounded-apple hover:bg-gray-50 transition-colors"
          >
            <AlertCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Assign Roles</h3>
              <p className="text-sm text-gray-500">Manage user roles and permissions</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
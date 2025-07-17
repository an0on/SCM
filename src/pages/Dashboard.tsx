import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout/Layout';
import { Calendar, Trophy, Users, BarChart } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();

  const DashboardCard: React.FC<{ icon: React.ReactNode; title: string; value: string; description: string }> = 
    ({ icon, title, value, description }) => (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="p-3 bg-primary-500 rounded-apple text-white">
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.user_metadata?.name || user?.email}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your skateboard contests today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            icon={<Calendar size={24} />}
            title="Active Contests"
            value="3"
            description="Contests currently running"
          />
          <DashboardCard
            icon={<Users size={24} />}
            title="Registered Skaters"
            value="127"
            description="Total participants"
          />
          <DashboardCard
            icon={<Trophy size={24} />}
            title="Completed Contests"
            value="8"
            description="This season"
          />
          <DashboardCard
            icon={<BarChart size={24} />}
            title="Avg Score"
            value="7.2"
            description="Current average"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-900">Street Contest 2024 - Semi Finals</span>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-900">New skater registered: Max Mueller</span>
                <span className="text-sm text-gray-500">5 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-900">Bowl Contest 2024 completed</span>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {hasRole('admin') && (
                <button className="w-full btn-primary text-left">
                  Create New Contest
                </button>
              )}
              {hasRole('judge') && (
                <button className="w-full btn-secondary text-left">
                  Start Judging Session
                </button>
              )}
              {hasRole('commentator') && (
                <button className="w-full btn-secondary text-left">
                  Open Commentator Panel
                </button>
              )}
              <button className="w-full btn-secondary text-left">
                View Live Scoreboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
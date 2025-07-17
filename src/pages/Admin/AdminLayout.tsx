import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout/Layout';
import { 
  Trophy, 
  Users, 
  Settings, 
  Calendar, 
  BarChart3,
  UserCheck,
  Shield
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { hasRole } = useAuth();
  const location = useLocation();

  if (!hasRole('admin') && !hasRole('super_admin')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </Layout>
    );
  }

  const navigation = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Contests', href: '/admin/contests', icon: Trophy },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Roles', href: '/admin/roles', icon: UserCheck },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <Layout>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="flex flex-col h-full">
            <div className="px-4 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-colors
                      ${isActive
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLayout;
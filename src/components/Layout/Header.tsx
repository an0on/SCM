import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              🛹 Skateboard Contest
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            {user && (
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
            )}
            <Link to="/contests" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Contests
            </Link>
            {user && hasRole('judge') && (
              <Link to="/judging" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Judging
              </Link>
            )}
            {user && hasRole('commentator') && (
              <Link to="/commentator" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Commentator
              </Link>
            )}
            {user && (hasRole('admin') || hasRole('super_admin')) && (
              <Link to="/admin" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => navigate('/profile')}
                  className="p-2 text-gray-700 hover:text-gray-900"
                  title="Profil"
                >
                  <User size={20} />
                </button>
                <button 
                  onClick={() => navigate('/settings')}
                  className="p-2 text-gray-700 hover:text-gray-900"
                  title="Einstellungen"
                >
                  <Settings size={20} />
                </button>
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-gray-700 hover:text-gray-900"
                  title="Ausloggen"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-gray-900">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
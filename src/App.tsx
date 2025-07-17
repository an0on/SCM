import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/Home/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ContestList from './pages/Admin/ContestList';
import ContestCreate from './pages/Admin/ContestCreate';
import ContestRegistration from './pages/Contests/ContestRegistration';
import PublicContestList from './pages/Contests/ContestList';
import JudgeDashboard from './pages/Judging/JudgeDashboard';
import CommentatorDashboard from './pages/Commentator/CommentatorDashboard';
import PublicScoreboard from './pages/Scoreboard/PublicScoreboard';
import SuperAdminInitialSetup from './pages/Auth/SuperAdminInitialSetup';
import SuperAdminLogin from './pages/Auth/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';
import Privacy from './pages/Privacy';
import CookieConsent from './components/GDPR/CookieConsent';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/contests" element={<PublicContestList />} />
            <Route path="/contests/:contestId/register" element={<ContestRegistration />} />
            <Route path="/scoreboard/:contestId" element={<PublicScoreboard />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Super Admin Routes */}
            <Route path="/auth/super-admin/initial-setup" element={<SuperAdminInitialSetup />} />
            <Route path="/auth/super-admin/login" element={<SuperAdminLogin />} />
            <Route 
              path="/super-admin/dashboard" 
              element={
                <ProtectedRoute>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Judging Routes */}
            <Route 
              path="/judging" 
              element={
                <ProtectedRoute>
                  <JudgeDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Commentator Routes */}
            <Route 
              path="/commentator" 
              element={
                <ProtectedRoute>
                  <CommentatorDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="contests" element={<ContestList />} />
              <Route path="contests/new" element={<ContestCreate />} />
            </Route>
            
            {/* Legacy redirects */}
            <Route path="/login" element={<Navigate to="/auth/login" />} />
            <Route path="/register" element={<Navigate to="/auth/register" />} />
          </Routes>
          <CookieConsent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

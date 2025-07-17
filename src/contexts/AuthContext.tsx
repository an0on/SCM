import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserRole, UserRoleType } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRoles: UserRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRoleType, contestId?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserRoles(session.user.id);
        } else {
          setUserRoles([]);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    console.log('Fetching roles for user:', userId);
    
    try {
      // Try to get roles from Supabase first
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        console.log('Found roles in Supabase:', data);
        setUserRoles(data);
        return;
      }
    } catch (error) {
      console.log('Supabase not available, checking localStorage');
    }

    // Fallback to localStorage for demo (Super Admin)
    const superAdminRole = localStorage.getItem('super_admin_role');
    const superAdminUser = localStorage.getItem('super_admin_user');
    
    console.log('Checking localStorage for Super Admin role...');
    console.log('Super Admin Role:', superAdminRole);
    console.log('Super Admin User:', superAdminUser);
    
    if (superAdminRole && superAdminUser) {
      const roleData = JSON.parse(superAdminRole);
      const userData = JSON.parse(superAdminUser);
      
      console.log('Parsed role data:', roleData);
      console.log('Parsed user data:', userData);
      console.log('Current user email:', user?.email);
      console.log('Current user id:', userId);
      
      // Check if current user is the Super Admin (by email or user_id)
      if (roleData.user_id === userId || userData.email === user?.email) {
        console.log('Super Admin role found! Setting roles...');
        setUserRoles([roleData]);
        return;
      }
    }

    console.log('No roles found, setting empty array');
    setUserRoles([]);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      // Fallback for Super Admin localStorage login
      const superAdminUser = localStorage.getItem('super_admin_user');
      if (superAdminUser) {
        const userData = JSON.parse(superAdminUser);
        if (userData.email === email) {
          // Simulate successful login by setting user state
          setUser({
            id: userData.id,
            email: userData.email,
            app_metadata: {},
            aud: 'authenticated',
            created_at: userData.created_at,
            user_metadata: { 
              name: userData.name,
              two_fa_enabled: userData.two_fa_enabled,
              two_fa_secret: userData.two_fa_secret,
              backup_codes: userData.backup_codes
            }
          });
          await fetchUserRoles(userData.id);
          return;
        }
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const hasRole = (role: UserRoleType, contestId?: string): boolean => {
    return userRoles.some(userRole => 
      userRole.role === role && 
      (!contestId || userRole.contest_id === contestId || role === 'super_admin')
    );
  };

  const value: AuthContextType = {
    user,
    session,
    userRoles,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
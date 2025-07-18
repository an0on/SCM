import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout/Layout';
import { 
  Crown, 
  Shield, 
  Users, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Plus, 
  Mail, 
  Eye, 
  Trash2,
  Clock,
  Globe,
  Key,
  Database,
  Monitor
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  created_at: string;
  users?: { name: string; email: string };
}

interface LoginAttempt {
  id?: string;
  email: string;
  success: boolean;
  failure_reason?: string;
  ip_address?: string;
  created_at?: string;
  timestamp?: string;
}

interface SuperAdminInvitation {
  id: string;
  email: string;
  invited_by: string;
  expires_at: string;
  is_used: boolean;
  created_at: string;
}

interface SecuritySession {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  is_active: boolean;
  last_activity: string;
  created_at: string;
  users?: { name: string; email: string };
}

const SuperAdminDashboard: React.FC = () => {
  const { user, hasRole, userRoles } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit' | 'security' | 'invitations'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [invitations, setInvitations] = useState<SuperAdminInvitation[]>([]);
  const [securitySessions, setSecuritySessions] = useState<SecuritySession[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeContests: 0,
    totalLoginAttempts: 0,
    failedLogins: 0,
    activeSessions: 0
  });

  // Invitation form
  const [invitationEmail, setInvitationEmail] = useState('');
  const [invitationLoading, setInvitationLoading] = useState(false);

  useEffect(() => {
    if (user && hasRole('super_admin')) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, hasRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchAuditLogs(),
        fetchLoginAttempts(),
        fetchInvitations(),
        fetchSecuritySessions()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Fehler beim Laden der Dashboard-Daten');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const [usersData, contestsData, loginAttemptsData, sessionsData] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('contests').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('login_attempts').select('id, success', { count: 'exact' }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('security_sessions').select('id', { count: 'exact' }).eq('is_active', true)
    ]);

    setStats({
      totalUsers: usersData.count || 0,
      activeContests: contestsData.count || 0,
      totalLoginAttempts: loginAttemptsData.count || 0,
      failedLogins: loginAttemptsData.data?.filter(attempt => !attempt.success).length || 0,
      activeSessions: sessionsData.count || 0
    });
  };

  const fetchAuditLogs = async () => {
    try {
      // Simplified audit logs - use localStorage for demo
      const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      setAuditLogs(logs.slice(-50).reverse()); // Last 50, newest first
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs([]);
    }
  };

  const fetchLoginAttempts = async () => {
    try {
      // Get login attempts from localStorage (simplified)
      const attempts = JSON.parse(localStorage.getItem('login_attempts') || '[]');
      setLoginAttempts(attempts.slice(-50).reverse()); // Last 50, newest first
    } catch (error) {
      console.error('Error fetching login attempts:', error);
      setLoginAttempts([]);
    }
  };

  const fetchInvitations = async () => {
    try {
      // Simplified invitations - use localStorage for demo
      const invitations = JSON.parse(localStorage.getItem('super_admin_invitations') || '[]');
      setInvitations(invitations.reverse()); // Newest first
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setInvitations([]);
    }
  };

  const fetchSecuritySessions = async () => {
    try {
      // Simplified security sessions - use localStorage for demo
      const sessions = JSON.parse(localStorage.getItem('security_sessions') || '[]');
      setSecuritySessions(sessions.reverse()); // Newest first
    } catch (error) {
      console.error('Error fetching security sessions:', error);
      setSecuritySessions([]);
    }
  };

  const createInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvitationLoading(true);
    setError(null);

    try {
      const invitationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

      const invitation = {
        id: crypto.randomUUID(),
        email: invitationEmail,
        invitation_token: invitationToken,
        invited_by: user!.id,
        expires_at: expiresAt.toISOString(),
        is_used: false,
        created_at: new Date().toISOString()
      };

      // Store in localStorage (simplified)
      const existingInvitations = JSON.parse(localStorage.getItem('super_admin_invitations') || '[]');
      existingInvitations.push(invitation);
      localStorage.setItem('super_admin_invitations', JSON.stringify(existingInvitations));

      // Log audit event (simplified)
      const auditEntry = {
        id: crypto.randomUUID(),
        user_id: user!.id,
        action: 'super_admin_invitation_created',
        resource_type: 'invitation',
        resource_id: invitationToken,
        created_at: new Date().toISOString()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      existingLogs.push(auditEntry);
      localStorage.setItem('audit_logs', JSON.stringify(existingLogs));

      setInvitationEmail('');
      await fetchInvitations();
      alert(`Einladung an ${invitationEmail} wurde erstellt. Gültig bis: ${expiresAt.toLocaleString()}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setInvitationLoading(false);
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    if (!window.confirm('Möchten Sie diese Einladung wirklich widerrufen?')) return;

    try {
      // Remove from localStorage (simplified)
      const existingInvitations = JSON.parse(localStorage.getItem('super_admin_invitations') || '[]');
      const updatedInvitations = existingInvitations.filter((inv: any) => inv.id !== invitationId);
      localStorage.setItem('super_admin_invitations', JSON.stringify(updatedInvitations));

      // Log audit event (simplified)
      const auditEntry = {
        id: crypto.randomUUID(),
        user_id: user!.id,
        action: 'super_admin_invitation_revoked',
        resource_type: 'invitation',
        resource_id: invitationId,
        created_at: new Date().toISOString()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      existingLogs.push(auditEntry);
      localStorage.setItem('audit_logs', JSON.stringify(existingLogs));

      await fetchInvitations();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const terminateSession = async (sessionId: string) => {
    if (!window.confirm('Möchten Sie diese Session wirklich beenden?')) return;

    try {
      // Update session in localStorage (simplified)
      const existingSessions = JSON.parse(localStorage.getItem('security_sessions') || '[]');
      const updatedSessions = existingSessions.map((session: any) => 
        session.id === sessionId ? { ...session, is_active: false } : session
      );
      localStorage.setItem('security_sessions', JSON.stringify(updatedSessions));

      // Log audit event (simplified)
      const auditEntry = {
        id: crypto.randomUUID(),
        user_id: user!.id,
        action: 'security_session_terminated',
        resource_type: 'session',
        resource_id: sessionId,
        created_at: new Date().toISOString()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      existingLogs.push(auditEntry);
      localStorage.setItem('audit_logs', JSON.stringify(existingLogs));

      await fetchSecuritySessions();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (!hasRole('super_admin')) {
    // Debug information
    console.log('Super Admin Dashboard Access Check:');
    console.log('User:', user);
    console.log('Has super_admin role:', hasRole('super_admin'));
    console.log('All roles:', JSON.stringify(userRoles, null, 2));
    console.log('Super Admin User in localStorage:', localStorage.getItem('super_admin_user'));
    console.log('Super Admin Role in localStorage:', localStorage.getItem('super_admin_role'));
    
    return (
      <Layout>
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Zugriff verweigert</h3>
          <p className="mt-1 text-sm text-gray-500">
            Sie haben keine Berechtigung für das Super Admin Dashboard.
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>User: {user?.email || 'Nicht eingeloggt'}</p>
            <p>Rollen: {userRoles.length > 0 ? userRoles.map(r => r.role).join(', ') : 'Keine Rollen'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Crown className="h-8 w-8 text-red-600 mr-3" />
              Super Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Systemweite Kontrolle und Sicherheitsüberwachung
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-red-100 px-3 py-1 rounded-apple">
              <span className="text-sm font-medium text-red-800">Sicherheitsstufe: Maximum</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-apple p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Übersicht', icon: Monitor },
              { id: 'users', label: 'Benutzer', icon: Users },
              { id: 'audit', label: 'Audit-Log', icon: Activity },
              { id: 'security', label: 'Sicherheit', icon: Shield },
              { id: 'invitations', label: 'Einladungen', icon: Mail }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="card">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Benutzer</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aktive Contests</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeContests}</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <Lock className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Login-Versuche (24h)</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalLoginAttempts}</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Fehlgeschlagen</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.failedLogins}</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <Globe className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aktive Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Letzte Audit-Ereignisse</h3>
                  <div className="space-y-3">
                    {auditLogs.slice(0, 5).map(log => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <p className="text-xs text-gray-500">
                            User {log.user_id?.slice(0, 8) || 'System'} • {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.ip_address || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Letzte Login-Versuche</h3>
                  <div className="space-y-3">
                    {loginAttempts.slice(0, 5).map((attempt, index) => (
                      <div key={attempt.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attempt.email}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(attempt.timestamp || attempt.created_at || Date.now()).toLocaleString()}
                          </p>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          attempt.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {attempt.success ? 'Erfolgreich' : 'Fehlgeschlagen'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invitations Tab */}
          {activeTab === 'invitations' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Neue Super Admin Einladung</h3>
                <form onSubmit={createInvitation} className="flex space-x-4">
                  <input
                    type="email"
                    value={invitationEmail}
                    onChange={(e) => setInvitationEmail(e.target.value)}
                    placeholder="E-Mail-Adresse"
                    className="flex-1 input-field"
                    required
                  />
                  <button
                    type="submit"
                    disabled={invitationLoading}
                    className="btn-primary disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {invitationLoading ? 'Erstelle...' : 'Einladen'}
                  </button>
                </form>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ausstehende Einladungen</h3>
                <div className="space-y-3">
                  {invitations.length > 0 ? invitations.map(invitation => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <p className="font-medium text-gray-900">{invitation.email}</p>
                        <p className="text-sm text-gray-500">
                          Läuft ab: {new Date(invitation.expires_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          invitation.is_used 
                            ? 'bg-green-100 text-green-800' 
                            : new Date(invitation.expires_at) < new Date()
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invitation.is_used ? 'Verwendet' : 
                           new Date(invitation.expires_at) < new Date() ? 'Abgelaufen' : 'Ausstehend'}
                        </span>
                        {!invitation.is_used && (
                          <button
                            onClick={() => revokeInvitation(invitation.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Keine Einladungen vorhanden</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Benutzer-Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <p className="font-medium text-gray-900">Admin-Rollen verwalten</p>
                      <p className="text-sm text-gray-500">Benutzer zu Admin oder Head Judge befördern</p>
                    </div>
                    <button className="btn-primary">
                      <Users className="h-4 w-4 mr-2" />
                      Rollen verwalten
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <p className="font-medium text-gray-900">Benutzer sperren</p>
                      <p className="text-sm text-gray-500">Problematische Benutzer deaktivieren</p>
                    </div>
                    <button className="btn-secondary">
                      <Lock className="h-4 w-4 mr-2" />
                      Benutzer sperren
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vollständiges Audit-Log</h3>
                <div className="space-y-3">
                  {auditLogs.length > 0 ? auditLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-500">
                          User {log.user_id?.slice(0, 8) || 'System'} • {new Date(log.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          Resource: {log.resource_type} • IP: {log.ip_address || 'N/A'}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.resource_id && `ID: ${log.resource_id.slice(0, 8)}`}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Keine Audit-Logs vorhanden</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Sessions Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktive Sicherheits-Sessions</h3>
                <div className="space-y-3">
                  {securitySessions.filter(session => session.is_active).length > 0 ? 
                    securitySessions.filter(session => session.is_active).map(session => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <p className="font-medium text-gray-900">{session.users?.name || `User ${session.user_id?.slice(0, 8)}`}</p>
                          <p className="text-sm text-gray-500">{session.users?.email || 'Email nicht verfügbar'}</p>
                          <p className="text-xs text-gray-500">
                            IP: {session.ip_address} • Letzte Aktivität: {new Date(session.last_activity).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => terminateSession(session.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Keine aktiven Sessions</p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;
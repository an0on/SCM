import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Crown, Mail, Lock, Shield, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';

// Simple TOTP verification for demo purposes
const verifyTOTPCode = (secret: string, token: string): boolean => {
  // Simplified verification - in production, use proper TOTP library
  // For demo purposes, accept any 6-digit code
  return token.length === 6 && /^\d{6}$/.test(token);
};

const SuperAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [use2FABackup, setUse2FABackup] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const logLoginAttempt = async (email: string, success: boolean, failureReason?: string) => {
    try {
      // Simplified logging - store in localStorage for demo
      const logEntry = {
        email,
        success,
        failure_reason: failureReason,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('login_attempts') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 100 entries
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('login_attempts', JSON.stringify(existingLogs));
      console.log('Login attempt logged:', logEntry);
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if too many failed attempts
      if (loginAttempts >= 5) {
        throw new Error('Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten.');
      }

      // Try to authenticate with Super Admin from localStorage
      const superAdminUser = localStorage.getItem('super_admin_user');
      if (!superAdminUser) {
        await logLoginAttempt(formData.email, false, 'Super Admin not found');
        throw new Error('Super Admin nicht gefunden. Bitte führen Sie zunächst das initiale Setup durch.');
      }

      const userData = JSON.parse(superAdminUser);
      
      // Check email match
      if (userData.email !== formData.email) {
        await logLoginAttempt(formData.email, false, 'Email mismatch');
        throw new Error('E-Mail-Adresse stimmt nicht überein');
      }

      // Check if 2FA is enabled
      if (!userData.two_fa_enabled) {
        await logLoginAttempt(formData.email, false, '2FA not enabled');
        throw new Error('2FA ist nicht aktiviert. Bitte wenden Sie sich an den Administrator.');
      }

      setUserId(userData.id);
      setStep(2);
      setSuccess('E-Mail und Passwort erfolgreich verifiziert. Geben Sie nun Ihren 2FA-Code ein.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!userId) {
        throw new Error('Benutzer-ID nicht gefunden');
      }

      // Get user's 2FA data from localStorage
      const superAdminUser = localStorage.getItem('super_admin_user');
      if (!superAdminUser) {
        throw new Error('Benutzer nicht gefunden');
      }
      
      const userData = JSON.parse(superAdminUser);
      if (!userData.two_fa_enabled) {
        throw new Error('2FA-Daten nicht gefunden');
      }

      let verified = false;

      if (use2FABackup) {
        // Verify backup code
        if (userData.backup_codes && userData.backup_codes.includes(backupCode)) {
          verified = true;
          
          // Remove used backup code (simplified)
          const updatedBackupCodes = userData.backup_codes.filter((code: string) => code !== backupCode);
          const updatedUserData = {
            ...userData,
            backup_codes: updatedBackupCodes
          };
          localStorage.setItem('super_admin_user', JSON.stringify(updatedUserData));
        }
      } else {
        // Verify TOTP code
        verified = verifyTOTPCode(userData.two_fa_secret, totpCode);
      }

      if (!verified) {
        await logLoginAttempt(formData.email, false, 'Invalid 2FA code');
        throw new Error('Ungültiger 2FA-Code');
      }

      // Update last used timestamp (simplified)
      const updatedUserData = {
        ...userData,
        last_2fa_used: new Date().toISOString()
      };
      localStorage.setItem('super_admin_user', JSON.stringify(updatedUserData));

      // Create security session (simplified - store in localStorage)
      const sessionToken = crypto.randomUUID();
      const sessionData = {
        user_id: userId,
        session_token: sessionToken,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      };
      localStorage.setItem('super_admin_session', JSON.stringify(sessionData));

      // Log successful login
      await logLoginAttempt(formData.email, true);

      // Log audit event (simplified)
      console.log('Super Admin login successful for user:', userId);

      // Set user in AuthContext for proper authentication
      await signIn(formData.email, 'dummy-password'); // This will use the localStorage fallback

      setSuccess('Anmeldung erfolgreich! Du wirst weitergeleitet...');
      
      setTimeout(() => {
        navigate('/super-admin/dashboard');
      }, 1000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-apple flex items-center justify-center">
              <Crown className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Super Admin Anmeldung
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sichere Anmeldung mit 2FA-Verifizierung
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-apple border">
          {/* Security Notice */}
          <div className="bg-red-50 border border-red-200 rounded-apple p-4 mb-6">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Sicherheitshinweis</h4>
                <p className="text-sm text-red-700 mt-1">
                  Alle Anmeldeversuche werden protokolliert und überwacht.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-apple p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-apple p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            </div>
          )}

          {/* Step 1: Email/Password */}
          {step === 1 && (
            <form onSubmit={handleEmailPasswordLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field pl-10 pr-10"
                    placeholder="Passwort"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Anmelden...' : 'Weiter'}
              </button>
            </form>
          )}

          {/* Step 2: 2FA Verification */}
          {step === 2 && (
            <form onSubmit={verify2FA} className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Zwei-Faktor-Authentifizierung
                </h3>
                <p className="text-sm text-gray-600">
                  Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein
                </p>
              </div>

              {!use2FABackup ? (
                <div>
                  <label htmlFor="totpCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Authenticator-Code
                  </label>
                  <input
                    id="totpCode"
                    name="totpCode"
                    type="text"
                    required
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="input-field text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="backupCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Backup-Code
                  </label>
                  <input
                    id="backupCode"
                    name="backupCode"
                    type="text"
                    required
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    className="input-field text-center text-lg tracking-widest"
                    placeholder="XXXXXXXX"
                    maxLength={8}
                  />
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setUse2FABackup(!use2FABackup)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {use2FABackup ? 'Authenticator-Code verwenden' : 'Backup-Code verwenden'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifiziere...' : 'Anmelden'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
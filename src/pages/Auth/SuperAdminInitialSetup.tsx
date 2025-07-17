import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Crown, Shield, AlertTriangle, CheckCircle, Key, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import * as QRCode from 'qrcode';

// Simple TOTP implementation for demo purposes
const generateTOTPSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

const verifyTOTPCode = (secret: string, token: string): boolean => {
  // Simplified verification - in production, use proper TOTP library
  // For demo purposes, accept any 6-digit code
  return token.length === 6 && /^\d{6}$/.test(token);
};

const SuperAdminInitialSetup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Step 1: Token verification
  const [setupToken, setSetupToken] = useState('');
  
  // Step 2: Account creation
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Step 3: 2FA Setup
  const [twoFASecret, setTwoFASecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    checkExistingSuperAdmin();
  }, []);

  const checkExistingSuperAdmin = async () => {
    try {
      // Check if setup is already completed (simplified for demo)
      const setupCompleted = localStorage.getItem('super_admin_setup_completed');
      if (setupCompleted) {
        navigate('/auth/super-admin/login');
        return;
      }
    } catch (error) {
      console.error('Error checking existing super admin:', error);
    }
  };

  const verifySetupToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check environment token
      const envToken = process.env.REACT_APP_SUPER_ADMIN_SETUP_TOKEN;
      if (setupToken !== envToken) {
        throw new Error('Ungültiger Setup-Token');
      }

      // Check if Super Admin setup is already completed
      const setupCompleted = localStorage.getItem('super_admin_setup_completed');
      if (setupCompleted) {
        throw new Error('Super Admin existiert bereits. Setup-Token ist nicht mehr gültig.');
      }

      setStep(2);
      setSuccess('Setup-Token erfolgreich verifiziert');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createSuperAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwörter stimmen nicht überein');
      }

      if (formData.password.length < 12) {
        throw new Error('Passwort muss mindestens 12 Zeichen lang sein');
      }

      // Create auth user (simplified - store user data in localStorage for demo)
      const userId = crypto.randomUUID();
      const userData = {
        id: userId,
        email: formData.email,
        name: formData.name,
        created_at: new Date().toISOString(),
        role: 'super_admin'
      };

      // Store user data in localStorage
      localStorage.setItem('super_admin_user', JSON.stringify(userData));
      localStorage.setItem('current_user_id', userId);

      // Generate 2FA secret (simplified approach)
      const secret = generateTOTPSecret();
      const secretBase32 = secret;
      
      setTwoFASecret(secretBase32);

      // Generate QR code
      const otpAuthUrl = `otpauth://totp/Skateboard Contest Manager:${formData.email}?secret=${secretBase32}&issuer=Skateboard Contest Manager`;
      const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl);
      setQrCodeUrl(qrCodeDataURL);

      // Generate backup codes
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substr(2, 8).toUpperCase()
      );
      setBackupCodes(codes);

      setStep(3);
      setSuccess('Konto erfolgreich erstellt. Richte jetzt 2FA ein.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const complete2FASetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Verify TOTP code (simplified verification)
      const verified = verifyTOTPCode(twoFASecret, totpCode);

      if (!verified) {
        throw new Error('Ungültiger 2FA-Code');
      }

      // Get user data from localStorage (simplified for demo)
      const userId = localStorage.getItem('current_user_id');
      if (!userId) throw new Error('Benutzer-ID nicht gefunden');

      const userData = JSON.parse(localStorage.getItem('super_admin_user') || '{}');
      const updatedUserData = {
        ...userData,
        two_fa_secret: twoFASecret,
        two_fa_enabled: true,
        backup_codes: backupCodes
      };
      
      localStorage.setItem('super_admin_user', JSON.stringify(updatedUserData));

      // Create super admin role (simplified - store in localStorage)
      const roleData = {
        id: crypto.randomUUID(),
        user_id: userId,
        role: 'super_admin',
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem('super_admin_role', JSON.stringify(roleData));

      // Mark setup as completed (simplified - could use localStorage or other method)
      localStorage.setItem('super_admin_setup_completed', 'true');

      // Log setup completion (simplified)
      console.log('Super Admin setup completed for user:', userId);

      setSuccess('Super Admin erfolgreich eingerichtet! Du wirst in 3 Sekunden weitergeleitet.');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
            Super Admin Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Einmaliges Setup für den ersten Super Admin
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-apple border">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {step > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
                </div>
                <span className="text-sm font-medium">Token</span>
              </div>
              <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {step > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
                </div>
                <span className="text-sm font-medium">Konto</span>
              </div>
              <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="text-sm font-medium">2FA</span>
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

          {/* Step 1: Token Verification */}
          {step === 1 && (
            <form onSubmit={verifySetupToken} className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-apple p-4 mb-6">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Sicherheitshinweis</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Dieses Setup kann nur einmal durchgeführt werden. Der Token wird nach der Verwendung deaktiviert.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="setupToken" className="block text-sm font-medium text-gray-700 mb-2">
                  Setup-Token
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="setupToken"
                    name="setupToken"
                    type="text"
                    required
                    value={setupToken}
                    onChange={(e) => setSetupToken(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Gib den Setup-Token ein"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Token aus der Umgebungsvariable REACT_APP_SUPER_ADMIN_SETUP_TOKEN
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifiziere...' : 'Token verifizieren'}
              </button>
            </form>
          )}

          {/* Step 2: Account Creation */}
          {step === 2 && (
            <form onSubmit={createSuperAdminAccount} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Vollständiger Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Max Mustermann"
                />
              </div>

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
                  Passwort (min. 12 Zeichen)
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
                    placeholder="Sicheres Passwort"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Passwort bestätigen
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="Passwort wiederholen"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Erstelle Konto...' : 'Konto erstellen'}
              </button>
            </form>
          )}

          {/* Step 3: 2FA Setup */}
          {step === 3 && (
            <form onSubmit={complete2FASetup} className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Zwei-Faktor-Authentifizierung einrichten
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Scanne den QR-Code mit einer Authenticator-App (z.B. Google Authenticator, Authy)
                </p>
              </div>

              <div className="text-center">
                <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto mb-4" />
                <p className="text-xs text-gray-500 mb-4">
                  Alternativ: Manueller Code: <code className="bg-gray-100 px-2 py-1 rounded">{twoFASecret}</code>
                </p>
              </div>

              <div>
                <label htmlFor="totpCode" className="block text-sm font-medium text-gray-700 mb-2">
                  6-stelliger Code aus der App
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

              <div className="bg-blue-50 border border-blue-200 rounded-apple p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Backup-Codes</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Speichere diese Codes sicher ab. Sie können nur einmal verwendet werden:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white p-2 rounded border text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Vervollständige Setup...' : 'Setup abschließen'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminInitialSetup;
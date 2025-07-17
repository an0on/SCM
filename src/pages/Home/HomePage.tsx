import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Trophy, 
  Users, 
  Shield, 
  ShieldCheck, 
  Gavel, 
  User, 
  LogIn,
  UserPlus,
  Crown,
  Zap,
  Lock,
  Globe
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'superadmin'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-apple flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Skateboard Contest Manager</h1>
                <p className="text-xs text-gray-500">Professional Contest Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">DSGVO-konform</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Die professionelle Plattform für Skateboard-Contests
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Verwalte Contests, bewerte Runs in Echtzeit, und erstelle professionelle Scoreboards. 
              Sicher, DSGVO-konform und optimiert für alle Geräte.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Höchste Sicherheit</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Echtzeit-Bewertung</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>2FA-Schutz</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Funktionen für jeden Teilnehmer</h3>
            <p className="text-lg text-gray-600">Von der Anmeldung bis zur Siegerehrung - alles in einer Plattform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-apple flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Skater</h4>
              <p className="text-gray-600">Registrierung, Zahlungsabwicklung und Live-Ergebnisse</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-apple flex items-center justify-center mx-auto mb-4">
                <Gavel className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Judge</h4>
              <p className="text-gray-600">Professionelle Bewertungstools mit Echtzeit-Sync</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-apple flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Admin</h4>
              <p className="text-gray-600">Contest-Management und Teilnehmerverwaltung</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-apple flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Super Admin</h4>
              <p className="text-gray-600">Systemweite Kontrolle mit höchster Sicherheit</p>
            </div>
          </div>
        </div>
      </section>

      {/* Login/Register Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-apple shadow-sm border p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Zugang zur Plattform</h3>
              <p className="text-gray-600">Wähle deinen Benutzertyp und melde dich an</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center space-x-1 mb-8">
              <button
                onClick={() => setActiveTab('login')}
                className={`px-6 py-3 rounded-apple font-medium transition-colors ${
                  activeTab === 'login' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <LogIn className="h-4 w-4 inline mr-2" />
                Anmelden
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`px-6 py-3 rounded-apple font-medium transition-colors ${
                  activeTab === 'register' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <UserPlus className="h-4 w-4 inline mr-2" />
                Registrieren
              </button>
              <button
                onClick={() => setActiveTab('superadmin')}
                className={`px-6 py-3 rounded-apple font-medium transition-colors ${
                  activeTab === 'superadmin' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Crown className="h-4 w-4 inline mr-2" />
                Super Admin
              </button>
            </div>

            {/* Tab Content */}
            <div className="max-w-md mx-auto">
              {activeTab === 'login' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Link
                      to="/auth/login"
                      className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-apple hover:bg-blue-700 transition-colors"
                    >
                      <User className="h-5 w-5 mr-2" />
                      Als Skater/Judge/Admin anmelden
                    </Link>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Noch kein Konto? 
                      <button 
                        onClick={() => setActiveTab('register')}
                        className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
                      >
                        Hier registrieren
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'register' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Link
                      to="/auth/register?role=skater"
                      className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-apple hover:bg-blue-700 transition-colors"
                    >
                      <User className="h-5 w-5 mr-2" />
                      Als Skater registrieren
                    </Link>
                    <Link
                      to="/auth/register?role=judge"
                      className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-apple hover:bg-green-700 transition-colors"
                    >
                      <Gavel className="h-5 w-5 mr-2" />
                      Als Judge registrieren
                    </Link>
                    <Link
                      to="/auth/register?role=admin"
                      className="flex items-center justify-center px-6 py-4 bg-purple-600 text-white rounded-apple hover:bg-purple-700 transition-colors"
                    >
                      <Shield className="h-5 w-5 mr-2" />
                      Als Admin registrieren
                    </Link>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Bereits ein Konto? 
                      <button 
                        onClick={() => setActiveTab('login')}
                        className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
                      >
                        Hier anmelden
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'superadmin' && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-apple p-4 mb-4">
                    <div className="flex items-center">
                      <ShieldCheck className="h-5 w-5 text-red-600 mr-2" />
                      <h4 className="text-sm font-medium text-red-800">Sicherheitshinweis</h4>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      Super Admin Zugang ist nur für autorisierte Systemadministratoren. 
                      Alle Aktivitäten werden auditiert und überwacht.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <Link
                      to="/auth/super-admin/login"
                      className="flex items-center justify-center px-6 py-4 bg-red-600 text-white rounded-apple hover:bg-red-700 transition-colors"
                    >
                      <Crown className="h-5 w-5 mr-2" />
                      Super Admin Anmelden
                    </Link>
                    <Link
                      to="/auth/super-admin/initial-setup"
                      className="flex items-center justify-center px-6 py-4 bg-gray-600 text-white rounded-apple hover:bg-gray-700 transition-colors"
                    >
                      <Shield className="h-5 w-5 mr-2" />
                      Initiales Setup
                    </Link>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Nur für autorisierte Systemadministratoren
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-semibold">Skateboard Contest Manager</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professionelle Contest-Management-Software für Skateboard-Veranstaltungen
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Funktionen</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Contest-Verwaltung</li>
                <li>Echtzeit-Bewertung</li>
                <li>PayPal-Integration</li>
                <li>QR-Code Scoreboards</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Sicherheit</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>2FA-Authentifizierung</li>
                <li>DSGVO-Compliance</li>
                <li>Audit-Logging</li>
                <li>Sichere Datenübertragung</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Dokumentation</li>
                <li>System-Status</li>
                <li>Notfall-Support</li>
                <li>Technischer Support</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Skateboard Contest Manager. Alle Rechte vorbehalten. DSGVO-konform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
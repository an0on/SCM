import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout/Layout';
import { 
  Settings as SettingsIcon, 
  Lock, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'appearance'>('general');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    language: 'de',
    timezone: 'Europe/Berlin',
    emailNotifications: true,
    pushNotifications: false,
    theme: 'light',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings update:', formData);
    alert('Einstellungen wurden gespeichert!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center">
            <SettingsIcon className="h-6 w-6 mr-2" />
            Einstellungen
          </h1>
          <p className="text-gray-600">Konfiguriere deine App-Einstellungen</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {[
                { id: 'general', label: 'Allgemein', icon: SettingsIcon },
                { id: 'security', label: 'Sicherheit', icon: Shield },
                { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
                { id: 'appearance', label: 'Erscheinungsbild', icon: Palette }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Allgemeine Einstellungen</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Globe className="h-4 w-4 inline mr-2" />
                        Sprache
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="de">Deutsch</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zeitzone
                      </label>
                      <select
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="Europe/Berlin">Europe/Berlin</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="America/Los_Angeles">America/Los_Angeles</option>
                      </select>
                    </div>
                  </div>

                  <button onClick={handleSubmit} className="btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </button>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Sicherheitseinstellungen</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Lock className="h-4 w-4 inline mr-2" />
                        Aktuelles Passwort
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="input-field pr-10"
                          placeholder="Aktuelles Passwort eingeben"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Neues Passwort
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Neues Passwort eingeben"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passwort bestätigen
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Neues Passwort bestätigen"
                      />
                    </div>

                    {hasRole('super_admin') && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <h3 className="text-sm font-medium text-red-800 mb-2">Super Admin 2FA</h3>
                        <p className="text-sm text-red-700 mb-3">
                          Ihre 2FA ist aktiviert und kann nicht hier deaktiviert werden.
                        </p>
                        <button className="btn-secondary text-sm">
                          2FA verwalten
                        </button>
                      </div>
                    )}
                  </div>

                  <button onClick={handleSubmit} className="btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Passwort aktualisieren
                  </button>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Benachrichtigungen</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          <Bell className="h-4 w-4 inline mr-2" />
                          E-Mail-Benachrichtigungen
                        </label>
                        <p className="text-sm text-gray-500">
                          Erhalte Updates zu Contests und Ergebnissen
                        </p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={formData.emailNotifications}
                          onChange={handleChange}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Push-Benachrichtigungen
                        </label>
                        <p className="text-sm text-gray-500">
                          Sofortige Benachrichtigungen im Browser
                        </p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="pushNotifications"
                          checked={formData.pushNotifications}
                          onChange={handleChange}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  <button onClick={handleSubmit} className="btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </button>
                </div>
              )}

              {/* Appearance */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Erscheinungsbild</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Palette className="h-4 w-4 inline mr-2" />
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'light', label: 'Hell', preview: 'bg-white border-2' },
                          { id: 'dark', label: 'Dunkel', preview: 'bg-gray-800 border-2' },
                          { id: 'auto', label: 'Automatisch', preview: 'bg-gradient-to-r from-white to-gray-800 border-2' }
                        ].map(theme => (
                          <label key={theme.id} className="cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              value={theme.id}
                              checked={formData.theme === theme.id}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className={`${theme.preview} ${
                              formData.theme === theme.id ? 'border-blue-500' : 'border-gray-300'
                            } rounded-lg p-4 text-center`}>
                              <div className="text-sm font-medium text-gray-900">{theme.label}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={handleSubmit} className="btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
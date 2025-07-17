import React, { useState, useEffect } from 'react';
import { Shield, X, Check, Settings } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const allPreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allPreferences);
  };

  const acceptSelected = () => {
    saveConsent(preferences);
  };

  const rejectAll = () => {
    const minimalPreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    saveConsent(minimalPreferences);
  };

  const saveConsent = (prefs: typeof preferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      preferences: prefs,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));
    setShowBanner(false);
    setShowSettings(false);
  };

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    if (key === 'necessary') return; // Necessary cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Shield className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cookie-Einstellungen
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Wir verwenden Cookies und ähnliche Technologien, um Ihre Erfahrung zu verbessern, 
                  den Datenverkehr zu analysieren und Inhalte zu personalisieren. Sie können Ihre 
                  Einstellungen jederzeit anpassen.
                </p>
                <p className="text-xs text-gray-500">
                  Durch die weitere Nutzung unserer Website stimmen Sie unserer{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    Datenschutzerklärung
                  </a>{' '}
                  und{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">
                    Nutzungsbedingungen
                  </a>{' '}
                  zu.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-4">
              <button
                onClick={() => setShowSettings(true)}
                className="btn-secondary text-sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Einstellungen
              </button>
              <button
                onClick={rejectAll}
                className="btn-secondary text-sm"
              >
                Ablehnen
              </button>
              <button
                onClick={acceptAll}
                className="btn-primary text-sm"
              >
                <Check className="h-4 w-4 mr-2" />
                Alle akzeptieren
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-apple p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Cookie-Einstellungen verwalten
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="border border-gray-200 rounded-apple p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Notwendige Cookies</h3>
                  <input
                    type="checkbox"
                    checked={preferences.necessary}
                    disabled
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Diese Cookies sind für die grundlegende Funktionalität der Website erforderlich 
                  und können nicht deaktiviert werden. Sie enthalten keine persönlichen Informationen.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Immer aktiv
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="border border-gray-200 rounded-apple p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Funktionale Cookies</h3>
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => updatePreference('functional', e.target.checked)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Diese Cookies ermöglichen erweiterte Funktionen und Personalisierung. 
                  Sie können von uns oder von Drittanbietern gesetzt werden.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-apple p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Analytische Cookies</h3>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => updatePreference('analytics', e.target.checked)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, 
                  indem sie Informationen anonym sammeln und berichten.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 rounded-apple p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Marketing Cookies</h3>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => updatePreference('marketing', e.target.checked)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Diese Cookies werden verwendet, um Werbung für Sie und Ihre Interessen relevanter zu machen. 
                  Sie können auch verwendet werden, um die Anzahl der Anzeigen zu begrenzen.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="btn-secondary"
              >
                Abbrechen
              </button>
              <button
                onClick={acceptSelected}
                className="btn-primary"
              >
                Einstellungen speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
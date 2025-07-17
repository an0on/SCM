import React from 'react';
import Layout from '../components/Layout/Layout';
import { Shield, Mail, Database, Lock, Eye, UserCheck } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-primary-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Datenschutzerklärung</h1>
          <p className="mt-2 text-gray-600">
            Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')}
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            1. Datenerhebung und -verarbeitung
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Wir erheben und verarbeiten personenbezogene Daten nur im Rahmen der gesetzlichen 
              Bestimmungen der DSGVO. Die Rechtsgrundlage für die Verarbeitung ist:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Art. 6 Abs. 1 lit. b DSGVO für die Vertragserfüllung (Contestteilnahme)</li>
              <li>Art. 6 Abs. 1 lit. a DSGVO für die auf Einwilligung beruhende Verarbeitung</li>
              <li>Art. 6 Abs. 1 lit. f DSGVO für die Wahrung berechtigter Interessen</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            2. Welche Daten sammeln wir?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Benutzerregistrierung:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Name</li>
                <li>• E-Mail-Adresse</li>
                <li>• Adresse (optional)</li>
                <li>• Skateboard-Stance</li>
                <li>• Sponsoren (optional)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Contest-Teilnahme:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Anmeldedaten</li>
                <li>• Zahlungsinformationen (PayPal)</li>
                <li>• Bewertungen und Ergebnisse</li>
                <li>• Teilnahmestatistiken</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            3. Datensicherheit
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Wir verwenden moderne Sicherheitsmaßnahmen zum Schutz Ihrer Daten:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
              <li>Sichere Passwort-Hashing-Verfahren</li>
              <li>Regelmäßige Sicherheitsupdates und -überprüfungen</li>
              <li>Zugriffskontrolle und Benutzerrollenverwaltung</li>
              <li>Sichere Datenspeicherung bei Supabase (EU-Server)</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            4. Ihre Rechte
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Gemäß der DSGVO haben Sie folgende Rechte bezüglich Ihrer personenbezogenen Daten:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Ihre Rechte:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Recht auf Auskunft (Art. 15 DSGVO)</li>
                  <li>• Recht auf Berichtigung (Art. 16 DSGVO)</li>
                  <li>• Recht auf Löschung (Art. 17 DSGVO)</li>
                  <li>• Recht auf Einschränkung (Art. 18 DSGVO)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Weitere Rechte:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                  <li>• Widerspruchsrecht (Art. 21 DSGVO)</li>
                  <li>• Beschwerderecht bei Aufsichtsbehörde</li>
                  <li>• Widerruf von Einwilligungen</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            5. Cookies und Tracking
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Wir verwenden verschiedene Arten von Cookies:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-apple">
                <h3 className="font-medium text-gray-900">Notwendige Cookies</h3>
                <p className="text-sm text-gray-600">
                  Für die grundlegende Funktionalität der Website erforderlich
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-apple">
                <h3 className="font-medium text-gray-900">Funktionale Cookies</h3>
                <p className="text-sm text-gray-600">
                  Ermöglichen erweiterte Funktionen und Personalisierung
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-apple">
                <h3 className="font-medium text-gray-900">Analytische Cookies</h3>
                <p className="text-sm text-gray-600">
                  Helfen uns, die Website-Nutzung zu verstehen und zu verbessern
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            6. Drittanbieter-Services
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border border-gray-200 rounded-apple">
                <h3 className="font-medium text-gray-900">PayPal</h3>
                <p className="text-sm text-gray-600">
                  Für sichere Zahlungsabwicklung. Unterliegt den PayPal-Datenschutzbestimmungen.
                </p>
              </div>
              <div className="p-3 border border-gray-200 rounded-apple">
                <h3 className="font-medium text-gray-900">Supabase</h3>
                <p className="text-sm text-gray-600">
                  EU-basierte Datenspeicherung und -verarbeitung. DSGVO-konform.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            7. Kontakt
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie uns:
            </p>
            <div className="bg-gray-50 p-4 rounded-apple">
              <p className="font-medium text-gray-900">Datenschutzbeauftragte/r</p>
              <p className="text-sm">E-Mail: privacy@skateboard-contest.app</p>
              <p className="text-sm">Telefon: +49 (0) xxx xxx xxx</p>
            </div>
            <p className="text-sm text-gray-600">
              Wir werden Ihre Anfrage innerhalb von 30 Tagen bearbeiten.
            </p>
          </div>
        </div>

        <div className="card bg-primary-50 border-primary-200">
          <h2 className="text-xl font-semibold text-primary-900 mb-4">
            8. Änderungen dieser Datenschutzerklärung
          </h2>
          <p className="text-primary-800">
            Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren, um sie an 
            geänderte Rechtslagen oder Änderungen unserer Services anzupassen. Die aktuelle 
            Version finden Sie immer auf dieser Seite.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
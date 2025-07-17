import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout/Layout';
import { User, Mail, MapPin, Award, Calendar, Save } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    address: user?.user_metadata?.address || '',
    stance: user?.user_metadata?.stance || '',
    sponsors: user?.user_metadata?.sponsors || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would update the profile
    console.log('Profile update:', formData);
    setIsEditing(false);
    alert('Profil wurde aktualisiert!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mein Profil</h1>
          <p className="text-gray-600">Verwalte deine persönlichen Informationen</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Persönliche Daten</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Bearbeiten
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-2" />
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 inline mr-2" />
                E-Mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="h-4 w-4 inline mr-2" />
                Adresse
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Award className="h-4 w-4 inline mr-2" />
                Stance
              </label>
              <select
                name="stance"
                value={formData.stance}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field disabled:bg-gray-50"
              >
                <option value="">Bitte wählen...</option>
                <option value="regular">Regular</option>
                <option value="goofy">Goofy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Award className="h-4 w-4 inline mr-2" />
                Sponsoren
              </label>
              <textarea
                name="sponsors"
                value={formData.sponsors}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
                className="input-field disabled:bg-gray-50"
                placeholder="Liste deine Sponsoren auf..."
              />
            </div>
          </form>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account-Informationen</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Registriert seit</span>
              <span className="text-sm font-medium text-gray-900">
                <Calendar className="h-4 w-4 inline mr-1" />
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unbekannt'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Benutzer-ID</span>
              <span className="text-sm font-mono text-gray-900">
                {user?.id?.slice(0, 8) || 'Unbekannt'}...
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;